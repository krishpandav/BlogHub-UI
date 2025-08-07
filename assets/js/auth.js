// Authentication Management
const Auth = {
    // Check if user is authenticated
    isAuthenticated: function () {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        return token !== null && token !== '';
    },

    // Get current user data
    getCurrentUser: function () {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    },
    
    getLikedUserBlog: function () {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData).likedBlogs : [];
    },

    // Get auth token
    getToken: function () {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    },

    // Set auth data
    setAuthData: function (token, userData) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    },

    // Clear auth data
    clearAuthData: function () {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.REMEMBER_ME);
    },

    // Check if user is admin
    isAdmin: function () {
        const user = this.getCurrentUser();
        return user && user.role === CONFIG.USER_ROLES.ADMIN;
    },

    // Login user
    login: function (credentials, rememberMe = false) {
        return new Promise((resolve, reject) => {
            // Determine if the input is an email or username

            const loginData = {};
            if (UTILS.isValidEmail(credentials.username)) {
                loginData.username = credentials.username;
                loginData.password = credentials.password;
            } else {
                loginData.username = credentials.username; // Using email field for username as well
                loginData.password = credentials.password;
            }

            API.post(CONFIG.API_ENDPOINTS.USER_LOGIN, loginData)
                .then(response => {
                    if (response.success) {
                        // Store auth data

                        this.setAuthData(response.data.token, response.data.user);

                        // Store remember me preference
                        if (rememberMe) {
                            localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, 'true');
                        }

                        UTILS.showToast('Login successful!', 'success');
                        resolve(response);
                    } else {
                        reject(new Error(response.message || 'Login failed'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    },

    // Register user
    register: function (userData) {
        return new Promise((resolve, reject) => {
            API.post(CONFIG.API_ENDPOINTS.USER_REGISTER, userData)
                .then(response => {
                    if (response.success) {
                        UTILS.showToast('Registration successful! Please login.', 'success');
                        resolve(response);
                    } else {
                        reject(new Error(response.message || 'Registration failed'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    },

    // Logout user
    logout: function () {
        this.clearAuthData();
        UTILS.showToast('Logged out successfully', 'info');

        // Redirect to home page
        window.location.href = 'index.html';
    },

    // Update navigation based on auth status
    updateNavigation: function () {

        const $authNav = $('#authNav');
        const isAuth = this.isAuthenticated();
        const user = this.getCurrentUser();

        if (isAuth && user) {
            // Authenticated user navigation
            $authNav.html(`
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        ${UTILS.escapeHtml(user.name || user.username)}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="profile-me.html">My Profile</a></li>
                        <li><a class="dropdown-item" href="my-blogs.html">My Blogs</a></li>
                        <li><a class="dropdown-item" href="liked-blogs.html">Liked Blogs</a></li>
                        <li><a class="dropdown-item" href="create-blog.html">Create Blog</a></li>
                        <li><hr class="dropdown-divider"></li>
                        ${user.role === CONFIG.USER_ROLES.ADMIN ? '<li><a class="dropdown-item" href="admin-dashboard.html">Admin Dashboard</a></li><li><hr class="dropdown-divider"></li>' : ''}
                        <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
                    </ul>
                </li>
            `);

            // Bind logout event
            $('#logoutBtn').on('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        } else {
            // Guest user navigation
            $authNav.html(`
                <li class="nav-item">
                    <a class="nav-link" href="login.html">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link btn btn-primary-custom text-black ms-2 px-3" href="register.html">Register</a>
                </li>
            `);
        }
    },

    // Protect page (redirect if not authenticated)
    requireAuth: function (redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            UTILS.showToast('Please login to access this page', 'error');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
            return false;
        }
        return true;
    },

    // Protect admin page
    requireAdmin: function (redirectUrl = 'index.html') {
        if (!this.isAuthenticated()) {
            UTILS.showToast('Please login to access this page', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }

        if (!this.isAdmin()) {
            UTILS.showToast('Access denied. Admin privileges required.', 'error');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
            return false;
        }

        return true;
    },

    // Redirect if already authenticated
    redirectIfAuthenticated: function (redirectUrl = 'index.html') {
        if (this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return true;
        }
        return false;
    },

    // Validate token (check if still valid)
    validateToken: function () {
        return new Promise((resolve, reject) => {

            if (!this.isAuthenticated()) {
                reject(new Error('No token found'));
                return;
            }

            API.get(CONFIG.API_ENDPOINTS.USER_PROFILE, true)
                .then(response => {
                    if (response.success) {
                        // Update user data
                        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
                        resolve(response.data.user);
                    } else {
                        // Token is invalid, clear auth data
                        this.clearAuthData();
                        reject(new Error('Invalid token'));
                    }
                })
                .catch(error => {
                    // Token is invalid, clear auth data
                    // this.clearAuthData();
                    reject(error);
                });
        });
    },

    // Initialize auth on page load
    init: function () {
        // Validate token if authenticated
        if (this.isAuthenticated()) {
            this.validateToken()
                .then(() => {
                    // Token is valid, update navigation again in case user data changed
                    this.updateNavigation();
                })
                .catch(() => {
                    // Token is invalid, update navigation to show guest state
                    this.updateNavigation();
                });
        } else {
            // Update navigation
            this.updateNavigation();

        }

        // Handle remember me functionality
        const rememberMe = localStorage.getItem(CONFIG.STORAGE_KEYS.REMEMBER_ME);
        if (rememberMe === 'true' && this.isAuthenticated()) {
            // Extend token validity (this would typically be handled by the backend)
            console.log('Remember me is active');
        }
    }
};

// Auto-initialize auth when DOM is ready
$(document).ready(function () {
    Auth.init();
});

// Handle token expiration globally
$(document).ajaxError(function (event, xhr, settings) {
    debugger
    if (xhr.status === 401) {
        // Unauthorized - token might be expired
        Auth.clearAuthData();
        Auth.updateNavigation();
        UTILS.showToast('Your session has expired. Please login again.', 'error');

        // Redirect to login if on a protected page
        const protectedPages = [
            'profile-me.html',
            'my-blogs.html',
            'liked-blogs.html',
            'create-blog.html',
            'edit-blog.html',
            'admin-dashboard.html'
        ];

        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
});
