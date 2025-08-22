import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../common/service/blog.service';
import { BlogCardComponent } from '../../common/components/blog-card/blog-card.component';
import { AuthService } from '../../common/service/auth.service';

interface Blog {
  _id: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  category?: { name: string };
  author?: { _id: string; username: string };
  created_at: string;
}

@Component({
  selector: 'app-popular-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule, BlogCardComponent],
  templateUrl: './popular.component.html',
})
export class PopularBlogsComponent implements OnInit {
  blogs: any[] = [];
  popularBlogs: any[] = [];
  categories: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  currentCategory: string | null = null;
  searchtext: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private blogService: BlogService,
    public auth: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const search = params['searchtext'] || '';
      const page = +params['page'] || 1;

      this.searchtext = search;

      this.loadPopularBlogs();
      this.loadCategories();
      this.loadPopularPosts();

    });
  }

  loadPopularBlogs(limit: number = 10): void {
    this.loading = true;
    this.errorMessage = '';

    

    this.blogService.getPopularBlogs(limit)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.blogs = res.data;
          } else {
            this.errorMessage = 'Failed to load blogs';
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error loading blogs: ' + err.message;
          this.loading = false;
        }
      });
  }

  loadPopularPosts(): void {
    this.blogService.getPopularBlogs().subscribe({
      next: (res: any) => {
        if (res.success) this.popularBlogs = res.data;
      },
      error: (err) => console.error('Error loading popular posts:', err)
    });
  }

  loadCategories(): void {
    this.blogService.getCategories().subscribe({
      next: (res: any) => {
        if (res.success) this.categories = res.data;
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  handleSearch(): void {
    this.currentPage = 1;
    this.loadPopularBlogs();
  }

  handleCategoryFilter(categorySlug: string | null): void {
    this.currentCategory = categorySlug;
    this.currentPage = 1;
    this.loadPopularBlogs();
  }

  handlePagination(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.loadPopularBlogs();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
