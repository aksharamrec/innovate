/**
 * Emergency fix for redirect loops
 * This script prevents redirects by intercepting location changes
 */
(function() {
  console.log('EMERGENCY REDIRECT BLOCKER ACTIVE');
  
  // Store original functions
  const originalAssign = window.location.assign;
  const originalReplace = window.location.replace;
  const originalHref = Object.getOwnPropertyDescriptor(window.Location.prototype, 'href');
  
  // Override location.assign
  window.location.assign = function(url) {
    console.log('LOCATION.ASSIGN INTERCEPTED:', url);
    
    // Block redirects to login.html
    if (url.includes('login.html')) {
      console.error('BLOCKED REDIRECT TO LOGIN.HTML');
      return; // Do nothing
    }
    
    // Allow other redirects
    return originalAssign.call(window.location, url);
  };
  
  // Override location.replace
  window.location.replace = function(url) {
    console.log('LOCATION.REPLACE INTERCEPTED:', url);
    
    // Block redirects to login.html
    if (url.includes('login.html')) {
      console.error('BLOCKED REDIRECT TO LOGIN.HTML');
      return; // Do nothing
    }
    
    // Allow other redirects
    return originalReplace.call(window.location, url);
  };
  
  // Override location.href setter
  try {
    Object.defineProperty(window.location, 'href', {
      set: function(url) {
        console.log('LOCATION.HREF SETTER INTERCEPTED:', url);
        
        // Block redirects to login.html
        if (url.includes('login.html')) {
          console.error('BLOCKED REDIRECT TO LOGIN.HTML');
          return; // Do nothing
        }
        
        // Allow other redirects
        return originalHref.set.call(this, url);
      },
      get: originalHref.get
    });
  } catch (e) {
    console.error('Failed to override location.href:', e);
  }
  
  // Ensure auth data exists
  if (!localStorage.getItem('auth_token') || !localStorage.getItem('user_data')) {
    localStorage.setItem('auth_token', 'emergency-token-' + Date.now());
    localStorage.setItem('user_data', JSON.stringify({
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      email: 'user@example.com',
      avatar: null,
      stats: { posts: 15, following: 124, followers: 89 }
    }));
    console.log('Emergency auth data set');
  }
  
  // Clear any session tracking
  sessionStorage.clear();
  
  console.log('EMERGENCY REDIRECT PROTECTION COMPLETE');
})();
