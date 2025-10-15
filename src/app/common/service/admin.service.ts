import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
    constructor(
        private api: ApiService,
        private config: ConfigService,
    ) { }

    // Dashboard stats
    getDashboard(): Observable<any> {
        return this.api.get(this.config.API_ENDPOINTS.ADMIN_DASHBOARD, true);
    }

    // Users management
    getUsers(): Observable<any> {
        return this.api.get(this.config.API_ENDPOINTS.ADMIN_USERS, true);
    }

    updateUser(userId: string, payload: object): Observable<any> {
        return this.api.put(`${this.config.API_ENDPOINTS.ADMIN_USER_UDATE}/${userId}`, payload, true);
    }

    deleteUser(userId: string): Observable<any> {
        return this.api.delete(`${this.config.API_ENDPOINTS.ADMIN_USER_DELETE}/${userId}`, true);
    }

    // Blogs management
    getBlogs(page = 1, status?: string): Observable<any> {
        let url = `${this.config.API_ENDPOINTS.ADMIN_BLOGS}?page=${page}`;
        if (status) url += `&status=${status}`;
        return this.api.get(url, true);
    }

    updateBlogStatus(id: string, status: 'published' | 'draft' | 'blocked'): Observable<any> {
        return this.api.put(`${this.config.API_ENDPOINTS.ADMIN_BLOG_STATUS}`, { id, status }, true);
    }

    deleteBlog(blogId: string): Observable<any> {
        return this.api.delete(`${this.config.API_ENDPOINTS.ADMIN_BLOG_DELETE}/${blogId}`, true);
    }

    // Categories management
    createCategory(payload: { name: string }): Observable<any> {
        return this.api.post(this.config.API_ENDPOINTS.ADMIN_CATEGORY_CREATE, payload, true);
    }

    getCategories(): Observable<any> {
        return this.api.get(this.config.API_ENDPOINTS.ADMIN_CATEGORY_GET, true);
    }

    updateCategory(payload: { name: string }): Observable<any> {
        return this.api.put(`${this.config.API_ENDPOINTS.ADMIN_CATEGORY_UPDATE}`, payload, true);
    }

    deleteCategory(categoryId: string): Observable<any> {
        return this.api.delete(`${this.config.API_ENDPOINTS.ADMIN_CATEGORY_DELETE}/${categoryId}`, true);
    }

    // Helpers for dashboard lists
    getRecentUsers(limit = 5): Observable<any[]> {
        return this.getUsers().pipe(
            map((res: any) => Array.isArray(res?.data.users) ? res.data.users.slice(0, limit) : [])
        );
    }

    getRecentBlogs(limit = 5): Observable<any[]> {
        return this.getBlogs(1).pipe(
            map((res: any) => {
                const list = res?.data?.blogs || res?.data || [];
                return Array.isArray(list) ? list.slice(0, limit) : [];
            })
        );
    }
}
