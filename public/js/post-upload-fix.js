/**
 * COMPLETE REWRITE: Simple, reliable post creation functionality
 */

(function() {
  // Execute immediately
  console.log('POST REWRITE: Initializing immediate post fix');
  
  // Wait a small delay to ensure DOM is ready
  setTimeout(function() {
    try {
      initPostCreation();
    } catch (e) {
      console.error('POST REWRITE: Error during initialization:', e);
      alert('Error initializing post creation: ' + e.message);
    }
  }, 200);
  
  function initPostCreation() {
    // Basic feature detection to ensure we're on the right page
    if (!document.getElementById('posts-container')) {
      console.log('POST REWRITE: Not on home page, skipping initialization');
      return;
    }
    
    console.log('POST REWRITE: Setting up post creation');
    
    // Create post button
    addPostButton();
    
    // Setup post form
    setupPostForm();
    
    // Add scheduling option
    addSchedulingUI();
    
    // Process any scheduled posts
    processScheduledPosts();
    
    // Check for scheduled posts periodically
    setInterval(processScheduledPosts, 60000);
  }
  
  function addPostButton() {
    // Check if button already exists
    if (document.getElementById('new-post-button')) {
      return;
    }
    
    const button = document.createElement('div');
    button.id = 'new-post-button';
    button.innerHTML = '<i class="fas fa-plus"></i>';
    
    // Apply styles directly
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#4361ee',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      zIndex: '1000'
    });
    
    // Add click handler
    button.addEventListener('click', function() {
      const modal = document.getElementById('create-post-modal');
      if (modal) {
        modal.style.display = 'block';
        
        // Focus on textarea
        const textarea = document.getElementById('post-content');
        if (textarea) textarea.focus();
      }
    });
    
    // Add button to body
    document.body.appendChild(button);
    console.log('POST REWRITE: Added post button');
  }
  
  function setupPostForm() {
    // Get the form
    const form = document.getElementById('create-post-form');
    if (!form) {
      console.error('POST REWRITE: Post form not found!');
      return;
    }
    
    console.log('POST REWRITE: Setting up post form');
    
    // Clone form to remove any existing event listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Make sure we have a submit button
    let submitButton = newForm.querySelector('button[type="submit"]');
    if (!submitButton) {
      // Create a button if needed
      submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'primary-btn';
      submitButton.textContent = 'Post';
      submitButton.style.width = '100%';
      submitButton.style.marginTop = '15px';
      newForm.appendChild(submitButton);
    }
    
    // Set up image preview
    setupImagePreview();
    
    // Add form submission handler
    newForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      console.log('POST REWRITE: Form submitted');
      
      // Get form data
      const content = document.getElementById('post-content')?.value?.trim() || '';
      const imageInput = document.getElementById('post-image');
      const hasImage = imageInput?.files?.length > 0;
      
      // Get scheduling data
      const scheduleToggle = document.getElementById('schedule-toggle');
      const isScheduled = scheduleToggle?.checked || false;
      const scheduleDate = document.getElementById('schedule-date')?.value;
      const scheduleTime = document.getElementById('schedule-time')?.value;
      
      console.log('POST REWRITE: Form data:', {
        contentLength: content.length,
        hasImage,
        isScheduled,
        scheduleDate,
        scheduleTime
      });
      
      // Validate form
      if (!content && !hasImage) {
        alert('Please add some text or an image to your post');
        return;
      }
      
      // Validate scheduling if enabled
      let scheduledDateTime = null;
      if (isScheduled) {
        if (!scheduleDate || !scheduleTime) {
          alert('Please select both date and time for scheduling');
          return;
        }
        
        const scheduleTimestamp = new Date(`${scheduleDate}T${scheduleTime}`);
        if (isNaN(scheduleTimestamp.getTime())) {
          alert('Invalid date or time format');
          return;
        }
        
        if (scheduleTimestamp <= new Date()) {
          alert('Scheduled time must be in the future');
          return;
        }
        
        scheduledDateTime = scheduleTimestamp.toISOString();
      }
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Posting...';
      
      // Safety timeout to reset button
      const resetTimeout = setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Post';
      }, 5000);
      
      // Handle post creation
      if (hasImage) {
        const file = imageInput.files[0];
        
        // Read image file
        const reader = new FileReader();
        
        reader.onload = function(event) {
          const imageData = event.target.result;
          createPost(content, imageData, scheduledDateTime);
          clearTimeout(resetTimeout);
        };
        
        reader.onerror = function() {
          alert('Error reading image file. Creating post without image.');
          createPost(content, null, scheduledDateTime);
          clearTimeout(resetTimeout);
        };
        
        reader.readAsDataURL(file);
      } else {
        createPost(content, null, scheduledDateTime);
        clearTimeout(resetTimeout);
      }
    });
    
    // Set up modal close handlers
    setupModalClosers();
  }
  
  function createPost(content, imageData, scheduledDateTime) {
    try {
      console.log('POST REWRITE: Creating post object');
      
      // Get user info from token
      const token = localStorage.getItem('token');
      
      // Default user data
      let userData = { id: 1, username: 'User' };
      
      // Try to get actual user data from token
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          userData = JSON.parse(jsonPayload);
        } catch (e) {
          console.error('POST REWRITE: Error parsing token:', e);
        }
      }
      
      // Create post object
      const post = {
        id: Date.now(),
        user_id: userData.id,
        username: userData.username || 'User',
        content: content,
        created_at: new Date().toISOString(),
        interested_users: "[]"
      };
      
      // Add image if present
      if (imageData) {
        post.image_url = imageData;
      }
      
      // Add scheduling info if present
      if (scheduledDateTime) {
        post.scheduled_for = scheduledDateTime;
        post.status = 'scheduled';
      } else {
        post.status = 'published';
      }
      
      // Save post
      savePost(post);
      
      // Reset UI
      resetForm();
      
      // Show success message
      if (scheduledDateTime) {
        const date = new Date(scheduledDateTime);
        alert(`Post scheduled for ${date.toLocaleString()}`);
      } else {
        alert('Post created successfully!');
        
        // Reload page to show new post
        window.location.reload();
      }
    } catch (error) {
      console.error('POST REWRITE: Error creating post:', error);
      alert('Error creating post: ' + error.message);
      
      // Reset button
      const submitBtn = document.querySelector('#create-post-form button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    }
  }
  
  function savePost(post) {
    console.log('POST REWRITE: Saving post', post.id);
    
    try {
      // Get existing posts
      let posts = [];
      
      try {
        const postsData = localStorage.getItem('posts');
        if (postsData) {
          posts = JSON.parse(postsData);
          if (!Array.isArray(posts)) {
            console.warn('POST REWRITE: posts data is not an array, resetting');
            posts = [];
          }
        }
      } catch (e) {
        console.error('POST REWRITE: Error reading posts from localStorage:', e);
        posts = [];
      }
      
      // Add new post
      if (post.status === 'scheduled') {
        posts.push(post); // Add scheduled posts at the end
      } else {
        posts.unshift(post); // Add published posts at the beginning
      }
      
      // Save back to localStorage
      localStorage.setItem('posts', JSON.stringify(posts));
      console.log('POST REWRITE: Post saved successfully');
      return true;
    } catch (error) {
      console.error('POST REWRITE: Error saving post:', error);
      throw new Error('Failed to save post to storage');
    }
  }
  
  function resetForm() {
    // Reset form fields
    const form = document.getElementById('create-post-form');
    if (form) form.reset();
    
    // Reset submit button
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
    
    // Clear image preview
    const preview = document.getElementById('image-preview');
    if (preview) {
      preview.innerHTML = '';
      preview.style.display = 'none';
    }
    
    // Reset scheduling toggle
    const scheduleToggle = document.getElementById('schedule-toggle');
    if (scheduleToggle) scheduleToggle.checked = false;
    
    // Hide scheduling inputs
    const scheduleInputs = document.getElementById('schedule-inputs');
    if (scheduleInputs) scheduleInputs.style.display = 'none';
    
    // Close modal
    const modal = document.getElementById('create-post-modal');
    if (modal) modal.style.display = 'none';
  }
  
  function setupImagePreview() {
    const imageInput = document.getElementById('post-image');
    if (!imageInput) return;
    
    // Get or create image preview container
    let preview = document.getElementById('image-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'image-preview';
      preview.style.display = 'none';
      preview.style.marginTop = '10px';
      imageInput.parentNode.insertBefore(preview, imageInput.nextSibling);
    }
    
    // Set up file input change handler
    imageInput.addEventListener('change', function(e) {
      const file = this.files[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        this.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Maximum size is 5MB');
        this.value = '';
        return;
      }
      
      // Show preview
      const reader = new FileReader();
      reader.onload = function(e) {
        preview.innerHTML = `
          <div style="position: relative; max-width: 100%;">
            <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
            <button type="button" id="remove-image" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; cursor: pointer;">×</button>
          </div>
        `;
        preview.style.display = 'block';
        
        // Add remove button handler
        document.getElementById('remove-image').addEventListener('click', function() {
          preview.innerHTML = '';
          preview.style.display = 'none';
          imageInput.value = '';
        });
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  function addSchedulingUI() {
    const form = document.getElementById('create-post-form');
    if (!form) return;
    
    // Check if scheduling UI already exists
    if (document.getElementById('schedule-toggle')) {
      return;
    }
    
    // Find insertion point - after image preview element or after form-group
    let insertAfter = document.getElementById('image-preview');
    if (!insertAfter || insertAfter.style.display === 'none') {
      insertAfter = form.querySelector('.form-group');
    }
    
    if (!insertAfter) {
      // Last resort - insert before submit button
      insertAfter = form.querySelector('button[type="submit"]');
      if (!insertAfter) return;
    }
    
    // Create toggle element
    const toggleGroup = document.createElement('div');
    toggleGroup.className = 'form-group schedule-toggle-group';
    toggleGroup.style.cssText = 'display: flex; align-items: center; margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px;';
    
    toggleGroup.innerHTML = `
      <label style="display: flex; align-items: center; cursor: pointer; margin-right: 10px; font-weight: bold;">
        <input type="checkbox" id="schedule-toggle" style="margin-right: 8px; width: 16px; height: 16px;">
        📅 Schedule this post for later
      </label>
    `;
    
    // Create schedule inputs
    const inputsGroup = document.createElement('div');
    inputsGroup.id = 'schedule-inputs';
    inputsGroup.className = 'form-group';
    inputsGroup.style.cssText = 'display: none; margin: 10px 0 15px; padding: 15px; background-color: #f0f2f5; border-radius: 5px; border: 1px solid #e1e4e8;';
    
    // Set default schedule time (tomorrow 9 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    inputsGroup.innerHTML = `
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; margin-bottom: 10px;">
        <label for="schedule-date" style="font-weight: 500;">Date:</label>
        <input type="date" id="schedule-date" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;" 
          value="${dateStr}" min="${new Date().toISOString().split('T')[0]}">
      </div>
      
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
        <label for="schedule-time" style="font-weight: 500;">Time:</label>
        <input type="time" id="schedule-time" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc;" 
          value="09:00">
      </div>
      
      <div style="margin-top: 10px; font-size: 12px; color: #666;">
        Your post will be published automatically at the scheduled date and time.
      </div>
    `;
    
    // Insert elements
    insertAfter.parentNode.insertBefore(toggleGroup, insertAfter.nextSibling);
    toggleGroup.parentNode.insertBefore(inputsGroup, toggleGroup.nextSibling);
    
    // Add toggle functionality
    const toggle = document.getElementById('schedule-toggle');
    toggle.addEventListener('change', function() {
      const inputs = document.getElementById('schedule-inputs');
      inputs.style.display = this.checked ? 'block' : 'none';
    });
  }
  
  function setupModalClosers() {
    // Add close handlers for all modals
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) modal.style.display = 'none';
      });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          this.style.display = 'none';
        }
      });
    });
  }
  
  function processScheduledPosts() {
    try {
      const postsData = localStorage.getItem('posts');
      if (!postsData) return;
      
      let posts = JSON.parse(postsData);
      if (!Array.isArray(posts)) return;
      
      const now = new Date();
      let updated = false;
      
      // Check for scheduled posts that are due for publishing
      posts.forEach(post => {
        if (post.status === 'scheduled' && post.scheduled_for) {
          const scheduledTime = new Date(post.scheduled_for);
          
          if (scheduledTime <= now) {
            // Update post to published status
            post.status = 'published';
            post.created_at = new Date().toISOString();
            delete post.scheduled_for;
            updated = true;
            
            console.log('POST REWRITE: Publishing scheduled post:', post.id);
          }
        }
      });
      
      // If any posts were updated, save and reload
      if (updated) {
        // Sort to bring published posts to the top
        posts.sort((a, b) => {
          // Published posts first
          if (a.status === 'published' && b.status === 'scheduled') return -1;
          if (a.status === 'scheduled' && b.status === 'published') return 1;
          
          // Then sort by date
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        // Save back to localStorage
        localStorage.setItem('posts', JSON.stringify(posts));
        
        // Reload if on posts page
        if (document.getElementById('posts-container')) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('POST REWRITE: Error processing scheduled posts:', error);
    }
  }
})();
