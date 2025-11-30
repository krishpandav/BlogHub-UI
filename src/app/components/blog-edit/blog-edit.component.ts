import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../common/components/header/header.component';
import { FooterComponent } from '../../common/components/footer/footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../common/service/blog.service';
import { AuthService } from '../../common/service/auth.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Modal } from 'bootstrap';

interface Category {
  _id: string;
  name: string;
}

interface BlogData {
  id?: string;
  title: string;
  category: string;
  content: string;
  summary: string;
  tags: string[];
  image?: string;
  authorName?: string;
  status?: string;
}

@Component({
  selector: 'app-edit-blog',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, ReactiveFormsModule],
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.scss']
})

export class BlogEditComponent implements OnInit {
  blogForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | null = null;
  previewData: BlogData | null = null;
  currentDate: string = new Date().toLocaleDateString();
  blogId: string = '';

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      content: ['', Validators.required],
      summary: [''],
      tags: [''],
      image: [null]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.blogId = this.route.snapshot.paramMap.get('id') || '';
    this.loadCategories();
    if (this.blogId) {
      this.loadBlog(this.blogId);
    }
  }

  loadCategories(): void {
    this.blogService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);

        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  loadBlog(id: string): void {
    this.isLoading = true;
    this.blogService.getBlogById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const blog = response.data;
          this.blogForm.patchValue({
            title: blog.title,
            category: blog.category,
            content: blog.content,
            summary: blog.summary,
            tags: blog.tags.join(', '),
            image: blog.image
          });
          this.imagePreview = blog.image || null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.showError(error.error.message);
        this.isLoading = false;

        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.blogForm.patchValue({ image: this.imagePreview });
      };
      reader.onerror = () => this.showError('Error reading image file');
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
      this.blogForm.patchValue({ image: null });
    }
  }

  saveBlog(status: 'draft' | 'published'): void {
    if (this.blogForm.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }

    const blogData = this.getBlogData();
    blogData.status = status;

    this.isLoading = true;
    this.blogService.updateBlog(blogData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess(status === 'draft' ? 'Draft saved successfully' : 'Blog updated successfully');
          setTimeout(() => this.router.navigate(['/profile']), 2000);
        } else {
          this.showError(response.message);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving blog:', error);
        this.showError(error.error.message);
        this.isLoading = false;

        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  updateBlog(): void {
    this.saveBlog('published');
  }

  previewBlog(): void {
    this.previewData = this.getBlogData();
    const modalElement = document.getElementById('previewBlogModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  private getBlogData(): BlogData {
    const tags = this.blogForm.get('tags')?.value?.trim();
    const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()).filter(tag => tag) : [];

    return {
      id: this.blogId,
      title: this.blogForm.get('title')?.value?.trim(),
      category: this.blogForm.get('category')?.value._id,
      content: this.blogForm.get('content')?.value?.trim(),
      summary: this.blogForm.get('summary')?.value?.trim(),
      tags: tagsArray,
      image: this.blogForm.get('image')?.value,
    };
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;
  }
}
