/**
 * CRITICAL EMERGENCY FIX FOR POST CREATION
 * Ultra-reliable implementation with debugging and error tracing
 */

(function() {
  // Initialize immediately and provide console debug info
  console.log('🚨 EMERGENCY POST FIX: Starting initialization (v1.1)');

  // Define key variables at the top level scope
  let form, submitBtn, contentField, imageField, modal;
  let attemptCount = 0;
  const MAX_ATTEMPTS = 5;

  // Try initializing immediately and then retry with increasing delays
  tryInitialize();
  setTimeout(tryInitialize, 100);
  setTimeout(tryInitialize, 300);
  setTimeout(tryInitialize, 700);
  setTimeout(tryInitialize, 1500);

  // Main initialization function with retries
  function tryInitialize() {
    attemptCount++;
    console.log(`🔄 EMERGENCY POST FIX: Attempt ${attemptCount} of ${MAX_ATTEMPTS}`);
    
    try {
      // Find elements
      form = document.getElementById('create-post-form');
      modal = document.getElementById('create-post-modal');
      contentField = document.getElementById('post-content');
      imageField = document.getElementById('post-image');
      
      // Log what we found for debugging
      console.log('🔍 EMERGENCY POST FIX: Element check:', {
        form: !!form,
        modal: !!modal,
        contentField: !!contentField,
        imageField: !!imageField
      });
      
      // If not all elements exist, just return and wait for next attempt
      if (!form || !contentField) {
        console.log('⏳ EMERGENCY POST FIX: Missing required elements, waiting for next attempt');
        return;
      }
      
      // Find or create submit button
      submitBtn = form.querySelector('button[type="submit"], button.primary-btn');
      if (!submitBtn) {
        console.log('⚠️ EMERGENCY POST FIX: Creating emergency submit button');
        submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'primary-btn';
        submitBtn.innerHTML = 'Post';
        submitBtn.style.width = '100%';
        submitBtn.style.marginTop = '15px';
        form.appendChild(submitBtn);
      }
      
      // Log that we found all necessary elements
      console.log('✅ EMERGENCY POST FIX: All required elements found, proceeding with setup');
      
      // Remove any existing event listeners by cloning the form
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      form = newForm;
      
      // Re-get submit button after cloning
      submitBtn = form.querySelector('button[type="submit"], button.primary-btn');
      
      // Set up form submission with multiple approaches for redundancy
      setupFormSubmission();
      
      // Set up image preview
      setupImagePreview();
      
      // Set up modal controls
      setupModalControls();
      
      // Create post button if needed
      createPostButton();
      
      console.log('✅ EMERGENCY POST FIX: Setup completed successfully');
      
      // Since we successfully set up, stop further attempts
      attemptCount = MAX_ATTEMPTS;
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error during initialization:', err);
      if (attemptCount >= MAX_ATTEMPTS) {
        // Show visible error in the UI if all attempts failed
        showDebugMessage('Failed to initialize post functionality. Please refresh the page and try again.');
      }
    }
  }
  
  // Set up the form submission with multiple redundant approaches
  function setupFormSubmission() {
    // 1. Traditional form submission listener
    form.addEventListener('submit', handleSubmit);
    
    // 2. Direct event assignment as backup
    form.onsubmit = function(e) {
      e.preventDefault();
      handleSubmit(e);
      return false; // Ensure no default submission
    };
    
    // 3. Direct click on submit button as fallback
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🖱️ EMERGENCY POST FIX: Submit button clicked directly');
      handleSubmit(e);
    });
    
    console.log('✅ EMERGENCY POST FIX: Form submission handlers set up');
  }
  
  // Handle form submission - main logic
  function handleSubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Stop event propagation to prevent other handlers
    }
    
    console.log('📝 EMERGENCY POST FIX: Form submission detected');
    
    try {
      // Get the most current form elements (in case DOM has changed)
      const currentForm = document.getElementById('create-post-form');
      const currentContent = document.getElementById('post-content');
      const currentImage = document.getElementById('post-image');
      const currentSubmitBtn = currentForm.querySelector('button[type="submit"], button.primary-btn');
      
      // Get form data
      const content = currentContent.value.trim();
      const hasImage = currentImage && currentImage.files && currentImage.files.length > 0;
      
      console.log('📊 EMERGENCY POST FIX: Post data:', {
        contentLength: content.length,
        hasImage: hasImage
      });
      
      // Validate
      if (!content && !hasImage) {
        alert('Please add some text or an image to your post');
        return;
      }
      
      // Display submission state
      if (currentSubmitBtn) {
        currentSubmitBtn.disabled = true;
        currentSubmitBtn.textContent = 'Posting...';
      }
      
      // Safety timeout to re-enable button if something fails
      const buttonTimeout = setTimeout(() => {
        if (currentSubmitBtn) {
          currentSubmitBtn.disabled = false;
          currentSubmitBtn.textContent = 'Post';
        }
      }, 8000);
      
      // Process image if present
      if (hasImage) {
        const file = currentImage.files[0];
        processImageAndSavePost(file, content, currentForm, currentSubmitBtn, buttonTimeout);
      } else {
        // No image - create post directly
        savePost(content, null, currentForm, currentSubmitBtn, buttonTimeout);
      }
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error handling submission:', err);
      alert('Error submitting post: ' + err.message);
      
      // Reset submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    }
  }
  
  // Process image file and save post
  function processImageAndSavePost(file, content, form, submitBtn, timeout) {
    try {
      console.log('🖼️ EMERGENCY POST FIX: Processing image:', file.name);
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          console.log('✅ EMERGENCY POST FIX: Image processed successfully');
          savePost(content, e.target.result, form, submitBtn, timeout);
        } catch (err) {
          console.error('❌ EMERGENCY POST FIX: Error after image load:', err);
          alert('Error processing image. Attempting to post without image.');
          savePost(content, null, form, submitBtn, timeout);
        }
      };
      
      reader.onerror = function(err) {
        console.error('❌ EMERGENCY POST FIX: FileReader error:', err);
        alert('Error reading image file. Creating post without image.');
        savePost(content, null, form, submitBtn, timeout);
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error processing image:', err);
      alert('Error processing image. Creating post without image.');
      savePost(content, null, form, submitBtn, timeout);
    }
  }
  
  // Save post to localStorage
  function savePost(content, imageUrl, form, submitBtn, timeout) {
    try {
      console.log('💾 EMERGENCY POST FIX: Saving post to localStorage');
      
      // Get current user info
      const token = localStorage.getItem('token');
      let userId = 1;
      let username = 'User';
      
      if (token) {
        try {
          const tokenData = parseJWT(token);
          if (tokenData) {
            userId = tokenData.id || userId;
            username = tokenData.username || username;
          }
        } catch (e) {
          console.warn('⚠️ EMERGENCY POST FIX: JWT parsing failed:', e);
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
      
      // Add image if present
      if (imageUrl) {
        post.image_url = imageUrl;
      }
      
      console.log('📦 EMERGENCY POST FIX: Post object created:', post.id);
      
      // Get existing posts
      let posts = [];
      try {
        const postsJson = localStorage.getItem('posts');
        if (postsJson) {
          const parsed = JSON.parse(postsJson);
          if (Array.isArray(parsed)) {
            posts = parsed;
          } else {
            console.warn('⚠️ EMERGENCY POST FIX: Existing posts not an array, resetting');
          }
        }
      } catch (e) {
        console.error('❌ EMERGENCY POST FIX: Error reading existing posts:', e);
      }
      
      // Add new post to beginning
      posts.unshift(post);
      
      // Save back to localStorage
      localStorage.setItem('posts', JSON.stringify(posts));
      
      console.log('✅ EMERGENCY POST FIX: Post saved successfully, count:', posts.length);
      
      // Clear form
      if (form) form.reset();
      
      // Clear image preview
      const preview = document.getElementById('image-preview');
      if (preview) {
        preview.innerHTML = '';
        preview.style.display = 'none';
      }
      
      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
      
      // Clear safety timeout
      if (timeout) clearTimeout(timeout);
      
      // Close modal
      const modal = document.getElementById('create-post-modal');
      if (modal) modal.style.display = 'none';
      
      // Show success message
      alert('Post created successfully!');
      
      // Reload page to show new post
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error saving post:', err);
      alert('Error saving post: ' + err.message);
      
      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
      
      // Clear safety timeout
      if (timeout) clearTimeout(timeout);
    }
  }
  
  // Set up image preview
  function setupImagePreview() {
    try {
      const imageInput = document.getElementById('post-image');
      if (!imageInput) return;
      
      // Find or create image preview container
      let preview = document.getElementById('image-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.id = 'image-preview';
        preview.style.display = 'none';
        preview.style.marginTop = '10px';
        
        if (imageInput.parentNode) {
          imageInput.parentNode.insertBefore(preview, imageInput.nextSibling);
        }
      }
      
      // Set up change event
      imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        // Type validation
        if (!file.type.match('image.*')) {
          alert('Please select an image file');
          this.value = '';
          return;
        }
        
        // Size validation (max 5MB)
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
          
          // Set up remove button
          document.getElementById('remove-image').addEventListener('click', function() {
            preview.innerHTML = '';
            preview.style.display = 'none';
            imageInput.value = '';
          });
        };
        
        reader.readAsDataURL(file);
      });
      
      console.log('✅ EMERGENCY POST FIX: Image preview configured');
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error setting up image preview:', err);
    }
  }
  
  // Set up modal controls
  function setupModalControls() {
    try {
      const modal = document.getElementById('create-post-modal');
      if (!modal) return;
      
      // Close button
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
      
      console.log('✅ EMERGENCY POST FIX: Modal controls configured');
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error setting up modal controls:', err);
    }
  }
  
  // Create post button if needed
  function createPostButton() {
    try {
      // Check if button already exists
      if (document.getElementById('new-post-button') || document.getElementById('new-post-trigger')) {
        console.log('ℹ️ EMERGENCY POST FIX: Post button already exists');
        return;
      }
      
      const btn = document.createElement('div');
      btn.id = 'new-post-button';
      btn.innerHTML = '<i class="fas fa-plus"></i>';
      
      // Apply styles directly
      Object.assign(btn.style, {
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
      btn.addEventListener('click', function() {
        const modal = document.getElementById('create-post-modal');
        if (modal) {
          modal.style.display = 'block';
          
          // Focus on content field
          const contentField = document.getElementById('post-content');
          if (contentField) setTimeout(() => contentField.focus(), 100);
        }
      });
      
      // Add to document
      document.body.appendChild(btn);
      console.log('✅ EMERGENCY POST FIX: Created post button');
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error creating post button:', err);
    }
  }
  
  // Parse JWT token helper
  function parseJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('❌ EMERGENCY POST FIX: JWT parsing error:', e);
      return null;
    }
  }
  
  // Show debug message in the UI
  function showDebugMessage(message) {
    try {
      // Attempt to find posts container
      const container = document.getElementById('posts-container');
      if (!container) return;
      
      // Create debug element
      const debugEl = document.createElement('div');
      debugEl.style.backgroundColor = '#f8d7da';
      debugEl.style.color = '#721c24';
      debugEl.style.padding = '15px';
      debugEl.style.borderRadius = '5px';
      debugEl.style.margin = '15px 0';
      debugEl.style.border = '1px solid #f5c6cb';
      debugEl.innerHTML = `<strong>Debug:</strong> ${message}`;
      
      // Insert at top
      if (container.firstChild) {
        container.insertBefore(debugEl, container.firstChild);
      } else {
        container.appendChild(debugEl);
      }
    } catch (err) {
      console.error('❌ EMERGENCY POST FIX: Error showing debug message:', err);
    }
  }
})();
