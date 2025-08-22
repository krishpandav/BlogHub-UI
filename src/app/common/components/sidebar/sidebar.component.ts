import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule],
})
export class SidebarComponent implements OnInit {
  categories: any[] = [];
  popularPosts: any[] = [];
  @Output() categorySelected = new EventEmitter<string | null>();

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadPopularPosts();
  }

  loadCategories(): void {
    this.blogService.getCategories().subscribe({
      next: (res: any) => {
        if (res.success) this.categories = res.data;
      }
    });
  }

  loadPopularPosts(): void {
    this.blogService.getPopularBlogs().subscribe({
      next: (res: any) => {
        if (res.success) this.popularPosts = res.data;
      }
    });
  }

  selectCategory(slug: string | null): void {
    this.categorySelected.emit(slug);
  }
}
