// API Management
const API = {
    // Make HTTP request
    request: function(method, endpoint, data = null, requireAuth = false) {
        return new Promise((resolve, reject) => {
            const url = CONFIG.API_BASE_URL + endpoint;
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add authorization header if required
            if (requireAuth) {
                const token = Auth.getToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } else {
                    reject(new Error('Authentication required'));
                    return;
                }
            }
            
            const requestOptions = {
                method: method.toUpperCase(),
                headers: headers,
                mode: 'cors',
                credentials: 'include'
            };
            
            // Add body for POST, PUT, PATCH requests
            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                requestOptions.body = JSON.stringify(data);
            }
            
            // Make the request
            fetch(url, requestOptions)
                .then(response => {
                    // Check if response is ok
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                        });
                    }
                    
                    // Parse JSON response
                    return response.json();
                })
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    console.error('API Request Error:', error);
                    reject(error);
                });
        });
    },
    
    // GET request
    get: function(endpoint, requireAuth = false) {
        return this.request('GET', endpoint, null, requireAuth);
    },
    
    // POST request
    post: function(endpoint, data, requireAuth = false) {
        return this.request('POST', endpoint, data, requireAuth);
    },
    
    // PUT request
    put: function(endpoint, data, requireAuth = true) {
        return this.request('PUT', endpoint, data, requireAuth);
    },
    
    // DELETE request
    delete: function(endpoint, requireAuth = true) {
        return this.request('DELETE', endpoint, null, requireAuth);
    },
    
    // jQuery AJAX wrapper (for compatibility)
    ajax: function(options) {
        return new Promise((resolve, reject) => {
            const defaultOptions = {
                url: CONFIG.API_BASE_URL + options.endpoint,
                method: options.method || 'GET',
                dataType: 'json',
                contentType: 'application/json',
                timeout: 30000,
                beforeSend: function(xhr) {
                    if (options.requireAuth) {
                        const token = Auth.getToken();
                        if (token) {
                            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                        } else {
                            reject(new Error('Authentication required'));
                            return false;
                        }
                    }
                },
                success: function(data) {
                    resolve(data);
                },
                error: function(xhr, status, error) {
                    let errorMessage = 'Request failed';
                    
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    } else if (error) {
                        errorMessage = error;
                    }
                    
                    reject(new Error(errorMessage));
                }
            };
            
            // Merge options
            const ajaxOptions = $.extend({}, defaultOptions, options);
            
            // Convert data to JSON string if it's an object
            if (ajaxOptions.data && typeof ajaxOptions.data === 'object') {
                ajaxOptions.data = JSON.stringify(ajaxOptions.data);
            }
            
            // Make the request
            $.ajax(ajaxOptions);
        });
    }
};

// Blog API methods
const BlogAPI = {
    // Get all blogs
    getAllBlogs: function(page = 1, limit = CONFIG.PAGINATION.BLOGS_PER_PAGE) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOGS_ALL}?page=${page}&limit=${limit}`;
        return API.get(endpoint);
    },
    
    // Get blogs by category
    getBlogsByCategory: function(categorySlug, page = 1, limit = CONFIG.PAGINATION.BLOGS_PER_PAGE) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOGS_BY_CATEGORY}/${categorySlug}?page=${page}&limit=${limit}`;
        return API.get(endpoint);
    },
    
    // Get popular blogs
    getPopularBlogs: function(limit = CONFIG.PAGINATION.POPULAR_POSTS_LIMIT) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOGS_POPULAR}?limit=${limit}`;
        return API.get(endpoint);
    },
    
    // Get single blog
    getBlog: function(blogId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOG_SINGLE}/${blogId}`;
        return API.get(endpoint);
    },
    
    // Create blog
    createBlog: function(blogData) {
        return API.post(CONFIG.API_ENDPOINTS.BLOG_CREATE, blogData, true);
    },
    
    // Update blog
    updateBlog: function(blogData) {
        return API.put(CONFIG.API_ENDPOINTS.BLOG_UPDATE, blogData, true);
    },
    
    // Delete blog
    deleteBlog: function(blogId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOG_DELETE}/${blogId}`;
        return API.delete(endpoint, true);
    },
    
    // Like blog
    likeBlog: function(blogId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOG_LIKE}/${blogId}/like`;
        return API.post(endpoint, {}, true);
    },
    
    // Unlike blog
    unlikeBlog: function(blogId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOG_UNLIKE}/${blogId}/unlike`;
        return API.post(endpoint, {}, true);
    },
    
    // Search blogs
    searchBlogs: function(query, page = 1, limit = CONFIG.PAGINATION.BLOGS_PER_PAGE) {
        const endpoint = `${CONFIG.API_ENDPOINTS.BLOGS_ALL}?searchtext=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
        return API.get(endpoint);
    }
};

