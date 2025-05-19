/**
 * Communities Page Script
 * Handles community browsing, creation, and interaction
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is authenticated
  const currentUser = await checkAuth();
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.replace('auth.html');
    return;
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Load user communities by default
  loadCommunities('my-communities');
  
  // Set active nav link
  setActiveNavLink('my-communities');
});

/**
 * Set up event listeners for the communities page
 */
function setupEventListeners() {
  // Create Community button
  const createCommunityBtn = document.getElementById('create-community-btn');
  if (createCommunityBtn) {
    createCommunityBtn.addEventListener('click', () => {
      openCreateCommunityModal();
    });
  }
  
  // Get Started button (in empty state)
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      openCreateCommunityModal();
    });
  }
  
  // Navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the view to load
      const view = link.dataset.view;
      
      // Set active class
      setActiveNavLink(view);
      
      // Load communities for the selected view
      loadCommunities(view);
    });
  });
  
  // Community search
  const searchInput = document.getElementById('community-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      const searchTerm = searchInput.value.trim();
      const activeView = document.querySelector('.nav-link.active').dataset.view;
      
      if (searchTerm.length > 0) {
        searchCommunities(searchTerm, activeView);
      } else {
        loadCommunities(activeView);
      }
    }, 300));
  }
  
  // Create Community form
  const createCommunityForm = document.getElementById('create-community-form');
  if (createCommunityForm) {
    createCommunityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createCommunity();
    });
  }
  
  // Modal close buttons
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeAllModals();
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  });
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Set active navigation link
 * @param {string} view - The view to set as active
 */
