/**
 * Home Page Initializer
 * Sets up the home page with post functionality
 */

(function() {
  console.log('Home page initializer loaded');
  
  // Check for the presence of our key components
  document.addEventListener('DOMContentLoaded', function() {
    // Check for the PostSystem global object
    if (typeof PostSystem === 'undefined') {
      console.error('PostSystem is not defined. Make sure post-system.js is loaded.');
      showError('Post system not loaded properly. Please refresh the page or contact support.');
      return;
    }
    
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authenticated');
      window.location.href = '/html/login.html';
      return;
    }
    
    // Initialize the post system
    try {
      const initialized = PostSystem.init({
        containerID: 'posts-container',
        formID: 'post-form',
        switcherSelector: '.feed-switcher',
        debugMode: true
      });
      
      if (initialized) {
        console.log('Post system initialized successfully');
      } else {
        console.error('Post system initialization failed');
        showError('Failed to initialize post system');
      }
    } catch (error) {
      console.error('Error initializing post system:', error);
      showError(`Error initializing post system: ${error.message}`);
    }
  });
  
  // Utility function to show errors
  function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.style.backgroundColor = '#ffebee';
    errorElement.style.color = '#c62828';
    errorElement.style.padding = '15px';
    errorElement.style.borderRadius = '8px';
    errorElement.style.marginBottom = '20px';
    errorElement.innerHTML = `
      <strong>Error:</strong> ${message}
      <button id="retry-btn" style="margin-left: 10px; background: #c62828; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
        Retry
      </button>
    `;
    
    // Find a good place to insert the error
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer && postsContainer.parentNode) {
      postsContainer.parentNode.insertBefore(errorElement, postsContainer);
    } else {
      // If we can't find posts container, insert at the top of the main content
      const mainContent = document.querySelector('main') || document.querySelector('.container');
      if (mainContent) {
        mainContent.insertBefore(errorElement, mainContent.firstChild);
      } else {
        // Last resort - append to body
        document.body.appendChild(errorElement);
      }
    }
    
    // Add retry handler
    document.getElementById('retry-btn').addEventListener('click', function() {
      window.location.reload();
    });
  }
})();
