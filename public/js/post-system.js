/**
 * Post System - Complete Rebuild
 * Handles all post creation, loading, and interaction functionality
 */

const PostSystem = (function() {
  // Configuration
  const config = {
    apiBase: '/api',
    postsEndpoint: '/posts',
    interestEndpoint: '/interest',
    debugMode: true
  };

  // Cache DOM elements
  let elements = {
    postContainer: null,
    postForm: null,
    feedSwitchers: null
  };

  // State management
  let state = {
    posts: [],
    currentFeed: 'all',
    isLoading: false,
    lastError: null,
    isInitialized: false
  };

  // Initialization
  function init(options = {}) {
    log('Initializing post system...');
    
    // Merge options with default config
    Object.assign(config, options);
    
    // Find and cache DOM elements
    elements.postContainer = document.getElementById(options.containerID || 'posts-container');
    elements.postForm = document.getElementById(options.formID || 'post-form');
    elements.feedSwitchers = document.querySelectorAll(options.switcherSelector || '.feed-switcher');
    
    if (!elements.postContainer) {
      error('Post container element not found');
      return false;
    }
    
    log('Found post container: ' + (elements.postContainer.id || 'unnamed'));
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial posts
    loadPosts(state.currentFeed);
    
    state.isInitialized = true;
    log('Post system initialized successfully');
    
    // Return public API
    return true;
  }
  
  // Event listeners setup
  function setupEventListeners() {
    log('Setting up event listeners');
    
    // Post form submission
    if (elements.postForm) {
      log('Setting up post form submit handler');
      elements.postForm.addEventListener('submit', handlePostSubmit);
    }
    
    // Feed switchers
    if (elements.feedSwitchers && elements.feedSwitchers.length > 0) {
      log(`Setting up ${elements.feedSwitchers.length} feed switchers`);
      elements.feedSwitchers.forEach(switcher => {
        switcher.addEventListener('click', handleFeedSwitch);
      });
    }
    
    // Global delegated event listener for post actions
    if (elements.postContainer) {
      elements.postContainer.addEventListener('click', handlePostActions);
    }
  }
  
  // Post form submission handler
  function handlePostSubmit(e) {
    e.preventDefault();
    log('Post form submitted');
    
    const contentField = e.target.querySelector('textarea') || document.getElementById('post-content');
    if (!contentField) {
      error('Content field not found in form');
      return;
    }
    
    const content = contentField.value.trim();
    if (!content) {
      showNotification('Please enter some content for your post', 'error');
      return;
    }
    
    // Gather additional data
    const imageUrl = e.target.querySelector('#post-image') ? 
      e.target.querySelector('#post-image').value : null;
    
    // Find submit button to update UI
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = 'Posting...';
    }
    
    // Show progress indicator in post form
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'post-progress';
    progressIndicator.textContent = 'Creating your post...';
    e.target.appendChild(progressIndicator);
    
    // Create the post
    createPost(content, imageUrl)
      .then(post => {
        log('Post created successfully', post);
        
        // Clear form
        contentField.value = '';
        if (e.target.querySelector('#post-image')) {
          e.target.querySelector('#post-image').value = '';
        }
        
        // Show success message
        showNotification('Post created successfully!', 'success');
        
        // Add new post to the top of the feed without reloading
        if (elements.postContainer) {
          const postHtml = renderPost(post);
          if (elements.postContainer.firstChild) {
            elements.postContainer.insertBefore(postHtml, elements.postContainer.firstChild);
          } else {
            elements.postContainer.appendChild(postHtml);
          }
        }
      })
      .catch(err => {
        error('Error creating post:', err);
        showNotification('Failed to create post: ' + err.message, 'error');
      })
      .finally(() => {
        // Restore submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.dataset.originalText || 'Post';
        }
        
        // Remove progress indicator
        if (progressIndicator.parentNode) {
          progressIndicator.parentNode.removeChild(progressIndicator);
        }
      });
  }
  
  // Feed switch handler
  function handleFeedSwitch(e) {
    e.preventDefault();
    
    const feedType = this.getAttribute('data-feed') || 'all';
    log(`Switching feed to: ${feedType}`);
    
    // Update active state
    if (elements.feedSwitchers) {
      elements.feedSwitchers.forEach(s => s.classList.remove('active'));
      this.classList.add('active');
    }
    
    // Update state and load posts
    state.currentFeed = feedType;
    loadPosts(feedType);
  }
  
  // Post actions delegated handler
  function handlePostActions(e) {
    // Find closest post element
    const postElement = e.target.closest('.post');
    if (!postElement) return;
    
    const postId = postElement.getAttribute('data-post-id');
    if (!postId) return;
    
    // Handle interest button click
    if (e.target.closest('.interest-btn')) {
      toggleInterest(postId, postElement);
      return;
    }
    
    // Handle contact button click
    if (e.target.closest('.contact-btn')) {
      contactAuthor(postId, postElement);
      return;
    }
    
    // Handle share button click
    if (e.target.closest('.share-btn')) {
      sharePost(postId, postElement);
      return;
    }
    
    // Handle delete button click
    if (e.target.closest('.delete-post-btn')) {
      if (confirm('Are you sure you want to delete this post?')) {
        deletePost(postId, postElement);
      }
      return;
    }
    
    // Handle edit button click
    if (e.target.closest('.edit-post-btn')) {
      editPost(postId, postElement);
      return;
    }
    
    // Handle archive button click
    if (e.target.closest('.archive-post-btn')) {
      archivePost(postId, postElement);
      return;
    }
    
    // Handle reminder button click
    if (e.target.closest('.remind-btn')) {
      sendReminder(postId, postElement);
      return;
    }
    
    // Handle meeting button click
    if (e.target.closest('.meeting-btn')) {
      scheduleMeeting(postId, postElement);
      return;
    }
  }
  
  // API Functions
  
  // Load posts
  function loadPosts(feedType = 'all') {
    if (!isAuthenticated()) {
      error('Cannot load posts: User not authenticated');
      showNotification('You must be logged in to view posts', 'error');
      return Promise.reject(new Error('Not authenticated'));
    }
    
    log(`Loading ${feedType} feed posts`);
    state.isLoading = true;
    
    // Update UI to show loading state
    if (elements.postContainer) {
      elements.postContainer.innerHTML = '<div class="loading-indicator">Loading posts...</div>';
    }
    
    // Make API request
    return fetch(`${config.apiBase}${config.postsEndpoint}?feed=${feedType}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    .then(handleResponse)
    .then(posts => {
      log(`Loaded ${posts.length} posts for ${feedType} feed`);
      state.posts = posts;
      state.isLoading = false;
      state.lastError = null;
      
      // Update UI
      renderPosts(posts);
      return posts;
    })
    .catch(err => {
      state.isLoading = false;
      state.lastError = err.message;
      error(`Error loading ${feedType} feed:`, err);
      
      // Update UI to show error
      if (elements.postContainer) {
        elements.postContainer.innerHTML = `
          <div class="error-message">
            <p>Failed to load posts. ${err.message}</p>
            <button class="retry-btn">Retry</button>
          </div>
        `;
        
        // Add retry button handler
        elements.postContainer.querySelector('.retry-btn').addEventListener('click', () => {
          loadPosts(feedType);
        });
      }
      
      return Promise.reject(err);
    });
  }
  
  // Create post
  function createPost(content, imageUrl = null) {
    if (!isAuthenticated()) {
      return Promise.reject(new Error('You must be logged in to create posts'));
    }
    
    log('Creating new post with content length:', content.length);
    
    const postData = {
      content: content
    };
    
    if (imageUrl) {
      postData.imageUrl = imageUrl;
    }
    
    // Make API request with detailed logging and error handling
    return fetch(`${config.apiBase}${config.postsEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(postData)
    })
    .then(response => {
      log('Create post response status:', response.status);
      
      // Handle non-ok responses specially to get detailed error messages
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || `Server returned ${response.status}`);
        }).catch(err => {
          if (err.name === 'SyntaxError') {
            throw new Error(`Server error (${response.status})`);
          }
          throw err;
        });
      }
      
      return response.json();
    })
    .then(post => {
      log('Post created with ID:', post.id);
      return post;
    });
  }
  
  // Toggle interest in a post
  function toggleInterest(postId, postElement) {
    if (!isAuthenticated()) {
      showNotification('You must be logged in to show interest', 'error');
      return Promise.reject(new Error('Not authenticated'));
    }
    
    log(`Toggling interest for post ${postId}`);
    
    // Update UI optimistically
    const interestBtn = postElement.querySelector('.interest-btn');
    const interestCount = interestBtn.querySelector('.interest-count');
    const isInterested = interestBtn.classList.contains('interested');
    
    // Flip the state optimistically
    if (isInterested) {
      interestBtn.classList.remove('interested');
      interestCount.textContent = parseInt(interestCount.textContent || '0') - 1;
    } else {
      interestBtn.classList.add('interested');
      interestCount.textContent = parseInt(interestCount.textContent || '0') + 1;
    }
    
    // Make API request
    return fetch(`${config.apiBase}${config.postsEndpoint}/${postId}/interest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    .then(handleResponse)
    .then(data => {
      log(`Interest toggled successfully for post ${postId}`, data);
      
      // Update UI with actual data from server
      interestCount.textContent = data.interestedCount;
      if (data.interested) {
        interestBtn.classList.add('interested');
      } else {
        interestBtn.classList.remove('interested');
      }
      
      return data;
    })
    .catch(err => {
      error(`Error toggling interest for post ${postId}:`, err);
      
      // Revert UI change on error
      if (isInterested) {
        interestBtn.classList.add('interested');
        interestCount.textContent = parseInt(interestCount.textContent || '0') + 1;
      } else {
        interestBtn.classList.remove('interested');
        interestCount.textContent = parseInt(interestCount.textContent || '0') - 1;
      }
      
      showNotification('Failed to update interest', 'error');
      return Promise.reject(err);
    });
  }
  
  // Delete a post
  function deletePost(postId, postElement) {
    if (!isAuthenticated()) {
      showNotification('You must be logged in to delete a post', 'error');
      return Promise.reject(new Error('Not authenticated'));
    }
    
    log(`Deleting post ${postId}`);
    
    // Show loading state
    postElement.classList.add('deleting');
    
    // Make API request
    return fetch(`${config.apiBase}${config.postsEndpoint}/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    .then(handleResponse)
    .then(data => {
      log(`Post ${postId} deleted successfully`);
      
      // Remove post from DOM with animation
      postElement.classList.add('deleted');
      setTimeout(() => {
        if (postElement.parentNode) {
          postElement.parentNode.removeChild(postElement);
        }
      }, 300);
      
      showNotification('Post deleted successfully', 'success');
      return data;
    })
    .catch(err => {
      error(`Error deleting post ${postId}:`, err);
      postElement.classList.remove('deleting');
      showNotification('Failed to delete post: ' + err.message, 'error');
      return Promise.reject(err);
    });
  }
  
  // Archive a post
  function archivePost(postId, postElement) {
    if (!isAuthenticated()) {
      showNotification('You must be logged in to archive a post', 'error');
      return Promise.reject(new Error('Not authenticated'));
    }
    
    log(`Archiving post ${postId}`);
    
    // Show loading state
    postElement.classList.add('archiving');
    
    // Make API request
    return fetch(`${config.apiBase}${config.postsEndpoint}/${postId}/archive`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
    .then(handleResponse)
    .then(data => {
      log(`Post ${postId} archived successfully`);
      
      // Update UI
      postElement.classList.remove('archiving');
      postElement.classList.add('archived');
      
      showNotification('Post archived successfully', 'success');
      return data;
    })
    .catch(err => {
      error(`Error archiving post ${postId}:`, err);
      postElement.classList.remove('archiving');
      showNotification('Failed to archive post: ' + err.message, 'error');
      return Promise.reject(err);
    });
  }
  
  // Share a post
  function sharePost(postId, postElement) {
    log(`Sharing post ${postId}`);
    
    // Create share dialog
    const shareDialog = document.createElement('div');
    shareDialog.className = 'share-dialog';
    shareDialog.innerHTML = `
      <div class="share-dialog-content">
        <h3>Share this post</h3>
        <button class="share-option" data-type="internal">Share with Innovate user</button>
        <button class="share-option" data-type="external">Share externally</button>
        <button class="close-dialog">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(shareDialog);
    
    // Set up event listeners
    shareDialog.querySelector('.close-dialog').addEventListener('click', () => {
      document.body.removeChild(shareDialog);
    });
    
    // Internal share
    shareDialog.querySelector('[data-type="internal"]').addEventListener('click', () => {
      document.body.removeChild(shareDialog);
      
      // Show user search dialog
      showUserSearchDialog(postId);
    });
    
    // External share
    shareDialog.querySelector('[data-type="external"]').addEventListener('click', () => {
      document.body.removeChild(shareDialog);
      
      // Get post data
      const post = state.posts.find(p => p.id.toString() === postId.toString());
      if (!post) {
        showNotification('Post not found', 'error');
        return;
      }
      
      // Try to use Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: 'Check out this post',
          text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          url: window.location.origin + '/post/' + postId
        })
        .then(() => log('Shared successfully'))
        .catch(err => error('Error sharing:', err));
      } else {
        // Fallback - copy to clipboard
        const tempInput = document.createElement('input');
        tempInput.value = window.location.origin + '/post/' + postId;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        showNotification('Link copied to clipboard', 'success');
      }
    });
  }
  
  // Contact post author
  function contactAuthor(postId, postElement) {
    log(`Contacting author of post ${postId}`);
    
    // Get post data
    const post = state.posts.find(p => p.id.toString() === postId.toString());
    if (!post) {
      showNotification('Post not found', 'error');
      return;
    }
    
    // Redirect to messages page with this user
    window.location.href = `/html/messages.html?userId=${post.user_id}`;
  }
  
  // Send reminder notification
  function sendReminder(postId, postElement) {
    if (!isAuthenticated()) {
      showNotification('You must be logged in to send reminders', 'error');
      return;
    }
    
    log(`Sending reminder for post ${postId}`);
    
    // Get post data
    const post = state.posts.find(p => p.id.toString() === postId.toString());
    if (!post) {
      showNotification('Post not found', 'error');
      return;
    }
    
    // Make API request
    return fetch(`${config.apiBase}/notifications/remind`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        postId: postId,
        userId: post.user_id
      })
    })
    .then(handleResponse)
    .then(data => {
      log(`Reminder sent successfully for post ${postId}`);
      showNotification('Gentle reminder sent successfully', 'success');
      return data;
    })
    .catch(err => {
      error(`Error sending reminder for post ${postId}:`, err);
      showNotification('Failed to send reminder: ' + err.message, 'error');
      return Promise.reject(err);
    });
  }
  
  // Schedule an instant meeting
  function scheduleMeeting(postId, postElement) {
    if (!isAuthenticated()) {
      showNotification('You must be logged in to schedule meetings', 'error');
      return;
    }
    
    log(`Scheduling meeting for post ${postId}`);
    
    // Create meeting dialog
    const meetingDialog = document.createElement('div');
    meetingDialog.className = 'meeting-dialog';
    meetingDialog.innerHTML = `
      <div class="meeting-dialog-content">
        <h3>Schedule Instant Meeting</h3>
        <div class="form-group">
          <label for="meeting-title">Title</label>
          <input type="text" id="meeting-title" value="Discussion about post #${postId}">
        </div>
        <div class="form-group">
          <label for="meeting-time">Time</label>
          <input type="datetime-local" id="meeting-time" value="${new Date().toISOString().slice(0, 16)}">
        </div>
        <div class="actions">
          <button id="schedule-meeting-btn">Schedule</button>
          <button id="cancel-meeting-btn">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(meetingDialog);
    
    // Set up event listeners
    document.getElementById('cancel-meeting-btn').addEventListener('click', () => {
      document.body.removeChild(meetingDialog);
    });
    
    document.getElementById('schedule-meeting-btn').addEventListener('click', () => {
      const title = document.getElementById('meeting-title').value;
      const dateTime = document.getElementById('meeting-time').value;
      
      if (!title || !dateTime) {
        showNotification('Please fill all fields', 'error');
        return;
      }
      
      // Get post data
      const post = state.posts.find(p => p.id.toString() === postId.toString());
      if (!post) {
        showNotification('Post not found', 'error');
        document.body.removeChild(meetingDialog);
        return;
      }
      
      // Make API request
      fetch(`${config.apiBase}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title: title,
          date: dateTime,
          relatedPostId: postId,
          attendees: [post.user_id]
        })
      })
      .then(handleResponse)
      .then(data => {
        log(`Meeting scheduled successfully for post ${postId}`);
        showNotification('Meeting scheduled successfully', 'success');
        document.body.removeChild(meetingDialog);
      })
      .catch(err => {
        error(`Error scheduling meeting for post ${postId}:`, err);
        showNotification('Failed to schedule meeting: ' + err.message, 'error');
      });
    });
  }
  
  // Edit a post
  function editPost(postId, postElement) {
    if (!isAuthenticated()) {
      showNotification('You must be logged in to edit posts', 'error');
      return;
    }
    
    log(`Editing post ${postId}`);
    
    // Get post data
    const post = state.posts.find(p => p.id.toString() === postId.toString());
    if (!post) {
      showNotification('Post not found', 'error');
      return;
    }
    
    // Save original content
    const contentElement = postElement.querySelector('.post-content');
    const originalContent = contentElement.textContent;
    
    // Replace with editable textarea
    contentElement.innerHTML = `
      <form class="edit-form">
        <textarea class="edit-textarea">${originalContent}</textarea>
        <div class="edit-actions">
          <button type="submit" class="save-edit-btn">Save</button>
          <button type="button" class="cancel-edit-btn">Cancel</button>
        </div>
      </form>
    `;
    
    // Focus textarea
    const textarea = contentElement.querySelector('textarea');
    textarea.focus();
    
    // Set up event listeners
    const form = contentElement.querySelector('form');
    
    // Cancel edit
    contentElement.querySelector('.cancel-edit-btn').addEventListener('click', () => {
      contentElement.innerHTML = originalContent;
    });
    
    // Save edit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newContent = textarea.value.trim();
      if (!newContent) {
        showNotification('Post content cannot be empty', 'error');
        return;
      }
      
      // Show loading state
      const saveBtn = contentElement.querySelector('.save-edit-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      
      // Make API request
      fetch(`${config.apiBase}${config.postsEndpoint}/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          content: newContent
        })
      })
      .then(handleResponse)
      .then(data => {
        log(`Post ${postId} updated successfully`);
        
        // Update UI
        contentElement.innerHTML = newContent;
        
        // Update post in state
        const postIndex = state.posts.findIndex(p => p.id.toString() === postId.toString());
        if (postIndex !== -1) {
          state.posts[postIndex].content = newContent;
        }
        
        showNotification('Post updated successfully', 'success');
      })
      .catch(err => {
        error(`Error updating post ${postId}:`, err);
        
        // Revert to original content
        contentElement.innerHTML = originalContent;
        
        showNotification('Failed to update post: ' + err.message, 'error');
      });
    });
  }
  
  // Show user search dialog
  function showUserSearchDialog(postId) {
    // Create dialog
    const searchDialog = document.createElement('div');
    searchDialog.className = 'search-dialog';
    searchDialog.innerHTML = `
      <div class="search-dialog-content">
        <h3>Share with User</h3>
        <input type="text" id="user-search" placeholder="Search users...">
        <div id="search-results" class="search-results"></div>
        <button id="close-search">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(searchDialog);
    
    // Set up event listeners
    document.getElementById('close-search').addEventListener('click', () => {
      document.body.removeChild(searchDialog);
    });
    
    const searchInput = document.getElementById('user-search');
    const searchResults = document.getElementById('search-results');
    
    // Debounce search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      
      const query = searchInput.value.trim();
      if (query.length < 2) {
        searchResults.innerHTML = '<div class="no-results">Enter at least 2 characters</div>';
        return;
      }
      
      searchResults.innerHTML = '<div class="searching">Searching...</div>';
      
      searchTimeout = setTimeout(() => {
        // Search users
        fetch(`${config.apiBase}/users/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        })
        .then(handleResponse)
        .then(data => {
          if (!data.users || data.users.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No users found</div>';
            return;
          }
          
          // Render results
          searchResults.innerHTML = '';
          data.users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'search-result-item';
            userElement.innerHTML = `
              <span class="user-name">${user.username}</span>
              <button class="share-with-user" data-user-id="${user.id}">Share</button>
            `;
            searchResults.appendChild(userElement);
            
            // Share with user
            userElement.querySelector('.share-with-user').addEventListener('click', () => {
              shareWithUser(postId, user.id);
              document.body.removeChild(searchDialog);
            });
          });
        })
        .catch(err => {
          error('Error searching users:', err);
          searchResults.innerHTML = `<div class="error">Error searching: ${err.message}</div>`;
        });
      }, 500);
    });
  }
  
  // Share post with specific user
  function shareWithUser(postId, userId) {
    log(`Sharing post ${postId} with user ${userId}`);
    
    // Make API request
    return fetch(`${config.apiBase}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        postId: postId,
        userId: userId
      })
    })
    .then(handleResponse)
    .then(data => {
      log(`Post ${postId} shared successfully with user ${userId}`);
      showNotification('Post shared successfully', 'success');
      return data;
    })
    .catch(err => {
      error(`Error sharing post ${postId} with user ${userId}:`, err);
      showNotification('Failed to share post: ' + err.message, 'error');
      return Promise.reject(err);
    });
  }
  
  // Render all posts to container
  function renderPosts(posts) {
    if (!elements.postContainer) return;
    
    if (posts.length === 0) {
      elements.postContainer.innerHTML = `
        <div class="no-posts-message">
          <p>No posts found</p>
          <p class="prompt">${state.currentFeed === 'following' ? 
            'Follow some users to see their posts here.' : 
            'Be the first to post something!'}</p>
        </div>
      `;
      return;
    }
    
    // Clear container
    elements.postContainer.innerHTML = '';
    
    // Append each post
    posts.forEach(post => {
      const postElement = renderPost(post);
      elements.postContainer.appendChild(postElement);
    });
  }
  
  // Render a single post
  function renderPost(post) {
    // Create post element
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.setAttribute('data-post-id', post.id);
    
    // Format date
    const postDate = new Date(post.created_at);
    const formattedDate = postDate.toLocaleDateString() + ' at ' + 
      postDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Different actions for post owner vs viewer
    let ownerActions = '';
    if (post.is_owner) {
      ownerActions = `
        <div class="owner-actions dropdown">
          <button class="dropdown-toggle"><i class="fas fa-ellipsis-v"></i></button>
          <div class="dropdown-menu">
            <button class="edit-post-btn"><i class="fas fa-edit"></i> Edit</button>
            <button class="archive-post-btn"><i class="fas fa-archive"></i> Archive</button>
            <button class="delete-post-btn"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
    }
    
    // Build post HTML
    postElement.innerHTML = `
      <div class="post-header">
        <div class="post-author">
          <span class="author-name">${post.username}</span>
        </div>
        <div class="post-meta">
          <span class="post-date">${formattedDate}</span>
          ${ownerActions}
        </div>
      </div>
      <div class="post-content">${post.content}</div>
      ${post.image_url ? `<div class="post-image"><img src="${post.image_url}" alt="Post image"></div>` : ''}
      <div class="post-actions">
        <button class="interest-btn ${post.is_interested ? 'interested' : ''}" title="Show interest">
          <i class="fas fa-lightbulb"></i>
          <span class="interest-count">${post.interested_users ? post.interested_users.length : 0}</span>
        </button>
        <button class="contact-btn" title="Contact author">
          <i class="fas fa-envelope"></i>
        </button>
        <button class="share-btn" title="Share post">
          <i class="fas fa-share-alt"></i>
        </button>
        <div class="viewer-actions dropdown">
          <button class="dropdown-toggle"><i class="fas fa-ellipsis-v"></i></button>
          <div class="dropdown-menu">
            <button class="remind-btn"><i class="fas fa-bell"></i> Gentle Reminder</button>
            <button class="meeting-btn"><i class="fas fa-video"></i> Instant Meeting</button>
          </div>
        </div>
      </div>
    `;
    
    return postElement;
  }
  
  // Helper Functions
  
  // Check if user is authenticated
  function isAuthenticated() {
    return !!getToken();
  }
  
  // Get auth token
  function getToken() {
    return localStorage.getItem('token');
  }
  
  // Handle API response
  function handleResponse(response) {
    return new Promise((resolve, reject) => {
      // First get response as text
      response.text()
        .then(text => {
          // If no content, resolve with empty object
          if (!text) {
            return response.ok ? resolve({}) : reject(new Error(`Server error: ${response.status}`));
          }
          
          // Try to parse as JSON
          try {
            const data = JSON.parse(text);
            
            // If response is not ok, reject with error message from API
            if (!response.ok) {
              reject(new Error(data.message || `Server returned ${response.status}`));
              return;
            }
            
            // Success - resolve with data
            resolve(data);
          } catch (err) {
            // Invalid JSON
            log('Response is not valid JSON:', text);
            
            if (!response.ok) {
              reject(new Error(`Server error: ${response.status}`));
            } else {
              // Attempt to handle non-JSON success response
              resolve({ message: text });
            }
          }
        })
        .catch(err => {
          reject(new Error('Failed to process response'));
        });
    });
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">${message}</div>
      <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      container.removeChild(notification);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode === container) {
        container.removeChild(notification);
      }
    }, 5000);
  }
  
  // Logging functions
  function log(...args) {
    if (config.debugMode) {
      console.log('[PostSystem]', ...args);
    }
  }
  
  function error(...args) {
    console.error('[PostSystem]', ...args);
  }
  
  // Public API
  return {
    init,
    loadPosts,
    createPost,
    toggleInterest,
    deletePost,
    archivePost,
    getState: () => ({ ...state })
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  PostSystem.init({
    containerID: 'posts-container',
    formID: 'post-form',
    switcherSelector: '.feed-switcher',
    debugMode: true
  });
});
