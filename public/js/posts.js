document.addEventListener('DOMContentLoaded', function() {
    console.log('Posts script loaded and running');
    
    // Check if we're on a page that displays posts
    const postContainer = document.getElementById('posts-container');
    const postForm = document.getElementById('post-form');
    
    // Initialize post scheduler (will be hidden by default)
    let scheduleDate = null;
    let showScheduler = false;
    
    if (postContainer) {
        console.log('Post container found with ID:', postContainer.id);
        // Load posts by default with 'all' feed type
        loadPosts('all');
        
        // Set up feed type switchers if they exist
        const feedSwitchers = document.querySelectorAll('.feed-switcher');
        console.log('Found feed switchers:', feedSwitchers.length);
        
        if (feedSwitchers.length > 0) {
            feedSwitchers.forEach(switcher => {
                switcher.addEventListener('click', function(e) {
                    e.preventDefault();
                    const feedType = this.getAttribute('data-feed') || 'all';
                    console.log('Switching feed to:', feedType);
                    loadPosts(feedType);
                    
                    // Update active state
                    feedSwitchers.forEach(s => s.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
    } else {
        console.warn('Post container not found - posts cannot be displayed');
    }
    
    // Set up post form submission if it exists
    if (postForm) {
        console.log('Post form found, setting up submission handler');
        
        // Add scheduler toggle button to form
        const formActions = postForm.querySelector('.form-actions');
        if (formActions) {
            const schedulerToggle = document.createElement('button');
            schedulerToggle.type = 'button'; // Important: type="button" prevents form submission
            schedulerToggle.className = 'btn scheduler-toggle';
            schedulerToggle.innerHTML = '<i class="far fa-clock"></i> Schedule';
            
            // Insert scheduler toggle before submit button
            formActions.insertBefore(schedulerToggle, formActions.firstChild);
            
            // Create scheduler container (hidden by default)
            const schedulerContainer = document.createElement('div');
            schedulerContainer.className = 'scheduler-container';
            schedulerContainer.style.display = 'none';
            schedulerContainer.innerHTML = `
                <div class="scheduler-header">Schedule your post</div>
                <div class="scheduler-inputs">
                    <input type="datetime-local" id="schedule-datetime" min="${new Date().toISOString().slice(0, 16)}">
                    <button type="button" id="clear-schedule" class="btn">Clear</button>
                </div>
                <div class="scheduler-note">Your post will be published at the selected time.</div>
            `;
            
            // Insert scheduler container before form actions
            postForm.insertBefore(schedulerContainer, formActions);
            
            // Set up scheduler toggle button
            schedulerToggle.addEventListener('click', function() {
                showScheduler = !showScheduler;
                schedulerContainer.style.display = showScheduler ? 'block' : 'none';
                
                // Toggle button text
                if (showScheduler) {
                    schedulerToggle.innerHTML = '<i class="far fa-clock"></i> Cancel Schedule';
                    schedulerToggle.classList.add('active');
                } else {
                    schedulerToggle.innerHTML = '<i class="far fa-clock"></i> Schedule';
                    schedulerToggle.classList.remove('active');
                    // Clear schedule when hiding
                    document.getElementById('schedule-datetime').value = '';
                    scheduleDate = null;
                }
            });
            
            // Set up clear schedule button
            document.getElementById('clear-schedule').addEventListener('click', function() {
                document.getElementById('schedule-datetime').value = '';
                scheduleDate = null;
            });
            
            // Set up datetime input
            document.getElementById('schedule-datetime').addEventListener('change', function() {
                scheduleDate = this.value ? new Date(this.value).toISOString() : null;
                console.log('Schedule date set to:', scheduleDate);
            });
        }
        
        // Fix form submission - ensure it's properly set up
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Post form submitted');
            
            const content = document.getElementById('post-content').value.trim();
            if (!content) {
                showAlert('Please enter some content for your post', 'error');
                return;
            }
            
            const token = localStorage.getItem('token');
            if (!token) {
                showAlert('You must be logged in to create posts', 'error');
                return;
            }
            
            // Disable form during submission
            const submitButton = postForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = scheduleDate ? 'Scheduling...' : 'Posting...';
            
            // Create post with optional scheduling
            fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: content,
                    scheduledFor: scheduleDate // This will be null if not scheduled
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(post => {
                console.log('Post created:', post);
                // Clear form
                document.getElementById('post-content').value = '';
                
                // Clear schedule if it was set
                if (scheduleDate) {
                    document.getElementById('schedule-datetime').value = '';
                    scheduleDate = null;
                    showScheduler = false;
                    const schedulerContainer = document.querySelector('.scheduler-container');
                    if (schedulerContainer) {
                        schedulerContainer.style.display = 'none';
                    }
                    const schedulerToggle = document.querySelector('.scheduler-toggle');
                    if (schedulerToggle) {
                        schedulerToggle.innerHTML = '<i class="far fa-clock"></i> Schedule';
                        schedulerToggle.classList.remove('active');
                    }
                }
                
                // Add the new post to the top of the feed if it's not scheduled
                if (!post.is_scheduled && postContainer) {
                    const postHtml = renderPost(post);
                    postContainer.insertAdjacentHTML('afterbegin', postHtml);
                    initializePost(post.id);
                }
                
                showAlert(post.is_scheduled ? 
                    'Post scheduled successfully!' : 
                    'Post created successfully!', 'success');
            })
            .catch(error => {
                console.error('Error creating post:', error);
                showAlert(error.message || 'Failed to create post. Please try again.', 'error');
            })
            .finally(() => {
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    } else {
        console.warn('Post form not found - post creation unavailable');
    }
    
    // Function to load posts
    function loadPosts(feedType = 'all') {
        const token = localStorage.getItem('token');
        if (!token) {
            showAlert('You must be logged in to view posts', 'error');
            return;
        }
        
        // Show loading state
        postContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        
        fetch(`/api/posts?feed=${feedType}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(posts => {
            console.log(`Loaded ${posts.length} posts for feed type: ${feedType}`);
            
            if (posts.length === 0) {
                postContainer.innerHTML = `
                    <div class="no-posts">
                        <p>No posts found. ${feedType === 'following' ? 'Follow some users to see their posts here.' : 'Be the first to post!'}</p>
                    </div>
                `;
                return;
            }
            
            // Render posts
            postContainer.innerHTML = '';
            posts.forEach(post => {
                const postHtml = renderPost(post);
                postContainer.insertAdjacentHTML('beforeend', postHtml);
                initializePost(post.id);
            });
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            postContainer.innerHTML = `
                <div class="error">
                    <p>Failed to load posts. Please try again.</p>
                    <button id="retry-load-posts">Retry</button>
                </div>
            `;
            
            document.getElementById('retry-load-posts').addEventListener('click', () => {
                loadPosts(feedType);
            });
        });
    }
    
    // Function to render a post
    function renderPost(post) {
        const date = new Date(post.created_at);
        const formattedDate = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let scheduledBadge = '';
        if (post.is_scheduled) {
            const scheduleDate = new Date(post.scheduled_for);
            const formattedScheduleDate = scheduleDate.toLocaleDateString() + ' at ' + 
                scheduleDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            scheduledBadge = `<span class="scheduled-badge">Scheduled for ${formattedScheduleDate}</span>`;
        }
        
        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <span class="post-author">${post.username}</span>
                    <span class="post-date">${formattedDate}</span>
                </div>
                ${scheduledBadge}
                <div class="post-content">${post.content}</div>
                ${post.image_url ? `<div class="post-image"><img src="${post.image_url}" alt="Post image"></div>` : ''}
                <div class="post-actions">
                    <button class="interest-btn ${post.is_interested ? 'interested' : ''}" data-post-id="${post.id}">
                        <i class="fas fa-lightbulb"></i> 
                        <span class="interest-count">${post.interested_users.length}</span>
                    </button>
                    ${post.is_owner ? '<button class="delete-post-btn" data-post-id="' + post.id + '"><i class="fas fa-trash"></i></button>' : ''}
                </div>
            </div>
        `;
    }
    
    // Function to initialize post interactions
    function initializePost(postId) {
        // Set up interest button
        const interestBtn = document.querySelector(`.interest-btn[data-post-id="${postId}"]`);
        if (interestBtn) {
            interestBtn.addEventListener('click', function() {
                toggleInterest(postId);
            });
        }
        
        // Set up delete button if it exists
        const deleteBtn = document.querySelector(`.delete-post-btn[data-post-id="${postId}"]`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this post?')) {
                    deletePost(postId);
                }
            });
        }
    }
    
    // Function to toggle interest in a post
    function toggleInterest(postId) {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        fetch(`/api/posts/${postId}/interest`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            const interestBtn = document.querySelector(`.interest-btn[data-post-id="${postId}"]`);
            const countElem = interestBtn.querySelector('.interest-count');
            
            countElem.textContent = data.interestedCount;
            
            if (data.interested) {
                interestBtn.classList.add('interested');
            } else {
                interestBtn.classList.remove('interested');
            }
        })
        .catch(error => {
            console.error('Error toggling interest:', error);
            showAlert('Failed to update interest', 'error');
        });
    }
    
    // Function to show alerts
    function showAlert(message, type = 'info') {
        // Check if an alert container exists
        let alertContainer = document.querySelector('.alert-container');
        
        // If not, create one
        if (!alertContainer) {
            alertContainer = document.createElement('div');
            alertContainer.className = 'alert-container';
            document.body.appendChild(alertContainer);
        }
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'alert-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            alertContainer.removeChild(alert);
        });
        
        alert.appendChild(closeBtn);
        alertContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertContainer.contains(alert)) {
                alertContainer.removeChild(alert);
            }
        }, 5000);
    }
});
