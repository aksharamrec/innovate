// State to hold posts and other data
const state = {
  posts: [],
  currentFeed: 'all',
  loading: false,
  endOfFeed: false,
  page: 1
};

// Initialize feed
function initFeed() {
  console.log('Initializing feed system...');
  
  // Load initial posts
  loadPosts();

  // Set up event listeners
  document.querySelectorAll('.feed-switcher, .filter-option').forEach(button => {
    button.addEventListener('click', function() {
      const feedType = this.dataset.feed || 'all';
      switchFeed(feedType);
    });
  });

  // Set up post creation form
  const postForm = document.getElementById('post-form');
  if (postForm) {
    postForm.addEventListener('submit', handlePostSubmit);
  }

  // Set up diagnostics button
  const diagnosticsBtn = document.getElementById('run-diagnostics-btn');
  if (diagnosticsBtn) {
    diagnosticsBtn.addEventListener('click', runDiagnostics);
  }

  // Set up infinite scroll
  window.addEventListener('scroll', handleScroll);
  
  // Set up post input event listener
  const postInput = document.getElementById('post-input');
  const postSubmitBtn = document.getElementById('post-submit-btn');
  if (postInput && postSubmitBtn) {
    postInput.addEventListener('input', function() {
      postSubmitBtn.disabled = this.value.trim() === '';
    });
  }
  
  // Set up image upload
  const imageInput = document.getElementById('image-input');
  const attachButton = document.getElementById('attach-image-btn');
  if (imageInput && attachButton) {
    attachButton.addEventListener('click', function() {
      imageInput.click();
    });
    
    imageInput.addEventListener('change', handleImageUpload);
  }
  
  // Set up modal close functionality
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.classList.remove('active');
      }
    });
  }
  
  console.log('Feed initialization complete');
}

