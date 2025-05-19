/**
 * Guaranteed Post System
 * A standalone implementation that will work regardless of other code
 */

(function() {
  console.log('[GuaranteedPost] Initializing guaranteed post system');
  
  // Wait for DOM to be ready
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  // Main initialization function
  ready(function() {
    console.log('[GuaranteedPost] DOM is ready');
    
    // Find post form or create one if needed
    let postForm = document.getElementById('post-form');
    let postContent = document.getElementById('post-content');
    let postContainer = document.getElementById('posts-container');
    
    // If no post form exists, create one
    if (!postForm) {
      console.log('[GuaranteedPost] No post form found, creating one');
      postForm = createPostForm();
    }
    
    // If no content field found, look for it or create one
    if (!postContent) {
      postContent = postForm.querySelector('textarea');
      if (!postContent) {
        console.log('[GuaranteedPost] No content field found, creating one');
        postContent = document.createElement('textarea');
        postContent.id = 'post-content';
        postContent.placeholder = 'Share your idea or innovation...';
        postForm.insertBefore(postContent, postForm.firstChild);
      }
    }
    
    // Override existing form handler
    console.log('[GuaranteedPost] Setting up form submission handler');
    postForm.onsubmit = function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent other handlers from running
      
      console.log('[GuaranteedPost] Form submitted');
      
      const content = postContent.value.trim();
      if (!content) {
        alert('Please enter some content for your post');
        return false;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create posts');
        return false;
      }
      
      // Find submit button
      const submitBtn = postForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Posting...';
      }
      
      // Create status indicator
      const statusIndicator = document.createElement('div');
      statusIndicator.style.color = 'blue';
      statusIndicator.style.marginTop = '10px';
      statusIndicator.textContent = 'Creating post...';
      postForm.appendChild(statusIndicator);
      
      console.log('[GuaranteedPost] Sending post creation request');
      
      // Use ultra-reliable fetch approach
      fetch('/api/posts/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })
      .then(function(response) {
        console.log('[GuaranteedPost] Received response:', response.status);
        return response.text().then(function(text) {
          try {
            return { ok: response.ok, data: JSON.parse(text), status: response.status };
          } catch (e) {
            return { ok: response.ok, text: text, status: response.status };
          }
        });
      })
      .then(function(result) {
        if (result.ok) {
          console.log('[GuaranteedPost] Post created successfully');
          postContent.value = '';
          statusIndicator.style.color = 'green';
          statusIndicator.textContent = 'Post created successfully!';
          
          // Reload posts if container exists
          if (postContainer) {
            loadPosts();
          }
          
          // If we don't have a post container, offer to reload
          if (!postContainer && confirm('Post created successfully! Reload page to see new posts?')) {
            window.location.reload();
          }
        } else {
          console.error('[GuaranteedPost] Error creating post:', result.status, result.data || result.text);
          statusIndicator.style.color = 'red';
          statusIndicator.textContent = 'Error creating post: ' + (result.data?.message || `Server error (${result.status})`);
        }
      })
      .catch(function(error) {
        console.error('[GuaranteedPost] Network error:', error);
        statusIndicator.style.color = 'red';
        statusIndicator.textContent = 'Network error: ' + error.message;
      })
      .finally(function() {
        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Post';
        }
        
        // Remove status indicator after 5 seconds
        setTimeout(function() {
          if (statusIndicator.parentNode) {
            statusIndicator.parentNode.removeChild(statusIndicator);
          }
        }, 5000);
      });
      
      return false;
    };
    
    // Load posts immediately if container exists
    if (postContainer) {
      loadPosts();
    }
    
    // Create a post form if needed
    function createPostForm() {
      console.log('[GuaranteedPost] Creating new post form');
      
      const formContainer = document.createElement('div');
      formContainer.className = 'post-form-container';
      formContainer.style.backgroundColor = '#fff';
      formContainer.style.padding = '20px';
      formContainer.style.borderRadius = '8px';
      formContainer.style.marginBottom = '20px';
      formContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      
      const form = document.createElement('form');
      form.id = 'post-form';
      
      const textarea = document.createElement('textarea');
      textarea.id = 'post-content';
      textarea.placeholder = 'Share your idea or innovation...';
      textarea.style.width = '100%';
      textarea.style.minHeight = '100px';
      textarea.style.padding = '10px';
      textarea.style.marginBottom = '10px';
      textarea.style.border = '1px solid #ddd';
      textarea.style.borderRadius = '4px';
      textarea.style.fontFamily = 'inherit';
      
      const btnContainer = document.createElement('div');
      btnContainer.style.display = 'flex';
      btnContainer.style.justifyContent = 'flex-end';
      
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'btn primary-btn';
      submitBtn.textContent = 'Post';
      submitBtn.style.padding = '8px 16px';
      submitBtn.style.backgroundColor = '#4361ee';
      submitBtn.style.color = 'white';
      submitBtn.style.border = 'none';
      submitBtn.style.borderRadius = '4px';
      submitBtn.style.cursor = 'pointer';
      
      btnContainer.appendChild(submitBtn);
      form.appendChild(textarea);
      form.appendChild(btnContainer);
      formContainer.appendChild(form);
      
      // Find a good place to insert it
      const mainElement = document.querySelector('main') || document.querySelector('.container');
      if (mainElement) {
        // Try to find a good location
        const existingFormContainer = mainElement.querySelector('.post-form-container');
        if (existingFormContainer) {
          console.log('[GuaranteedPost] Found existing form container, replacing it');
          existingFormContainer.parentNode.replaceChild(formContainer, existingFormContainer);
        } else {
          const h2 = mainElement.querySelector('h2');
          if (h2 && h2.textContent.toLowerCase().includes('post')) {
            console.log('[GuaranteedPost] Inserting after post heading');
            h2.parentNode.insertBefore(formContainer, h2.nextSibling);
          } else {
            console.log('[GuaranteedPost] Inserting at the beginning of main element');
            mainElement.insertBefore(formContainer, mainElement.firstChild);
          }
        }
      } else {
        // Last resort - append to body
        console.log('[GuaranteedPost] Appending to body');
        document.body.appendChild(formContainer);
      }
      
      return form;
    }
    
    // Load posts
    function loadPosts() {
      if (!postContainer) return;
      
      console.log('[GuaranteedPost] Loading posts');
      postContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Loading posts...</div>';
      
      const token = localStorage.getItem('token');
      if (!token) {
        postContainer.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">You must be logged in to view posts</div>';
        return;
      }
      
      // Use the simplified posts endpoint
      fetch('/api/posts/basic', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(function(response) {
        console.log('[GuaranteedPost] Posts response status:', response.status);
        return response.text().then(function(text) {
          try {
            return { ok: response.ok, data: JSON.parse(text), status: response.status };
          } catch (e) {
            return { ok: response.ok, text: text, status: response.status };
          }
        });
      })
      .then(function(result) {
        if (result.ok && Array.isArray(result.data)) {
          console.log(`[GuaranteedPost] Loaded ${result.data.length} posts`);
          
          if (result.data.length === 0) {
            postContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No posts found. Be the first to post!</div>';
            return;
          }
          
          // Render posts
          postContainer.innerHTML = '';
          result.data.forEach(function(post) {
            const postElement = renderPost(post);
            postContainer.appendChild(postElement);
          });
        } else {
          console.error('[GuaranteedPost] Error loading posts:', result);
          postContainer.innerHTML = `
            <div style="color: red; text-align: center; padding: 20px;">
              Error loading posts: ${result.data?.message || `Server error (${result.status})`}
              <div><button id="retry-load-btn" style="margin-top: 10px; padding: 5px 10px;">Retry</button></div>
            </div>
          `;
          
          document.getElementById('retry-load-btn').addEventListener('click', function() {
            loadPosts();
          });
        }
      })
      .catch(function(error) {
        console.error('[GuaranteedPost] Network error loading posts:', error);
        postContainer.innerHTML = `
          <div style="color: red; text-align: center; padding: 20px;">
            Network error: ${error.message}
            <div><button id="retry-load-btn" style="margin-top: 10px; padding: 5px 10px;">Retry</button></div>
          </div>
        `;
        
        document.getElementById('retry-load-btn').addEventListener('click', function() {
          loadPosts();
        });
      });
    }
    
    // Render individual post
    function renderPost(post) {
      const postElement = document.createElement('div');
      postElement.className = 'post';
      postElement.setAttribute('data-post-id', post.id);
      postElement.style.backgroundColor = '#fff';
      postElement.style.borderRadius = '8px';
      postElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      postElement.style.marginBottom = '20px';
      postElement.style.overflow = 'hidden';
      
      const date = new Date(post.created_at);
      const formattedDate = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      postElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-weight: bold;">${post.username || 'Anonymous'}</div>
          <div style="color: #666; font-size: 0.9em;">${formattedDate}</div>
        </div>
        <div style="padding: 15px;">${post.content}</div>
        <div style="padding: 10px 15px; border-top: 1px solid #f0f0f0;">
          <button class="interest-btn" data-post-id="${post.id}" style="background: none; border: none; cursor: pointer; padding: 5px 10px;">
            <span>👍</span> 
            <span class="interest-count">${post.interested_users ? post.interested_users.length : 0}</span>
          </button>
          ${post.is_owner ? `
            <button class="delete-btn" data-post-id="${post.id}" style="background: none; border: none; cursor: pointer; padding: 5px 10px; color: #f44336; float: right;">
              <span>🗑️</span> Delete
            </button>
          ` : ''}
        </div>
      `;
      
      // Add event listener for interest button
      const interestBtn = postElement.querySelector('.interest-btn');
      if (interestBtn) {
        interestBtn.addEventListener('click', function() {
          const postId = this.getAttribute('data-post-id');
          toggleInterest(postId, this);
        });
      }
      
      // Add event listener for delete button
      const deleteBtn = postElement.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
          if (confirm('Are you sure you want to delete this post?')) {
            const postId = this.getAttribute('data-post-id');
            deletePost(postId, postElement);
          }
        });
      }
      
      return postElement;
    }
    
    // Toggle interest in a post
    function toggleInterest(postId, button) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to show interest');
        return;
      }
      
      // Update UI optimistically
      const countElement = button.querySelector('.interest-count');
      const currentCount = parseInt(countElement.textContent || '0');
      const isInterested = button.classList.contains('interested');
      
      if (isInterested) {
        button.classList.remove('interested');
        countElement.textContent = currentCount - 1;
      } else {
        button.classList.add('interested');
        countElement.textContent = currentCount + 1;
      }
      
      // Make API request
      fetch(`/api/posts/${postId}/interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        // Update UI with accurate data from server
        countElement.textContent = data.interestedCount;
        
        if (data.interested) {
          button.classList.add('interested');
        } else {
          button.classList.remove('interested');
        }
      })
      .catch(function(error) {
        console.error('[GuaranteedPost] Error toggling interest:', error);
        
        // Revert UI on error
        if (isInterested) {
          button.classList.add('interested');
          countElement.textContent = currentCount;
        } else {
          button.classList.remove('interested');
          countElement.textContent = currentCount;
        }
        
        alert('Error updating interest');
      });
    }
    
    // Delete a post
    function deletePost(postId, postElement) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to delete posts');
        return;
      }
      
      postElement.style.opacity = '0.5';
      
      fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(function(response) {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        
        // Remove post from DOM
        if (postElement.parentNode) {
          postElement.parentNode.removeChild(postElement);
        }
      })
      .catch(function(error) {
        console.error('[GuaranteedPost] Error deleting post:', error);
        postElement.style.opacity = '1';
        alert('Error deleting post: ' + error.message);
      });
    }
  });
})();
