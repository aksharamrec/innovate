/**
 * Home Feed JavaScript - Implements post functionality with:
 * - SQLite database integration for post storage
 * - Cloudinary for image uploads
 * - Socket.IO for real-time notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the feed
    loadPosts();
    
    // Setup post creation modal
    setupCreatePostModal();
    
    // Setup post interaction events
    setupPostInteractions();
    
    // Setup load more functionality
    setupLoadMore();
    
    // Setup sidebar interactions
    setupSidebarInteractions();
    
    // Initialize Socket.IO for real-time notifications
    initializeRealTimeNotifications();
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Enable performance optimization for post interactions
    enableEventDelegation();
});

/**
 * Initialize Socket.IO connection for real-time post interactions
 */
async function initializeRealTimeNotifications() {
    try {
        // Import socket service
        // In production, this would be a real import:
        // import socketService from './socket-service.js';
        
        // For demo, we'll use a mock
        const socketService = window.socketService || {
            initialize: () => console.log('Mock socket service initialized'),
            on: (event, callback) => console.log(`Mock socket listening for ${event}`),
            emit: (event, data) => console.log(`Mock socket emitting ${event}:`, data)
        };
        
        // Initialize socket connection
        await socketService.initialize();
        
        // Register listeners for post-related events
        socketService.on('post_interest', (data) => {
            showToast(`${data.username} is interested in your post!`, 'success');
            
            // Update interest count in UI if post is visible
            const postCard = document.querySelector(`.post-card[data-post-id="${data.postId}"]`);
            if (postCard) {
                const statEl = postCard.querySelector('.post-stats .stat-item:first-child span');
                const currentCount = parseInt(statEl.textContent.split(' ')[0]);
                statEl.textContent = `${currentCount + 1} Interested`;
            }
        });
        
        socketService.on('new_comment', (data) => {
            showToast(`${data.username} commented on your post`, 'success');
            
            // Update comment count in UI if post is visible
            const postCard = document.querySelector(`.post-card[data-post-id="${data.postId}"]`);
            if (postCard) {
                const statEl = postCard.querySelector('.post-stats .stat-item:nth-child(2) span');
                const currentCount = parseInt(statEl.textContent.split(' ')[0]);
                statEl.textContent = `${currentCount + 1} Comments`;
                
                // If comments are already visible, add the new comment
                if (data.comment && postCard.querySelector('.post-comments')) {
                    addCommentToUI(postCard, data.comment);
                }
            }
        });
        
        // Store service for later use
        window.socketService = socketService;
        
        console.log('Real-time notification system initialized');
    } catch (error) {
        console.error('Failed to initialize real-time notifications:', error);
    }
}

/**
 * Add a new comment to the UI without refreshing
 */
function addCommentToUI(postCard, comment) {
    const commentsSection = postCard.querySelector('.post-comments');
    const addCommentSection = commentsSection.querySelector('.add-comment');
    
    // Create new comment element
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.innerHTML = `
        <img src="${comment.user.avatar}" alt="${comment.user.username}" class="comment-avatar">
        <div class="comment-content">
            <h4>${comment.user.username} <span>${formatRelativeTime(comment.timestamp)}</span></h4>
            <p>${comment.content}</p>
            <div class="comment-actions">
                <button>Like</button>
                <button>Reply</button>
            </div>
        </div>
    `;
    
    // Insert before the add comment section
    commentsSection.insertBefore(commentEl, addCommentSection);
}

/**
 * Load posts from SQLite database via API
 */
async function loadPosts(append = false, page = 1) {
    const feedElement = document.getElementById('postFeed');
    let loadingElement;
    
    try {
        // Show loading state
        if (!append) {
            feedElement.innerHTML = '<div class="loading-spinner">Loading posts...</div>';
        } else {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading-spinner';
            loadingElement.textContent = 'Loading more posts...';
            feedElement.appendChild(loadingElement);
        }
        
        // In production: API call with pagination for better performance
        // const posts = await getFeedPosts(page, 10);
        const posts = await simulateLoadPosts();
        
        // Remove loading spinner
        const loadingElements = document.querySelectorAll('.loading-spinner');
        loadingElements.forEach(el => el.remove());
        
        if (!append) {
            feedElement.innerHTML = ''; // Clear if not appending
        }
        
        if (posts.length === 0) {
            if (!append) {
                feedElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-stream"></i>
                        <h3>No posts yet</h3>
                        <p>Create a post or follow more users to see posts here</p>
                    </div>
                `;
            } else {
                const noMoreElement = document.createElement('div');
                noMoreElement.className = 'no-more-posts';
                noMoreElement.textContent = 'No more posts to load';
                feedElement.appendChild(noMoreElement);
                
                // Hide load more button
                const loadMoreBtn = document.getElementById('loadMoreBtn');
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
            return;
        }
        
        // Render posts with fragment for better performance
        const fragment = document.createDocumentFragment();
        posts.forEach(post => {
            const postElement = createPostElement(post);
            fragment.appendChild(postElement);
        });
        
        feedElement.appendChild(fragment);
        
        // Setup lazy loading for new images
        setupLazyLoading();
    } catch (error) {
        console.error('Error loading posts:', error);
        
        if (loadingElement) {
            loadingElement.remove();
        }
        
        if (!append) {
            feedElement.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading posts</h3>
                    <p>${error.message || 'Please try again later'}</p>
                    <button class="btn btn-primary retry-btn">Retry</button>
                </div>
            `;
            
            // Add retry button functionality
            const retryBtn = feedElement.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => loadPosts(false, 1));
            }
        } else {
            showToast('Failed to load more posts. Please try again.', 'error');
        }
    }
}

