/**
 * Register Home Page Script
 * This script ensures that new users are directed to the simplified home page
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Register Home script initialized');
  
  // Check if we're on the register page
  const registerForm = document.getElementById('register-form');
  if (!registerForm) {
    console.log('Not on register page, script inactive');
    return;
  }
  
  // Override the default registration behavior to redirect to simplified home
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      showMessage('All fields are required', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    
    // Disable the submit button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }
    
    // Send registration request
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        // Registration successful, store token
        localStorage.setItem('token', data.token);
        
        // Show success message
        showMessage('Account created successfully!', 'success');
        
        // Redirect to simplified home page
        setTimeout(() => {
          window.location.href = '/html/simplified-home.html';
        }, 1500);
      } else if (data.message) {
        throw new Error(data.message);
      } else {
        throw new Error('Registration failed');
      }
    })
    .catch(error => {
      console.error('Registration error:', error);
      showMessage(error.message, 'error');
      
      // Re-enable the submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    });
  });
  
  // Helper function to show messages
  function showMessage(message, type = 'info') {
    // Check if message container exists
    let messageContainer = document.querySelector('.message-container');
    
    // If not, create it
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-container';
      document.body.appendChild(messageContainer);
      
      // Basic styling for message container
      messageContainer.style.position = 'fixed';
      messageContainer.style.top = '20px';
      messageContainer.style.left = '50%';
      messageContainer.style.transform = 'translateX(-50%)';
      messageContainer.style.zIndex = '1000';
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Style message
    messageElement.style.padding = '10px 20px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.backgroundColor = type === 'error' ? '#f44336' : 
                                           type === 'success' ? '#4caf50' : '#2196f3';
    messageElement.style.color = 'white';
    messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
      messageElement.style.opacity = '0';
      messageElement.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        if (messageElement.parentNode === messageContainer) {
          messageContainer.removeChild(messageElement);
        }
        
        // Remove container if empty
        if (messageContainer.children.length === 0) {
          document.body.removeChild(messageContainer);
        }
      }, 300);
    }, 5000);
  }
});
