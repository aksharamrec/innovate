/**
 * Home Page Script
 * Handles post creation, feed loading, and user interactions
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is authenticated
  const user = await checkAuth();
  
  if (!user) {
    // Redirect to login if not authenticated
    window.location.replace('auth.html');
    return;
  }
  
  // Load user profile
  loadUserProfile(user);
  
  // Load posts feed
  loadPosts();
  
  // Load suggestions
  loadSuggestions();
  
  // Load upcoming events
  loadUpcomingEvents();
  
  // Set up event listeners
  setupEventListeners();
});

/**
 * Load and display user profile data
 */
function loadUserProfile(user) {
  // Update profile avatar
  const userAvatar = document.getElementById('user-avatar');
  if (user.avatar) {
    userAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" />`;
  } else {
    // Generate initials from name
    const initials = user.name.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    userAvatar.textContent = initials;
  }
  
  // Update user info
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-handle').textContent = `@${user.username}`;
  
  // Update stats
  document.getElementById('post-count').textContent = user.stats.posts;
  document.getElementById('following-count').textContent = user.stats.following;
  document.getElementById('followers-count').textContent = user.stats.followers;
  
  // Also update the avatar in the post creator
  const createPostAvatar = document.getElementById('create-post-avatar');
  if (createPostAvatar) {
    createPostAvatar.textContent = userAvatar.textContent;
    if (user.avatar) {
      createPostAvatar.innerHTML = userAvatar.innerHTML;
    }
  }
}

/**
 * Load and display posts
 */
