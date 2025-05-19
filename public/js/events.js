/**
 * Events Page Script
 * Handles event browsing, creation, and RSVP functionality
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
  
  // Load upcoming events by default
  loadEvents('upcoming');
  
  // Set active nav link
  setActiveNavLink('upcoming');
  
  // Check if we need to open a specific event
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  
  if (eventId) {
    openEvent(eventId);
  }
});

/**
 * Set up event listeners for the events page
 */
function setupEventListeners() {
  // Create Event button
  const createEventBtn = document.getElementById('create-event-btn');
  if (createEventBtn) {
    createEventBtn.addEventListener('click', () => {
      openCreateEventModal();
    });
  }
  
  // Get Started button (in empty state)
  const getStartedBtn = document.getElementById('get-started-btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      openCreateEventModal();
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
      
      // Load events for the selected view
      if (view === 'calendar') {
        loadCalendarView();
      } else {
        loadEvents(view);
      }
    });
  });
  
  // Event search
  const searchInput = document.getElementById('event-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      const searchTerm = searchInput.value.trim();
      const activeView = document.querySelector('.nav-link.active').dataset.view;
      
      if (searchTerm.length > 0) {
        searchEvents(searchTerm, activeView);
      } else {
        if (activeView === 'calendar') {
          loadCalendarView();
        } else {
          loadEvents(activeView);
        }
      }
    }, 300));
  }
  
  // Create Event form
  const createEventForm = document.getElementById('create-event-form');
  if (createEventForm) {
    createEventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createEvent();
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
 * Load events based on the selected view
 * @param {string} view - The view to load (upcoming, my-events, past-events)
 */
async function loadEvents(view) {
  const eventsList = document.getElementById('events-list');
  
  // Show loading spinner
  eventsList.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading events...
    </div>
  `;
  
  // Reset content area if no event is selected
  const eventsContent = document.getElementById('events-content');
  if (!eventsContent.querySelector('.event-header')) {
    eventsContent.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-alt"></i>
        <h3>Events</h3>
        <p>Select an event to view or create a new one</p>
        <button id="get-started-btn" class="primary-btn">Create Event</button>
      </div>
    `;
    
    // Add event listener to the new button
    document.getElementById('get-started-btn').addEventListener('click', () => {
      openCreateEventModal();
    });
  }
  
  try {
    // In a real app, we would fetch events from an API
    // For demo, we'll use mock data and simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock events data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const mockEvents = {
      'upcoming': [
        {
          id: '1',
          title: 'Tech Innovation Summit',
          date: tomorrow.toISOString(),
          time: '14:00',
          location: 'Downtown Convention Center',
          type: 'in-person',
          attendees: 78,
          rsvp: 'going'
        },
        {
          id: '2',
          title: 'Web3 Development Workshop',
          date: nextWeek.toISOString(),
          time: '10:00',
          location: 'Online',
          type: 'online',
          attendees: 156,
          rsvp: 'interested'
        },
        {
          id: '3',
          title: 'Sustainable Energy Meetup',
          date: '2023-09-25T18:30:00Z',
          time: '18:30',
          location: 'Green Energy Hub',
          type: 'in-person',
          attendees: 42,
          rsvp: null
        }
      ],
      'my-events': [
        {
          id: '1',
          title: 'Tech Innovation Summit',
          date: tomorrow.toISOString(),
          time: '14:00',
          location: 'Downtown Convention Center',
          type: 'in-person',
          attendees: 78,
          rsvp: 'going'
        },
        {
          id: '4',
          title: 'AI Ethics Discussion Group',
          date: '2023-09-28T17:00:00Z',
          time: '17:00',
          location: 'Community Center, Room 3B',
          type: 'in-person',
          attendees: 24,
          rsvp: 'going'
        }
      ],
      'past-events': [
        {
          id: '5',
          title: 'Blockchain Developer Meetup',
          date: lastWeek.toISOString(),
          time: '18:00',
          location: 'Tech Hub Café',
          type: 'in-person',
          attendees: 36,
          rsvp: 'going'
        },
        {
          id: '6',
          title: 'Remote Work Best Practices Webinar',
          date: '2023-09-05T15:00:00Z',
          time: '15:00',
          location: 'Online',
          type: 'online',
          attendees: 124,
          rsvp: 'going'
        }
      ]
    };
    
    // Get events for the selected view
    const events = mockEvents[view] || [];
    
    // Clear the list
    eventsList.innerHTML = '';
    
    // Show empty state if no events
    if (events.length === 0) {
      eventsList.innerHTML = `
        <div class="empty-list-message">
          <p>No events found.</p>
        </div>
      `;
      return;
    }
    
    // Render events
    events.forEach(event => {
      const eventElement = createEventElement(event);
      eventsList.appendChild(eventElement);
    });
  } catch (error) {
    console.error('Error loading events:', error);
    eventsList.innerHTML = `
      <div class="error-message">
        <p>Error loading events. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Create an event list item element
 * @param {Object} event - Event data
 * @returns {HTMLElement} - Event list item
 */
function createEventElement(event) {
  const eventElement = document.createElement('div');
  eventElement.className = 'event-item';
  eventElement.dataset.eventId = event.id;
  
  // Format date
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' });
  const day = eventDate.getDate();
  
  // Create status element
  let statusHtml = '';
  if (event.rsvp) {
    statusHtml = `<div class="event-status ${event.rsvp}">${event.rsvp}</div>`;
  }
  
  eventElement.innerHTML = `
    <div class="event-date">
      <div class="event-month">${month}</div>
      <div class="event-day">${day}</div>
    </div>
    <div class="event-info">
      <h3 class="event-title">${event.title}</h3>
      <div class="event-details">
        <div class="event-time">
          <i class="far fa-clock"></i> ${event.time}
        </div>
        <div class="event-location">
          <i class="fas fa-${event.type === 'online' ? 'video' : 'map-marker-alt'}"></i> ${event.location}
        </div>
        ${statusHtml}
      </div>
    </div>
  `;
  
  // Add click event to open event
  eventElement.addEventListener('click', () => {
    // Remove active class from all events
    document.querySelectorAll('.event-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to clicked event
    eventElement.classList.add('active');
    
    // Open the event
    openEvent(event.id);
  });
  
  return eventElement;
}

/**
 * Open an event
 * @param {string} eventId - Event ID to open
 */
async function openEvent(eventId) {
  const eventsContent = document.getElementById('events-content');
  
  // Show loading state
  eventsContent.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading event...
    </div>
  `;
  
  try {
    // In a real app, would fetch event data from API
    // For demo, using mock data and simulating network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock event data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const event = {
      id: eventId,
      title: 'Tech Innovation Summit',
      date: tomorrow.toISOString(),
      time: '14:00 - 18:00',
      location: 'Downtown Convention Center',
      address: '123 Main Street, Innovation District',
      description: 'Join us for our annual Tech Innovation Summit where industry leaders, entrepreneurs, and researchers come together to discuss the latest trends and breakthroughs in technology. This year\'s focus will be on sustainable tech solutions, AI ethics, and the future of remote collaboration tools.',
      type: 'in-person',
      community: {
        id: '1',
        name: 'Tech Innovators'
      },
      organizer: {
        id: 'u1',
        name: 'Jane Smith',
        role: 'Community Lead'
      },
      tags: ['Technology', 'Innovation', 'Networking'],
      rsvp: {
        going: 78,
        interested: 124,
        notGoing: 12,
        userResponse: 'going'
      },
      attendees: [
        { id: 'u1', name: 'Jane Smith', avatar: null },
        { id: 'u2', name: 'Alex Johnson', avatar: null },
        { id: 'u3', name: 'Michael Brown', avatar: null },
        { id: 'u4', name: 'Emily Davis', avatar: null },
        { id: 'u5', name: 'Sarah Wilson', avatar: null }
      ],
      comments: [
        { 
          id: 'c1', 
          user: { id: 'u2', name: 'Alex Johnson', avatar: null },
          text: 'Looking forward to the panel discussion on AI ethics!',
          timestamp: '2023-09-14T14:30:00Z'
        },
        { 
          id: 'c2', 
          user: { id: 'u4', name: 'Emily Davis', avatar: null },
          text: 'Will there be networking sessions after the main event?',
          timestamp: '2023-09-15T09:45:00Z'
        },
        { 
          id: 'c3', 
          user: { id: 'u1', name: 'Jane Smith', avatar: null },
          text: 'Yes, we\'ll have a networking reception from 6-8pm with refreshments!',
          timestamp: '2023-09-15T10:15:00Z'
        }
      ]
    };
    
    // Format date
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Render event details
    eventsContent.innerHTML = `
      <div class="event-header">
        <h1 class="event-header-title">${event.title}</h1>
        <div class="event-header-details">
          <div class="event-header-detail">
            <i class="far fa-calendar"></i> ${formattedDate}
          </div>
          <div class="event-header-detail">
            <i class="far fa-clock"></i> ${event.time}
          </div>
          <div class="event-header-detail">
            <i class="fas fa-${event.type === 'online' ? 'video' : 'map-marker-alt'}"></i> ${event.location}
          </div>
          <div class="event-header-detail">
            <i class="fas fa-users"></i> ${event.rsvp.going} attending
          </div>
          ${event.community ? `
            <div class="event-header-detail">
              <i class="fas fa-user-friends"></i> Hosted by ${event.community.name}
            </div>
          ` : ''}
        </div>
        
        <p class="event-description">${event.description}</p>
        
        <div class="event-tags">
          ${event.tags.map(tag => `<div class="event-tag">${tag}</div>`).join('')}
        </div>
        
        <div class="event-actions">
          ${renderRSVPButton(event.rsvp.userResponse)}
          <button class="event-action-btn secondary-btn" id="share-event-btn">
            <i class="fas fa-share-alt"></i> Share
          </button>
          <button class="event-action-btn neutral-btn" id="add-calendar-btn">
            <i class="far fa-calendar-plus"></i> Add to Calendar
          </button>
        </div>
      </div>
      
      <div class="event-body">
        <div class="event-section">
          <h3>Location</h3>
          <div class="event-location-map">
            <i class="fas fa-map-marker-alt"></i> Map view coming soon
          </div>
          <p>${event.address}</p>
        </div>
        
        <div class="event-section">
          <h3>Organizer</h3>
          <div class="event-organizer">
            ${renderAvatar(event.organizer, 'organizer-avatar')}
            <div class="organizer-info">
              <h4>${event.organizer.name}</h4>
              <div class="organizer-role">${event.organizer.role}</div>
            </div>
          </div>
        </div>
        
        <div class="event-section">
          <h3>Attendees (${event.rsvp.going})</h3>
          <div class="event-attendees">
            ${event.attendees.map(attendee => `
              <div class="attendee">
                ${renderAvatar(attendee, 'attendee-avatar')}
                <div class="attendee-name">${attendee.name}</div>
              </div>
            `).join('')}
            ${event.rsvp.going > event.attendees.length ? `
              <div class="more-attendees">
                +${event.rsvp.going - event.attendees.length}
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="event-section">
          <h3>Discussion</h3>
          <div class="event-discussion">
            <div class="comment-input">
              ${renderAvatar(getCurrentUser(), 'commenter-avatar')}
              <div class="comment-box">
                <textarea class="comment-textarea" placeholder="Write a comment..." rows="2"></textarea>
                <div class="comment-actions">
                  <button class="primary-btn" id="post-comment-btn">Post</button>
                </div>
              </div>
            </div>
            
            <div class="comment-list">
              ${event.comments.map(comment => `
                <div class="comment">
                  ${renderAvatar(comment.user, 'commenter-avatar')}
                  <div class="comment-content">
                    <div class="comment-header">
                      <div class="commenter-name">${comment.user.name}</div>
                      <div class="comment-time">${formatTimeAgo(new Date(comment.timestamp))}</div>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Set up event listeners for the event actions
    setupEventActions(event);
    
    // Set active event in the sidebar
    setActiveEvent(eventId);
  } catch (error) {
    console.error('Error opening event:', error);
    eventsContent.innerHTML = `
      <div class="error-message">
        <p>Error loading event. Please try again later.</p>
        <button class="primary-btn" onclick="window.location.reload()">Refresh</button>
      </div>
    `;
  }
}

/**
 * Render avatar for a user
 * @param {Object} user - User data
 * @param {string} className - CSS class for the avatar
 * @returns {string} - HTML for the avatar
 */
function renderAvatar(user, className) {
  if (user.avatar) {
    return `<div class="${className}"><img src="${user.avatar}" alt="${user.name}"></div>`;
  } else {
    const initials = user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    return `<div class="${className}">${initials}</div>`;
  }
}

/**
 * Render RSVP button based on user's response
 * @param {string|null} response - User's RSVP response
 * @returns {string} - HTML for the RSVP button
 */
function renderRSVPButton(response) {
  if (!response) {
    return `
      <button class="event-action-btn primary-btn" id="rsvp-btn">
        <i class="far fa-calendar-check"></i> RSVP
      </button>
    `;
  }
  
  let icon, text;
  switch (response) {
    case 'going':
      icon = 'fa-check-circle';
      text = 'Going';
      break;
    case 'interested':
      icon = 'fa-star';
      text = 'Interested';
      break;
    case 'not-going':
      icon = 'fa-times-circle';
      text = 'Not Going';
      break;
  }
  
  return `
    <button class="event-action-btn primary-btn" id="rsvp-btn">
      <i class="fas ${icon}"></i> ${text}
    </button>
  `;
}

/**
 * Set up event actions
 * @param {Object} event - Event data
 */
function setupEventActions(event) {
  // RSVP button
  const rsvpBtn = document.getElementById('rsvp-btn');
  if (rsvpBtn) {
    rsvpBtn.addEventListener('click', () => {
      openRSVPOptions(event);
    });
  }
  
  // Share button
  const shareBtn = document.getElementById('share-event-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      shareEvent(event);
    });
  }
  
  // Add to calendar button
  const calendarBtn = document.getElementById('add-calendar-btn');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      addToCalendar(event);
    });
  }
  
  // Post comment button
  const postCommentBtn = document.getElementById('post-comment-btn');
  if (postCommentBtn) {
    postCommentBtn.addEventListener('click', () => {
      postComment(event);
    });
  }
}

/**
 * Open RSVP options
 * @param {Object} event - Event data
 */
function openRSVPOptions(event) {
  // For demo, just toggle through options
  const rsvpBtn = document.getElementById('rsvp-btn');
  const currentResponse = rsvpBtn.querySelector('i').classList.contains('fa-check-circle') ? 'going' :
                          rsvpBtn.querySelector('i').classList.contains('fa-star') ? 'interested' :
                          rsvpBtn.querySelector('i').classList.contains('fa-times-circle') ? 'not-going' : null;
  
  let newResponse;
  switch (currentResponse) {
    case null:
      newResponse = 'going';
      break;
    case 'going':
      newResponse = 'interested';
      break;
    case 'interested':
      newResponse = 'not-going';
      break;
    case 'not-going':
      newResponse = 'going';
      break;
  }
  
  // Update the button
  rsvpBtn.innerHTML = renderRSVPButton(newResponse).match(/<button[^>]*>(.*?)<\/button>/)[1];
  
  // In a real app, we would send this to the server
  console.log(`RSVP status changed to: ${newResponse}`);
}

/**
 * Share an event
 * @param {Object} event - Event data
 */
function shareEvent(event) {
  const shareUrl = `${window.location.origin}/events.html?id=${event.id}`;
  
  // For demo, use a simple approach
  if (navigator.share) {
    navigator.share({
      title: event.title,
      text: `Check out this event: ${event.title}`,
      url: shareUrl
    }).catch(err => console.error('Error sharing:', err));
  } else {
    // Fallback
    prompt('Copy the link to share this event:', shareUrl);
  }
}

/**
 * Add event to calendar
 * @param {Object} event - Event data
 */
function addToCalendar(event) {
  alert('Calendar integration coming soon!');
}

/**
 * Post a comment on an event
 * @param {Object} event - Event data
 */
function postComment(event) {
  const commentTextarea = document.querySelector('.comment-textarea');
  const commentText = commentTextarea.value.trim();
  
  if (!commentText) return;
  
  // Get the comment list
  const commentList = document.querySelector('.comment-list');
  
  // Create a new comment element
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  
  const currentUser = getCurrentUser();
  
  // Get current timestamp
  const now = new Date();
  
  commentElement.innerHTML = `
    ${renderAvatar(currentUser, 'commenter-avatar')}
    <div class="comment-content">
      <div class="comment-header">
        <div class="commenter-name">${currentUser.name}</div>
        <div class="comment-time">just now</div>
      </div>
      <p class="comment-text">${commentText}</p>
    </div>
  `;
  
  // Add the new comment to the list
  commentList.appendChild(commentElement);
  
  // Clear the textarea
  commentTextarea.value = '';
  
  // In a real app, we would send this to the server
  console.log(`Posted comment: ${commentText}`);
}

/**
 * Get current user data
 * @returns {Object} - Current user data
 */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user_data')) || { 
    name: 'Current User',
    avatar: null
  };
}

/**
 * Set the active event in the sidebar
 * @param {string} eventId - Event ID to set as active
 */
function setActiveEvent(eventId) {
  // Remove active class from all event items
  document.querySelectorAll('.event-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to the selected event item
  const eventItem = document.querySelector(`.event-item[data-event-id="${eventId}"]`);
  if (eventItem) {
    eventItem.classList.add('active');
  }
}

/**
 * Load calendar view
 */
async function loadCalendarView() {
  const eventsContent = document.getElementById('events-content');
  
  // Show loading state
  eventsContent.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Loading calendar...
    </div>
  `;
  
  try {
    // In a real app, would fetch calendar data from API
    // For demo, using simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get the current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Render the calendar
    renderCalendar(currentMonth, currentYear, eventsContent);
    
    // Reset event list to show no selection
    document.querySelectorAll('.event-item').forEach(item => {
      item.classList.remove('active');
    });
  } catch (error) {
    console.error('Error loading calendar:', error);
    eventsContent.innerHTML = `
      <div class="error-message">
        <p>Error loading calendar. Please try again later.</p>
        <button class="primary-btn" onclick="window.location.reload()">Refresh</button>
      </div>
    `;
  }
}

/**
 * Render calendar view
 * @param {number} month - Month to render (0-11)
 * @param {number} year - Year to render
 * @param {HTMLElement} container - Container to render into
 */
function renderCalendar(month, year, container) {
  // Get the first day of the month
  const firstDay = new Date(year, month, 1).getDay();
  
  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get the number of days in the previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  // Get today's date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Month names for display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Mock events data for the calendar
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Format dates in a way that's easy to compare
  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  
  // Mock events (in real app, this would come from the server)
  const mockEvents = {
    [formatDateKey(tomorrow)]: [
      { id: '1', title: 'Tech Innovation Summit', type: 'community' },
      { id: '8', title: 'Team Standup', type: 'personal' }
    ],
    [formatDateKey(nextWeek)]: [
      { id: '2', title: 'Web3 Development Workshop', type: 'community' }
    ],
    [formatDateKey(new Date(year, month, 15))]: [
      { id: '3', title: 'Sustainable Energy Meetup', type: 'community' }
    ],
    [formatDateKey(new Date(year, month, 20))]: [
      { id: '4', title: 'AI Ethics Discussion Group', type: 'community' }
    ]
  };
  
  // Generate weekday names
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysHtml = weekdayNames.map(day => `<div class="weekday">${day}</div>`).join('');
  
  // Generate calendar days
  let daysHtml = '';
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateObj = new Date(year, month - 1, day);
    const dateKey = formatDateKey(dateObj);
    const events = mockEvents[dateKey] || [];
    
    daysHtml += `
      <div class="calendar-day other-month">
        <div class="day-number">${day}</div>
        <div class="day-events">
          ${events.map(event => `
            <div class="day-event ${event.type}" data-event-id="${event.id}">
              ${event.title}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === currentDay && month === currentMonth && year === currentYear;
    const dateObj = new Date(year, month, i);
    const dateKey = formatDateKey(dateObj);
    const events = mockEvents[dateKey] || [];
    
    daysHtml += `
      <div class="calendar-day ${isToday ? 'today' : ''}">
        <div class="day-number">${i}</div>
        <div class="day-events">
          ${events.map(event => `
            <div class="day-event ${event.type}" data-event-id="${event.id}">
              ${event.title}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Next month days (to fill the grid)
  const totalDaysDisplayed = firstDay + daysInMonth;
  const remainingDays = 42 - totalDaysDisplayed; // 6 rows x 7 days
  
  for (let i = 1; i <= remainingDays; i++) {
    const dateObj = new Date(year, month + 1, i);
    const dateKey = formatDateKey(dateObj);
    const events = mockEvents[dateKey] || [];
    
    daysHtml += `
      <div class="calendar-day other-month">
        <div class="day-number">${i}</div>
        <div class="day-events">
          ${events.map(event => `
            <div class="day-event ${event.type}" data-event-id="${event.id}">
              ${event.title}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  // Render the calendar
  container.innerHTML = `
    <div class="calendar-container">
      <div class="calendar-header">
        <h2 class="calendar-title">${monthNames[month]} ${year}</h2>
        <div class="calendar-navigation">
          <button class="calendar-nav-btn" id="prev-month-btn">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="today-btn" id="today-btn">Today</button>
          <button class="calendar-nav-btn" id="next-month-btn">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
      
      <div class="calendar-grid">
        <div class="calendar-weekdays">
          ${weekdaysHtml}
        </div>
        <div class="calendar-days">
          ${daysHtml}
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners to calendar navigation
  setupCalendarNavigation(month, year, container);
  
  // Add event listeners to day events
  setupDayEvents();
}

/**
 * Set up calendar navigation
 * @param {number} month - Current month
 * @param {number} year - Current year
 * @param {HTMLElement} container - Calendar container
 */
function setupCalendarNavigation(month, year, container) {
  // Previous month button
  const prevMonthBtn = document.getElementById('prev-month-btn');
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      let newMonth = month - 1;
      let newYear = year;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      
      renderCalendar(newMonth, newYear, container);
    });
  }
  
  // Next month button
  const nextMonthBtn = document.getElementById('next-month-btn');
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      let newMonth = month + 1;
      let newYear = year;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      renderCalendar(newMonth, newYear, container);
    });
  }
  
  // Today button
  const todayBtn = document.getElementById('today-btn');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      renderCalendar(today.getMonth(), today.getFullYear(), container);
    });
  }
}

/**
 * Set up day event click handlers
 */
function setupDayEvents() {
  document.querySelectorAll('.day-event').forEach(eventElement => {
    eventElement.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling to calendar day
      
      const eventId = eventElement.dataset.eventId;
      openEvent(eventId);
    });
  });
}

/**
 * Search events
 * @param {string} searchTerm - Search term
 * @param {string} view - Current view
 */
function searchEvents(searchTerm, view) {
  const eventsList = document.getElementById('events-list');
  
  // Show loading spinner
  eventsList.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i> Searching events...
    </div>
  `;
  
  // Simulate network delay
  setTimeout(() => {
    // Mock search results
    const searchResults = [
      {
        id: '1',
        title: 'Tech Innovation Summit',
        date: new Date(new Date().getTime() + 86400000).toISOString(),
        time: '14:00',
        location: 'Downtown Convention Center',
        type: 'in-person',
        attendees: 78,
        rsvp: 'going'
      }
    ].filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Clear the list
    eventsList.innerHTML = '';
    
    // Show empty state if no results
    if (searchResults.length === 0) {
      eventsList.innerHTML = `
        <div class="no-search-results">
          <p>No events found matching "${searchTerm}".</p>
        </div>
      `;
      return;
    }
    
    // Render search results
    searchResults.forEach(event => {
      const eventElement = createEventElement(event);
      eventsList.appendChild(eventElement);
    });
  }, 500);
}

/**
 * Open create event modal
 */
function openCreateEventModal() {
  const modal = document.getElementById('create-event-modal');
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('event-date').valueAsDate = tomorrow;
  
  // Set default RSVP deadline to tomorrow
  document.getElementById('event-rsvp').valueAsDate = tomorrow;
  
  // Display the modal
  modal.style.display = 'block';
}

/**
 * Create a new event
 */
function createEvent() {
  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const time = document.getElementById('event-time').value;
  const location = document.getElementById('event-location').value;
  const description = document.getElementById('event-description').value;
  const community = document.getElementById('event-community').value;
  const type = document.getElementById('event-type').value;
  const rsvpDeadline = document.getElementById('event-rsvp').value;
  
  // In a real app, we would send this data to the API
  console.log('Creating event:', { 
    title, date, time, location, description, community, type, rsvpDeadline
  });
  
  // For demo, show success and close modal
  alert(`Event "${title}" created successfully!`);
  
  // Close modal
  closeAllModals();
  
  // Reset form
  document.getElementById('create-event-form').reset();
  
  // Reload events to show the new event (in a real app, would add it to the DOM)
  loadEvents('upcoming');
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
