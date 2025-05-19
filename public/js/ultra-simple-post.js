/**
 * Ultra Simple Post Creator
 * A minimalist approach with zero dependencies
 */

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Ultra Simple Post Creator initialized');
  
  // Find form elements
  const postForm = document.querySelector('form');
  const postContent = document.getElementById('post-content');
  const submitBtn = document.querySelector('button[type="submit"]');
  
  if (!postForm || !postContent || !submitBtn) {
    console.error('Required form elements not found');
    alert('Error: Form elements not found on this page');
    return;
  }
  
  // Set up form submission
  postForm.addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted');
    
    const content = postContent.value.trim();
    if (!content) {
      alert('Please enter post content');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create a post');
      return;
    }
    
    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    // Create post with direct fetch API
    fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => { throw new Error(data.message || 'Error creating post'); });
      }
      return response.json();
    })
    .then(post => {
      console.log('Post created successfully:', post);
      alert('Post created successfully!');
      
      // Clear the form
      postContent.value = '';
      
      // Reload the page to show the new post
      window.location.reload();
    })
    .catch(error => {
      console.error('Error creating post:', error);
      alert('Error: ' + error.message);
    })
    .finally(() => {
      // Re-enable the form
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    });
  });
  
  console.log('Form handler attached');
}
