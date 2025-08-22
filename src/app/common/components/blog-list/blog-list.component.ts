import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../service/blog.service'; // Adjust the import path as necessary
import { AuthService } from '../../service/auth.service'; // Adjust the import path as necessary
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';  // ✅ import ActivatedRoute
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  standalone: true,
  imports: [BlogCardComponent, PaginationComponent, FormsModule],
})
export class BlogListComponent implements OnInit {
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
    this.route.paramMap.subscribe(params => {
      const category = params.get('slug') || null;
      this.currentCategory = category;
    });

    this.route.queryParams.subscribe(params => {
      const search = params['searchtext'] || '';
      const page = +params['page'] || 1;
      this.searchtext = search;
      this.currentPage = page;
    });

    this.loadBlogs(this.currentPage);
    this.loadCategories();
    this.loadPopularPosts();
  }

  loadBlogs(page: number = 1): void {
    this.loading = true;
    this.errorMessage = '';
    this.currentPage = page;
    

    if (this.currentCategory) {
      this.blogService.getBlogsByCategory(this.currentCategory, page)
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.blogs = res.data.blogs;
              this.totalPages = res.data.pagination?.totalPages || 1;
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
    } else {
      this.blogService.getBlogs(page, this.searchtext || undefined)
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.blogs = res.data.blogs;
              this.totalPages = res.data.pagination?.totalPages || 1;
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
    this.loadBlogs(1);
  }

  handleCategoryFilter(categorySlug: string | null): void {
    this.currentCategory = categorySlug;
    this.currentPage = 1;
    this.loadBlogs(1);
  }

  handlePagination(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.loadBlogs(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
