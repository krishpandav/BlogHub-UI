
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
        html += `<option value="${category._id}">${UTILS.escapeHtml(category.name)}</option>`;
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
    const blogData = getBlogData();

    
    // Create a preview in a new window / tab
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Blog Preview - BlogHub</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                        <link href="assets/css/style.css" rel="stylesheet">
                    </head>
                    <body>
                        <div class="container mt-4">
                            <div class="card">
                                <div class="card-body">
                                    <h1 class="display-5 fw-bold mb-3">${UTILS.escapeHtml(blogData.title || 'Untitled Blog')}</h1>
                                    <div class="blog-content">
                                        ${blogData.content ? blogData.content.replace(/\n/g, '<br>') : 'No content to preview'}
                                    </div>
                                </div>
                            </div>
                            <div class="text-center mt-4">
                                <button class="btn btn-secondary" onclick="window.close()">Close Preview</button>
                            </div>
                        </div>
                    </body>
                    </html>
                `);
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