/**
 * Toggle interest in a post (I'm Interested button)
 * Updates the SQLite database and sends Socket.IO notification
 */
async function toggleInterest(postId) {
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    const interestedBtn = postCard.querySelector('.interested-btn');
    const interestedCount = postCard.querySelector('.stat-item:first-child span');
    
    const isInterested = interestedBtn.classList.contains('active');
    
    try {
        // Optimistically update UI for better responsiveness
        interestedBtn.classList.toggle('active');
        const newCount = parseInt(interestedCount.textContent) + (isInterested ? -1 : 1);
        interestedCount.textContent = newCount;
        
        // In production: Update in SQLite database via API
        await simulateToggleInterest(postId, !isInterested);
        
        // In production: Send real-time notification via Socket.IO
        if (!isInterested && window.socketService) {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            window.socketService.emit('post_interest', {
                postId: postId,
                userId: currentUser.id,
                username: currentUser.username
            });
        }
        
        // In production: Send real-time notification via Socket.IO
        if (!isInterested) {
            showToast('You showed interest in this post', 'success');
        }
    } catch (error) {
        // Revert UI on error
        interestedBtn.classList.toggle('active');
        const revertedCount = parseInt(interestedCount.textContent) + (isInterested ? 1 : -1);
        interestedCount.textContent = revertedCount;
        
        console.error('Error toggling interest:', error);
        showToast('Failed to update interest', 'error');
    }
}

/**
 * Share a post using Web Share API or fallback dialog
 */
function sharePost(postId) {
    const postUrl = `${window.location.origin}/post.html?id=${postId}`;
    
    if (navigator.share) {
        // Use Web Share API on supporting browsers (mainly mobile)
        navigator.share({
            title: 'Check out this post on Innovate',
            text: 'I found this interesting post on Innovate!',
            url: postUrl
        }).catch(err => {
            console.error('Error sharing:', err);
            showShareDialog(postUrl);
        });
    } else {
        // Fallback for browsers without Web Share API
        showShareDialog(postUrl);
    }
}

/**
 * Show custom share dialog with social media options and copy link
 */
function showShareDialog(url) {
    createModal('Share this post', `
        <div class="share-options">
            <div class="share-link">
                <input type="text" value="${url}" readonly id="shareUrlInput">
                <button class="btn btn-primary copy-link-btn">Copy Link</button>
            </div>
            <div class="social-share-buttons">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" class="social-share-btn facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}" target="_blank" class="social-share-btn twitter">
                    <i class="fab fa-twitter"></i>
                </a>
                <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}" target="_blank" class="social-share-btn linkedin">
                    <i class="fab fa-linkedin-in"></i>
                </a>
            </div>
        </div>
    `);
    
    // Copy link functionality
    const copyBtn = document.querySelector('.copy-link-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const input = document.getElementById('shareUrlInput');
            input.select();
            document.execCommand('copy');
            showToast('Link copied to clipboard!', 'success');
        });
    }
}

/**
 * Show reminder feature (Gentle Reminder option from 3-dot menu)
 */
