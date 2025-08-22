import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private auth: AuthService
  ) {}

  private getHeaders(requireAuth: boolean = false): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (requireAuth) {
      const token = this.auth.getToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  get<T>(endpoint: string, requireAuth = false): Observable<T> {
    return this.http.get<T>(
      this.config.API_BASE_URL + endpoint,
      { headers: this.getHeaders(requireAuth) }
    );
  }

  post<T>(endpoint: string, data: any, requireAuth = false): Observable<T> {
    return this.http.post<T>(
      this.config.API_BASE_URL + endpoint,
      data,
      { headers: this.getHeaders(requireAuth) }
    );
  }

  put<T>(endpoint: string, data: any, requireAuth = true): Observable<T> {
    return this.http.put<T>(
      this.config.API_BASE_URL + endpoint,
      data,
      { headers: this.getHeaders(requireAuth) }
    );
  }

  delete<T>(endpoint: string, requireAuth = true): Observable<T> {
    return this.http.delete<T>(
      this.config.API_BASE_URL + endpoint,
      { headers: this.getHeaders(requireAuth) }
    );
  }
}
