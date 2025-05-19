/**
 * Direct Post Creator
 * Absolute minimal approach with maximum debugging
 */

// Execute immediately - no waiting for DOMContentLoaded
(function() {
  console.log('[DirectPost] Script loaded at', new Date().toISOString());
  
  // Try to find any post form - be very flexible about what we look for
  const forms = document.querySelectorAll('form');
  console.log('[DirectPost] Found', forms.length, 'forms on page');
  
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    console.log('[DirectPost] Processing form #' + i, form.id || '(no id)');
    
    // Check if this form has a textarea that looks like a post form
    const textarea = form.querySelector('textarea');
    if (!textarea) {
      console.log('[DirectPost] Form #' + i + ' has no textarea, skipping');
      continue;
    }
    
    console.log('[DirectPost] Found textarea in form #' + i, textarea.id || '(no id)');
    
    // Add visual indicator that our script is attached
    const indicator = document.createElement('div');
    indicator.textContent = '🟢 Direct Post Handler Active';
    indicator.style.color = 'green';
    indicator.style.fontSize = '12px';
    indicator.style.marginTop = '5px';
    form.appendChild(indicator);
    
    // Attach our own submit handler
    form.addEventListener('submit', function(e) {
      // Prevent default to ensure our handler runs
      e.preventDefault();
      
      // Update indicator
      indicator.textContent = '⚡ Processing Submission...';
      indicator.style.color = 'blue';
      
      console.log('[DirectPost] Form submitted at', new Date().toISOString());
      
      // Get content - try multiple approaches
      const content = textarea.value.trim();
      console.log('[DirectPost] Content:', content ? (content.length + ' chars') : 'EMPTY');
      
      if (!content) {
        indicator.textContent = '❌ No content provided';
        indicator.style.color = 'red';
        alert('Please enter some content for your post');
        return;
      }
      
      // Get token
      const token = localStorage.getItem('token');
      console.log('[DirectPost] Token:', token ? 'Found' : 'MISSING');
      
      if (!token) {
        indicator.textContent = '❌ No auth token available';
        indicator.style.color = 'red';
        alert('You must be logged in to create a post');
        return;
      }
      
      // Find submit button
      const submitButton = form.querySelector('button[type="submit"]') || 
                           form.querySelector('button') ||
                           form.querySelector('input[type="submit"]');
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.originalText = submitButton.textContent;
        submitButton.textContent = 'Posting...';
      }
      
      // Update indicator
      indicator.textContent = '🔄 Sending request to server...';
      indicator.style.color = 'blue';
      
      // Very explicit request with full logging
      console.log('[DirectPost] Sending fetch request');
      
      fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ content })
      })
      .then(function(response) {
        console.log('[DirectPost] Server response status:', response.status);
        
        // Try to parse response as json
        return response.text().then(function(text) {
          console.log('[DirectPost] Raw response:', text);
          
          try {
            // Try to parse as JSON
            return { 
              status: response.status,
              data: JSON.parse(text),
              ok: response.ok
            };
          } catch (e) {
            // Not JSON
            return { 
              status: response.status,
              data: { message: text },
              ok: response.ok
            };
          }
        });
      })
      .then(function(result) {
        if (result.ok) {
          console.log('[DirectPost] Post created successfully:', result.data);
          indicator.textContent = '✅ Post created successfully!';
          indicator.style.color = 'green';
          
          // Clear the form
          textarea.value = '';
          
          // Show success message
          alert('Post created successfully!');
          
          // Optional: reload page after a delay to see the new post
          setTimeout(function() {
            window.location.reload();
          }, 1000);
        } else {
          console.error('[DirectPost] Error creating post:', result);
          indicator.textContent = '❌ Error: ' + (result.data.message || 'Unknown error');
          indicator.style.color = 'red';
          
          alert('Error creating post: ' + (result.data.message || 'Unknown error'));
        }
      })
      .catch(function(error) {
        console.error('[DirectPost] Network error:', error);
        indicator.textContent = '❌ Network error: ' + error.message;
        indicator.style.color = 'red';
        
        alert('Network error: ' + error.message);
      })
      .finally(function() {
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = submitButton.originalText || 'Post';
        }
      });
    });
    
    console.log('[DirectPost] Handler attached to form #' + i);
  }
  
  // If no form with textarea found, add a floating emergency post button
  if (!document.querySelector('form textarea')) {
    console.log('[DirectPost] No suitable form found, adding emergency post button');
    
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
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create a post');
        return;
      }
      
      emergencyBtn.disabled = true;
      emergencyBtn.textContent = 'Posting...';
      
      fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ content })
      })
      .then(response => response.json())
      .then(data => {
        alert('Post created successfully!');
        window.location.reload();
      })
      .catch(error => {
        alert('Error: ' + error.message);
      })
      .finally(() => {
        emergencyBtn.disabled = false;
        emergencyBtn.textContent = '🚨 Emergency Post';
      });
    });
    
    document.body.appendChild(emergencyBtn);
  }
})();
