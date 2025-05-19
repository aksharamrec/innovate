/**
 * Profile Page Script
 * Handle user profile data loading and interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const currentUser = await checkAuth();
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.replace('auth.html');
    return;
  }
  
  // Get username from URL if available, otherwise use current user
  const urlParams = new URLSearchParams(window.location.search);
  const profileUsername = urlParams.get('username');
  
  // Determine if this is the current user's profile or someone else's
  let isOwnProfile = !profileUsername || profileUsername === currentUser.username;
  
  // Load profile data
  let profileUser;
  
  if (isOwnProfile) {
    profileUser = currentUser;
  } else {
    try {
      // In a real app, would fetch user data from API
      // For demo, using mock data
      profileUser = await fetchUserProfile(profileUsername);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to current user's profile
      profileUser = currentUser;
      isOwnProfile = true;
    }
  }
  
  // Display profile data
  displayProfileData(profileUser, isOwnProfile);
  
  // Set up profile actions based on whose profile it is
  setupProfileActions(profileUser, isOwnProfile);
  
  // Load initial tab content (posts)
  loadPosts(profileUser.id);
  
  // Set up tab navigation
  setupTabs(profileUser);
  
  // Set up modals
  setupModals(profileUser);
});

/**
 * Fetch user profile data (mock implementation)
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} User profile data
 */
async function fetchUserProfile(username) {
  // In a real app, would make an API call
  // For demo, return mock data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock users
  const mockUsers = {
    'janesmith': {
      id: '2',
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      avatar: null,
      bio: 'Sustainability advocate and renewable energy researcher',
      skills: ['Renewable Energy', 'Climate Science', 'Project Management'],
      interests: ['Sustainability', 'Clean Tech', 'Science Communication'],
      stats: {
        posts: 42,
        following: 178,
        followers: 203
      }
    },
    'techinnovate': {
      id: '3',
      name: 'Tech Innovators',
      username: 'techinnovate',
      email: 'info@techinnovate.example',
      avatar: null,
      bio: 'A community of tech enthusiasts exploring emerging technologies',
      skills: ['Blockchain', 'AI', 'Quantum Computing'],
      interests: ['Emerging Tech', 'Innovation', 'Digital Transformation'],
      stats: {
        posts: 87,
        following: 56,
        followers: 521
      }
    }
  };
  
  // Return mock user or throw error if not found
  if (mockUsers[username]) {
    return mockUsers[username];
  } else {
    throw new Error('User not found');
  }
}

/**
 * Display profile data on the page
 * @param {Object} user - User profile data
 * @param {boolean} isOwnProfile - Whether this is the current user's profile
 */
function displayProfileData(user, isOwnProfile) {
  // Update page title
  document.title = `${user.name} | Innovate`;
  
  // Update profile header
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-username').textContent = `@${user.username}`;
  
  // Update profile stats
  document.getElementById('posts-count').textContent = user.stats.posts;
  document.getElementById('following-count').textContent = user.stats.following;
  document.getElementById('followers-count').textContent = user.stats.followers;
  
  // Set profile avatar
  const profileAvatar = document.getElementById('profile-avatar');
  if (user.avatar) {
    profileAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
  } else {
    // Generate initials
    const initials = user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    profileAvatar.textContent = initials;
  }
}

/**
 * Set up profile action buttons based on whose profile is being viewed
 * @param {Object} user - User profile data
 * @param {boolean} isOwnProfile - Whether this is the current user's profile
 */
function setupProfileActions(user, isOwnProfile) {
  const actionsContainer = document.getElementById('profile-actions');
  
  if (isOwnProfile) {
    // Show edit profile button
    actionsContainer.innerHTML = `
      <button id="edit-profile-btn" class="profile-btn primary-btn">
        <i class="fas fa-edit"></i> Edit Profile
      </button>
    `;
    
    // Add event listener
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      openEditProfileModal(user);
    });
  } else {
    // Show follow/message buttons
    actionsContainer.innerHTML = `
      <button id="follow-btn" class="profile-btn primary-btn">
        <i class="fas fa-user-plus"></i> Follow
      </button>
      <button id="message-btn" class="profile-btn secondary-btn">
        <i class="fas fa-comment"></i> Message
      </button>
      <button id="more-actions-btn" class="profile-btn secondary-btn">
        <i class="fas fa-ellipsis-h"></i>
      </button>
    `;
    
    // Add event listeners
    document.getElementById('follow-btn').addEventListener('click', () => {
      toggleFollow(user);
    });
    
    document.getElementById('message-btn').addEventListener('click', () => {
      openMessageModal(user);
    });
    
    document.getElementById('more-actions-btn').addEventListener('click', () => {
      showMoreActions(user);
    });
  }
}