function showReminderModal(postId) {
    const modal = document.getElementById('postActionsModal');
    const modalTitle = document.getElementById('actionsModalTitle');
    const modalContent = document.getElementById('actionsModalContent');
    const closeBtn = document.getElementById('closeActionsModal');
    
    modalTitle.textContent = 'Set a Gentle Reminder';
    modalContent.innerHTML = `
        <form id="reminderForm">
            <div class="form-group">
                <label for="reminderDate">Date</label>
                <input type="date" id="reminderDate" name="reminderDate" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label for="reminderTime">Time</label>
                <input type="time" id="reminderTime" name="reminderTime" required>
            </div>
            <div class="form-group">
                <label for="reminderNote">Note (optional)</label>
                <textarea id="reminderNote" name="reminderNote" rows="3" placeholder="Add a note about why you want to be reminded"></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Set Reminder</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    // Handle form submission
    const reminderForm = document.getElementById('reminderForm');
    reminderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dateValue = document.getElementById('reminderDate').value;
        const timeValue = document.getElementById('reminderTime').value;
        const noteValue = document.getElementById('reminderNote').value;
        
        try {
            // In production: Save reminder to database
            await simulateSetReminder(postId, dateValue, timeValue, noteValue);
            showToast('Reminder set successfully!', 'success');
            modal.classList.remove('active');
        } catch (error) {
            console.error('Error setting reminder:', error);
            showToast('Failed to set reminder', 'error');
        }
    });
    
    // Close modal functionality
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

/**
 * Set up post creation modal with Cloudinary integration
 */
function setupCreatePostModal() {
    const openModalBtn = document.getElementById('openCreatePostModal');
    const photoVideoBtn = document.getElementById('photoVideoBtn');
    const modal = document.getElementById('createPostModal');
    const closeModalBtn = document.getElementById('closePostModal');
    const submitBtn = document.getElementById('submitPost');
    const fileInput = document.getElementById('fileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addDocBtn = document.getElementById('addDocBtn');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagsContainer = document.getElementById('tagsContainer');
    const tagInput = document.getElementById('tagInput');
    const tagsList = document.getElementById('tagsList');
    
    // Arrays to track post data
    let postTags = [];
    let uploadedFiles = [];
    
    // Open modal behaviors
    [openModalBtn, photoVideoBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                
                // If photo button was clicked, directly open file selector
                if (btn === photoVideoBtn) {
                    fileInput.click();
                }
            });
        }
    });
    
    // Close modal and clear form
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            clearPostForm();
        });
        
        // Close when clicking outside modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                clearPostForm();
            }
        });
    }
    
    // File input handling for images/videos with Cloudinary integration
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            handleFileSelection(fileInput.files);
        });
    }
    
    // Media attachment buttons
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', () => {
            fileInput.accept = 'image/*';
            fileInput.click();
        });
    }
    
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', () => {
            fileInput.accept = 'video/*';
            fileInput.click();
        });
    }
    
    if (addDocBtn) {
        addDocBtn.addEventListener('click', () => {
            fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx';
            fileInput.click();
        });
    }
    
    // Tags functionality
    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
            tagsContainer.style.display = tagsContainer.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    if (tagInput) {
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tagValue = tagInput.value.trim();
                
                if (tagValue && !postTags.includes(tagValue)) {
                    addTag(tagValue);
                    tagInput.value = '';
                }
            }
        });
    }
    
    // Submit post with Cloudinary uploads
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const postContent = document.getElementById('postContent').value;
            const postVisibility = document.getElementById('postVisibility').value;
            
            if (!postContent.trim()) {
                showToast('Post content cannot be empty', 'error');
                return;
            }
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Posting...';
                
                // 1. Upload images to Cloudinary
                let uploadedImageUrls = [];
                if (uploadedFiles.length > 0) {
                    uploadedImageUrls = await simulateCloudinaryUpload(uploadedFiles);
                    // In production:
                    // const uploadResult = await uploadToCloudinary(uploadedFiles);
                    // uploadedImageUrls = uploadResult.secure_urls;
                }
                
                // 2. Create post in SQLite database
                const newPostData = {
                    content: postContent,
                    visibility: postVisibility,
                    tags: postTags,
                    images: uploadedImageUrls
                };
                
                // In production: use db-service.js
                // const result = await createPost(newPostData);
                await simulateCreatePost(newPostData);
                
                showToast('Post created successfully!', 'success');
                modal.classList.remove('active');
                clearPostForm();
                
                // Refresh the feed to show the new post
                loadPosts();
            } catch (error) {
                console.error('Error creating post:', error);
                showToast('Failed to create post. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post';
            }
        });
    }
    
    // Helper functions
    function addTag(tag) {
        // Turn into a hashtag if it doesn't start with #
        const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
        postTags.push(formattedTag);
        
        const tagEl = document.createElement('div');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            <span>${formattedTag}</span>
            <button type="button" class="remove-tag" data-tag="${formattedTag}">&times;</button>
        `;
        tagsList.appendChild(tagEl);
        
        tagEl.querySelector('.remove-tag').addEventListener('click', (e) => {
            const tagToRemove = e.target.dataset.tag;
            postTags = postTags.filter(t => t !== tagToRemove);
            tagEl.remove();
        });
    }
    
    function handleFileSelection(files) {
        if (!files.length) return;
        
        Array.from(files).forEach(file => {
            // Validate file size (Cloudinary free tier limit is 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size exceeds 10MB limit', 'error');
                return;
            }
            
            // Store file for Cloudinary upload
            uploadedFiles.push(file);
            
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'upload-item';
                
                let previewContent = '';
                
                if (file.type.startsWith('image/')) {
                    previewContent = `<img src="${e.target.result}" alt="Image Preview">`;
                } else if (file.type.startsWith('video/')) {
                    previewContent = `<div class="video-preview"><i class="fas fa-film"></i><span>${file.name}</span></div>`;
                } else {
                    previewContent = `<div class="document-preview"><i class="fas fa-file"></i><span>${file.name}</span></div>`;
                }
                
                previewItem.innerHTML = `
                    ${previewContent}
                    <button type="button" class="remove-upload" data-index="${uploadedFiles.length - 1}">&times;</button>
                `;
                
                uploadPreview.appendChild(previewItem);
                
                // Add remove button functionality
                previewItem.querySelector('.remove-upload').addEventListener('click', () => {
                    const dataIndex = parseInt(previewItem.querySelector('.remove-upload').dataset.index);
                    uploadedFiles = uploadedFiles.filter((_, i) => i !== dataIndex);
                    previewItem.remove();
                });
            };
            
            fileReader.readAsDataURL(file);
        });
    }
    
    function clearPostForm() {
        document.getElementById('postContent').value = '';
        document.getElementById('postVisibility').value = 'public';
        uploadPreview.innerHTML = '';
        tagsContainer.style.display = 'none';
        tagsList.innerHTML = '';
        postTags = [];
        uploadedFiles = [];
    }
}

