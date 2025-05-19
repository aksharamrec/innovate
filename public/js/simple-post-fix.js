/**
 * ULTRA SIMPLE POST FIX
 * Bare minimum implementation to ensure post creation works
 */

console.log('🔧 SIMPLE FIX: Script loaded successfully');

// Run immediately and also on DOMContentLoaded
(function() {
  setupPostFunctionality();
  document.addEventListener('DOMContentLoaded', setupPostFunctionality);
  
  function setupPostFunctionality() {
    console.log('🔧 SIMPLE FIX: Setting up post functionality');
    
    // Get critical elements
    const form = document.getElementById('create-post-form');
    const postContent = document.getElementById('post-content');
    const postImage = document.getElementById('post-image');
    const modal = document.getElementById('create-post-modal');
    
    // Log what we found - important for debugging
    console.log('🔧 SIMPLE FIX: Elements found:', {
      form: !!form,
      postContent: !!postContent,
      postImage: !!postImage,
      modal: !!modal
    });
    
    // Exit if essential elements are missing
    if (!form || !postContent) {
      console.error('🔧 SIMPLE FIX: Critical elements missing!');
      return;
    }
    
    // Set up direct click handler on submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      console.log('🔧 SIMPLE FIX: Found submit button');
      
      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔧 SIMPLE FIX: Submit button clicked');
        createPost();
      });
    }
    
    // Also handle form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('🔧 SIMPLE FIX: Form submitted');
      createPost();
    });
    
    // Create post function
    function createPost() {
      console.log('🔧 SIMPLE FIX: Creating post');
      
      // Get form values
      const content = postContent.value.trim();
      const hasImage = postImage.files && postImage.files.length > 0;
      
      // Basic validation
      if (!content && !hasImage) {
        alert('Please add some content or an image');
        return;
      }
      
      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';
      }
      
      // Process image if present
      if (hasImage) {
        const file = postImage.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
          savePost(content, e.target.result);
        };
        
        reader.onerror = function() {
          console.error('🔧 SIMPLE FIX: Error reading image');
          savePost(content, null);
        };
        
        reader.readAsDataURL(file);
      } else {
        savePost(content, null);
      }
    }
    
    // Save post to localStorage
    function savePost(content, imageUrl) {
      try {
        // Create post object
        const post = {
          id: Date.now(),
          user_id: 1,
          username: 'User',
          content: content,
          created_at: new Date().toISOString(),
          interested_users: "[]"
        };
        
        // Add image if present
        if (imageUrl) {
          post.image_url = imageUrl;
        }
        
        // Get existing posts
        let posts = [];
        const existingPosts = localStorage.getItem('posts');
        
        if (existingPosts) {
          try {
            posts = JSON.parse(existingPosts);
            if (!Array.isArray(posts)) posts = [];
          } catch (e) {
            console.error('🔧 SIMPLE FIX: Error parsing posts:', e);
          }
        }
        
        // Add new post to beginning
        posts.unshift(post);
        
        // Save to localStorage
        localStorage.setItem('posts', JSON.stringify(posts));
        console.log('🔧 SIMPLE FIX: Post saved successfully');
        
        // Reset UI
        form.reset();
        
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
        
        // Close modal
        if (modal) {
          modal.style.display = 'none';
        }
        
        // Show success message
        alert('Post created successfully!');
        
        // Reload page
        window.location.reload();
      } catch (error) {
        console.error('🔧 SIMPLE FIX: Error saving post:', error);
        alert('Error creating post: ' + error.message);
        
        // Reset button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Post';
        }
      }
    }
  }
})();
