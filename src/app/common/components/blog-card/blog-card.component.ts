import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { AuthService } from '../../service/auth.service';
import { ConfigService } from '../../service/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-card',
  templateUrl: './blog-card.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class BlogCardComponent {
  @Input() blog: any;
  @Input() isEdit: boolean;
  isLiked: boolean = false;
  constructor(
    private blogService: BlogService,
    public config: ConfigService,
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.blog) {
      this.isLiked = this.auth.getLikedUserBlog()?.includes(this.blog._id);
    }
  }

  toggleLike(): void {
    if (!this.auth.isAuthenticated()) {
      alert('Please login to like posts'); // replace with toast if needed
      return;
    }

    this.isLiked = this.auth.getLikedUserBlog().includes(this.blog._id);
    const apiCall = this.isLiked
      ? this.blogService.unlikeBlog(this.blog._id)
      : this.blogService.likeBlog(this.blog._id);

    apiCall.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.blog.likes = res.data.likes;
          this.isLiked ? this.auth.unlikeBlog(this.blog._id) : this.auth.likeBlog(this.blog._id);
          this.isLiked = !this.isLiked;
        }
      },
      error: (err) => {
        console.error('Error updating like:', err);

        // If server returns 401, logout user
        if (err.status === 401) {
          this.auth.logout();
          window.location.href = '/home';
        }
      }
    });
  }

  deleteBlog(blog_id: string): void {
    if (confirm('Are you sure to delete blog?')) {
      this.blogService.deleteBlog(blog_id).subscribe({
        next: (res: any) => {
          console.log('Res ------>', res);
          if (res.success) {
            console.log("blog deleted successfully.");
            window.location.href = '/profile'
            // this.router.navigate(['/profile']);
          }
        },
        error: (err) => {
          console.error('Error deleting blog', err);

          if (err.status === 401) {
            this.auth.logout();
          }
        }
      })
    }
  }
}