/**
 * Create a DOM element for a post with lazy-loaded images
 */
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    postElement.dataset.postId = post.id;
    
    // For images, implement lazy loading 
    const imagesHTML = post.images && post.images.length > 0 ? 
        `<div class="post-images">
            ${post.images.map(image => `
                <img 
                    src="assets/images/placeholder.svg" 
                    data-src="${image}" 
                    alt="Post image" 
                    class="lazy-load-image"
                    loading="lazy"
                >
            `).join('')}
        </div>` : '';
    
    // Format tags
    const tagsHTML = post.tags && post.tags.length > 0 ?
        `<div class="post-tags">
            ${post.tags.map(tag => `<span>${tag}</span>`).join('')}
        </div>` : '';
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <img src="${post.user.avatar}" alt="${post.user.username}" class="post-avatar">
                <div class="post-user-info">
                    <h4>${post.user.username}</h4>
                    <span>${post.user.role || ''}</span>
                </div>
            </div>
            <div class="post-options">
                <button class="btn-icon"><i class="fas fa-ellipsis-h"></i></button>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${imagesHTML}
            ${tagsHTML}
        </div>
        <div class="post-stats">
            <div class="stat-item">
                <i class="fas fa-heart"></i>
                <span>${post.interestedCount} Interested</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-comment"></i>
                <span>${post.commentCount} Comments</span>
            </div>
        </div>
        <div class="post-actions">
            <button class="post-action-button interested-btn ${post.userInterested ? 'active' : ''}">
                <i class="${post.userInterested ? 'fas' : 'far'} fa-heart"></i>
                <span>I'm Interested</span>
            </button>
            <button class="post-action-button contact-btn">
                <i class="fas fa-handshake"></i>
                <span>Contact Me</span>
            </button>
            <button class="post-action-button share-btn">
                <i class="fas fa-share"></i>
                <span>Share</span>
            </button>
        </div>
        <div class="post-comments">
            ${post.comments.map(comment => `
                <div class="comment">
                    <img src="${comment.user.avatar}" alt="${comment.user.username}" class="comment-avatar">
                    <div class="comment-content">
                        <h4>${comment.user.username} <span>${formatRelativeTime(comment.timestamp)}</span></h4>
                        <p>${comment.content}</p>
                    </div>
                </div>
            `).join('')}
            <div class="add-comment">
                <img src="${(JSON.parse(localStorage.getItem('user') || '{}')).avatar || 'assets/images/avatars/default.png'}" alt="Your Avatar" class="comment-avatar">
                <div class="comment-input-container">
                    <input type="text" placeholder="Add a comment...">
                    <button><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    
    return postElement;
}

/**
 * Setup lazy loading for post images
 * Uses Intersection Observer API for better performance
 */
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy-load-image');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        document.querySelectorAll('.lazy-load-image').forEach(image => {
            lazyImageObserver.observe(image);
        });
    } else {
        // Fallback for browsers without Intersection Observer support
        document.querySelectorAll('.lazy-load-image').forEach(image => {
            image.src = image.dataset.src;
            image.classList.remove('lazy-load-image');
        });
    }
}

/**
 * Handle adding comments with Socket.IO notification
 */
