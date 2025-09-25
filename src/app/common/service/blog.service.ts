import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(
    private api: ApiService,
    private config: ConfigService
  ) { }

  // Get all blogs with optional page, category, and search
  getBlogs(page: number = 1, category?: string, search?: string): Observable<any> {
    let endpoint = `${this.config.API_ENDPOINTS.BLOGS_ALL}?page=${page}`;
    if (search) endpoint += `&searchtext=${search}`;
    return this.api.get(endpoint);
  }

  // Get popular blogs
  getPopularBlogs(limit: number = 10): Observable<any> {
    let endpoint = `${this.config.API_ENDPOINTS.BLOGS_POPULAR}?&limit=${limit}`;
    // if (search) endpoint += `&search=${search}`;
    return this.api.get(endpoint);
  }

  // Get categories
  getCategories(): Observable<any> {
    return this.api.get(this.config.API_ENDPOINTS.CATEGORIES);
  }

  // Get single blog by ID
  getBlogById(id: string): Observable<any> {
    return this.api.get(`${this.config.API_ENDPOINTS.BLOG_SINGLE}/${id}`);
  }

  // Create a new blog
  createBlog(blogData: any): Observable<any> {
    return this.api.post(this.config.API_ENDPOINTS.BLOG_CREATE, blogData, true);
  }

  // Update existing blog
  updateBlog(blogData: any): Observable<any> {
    return this.api.put(`${this.config.API_ENDPOINTS.BLOG_UPDATE}`, blogData, true);
  }

  // Delete a blog
  deleteBlog(blogId: string): Observable<any> {
    return this.api.delete(`${this.config.API_ENDPOINTS.BLOG_DELETE}/${blogId}`, true);
  }

  // Like a blog
  likeBlog(blogId: string): Observable<any> {
    return this.api.post(`${this.config.API_ENDPOINTS.BLOG_LIKE}/${blogId}/like`, {}, true);
  }

  // Unlike a blog
  unlikeBlog(blogId: string): Observable<any> {
    return this.api.post(`${this.config.API_ENDPOINTS.BLOG_UNLIKE}/${blogId}/unlike`, {}, true);
  }

  // Get blogs by user
  getBlogsByUser(userId: string, page: number = 1): Observable<any> {
    return this.api.get(`${this.config.API_ENDPOINTS.BLOGS_BY_USERID}/${userId}?page=${page}`, true);
  }

  // Get blogs by category
  getBlogsByCategory(categorySlug: string, page: number = 1): Observable<any> {
    return this.api.get(`${this.config.API_ENDPOINTS.BLOGS_BY_CATEGORY}/${categorySlug}?page=${page}`);
  }
}