/**
 * Set up tab navigation
 * @param {Object} user - User profile data
 */
function setupTabs(user) {
  const tabs = document.querySelectorAll('.profile-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab panels
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Show selected tab panel
      const tabName = tab.dataset.tab;
      document.getElementById(`${tabName}-panel`).classList.add('active');
      
      // Load content for the selected tab
      switch (tabName) {
        case 'posts':
          loadPosts(user.id);
          break;
        case 'about':
          loadAboutInfo(user);
          break;
        case 'connections':
          loadConnections(user.id, 'followers');
          break;
        case 'saved':
          loadSavedPosts();
          break;
      }
    });
  });
  
  // Set up connections filter
  const connectionFilters = document.querySelectorAll('.connection-filter-btn');
  connectionFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      // Remove active class from all filters
      connectionFilters.forEach(f => f.classList.remove('active'));
      
      // Add active class to clicked filter
      filter.classList.add('active');
      
      // Load connections based on filter
      const filterType = filter.dataset.filter;
      loadConnections(user.id, filterType);
    });
  });
}

/**
 * Load user posts
 * @param {string} userId - User ID to load posts for
 */
async function loadPosts(userId) {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = `
    <div class="loading-posts">
      <i class="fas fa-spinner fa-spin"></i> Loading posts...
    </div>
  `;
  
  try {
    // In a real app, would fetch posts from API
    // For demo, using mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock posts
    const posts = [
      {
        id: 1,
        content: 'Excited to share our latest research on sustainable energy storage solutions!',
        timestamp: '2023-06-20T14:30:00Z',
        likes: 24,
        comments: 8
      },
      {
        id: 2,
        content: 'Just launched our new community initiative for tech mentorship. Looking for volunteers!',
        image: 'https://source.unsplash.com/random/800x600/?community',
        timestamp: '2023-06-15T09:45:00Z',
        likes: 42,
        comments: 15
      },
      {
        id: 3,
        content: 'Attending the Global Innovation Summit next week. Anyone else going to be there?',
        timestamp: '2023-06-10T11:20:00Z',
        likes: 18,
        comments: 7
      }
    ];
    
    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="no-posts-message">
          No posts yet. 
          ${userId === JSON.parse(localStorage.getItem('user_data')).id ? 
            'Share your first post!' : ''}
        </div>
      `;
      return;
    }
    
    // Render posts
    postsContainer.innerHTML = '';
    posts.forEach(post => {
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
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
 * Create a post element
 * @param {Object} post - Post data
 * @returns {HTMLElement} - Post element
 */
function createPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  
  // Format timestamp
  const postDate = new Date(post.timestamp);
  const timeAgo = formatTimeAgo(postDate);
  
  // Get current user for avatar
  const currentUser = JSON.parse(localStorage.getItem('user_data'));
  
  // Generate avatar
  let avatarContent = '';
  if (currentUser.avatar) {
    avatarContent = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
  } else {
    const initials = currentUser.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    avatarContent = initials;
  }
  
  postElement.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${avatarContent}</div>
      <div class="post-user-info">
        <div class="post-user-name">${currentUser.name}</div>
        <div class="post-time">${timeAgo}</div>
      </div>
      <button class="post-menu">
        <i class="fas fa-ellipsis-h"></i>
      </button>
    </div>
    <div class="post-content">
      <p>${post.content}</p>
      ${post.image ? `
        <div class="post-image">
          <img src="${post.image}" alt="Post image">
        </div>
      ` : ''}
    </div>
    <div class="post-actions">
      <button class="post-action-btn" data-action="like">
        <i class="far fa-thumbs-up"></i> ${post.likes}
      </button>
      <button class="post-action-btn" data-action="comment">
        <i class="far fa-comment"></i> ${post.comments}
      </button>
      <button class="post-action-btn" data-action="share">
        <i class="fas fa-share"></i> Share
      </button>
      <button class="post-action-btn" data-action="save">
        <i class="far fa-bookmark"></i> Save
      </button>
    </div>
  `;
  
  // Add event listeners
  postElement.querySelector('[data-action="like"]').addEventListener('click', function() {
    this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${post.likes + 1}`;
    this.disabled = true;
  });
  
  postElement.querySelector('.post-menu').addEventListener('click', () => {
    showPostMenu(post);
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
 * Load about information
 * @param {Object} user - User profile data
 */
function loadAboutInfo(user) {
  // Set bio
  const bioElement = document.getElementById('profile-bio');
  bioElement.textContent = user.bio || 'No bio available.';
  
  // Set skills
  const skillsContainer = document.getElementById('profile-skills');
  if (user.skills && user.skills.length > 0) {
    skillsContainer.innerHTML = '';
    user.skills.forEach(skill => {
      const skillTag = document.createElement('div');
      skillTag.className = 'skill-tag';
      skillTag.textContent = skill;
      skillsContainer.appendChild(skillTag);
    });
  } else {
    skillsContainer.innerHTML = '<p>No skills listed.</p>';
  }
  
  // Set interests
  const interestsContainer = document.getElementById('profile-interests');
  if (user.interests && user.interests.length > 0) {
    interestsContainer.innerHTML = '';
    user.interests.forEach(interest => {
      const interestTag = document.createElement('div');
      interestTag.className = 'interest-tag';
      interestTag.textContent = interest;
      interestsContainer.appendChild(interestTag);
    });
  } else {
    interestsContainer.innerHTML = '<p>No interests listed.</p>';
  }
}

/**
 * Load user connections
 * @param {string} userId - User ID to load connections for
 * @param {string} type - Type of connections to load ('followers' or 'following')
 */
async function loadConnections(userId, type) {
  const connectionsContainer = document.getElementById('connections-list');
  connectionsContainer.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading ${type}...
    </div>
  `;
  
  try {
    // In a real app, would fetch connections from API
    // For demo, using mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock connections
    const mockConnections = {
      followers: [
        {
          id: '10',
          name: 'Michael Johnson',
          username: 'mjohnson',
          avatar: null
        },
        {
          id: '11',
          name: 'Emily Chen',
          username: 'echen',
          avatar: null
        },
        {
          id: '12',
          name: 'Climate Initiative',
          username: 'climate',
          avatar: null
        }
      ],
      following: [
        {
          id: '20',
          name: 'David Williams',
          username: 'davidw',
          avatar: null
        },
        {
          id: '21',
          name: 'Green Energy Lab',
          username: 'greenlab',
          avatar: null
        }
      ]
    };
    
    const connections = mockConnections[type] || [];
    
    if (connections.length === 0) {
      connectionsContainer.innerHTML = `
        <div class="no-connections-message">
          No ${type} yet.
        </div>
      `;
      return;
    }
    
    // Render connections
    connectionsContainer.innerHTML = '';
    connections.forEach(connection => {
      const connectionElement = document.createElement('div');
      connectionElement.className = 'connection-card';
      
      // Generate avatar
      let avatarContent = '';
      if (connection.avatar) {
        avatarContent = `<img src="${connection.avatar}" alt="${connection.name}">`;
      } else {
        const initials = connection.name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .substring(0, 2)
          .toUpperCase();
        avatarContent = initials;
      }
      
      connectionElement.innerHTML = `
        <div class="connection-avatar">${avatarContent}</div>
        <div class="connection-info">
          <h3 class="connection-name">${connection.name}</h3>
          <p class="connection-username">@${connection.username}</p>
        </div>
        <div class="connection-action">
          ${type === 'followers' ? 
            '<button class="profile-btn secondary-btn">Follow Back</button>' : 
            '<button class="profile-btn secondary-btn">Unfollow</button>'}
        </div>
      `;
      
      // Add event listeners
      const actionButton = connectionElement.querySelector('.connection-action button');
      actionButton.addEventListener('click', () => {
        if (type === 'followers') {
          actionButton.textContent = 'Following';
          actionButton.disabled = true;
        } else {
          connectionElement.remove();
        }
      });
      
      connectionsContainer.appendChild(connectionElement);
    });
  } catch (error) {
    console.error('Error loading connections:', error);
    connectionsContainer.innerHTML = `
      <div class="error-message">
        <p>Error loading ${type}. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Load saved posts
 */
async function loadSavedPosts() {
  const savedPostsContainer = document.getElementById('saved-posts-container');
  savedPostsContainer.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading saved posts...
    </div>
  `;
  
  try {
    // In a real app, would fetch saved posts from API
    // For demo, using mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock saved posts
    const savedPosts = [
      {
        id: 5,
        user: {
          id: '3',
          name: 'Tech Innovators',
          username: 'techinnovate',
          avatar: null
        },
        content: 'Our latest article on quantum computing applications in cybersecurity is now available.',
        timestamp: '2023-06-12T15:30:00Z',
        likes: 87,
        comments: 23
      }
    ];
    
    if (savedPosts.length === 0) {
      savedPostsContainer.innerHTML = `
        <div class="no-saved-posts-message">
          No saved posts yet.
        </div>
      `;
      return;
    }
    
    // Render saved posts
    savedPostsContainer.innerHTML = '';
    savedPosts.forEach(post => {
      const postElement = createPostElement(post);
      savedPostsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error('Error loading saved posts:', error);
    savedPostsContainer.innerHTML = `
      <div class="error-message">
        <p>Error loading saved posts. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Open edit profile modal
 * @param {Object} user - User profile data
 */
function openEditProfileModal(user) {
  const modal = document.getElementById('edit-profile-modal');
  
  // Fill form with current user data
  document.getElementById('edit-name').value = user.name || '';
  document.getElementById('edit-bio').value = user.bio || '';
  document.getElementById('edit-skills').value = user.skills ? user.skills.join(', ') : '';
  document.getElementById('edit-interests').value = user.interests ? user.interests.join(', ') : '';
  
  // Show modal
  modal.style.display = 'block';
  
  // Close button
  const closeBtn = modal.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Form submission
  const form = document.getElementById('edit-profile-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('edit-name').value;
    const bio = document.getElementById('edit-bio').value;
    const skills = document.getElementById('edit-skills').value
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
    const interests = document.getElementById('edit-interests').value
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest !== '');
    
    // Update user data
    user.name = name;
    user.bio = bio;
    user.skills = skills;
    user.interests = interests;
    
    // In a real app, would send updated data to API
    
    // Update local storage
    const userData = JSON.parse(localStorage.getItem('user_data'));
    userData.name = name;
    userData.bio = bio;
    userData.skills = skills;
    userData.interests = interests;
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Update UI
    displayProfileData(user, true);
    loadAboutInfo(user);
    
    // Close modal
    modal.style.display = 'none';
    
    // Show success message
    alert('Profile updated successfully!');
  });
}

/**
 * Open message modal
 * @param {Object} user - User to message
 */
function openMessageModal(user) {
  const modal = document.getElementById('message-modal');
  
  // Set recipient info
  const avatarContainer = modal.querySelector('.recipient-avatar');
  if (user.avatar) {
    avatarContainer.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
  } else {
    const initials = user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    avatarContainer.textContent = initials;
    avatarContainer.style.backgroundColor = 'var(--primary-color)';
    avatarContainer.style.color = 'white';
    avatarContainer.style.display = 'flex';
    avatarContainer.style.alignItems = 'center';
    avatarContainer.style.justifyContent = 'center';
    avatarContainer.style.fontWeight = 'bold';
  }
  
  modal.querySelector('.recipient-name').textContent = user.name;
  
  // Show modal
  modal.style.display = 'block';
  
  // Close button
  const closeBtn = modal.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Form submission
  const form = document.getElementById('message-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get message text
    const messageText = document.getElementById('message-text').value;
    
    // In a real app, would send message to API
    console.log(`Sending message to ${user.name}: ${messageText}`);
    
    // Close modal
    modal.style.display = 'none';
    
    // Reset form
    form.reset();
    
    // Show success message
    alert(`Message sent to ${user.name}!`);
  });
}

/**
 * Toggle follow status
 * @param {Object} user - User to follow/unfollow
 */
function toggleFollow(user) {
  const followBtn = document.getElementById('follow-btn');
  
  // Toggle follow state
  if (followBtn.textContent.trim() === 'Follow') {
    followBtn.innerHTML = '<i class="fas fa-user-check"></i> Following';
    followBtn.classList.remove('primary-btn');
    followBtn.classList.add('secondary-btn');
    
    // In a real app, would send follow request to API
    console.log(`Following ${user.name}`);
  } else {
    followBtn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
    followBtn.classList.remove('secondary-btn');
    followBtn.classList.add('primary-btn');
    
    // In a real app, would send unfollow request to API
    console.log(`Unfollowed ${user.name}`);
  }
}

/**
 * Show more actions
 * @param {Object} user - User profile
 */
function showMoreActions(user) {
  const options = ['Report User', 'Block User', 'Share Profile'];
  
  // For demo, use a simple prompt
  const selectedOption = prompt(`Choose an action:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
  
  // Handle selected option
  if (selectedOption && options[parseInt(selectedOption) - 1]) {
    const option = options[parseInt(selectedOption) - 1];
    
    switch (option) {
      case 'Report User':
        alert('Thank you for your report. We will review it shortly.');
        break;
      case 'Block User':
        if (confirm(`Are you sure you want to block ${user.name}?`)) {
          alert(`You have blocked ${user.name}.`);
        }
        break;
      case 'Share Profile':
        const profileUrl = `${window.location.origin}/profile.html?username=${user.username}`;
        navigator.clipboard.writeText(profileUrl)
          .then(() => alert('Profile link copied to clipboard!'))
          .catch(err => console.error('Error copying link:', err));
        break;
    }
  }
}

/**
 * Show post menu
 * @param {Object} post - Post data
 */
function showPostMenu(post) {
  const options = ['Share', 'Save', 'Report'];
  
  // For demo, use a simple prompt
  const selectedOption = prompt(`Choose an action:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
  
  // Handle selected option
  if (selectedOption && options[parseInt(selectedOption) - 1]) {
    const option = options[parseInt(selectedOption) - 1];
    
    switch (option) {
      case 'Share':
        const postUrl = `${window.location.origin}/post.html?id=${post.id}`;
        navigator.clipboard.writeText(postUrl)
          .then(() => alert('Post link copied to clipboard!'))
          .catch(err => console.error('Error copying link:', err));
        break;
      case 'Save':
        alert('Post saved to your bookmarks.');
        break;
      case 'Report':
        alert('Thank you for your report. We will review this post shortly.');
        break;
    }
  }
}

/**
 * Set up modals
 * @param {Object} user - User profile data
 */
function setupModals(user) {
  // Edit profile modal setup
  const editProfileModal = document.getElementById('edit-profile-modal');
  const editProfileForm = document.getElementById('edit-profile-form');
  
  editProfileForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Handle form submission
    const name = document.getElementById('edit-name').value;
    const bio = document.getElementById('edit-bio').value;
    const skills = document.getElementById('edit-skills').value
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill);
    const interests = document.getElementById('edit-interests').value
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest);
    
    // Update user data
    const userData = {
      ...user,
      name,
      bio,
      skills,
      interests
    };
    
    // In a real app, would update data on server
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Update UI
    displayProfileData(userData, true);
    loadAboutInfo(userData);
    
    // Close modal
    editProfileModal.style.display = 'none';
    
    // Show success message
    alert('Profile updated successfully!');
  });
  
  // Message modal setup
  const messageModal = document.getElementById('message-modal');
  const messageForm = document.getElementById('message-form');
  
  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Get message text
    const messageText = document.getElementById('message-text').value;
    
    // In a real app, would send message to server
    console.log('Sending message:', messageText);
    
    // Show success message
    alert('Message sent successfully!');
    
    // Reset form and close modal
    messageForm.reset();
    messageModal.style.display = 'none';
  });
  
  // Close buttons for modals
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', e => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}