async function handleAddComment(event, postId) {
    if (event.key !== 'Enter') return;
    
    const commentText = event.target.value.trim();
    if (!commentText) return;
    
    try {
        // In production: Save comment to SQLite database
        const newComment = await simulateAddComment(postId, commentText);
        
        // Add comment to UI
        const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
        addCommentToUI(postCard, newComment);
        
        // Clear input
        event.target.value = '';
        
        // Notify via Socket.IO in production
        if (window.socketService) {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            window.socketService.emit('new_comment', {
                postId: postId,
                userId: currentUser.id,
                username: currentUser.username,
                comment: {
                    user: currentUser,
                    content: commentText,
                    timestamp: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showToast('Failed to add comment', 'error');
    }
}

/**
 * Handle edit post functionality (post owner only)
 */
async function handleEditPost(postId) {
    try {
        // First get the post data
        // In production: Fetch from SQLite database via API
        const post = await simulateGetPostById(postId);
        
        // Create modal with edit form
        createModal('Edit Post', `
            <form id="editPostForm">
                <div class="post-content-editor">
                    <textarea id="editPostContent" placeholder="What's on your mind?">${post.content}</textarea>
                </div>
                <div id="editUploadPreview" class="post-upload-preview">
                    ${post.images ? post.images.map((img, index) => `
                        <div class="upload-item">
                            <img src="${img}" alt="Post image">
                            <button type="button" class="remove-upload" data-index="${index}">&times;</button>
                        </div>
                    `).join('') : ''}
                </div>
                <div class="post-options-row">
                    <div class="post-options-icons">
                        <button type="button" class="post-option-btn" id="editAddPhotoBtn">
                            <i class="fas fa-image"></i>
                            <span>Add Photo</span>
                        </button>
                    </div>
                    <div>
                        <select id="editPostVisibility">
                            <option value="public" ${post.visibility === 'public' ? 'selected' : ''}>Public</option>
                            <option value="connections" ${post.visibility === 'connections' ? 'selected' : ''}>Connections Only</option>
                            <option value="private" ${post.visibility === 'private' ? 'selected' : ''}>Private</option>
                        </select>
                    </div>
                </div>
                <input type="file" id="editFileInput" accept="image/*" style="display: none;">
            </form>
        `, async () => {
            const editedContent = document.getElementById('editPostContent').value;
            const editedVisibility = document.getElementById('editPostVisibility').value;
            
            if (!editedContent.trim()) {
                showToast('Post content cannot be empty', 'error');
                return;
            }
            
            try {
                // In production: Update post in SQLite database via API
                await simulateUpdatePost(postId, {
                    content: editedContent,
                    visibility: editedVisibility
                });
                
                // Update the post in the UI
                const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
                const contentElement = postCard.querySelector('.post-content p');
                contentElement.textContent = editedContent;
                
                showToast('Post updated successfully!', 'success');
            } catch (error) {
                console.error('Error updating post:', error);
                showToast('Failed to update post', 'error');
            }
        }, 'Update Post');
        
        // Setup file upload for editing
        const editFileInput = document.getElementById('editFileInput');
        const editAddPhotoBtn = document.getElementById('editAddPhotoBtn');
        
        if (editAddPhotoBtn && editFileInput) {
            editAddPhotoBtn.addEventListener('click', () => {
                editFileInput.click();
            });
            
            editFileInput.addEventListener('change', () => {
                if (editFileInput.files && editFileInput.files.length > 0) {
                    const preview = document.getElementById('editUploadPreview');
                    
                    Array.from(editFileInput.files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const previewItem = document.createElement('div');
                            previewItem.className = 'upload-item';
                            previewItem.innerHTML = `
                                <img src="${e.target.result}" alt="New image">
                                <button type="button" class="remove-upload">&times;</button>
                            `;
                            preview.appendChild(previewItem);
                            
                            previewItem.querySelector('.remove-upload').addEventListener('click', () => {
                                previewItem.remove();
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                }
            });
        }
        
    } catch (error) {
        console.error('Error preparing edit form:', error);
        showToast('Failed to load post data', 'error');
    }
}

/**
 * Handle archive post functionality (post owner only)
 * Archives post in SQLite database but keeps it accessible to owner
 */
function handleArchivePost(postId) {
    createModal('Archive Post', `
        <p>Are you sure you want to archive this post? It will be removed from your feed but you can access it later from your archived posts.</p>
    `, async () => {
        try {
            // In production: Call API to update archive status in SQLite
            await simulateArchivePost(postId);
            
            // Remove post from UI with smooth animation
            const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
            if (postCard) {
                postCard.style.opacity = '0';
                postCard.style.transform = 'translateY(-10px)';
                postCard.style.transition = 'opacity 0.3s, transform 0.3s';
                
                setTimeout(() => {
                    postCard.remove();
                }, 300);
            }
            
            showToast('Post archived successfully', 'success');
        } catch (error) {
            console.error('Error archiving post:', error);
            showToast('Failed to archive post', 'error');
        }
    }, 'Archive Post');
}

/**
 * Handle delete post functionality (post owner only)
 * Permanently removes post from SQLite database
 */
function handleDeletePost(postId) {
    createModal('Delete Post', `
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        <p class="text-danger"><strong>Warning:</strong> All comments and interactions will be permanently removed.</p>
    `, async () => {
        try {
            // In production: Delete post from SQLite database via API
            await simulateDeletePost(postId);
            
            // Remove post from UI with animation
            const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
            if (postCard) {
                postCard.style.opacity = '0';
                postCard.style.transform = 'translateY(-10px)';
                postCard.style.transition = 'opacity 0.3s, transform 0.3s';
                
                setTimeout(() => {
                    postCard.remove();
                }, 300);
            }
            
            showToast('Post deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting post:', error);
            showToast('Failed to delete post', 'error');
        }
    }, 'Delete Post');
}

/**
 * Handle saving post (3-dot menu option for viewers)
 * Saves post reference in SQLite database for later viewing
 */
async function handleSavePost(postId) {
    try {
        // In production: API call to add post to user's saved items
        const result = await simulateSavePost(postId);
        if (result.success) {
            showToast('Post saved to your bookmarks!', 'success');
        }
    } catch (error) {
        console.error('Error saving post:', error);
        showToast('Failed to save post', 'error');
    }
}

/**
 * Handle reporting posts (3-dot menu)
 * Submits report to moderators
 */
function handleReportPost(postId) {
    createModal('Report Post', `
        <form id="reportForm">
            <div class="form-group">
                <label for="reportReason">Why are you reporting this post?</label>
                <select id="reportReason" name="reportReason" required>
                    <option value="" disabled selected>Select a reason</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">False information</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="reportDetails">Additional details (optional)</label>
                <textarea id="reportDetails" name="reportDetails" rows="3"></textarea>
            </div>
        </form>
    `, async () => {
        const reason = document.getElementById('reportReason').value;
        const details = document.getElementById('reportDetails').value;
        
        if (!reason) {
            showToast('Please select a reason for reporting', 'error');
            return;
        }
        
        try {
            // In production: Send report to server, store in SQLite
            await simulateReportPost(postId, reason, details);
            showToast('Thank you for your report. We\'ll review it shortly.', 'success');
        } catch (error) {
            console.error('Error reporting post:', error);
            showToast('Failed to submit report', 'error');
        }
    }, 'Submit Report');
}

/**
 * Set up load more functionality for pagination
 */
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    // Track current page
    let currentPage = 1;
    
    loadMoreBtn.addEventListener('click', async () => {
        // Update UI to show loading state
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
        
        try {
            currentPage++;
            // In production: Get next page from SQLite database via API
            // await loadPosts(true, currentPage);
            await loadPosts(true);
            
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Posts';
        } catch (error) {
            console.error('Error loading more posts:', error);
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Try Again';
            showToast('Failed to load more posts', 'error');
        }
    });
}

/**
 * Setup sidebar interactions
 */
function setupSidebarInteractions() {
    // Follow buttons for suggested users
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.dataset.userId;
            const isFollowing = btn.classList.contains('btn-primary');
            
            try {
                // Optimistic UI update
                if (isFollowing) {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline');
                    btn.textContent = 'Follow';
                } else {
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-outline');
                    btn.textContent = 'Following';
                    showToast('You are now following this user', 'success');
                }
                
                // In production: Update following status in SQLite database
                await simulateToggleFollow(userId, !isFollowing);
            } catch (error) {
                console.error('Error updating follow state:', error);
                showToast('Failed to update', 'error');
                
                // Revert UI on error
                btn.classList.toggle('btn-primary');
                btn.classList.toggle('btn-outline');
                btn.textContent = isFollowing ? 'Following' : 'Follow';
            }
        });
    });
    
    // Join community buttons
    document.querySelectorAll('.join-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const communityId = btn.dataset.communityId;
            const isJoined = btn.classList.contains('btn-primary');
            
            try {
                // Optimistic UI update
                if (isJoined) {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline');
                    btn.textContent = 'Join';
                } else {
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-outline');
                    btn.textContent = 'Joined';
                    showToast('You joined the community!', 'success');
                }
                
                // In production: Update membership in SQLite database
                await simulateToggleJoinCommunity(communityId, !isJoined);
            } catch (error) {
                console.error('Error updating community membership:', error);
                showToast('Failed to update', 'error');
                
                // Revert UI on error
                btn.classList.toggle('btn-primary');
                btn.classList.toggle('btn-outline');
                btn.textContent = isJoined ? 'Joined' : 'Join';
            }
        });
    });
}

