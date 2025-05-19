/**
 * Authentication Module
 * Handles user authentication checks and provides the current user
 */

// Default user for testing
const DEFAULT_USER = {
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

/**
 * Check if the user is authenticated
 * @returns {Promise<Object|null>} The user object if authenticated, null otherwise
 */
async function checkAuth() {
  try {
    // Check for token in localStorage
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log('No auth token found');
      return null;
    }
    
    // For a real app, we would verify the token with the server
    // For demo purposes, we'll use localStorage user data
    const userData = localStorage.getItem('user_data');
    
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Demo fallback: Use default user
    console.log('Using default user data');
    return DEFAULT_USER;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

/**
 * Logout the current user
 * Clear authentication data and redirect to login page
 */
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = 'auth.html';
}
