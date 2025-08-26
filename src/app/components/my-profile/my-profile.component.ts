import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../common/service/auth.service';
import { UserService } from '../../common/service/user.service';
import { ConfigService } from '../../common/service/config.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogCardComponent } from '../../common/components/blog-card/blog-card.component';

interface Blog {
  _id: string;
  title: string;
  created_at: string;
  likes?: number;
  views?: number;
}

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BlogCardComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})

export class MyProfileComponent implements OnInit {
  user: any | null = null;
  blogs: Blog[] = [];
  loading = false;
  profileForm: FormGroup;
  errorMessage: string | null = null;
  isCurrentUser = false;
  formSubmitting = false;
  formError: string | null = null;
  userInitial: string = 'U';
  likesCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    public confifg: ConfigService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      fullname: ['', Validators.required],
      // username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = null;
    this.likesCount = this.authService.getLikedUserBlog().length;
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.user = res.data;
          this.loadUserBlogs();
        } else {
          this.errorMessage = 'User not found';
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('getProfile failed:', err)
        this.errorMessage = err.message || 'Please try again.';
      }
    });
  }

  private loadUserBlogs(): void {
    this.userService.getMyBlogs().subscribe({
      next: (res: any) => {
        debugger
        if (res.success && res.data.blogs) {
          this.blogs = res.data.blogs;
        }
      },
      error: (error) => {
        console.error('Error loading user blogs:', error);
      }
    });
  }

  getuserInitial(data: any): any {
    return (this.user?.fullname || this.user?.username || 'U').charAt(0).toUpperCase();
  }

  setFormValues(user: any): void {
    this.profileForm.patchValue({
      name: user.name || '',
      // username: user.username || '',
      email: user.email || '',
      bio: user.bio || ''
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.formSubmitting = true;
    this.formError = null;

    const updatedData = this.profileForm.value;
    this.userService.updateProfile(updatedData).subscribe({
      next: (response) => {
        this.authService.setAuthData(this.authService.getToken()!, response.data);
        this.user = response.data;
        this.userInitial = this.getuserInitial(response.data);
        // this.toastService.show('Profile updated successfully', 'success');
        this.formSubmitting = false;
        const modal = document.getElementById('profileModal');
        if (modal) {
          const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
          bsModal?.hide();
        }
      },
      error: (err) => {
        this.formError = 'Failed to update profile: ' + err.message;
        // this.toastService.show('Failed to update profile', 'error');
        this.formSubmitting = false;
      }
    });
  }
}