async function loadPosts() {
  const postsContainer = document.getElementById('posts-container');
  
  try {
    // In a real app, we would fetch posts from the API
    // For demo purposes, we'll use mock data
    const mockPosts = [
      {
        id: 1,
        user: {
          id: 2,
          name: 'Jane Smith',
          username: 'janesmith',
          avatar: null
        },
        content: 'Just finished working on a new sustainable energy project. Excited to share the results soon! #CleanEnergy #Innovation',
        image: null,
        timestamp: '2023-06-15T14:30:00Z',
        interested: 12,
        isInterested: false
      },
      {
        id: 2,
        user: {
          id: 3,
          name: 'Tech Innovators',
          username: 'techinnovate',
          avatar: null
        },
        content: 'Our team is researching applications of quantum computing in healthcare. The potential is enormous! #QuantumComputing #Healthcare',
        image: 'https://source.unsplash.com/random/800x600/?quantum',
        timestamp: '2023-06-14T10:15:00Z',
        interested: 24,
        isInterested: true
      },
      {
        id: 3,
        user: {
          id: 4,
          name: 'AI Research Lab',
          username: 'airesearch',
          avatar: null
        },
        content: 'New breakthrough in generative AI models. Our latest paper demonstrates significant improvements in efficiency and accuracy.',
        image: 'https://source.unsplash.com/random/800x600/?ai',
        timestamp: '2023-06-13T08:45:00Z',
        interested: 35,
        isInterested: false
      }
    ];
    
    // Remove loading indicator
    postsContainer.innerHTML = '';
    
    // Render posts
    mockPosts.forEach(post => {
      postsContainer.appendChild(createPostElement(post));
    });
  } catch (error) {
    console.error('Error loading posts:', error);
    postsContainer.innerHTML = `
      <div class="error-message">
        <p>Error loading posts. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Create HTML element for a post
 */
function createPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.dataset.postId = post.id;
  
  // Generate user initials for avatar
  let avatarContent = '';
  if (post.user.avatar) {
    avatarContent = `<img src="${post.user.avatar}" alt="${post.user.name}" />`;
  } else {
    const initials = post.user.name.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    avatarContent = initials;
  }
  
  // Format timestamp
  const postDate = new Date(post.timestamp);
  const timeAgo = formatTimeAgo(postDate);
  
  // Create post HTML
  postElement.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${avatarContent}</div>
      <div class="post-user-info">
        <a href="profile.html?username=${post.user.username}" class="post-user-name">${post.user.name}</a>
        <div class="post-time">${timeAgo}</div>
      </div>
      <button class="post-menu">
        <i class="fas fa-ellipsis-h"></i>
      </button>
    </div>
    <div class="post-content">
      <p class="post-text">${post.content}</p>
      ${post.image ? `
        <div class="post-image">
          <img src="${post.image}" alt="Post image" />
        </div>
      ` : ''}
    </div>
    <div class="post-actions">
      <button class="post-action-btn ${post.isInterested ? 'text-primary' : ''}" data-action="interested">
        <i class="fas ${post.isInterested ? 'fa-lightbulb' : 'fa-regular fa-lightbulb'}"></i>
        <span>${post.interested}</span> Interested
      </button>
      <button class="post-action-btn" data-action="contact">
        <i class="fas fa-comment"></i> Contact
      </button>
      <button class="post-action-btn" data-action="share">
        <i class="fas fa-share"></i> Share
      </button>
      <button class="post-action-btn" data-action="save">
        <i class="far fa-bookmark"></i> Save
      </button>
    </div>
  `;
  
  // Add event listeners to post actions
  const interestedBtn = postElement.querySelector('[data-action="interested"]');
  interestedBtn.addEventListener('click', () => {
    toggleInterested(post, interestedBtn);
  });
  
  const contactBtn = postElement.querySelector('[data-action="contact"]');
  contactBtn.addEventListener('click', () => {
    startConversation(post.user);
  });
  
  const shareBtn = postElement.querySelector('[data-action="share"]');
  shareBtn.addEventListener('click', () => {
    sharePost(post);
  });
  
  const saveBtn = postElement.querySelector('[data-action="save"]');
  saveBtn.addEventListener('click', () => {
    savePost(post, saveBtn);
  });
  
  const menuBtn = postElement.querySelector('.post-menu');
  menuBtn.addEventListener('click', () => {
    showPostMenu(post, menuBtn);
  });
  
  return postElement;
}

/**
 * Format timestamp as time ago (e.g., "2 hours ago")
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Toggle interested status for a post
 */
function toggleInterested(post, button) {
  // Toggle the state
  post.isInterested = !post.isInterested;
  
  // Update the interested count
  post.interested += post.isInterested ? 1 : -1;
  
  // Update the button UI
  if (post.isInterested) {
    button.querySelector('i').classList.remove('fa-regular');
    button.querySelector('i').classList.add('fas');
    button.classList.add('text-primary');
  } else {
    button.querySelector('i').classList.add('fa-regular');
    button.querySelector('i').classList.remove('fas');
    button.classList.remove('text-primary');
  }
  
  button.querySelector('span').textContent = post.interested;
  
  // In a real app, we would update the server
  console.log(`User ${post.isInterested ? 'is' : 'is not'} interested in post ${post.id}`);
}

/**
 * Start a conversation with a user
 */
function startConversation(user) {
  // In a real app, we would navigate to the messages page with this user
  console.log(`Starting conversation with ${user.name}`);
  
  // Navigate to messages page with user ID
  window.location.href = `messages.html?user=${user.id}`;
}

/**
 * Share a post
 */
function sharePost(post) {
  // In a real app, we would display a share modal
  console.log(`Sharing post ${post.id}`);
  
  // For demo, we'll create a share URL
  const shareUrl = `${window.location.origin}/post.html?id=${post.id}`;
  
  // Check if the Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: 'Check out this post',
      text: post.content.substring(0, 100) + '...',
      url: shareUrl
    })
    .then(() => console.log('Shared successfully'))
    .catch((error) => console.log('Error sharing:', error));
  } else {
    // Fallback: copy the link to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Link copied to clipboard'))
      .catch((error) => console.error('Error copying link:', error));
  }
}

/**
 * Save a post
 */
function savePost(post, button) {
  // In a real app, we would save the post to the user's bookmarks
  console.log(`Saving post ${post.id}`);
  
  // Toggle the saved state
  const icon = button.querySelector('i');
  if (icon.classList.contains('far')) {
    icon.classList.remove('far');
    icon.classList.add('fas');
    alert('Post saved');
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
    alert('Post unsaved');
  }
}

/**
 * Show post menu
 */