// User API methods
const UserAPI = {
    // Get user profile (public)
    getPublicProfile: function(userId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.USER_PROFILE_PUBLIC}/${userId}`;
        return API.get(endpoint);
    },
    
    // Get own profile
    getProfile: function() {
        return API.get(CONFIG.API_ENDPOINTS.USER_PROFILE, true);
    },
    
    // Update profile
    updateProfile: function(userData) {
        return API.put(CONFIG.API_ENDPOINTS.USER_PROFILE_UPDATE, userData, true);
    },
    
    // Get user's blogs
    getMyBlogs: function(page = 1, limit = CONFIG.PAGINATION.BLOGS_PER_PAGE) {
        const endpoint = `${CONFIG.API_ENDPOINTS.USER_MY_BLOGS}?page=${page}&limit=${limit}`;
        return API.get(endpoint, true);
    },
    
    // Get liked blogs
    getLikedBlogs: function(page = 1, limit = CONFIG.PAGINATION.BLOGS_PER_PAGE) {
        const endpoint = `${CONFIG.API_ENDPOINTS.USER_LIKED_BLOGS}?page=${page}&limit=${limit}`;
        return API.get(endpoint, true);
    }
};

// Category API methods
const CategoryAPI = {
    // Get all categories
    getCategories: function() {
        return API.get(CONFIG.API_ENDPOINTS.CATEGORIES);
    }
};

// Admin API methods
const AdminAPI = {
    // Get dashboard data
    getDashboard: function() {
        return API.get(CONFIG.API_ENDPOINTS.ADMIN_DASHBOARD, true);
    },
    
    // Get all users
    getUsers: function(page = 1, limit = 20) {
        const endpoint = `${CONFIG.API_ENDPOINTS.ADMIN_USERS}?page=${page}&limit=${limit}`;
        return API.get(endpoint, true);
    },
    
    // Update user status
    updateUserStatus: function(userId, status) {
        return API.put(CONFIG.API_ENDPOINTS.ADMIN_USER_STATUS, { userId, status }, true);
    },
    
    // Delete user
    deleteUser: function(userId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.ADMIN_USER_DELETE}/${userId}`;
        return API.delete(endpoint, true);
    },
    
    // Get all blogs (admin view)
    getBlogs: function(page = 1, limit = 20) {
        const endpoint = `${CONFIG.API_ENDPOINTS.ADMIN_BLOGS}?page=${page}&limit=${limit}`;
        return API.get(endpoint, true);
    },
    
    // Update blog status
    updateBlogStatus: function(blogId, status) {
        return API.put(CONFIG.API_ENDPOINTS.ADMIN_BLOG_STATUS, { blogId, status }, true);
    },
    
    // Delete blog (admin)
    deleteBlog: function(blogId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.ADMIN_BLOG_DELETE}/${blogId}`;
        return API.delete(endpoint, true);
    },
    
    // Create category
    createCategory: function(categoryData) {
        return API.post(CONFIG.API_ENDPOINTS.ADMIN_CATEGORY_CREATE, categoryData, true);
    },
    
    // Update category
    updateCategory: function(categoryData) {
        return API.put(CONFIG.API_ENDPOINTS.ADMIN_CATEGORY_UPDATE, categoryData, true);
    },
    
    // Delete category
    deleteCategory: function(categoryId) {
        const endpoint = `${CONFIG.API_ENDPOINTS.ADMIN_CATEGORY_DELETE}/${categoryId}`;
        return API.delete(endpoint, true);
    }
};

// Error handling for API calls
const APIErrorHandler = {
    handle: function(error, context = '') {
        console.error(`API Error ${context}:`, error);
        
        let message = 'An error occurred. Please try again.';
        
        if (error.message) {
            message = error.message;
        }
        
        // Handle specific error types
        if (error.message && error.message.includes('401')) {
            message = 'Authentication required. Please login.';
            Auth.clearAuthData();
            Auth.updateNavigation();
        } else if (error.message && error.message.includes('403')) {
            message = 'Access denied. You don\'t have permission to perform this action.';
        } else if (error.message && error.message.includes('404')) {
            message = 'The requested resource was not found.';
        } else if (error.message && error.message.includes('500')) {
            message = 'Server error. Please try again later.';
        } else if (error.message && error.message.includes('Network')) {
            message = 'Network error. Please check your connection.';
        }
        
        UTILS.showToast(message, 'error');
        return message;
    }
};

// Global API error handler
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.name === 'APIError') {
        APIErrorHandler.handle(event.reason);
        event.preventDefault();
    }
});
