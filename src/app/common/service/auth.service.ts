import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ConfigService } from './config.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  REMEMBER_ME: boolean = false;

  constructor(
    private injector: Injector,
    private config: ConfigService,
    private router: Router
  ) {
    this.REMEMBER_ME = JSON.parse(localStorage.getItem(this.config.STORAGE_KEYS.REMEMBER_ME) || 'false');
  }

  // lazy getter for ApiService (no circular dependency at DI time)
  private get api(): ApiService {
    return this.injector.get(ApiService);
  }

  private getStorage(): Storage {
    return this.REMEMBER_ME ? localStorage : sessionStorage;
  }

  isAuthenticated(): boolean {
    return !!this.getStorage().getItem(this.config.STORAGE_KEYS.AUTH_TOKEN);
  }

  getCurrentUser(): any | null {
    const userData = this.getStorage().getItem(this.config.STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  getLikedUserBlog(): any[] {
    const user = this.getCurrentUser();
    return user?.likedBlogs || [];
  }

  unlikeBlog(blog_id: string): any {
    const user = this.getCurrentUser();
    if (user?.likedBlogs) {
      user.likedBlogs = user.likedBlogs.filter((id: string) => id !== blog_id);
      this.getStorage().setItem(this.config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  }

  likeBlog(blog_id: string): any {
    const user = this.getCurrentUser();
    if (user) {
      user.likedBlogs = user.likedBlogs || [];
      user.likedBlogs.push(blog_id);
      this.getStorage().setItem(this.config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  }

  getToken(): string | null {
    return this.getStorage().getItem(this.config.STORAGE_KEYS.AUTH_TOKEN);
  }

  setAuthData(token: string, userData: any): void {
    const storage = this.getStorage();
    storage.setItem(this.config.STORAGE_KEYS.AUTH_TOKEN, token);
    storage.setItem(this.config.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(this.config.STORAGE_KEYS.REMEMBER_ME, JSON.stringify(this.REMEMBER_ME));
  }

  clearAuthData(): void {
    sessionStorage.removeItem(this.config.STORAGE_KEYS.AUTH_TOKEN);
    sessionStorage.removeItem(this.config.STORAGE_KEYS.USER_DATA);
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
          debugger
          this.REMEMBER_ME = rememberMe;
          this.setAuthData(response.data.token, response.data.user);
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
    debugger
    return this.api.get<any>(this.config.API_ENDPOINTS.USER_PROFILE, true).pipe(
      tap(response => {
        debugger
        if (!response.success) {
          this.clearAuthData()
        }
      })
    );
  }
}