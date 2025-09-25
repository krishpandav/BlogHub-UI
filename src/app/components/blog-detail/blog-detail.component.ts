import { Component } from '@angular/core';
import { AuthService } from '../../common/service/auth.service';
import { BlogService } from '../../common/service/blog.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfigService } from '../../common/service/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink, CommonModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent {
  blog: any | null = null;
  title = 'BlogHub';
  loading = true;
  errorMessage: string | null = null;
  isLiked = false;
  likeLoading = false;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private authService: AuthService,
    public config: ConfigService,
  ) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const blogId = params.get('id') || null;
      if (!blogId) {
        this.errorMessage = 'Blog ID not provided';
        this.loading = false;
        return;
      }
      this.loading = true;

      try {
        this.blogService.getBlogById(blogId).subscribe({
          next: (res: any) => {
            if (res.success && res.data) {
              this.blog = res.data;
              this.title = `${this.blog.title} - BlogHub`;
              this.isLiked = this.authService.getLikedUserBlog()?.includes(this.blog._id);
            } else {
              this.errorMessage = 'Blog not found';
            }
          },
          error: (err: any) => {
            this.errorMessage = 'Error loading blog: ' + err.message;
          }
        });


      } catch (error: any) {
        this.errorMessage = 'Error loading blog: ' + error.message;
      } finally {
        this.loading = false;
      }
    });
  }

  toggleLike(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to like posts'); // replace with toast if needed
      return;
    }

    this.isLiked = this.authService.getLikedUserBlog().includes(this.blog._id);
    const apiCall = this.isLiked
      ? this.blogService.unlikeBlog(this.blog._id)
      : this.blogService.likeBlog(this.blog._id);
    
    apiCall.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.blog.likes = res.data.likes;
          this.isLiked ? this.authService.unlikeBlog(this.blog._id) : this.authService.likeBlog(this.blog._id);
          this.isLiked = !this.isLiked;
        }
      },
      error: (err) => {
        console.error('Error updating like:', err);

        // If status is 401, log out the user
        if (err.status === 401) {
          this.authService.logout();
          alert('Session expired. Please login again.');
        }
      }
    });
  }


  async shareBlog() {
    if (!this.blog) return;
    const url = window.location.href;
    const title = this.blog.title || 'Check this blog!';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error('Share canceled or failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        this.showToast('Link copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy link:', err);
        this.showToast('Failed to copy link!', 'error');
      }
    }
  }


  private showToast(message: string, type: 'success' | 'error') {
    // Implement toast notification logic (e.g., using a toast service or library)
    console.log(`${type}: ${message}`);
  }
}
