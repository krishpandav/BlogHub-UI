import { Component } from '@angular/core';
import { HeaderComponent } from '../../common/components/header/header.component';
import { FooterComponent } from '../../common/components/footer/footer.component';
import { AdminService } from '../../common/service/admin.service';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../common/service/auth.service';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BlogService } from '../../common/service/blog.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  imports: [HeaderComponent, FooterComponent, TitleCasePipe, RouterLink, CommonModule, NgbModule, ReactiveFormsModule, FormsModule, HttpClientModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  stats: any = {};
  recentUsers: any[] = [];
  recentBlogs: any[] = [];
  blogs: any[] = [];
  users: any[] = [];
  topBlogs: any[] = [];
  categoryForm!: FormGroup;
  categories: any[] = [];
  loading = true;
  errorMessage: any = ""
  successMessage: any = ""

  constructor(
    private adminService: AdminService,
    private blogService: BlogService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadBlogs();
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    this.getCategories();
    this.getUsers();
  }

  loadDashboard(): void {
    this.loading = true;

    this.adminService.getDashboard().subscribe({
      next: (res) => {

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
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.errorMessage = err.error.message || 'Failed to load blogs';
        this.loading = false;
      }
    });
  }

  updateStatus(blogId: string, status: string): void {

    this.adminService.updateBlogStatus(blogId, status as any).subscribe({
      next: () => {
        this.successMessage = 'Blog status updated successfully';
        this.loadBlogs();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        console.error('Error updating blog status:', err);
        this.errorMessage = err.error.message || 'Failed to update blog status';
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
      error: (err) => {
        console.error('Error deleting blog:', err);
        this.errorMessage = err.error.message || 'Failed to delete blog';
        setTimeout(() => (this.errorMessage = ''), 3000);
      }
    });
  }

  getCategories() {
    this.adminService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  addCategory() {
    if (this.categoryForm.valid) {
      this.adminService.createCategory(this.categoryForm.value).subscribe({
        next: (data) => {
          if (data.success) {
            this.categoryForm.reset();
            // ✅ Optionally reset validation state (optional but clean)
            this.categoryForm.markAsPristine();
            this.categoryForm.markAsUntouched();
            this.successMessage = data.message || 'Category created successfully!';
            this.getCategories();
            setTimeout(() => (this.successMessage = ''), 2000);
          }
        },
        error: (err) => {
          console.error('Error updating category', err);
          this.errorMessage = err.error.message || err.message;
          setTimeout(() => (this.errorMessage = ''), 2000);
        }
      });
    }
  }

  updateCategory(category: any) {

    this.adminService.updateCategory(category).subscribe({
      next: (data) => {
        if (data.success) {
          this.successMessage = data.message || 'Category updated successfully!';
          this.getCategories();
          setTimeout(() => (this.successMessage = ''), 2000);
        }
      },
      error: (err) => {
        console.error('Error updating category', err);
        this.errorMessage = err.error.message || err.message;
        setTimeout(() => (this.errorMessage = ''), 2000);
      }
    });
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure? This will delete all blogs in this category!')) {
      this.adminService.deleteCategory(id).subscribe({
        next: () => {
          this.successMessage = 'Category deleted successfully!';
          setTimeout(() => (this.successMessage = ''), 2000);
          this.getCategories();
        },
        error: (err) => {
          console.error('Error updating category', err);
          this.errorMessage = err.error.message || err.message;
          setTimeout(() => (this.errorMessage = ''), 2000);
        }
      });
    }
  }

  getUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.users = res.data.users || [];
        }
      },
      error: (err) => {
        console.error('Error updating category', err);
        this.errorMessage = err.error.message || 'Failed to load users.';
        setTimeout(() => (this.errorMessage = ''), 2000);
      }
    });
  }

  updateUser(user: any) {
    this.adminService.updateUser(user._id, {
      role: user.role,
      isActive: user.isActive
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = res.message || 'User updated successfully!';
          setTimeout(() => (this.successMessage = ''), 2000);
        }
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.errorMessage = err.error?.message || 'Failed to update user.';
        setTimeout(() => (this.errorMessage = ''), 2000);
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure to delete user? This will delete all blogs by this user!')) {
      this.adminService.deleteUser(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.successMessage = res.message || 'User deleted successfully!';
            this.getUsers();
            this.loadDashboard();
            setTimeout(() => (this.successMessage = ''), 2000);
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.errorMessage = err.error?.message || 'Failed to delete user.';
          setTimeout(() => (this.errorMessage = ''), 2000);
        }
      });
    }
  }
}