/**
 * Enable event delegation for better performance
 * Instead of attaching event listeners to each button,
 * we use event delegation on the parent element
 */
function enableEventDelegation() {
    const postFeed = document.getElementById('postFeed');
    if (!postFeed) return;
    
    postFeed.addEventListener('click', (e) => {
        // Interested button delegation
        const interestedBtn = e.target.closest('.interested-btn');
        if (interestedBtn) {
            e.preventDefault();
            const postId = interestedBtn.closest('.post-card').dataset.postId;
            toggleInterest(postId);
            return;
        }
        
        // Contact button delegation
        const contactBtn = e.target.closest('.contact-btn');
        if (contactBtn) {
            e.preventDefault();
            const postId = contactBtn.closest('.post-card').dataset.postId;
            showMeetingModal(postId);
            return;
        }
        
        // Share button delegation
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            e.preventDefault();
            const postId = shareBtn.closest('.post-card').dataset.postId;
            sharePost(postId);
            return;
        }
        
        // Post options delegation
        const optionsBtn = e.target.closest('.post-options button');
        if (optionsBtn) {
            e.preventDefault();
            const postId = optionsBtn.closest('.post-card').dataset.postId;
            showPostOptions(postId);
            return;
        }
    });
}

// Additional simulation functions to support the new functionality
async function simulateCreateMeeting(postId, title, type, dateTime) {
    return new Promise(resolve => {
        setTimeout(() => resolve({ 
            success: true, 
            meetingId: Date.now().toString(),
            meetingLink: type !== 'in-person' ? 'https://meet.innovate.com/' + Math.random().toString(36).substring(7) : null
        }), 1000);
    });
}

async function simulateSavePost(postId) {
    return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 500);
    });
}

async function simulateReportPost(postId, reason, details) {
    return new Promise(resolve => {
        setTimeout(() => resolve({ 
            success: true,
            reportId: Date.now().toString(),
            message: 'Report submitted successfully'
        }), 800);
    });
}

/**
 * Show meeting modal for "Contact Me" button
 * Allows users to schedule an instant meeting with post owner
 */
