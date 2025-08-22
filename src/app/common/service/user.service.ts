import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private api: ApiService,
    private config: ConfigService
  ) { }

  getProfile() {
    return this.api.get(this.config.API_ENDPOINTS.USER_PROFILE, true);
  }

  // Update profile
  updateProfile(userData: any): Observable<any> {
    return this.api.put(this.config.API_ENDPOINTS.USER_PROFILE_UPDATE, userData, true);
  }

  // Get user's blogs
  getMyBlogs(page: number = 1, limit: number = 10) {
    const endpoint = `${this.config.API_ENDPOINTS.USER_MY_BLOGS}?page=${page}&limit=${limit}`;
    return this.api.get(endpoint, true);
  }

  // Get liked blogs
  getLikedBlogs(page: number = 1, limit: number = 10) {
    const endpoint = `${this.config.API_ENDPOINTS.USER_LIKED_BLOGS}?page=${page}&limit=${limit}`;
    return this.api.get(endpoint, true);
  }

  getPublicProfile(id: string) {
    return this.api.get(`${this.config.API_ENDPOINTS.USER_PROFILE_PUBLIC}/${id}`, true);
  }

  getUserBlogs(id: string) {
    return this.api.get(`${this.config.API_ENDPOINTS.BLOGS_BY_USERID}/${id}`, true);
  }
}
