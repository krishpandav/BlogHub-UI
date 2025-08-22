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

  // async handleLike() {
  //   if (!this.authService.isAuthenticated()) {
  //     this.showToast('Please login to like posts', 'error');
  //     return;
  //   }
  //   if (!this.blog) return;

  //   this.likeLoading = true;
  //   try {
  //     const response = this.isLiked
  //       ? await firstValueFrom(this.blogService.unlikeBlog(this.blog._id))
  //       : await firstValueFrom(this.blogService.likeBlog(this.blog._id));
  //     if (response.success && response.data) {
  //       this.blog = response.data;
  //       this.blog.likes = response.data.likes;
  //       this.isLiked = !this.isLiked;
  //       this.showToast(this.isLiked ? 'Post liked' : 'Post unliked', 'success');
  //     } else {
  //       this.showToast('Error updating like', 'error');
  //     }
  //   } catch (error: any) {
  //     this.showToast('Error updating like: ' + error.message, 'error');
  //   } finally {
  //     this.likeLoading = false;
  //   }
  // }

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
