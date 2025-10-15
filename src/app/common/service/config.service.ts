import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  API_BASE_URL = 'http://localhost:5051';
  // API_BASE_URL = 'https://fvmdblc9-5051.inc1.devtunnels.ms';

  API_ENDPOINTS = {
    USER_REGISTER: '/api/user/register',
    USER_LOGIN: '/api/user/login',
    USER_PROFILE_PUBLIC: '/api/user/profile',
    BLOGS_ALL: '/api/blogs',
    BLOGS_BY_USERID: '/api/blogs/user',
    BLOGS_BY_CATEGORY: '/api/blogs/category',
    BLOGS_POPULAR: '/api/blogs/popular',
    BLOG_SINGLE: '/api/blog',
    CATEGORIES: '/api/category',
    USER_PROFILE: '/api/user/profile',
    USER_PROFILE_UPDATE: '/api/user/profile',
    USER_MY_BLOGS: '/api/user/my-blogs',
    USER_LIKED_BLOGS: '/api/user/liked-blogs',
    BLOG_CREATE: '/api/blog',
    BLOG_UPDATE: '/api/blog',
    BLOG_DELETE: '/api/blog',
    BLOG_LIKE: '/api/blog',
    BLOG_UNLIKE: '/api/blog',
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USER_UDATE: '/api/admin/user',
    ADMIN_USER_DELETE: '/api/admin/user',
    ADMIN_BLOGS: '/api/admin/blogs',
    ADMIN_BLOG_STATUS: '/api/admin/blog/status',
    ADMIN_BLOG_DELETE: '/api/admin/blog',
    ADMIN_CATEGORY_GET: '/api/admin/category',
    ADMIN_CATEGORY_CREATE: '/api/admin/category',
    ADMIN_CATEGORY_UPDATE: '/api/admin/category',
    ADMIN_CATEGORY_DELETE: '/api/admin/category'
  };

  STORAGE_KEYS = {
    AUTH_TOKEN: 'bloghub_auth_token',
    USER_DATA: 'bloghub_user_data',
    REMEMBER_ME: 'bloghub_remember_me'
  };

  USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
  };

  // Default config values
  UI = {
    TOAST_DURATION: 3000
  };

  // Utility functions
  UTILS = {
    formatDate: (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDateRelative: (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((+now - +date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
      return this.UTILS.formatDate(dateString);
    },

    truncateText: (text: string, maxLength = 150) =>
      text.length <= maxLength ? text : text.substring(0, maxLength) + '...',

    escapeHtml: (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    generateSlug: (title: string) =>
      title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, ''),

    isValidEmail: (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

    // Toast (requires jQuery + Bootstrap if you keep this)
    showToast: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
      // const toast = $(`
      //   <div class="toast align-items-center text-white bg-${type === 'error'
      //     ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0" role="alert">
      //     <div class="d-flex">
      //       <div class="toast-body">${message}</div>
      //       <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      //     </div>
      //   </div>
      // `);

      // if ($('#toastContainer').length === 0) {
      //   $('body').append('<div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3"></div>');
      // }

      // $('#toastContainer').append(toast);
      // const bsToast = new bootstrap.Toast(toast[0], {
      //   autohide: true,
      //   delay: this.UI.TOAST_DURATION
      // });
      // bsToast.show();

      // toast.on('hidden.bs.toast', function () {
      //   $(this).remove();
      // });
    },

    debounce: (func: (...args: any[]) => void, wait: number) => {
      let timeout: any;
      return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    getUrlParameter: (name: string) => new URLSearchParams(window.location.search).get(name),

    setUrlParameter: (name: string, value: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set(name, value);
      window.history.pushState({}, '', url.toString());
    },

    removeUrlParameter: (name: string) => {
      const url = new URL(window.location.href);
      url.searchParams.delete(name);
      window.history.pushState({}, '', url.toString());
    },

    // correcttext: (text: any) => {
    //   if (!text) return '';
    //   return text.replace(/(\r\n|\n|\r)/g, '</p><br><p clas="mb-0 fw-normal">');
    // }

  };
}
