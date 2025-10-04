import { Component } from '@angular/core';
import { HeaderComponent } from '../../common/components/header/header.component';
import { FooterComponent } from '../../common/components/footer/footer.component';
import { AdminService } from '../../common/service/admin.service';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../common/service/auth.service';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-admin',
  imports: [HeaderComponent, FooterComponent, TitleCasePipe, RouterLink, CommonModule, NgbModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  stats: any = {};
  recentUsers: any[] = [];
  recentBlogs: any[] = [];
  blogs: any[] = [];
  topBlogs: any[] = [];
  loading = true;
  errorMessage: any = ""
  successMessage: any = ""

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadBlogs();
  }

  loadDashboard(): void {
    this.loading = true;

    this.adminService.getDashboard().subscribe({
      next: (res) => {
        debugger
        if (res.success) {
          this.stats = res?.data.stats || {};
          this.recentUsers = res?.data.recentUsers || {};
          this.recentBlogs = res?.data.recentBlogs || {};
          this.topBlogs = res?.data.topBlogs || {};
          this.loading = false;
        }
      },
      error: (err) => {
        this.loading = false;
        console.log("Error get getDashboard : ", err);
        if (err.status == 403) {
          alert(err.error.message);
          this.router.navigate(['/home']);
        } else if (err.status == 401) {
          this.authService.logout();
        }
      },
    });

  }

  loadBlogs(page: number = 1): void {
    this.loading = true;
    this.adminService.getBlogs(page).subscribe({
      next: (res) => {
        this.blogs = res?.data?.blogs || res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load blogs';
        this.loading = false;
      }
    });
  }

  updateStatus(blogId: string, status: string): void {
    debugger
    this.adminService.updateBlogStatus(blogId, status as any).subscribe({
      next: () => {
        this.successMessage = 'Blog status updated successfully';
        this.loadBlogs();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to update blog status';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  deleteBlog(blogId: string): void {
    if (!confirm('Are you sure?')) return;

    this.adminService.deleteBlog(blogId).subscribe({
      next: () => {
        this.successMessage = 'Blog deleted successfully';
        this.loadBlogs();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => {
        this.errorMessage = 'Failed to delete blog';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }
}
