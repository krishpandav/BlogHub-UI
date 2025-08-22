import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api!: ApiService; // Will be initialized lazily

  constructor(
    private injector: Injector,
    private config: ConfigService,
    private router: Router
  ) {
    // Lazy inject ApiService to prevent circular dependency
    setTimeout(() => {
      this.api = this.injector.get(ApiService);
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.config.STORAGE_KEYS.AUTH_TOKEN);
  }

  getCurrentUser(): any | null {
    const userData = localStorage.getItem(this.config.STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  getLikedUserBlog(): any[] {
    const user = this.getCurrentUser();
    return user?.likedBlogs || [];
  }

  getToken(): string | null {
    return localStorage.getItem(this.config.STORAGE_KEYS.AUTH_TOKEN);
  }

  setAuthData(token: string, userData: any): void {
    localStorage.setItem(this.config.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(this.config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }

  clearAuthData(): void {
    localStorage.removeItem(this.config.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(this.config.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(this.config.STORAGE_KEYS.REMEMBER_ME);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === this.config.USER_ROLES.ADMIN;
  }

  login(credentials: { username: string; password: string }, rememberMe = false): Observable<any> {
    return this.api.post<any>(this.config.API_ENDPOINTS.USER_LOGIN, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.setAuthData(response.data.token, response.data.user);
          if (rememberMe) {
            localStorage.setItem(this.config.STORAGE_KEYS.REMEMBER_ME, 'true');
          }
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.api.post<any>(this.config.API_ENDPOINTS.USER_REGISTER, userData);
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  validateToken(): Observable<any> {
    return this.api.get<any>(this.config.API_ENDPOINTS.USER_PROFILE, true).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem(this.config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        } else {
          this.clearAuthData();
        }
      })
    );
  }
}
