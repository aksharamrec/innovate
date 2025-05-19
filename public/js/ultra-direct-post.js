/**
 * Ultra Direct Post Handler
 * A minimal, standalone script for handling post creation
 * with zero dependencies
 */

(function() {
  console.log('Ultra Direct Post Handler loaded');
  
  // Function to initialize when DOM is ready
  function initPostHandler() {
    console.log('Initializing ultra direct post handler');
    
    // Find all forms in the document
    const forms = document.querySelectorAll('form');
    
    if (forms.length === 0) {
      console.error('No forms found on this page');
      addEmergencyButton();
      return;
    }
    
    // Try to identify the post form
    let postForm = null;
    let contentField = null;
    
    // Look for obvious post form
    postForm = document.getElementById('post-form');
    if (postForm) {
      contentField = document.getElementById('post-content') || 
                     postForm.querySelector('textarea');
    }
    
    // If not found, look for any form with a textarea
    if (!postForm) {
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const textareas = form.querySelectorAll('textarea');
        
        if (textareas.length > 0) {
          postForm = form;
          contentField = textareas[0];
          break;
        }
      }
    }
    
    // Still not found? Take the first form
    if (!postForm) {
      postForm = forms[0];
    }
    
    // No content field found? Look anywhere in the document
    if (!contentField) {
      contentField = document.querySelector('textarea');
    }
    
    // Announce what we found
    if (postForm) {
      console.log('Found post form:', postForm.id || '(no id)');
      
      if (contentField) {
        console.log('Found content field:', contentField.id || '(no id)');
      } else {
        console.error('No content field found');
      }
      
      // Add a visual indicator to show our handler is attached
      const indicator = document.createElement('div');
      indicator.style.fontSize = '12px';
      indicator.style.marginTop = '5px';
      indicator.style.color = 'green';
      indicator.textContent = '✓ Direct post handler active';
      postForm.appendChild(indicator);
      
      // Override form submission
      overrideFormSubmission(postForm, contentField);
    } else {
      console.error('Could not identify a post form');
    }
    
    // Always add emergency button as a last resort
    addEmergencyButton();
  }
  
  // Override form submission with our handler
  function overrideFormSubmission(form, contentField) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Form submission intercepted');
      
      // If we don't have a content field, try to find one now
      if (!contentField) {
        contentField = form.querySelector('textarea') || document.querySelector('textarea');
      }
      
      if (!contentField) {
        alert('Error: Could not find a textarea for post content');
        return false;
      }
      
      const content = contentField.value.trim();
      if (!content) {
        alert('Please enter content for your post');
        return false;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create posts');
        return false;
      }
      
      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]') || 
                        form.querySelector('input[type="submit"]') ||
                        form.querySelector('button');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
      }
      
      // Show progress
      const progressIndicator = document.createElement('div');
      progressIndicator.style.margin = '10px 0';
      progressIndicator.style.color = 'blue';
      progressIndicator.textContent = 'Creating post...';
      form.appendChild(progressIndicator);
      
      // Use XHR for maximum compatibility
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/posts');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success
          progressIndicator.style.color = 'green';
          progressIndicator.textContent = 'Post created successfully!';
          contentField.value = '';
          
          if (confirm('Post created successfully! Reload page to see it?')) {
            window.location.reload();
          }
        } else {
          // Error
          progressIndicator.style.color = 'red';
          
          try {
            const response = JSON.parse(xhr.responseText);
            progressIndicator.textContent = 'Error: ' + (response.message || xhr.statusText);
          } catch (e) {
            progressIndicator.textContent = 'Error: ' + xhr.statusText;
          }
        }
        
        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.originalText || 'Post';
        }
        
        // Remove indicator after 5 seconds
        setTimeout(function() {
          if (progressIndicator.parentNode) {
            progressIndicator.parentNode.removeChild(progressIndicator);
          }
        }, 5000);
      };
      
      xhr.onerror = function() {
        progressIndicator.style.color = 'red';
        progressIndicator.textContent = 'Network error. Please try again.';
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.originalText || 'Post';
        }
      };
      
      // Send the request
      xhr.send(JSON.stringify({ content: content }));
      return false;
    }, true); // true = capture phase to ensure this runs first
  }
  
  // Add emergency button as a fallback
  function addEmergencyButton() {
    const btn = document.createElement('button');
    btn.textContent = '🚨 Emergency Post';
    btn.style.position = 'fixed';
    btn.style.right = '20px';
    btn.style.bottom = '20px';
    btn.style.backgroundColor = '#f44336';
    btn.style.color = 'white';
    btn.style.padding = '10px 15px';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.fontWeight = 'bold';
    btn.style.zIndex = '9999';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    btn.addEventListener('click', function() {
      window.location.href = '/html/emergency.html';
    });
    
    document.body.appendChild(btn);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostHandler);
  } else {
    initPostHandler();
  }
})();
