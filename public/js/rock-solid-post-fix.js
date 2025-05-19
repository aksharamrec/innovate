/**
 * ROCK SOLID POST CREATION FIX
 * Maximum compatibility version that works in any environment
 */

// Self-executing function with immediate execution
(function() {
  console.log('🪨 ROCK SOLID POST FIX: Loading...');
  
  // Force execution immediately AND after DOM is loaded for maximum reliability
  executePostFix();
  window.addEventListener('DOMContentLoaded', executePostFix);
  document.addEventListener('DOMContentLoaded', executePostFix);
  setTimeout(executePostFix, 100);
  setTimeout(executePostFix, 500);
  
  // Prevent multiple initializations
  let initialized = false;
  
  function executePostFix() {
    if (initialized) return;
    
    const form = document.getElementById('create-post-form');
    const modal = document.getElementById('create-post-modal');
    const postsContainer = document.getElementById('posts-container');
    
    // Only proceed if we're on the right page
    if (!form || !postsContainer) {
      console.log('🪨 ROCK SOLID POST FIX: Not on post page or elements not found');
      return;
    }
    
    console.log('🪨 ROCK SOLID POST FIX: Elements found, initializing...');
    initialized = true;
    
    // 1. Replace the form with a clean copy to remove any conflicting handlers
    const newForm = form.cloneNode(true);
    if (form.parentNode) {
      form.parentNode.replaceChild(newForm, form);
    }
    
    // 2. Get critical elements
    const contentField = document.getElementById('post-content');
    const imageField = document.getElementById('post-image');
    const submitButton = newForm.querySelector('button[type="submit"]') || newForm.querySelector('button');
    
    if (!contentField || !submitButton) {
      console.error('🪨 ROCK SOLID POST FIX: Critical elements missing');
      return;
    }
    
    // 3. Add post button if needed
    addPostButton(modal);
    
    // 4. Set up direct form submission
    newForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitPost();
    });
    
    // 5. Add direct click handler on button
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      submitPost();
    });
    
    // 6. Set up modal close handlers
    setupModalClosers(modal);
    
    // 7. Add scheduling UI if needed
    addSchedulingUI(newForm);
    
    // 8. Set up image preview
    setupImagePreview();
    
    // Handle post submission
    function submitPost() {
      try {
        console.log('🪨 ROCK SOLID POST FIX: Processing submission');
        
        // Get form data
        const content = contentField.value.trim();
        const hasImage = imageField && imageField.files && imageField.files.length > 0;
        
        // Get scheduling info if available
        const scheduleToggle = document.getElementById('schedule-toggle');
        const isScheduled = scheduleToggle && scheduleToggle.checked;
        const scheduleDate = document.getElementById('schedule-date')?.value;
        const scheduleTime = document.getElementById('schedule-time')?.value;
        
        console.log('🪨 ROCK SOLID POST FIX: Form data', {
          content: content.substring(0, 20) + (content.length > 20 ? '...' : ''),
          hasImage,
          isScheduled,
          scheduleDate,
          scheduleTime
        });
        
        // Validate
        if (!content && !hasImage) {
          alert('Please add some content or an image to your post');
          return;
        }
        
        // Validate scheduling
        let scheduledTimestamp = null;
        if (isScheduled) {
          if (!scheduleDate || !scheduleTime) {
            alert('Please select both date and time for scheduling');
            return;
          }
          
          scheduledTimestamp = new Date(`${scheduleDate}T${scheduleTime}`);
          if (isNaN(scheduledTimestamp.getTime())) {
            alert('Invalid date or time format');
            return;
          }
          
          if (scheduledTimestamp <= new Date()) {
            alert('Scheduled time must be in the future');
            return;
          }
        }
        
        // Disable button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.textContent = 'Posting...';
        
        // Set safety timeout
        const safetyTimeout = setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = 'Post';
        }, 5000);
        
        // Process image or create post directly
        if (hasImage) {
          const file = imageField.files[0];
          const reader = new FileReader();
          
          reader.onload = function(e) {
            createPost(content, e.target.result, scheduledTimestamp);
            clearTimeout(safetyTimeout);
          };
          
          reader.onerror = function() {
            console.error('🪨 ROCK SOLID POST FIX: Failed to read image');
            alert('Error reading image file. Creating post without image.');
            createPost(content, null, scheduledTimestamp);
            clearTimeout(safetyTimeout);
          };
          
          try {
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('🪨 ROCK SOLID POST FIX: Error reading file:', error);
            alert('Error processing image. Creating post without image.');
            createPost(content, null, scheduledTimestamp);
            clearTimeout(safetyTimeout);
          }
        } else {
          createPost(content, null, scheduledTimestamp);
          clearTimeout(safetyTimeout);
        }
      } catch (error) {
        console.error('🪨 ROCK SOLID POST FIX: Submit error:', error);
        alert('Error creating post: ' + error.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Post';
      }
    }
    
    function createPost(content, imageData, scheduledDate) {
      try {
        // Get user info from token
        const token = localStorage.getItem('token');
        let userId = 1;
        let username = 'User';
        
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const base64Url = tokenParts[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              
              const tokenData = JSON.parse(jsonPayload);
              userId = tokenData.id || 1;
              username = tokenData.username || 'User';
            }
          } catch (e) {
            console.error('🪨 ROCK SOLID POST FIX: Token parse error:', e);
          }
        }
        
        // Create post object
        const post = {
          id: Date.now(),
          user_id: userId,
          username: username,
          content: content,
          created_at: new Date().toISOString(),
          interested_users: "[]"
        };
        
        // Add image if provided
        if (imageData) {
          post.image_url = imageData;
        }
        
        // Add scheduling information if provided
        if (scheduledDate) {
          post.scheduled_for = scheduledDate.toISOString();
          post.status = 'scheduled';
        } else {
          post.status = 'published';
        }
        
        // Get existing posts safely
        let posts = [];
        try {
          const postsData = localStorage.getItem('posts');
          if (postsData) {
            const parsedPosts = JSON.parse(postsData);
            if (Array.isArray(parsedPosts)) {
              posts = parsedPosts;
            }
          }
        } catch (e) {
          console.error('🪨 ROCK SOLID POST FIX: Error reading posts:', e);
        }
        
        // Add new post (published at beginning, scheduled at end)
        if (post.status === 'scheduled') {
          posts.push(post);
        } else {
          posts.unshift(post);
        }
        
        // Save back to localStorage
        localStorage.setItem('posts', JSON.stringify(posts));
        console.log('🪨 ROCK SOLID POST FIX: Post saved successfully');
        
        // Reset UI
        newForm.reset();
        
        // Clear image preview
        const preview = document.getElementById('image-preview');
        if (preview) {
          preview.innerHTML = '';
          preview.style.display = 'none';
        }
        
        // Reset scheduling UI
        const scheduleToggle = document.getElementById('schedule-toggle');
        if (scheduleToggle) scheduleToggle.checked = false;
        
        const scheduleInputs = document.getElementById('schedule-inputs');
        if (scheduleInputs) scheduleInputs.style.display = 'none';
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = 'Post';
        
        // Close modal
        if (modal) modal.style.display = 'none';
        
        // Show success message
        if (scheduledDate) {
          alert(`Post scheduled for ${scheduledDate.toLocaleString()}`);
        } else {
          alert('Post created successfully!');
          // Reload to show new post
          window.location.reload();
        }
      } catch (error) {
        console.error('🪨 ROCK SOLID POST FIX: Create post error:', error);
        alert('Error saving post: ' + error.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Post';
      }
    }
  }
  
  // Helper functions
  function setupImagePreview() {
    const imageInput = document.getElementById('post-image');
    if (!imageInput) return;
    
    // Get or create preview container
    let preview = document.getElementById('image-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'image-preview';
      preview.style.display = 'none';
      preview.style.marginTop = '10px';
      
      const parent = imageInput.parentNode;
      if (parent) {
        parent.insertBefore(preview, imageInput.nextSibling);
      }
    }
    
    // Set up file selection handler
    imageInput.addEventListener('change', function() {
      const file = this.files?.[0];
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
      
      // Create preview
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
        document.getElementById('remove-image')?.addEventListener('click', function() {
          preview.innerHTML = '';
          preview.style.display = 'none';
          imageInput.value = '';
        });
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  function addSchedulingUI(form) {
    // Don't add if it already exists
    if (document.getElementById('schedule-toggle')) {
      return;
    }
    
    // Find insertion point - after image preview or form group
    let insertAfter;
    const imagePreview = document.getElementById('image-preview');
    
    if (imagePreview) {
      insertAfter = imagePreview;
    } else {
      insertAfter = form.querySelector('.form-group') || form.firstElementChild;
    }
    
    if (!insertAfter) return;
    
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
    inputsGroup.className = 'form-group schedule-inputs';
    inputsGroup.style.cssText = 'display: none; margin: 10px 0 15px; padding: 15px; background-color: #f0f2f5; border-radius: 5px; border: 1px solid #e1e4e8;';
    
    // Set tomorrow's date as default
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
    toggle?.addEventListener('change', function() {
      const inputs = document.getElementById('schedule-inputs');
      if (inputs) {
        inputs.style.display = this.checked ? 'block' : 'none';
      }
    });
  }
  
  function addPostButton(modal) {
    // Skip if button already exists
    if (document.getElementById('new-post-button') || document.getElementById('new-post-trigger')) {
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
      zIndex: '9999'
    });
    
    // Add click handler
    button.addEventListener('click', function() {
      if (modal) {
        modal.style.display = 'block';
        const textarea = document.getElementById('post-content');
        if (textarea) textarea.focus();
      }
    });
    
    // Add to document
    document.body.appendChild(button);
  }
  
  function setupModalClosers(modal) {
    if (!modal) return;
    
    // Add close button functionality
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    // Close when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
})();
