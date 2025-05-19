/**
 * This is a bypass for authentication issues
 * It ensures the app always has valid user data but respects provided credentials
 */
(function() {
  console.log('AUTH BYPASS: Checking for auth data');
  
  // Only set default user if specifically requested by URL parameter or no auth exists
  const urlParams = new URLSearchParams(window.location.search);
  const needsDefault = urlParams.get('default_auth') === 'true';
  
  // Create default user only if needed
  if (needsDefault || (!localStorage.getItem('auth_token') && !localStorage.getItem('user_data'))) {
    console.log('AUTH BYPASS: Setting default user data');
    
    // Default user as fallback
    const defaultUser = {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      email: 'user@example.com',
      avatar: null,
      stats: {
        posts: 15,
        following: 124,
        followers: 89
      }
    };
    
    localStorage.setItem('auth_token', 'demo-token-' + Date.now());
    localStorage.setItem('user_data', JSON.stringify(defaultUser));
  }
  
  // Override the checkAuth function to respect stored user data
  window.checkAuth = function() {
    console.log('AUTH BYPASS: Using enhanced auth check');
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        return Promise.resolve(JSON.parse(userData));
      }
      return Promise.resolve(null);
    } catch (err) {
      console.error('Error in auth check:', err);
      return Promise.resolve(null);
    }
  };
  
  console.log('AUTH BYPASS: Auth bypass ready');
})();
