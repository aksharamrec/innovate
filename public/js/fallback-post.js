/**
 * Fallback Post System
 * Works even if other scripts fail
 */

// Run immediately and don't depend on DOMContentLoaded
(function() {
  // Wait for DOM to be ready
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  ready(function() {
    console.log('Fallback post system active');
    
    // Find any post form
    const forms = [
      document.getElementById('post-form'),
      document.getElementById('simple-post-form'),
      document.querySelector('form')
    ].filter(Boolean);
    
    if (forms.length === 0) {
      console.log('No forms found on page');
      return;
    }
    
    console.log(`Found ${forms.length} forms`);
    
    // Create a helper function for posts
    window.createPost = function(content, callback) {
      const token = localStorage.getItem('token');
      if (!token) {
        callback && callback(new Error('No authentication token found'));
        return;
      }
      
      fetch('/api/posts/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => { throw new Error(data.message || 'Server error'); });
        }
        return response.json();
      })
      .then(data => {
        callback && callback(null, data);
      })
      .catch(error => {
        callback && callback(error);
      });
    };
    
    // Try adding a fallback button to each form
    forms.forEach(form => {
      try {
        // Check if form already has a submit handler
        const originalSubmit = form.onsubmit;
        
        form.addEventListener('submit', function(e) {
          // Don't interfere if the form already has a handler
          if (form.hasAttribute('data-has-handler')) {
            return;
          }
          
          e.preventDefault();
          
          const textareas = [
            form.querySelector('textarea'),
            document.getElementById('post-content'),
            document.querySelector('textarea')
          ].filter(Boolean);
          
          if (textareas.length === 0) {
            alert('No content field found');
            return;
          }
          
          const content = textareas[0].value.trim();
          if (!content) {
            alert('Please enter content for your post');
            return;
          }
          
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.disabled = true;
          
          window.createPost(content, function(error, data) {
            if (error) {
              alert('Error: ' + error.message);
            } else {
              alert('Post created successfully!');
              textareas[0].value = '';
            }
            
            if (submitBtn) submitBtn.disabled = false;
          });
        });
      } catch (e) {
        console.error('Error setting up fallback form handler:', e);
      }
    });
    
    // Add a global emergency post button
    const emergencyBtn = document.createElement('button');
    emergencyBtn.textContent = '🚨 Emergency Post';
    emergencyBtn.style.position = 'fixed';
    emergencyBtn.style.bottom = '20px';
    emergencyBtn.style.right = '20px';
    emergencyBtn.style.zIndex = '9999';
    emergencyBtn.style.background = '#f44336';
    emergencyBtn.style.color = 'white';
    emergencyBtn.style.border = 'none';
    emergencyBtn.style.borderRadius = '4px';
    emergencyBtn.style.padding = '10px 15px';
    emergencyBtn.style.cursor = 'pointer';
    
    emergencyBtn.addEventListener('click', function() {
      const content = prompt('Enter post content:');
      if (!content) return;
      
      emergencyBtn.disabled = true;
      emergencyBtn.textContent = 'Posting...';
      
      window.createPost(content, function(error, data) {
        if (error) {
          alert('Error: ' + error.message);
        } else {
          alert('Post created successfully!');
        }
        
        emergencyBtn.disabled = false;
        emergencyBtn.textContent = '🚨 Emergency Post';
      });
    });
    
    document.body.appendChild(emergencyBtn);
  });
})();
