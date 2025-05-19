/**
 * Simple Post Management - v2
 * A minimalist implementation focused on core functionality
 */

// Mark script as loaded for diagnostics
window.isPostsScriptLoaded = true;

(function() {
    // Debug logging
    const debug = true;
    
    function log(message) {
        if (debug) {
            console.log(`[Posts v2] ${message}`);
        }
    }
    
    log('Simple Posts script initialized at ' + new Date().toISOString());
    
    // DOM Elements
    const postForm = document.getElementById('post-form');
    const postContainer = document.getElementById('posts-container');
    const feedSwitchers = document.querySelectorAll('.feed-switcher');
    
    // Authentication check
    function isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }
    
    // Event Listeners
    document.addEventListener('DOMContentLoaded', function() {
        log('DOM loaded, setting up handlers');
        
        // Setup post form if it exists
        if (postForm) {
            log('Setting up post form');
            postForm.addEventListener('submit', handlePostSubmission);
        }
        
        // Setup feed switchers if they exist
        if (feedSwitchers.length > 0) {
            log(`Found ${feedSwitchers.length} feed switchers`);
            feedSwitchers.forEach(switcher => {
                switcher.addEventListener('click', handleFeedSwitch);
            });
        }
        
        // Auto-load posts if container exists
        if (postContainer) {
            log('Loading posts automatically');
            loadPosts('all');
        }
    });
    
    // Handle post submission
    function handlePostSubmission(e) {
        e.preventDefault();
        log('Post form submitted');
        
        if (!isAuthenticated()) {
            showAlert('You must be logged in to create a post', 'error');
            return;
        }
        
        const content = document.getElementById('post-content').value.trim();
        if (!content) {
            showAlert('Please enter some content for your post', 'error');
            return;
        }
        
        const submitButton = postForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Posting...';
        
        // Create the post
        createPost(content)
            .then(post => {
                log(`Post created successfully with ID: ${post.id}`);
                document.getElementById('post-content').value = '';
                
                if (postContainer) {
                    // Add the new post to the top of the feed
                    const postHtml = renderPost(post);
                    postContainer.insertAdjacentHTML('afterbegin', postHtml);
                    initializePostActions(post.id);
                }
                
                showAlert('Post created successfully!', 'success');
            })
            .catch(error => {
                log(`Error creating post: ${error.message}`);
                showAlert(error.message || 'Failed to create post', 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Post';
            });
    }
    
    // Handle feed switch
    function handleFeedSwitch(e) {
        e.preventDefault();
        
        const feedType = this.getAttribute('data-feed') || 'all';
        log(`Switching feed to: ${feedType}`);
        
        // Update UI state
        feedSwitchers.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        
        // Load the selected feed
        loadPosts(feedType);
    }
    
    // API Functions
    function createPost(content) {
        log('Sending post creation request to server');
        
        return fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        })
        .then(response => {
            log(`Server responded with status: ${response.status}`);
            
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to create post');
                });
            }
            
            return response.json();
        });
    }
    
    function loadPosts(feedType = 'all') {
        if (!isAuthenticated()) {
            showAlert('You must be logged in to view posts', 'error');
            return;
        }
        
        log(`Loading posts for feed: ${feedType}`);
        
        if (postContainer) {
            postContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        }
        
        // Add console debugging
        console.log(`[Posts] Sending fetch to /api/posts?feed=${feedType}`);
        console.log(`[Posts] Using token: ${localStorage.getItem('token')?.substring(0, 15)}...`);
        
        return fetch(`/api/posts?feed=${feedType}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            console.log(`[Posts] Server responded with status: ${response.status}`);
            
            if (!response.ok) {
                return response.text().then(text => {
                    console.error(`[Posts] Error response body: ${text}`);
                    try {
                        return Promise.reject(JSON.parse(text));
                    } catch (e) {
                        return Promise.reject({ message: text || 'Failed to load posts' });
                    }
                });
            }
            
            return response.text().then(text => {
                console.log(`[Posts] Received data length: ${text.length} characters`);
                try {
                    const data = JSON.parse(text);
                    console.log(`[Posts] Successfully parsed ${data.length || 0} posts`);
                    return data;
                } catch (e) {
                    console.error(`[Posts] JSON parse error: ${e.message}`);
                    console.error(`[Posts] Response text: ${text.substring(0, 100)}...`);
                    throw new Error('Invalid response format');
                }
            });
        })
        .then(posts => {
            log(`Loaded ${posts.length} posts`);
            
            if (postContainer) {
                if (posts.length === 0) {
                    postContainer.innerHTML = `
                        <div class="no-posts">
                            <p>No posts found. ${feedType === 'following' ? 'Follow some users to see their posts here.' : 'Be the first to post!'}</p>
                        </div>
                    `;
                    return;
                }
                
                postContainer.innerHTML = '';
                posts.forEach(post => {
                    const postHtml = renderPost(post);
                    postContainer.insertAdjacentHTML('beforeend', postHtml);
                    initializePostActions(post.id);
                });
            }
        })
        .catch(error => {
            console.error(`[Posts] Error loading posts:`, error);
            
            if (postContainer) {
                postContainer.innerHTML = `
                    <div class="error">
                        <p>Failed to load posts: ${error.message || 'Unknown error'}</p>
                        <p>Details: ${JSON.stringify(error)}</p>
                        <button id="retry-load-posts" class="btn primary-btn">Retry</button>
                    </div>
                `;
                
                document.getElementById('retry-load-posts')?.addEventListener('click', () => {
                    loadPosts(feedType);
                });
            }
        });
    }
    
    function toggleInterest(postId) {
        if (!isAuthenticated()) {
            showAlert('You must be logged in to interact with posts', 'error');
            return;
        }
        
        log(`Toggling interest for post: ${postId}`);
        
        return fetch(`/api/posts/${postId}/interest`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to update interest');
                });
            }
            
            return response.json();
        })
        .then(data => {
            log(`Interest toggled successfully. New count: ${data.interestedCount}`);
            
            const interestBtn = document.querySelector(`.interest-btn[data-post-id="${postId}"]`);
            if (interestBtn) {
                const countEl = interestBtn.querySelector('.interest-count');
                if (countEl) {
                    countEl.textContent = data.interestedCount;
                }
                
                if (data.interested) {
                    interestBtn.classList.add('interested');
                } else {
                    interestBtn.classList.remove('interested');
                }
            }
        })
        .catch(error => {
            log(`Error toggling interest: ${error.message}`);
            showAlert('Failed to update interest', 'error');
        });
    }
    
    // UI Functions
    function renderPost(post) {
        const date = new Date(post.created_at);
        const formattedDate = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <span class="post-author">${post.username || 'Anonymous'}</span>
                    <span class="post-date">${formattedDate}</span>
                </div>
                <div class="post-content">${post.content}</div>
                ${post.image_url ? `<div class="post-image"><img src="${post.image_url}" alt="Post image"></div>` : ''}
                <div class="post-actions">
                    <button class="interest-btn ${post.is_interested ? 'interested' : ''}" data-post-id="${post.id}">
                        <i class="fas fa-lightbulb"></i> 
                        <span class="interest-count">${post.interested_users ? post.interested_users.length : 0}</span>
                    </button>
                    ${post.is_owner ? `<button class="delete-post-btn" data-post-id="${post.id}">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
        `;
    }
    
    function initializePostActions(postId) {
        // Set up interest button
        const interestBtn = document.querySelector(`.interest-btn[data-post-id="${postId}"]`);
        if (interestBtn) {
            interestBtn.addEventListener('click', function() {
                toggleInterest(postId);
            });
        }
        
        // Set up delete button
        const deleteBtn = document.querySelector(`.delete-post-btn[data-post-id="${postId}"]`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this post?')) {
                    // Implementation for delete post would go here
                    log(`Delete post: ${postId} (not implemented)`);
                }
            });
        }
    }
    
    function showAlert(message, type = 'info') {
        // Create alert container if it doesn't exist
        let alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.className = 'alert-container';
            document.body.appendChild(alertContainer);
        }
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            ${message}
            <button class="alert-close">&times;</button>
        `;
        
        // Add event listener to close button
        alert.querySelector('.alert-close').addEventListener('click', function() {
            alertContainer.removeChild(alert);
        });
        
        // Add to container
        alertContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode === alertContainer) {
                alertContainer.removeChild(alert);
            }
        }, 5000);
    }
})();
