import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../common/service/auth.service';
import { UserService } from '../../common/service/user.service';
import { ConfigService } from '../../common/service/config.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogCardComponent } from '../../common/components/blog-card/blog-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

interface Blog {
  _id: string;
  title: string;
  created_at: string;
  likes?: number;
  views?: number;
}

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BlogCardComponent, MatTooltipModule, NgbModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})

export class MyProfileComponent implements OnInit {
  user: any | null = null;
  blogs: Blog[] = [];
  loading = false;
  errorMessage: string | null = null;
  isCurrentUser = false;
  formSubmitting = false;
  userInitial: string = 'U';
  likesCount: number = 0;
  menuFlag: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private modalservice: NgbModal,
    public confifg: ConfigService,
  ) {

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

  updateProfile() {
    let modalData = this.modalservice.open(EditProfileComponent, {
      size: 'md',
      centered: true,
      keyboard: false,
      backdrop: 'static'
    })

    modalData.componentInstance.data = this.user;

    modalData.result.then(user => {
      if (user) {
        console.log(user)
        this.user = user;
        this.userInitial = this.getuserInitial(user);
      }
    })
  }

  getuserInitial(data: any): any {
    return (this.user?.fullname || this.user?.username || 'U').charAt(0).toUpperCase();
  }


}