// Handle image upload
function handleImageUpload(e) {
  const files = Array.from(e.target.files);
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const postSubmitBtn = document.getElementById('post-submit-btn');
  
  if (!files.length || !imagePreviewContainer) return;
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed', 'warning');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const previewHTML = `
        <div class="image-preview">
          <img src="${event.target.result}" alt="Preview">
          <button type="button" class="remove-image" data-filename="${file.name}">×</button>
        </div>
      `;
      imagePreviewContainer.insertAdjacentHTML('beforeend', previewHTML);
      
      // Enable submit button if we have at least one image
      if (postSubmitBtn) {
        postSubmitBtn.disabled = false;
      }
      
      // Add event listener to remove button
      const removeBtn = imagePreviewContainer.querySelector(`.remove-image[data-filename="${file.name}"]`);
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          this.closest('.image-preview').remove();
          
          // Disable submit button if no content and no images
          if (postSubmitBtn && document.getElementById('post-input')) {
            const content = document.getElementById('post-input').value.trim();
            postSubmitBtn.disabled = content === '' && imagePreviewContainer.children.length === 0;
          }
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

// Load posts from server
function loadPosts() {
  if (state.loading || state.endOfFeed) return;

  state.loading = true;
  const feedType = state.currentFeed;
  const url = `/api/posts?feed=${feedType}&page=${state.page}`;
  
  console.log(`Loading posts: ${url}`);
  
  // Show loading spinner
  const loadingSpinner = document.getElementById('loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'block';
  }

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        state.endOfFeed = true;
        showEndOfFeed();
      } else {
        state.posts = state.posts.concat(data);
        renderPosts(data);
        state.page++;
      }
    })
    .catch(error => {
      console.error('Error loading posts:', error);
      showToast('Failed to load posts. Please try again later.', 'error');
    })
    .finally(() => {
      state.loading = false;
      if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
      }
    });
}

// Show end of feed indicator
function showEndOfFeed() {
  const endOfFeedEl = document.getElementById('end-of-feed');
  if (endOfFeedEl) {
    endOfFeedEl.style.display = 'block';
  }
}

// Render posts to the DOM
function renderPosts(posts, append = true) {
  const container = document.getElementById('posts-container');
  if (!container) return;
  
  // Clear loading message if it exists and we're not appending
  if (!append) {
    const loadingEl = container.querySelector('.loading');
    if (loadingEl) {
      container.removeChild(loadingEl);
    }
    container.innerHTML = '';
  }

  posts.forEach(post => {
    const postEl = createPostElement(post);
    container.appendChild(postEl);
  });
  
  // Set up event listeners for the new posts
  setupPostInteractions();
}

// Create a post element
function createPostElement(post) {
  const postEl = document.createElement('div');
  postEl.className = 'post-card';
  postEl.dataset.postId = post.id;
  
  const author = post.author || { username: 'Unknown User' };
  const authorInitial = author.username.charAt(0).toUpperCase();
  
  // Create images HTML if post has images
  let imagesHTML = '';
  if (post.images && post.images.length > 0) {
    const singleClass = post.images.length === 1 ? 'single-image' : '';
    imagesHTML = `
      <div class="post-images ${singleClass}">
        ${post.images.map((img, index) => {
          const imgUrl = typeof img === 'string' ? img : 
                         img.url ? img.url : 
                         img.src ? img.src : '';
          return `<img src="${imgUrl}" class="post-image" alt="Post Image ${index + 1}" data-index="${index}" data-post-id="${post.id}">`;
        }).join('')}
      </div>
    `;
  }
  
  // Check if current user is the author
  const currentUser = localStorage.getItem('username');
  const isAuthor = currentUser && author.username === currentUser;
  
  // Create menu options based on ownership
  let menuOptionsHTML = '';
  if (isAuthor) {
    menuOptionsHTML = `
      <div class="menu-item edit-post" data-post-id="${post.id}"><i class="fas fa-edit"></i> Edit</div>
      <div class="menu-item archive-post" data-post-id="${post.id}"><i class="fas fa-archive"></i> Archive</div>
      <div class="menu-item danger delete-post" data-post-id="${post.id}"><i class="fas fa-trash-alt"></i> Delete</div>
    `;
  } else {
    menuOptionsHTML = `
      <div class="menu-item remind-post" data-post-id="${post.id}" data-username="${author.username}">
        <i class="fas fa-bell"></i> Gentle Reminder
      </div>
      <div class="menu-item meeting-post" data-post-id="${post.id}" data-username="${author.username}">
        <i class="fas fa-video"></i> Instant Meeting
      </div>
    `;
  }

  postEl.innerHTML = `
    <div class="post-header">
      <div class="post-author">
        <div class="user-avatar">${authorInitial}</div>
        <div class="author-info">
          <div class="author-name">${author.username}</div>
          <div class="post-date">${formatDate(post.createdAt)}</div>
        </div>
      </div>
      <div class="post-menu">
        <button class="post-menu-btn" aria-label="Post options"><i class="fas fa-ellipsis-v"></i></button>
        <div class="post-menu-dropdown">
          ${menuOptionsHTML}
        </div>
      </div>
    </div>
    <div class="post-content">${post.content}</div>
    ${imagesHTML}
    <div class="post-actions-bar">
      <div class="action-buttons">
        <button class="action-btn btn-interested ${post.interested ? 'active' : ''}" data-post-id="${post.id}">
          <i class="fas fa-thumbs-up"></i> I'm Interested
        </button>
        <button class="action-btn btn-contact" data-post-id="${post.id}" data-username="${author.username}">
          <i class="fas fa-envelope"></i> Contact Me
        </button>
        <button class="action-btn btn-share" data-post-id="${post.id}">
          <i class="fas fa-share-alt"></i> Share
        </button>
      </div>
      <div class="post-stats">${post.interestCount || 0} interested</div>
    </div>
    <div class="share-menu" data-post-id="${post.id}">
      <div class="share-option share-internal" data-post-id="${post.id}"><i class="fas fa-users"></i> Share with Connections</div>
      <div class="share-option share-twitter" data-post-id="${post.id}"><i class="fab fa-twitter"></i> Share on Twitter</div>
      <div class="share-option share-linkedin" data-post-id="${post.id}"><i class="fab fa-linkedin"></i> Share on LinkedIn</div>
      <div class="share-option share-facebook" data-post-id="${post.id}"><i class="fab fa-facebook"></i> Share on Facebook</div>
      <div class="share-option share-link" data-post-id="${post.id}"><i class="fas fa-link"></i> Copy Link</div>
    </div>
  `;

  return postEl;
}

// Set up event listeners for post interactions
function setupPostInteractions() {
  // Post menu toggles
  document.querySelectorAll('.post-menu-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = this.nextElementSibling;
      
      // Close all other dropdowns
      document.querySelectorAll('.post-menu-dropdown.show').forEach(menu => {
        if (menu !== dropdown) menu.classList.remove('show');
      });
      
      // Toggle this dropdown
      dropdown.classList.toggle('show');
    });
  });
  
  // Post action buttons
  document.querySelectorAll('.btn-interested').forEach(btn => {
    btn.addEventListener('click', handleInterested);
  });
  
  document.querySelectorAll('.btn-contact').forEach(btn => {
    btn.addEventListener('click', handleContact);
  });
  
  document.querySelectorAll('.btn-share').forEach(btn => {
    btn.addEventListener('click', handleShare);
  });
  
  // Post menu actions
  document.querySelectorAll('.edit-post').forEach(item => {
    item.addEventListener('click', handleEditPost);
  });
  
  document.querySelectorAll('.delete-post').forEach(item => {
    item.addEventListener('click', handleDeletePost);
  });
  
  document.querySelectorAll('.archive-post').forEach(item => {
    item.addEventListener('click', handleArchivePost);
  });
  
  document.querySelectorAll('.remind-post').forEach(item => {
    item.addEventListener('click', handleRemindPost);
  });
  
  document.querySelectorAll('.meeting-post').forEach(item => {
    item.addEventListener('click', handleMeetingPost);
  });
  
  // Share options
  document.querySelectorAll('.share-option').forEach(option => {
    option.addEventListener('click', handleShareOption);
  });
  
  // Image preview
  document.querySelectorAll('.post-image').forEach(img => {
    img.addEventListener('click', handleImageClick);
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.post-menu-btn') && !e.target.closest('.post-menu-dropdown')) {
      document.querySelectorAll('.post-menu-dropdown.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }
    
    if (!e.target.closest('.btn-share') && !e.target.closest('.share-menu')) {
      document.querySelectorAll('.share-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
}

// Handle edit post
function handleEditPost() {
  const postId = this.dataset.postId;
  const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
  const postContent = postCard.querySelector('.post-content');
  const originalContent = postContent.textContent.trim();
  
  // Close menu
  this.closest('.post-menu-dropdown').classList.remove('show');
  
  // Replace content with edit form
  postContent.innerHTML = `
    <textarea class="edit-post-textarea" style="width: 100%; padding: 10px; min-height: 100px; margin-bottom: 10px; border: 1px solid var(--primary-color); border-radius: 4px;">${originalContent}</textarea>
    <div class="edit-actions" style="display: flex; gap: 10px;">
      <button type="button" class="action-btn save-edit-btn" style="background-color: var(--primary-color); color: white;">Save</button>
      <button type="button" class="action-btn cancel-edit-btn">Cancel</button>
    </div>
  `;
  
  // Add event listeners to buttons
  postContent.querySelector('.save-edit-btn').addEventListener('click', function() {
    const newContent = postContent.querySelector('.edit-post-textarea').value.trim();
    if (!newContent) {
      showToast('Post content cannot be empty', 'warning');
      return;
    }
    
    // In a real app, send update to server
    // For demo, just update the content
    postContent.innerHTML = newContent;
    showToast('Post updated successfully', 'success');
  });
  
  postContent.querySelector('.cancel-edit-btn').addEventListener('click', function() {
    postContent.innerHTML = originalContent;
  });
}

// Handle delete post
function handleDeletePost() {
  const postId = this.dataset.postId;
  const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
  
  // Close menu
  this.closest('.post-menu-dropdown').classList.remove('show');
  
  if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
    // In a real app, send delete request to server
    // For demo, just remove the post card
    if (postCard) {
      postCard.remove();
      showToast('Post deleted successfully', 'success');
    }
  }
}

// Handle archive post
function handleArchivePost() {
  const postId = this.dataset.postId;
  const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
  
  // Close menu
  this.closest('.post-menu-dropdown').classList.remove('show');
  
  // In a real app, send archive request to server
  // For demo, just remove the post card with a different message
  if (postCard) {
    postCard.remove();
    showToast('Post archived successfully', 'success');
  }
}

// Handle reminder
function handleRemindPost() {
  const username = this.dataset.username;
  
  // Close menu
  this.closest('.post-menu-dropdown').classList.remove('show');
  
  // In a real app, send reminder notification
  showToast(`Gentle reminder sent to ${username}`, 'success');
}

// Handle meeting request
function handleMeetingPost() {
  const username = this.dataset.username;
  
  // Close menu
  this.closest('.post-menu-dropdown').classList.remove('show');
  
  // In a real app, send meeting request
  showToast(`Meeting request sent to ${username}`, 'success');
}

// Handle scroll for infinite loading
function handleScroll() {
  if (state.loading || state.endOfFeed) return;
  
  const scrollY = window.scrollY;
  const visibleHeight = window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const bottomOfPage = visibleHeight + scrollY >= pageHeight - 200;
  
  if (bottomOfPage) {
    loadPosts();
  }
}

// Handle feed switch
function switchFeed(feedType) {
  if (feedType === state.currentFeed) return;
  
  // Update active button
  document.querySelectorAll('.feed-switcher, .filter-option').forEach(button => {
    const isActive = (button.dataset.feed === feedType) || 
                     (button.dataset.filter === feedType);
    button.classList.toggle('active', isActive);
  });

  // Reset state
  state.currentFeed = feedType;
  state.posts = [];
  state.page = 1;
  state.endOfFeed = false;
  
  // Clear posts container
  const container = document.getElementById('posts-container');
  if (container) {
    container.innerHTML = '<div class="loading">Loading posts...</div>';
  }
  
  // Hide end of feed indicator
  const endOfFeedEl = document.getElementById('end-of-feed');
  if (endOfFeedEl) {
    endOfFeedEl.style.display = 'none';
  }
  
  // Load new posts
  loadPosts();
}

// Handle post submission
function handlePostSubmit(e) {
  e.preventDefault();
  
  const contentField = document.getElementById('post-input');
  const imageContainer = document.getElementById('image-preview-container');
  
  if (!contentField) return;
  
  const content = contentField.value.trim();
  const hasImages = imageContainer && imageContainer.children.length > 0;
  
  if (!content && !hasImages) {
    showToast('Please enter content or add an image', 'warning');
    return;
  }
  
  const submitBtn = document.getElementById('post-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
  }
  
  // In a real app, create FormData and send to server
  setTimeout(() => {
    // Create new post object
    const post = {
      id: 'post-' + Date.now(),
      content: content,
      author: {
        username: localStorage.getItem('username') || 'You'
      },
      createdAt: new Date().toISOString(),
      interestCount: 0,
      images: []
    };
    
    // Add image data if any
    if (hasImages) {
      Array.from(imageContainer.querySelectorAll('img')).forEach((img, index) => {
        post.images.push({
          url: img.src,
          id: 'img-' + Date.now() + '-' + index
        });
      });
    }
    
    // Add to state and render
    state.posts.unshift(post);
    
    // Create post element and add to container
    const container = document.getElementById('posts-container');
    if (container) {
      const postEl = createPostElement(post);
      container.insertBefore(postEl, container.firstChild);
      setupPostInteractions();
    }
    
    // Reset form
    contentField.value = '';
    if (imageContainer) {
      imageContainer.innerHTML = '';
    }
    
    // Reset button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Post';
    }
    
    showToast('Post created successfully!', 'success');
  }, 1000);
}

// Handle interested button
function handleInterested() {
  this.classList.toggle('active');
  
  const postId = this.dataset.postId;
  const statsEl = this.closest('.post-actions-bar').querySelector('.post-stats');
  
  if (!statsEl) return;
  
  // Get current count
  let count = parseInt(statsEl.textContent);
  if (isNaN(count)) count = 0;
  
  // Update count based on new state
  if (this.classList.contains('active')) {
    count++;
    showToast('You expressed interest in this post', 'success');
  } else {
    count = Math.max(0, count - 1);
  }
  
  // Update UI
  statsEl.textContent = `${count} interested`;
  
  // In a real app, send to server
}

// Handle contact
function handleContact() {
  const username = this.dataset.username;
  
  // In a real app, open messaging interface
  showToast(`Message request sent to ${username}`, 'success');
}

// Handle share
function handleShare(e) {
  e.stopPropagation();
  
  const postId = this.dataset.postId;
  const shareMenu = document.querySelector(`.share-menu[data-post-id="${postId}"]`);
  
  if (!shareMenu) return;
  
  // Close all other menus
  document.querySelectorAll('.share-menu.show').forEach(menu => {
    if (menu !== shareMenu) menu.classList.remove('show');
  });
  
  // Toggle this menu
  shareMenu.classList.toggle('show');
  
  // Position the menu correctly
  const rect = this.getBoundingClientRect();
  shareMenu.style.top = `${rect.bottom + window.scrollY + 5}px`;
  shareMenu.style.left = `${rect.left + window.scrollX}px`;
}

// Handle share option
function handleShareOption() {
  const type = this.className.split(' ')[1].split('-')[1];
  const postId = this.dataset.postId;
  
  // Close menu
  this.closest('.share-menu').classList.remove('show');
  
  // Different actions based on type
  switch (type) {
    case 'internal':
      showToast('Shared with your connections', 'success');
      break;
    case 'twitter':
    case 'linkedin':
    case 'facebook':
      showToast(`Shared on ${type.charAt(0).toUpperCase() + type.slice(1)}`, 'success');
      break;
    case 'link':
      // Copy post link to clipboard
      const dummyInput = document.createElement('input');
      const postUrl = `${window.location.origin}/post/${postId}`;
      dummyInput.value = postUrl;
      document.body.appendChild(dummyInput);
      dummyInput.select();
      document.execCommand('copy');
      document.body.removeChild(dummyInput);
      
      showToast('Link copied to clipboard', 'success');
      break;
  }
}

// Handle image click
function handleImageClick() {
  const modal = document.querySelector('.modal-overlay');
  const modalImg = modal?.querySelector('.modal-image');
  
  if (!modal || !modalImg) return;
  
  modalImg.src = this.src;
  modal.classList.add('active');
}

// Run post diagnostics
function runDiagnostics() {
  const resultsDiv = document.getElementById('diagnostics-results');
  const contentDiv = document.getElementById('diagnostics-content');
  
  if (!resultsDiv || !contentDiv) {
    console.error('Diagnostics elements not found');
    return;
  }
  
  resultsDiv.style.display = 'block';
  contentDiv.innerHTML = '<p>Running diagnostics...</p>';
  
  // Collect data
  const diagnostics = {
    browser: navigator.userAgent,
    time: new Date().toISOString(),
    auth: {
      tokenExists: !!localStorage.getItem('token'),
      usernameExists: !!localStorage.getItem('username')
    },
    dom: {
      postFormExists: !!document.getElementById('post-form'),
      postsContainerExists: !!document.getElementById('posts-container'),
      modalExists: !!document.querySelector('.modal-overlay')
    },
    api: {
      online: navigator.onLine
    }
  };
  
  // Test API connection
  fetch('/api/status')
    .then(response => {
      diagnostics.api.statusCode = response.status;
      diagnostics.api.ok = response.ok;
      return response.text();
    })
    .catch(error => {
      diagnostics.api.error = error.message;
    })
    .finally(() => {
      showDiagnosticsResults(diagnostics, contentDiv);
    });
}

// Show diagnostics results
function showDiagnosticsResults(data, container) {
  // Generate report
  let html = '<h4>Diagnostics Report</h4>';
  
  // Add summary
  const issues = [];
  if (!data.auth.tokenExists) issues.push('Not logged in');
  if (!data.dom.postFormExists) issues.push('Post form not found');
  if (!data.dom.postsContainerExists) issues.push('Posts container not found');
  if (!data.api.online) issues.push('Browser is offline');
  if (data.api.error) issues.push(`API error: ${data.api.error}`);
  
  if (issues.length === 0) {
    html += '<p style="color: green; font-weight: bold;">✓ All systems operational</p>';
  } else {
    html += '<p style="color: red; font-weight: bold;">✗ Issues detected:</p>';
    html += '<ul>';
    issues.forEach(issue => {
      html += `<li>${issue}</li>`;
    });
    html += '</ul>';
  }
  
  // Add detailed data
  html += '<h4>Technical Details</h4>';
  html += `<pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 300px;">${JSON.stringify(data, null, 2)}</pre>`;
  
  // Add recommendations
  html += '<h4>Recommendations</h4>';
  html += '<ul>';
  if (!data.auth.tokenExists) html += '<li>Please log in to use all features</li>';
  if (data.api.error || !data.api.ok) html += '<li>Try refreshing the page or check your internet connection</li>';
  html += '<li>Clear your browser cache and reload if problems persist</li>';
  html += '</ul>';
  
  container.innerHTML = html;
}

// Helper to safely format dates
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Unknown date';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeed);
} else {
  initFeed();
}