function showMeetingModal(postId) {
    const modal = document.getElementById('postActionsModal');
    const modalTitle = document.getElementById('actionsModalTitle');
    const modalContent = document.getElementById('actionsModalContent');
    const closeBtn = document.getElementById('closeActionsModal');
    
    modalTitle.textContent = 'Create an Instant Meeting';
    modalContent.innerHTML = `
        <form id="meetingForm">
            <div class="form-group">
                <label for="meetingTitle">Meeting Title</label>
                <input type="text" id="meetingTitle" name="meetingTitle" required>
            </div>
            <div class="form-group">
                <label for="meetingType">Meeting Type</label>
                <select id="meetingType" name="meetingType" required>
                    <option value="video">Video Meeting</option>
                    <option value="audio">Audio Only</option>
                    <option value="in-person">In-Person</option>
                </select>
            </div>
            <div class="form-group">
                <label for="meetingTime">When</label>
                <select id="meetingTime" name="meetingTime" required>
                    <option value="now">Right Now</option>
                    <option value="15min">In 15 minutes</option>
                    <option value="30min">In 30 minutes</option>
                    <option value="1hour">In 1 hour</option>
                    <option value="custom">Custom time</option>
                </select>
            </div>
            <div id="customTimeSection" style="display:none;">
                <div class="form-group">
                    <label for="customDate">Date</label>
                    <input type="date" id="customDate" name="customDate" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="customTime">Time</label>
                    <input type="time" id="customTime" name="customTime">
                </div>
            </div>
            <div class="form-group">
                <label for="meetingAgenda">Agenda (optional)</label>
                <textarea id="meetingAgenda" name="meetingAgenda" rows="3" placeholder="Brief description of what you want to discuss"></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Create Meeting</button>
        </form>
    `;
    
    modal.classList.add('active');
    
    // Setup custom time toggle
    const meetingTimeSelect = document.getElementById('meetingTime');
    const customTimeSection = document.getElementById('customTimeSection');
    meetingTimeSelect.addEventListener('change', () => {
        customTimeSection.style.display = meetingTimeSelect.value === 'custom' ? 'block' : 'none';
    });
    
    // Handle form submission
    const meetingForm = document.getElementById('meetingForm');
    meetingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('meetingTitle').value;
        const type = document.getElementById('meetingType').value;
        const timeOption = document.getElementById('meetingTime').value;
        const agenda = document.getElementById('meetingAgenda').value;
        
        let meetingDateTime;
        if (timeOption === 'custom') {
            const customDate = document.getElementById('customDate').value;
            const customTime = document.getElementById('customTime').value;
            if (!customDate || !customTime) {
                showToast('Please set date and time for the meeting', 'error');
                return;
            }
            meetingDateTime = `${customDate}T${customTime}`;
        } else {
            const now = new Date();
            
            switch(timeOption) {
                case 'now':
                    meetingDateTime = now.toISOString();
                    break;
                case '15min':
                    now.setMinutes(now.getMinutes() + 15);
                    meetingDateTime = now.toISOString();
                    break;
                case '30min':
                    now.setMinutes(now.getMinutes() + 30);
                    meetingDateTime = now.toISOString();
                    break;
                case '1hour':
                    now.setHours(now.getHours() + 1);
                    meetingDateTime = now.toISOString();
                    break;
                default:
                    meetingDateTime = now.toISOString();
            }
        }
        
        try {
            // Show loading state
            const submitBtn = meetingForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            
            // In production: Store meeting in SQLite database and send Socket.IO notification
            const result = await simulateCreateMeeting(postId, {
                title,
                type,
                dateTime: meetingDateTime,
                agenda
            });
            
            modal.classList.remove('active');
            
            if (result.meetingLink) {
                showMeetingSuccessModal(result.meetingLink, meetingDateTime, type);
            } else {
                showToast('Meeting invitation sent! Check your calendar.', 'success');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            showToast('Failed to create meeting', 'error');
        }
    });
    
    // Close modal functionality
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

/**
 * Show success modal after creating a meeting
 */
