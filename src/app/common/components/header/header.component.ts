import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { BlogService } from '../../service/blog.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  user: any = null;
  categories: any[] = [];

  constructor(
    private auth: AuthService,
    private blogService: BlogService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.auth.isAuthenticated();
    this.user = this.auth.getCurrentUser();
    this.blogService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.isAuthenticated = false;
    this.user = null;
  }
}
