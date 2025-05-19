/**
 * Simplified Login Script for Demo
 * Handles form submission and redirects to home
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Login script loaded - DEMO MODE');
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// Simple login handler - always succeeds
function handleLogin(event) {
  event.preventDefault();
  
  const errorMessage = document.getElementById('login-error');
  const submitButton = document.querySelector('button[type="submit"]');
  
  // Show loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  }
  
  // Clear any error message
  if (errorMessage) errorMessage.textContent = '';
  
  console.log('Demo login - always succeeds');
  
  // Simply redirect to home after a brief delay
  setTimeout(() => {
    console.log('Redirecting to home page');
    window.location.href = 'home.html';
  }, 1000);
}
