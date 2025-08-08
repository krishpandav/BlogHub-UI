
$(document).ready(function () {
    // Check if user is authenticated
    if (!Auth.requireAuth()) {
        return;
    }

    // Load categories
    loadCategories();

    // Bind events
    bindEvents();
});

function bindEvents() {
    // Form submission
    $('#blogForm').on('submit', function (e) {
        e.preventDefault();
        publishBlog();
    });

    // Save draft
    $('#saveDraftBtn').on('click', function () {
        saveBlog('draft');
    });

    // Preview
    $('#previewBtn').on('click', function () {
        previewBlog();
    });

    // Image preview
    $('#blogImage').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview img').attr('src', e.target.result);
                $('#imagePreview').removeClass('d-none');
            }
            reader.readAsDataURL(file);
        } else {
            $('#imagePreview').addClass('d-none');
        }
    });
}

function loadCategories() {
    CategoryAPI.getCategories()
        .then(response => {
            if (response.success && response.data) {
                renderCategories(response.data);
            }
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

function renderCategories(categories) {
    let html = '<option value="">Select a category</option>';
    categories.forEach(category => {
        html += `<option value="${category._id}">${category.name}</option>`;
    });
    $('#blogCategory').html(html);
}

function saveBlog(status) {



    const blogData = getBlogData();
    blogData.status = status;

    if (!blogData.title || !blogData.content) {
        showError('Please fill in all required fields');
        return;
    }

    // Handle image upload
    const fileInput = document.getElementById('blogImage');
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            // Add base64 image data to blogData
            blogData.image = e.target.result;

            // Now send the request
            sendBlogRequest(blogData);
        };

        reader.onerror = function (e) {
            showError('Error reading image file');
            showLoading(false);
        };

        reader.readAsDataURL(file);
    } else {
        // No image, send request directly
        sendBlogRequest(blogData);
    }
}

function sendBlogRequest(blogData) {
    showLoading(true);

    BlogAPI.createBlog(blogData)
        .then(response => {
            if (response.success) {
                if (blogData.status === 'draft') {
                    showSuccess('Draft saved successfully');
                } else {
                    showSuccess('Blog published successfully');
                }

                // Redirect to my blogs page after a short delay
                setTimeout(() => {
                    window.location.href = 'my-blogs.html';
                }, 2000);
            } else {
                showError('Error saving blog: ' + response.message);
            }
        })
        .catch(error => {
            showError('Error saving blog: ' + error.message);
        })
        .finally(() => {
            showLoading(false);
        });
}

function publishBlog() {
    saveBlog('published');
}

function previewBlog() {
    const blogData = getBlogData(); // blog.title, blog.image, blog.content, etc.

    const fileInput = document.getElementById('blogImage');
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            blogData.image = e.target.result; // Set the image data for preview

            // Now generate the preview
            showBlogPreview();
        };

        reader.onerror = function (e) {
            showError('Error reading image file');
            showLoading(false);
        };

        reader.readAsDataURL(file);
    } else {
        showBlogPreview()
    }

    function showBlogPreview() {
        const imageHtml = blogData.image ? `
        <div class="mb-3">
            <img src="${blogData.image}" alt="${blogData.title}" class="card-img-top" style="height: 200px; object-fit: cover;">
        </div>` : '';

        const authorName = blogData.author?.username || blogData.authorName || 'Unknown';
        const excerpt = blogData.content ? blogData.content.substring(0, 150) + '...' : 'No content';
        let tagsHtml = '';
        if (blogData.tags && blogData.tags.length > 0) {
            blogData.tags.forEach(tag => {
                tagsHtml += `<span class="badge bg-secondary me-2">${tag}</span>`;
            });
        }
        const previewHtml = `
            <div class="card blog-card">
                ${imageHtml}
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h2 class="blog-title mb-0">${blogData.title || 'Untitled Blog'}</h2>
                        category
                    </div>
                    <div class="blog-meta mb-2">
                        <span>By ${authorName}</span>
                        <span>${new Date().toLocaleDateString()}</span>
                    </div>
                    <p class="blog-excerpt">${excerpt}</p>
                    <div class="blog-content pt-2 border-top">
                        ${blogData.content ? blogData.content.replace(/\n/g, '<br>') : ''}
                    </div>
                </div>
                ${tagsHtml ? `
                <div class="mb-4" id="tagsContainer">
                    <h6>Tags:</h6>
                    <div id="tagsList">
                        ${tagsHtml}
                    </div>
                </div>` : ''}
            </div>
        `;

        document.getElementById('previewBlogContent').innerHTML = previewHtml;

        const previewModal = new bootstrap.Modal(document.getElementById('previewBlogModal'));
        previewModal.show();
    }

}


function getBlogData() {


    const tags = $('#blogTags').val().trim();
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Note: In a real implementation, you would handle file upload separately
    // For now, we're just including the image data as a placeholder
    const imageData = $('#blogImage').val(); // This will just be the file path

    return {
        title: $('#blogTitle').val().trim(),
        category: $('#blogCategory').val(),
        content: $('#blogContent').val().trim(),
        summary: $('#blogSummary').val().trim(),
        tags: tagsArray,
        image: imageData // Image upload would be handled separately in a real implementation
    };
}

function showLoading(show) {
    if (show) {
        $('#loadingSpinner').removeClass('d-none');
        $('#publishBtn').prop('disabled', true);
        $('#saveDraftBtn').prop('disabled', true);
    } else {
        $('#loadingSpinner').addClass('d-none');
        $('#publishBtn').prop('disabled', false);
        $('#saveDraftBtn').prop('disabled', false);
    }
}

function showError(message) {
    $('#errorMessage').text(message);
    $('#errorAlert').removeClass('d-none');
    $('#successAlert').addClass('d-none');
}

function showSuccess(message) {
    $('#successMessage').text(message);
    $('#successAlert').removeClass('d-none');
    $('#errorAlert').addClass('d-none');
}

function hideAlerts() {
    $('#errorAlert').addClass('d-none');
    $('#successAlert').addClass('d-none');
}