function showPostMenu(post, button) {
  // In a real app, we would show a dropdown menu
  console.log(`Showing menu for post ${post.id}`);
  
  // Create menu options
  const options = [
    'Schedule Reminder',
    'Create Meeting',
    'Report',
    'Not Interested'
  ];
  
  // If the current user is the post owner, add owner-specific options
  const currentUser = JSON.parse(localStorage.getItem('user_data'));
  if (currentUser && currentUser.id === post.user.id) {
    options.splice(0, 0, 'Edit', 'Archive', 'Delete');
  }
  
  // For demo, we'll use a simple prompt
  const selectedOption = prompt(`Select an option for this post:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
  
  // Handle selected option
  if (selectedOption && options[parseInt(selectedOption) - 1]) {
    const option = options[parseInt(selectedOption) - 1];
    
    switch (option) {
      case 'Edit':
        alert('Edit post feature will be implemented soon');
        break;
      case 'Archive':
        alert('Post archived');
        break;
      case 'Delete':
        if (confirm('Are you sure you want to delete this post?')) {
          alert('Post deleted');
          // In a real app, we would remove the post from the DOM
        }
        break;
      case 'Schedule Reminder':
        alert('Reminder scheduled for tomorrow');
        break;
      case 'Create Meeting':
        window.location.href = `events.html?create=true&related_post=${post.id}`;
        break;
      case 'Report':
        alert('Post reported');
        break;
      case 'Not Interested':
        alert('You will see fewer posts like this');
        break;
    }
  }
}

/**
 * Load connection suggestions
 */
function loadSuggestions() {
  const suggestionsContainer = document.getElementById('connection-suggestions');
  
  // In a real app, we would fetch suggestions from the API
  // For demo purposes, we'll use mock data
  const mockSuggestions = [
    {
      id: 5,
      name: 'Alex Johnson',
      username: 'alexj',
      avatar: null
    },
    {
      id: 6,
      name: 'Sarah Williams',
      username: 'sarahw',
      avatar: null
    },
    {
      id: 7,
      name: 'Tech Startups',
      username: 'techstartups',
      avatar: null
    }
  ];
  
  // Clear loading indicator
  suggestionsContainer.innerHTML = '';
  
  // Render suggestions
  mockSuggestions.forEach(suggestion => {
    // Generate user initials for avatar
    let avatarContent = '';
    if (suggestion.avatar) {
      avatarContent = `<img src="${suggestion.avatar}" alt="${suggestion.name}" />`;
    } else {
      const initials = suggestion.name.split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      avatarContent = initials;
    }
    
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'suggestion-item';
    suggestionElement.innerHTML = `
      <div class="suggestion-avatar">${avatarContent}</div>
      <div class="suggestion-info">
        <h4 class="suggestion-name">${suggestion.name}</h4>
        <p class="suggestion-username">@${suggestion.username}</p>
      </div>
      <button class="suggestion-follow">Follow</button>
    `;
    
    // Add event listener to follow button
    const followButton = suggestionElement.querySelector('.suggestion-follow');
    followButton.addEventListener('click', () => {
      followUser(suggestion, followButton);
    });
    
    suggestionsContainer.appendChild(suggestionElement);
  });
}

/**
 * Follow a user
 */
function followUser(user, button) {
  // In a real app, we would follow the user on the server
  console.log(`Following ${user.name}`);
  
  // Update button state
  button.textContent = 'Following';
  button.disabled = true;
  button.style.backgroundColor = '#E0E0E0';
  button.style.color = '#757575';
  
  // Increment following count
  const followingCount = document.getElementById('following-count');
  followingCount.textContent = parseInt(followingCount.textContent) + 1;
}

/**
 * Load upcoming events
 */
function loadUpcomingEvents() {
  const eventsContainer = document.getElementById('upcoming-events');
  
  // In a real app, we would fetch events from the API
  // For demo purposes, we'll use mock data
  const mockEvents = [
    {
      id: 1,
      title: 'Tech Innovators Meetup',
      date: '2023-09-20T18:00:00Z'
    },
    {
      id: 2,
      title: 'Sustainability Workshop',
      date: '2023-09-25T14:30:00Z'
    },
    {
      id: 3,
      title: 'Investor Pitch Event',
      date: '2023-10-02T09:00:00Z'
    }
  ];
  
  // Clear container
  eventsContainer.innerHTML = '';
  
  // Render events
  mockEvents.forEach(event => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const eventElement = document.createElement('div');
    eventElement.className = 'upcoming-event';
    eventElement.innerHTML = `
      <h4 class="event-title">${event.title}</h4>
      <p class="event-date">${formattedDate}</p>
    `;
    
    eventElement.addEventListener('click', () => {
      viewEvent(event);
    });
    
    eventsContainer.appendChild(eventElement);
  });
}

/**
 * View event details
 */
function viewEvent(event) {
  // In a real app, we would navigate to the event details page
  console.log(`Viewing event ${event.id}`);
  window.location.href = `events.html?id=${event.id}`;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  // Post creator trigger
  const createPostTrigger = document.getElementById('create-post-trigger');
  const createPostModal = document.getElementById('create-post-modal');
  const closeModalBtn = document.querySelector('.close');
  
  if (createPostTrigger && createPostModal) {
    createPostTrigger.addEventListener('click', () => {
      createPostModal.style.display = 'block';
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      createPostModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === createPostModal) {
      createPostModal.style.display = 'none';
    }
  });
  
  // Post type buttons
  const postTypeButtons = document.querySelectorAll('.post-type-btn');
  postTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const postType = button.dataset.type;
      
      // Open modal with the selected tab
      createPostModal.style.display = 'block';
      
      // Find and click the corresponding tab
      const tab = document.querySelector(`.post-tab[data-tab="${postType}-post"]`);
      if (tab) {
        tab.click();
      }
    });
  });
  
  // Modal tabs
  const tabs = document.querySelectorAll('.post-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Set active tab
      document.querySelectorAll('.post-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show active content
      const contentId = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(contentId).classList.add('active');
    });
  });
  
  // Add poll option button
  const addPollOptionBtn = document.getElementById('add-poll-option');
  if (addPollOptionBtn) {
    addPollOptionBtn.addEventListener('click', () => {
      const pollOptions = document.getElementById('poll-options');
      const optionCount = pollOptions.children.length;
      
      if (optionCount < 5) {
        const newOption = document.createElement('div');
        newOption.className = 'form-group poll-option';
        newOption.innerHTML = `
          <input type="text" placeholder="Option ${optionCount + 1}" class="poll-option-input" required>
        `;
        
        pollOptions.appendChild(newOption);
      } else {
        alert('Maximum 5 options allowed');
      }
    });
  }
  
  // Create post form submission
  const createPostForm = document.getElementById('create-post-form');
  if (createPostForm) {
    createPostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get active tab
      const activeTab = document.querySelector('.post-tab.active').dataset.tab;
      let postData = {};
      
      // Get form data based on active tab
      switch (activeTab) {
        case 'text-post':
          postData = {
            type: 'text',
            content: document.getElementById('post-content').value,
            visibility: document.getElementById('post-visibility').value
          };
          break;
        case 'image-post':
          postData = {
            type: 'image',
            content: document.getElementById('image-post-content').value,
            image: document.getElementById('post-image').files[0],
            visibility: document.getElementById('post-visibility').value
          };
          break;
        case 'file-post':
          postData = {
            type: 'file',
            content: document.getElementById('file-post-content').value,
            file: document.getElementById('post-file').files[0],
            visibility: document.getElementById('post-visibility').value
          };
          break;
        case 'poll-post':
          const pollOptions = [];
          document.querySelectorAll('.poll-option-input').forEach(input => {
            if (input.value.trim()) {
              pollOptions.push(input.value.trim());
            }
          });
          
          postData = {
            type: 'poll',
            question: document.getElementById('poll-question').value,
            options: pollOptions,
            duration: document.getElementById('poll-duration').value,
            visibility: document.getElementById('post-visibility').value
          };
          break;
      }
      
      // In a real app, we would send this data to the server
      console.log('Creating post:', postData);
      
      // For demo purposes, show a success message and close the modal
      alert('Post created successfully!');
      createPostModal.style.display = 'none';
      
      // Reset form
      createPostForm.reset();
      
      // Reload posts to show the new post (in a real app, we would add it to the DOM)
      loadPosts();
    });
  }
  
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn, .sidebar-nav a[data-filter]');
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all buttons
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      button.classList.add('active');
      
      const filter = button.dataset.filter;
      console.log(`Filtering posts by: ${filter}`);
      
      // In a real app, we would filter the posts
      // For demo purposes, just reload all posts
      loadPosts();
    });
  });
  
  // Notifications button
  const notificationsBtn = document.getElementById('notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Notifications feature will be implemented soon!');
    });
  }
}