function showMeetingSuccessModal(meetingLink, meetingDateTime, type) {
    createModal('Meeting Created Successfully', `
        <div class="meeting-success">
            <div class="meeting-success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <p class="meeting-success-message">Your meeting has been created and an invitation has been sent to the post owner.</p>
            
            ${type !== 'in-person' ? `
                <div class="meeting-link-container">
                    <h4>Meeting Link:</h4>
                    <div class="meeting-link">
                        <input type="text" value="${meetingLink}" readonly id="meetingLinkInput">
                        <button class="btn btn-sm btn-primary copy-link-btn">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <div class="meeting-time">
                <h4>Scheduled for:</h4>
                <p>${formatMeetingDateTime(meetingDateTime)}</p>
            </div>
            
            <div class="meeting-buttons">
                ${type !== 'in-person' ? `
                    <a href="${meetingLink}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-${type === 'video' ? 'video' : 'phone'}"></i>
                        ${type === 'video' ? 'Join Video Call' : 'Join Audio Call'}
                    </a>
                ` : ''}
                <a href="#" class="btn btn-outline" onclick="closeModal()">Done</a>
            </div>
        </div>
    `);
    
    // Setup copy button functionality
    const copyBtn = document.querySelector('.copy-link-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const linkInput = document.getElementById('meetingLinkInput');
            linkInput.select();
            document.execCommand('copy');
            showToast('Meeting link copied to clipboard!', 'success');
        });
    }
}

/**
 * Format meeting date time for display
 */
function formatMeetingDateTime(dateTimeStr) {
    const dateTime = new Date(dateTimeStr);
    
    // Format date: e.g., "Tue, Mar 15, 2023"
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = dateTime.toLocaleDateString(undefined, dateOptions);
    
    // Format time: e.g., "3:00 PM"
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeStr = dateTime.toLocaleTimeString(undefined, timeOptions);
    
    return `${dateStr} at ${timeStr}`;
}

/**
 * Show post options menu (3-dot menu)
 */
function showPostOptions(postId) {
    // Get post to determine if current user is the owner
    simulateGetPostById(postId).then(post => {
        // Get current user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isOwner = currentUser.id === post.userId;
        
        // Show different options based on ownership
        createModal('Post Options', `
            <button class="btn btn-outline btn-block" onclick="handleSavePost(${postId})">
                <i class="fas fa-bookmark"></i> Save Post
            </button>
            
            ${!isOwner ? `
                <button class="btn btn-outline btn-block" onclick="showReminderModal(${postId})">
                    <i class="fas fa-clock"></i> Set Gentle Reminder
                </button>
                <button class="btn btn-outline btn-block" onclick="handleReportPost(${postId})">
                    <i class="fas fa-flag"></i> Report Post
                </button>
            ` : `
                <button class="btn btn-outline btn-block" onclick="handleEditPost(${postId})">
                    <i class="fas fa-edit"></i> Edit Post
                </button>
                <button class="btn btn-outline btn-block" onclick="handleArchivePost(${postId})">
                    <i class="fas fa-archive"></i> Archive Post
                </button>
                <button class="btn btn-outline btn-block text-danger" onclick="handleDeletePost(${postId})">
                    <i class="fas fa-trash"></i> Delete Post
                </button>
            `}
        `);
    }).catch(error => {
        console.error('Error getting post:', error);
        showToast('Failed to load post options', 'error');
    });
}

/**
 * Simulation of creating a meeting
 * In production, this would create an entry in the meetings table
 */
async function simulateCreateMeeting(postId, meetingData) {
    return new Promise(resolve => {
        setTimeout(() => {
            const meetingId = Date.now().toString();
            let meetingLink = null;
            
            // Generate meeting link for video/audio meetings
            if (meetingData.type === 'video' || meetingData.type === 'audio') {
                meetingLink = `https://meet.innovate.com/m/${meetingId}`;
            }
            
            resolve({
                success: true,
                meetingId,
                meetingLink
            });
        }, 1500);
    });
}

/**
 * Simulation of getting post by ID
 * In production, this would fetch from SQLite database
 */
async function simulateGetPostById(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Generate a fake post with the given ID
            resolve({
                id: postId,
                content: 'This is a simulated post content for post ID ' + postId,
                userId: postId % 2 === 0 ? 1 : 2, // For testing ownership
                visibility: 'public',
                images: [],
                timestamp: new Date().toISOString(),
                user: {
                    id: postId % 2 === 0 ? 1 : 2,
                    username: postId % 2 === 0 ? 'You' : 'Sarah',
                    avatar: 'assets/images/avatars/default.png'
                }
            });
        }, 300);
    });
}

/**
 * Initialize notification service
 */
async function initializeNotifications() {
    // In production, import the notification service
    // import notificationService from './notification-service.js';
    
    try {
        // For simulation, check if it's already defined
        if (!window.notificationService) {
            // Create a simple mock if not imported
            window.notificationService = {
                initialize: async () => true,
                getUnreadCount: () => Math.floor(Math.random() * 5),
                addEventListener: () => {},
                addNotification: () => {}
            };
        }
        
        await window.notificationService.initialize();
        
        // Update notification badge count
        const unreadCount = window.notificationService.getUnreadCount();
        updateNotificationBadge(unreadCount);
        
        // Listen for new notifications
        window.notificationService.addEventListener('new', () => {
            const count = window.notificationService.getUnreadCount();
            updateNotificationBadge(count);
        });
    } catch (error) {
        console.error('Failed to initialize notifications:', error);
    }
}

/**
 * Update notification badge in the navbar
 */
function updateNotificationBadge(count) {
    const badge = document.querySelector('.navbar-icon-button .notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the feed
    loadPosts();
    
    // Setup post creation modal
    setupCreatePostModal();
    
    // Setup post interaction events
    setupPostInteractions();
    
    // Setup load more functionality
    setupLoadMore();
    
    // Setup sidebar interactions
    setupSidebarInteractions();
    
    // Initialize Socket.IO for real-time notifications
    initializeRealTimeNotifications();
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Enable performance optimization for post interactions
    enableEventDelegation();
    
    // Initialize notification service
    initializeNotifications();
});