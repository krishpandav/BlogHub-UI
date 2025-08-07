// BlogHub Configuration
const CONFIG = {
    // API Base URL
    API_BASE_URL: 'https://fvmdblc9-5051.inc1.devtunnels.ms',

    // API Endpoints
    API_ENDPOINTS: {
        // Public Routes
        USER_REGISTER: '/api/user/register',
        USER_LOGIN: '/api/user/login',
        USER_PROFILE_PUBLIC: '/api/user/profile', // + /:id
        BLOGS_ALL: '/api/blogs',
        BLOGS_BY_CATEGORY: '/api/blogs/category', // + /:categorySlug
        BLOGS_POPULAR: '/api/blogs/popular',
        BLOG_SINGLE: '/api/blog', // + /:id
        CATEGORIES: '/api/category',

        // Protected Routes
        USER_PROFILE: '/api/user/profile',
        USER_PROFILE_UPDATE: '/api/user/profile',
        USER_MY_BLOGS: '/api/user/my-blogs',
        USER_LIKED_BLOGS: '/api/user/liked-blogs',
        BLOG_CREATE: '/api/blog',
        BLOG_UPDATE: '/api/blog',
        BLOG_DELETE: '/api/blog', // + /:id
        BLOG_LIKE: '/api/blog', // + /:id/like
        BLOG_UNLIKE: '/api/blog', // + /:id/unlike

        // Admin Routes
        ADMIN_DASHBOARD: '/api/admin/dashboard',
        ADMIN_USERS: '/api/admin/users',
        ADMIN_USER_STATUS: '/api/admin/user/status',
        ADMIN_USER_DELETE: '/api/admin/user', // + /:id
        ADMIN_BLOGS: '/api/admin/blogs',
        ADMIN_BLOG_STATUS: '/api/admin/blog/status',
        ADMIN_BLOG_DELETE: '/api/admin/blog', // + /:id
        ADMIN_CATEGORY_CREATE: '/api/admin/category',
        ADMIN_CATEGORY_UPDATE: '/api/admin/category',
        ADMIN_CATEGORY_DELETE: '/api/admin/category' // + /:id
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'bloghub_auth_token',
        USER_DATA: 'bloghub_user_data',
        REMEMBER_ME: 'bloghub_remember_me'
    },

    // Pagination
    PAGINATION: {
        BLOGS_PER_PAGE: 10,
        POPULAR_POSTS_LIMIT: 5
    },

    // UI Settings
    UI: {
        LOADING_DELAY: 300, // ms
        TOAST_DURATION: 5000, // ms
        SEARCH_DEBOUNCE: 500 // ms
    },

    // User Roles
    USER_ROLES: {
        USER: 'user',
        ADMIN: 'admin'
    },

    // Blog Status
    BLOG_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        PENDING: 'pending',
        REJECTED: 'rejected'
    },

    // User Status
    USER_STATUS: {
        ACTIVE: 'active',
        BLOCKED: 'blocked',
        PENDING: 'pending'
    }
};

// Utility Functions
const UTILS = {
    // Format date
    formatDate: function (dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },

    // Format date relative (e.g., "2 hours ago")
    formatDateRelative: function (dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return this.formatDate(dateString);
        }
    },

    // Truncate text
    truncateText: function (text, maxLength = 150) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Escape HTML
    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Generate slug from title
    generateSlug: function (title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Validate email
    isValidEmail: function (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Show toast notification
    showToast: function (message, type = 'info') {

        
        // Create toast element
        const toast = $(`
            <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `);

        // Add to toast container (create if doesn't exist)
        if ($('#toastContainer').length === 0) {
            $('body').append('<div id="toastContainer" class="toast-container position-fixed top-0 end-0 p-3"></div>');
        }

        $('#toastContainer').append(toast);

        // Initialize and show toast
        const bsToast = new bootstrap.Toast(toast[0], {
            autohide: true,
            delay: CONFIG.UI.TOAST_DURATION
        });
        bsToast.show();

        // Remove from DOM after hiding
        toast.on('hidden.bs.toast', function () {
            $(this).remove();
        });
    },

    // Show loading spinner
    showLoading: function (element) {
        const $element = $(element);
        $element.addClass('loading-overlay');
        $element.append(`
            <div class="position-absolute top-50 start-50 translate-middle">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);
    },

    // Hide loading spinner
    hideLoading: function (element) {
        const $element = $(element);
        $element.removeClass('loading-overlay');
        $element.find('.position-absolute').remove();
    },

    // Debounce function
    debounce: function (func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get URL parameters
    getUrlParameter: function (name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Set URL parameter
    setUrlParameter: function (name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    // Remove URL parameter
    removeUrlParameter: function (name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }
};

// Global error handler
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    UTILS.showToast('An unexpected error occurred. Please try again.', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    UTILS.showToast('An unexpected error occurred. Please try again.', 'error');
});
