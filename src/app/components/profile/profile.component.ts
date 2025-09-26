import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../common/service/auth.service';
import { UserService } from '../../common/service/user.service';
import { ConfigService } from '../../common/service/config.service';

interface Blog {
  _id: string;
  title: string;
  created_at: string;
  likes?: number;
  views?: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: any | null = null;
  blogs: Blog[] = [];
  loading = false;
  errorMessage: string | null = null;
  isCurrentUser = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    public confifg: ConfigService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = null;

    this.route.paramMap.subscribe(params => {
      const userId = params.get('id') || null;
      if (!userId) {
        this.errorMessage = 'User ID not provided';
        this.loading = false;
        return;
      }

      this.userService.getPublicProfile(userId).subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            this.user = res.data;
            this.isCurrentUser = this.authService.getCurrentUser()?._id === this.user._id;
            this.loadUserBlogs(userId);
          } else {
            this.errorMessage = 'User not found';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Registration failed:', err)
          this.loading = false;
          if (err.status === 401) {
            return  this.authService.logout();
          }
        }
      });
    });
  }

  private loadUserBlogs(userId: string): void {
    this.userService.getUserBlogs(userId).subscribe({
      next: (res: any) => {
        if (res.success && res.blogs) {
          this.blogs = res.blogs;
        }
      },
      error: (error) => {
        console.error('Error loading user blogs:', error);
        // If server returns 401, logout user
        if (error.status === 401) {
          return  this.authService.logout();
        }
      }
    });
  }

  get userInitial(): string {
    return (this.user?.fullname || this.user?.username || 'U').charAt(0).toUpperCase();
  }
}