import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../common/components/header/header.component';
import { FooterComponent } from '../../common/components/footer/footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../common/service/blog.service';
import { AuthService } from '../../common/service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Modal } from 'bootstrap';

interface Category {
  _id: string;
  name: string;
}

interface BlogData {
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
  selector: 'app-create-blog',
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, ReactiveFormsModule],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.scss'
})

export class CreateBlogComponent implements OnInit {
  blogForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | null = null;
  previewData: BlogData | null = null;
  currentDate: string = new Date().toLocaleDateString();

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
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
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.blogService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
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
      reader.onerror = () => {
        this.showError('Error reading image file');
      };
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

    const blogData: BlogData = this.getBlogData();
    blogData.status = status;

    this.isLoading = true;
    this.blogService.createBlog(blogData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess(status === 'draft' ? 'Draft saved successfully' : 'Blog published successfully');
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 2000);
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

  publishBlog(): void {
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
    const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

    return {
      title: this.blogForm.get('title')?.value?.trim(),
      category: this.blogForm.get('category')?.value,
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

// Custom pipe for converting newlines to <br>
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'newlineToBr' })
export class NewlineToBrPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/\n/g, '<br>'));
  }
}