function setActiveNavLink(view) {
  // Remove active class from all links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to the selected link
  const activeLink = document.querySelector(`.nav-link[data-view="${view}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Load communities based on the selected view
 * @param {string} view - The view to load (my-communities, discover, invitations)
 */
async function loadCommunities(view) {
  const communitiesList = document.getElementById('communities-list');
  
  // Show loading spinner
  communitiesList.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading communities...
    </div>
  `;
  
  try {
    // In a real app, we would fetch communities from an API
    // For demo, we'll use mock data and simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock communities data
    const mockCommunities = {
      'my-communities': [
        {
          id: '1',
          name: 'Tech Innovators',
          privacy: 'public',
          membersCount: 342,
          lastActive: '2023-09-15T14:30:00Z',
          isAdmin: true
        },
        {
          id: '2',
          name: 'Sustainability Projects',
          privacy: 'restricted',
          membersCount: 128,
          lastActive: '2023-09-14T09:15:00Z',
          isAdmin: false
        }
      ],
      'discover': [
        {
          id: '3',
          name: 'AI Research Group',
          privacy: 'public',
          membersCount: 521,
          lastActive: '2023-09-15T16:45:00Z',
          isAdmin: false
        },
        {
          id: '4',
          name: 'Social Entrepreneurs',
          privacy: 'public',
          membersCount: 284,
          lastActive: '2023-09-13T11:20:00Z',
          isAdmin: false
        },
        {
          id: '5',
          name: 'Clean Energy Network',
          privacy: 'restricted',
          membersCount: 192,
          lastActive: '2023-09-14T13:10:00Z',
          isAdmin: false
        }
      ],
      'invitations': [
        {
          id: '6',
          name: 'Future of Transportation',
          privacy: 'private',
          membersCount: 86,
          lastActive: '2023-09-12T15:30:00Z',
          isAdmin: false,
          invitedBy: {
            id: '12',
            name: 'Jane Smith'
          }
        },
        {
          id: '7',
          name: 'Healthcare Innovations',
          privacy: 'restricted',
          membersCount: 154,
          lastActive: '2023-09-10T10:45:00Z',
          isAdmin: false,
          invitedBy: {
            id: '8',
            name: 'Alex Johnson'
          }
        }
      ]
    };
    
    // Get communities for the selected view
    const communities = mockCommunities[view] || [];
    
    // Clear the list
    communitiesList.innerHTML = '';
    
    // Show empty state if no communities
    if (communities.length === 0) {
      communitiesList.innerHTML = `
        <div class="empty-list-message">
          <p>No communities found.</p>
        </div>
      `;
      return;
    }
    
    // Render communities
    communities.forEach(community => {
      const communityElement = createCommunityElement(community, view);
      communitiesList.appendChild(communityElement);
    });
  } catch (error) {
    console.error('Error loading communities:', error);
    communitiesList.innerHTML = `
      <div class="error-message">
        <p>Error loading communities. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Create a community list item element
 * @param {Object} community - Community data
 * @param {string} view - Current view
 * @returns {HTMLElement} - Community list item
 */
function createCommunityElement(community, view) {
  const communityElement = document.createElement('div');
  communityElement.className = 'community-item';
  communityElement.dataset.communityId = community.id;
  
  // Generate name initials for avatar
  const initials = community.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Format last active time
  const lastActiveDate = new Date(community.lastActive);
  const timeAgo = formatTimeAgo(lastActiveDate);
  
  // Get privacy icon
  let privacyIcon = '';
  switch (community.privacy) {
    case 'public':
      privacyIcon = 'fa-globe';
      break;
    case 'restricted':
      privacyIcon = 'fa-lock-open';
      break;
    case 'private':
      privacyIcon = 'fa-lock';
      break;
  }
  
  // Invitation info (if applicable)
  let invitationInfo = '';
  if (view === 'invitations' && community.invitedBy) {
    invitationInfo = `
      <div class="invitation-info">
        <span>Invited by ${community.invitedBy.name}</span>
      </div>
    `;
  }
  
  communityElement.innerHTML = `
    <div class="community-avatar">${initials}</div>
    <div class="community-info">
      <h3 class="community-name">${community.name}</h3>
      <div class="community-meta">
        <span class="community-members">${community.membersCount} members</span>
        <span class="community-privacy">
          <i class="fas ${privacyIcon}"></i> ${community.privacy}
        </span>
        <span class="community-active">Active ${timeAgo}</span>
        ${community.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
      </div>
      ${invitationInfo}
    </div>
  `;
  
  // Add click event to open community
  communityElement.addEventListener('click', () => {
    // If this is an invitation, don't open the community directly
    if (view === 'invitations') {
      promptInvitationResponse(community);
    } else {
      openCommunity(community.id);
    }
  });
  
  return communityElement;
}

/**
 * Prompt the user to accept or decline an invitation
 * @param {Object} community - Community data
 */
function promptInvitationResponse(community) {
  const response = confirm(`Would you like to join the "${community.name}" community?`);
  
  if (response) {
    // Accept invitation
    alert(`You have joined the "${community.name}" community!`);
    
    // In a real app, we would send the acceptance to the server
    // For demo, just remove the invitation and refresh the list
    const invitationElement = document.querySelector(`.community-item[data-community-id="${community.id}"]`);
    if (invitationElement) {
      invitationElement.remove();
    }
    
    // Update the invitation count badge
    updateInvitationBadge();
    
    // Open the community
    openCommunity(community.id);
  } else {
    // Decline invitation
    alert(`Invitation to "${community.name}" declined.`);
    
    // In a real app, we would send the declination to the server
    // For demo, just remove the invitation and refresh the list
    const invitationElement = document.querySelector(`.community-item[data-community-id="${community.id}"]`);
    if (invitationElement) {
      invitationElement.remove();
    }
    
    // Update the invitation count badge
    updateInvitationBadge();
  }
}

/**
 * Update the invitation count badge
 */
function updateInvitationBadge() {
  const invitationBadge = document.querySelector('.nav-link[data-view="invitations"] .badge');
  if (invitationBadge) {
    const remainingInvitations = document.querySelectorAll('#communities-list .community-item').length;
    
    if (remainingInvitations > 0) {
      invitationBadge.textContent = remainingInvitations;
    } else {
      invitationBadge.style.display = 'none';
    }
  }
}

/**
 * Open a community
 * @param {string} communityId - Community ID to open
 */
async function openCommunity(communityId) {
  const communityContent = document.getElementById('communities-content');
  
  // Show loading state
  communityContent.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading community...
    </div>
  `;
  
  try {
    // In a real app, would fetch community data from API
    // For demo, using mock data and simulating network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock community data
    const community = {
      id: communityId,
      name: 'Tech Innovators',
      description: 'A community for technology enthusiasts, innovators, and entrepreneurs to share ideas, collaborate on projects, and discuss the latest tech trends.',
      privacy: 'public',
      membersCount: 342,
      topics: ['Technology', 'Innovation', 'AI', 'Entrepreneurship'],
      createdAt: '2023-01-15T10:00:00Z',
      isAdmin: communityId === '1', // For demo, let's say user is admin of community with ID 1
      isMember: true,
      posts: [
        {
          id: 'p1',
          author: {
            id: 'u1',
            name: 'Jane Smith',
            avatar: null
          },
          content: 'Just finished working on a new open-source project that uses AI to optimize energy consumption in smart homes. Check out the GitHub repo!',
          image: null,
          likes: 28,
          comments: 12,
          timestamp: '2023-09-15T14:30:00Z'
        },
        {
          id: 'p2',
          author: {
            id: 'u2',
            name: 'Alex Johnson',
            avatar: null
          },
          content: 'Hosting a workshop on Web3 technologies next week. Anyone interested in joining?',
          image: 'https://source.unsplash.com/random/800x600/?workshop',
          likes: 19,
          comments: 8,
          timestamp: '2023-09-14T11:15:00Z'
        }
      ]
    };
    
    // Render community
    renderCommunity(community);
    
    // Set active community in the sidebar
    setActiveCommunity(communityId);
  } catch (error) {
    console.error('Error opening community:', error);
    communityContent.innerHTML = `
      <div class="error-message">
        <p>Error loading community. Please try again later.</p>
        <button class="primary-btn" onclick="window.location.reload()">Refresh</button>
      </div>
    `;
  }
}

/**
 * Render community content
 * @param {Object} community - Community data
 */
function renderCommunity(community) {
  const communityContent = document.getElementById('communities-content');
  
  // Format date
  const createdDate = new Date(community.createdAt);
  const formattedDate = createdDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate initials for the avatar
  const initials = community.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Get privacy icon and text
  let privacyIcon, privacyText;
  switch (community.privacy) {
    case 'public':
      privacyIcon = 'fa-globe';
      privacyText = 'Public';
      break;
    case 'restricted':
      privacyIcon = 'fa-lock-open';
      privacyText = 'Restricted';
      break;
    case 'private':
      privacyIcon = 'fa-lock';
      privacyText = 'Private';
      break;
  }
  
  // Render community header and tabs
  communityContent.innerHTML = `
    <div class="community-header">
      <div class="community-header-avatar">${initials}</div>
      <div class="community-header-info">
        <h2 class="community-header-name">${community.name}</h2>
        <div class="community-header-meta">
          <div><i class="fas fa-users"></i> ${community.membersCount} members</div>
          <div><i class="fas ${privacyIcon}"></i> ${privacyText}</div>
          <div><i class="fas fa-calendar-alt"></i> Created ${formattedDate}</div>
        </div>
      </div>
      <div class="community-header-actions">
        ${community.isAdmin ? 
          `<button class="primary-btn" id="manage-community-btn">
            <i class="fas fa-cog"></i> Manage
          </button>` : 
          (community.isMember ? 
            `<button class="secondary-btn" id="leave-community-btn">
              <i class="fas fa-sign-out-alt"></i> Leave
            </button>` : 
            `<button class="primary-btn" id="join-community-btn">
              <i class="fas fa-user-plus"></i> Join
            </button>`
          )
        }
        ${community.isMember ? 
          `<button class="primary-btn" id="invite-members-btn">
            <i class="fas fa-user-plus"></i> Invite
          </button>` : ''
        }
      </div>
    </div>
    
    <div class="community-tabs">
      <button class="community-tab active" data-tab="feed">Feed</button>
      <button class="community-tab" data-tab="about">About</button>
      <button class="community-tab" data-tab="members">Members</button>
      <button class="community-tab" data-tab="files">Files</button>
    </div>
    
    <div class="community-content" id="community-tab-content">
      <!-- Initial tab content (feed) will be loaded here -->
    </div>
  `;
  
  // Load feed tab content by default
  loadCommunityTab('feed', community);
  
  // Set up tab navigation
  setupCommunityTabs(community);
  
  // Set up action buttons
  setupCommunityActions(community);
}

/**
 * Set the active community in the sidebar
 * @param {string} communityId - Community ID to set as active
 */
function setActiveCommunity(communityId) {
  // Remove active class from all community items
  document.querySelectorAll('.community-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to the selected community item
  const communityItem = document.querySelector(`.community-item[data-community-id="${communityId}"]`);
  if (communityItem) {
    communityItem.classList.add('active');
  }
}

/**
 * Set up community tab navigation
 * @param {Object} community - Community data
 */
function setupCommunityTabs(community) {
  const tabs = document.querySelectorAll('.community-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Load the content for the selected tab
      const tabName = tab.dataset.tab;
      loadCommunityTab(tabName, community);
    });
  });
}

/**
 * Load content for a community tab
 * @param {string} tabName - Name of the tab to load
 * @param {Object} community - Community data
 */
function loadCommunityTab(tabName, community) {
  const tabContent = document.getElementById('community-tab-content');
  
  // Show loading spinner
  tabContent.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading ${tabName}...
    </div>
  `;
  
  // Simulate network delay
  setTimeout(() => {
    switch (tabName) {
      case 'feed':
        renderCommunityFeed(community, tabContent);
        break;
      case 'about':
        renderCommunityAbout(community, tabContent);
        break;
      case 'members':
        renderCommunityMembers(community, tabContent);
        break;
      case 'files':
        renderCommunityFiles(community, tabContent);
        break;
    }
  }, 500);
}

/**
 * Render the community feed tab
 * @param {Object} community - Community data
 * @param {HTMLElement} container - Container element to render into
 */
function renderCommunityFeed(community, container) {
  let postsHtml = '';
  
  if (community.posts.length === 0) {
    postsHtml = `
      <div class="no-posts-message">
        <p>No posts yet. Be the first to post in this community!</p>
      </div>
    `;
  } else {
    // Render each post
    community.posts.forEach(post => {
      // Generate author initials for avatar
      let avatarContent = '';
      if (post.author.avatar) {
        avatarContent = `<img src="${post.author.avatar}" alt="${post.author.name}">`;
      } else {
        const initials = post.author.name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .substring(0, 2)
          .toUpperCase();
        avatarContent = initials;
      }
      
      // Format timestamp
      const postDate = new Date(post.timestamp);
      const timeAgo = formatTimeAgo(postDate);
      
      postsHtml += `
        <div class="community-post" data-post-id="${post.id}">
          <div class="post-header">
            <div class="post-avatar">${avatarContent}</div>
            <div class="post-user-info">
              <h3 class="post-user-name">${post.author.name}</h3>
              <div class="post-meta">
                <div>${timeAgo}</div>
              </div>
            </div>
            <button class="post-menu">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>
          <div class="post-content">
            <p class="post-text">${post.content}</p>
            ${post.image ? `
              <div class="post-image-container">
                <img src="${post.image}" alt="Post image" class="post-image">
              </div>
            ` : ''}
          </div>
          <div class="post-actions">
            <button class="post-action" data-action="like">
              <i class="far fa-thumbs-up"></i> ${post.likes}
            </button>
            <button class="post-action" data-action="comment">
              <i class="far fa-comment"></i> ${post.comments}
            </button>
            <button class="post-action" data-action="share">
              <i class="fas fa-share"></i> Share
            </button>
          </div>
        </div>
      `;
    });
  }
  
  // Render the feed
  container.innerHTML = `
    <div class="community-feed">
      <div class="feed-header">
        <h3 class="feed-title">Community Feed</h3>
        <div class="feed-filter">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="announcements">Announcements</button>
          <button class="filter-btn" data-filter="events">Events</button>
        </div>
      </div>
      
      ${community.isMember ? `
        <div class="post-input-container">
          <div class="post-input-header">
            <div class="post-avatar">${getCurrentUserInitials()}</div>
            <div class="post-input-placeholder" id="create-post-trigger">
              Share something with the community...
            </div>
          </div>
          <div class="post-input-actions">
            <div class="post-input-types">
              <button class="post-input-type" data-type="photo">
                <i class="far fa-image"></i> Photo
              </button>
              <button class="post-input-type" data-type="video">
                <i class="far fa-play-circle"></i> Video
              </button>
              <button class="post-input-type" data-type="event">
                <i class="far fa-calendar"></i> Event
              </button>
              <button class="post-input-type" data-type="poll">
                <i class="far fa-chart-bar"></i> Poll
              </button>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="posts-container">
        ${postsHtml}
      </div>
    </div>
  `;
  
  // Add event listeners to posts
  setupPostInteractions(community);
}

/**
 * Get the current user's initials (for avatar)
 * @returns {string} User initials
 */
function getCurrentUserInitials() {
  const currentUser = JSON.parse(localStorage.getItem('user_data'));
  if (currentUser && currentUser.name) {
    return currentUser.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
  return 'U';
}

/**
 * Setup post interaction event listeners
 * @param {Object} community - Community data
 */
function setupPostInteractions(community) {
  // Like button clicks
  document.querySelectorAll('.post-action[data-action="like"]').forEach(button => {
    button.addEventListener('click', function() {
      const icon = this.querySelector('i');
      if (icon.classList.contains('far')) {
        // Like post
        icon.classList.remove('far');
        icon.classList.add('fas');
        this.classList.add('active');
        
        // Update like count
        const likeCount = parseInt(this.textContent.trim()) + 1;
        this.innerHTML = `<i class="fas fa-thumbs-up"></i> ${likeCount}`;
      } else {
        // Unlike post
        icon.classList.remove('fas');
        icon.classList.add('far');
        this.classList.remove('active');
        
        // Update like count
        const likeCount = parseInt(this.textContent.trim()) - 1;
        this.innerHTML = `<i class="far fa-thumbs-up"></i> ${likeCount}`;
      }
    });
  });
  
  // Comment button clicks
  document.querySelectorAll('.post-action[data-action="comment"]').forEach(button => {
    button.addEventListener('click', function() {
      alert('Comments feature coming soon!');
    });
  });
  
  // Share button clicks
  document.querySelectorAll('.post-action[data-action="share"]').forEach(button => {
    button.addEventListener('click', function() {
      const postElement = this.closest('.community-post');
      const postId = postElement.dataset.postId;
      
      // For demo, show share options
      alert(`Share options for post ${postId}`);
    });
  });
  
  // Post menu clicks
  document.querySelectorAll('.post-menu').forEach(button => {
    button.addEventListener('click', function() {
      const postElement = this.closest('.community-post');
      const postId = postElement.dataset.postId;
      
      // For demo, show post options
      const options = ['Save', 'Report', 'Hide', 'Mute'];
      const selectedOption = prompt(`Choose an option:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
      
      if (selectedOption && options[parseInt(selectedOption) - 1]) {
        alert(`Selected: ${options[parseInt(selectedOption) - 1]}`);
      }
    });
  });
  
  // Create post trigger
  const createPostTrigger = document.getElementById('create-post-trigger');
  if (createPostTrigger) {
    createPostTrigger.addEventListener('click', () => {
      alert('Create post modal coming soon!');
    });
  }
  
  // Post type buttons
  document.querySelectorAll('.post-input-type').forEach(button => {
    button.addEventListener('click', () => {
      const postType = button.dataset.type;
      alert(`Create ${postType} post coming soon!`);
    });
  });
}

/**
 * Render the community about tab
 * @param {Object} community - Community data
 * @param {HTMLElement} container - Container element to render into
 */
function renderCommunityAbout(community, container) {
  container.innerHTML = `
    <div class="about-container">
      <div class="about-section">
        <h3>About this Community</h3>
        <p class="about-description">${community.description}</p>
        
        <div class="about-meta">
          <div class="about-meta-item">
            <i class="fas fa-users"></i> ${community.membersCount} members
          </div>
          <div class="about-meta-item">
            <i class="fas fa-globe"></i> ${community.privacy} community
          </div>
          <div class="about-meta-item">
            <i class="fas fa-calendar-alt"></i> Created on ${new Date(community.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <h4>Topics</h4>
        <div class="topics-list">
          ${community.topics.map(topic => `
            <div class="topic-tag">${topic}</div>
          `).join('')}
        </div>
      </div>
      
      <div class="about-section">
        <h3>Community Rules</h3>
        <ol class="community-rules">
          <li>Be respectful and considerate of other members.</li>
          <li>Stay on topic and keep discussions relevant to the community's purpose.</li>
          <li>No spam, advertising, or self-promotion without permission.</li>
          <li>Respect intellectual property and give credit where it's due.</li>
          <li>No hate speech, harassment, or inappropriate content.</li>
        </ol>
      </div>
      
      ${community.isAdmin ? `
        <div class="admin-actions">
          <button class="secondary-btn" id="edit-about-btn">
            <i class="fas fa-edit"></i> Edit About Information
          </button>
          <button class="secondary-btn" id="edit-rules-btn">
            <i class="fas fa-gavel"></i> Edit Community Rules
          </button>
        </div>
      ` : ''}
    </div>
  `;
  
  // Set up admin action buttons if user is admin
  if (community.isAdmin) {
    document.getElementById('edit-about-btn').addEventListener('click', () => {
      alert('Edit about information coming soon!');
    });
    
    document.getElementById('edit-rules-btn').addEventListener('click', () => {
      alert('Edit community rules coming soon!');
    });
  }
}

/**
 * Render the community members tab
 * @param {Object} community - Community data
 * @param {HTMLElement} container - Container element to render into
 */
function renderCommunityMembers(community, container) {
  // Mock members data
  const members = [
    {
      id: 'u1',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: null,
      role: 'admin',
      joinedAt: '2023-01-15T10:00:00Z'
    },
    {
      id: 'u2',
      name: 'Alex Johnson',
      username: 'alexj',
      avatar: null,
      role: 'moderator',
      joinedAt: '2023-01-16T14:30:00Z'
    },
    {
      id: 'u3',
      name: 'Michael Brown',
      username: 'michaelb',
      avatar: null,
      role: 'member',
      joinedAt: '2023-01-20T09:15:00Z'
    },
    {
      id: 'u4',
      name: 'Sarah Wilson',
      username: 'sarahw',
      avatar: null,
      role: 'member',
      joinedAt: '2023-01-22T16:45:00Z'
    }
  ];
  
  container.innerHTML = `
    <div class="members-container">
      <div class="members-header">
        <h3 class="members-title">Community Members (${members.length})</h3>
        <div class="members-search">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search members...">
        </div>
      </div>
      
      <div class="members-list">
        ${members.map(member => {
          // Generate avatar
          let avatarContent = '';
          if (member.avatar) {
            avatarContent = `<img src="${member.avatar}" alt="${member.name}">`;
          } else {
            const initials = member.name
              .split(' ')
              .map(name => name.charAt(0))
              .join('')
              .substring(0, 2)
              .toUpperCase();
            avatarContent = initials;
          }
          
          // Format joined date
          const joinedDate = new Date(member.joinedAt);
          const formattedDate = joinedDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          return `
            <div class="member-card" data-member-id="${member.id}">
              <div class="member-avatar">${avatarContent}</div>
              <div class="member-info">
                <h3 class="member-name">${member.name}
                  ${member.role === 'admin' ? '<span class="admin-badge">Admin</span>' : ''}
                  ${member.role === 'moderator' ? '<span class="moderator-badge">Moderator</span>' : ''}
                </h3>
                <p class="member-role">Joined ${formattedDate}</p>
              </div>
              ${community.isAdmin && member.id !== 'u1' ? `
                <div class="member-actions">
                  <button class="member-action" title="Options" data-member-id="${member.id}">
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
      
      ${community.isAdmin ? `
        <div class="admin-actions" style="margin-top: 20px;">
          <button class="primary-btn" id="invite-members-btn-tab">
            <i class="fas fa-user-plus"></i> Invite Members
          </button>
          <button class="secondary-btn" id="manage-roles-btn">
            <i class="fas fa-user-cog"></i> Manage Roles
          </button>
        </div>
      ` : ''}
    </div>
  `;
  
  // Set up member action buttons
  document.querySelectorAll('.member-action').forEach(button => {
    button.addEventListener('click', () => {
      const memberId = button.dataset.memberId;
      
      // For demo, show member options
      const options = ['Make Moderator', 'Message', 'Remove from Community'];
      const selectedOption = prompt(`Choose an option:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
      
      if (selectedOption && options[parseInt(selectedOption) - 1]) {
        alert(`Selected: ${options[parseInt(selectedOption) - 1]} for member ${memberId}`);
      }
    });
  });
  
  // Set up admin action buttons
  if (community.isAdmin) {
    document.getElementById('invite-members-btn-tab').addEventListener('click', () => {
      openInviteMembersModal(community);
    });
    
    document.getElementById('manage-roles-btn').addEventListener('click', () => {
      alert('Manage roles feature coming soon!');
    });
  }
}

/**
 * Render the community files tab
 * @param {Object} community - Community data
 * @param {HTMLElement} container - Container element to render into
 */
function renderCommunityFiles(community, container) {
  // Mock files data
  const files = [
    {
      id: 'f1',
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'Jane Smith',
      uploadedAt: '2023-06-15T14:30:00Z'
    },
    {
      id: 'f2',
      name: 'Meeting Notes.docx',
      type: 'docx',
      size: '1.1 MB',
      uploadedBy: 'Alex Johnson',
      uploadedAt: '2023-06-10T09:15:00Z'
    },
    {
      id: 'f3',
      name: 'Budget Estimates.xlsx',
      type: 'xlsx',
      size: '3.5 MB',
      uploadedBy: 'Michael Brown',
      uploadedAt: '2023-05-28T11:45:00Z'
    },
    {
      id: 'f4',
      name: 'Presentation Slides.pptx',
      type: 'pptx',
      size: '5.2 MB',
      uploadedBy: 'Sarah Wilson',
      uploadedAt: '2023-05-20T16:30:00Z'
    }
  ];
  
  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'docx':
        return 'fa-file-word';
      case 'xlsx':
        return 'fa-file-excel';
      case 'pptx':
        return 'fa-file-powerpoint';
      case 'image':
        return 'fa-file-image';
      case 'video':
        return 'fa-file-video';
      default:
        return 'fa-file';
    }
  };
  
  container.innerHTML = `
    <div class="files-container">
      <div class="files-header">
        <h3 class="files-title">Community Files</h3>
        ${community.isMember ? `
          <button class="files-upload-btn" id="upload-file-btn">
            <i class="fas fa-upload"></i> Upload
          </button>
        ` : ''}
      </div>
      
      <div class="files-list">
        ${files.length === 0 ? `
          <div class="no-files-message">
            <p>No files have been shared in this community yet.</p>
          </div>
        ` : 
        files.map(file => {
          const icon = getFileIcon(file.type);
          const uploadedDate = new Date(file.uploadedAt);
          const timeAgo = formatTimeAgo(uploadedDate);
          
          return `
            <div class="file-card" data-file-id="${file.id}">
              <div class="file-icon">
                <i class="far ${icon}"></i>
              </div>
              <h4 class="file-name">${file.name}</h4>
              <div class="file-meta">
                <span>${file.size}</span>
                <span>${timeAgo}</span>
              </div>
              <div class="file-actions">
                <button class="file-action" title="Download">
                  <i class="fas fa-download"></i>
                </button>
                <button class="file-action" title="Share">
                  <i class="fas fa-share"></i>
                </button>
                <button class="file-action" title="More">
                  <i class="fas fa-ellipsis-h"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  // Set up upload button
  if (community.isMember) {
    document.getElementById('upload-file-btn').addEventListener('click', () => {
      alert('File upload feature coming soon!');
    });
  }
  
  // Set up file action buttons
  document.querySelectorAll('.file-action').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('title').toLowerCase();
      const fileCard = button.closest('.file-card');
      const fileId = fileCard.dataset.fileId;
      
      switch (action) {
        case 'download':
          alert(`Downloading file ${fileId}...`);
          break;
        case 'share':
          alert(`Share options for file ${fileId}`);
          break;
        case 'more':
          const options = ['View Details', 'Rename', 'Delete'];
          const selectedOption = prompt(`Choose an option:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
          
          if (selectedOption && options[parseInt(selectedOption) - 1]) {
            alert(`Selected: ${options[parseInt(selectedOption) - 1]} for file ${fileId}`);
          }
          break;
      }
    });
  });
}

/**
 * Set up community action buttons
 * @param {Object} community - Community data
 */
function setupCommunityActions(community) {
  // Manage community button (for admins)
  const manageCommunityBtn = document.getElementById('manage-community-btn');
  if (manageCommunityBtn) {
    manageCommunityBtn.addEventListener('click', () => {
      const options = ['Edit Community', 'Manage Members', 'Community Settings', 'Delete Community'];
      const selectedOption = prompt(`Choose an option:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
      
      if (selectedOption && options[parseInt(selectedOption) - 1]) {
        alert(`Selected: ${options[parseInt(selectedOption) - 1]}`);
      }
    });
  }
  
  // Leave community button
  const leaveCommunityBtn = document.getElementById('leave-community-btn');
  if (leaveCommunityBtn) {
    leaveCommunityBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to leave the "${community.name}" community?`)) {
        alert(`You have left the "${community.name}" community.`);
        // In a real app, would make an API call to leave the community
        // For demo, go back to the communities list
        loadCommunities('my-communities');
        
        // Reset community content
        document.getElementById('communities-content').innerHTML = `
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <h3>Welcome to Communities</h3>
            <p>Select a community to view or create a new one to start connecting with like-minded people</p>
            <button id="get-started-btn" class="primary-btn">Create Community</button>
          </div>
        `;
        
        // Set up get started button again
        document.getElementById('get-started-btn').addEventListener('click', () => {
          openCreateCommunityModal();
        });
      }
    });
  }
  
  // Join community button
  const joinCommunityBtn = document.getElementById('join-community-btn');
  if (joinCommunityBtn) {
    joinCommunityBtn.addEventListener('click', () => {
      alert(`You have joined the "${community.name}" community!`);
      // In a real app, would make an API call to join the community
      // For demo, reload the community with the user as a member
      community.isMember = true;
      renderCommunity(community);
    });
  }
  
  // Invite members button
  const inviteMembersBtn = document.getElementById('invite-members-btn');
  if (inviteMembersBtn) {
    inviteMembersBtn.addEventListener('click', () => {
      openInviteMembersModal(community);
    });
  }
}

/**
 * Open the invite members modal
 * @param {Object} community - Community data
 */
function openInviteMembersModal(community) {
  const modal = document.getElementById('invite-members-modal');
  modal.style.display = 'block';
  
  // Set up invite search
  const searchInput = document.getElementById('invite-search');
  const resultsContainer = document.getElementById('invite-results');
  const selectedContainer = document.getElementById('selected-invites');
  const sendButton = document.getElementById('send-invites-btn');
  
  // Clear previous state
  searchInput.value = '';
  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'none';
  selectedContainer.innerHTML = '';
  sendButton.disabled = true;
  
  // Focus search input
  setTimeout(() => {
    searchInput.focus();
  }, 100);
  
  // Handle search input
  searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
      resultsContainer.style.display = 'none';
      return;
    }
    
    // In a real app, would search the API
    // For demo, use mock data
    const mockResults = [
      {
        id: 'u5',
        name: 'Emily Davis',
        username: 'emilyd',
        avatar: null
      },
      {
        id: 'u6',
        name: 'David Wilson',
        username: 'davidw',
        avatar: null
      },
      {
        id: 'u7',
        name: 'Sophia Martinez',
        username: 'sophiam',
        avatar: null
      }
    ].filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) || 
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    
    // Display results
    resultsContainer.style.display = 'block';
    
    if (mockResults.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <p>No users found matching "${query}"</p>
        </div>
      `;
      return;
    }
    
    resultsContainer.innerHTML = '';
    mockResults.forEach(user => {
      // Skip if already selected
      if (document.querySelector(`.selected-invite[data-id="${user.id}"]`)) {
        return;
      }
      
      // Generate avatar
      let avatarContent = '';
      if (user.avatar) {
        avatarContent = `<img src="${user.avatar}" alt="${user.name}">`;
      } else {
        const initials = user.name
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .substring(0, 2)
          .toUpperCase();
        avatarContent = initials;
      }
      
      const resultItem = document.createElement('div');
      resultItem.className = 'invite-result-item';
      resultItem.dataset.id = user.id;
      resultItem.dataset.name = user.name;
      resultItem.innerHTML = `
        <div class="invite-avatar">${avatarContent}</div>
        <div class="invite-name">${user.name}</div>
        <div class="invite-username">@${user.username}</div>
      `;
      
      resultItem.addEventListener('click', () => {
        // Add to selected invites
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-invite';
        selectedItem.dataset.id = user.id;
        selectedItem.innerHTML = `
          <span class="selected-invite-name">${user.name}</span>
          <button class="remove-invite">
            <i class="fas fa-times"></i>
          </button>
        `;
        
        // Add remove button handler
        selectedItem.querySelector('.remove-invite').addEventListener('click', () => {
          selectedItem.remove();
          sendButton.disabled = selectedContainer.children.length === 0;
        });
        
        selectedContainer.appendChild(selectedItem);
        
        // Enable send button if at least one invite is selected
        sendButton.disabled = false;
        
        // Clear search
        searchInput.value = '';
        resultsContainer.style.display = 'none';
      });
      
      resultsContainer.appendChild(resultItem);
    });
  }, 300));
  
  // Handle send invites button click
  sendButton.addEventListener('click', () => {
    const selectedInvites = Array.from(document.querySelectorAll('.selected-invite')).map(invite => ({
      id: invite.dataset.id,
      name: invite.querySelector('.selected-invite-name').textContent
    }));
    
    const message = document.getElementById('invite-message').value;
    
    // In a real app, would send invites to the API
    console.log('Sending invites:', { invites: selectedInvites, message });
    
    alert(`Invitations sent to ${selectedInvites.length} people`);
    
    // Close modal
    modal.style.display = 'none';
  });
}

/**
 * Open the create community modal
 */
function openCreateCommunityModal() {
  const modal = document.getElementById('create-community-modal');
  modal.style.display = 'block';
}

/**
 * Create a new community
 */
function createCommunity() {
  const name = document.getElementById('community-name').value;
  const description = document.getElementById('community-description').value;
  const privacy = document.getElementById('community-privacy').value;
  const topics = document.getElementById('community-topics').value
    .split(',')
    .map(topic => topic.trim())
    .filter(topic => topic);
  
  // In a real app, would send this data to the API
  console.log('Creating community:', { name, description, privacy, topics });
  
  // For demo purposes, show a success message and close the modal
  alert(`Community "${name}" created successfully!`);
  
  // Close modal
  document.getElementById('create-community-modal').style.display = 'none';
  
  // Reset form
  document.getElementById('create-community-form').reset();
  
  // Reload communities to show the new community (in a real app, would add it to the DOM)
  loadCommunities('my-communities');
}

/**
 * Search communities
 * @param {string} searchTerm - Search term
 * @param {string} view - Current view
 */
function searchCommunities(searchTerm, view) {
  // In a real app, would search communities via the API
  // For demo, filter the mock data
  
  const communitiesList = document.getElementById('communities-list');
  
  // Show loading spinner
  communitiesList.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Searching communities...
    </div>
  `;
  
  // Simulate network delay
  setTimeout(() => {
    // Mock search results
    const searchResults = [
      {
        id: '1',
        name: 'Tech Innovators',
        privacy: 'public',
        membersCount: 342,
        lastActive: '2023-09-15T14:30:00Z',
        isAdmin: true
      }
    ].filter(community => 
      community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Clear the list
    communitiesList.innerHTML = '';
    
    // Show empty state if no results
    if (searchResults.length === 0) {
      communitiesList.innerHTML = `
        <div class="no-search-results">
          <p>No communities found matching "${searchTerm}".</p>
        </div>
      `;
      return;
    }
    
    // Render search results
    searchResults.forEach(community => {
      const communityElement = createCommunityElement(community, view);
      communitiesList.appendChild(communityElement);
    });
  }, 500);
}

/**
 * Close all modals
 */
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Format time ago for display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted time ago
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
