// Add this at the top of the file to mark it as loaded
window.isAuthScriptLoaded = true;

document.addEventListener('DOMContentLoaded', function() {
  // Register form handling
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate input
      if (!username || !email || !password || !confirmPassword) {
        showMessage('All fields are required', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }
      
      if (password.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
      }
      
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Redirect to home page
        window.location.href = '/home.html';
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }
  
  // Login form handling
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Validate input
      if (!email || !password) {
        showMessage('Email and password are required', 'error');
        return;
      }
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Check if a redirect parameter exists in URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');
        
        // Redirect to simplified home page or specified redirect path
        if (redirectPath) {
          window.location.href = redirectPath;
        } else {
          // Use the new simplified home page instead of the old one
          window.location.href = '/html/simplified-home.html';
        }
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }
  
  // Forgot password modal handling
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const forgotPasswordModal = document.getElementById('forgot-password-modal');
  const closeModalBtn = document.querySelector('.close');
  
  if (forgotPasswordLink && forgotPasswordModal) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      forgotPasswordModal.style.display = 'block';
    });
    
    closeModalBtn.addEventListener('click', function() {
      forgotPasswordModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
      if (e.target === forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
      }
    });
  }
  
  // Forgot password form handling
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('reset-email').value;
      
      if (!email) {
        showMessage('Email is required', 'error');
        return;
      }
      
      try {
        const response = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send reset link');
        }
        
        showMessage('Password reset link sent to your email', 'success');
        forgotPasswordModal.style.display = 'none';
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }
  
  // Helper function to show messages
  function showMessage(message, type) {
    // Check if message container already exists
    let messageContainer = document.querySelector('.message-container');
    
    // If not, create it
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-container';
      document.body.appendChild(messageContainer);
      
      // Style the container
      messageContainer.style.position = 'fixed';
      messageContainer.style.top = '20px';
      messageContainer.style.left = '50%';
      messageContainer.style.transform = 'translateX(-50%)';
      messageContainer.style.zIndex = '1000';
      messageContainer.style.transition = 'all 0.3s ease';
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.padding = '12px 20px';
    messageElement.style.marginBottom = '10px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.fontWeight = '500';
    messageElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    
    if (type === 'error') {
      messageElement.style.backgroundColor = 'var(--error-color)';
      messageElement.style.color = 'white';
    } else if (type === 'success') {
      messageElement.style.backgroundColor = 'var(--success-color)';
      messageElement.style.color = 'white';
    } else {
      messageElement.style.backgroundColor = 'var(--primary-color)';
      messageElement.style.color = 'white';
    }
    
    // Add message to container
    messageContainer.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      messageElement.style.opacity = '0';
      setTimeout(() => {
        messageContainer.removeChild(messageElement);
        // If no more messages, remove container
        if (messageContainer.children.length === 0) {
          document.body.removeChild(messageContainer);
        }
      }, 300);
    }, 5000);
  }
  
  // Auth script
  console.log('Auth script loaded v2 at', new Date().toISOString());
  
  // Check if user is logged in (has token)
  const token = localStorage.getItem('token');
  const userMenu = document.getElementById('user-menu');
  
  if (token) {
    try {
      // Decode token (simple decode, not full verification)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const user = JSON.parse(jsonPayload);
      console.log('User authenticated:', user.username);
      
      // Update user menu with logged in state
      if (userMenu) {
        userMenu.innerHTML = `
          <span>Welcome, ${user.username}</span>
          <button id="logout-btn" class="btn">Logout</button>
        `;
        
        // Setup logout button
        document.getElementById('logout-btn').addEventListener('click', function() {
          localStorage.removeItem('token');
          window.location.href = '/html/login.html';
        });
      }
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (user.exp && user.exp < currentTime) {
        console.log('Token expired, logging out');
        localStorage.removeItem('token');
        alert('Your session has expired. Please login again.');
        window.location.href = '/html/login.html';
      }
    } catch (e) {
      console.error('Invalid token format:', e);
      localStorage.removeItem('token');
    }
  } else {
    console.log('User not authenticated');
    // Update user menu with logged out state
    if (userMenu) {
      userMenu.innerHTML = `
        <a href="/login.html" class="btn">Login</a>
        <a href="/register.html" class="btn primary-btn">Register</a>
      `;
    }
    
    // Redirect if on a page that requires authentication
    const requiresAuth = [
      'profile.html',
      'messages.html'
    ];
    
    if (requiresAuth.some(path => window.location.pathname.includes(path))) {
      window.location.href = '/home.htm/?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }
});
