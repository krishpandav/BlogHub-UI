// Main JavaScript for BlogHub
$(document).ready(function () {
    // Initialize the application
    BlogHub.init();
});

// Main BlogHub object
const BlogHub = {
    // Current page data
    currentPage: 1,
    currentCategory: null,
    currentSearch: '',

    // Initialize the application
    init: function () {
        this.loadCategories();
        this.loadBlogs();
        this.loadPopularPosts();
        this.bindEvents();
        this.initializeSearch();
    },

    // Bind event handlers
    bindEvents: function () {
        // Search functionality
        $('#searchBtn').on('click', this.handleSearch.bind(this));
        $('#searchInput').on('keypress', function (e) {
            if (e.which === 13) { // Enter key
                BlogHub.handleSearch();
            }
        });

        // Category filter
        $(document).on('click', '.category-filter', this.handleCategoryFilter.bind(this));

        // Pagination
        $(document).on('click', '.pagination .page-link', this.handlePagination.bind(this));

        // Like/Unlike buttons
        $(document).on('click', '.like-btn', this.handleLike.bind(this));

        // Clear search
        $(document).on('click', '#clearSearch', this.clearSearch.bind(this));
    },

    // Initialize search with debounce
    initializeSearch: function () {
        const debouncedSearch = UTILS.debounce(this.performSearch.bind(this), CONFIG.UI.SEARCH_DEBOUNCE);
        $('#searchInput').on('input', debouncedSearch);
    },

    // Load categories
    loadCategories: function () {
        CategoryAPI.getCategories()
            .then(response => {
                if (response.success && response.data) {
                    this.renderCategories(response.data);
                    this.renderCategoriesDropdown(response.data);
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    },

    // Render categories in sidebar
    renderCategories: function (categories) {
        const $categoriesList = $('#categoriesList');

        if (categories.length === 0) {
            $categoriesList.html('<p class="text-muted">No categories available</p>');
            return;
        }
        debugger
        let html = '';
        categories.forEach(category => {
            html += `
                <div class="sidebar-item">
                    <a href="#" class="category-filter" data-slug="${category.slug}">
                        ${UTILS.escapeHtml(category.name)}
                        <span class="badge bg-secondary ms-2">${category.blogCount || 0}</span>
                    </a>
                </div>
            `;
        });

        // Add "All Categories" option
        html = `
            <div class="sidebar-item">
                <a href="#" class="category-filter ${!this.currentCategory ? 'fw-bold text-primary' : ''}" data-slug="">
                    All Categories
                </a>
            </div>
        ` + html;

        $categoriesList.html(html);
    },

    // Render categories in dropdown
    renderCategoriesDropdown: function (categories) {
        const $dropdown = $('#categoriesDropdown');

        let html = '<li><a class="dropdown-item category-filter" href="#" data-slug="">All Categories</a></li>';

        if (categories.length > 0) {
            html += '<li><hr class="dropdown-divider"></li>';
            categories.forEach(category => {
                html += `
                    <li>
                        <a class="dropdown-item category-filter" href="#" data-slug="${category.slug}">
                            ${UTILS.escapeHtml(category.name)}
                        </a>
                    </li>
                `;
            });
        }

        $dropdown.html(html);
    },

    // Load blogs
    loadBlogs: function (page = 1) {

        this.showLoading();
        this.currentPage = page;

        let apiCall;

        if (this.currentSearch) {
            // Search blogs
            apiCall = BlogAPI.searchBlogs(this.currentSearch, page);
        } else if (this.currentCategory) {
            // Filter by category
            apiCall = BlogAPI.getBlogsByCategory(this.currentCategory, page);
        } else {
            // Get all blogs
            apiCall = BlogAPI.getAllBlogs(page);
        }

        apiCall
            .then(response => {
                this.hideLoading();
                if (response.success && response.data) {
                    this.renderBlogs(response.data.blogs);
                    this.renderPagination(response.data.pagination || {});
                } else {
                    this.showError('Failed to load blogs');
                }
            })
            .catch(error => {
                this.hideLoading();
                this.showError('Error loading blogs: ' + error.message);
            });
    },

    // Load popular posts
    loadPopularPosts: function () {
        BlogAPI.getPopularBlogs()
            .then(response => {
                if (response.success && response.data) {
                    this.renderPopularPosts(response.data);
                }
            })
            .catch(error => {
                console.error('Error loading popular posts:', error);
            });
    },

    // Render blogs
    renderBlogs: function (blogs) {
        const $container = $('#blogContainer');

        if (blogs.length === 0) {
            $container.html(`
                <div class="text-center py-5">
                    <h4>No blogs found</h4>
                    <p class="text-muted">
                        ${this.currentSearch ? 'Try adjusting your search terms.' : 'Be the first to create a blog post!'}
                    </p>
                    ${Auth.isAuthenticated() ? '<a href="create-blog.html" class="btn btn-primary-custom">Create Blog</a>' : ''}
                </div>
            `);
            return;
        }

        let html = '';
        blogs.forEach(blog => {
            html += this.renderBlogCard(blog);
        });

        $container.html(html);

        // Add fade-in animation
        $container.find('.blog-card').addClass('fade-in');
    },

    // Render single blog card
    renderBlogCard: function (blog) {
        const publishedDate = UTILS.formatDateRelative(blog.created_at || blog.publishedAt);
        const excerpt = UTILS.truncateText(blog.excerpt || blog.content || '', 200);
        const isLiked = Auth.getLikedUserBlog().includes(blog._id);
        const likesCount = blog.likes || 0;

        // Add image HTML if blog has an image
        const imageHtml = blog.image ?
            `<div class="mb-3">
                <img src="${blog.image}" alt="${UTILS.escapeHtml(blog.title)}" class="card-img-top" style="height: 200px; object-fit: cover;">
            </div>` : '';

        return `
            <div class="card blog-card">
                ${imageHtml}
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h2 class="blog-title">
                            <a href="blog-detail.html?id=${blog._id}">${UTILS.escapeHtml(blog.title)}</a>
                        </h2>
                        ${blog.category ? `<span class="blog-category">${UTILS.escapeHtml(blog.category.name || blog.category)}</span>` : ''}
                    </div>
                    
                    <div class="blog-meta">
                        <span>By ${UTILS.escapeHtml(blog.author?.username || blog.authorName || 'Unknown')}</span>
                        <span>${publishedDate}</span>
                        ${blog.readTime ? `<span>${blog.readTime} min read</span>` : ''}
                    </div>
                    
                    <p class="blog-excerpt">${UTILS.escapeHtml(excerpt)}</p>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="blog-detail.html?id=${blog._id}" class="btn btn-outline-primary-custom">Read More</a>
                        
                        <div class="d-flex align-items-center">
                            ${Auth.isAuthenticated() ? `
                                <button class="like-btn ${isLiked ? 'liked' : ''}" data-blog-id="${blog._id}">
                                    <span id="likeIcon">${isLiked ? '♥' : '♡'}</span>
                                    <span id="likeCount">${likesCount}</span>
                                </button>
                            ` : `
                                <span class="text-muted">♡ ${likesCount}</span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render popular posts
    renderPopularPosts: function (posts) {
        const $container = $('#popularPosts');

        if (posts.length === 0) {
            $container.html('<p class="text-muted">No popular posts yet</p>');
            return;
        }

        let html = '';
        posts.forEach(post => {
            const publishedDate = UTILS.formatDateRelative(post.created_at || post.publishedAt);
            html += `
                <div class="popular-post-item">
                    <div class="popular-post-title">
                        <a href="blog-detail.html?id=${post._id}">${UTILS.escapeHtml(post.title)}</a>
                    </div>
                    <div class="popular-post-meta">
                        ${publishedDate} • ${post.likes || 0} likes
                    </div>
                </div>
            `;
        });

        $container.html(html);
    },

    // Render pagination
    renderPagination: function (pagination) {

        const $pagination = $('#pagination');

        debugger

        if (!pagination.totalPages || pagination.totalPages <= 1) {
            $pagination.empty();
            return;
        }

        const currentPage = pagination.currentPage || this.currentPage;
        const totalPages = pagination.totalPages;

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            html += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
            if (startPage > 2) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
        }

        // Next button
        html += `
            <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;

        $pagination.html(html);
    },

    // Handle search
    handleSearch: function () {
        const query = $('#searchInput').val().trim();
        this.currentSearch = query;
        this.currentPage = 1;
        this.loadBlogs(this.currentPage);

        // Update URL
        if (query) {
            UTILS.setUrlParameter('search', query);
        } else {
            UTILS.removeUrlParameter('search');
        }
    },

    // Perform search (for debounced input)
    performSearch: function () {
        const query = $('#searchInput').val().trim();
        if (query !== this.currentSearch) {
            this.handleSearch();
        }
    },

    // Clear search
    clearSearch: function () {
        $('#searchInput').val('');
        this.currentSearch = '';
        this.currentPage = 1;
        this.loadBlogs(1);
        UTILS.removeUrlParameter('search');
    },

    // Handle category filter
    handleCategoryFilter: function (e) {
        e.preventDefault();
        const slug = $(e.target).data('slug');

        this.currentCategory = slug || null;
        this.currentPage = 1;
        this.loadBlogs(1);

        // Update active state
        $('.category-filter').removeClass('fw-bold text-primary');
        $(e.target).addClass('fw-bold text-primary');

        // Update URL
        if (slug) {
            UTILS.setUrlParameter('category', slug);
        } else {
            UTILS.removeUrlParameter('category');
        }
    },

    // Handle pagination
    handlePagination: function (e) {
        e.preventDefault();
        const page = parseInt($(e.target).data('page'));

        if (page && page !== this.currentPage) {
            this.loadBlogs(page);

            // Scroll to top
            $('html, body').animate({ scrollTop: 0 }, 300);
        }
    },

    // Handle like/unlike
    handleLike: function (e) {
        e.preventDefault();

        debugger

        if (!Auth.isAuthenticated()) {
            UTILS.showToast('Please login to like posts', 'error');
            return;
        }

        const $btn = $(e.target);
        const blogId = $btn.data('blog-id');
        const isLiked = $btn.hasClass('liked');

        // Disable button during request
        $btn.prop('disabled', true);

        const apiCall = isLiked ? BlogAPI.unlikeBlog(blogId) : BlogAPI.likeBlog(blogId);

        apiCall
            .then(response => {
                if (response.success) {
                    // Update button state
                    $btn.toggleClass('liked');
                    debugger
                    // Update like count
                    const currentCount = parseInt(($btn.text().match(/\d+/) || [0])[0]);
                    const newCount = isLiked ? currentCount - 1 : currentCount + 1;
                    $btn.html(`${isLiked ? '♡' : '♥'} ${newCount}`);

                    UTILS.showToast(isLiked ? 'Post unliked' : 'Post liked', 'success');
                } else {
                    UTILS.showToast('Failed to update like status', 'error');
                }
            })
            .catch(error => {
                UTILS.showToast('Error updating like status: ' + error.message, 'error');
            })
            .finally(() => {
                $btn.prop('disabled', false);
            });
    },

    // Show loading state
    showLoading: function () {
        $('#loadingSpinner').removeClass('d-none');
        $('#blogContainer').addClass('d-none');
        $('#errorAlert').addClass('d-none');
    },

    // Hide loading state
    hideLoading: function () {
        $('#loadingSpinner').addClass('d-none');
        $('#blogContainer').removeClass('d-none');
    },

    // Show error
    showError: function (message) {
        $('#errorMessage').text(message);
        $('#errorAlert').removeClass('d-none');
        $('#loadingSpinner').addClass('d-none');
        $('#blogContainer').addClass('d-none');
    },

    // Initialize from URL parameters
    initFromUrl: function () {
        const search = UTILS.getUrlParameter('search');
        const category = UTILS.getUrlParameter('category');
        const page = parseInt(UTILS.getUrlParameter('page')) || 1;

        if (search) {
            $('#searchInput').val(search);
            this.currentSearch = search;
        }

        if (category) {
            this.currentCategory = category;
        }

        this.currentPage = page;
    }
};

// Initialize from URL on page load
$(document).ready(function () {
    BlogHub.initFromUrl();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function (e) {
    BlogHub.initFromUrl();
    BlogHub.loadBlogs(BlogHub.currentPage);
});
