import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  constructor(
    private blogService: BlogService,
    public config: ConfigService,
    public auth: AuthService
  ) {}

  toggleLike(): void {
    if (!this.auth.isAuthenticated()) {
      alert('Please login to like posts'); // replace with toast if needed
      return;
    }

    const isLiked = this.blog.likedByUser;
    const apiCall = isLiked ? this.blogService.unlikeBlog(this.blog._id) : this.blogService.likeBlog(this.blog._id);

    apiCall.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.blog.likes = res.data.likes;
          this.blog.likedByUser = !isLiked;
        }
      },
      error: (err) => console.error('Error updating like:', err)
    });
  }
}
