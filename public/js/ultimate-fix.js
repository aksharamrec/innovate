/**
 * ULTIMATE POST FIX
 * Final, standalone solution for post creation
 */

// Immediately invoke this function with no dependencies
(function() {
  console.log('🔥 ULTIMATE FIX: Script loaded at', new Date().toLocaleTimeString());
  
  // Run multiple times to ensure it catches the elements once they're loaded
  for (let delay of [0, 100, 300, 600, 1000]) {
    setTimeout(initFix, delay);
  }
  
  function initFix() {
    console.log('🔥 ULTIMATE FIX: Running initialization attempt');
    
    // Core elements we need
    const form = document.getElementById('create-post-form');
    const contentField = document.getElementById('post-content');
    const imageField = document.getElementById('post-image');
    const modal = document.getElementById('create-post-modal');
    
    // Verify elements exist
    if (!form || !contentField) {
      console.log('🔥 ULTIMATE FIX: Required elements not found yet');
      return;
    }
    
    console.log('🔥 ULTIMATE FIX: Found all required elements, proceeding');
    
    // Create or find the submit button
    let submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) {
      submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'primary-btn';
      submitBtn.textContent = 'Post';
      submitBtn.style.width = '100%';
      submitBtn.style.marginTop = '15px';
      form.appendChild(submitBtn);
      console.log('🔥 ULTIMATE FIX: Created new submit button');
    }
    
    // Remove any existing handlers by replacing the form with a clone
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Get the new submit button reference after cloning
    submitBtn = newForm.querySelector('button[type="submit"]');
    
    // Direct form handler
    newForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('🔥 ULTIMATE FIX: Form submitted');
      submitPost();
      return false;
    };
    
    // Backup button handler
    submitBtn.onclick = function(e) {
      e.preventDefault();
      console.log('🔥 ULTIMATE FIX: Submit button clicked');
      submitPost();
    };
    
    console.log('🔥 ULTIMATE FIX: Setup complete');
    
    // Post submission function
    function submitPost() {
      console.log('🔥 ULTIMATE FIX: Processing post submission');
      
      // Get form data
      const content = document.getElementById('post-content').value.trim();
      const hasImage = document.getElementById('post-image').files.length > 0;
      
      // Validate
      if (!content && !hasImage) {
        alert('Please add some text or an image to your post');
        return;
      }
      
      // Disable button to prevent double posts
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';
      
      // Auto-reset button after 5 seconds (safety measure)
      const buttonTimeout = setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }, 5000);
      
      // Process with or without image
      if (hasImage) {
        const file = document.getElementById('post-image').files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
          savePost(content, e.target.result);
          clearTimeout(buttonTimeout);
        };
        
        reader.onerror = function() {
          console.error('🔥 ULTIMATE FIX: Image read error');
          alert('Error reading image. Creating post without image.');
          savePost(content, null);
          clearTimeout(buttonTimeout);
        };
        
        reader.readAsDataURL(file);
      } else {
        savePost(content, null);
        clearTimeout(buttonTimeout);
      }
    }
    
    // Save post function
    function savePost(content, imageUrl) {
      console.log('🔥 ULTIMATE FIX: Saving post');
      
      try {
        // Create post object
        const post = {
          id: Date.now(),
          user_id: 1,
          username: 'User',
          content: content,
          created_at: new Date().toISOString(),
          status: 'published',
          interested_users: "[]"
        };
        
        // Add image if present
        if (imageUrl) {
          post.image_url = imageUrl;
        }
        
        // Get existing posts
        let posts = [];
        try {
          const postsData = localStorage.getItem('posts');
          if (postsData) {
            posts = JSON.parse(postsData);
            if (!Array.isArray(posts)) posts = [];
          }
        } catch (err) {
          console.error('🔥 ULTIMATE FIX: Error reading existing posts');
          posts = [];
        }
        
        // Add new post to beginning
        posts.unshift(post);
        
        // Save back to localStorage
        localStorage.setItem('posts', JSON.stringify(posts));
        console.log('🔥 ULTIMATE FIX: Post saved successfully');
        
        // Reset form
        newForm.reset();
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
        
        // Clear image preview
        const preview = document.getElementById('image-preview');
        if (preview) {
          preview.innerHTML = '';
          preview.style.display = 'none';
        }
        
        // Close modal
        const modal = document.getElementById('create-post-modal');
        if (modal) modal.style.display = 'none';
        
        // Show success message
        alert('Post created successfully!');
        
        // Reload page to show new post
        window.location.reload();
      } catch (err) {
        console.error('🔥 ULTIMATE FIX: Error saving post', err);
        alert('Error creating post: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    }
  }
})();
