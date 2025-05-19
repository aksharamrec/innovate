/**
 * EMERGENCY DIRECT POST FIX
 * Simple, direct implementation with no dependencies
 */

// Execute this code immediately and also on DOMContentLoaded to ensure it runs
(function runDirectPostFix() {
  console.log('DIRECT POST FIX: Running emergency fix');
  
  // Try to fix immediately and set up a backup if DOM isn't ready
  trySetupForm();
  
  // Backup initialization when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', trySetupForm);
  
  // Also try one more time after a delay
  setTimeout(trySetupForm, 500);
  
  function trySetupForm() {
    try {
      // Try to get critical elements
      const form = document.getElementById('create-post-form');
      const contentField = document.getElementById('post-content');
      const fileInput = document.getElementById('post-image');
      const modal = document.getElementById('create-post-modal');
      
      // Log diagnostics about what we found
      console.log('DIRECT POST FIX: Found elements?', { 
        form: Boolean(form), 
        contentField: Boolean(contentField), 
        fileInput: Boolean(fileInput),
        modal: Boolean(modal)
      });
      
      // Exit if essential elements don't exist
      if (!form || !contentField) {
        console.log('DIRECT POST FIX: Essential elements not ready yet');
        return;
      }

      // Get or create submit button
      let submitBtn = form.querySelector('button[type="submit"]');
      if (!submitBtn) {
        submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'primary-btn';
        submitBtn.textContent = 'Post';
        form.appendChild(submitBtn);
      }
      
      // Directly capture the submit event
      form.onsubmit = function(e) {
        e.preventDefault();
        console.log('DIRECT POST FIX: Form submitted directly');
        
        submitPostDirectly();
        return false;
      };
      
      // Also add backup click handler on submit button
      submitBtn.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('DIRECT POST FIX: Submit button clicked directly');
        
        submitPostDirectly();
      });
      
      console.log('DIRECT POST FIX: Form handlers set up successfully');
      
      // Set up the create post button/FAB if needed
      setupPostButton(modal);
      
      // Setup direct form submission handling
      function submitPostDirectly() {
        console.log('DIRECT POST FIX: Processing submission...');
        
        // Get form data directly from elements
        const content = contentField.value.trim();
        const hasImage = fileInput && fileInput.files && fileInput.files.length > 0;
        
        console.log('DIRECT POST FIX: Form data', { 
          contentLength: content.length, 
          hasImage: hasImage
        });
        
        // Validate input
        if (!content && !hasImage) {
          alert('Please add some text or an image to your post');
          return;
        }
        
        // Disable submit button to prevent double-posting
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
        
        // Safety timeout to re-enable button if something fails
        const buttonTimeout = setTimeout(function() {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post';
        }, 8000);
        
        // Handle image if present
        if (hasImage) {
          const file = fileInput.files[0];
          const reader = new FileReader();
          
          reader.onload = function(e) {
            savePost(content, e.target.result);
            clearTimeout(buttonTimeout);
          };
          
          reader.onerror = function() {
            console.error('DIRECT POST FIX: Failed to read image file');
            alert('Error processing image. Creating post without image.');
            savePost(content, null);
            clearTimeout(buttonTimeout);
          };
          
          try {
            reader.readAsDataURL(file);
          } catch (err) {
            console.error('DIRECT POST FIX: Error reading file:', err);
            alert('Failed to process image. Creating post without image.');
            savePost(content, null);
            clearTimeout(buttonTimeout);
          }
        } else {
          // No image - create post directly
          savePost(content, null);
          clearTimeout(buttonTimeout);
        }
      }
      
      // Function to save post to localStorage
      function savePost(content, imageUrl) {
        try {
          console.log('DIRECT POST FIX: Saving post');
          
          // Get user info from token if available
          const token = localStorage.getItem('token');
          let userId = 1;
          let username = 'User';
          
          if (token) {
            try {
              const tokenData = parseJwt(token);
              userId = tokenData?.id || 1;
              username = tokenData?.username || 'User';
            } catch (err) {
              console.error('DIRECT POST FIX: Error parsing token:', err);
            }
          }
          
          // Create post object
          const post = {
            id: Date.now(),
            user_id: userId,
            username: username,
            content: content,
            created_at: new Date().toISOString(),
            interested_users: "[]",
            status: 'published'
          };
          
          // Add image if present
          if (imageUrl) {
            post.image_url = imageUrl;
          }
          
          console.log('DIRECT POST FIX: Created post object:', post.id);
          
          // Save post to localStorage
          let posts = [];
          try {
            const postsData = localStorage.getItem('posts');
            if (postsData) {
              posts = JSON.parse(postsData);
              if (!Array.isArray(posts)) {
                console.warn('DIRECT POST FIX: posts is not an array, resetting');
                posts = [];
              }
            }
          } catch (err) {
            console.error('DIRECT POST FIX: Error reading posts:', err);
            posts = [];
          }
          
          // Add new post to beginning
          posts.unshift(post);
          
          // Save back to localStorage
          localStorage.setItem('posts', JSON.stringify(posts));
          
          console.log('DIRECT POST FIX: Post saved successfully');
          
          // Reset form
          form.reset();
          
          // Clear image preview if it exists
          const preview = document.getElementById('image-preview');
          if (preview) {
            preview.innerHTML = '';
            preview.style.display = 'none';
          }
          
          // Reset submit button
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post';
          
          // Close modal
          if (modal) {
            modal.style.display = 'none';
          }
          
          // Show success message
          alert('Post created successfully!');
          
          // Reload page to show new post
          window.location.reload();
        } catch (err) {
          console.error('DIRECT POST FIX: Error saving post:', err);
          alert('Error creating post: ' + err.message);
          
          // Reset submit button
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post';
        }
      }
    } catch (err) {
      console.error('DIRECT POST FIX: Setup error:', err);
    }
  }
  
  // Create post button if needed
  function setupPostButton(modal) {
    if (document.getElementById('new-post-button') || document.getElementById('new-post-trigger')) {
      return; // Button already exists
    }
    
    try {
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
        zIndex: '1000'
      });
      
      // Add click handler
      btn.addEventListener('click', function() {
        if (modal) {
          modal.style.display = 'block';
          
          // Focus on textarea
          const textarea = document.getElementById('post-content');
          if (textarea) setTimeout(() => textarea.focus(), 100);
        }
      });
      
      // Add to document
      document.body.appendChild(btn);
      console.log('DIRECT POST FIX: Added post button');
      
      // Add modal close handlers if needed
      if (modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
          });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.style.display = 'none';
          }
        });
      }
    } catch (err) {
      console.error('DIRECT POST FIX: Error creating post button:', err);
    }
  }
  
  // JWT token parser helper
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('DIRECT POST FIX: Error parsing JWT:', e);
      return null;
    }
  }
})();
