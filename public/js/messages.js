/**
 * Messages Page Script
 * Handles conversations, message sending, and real-time updates
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is authenticated
  const currentUser = await checkAuth();
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    window.location.replace('auth.html');
    return;
  }
  
  // Load contacts
  loadContacts();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check if we need to open a specific conversation
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');
  
  if (userId) {
    // This would be a contact ID in a real app
    openConversation(userId);
  }
});

/**
 * Load user contacts and conversations
 */
async function loadContacts() {
  const contactsList = document.getElementById('contacts-list');
  
  try {
    // In a real app, would fetch contacts from API
    // For demo, using mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock contacts data
    const mockContacts = [
      {
        id: '2',
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: null,
        online: true,
        lastMessage: 'Looking forward to our collaboration!',
        lastMessageTime: '2023-09-15T10:15:00Z',
        unreadCount: 2
      },
      {
        id: '3',
        name: 'Tech Innovators',
        username: 'techinnovate',
        avatar: null,
        online: false,
        lastMessage: 'We should meet to discuss the new project.',
        lastMessageTime: '2023-09-14T14:30:00Z',
        unreadCount: 0
      },
      {
        id: '4',
        name: 'Alex Johnson',
        username: 'alexj',
        avatar: null,
        online: true,
        lastMessage: 'Thanks for your help yesterday!',
        lastMessageTime: '2023-09-12T09:45:00Z',
        unreadCount: 0
      }
    ];
    
    // Clear loading indicator
    contactsList.innerHTML = '';
    
    // No contacts case
    if (mockContacts.length === 0) {
      contactsList.innerHTML = `
        <div class="no-contacts-message">
          <p>No conversations yet. Start a new one!</p>
        </div>
      `;
      return;
    }
    
    // Sort contacts by last message time (newest first)
    mockContacts.sort((a, b) => {
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    
    // Create contact elements
    mockContacts.forEach(contact => {
      const contactElement = createContactElement(contact);
      contactsList.appendChild(contactElement);
    });
  } catch (error) {
    console.error('Error loading contacts:', error);
    contactsList.innerHTML = `
      <div class="error-message">
        <p>Error loading contacts. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Create a contact list item element
 * @param {Object} contact - Contact data
 * @returns {HTMLElement} - Contact list item
 */
function createContactElement(contact) {
  const contactElement = document.createElement('div');
  contactElement.className = 'contact-item';
  contactElement.dataset.contactId = contact.id;
  
  // Format last message time
  const messageDate = new Date(contact.lastMessageTime);
  const timeDisplay = formatMessageTime(messageDate);
  
  // Generate avatar
  let avatarContent = '';
  if (contact.avatar) {
    avatarContent = `<img src="${contact.avatar}" alt="${contact.name}">`;
  } else {
    const initials = contact.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    avatarContent = initials;
  }
  
  contactElement.innerHTML = `
    <div class="contact-avatar">
      ${avatarContent}
      <div class="status-indicator ${contact.online ? 'online' : 'offline'}"></div>
    </div>
    <div class="contact-info">
      <h3 class="contact-name">${contact.name}</h3>
      <p class="contact-preview">${contact.lastMessage}</p>
    </div>
    <div class="contact-meta">
      <div class="contact-time">${timeDisplay}</div>
      ${contact.unreadCount > 0 ? `<div class="contact-badge">${contact.unreadCount}</div>` : ''}
    </div>
  `;
  
  // Add click event to open conversation
  contactElement.addEventListener('click', () => {
    // Remove active class from all contacts
    document.querySelectorAll('.contact-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to clicked contact
    contactElement.classList.add('active');
    
    // Open the conversation
    openConversation(contact.id);
    
    // Clear unread messages badge
    const badge = contactElement.querySelector('.contact-badge');
    if (badge) {
      badge.remove();
    }
  });
  
  return contactElement;
}

/**
 * Format message time for display
 * @param {Date} date - Message date
 * @returns {string} - Formatted time string
 */
function formatMessageTime(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000; // 24 hours in milliseconds
  
  // Check if the message is from today
  if (date.getTime() >= today) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Check if the message is from yesterday
  if (date.getTime() >= yesterday) {
    return 'Yesterday';
  }
  
  // Check if the message is from this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise, show the full date
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Open a conversation
 * @param {string} contactId - Contact ID to open conversation with
 */
async function openConversation(contactId) {
  const messagesArea = document.getElementById('messages-area');
  
  try {
    // In a real app, would fetch contact and messages from API
    // For demo, using mock data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the contact from our mock data
    const mockContacts = [
      {
        id: '2',
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: null,
        online: true,
        lastSeen: '2023-09-15T11:20:00Z'
      },
      {
        id: '3',
        name: 'Tech Innovators',
        username: 'techinnovate',
        avatar: null,
        online: false,
        lastSeen: '2023-09-14T16:45:00Z'
      },
      {
        id: '4',
        name: 'Alex Johnson',
        username: 'alexj',
        avatar: null,
        online: true,
        lastSeen: '2023-09-15T10:30:00Z'
      }
    ];
    
    const contact = mockContacts.find(c => c.id === contactId);
    
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    // Mock conversation messages
    const mockMessages = [
      {
        id: 1,
        senderId: contactId,
        content: 'Hey there! How\'s your project coming along?',
        timestamp: '2023-09-14T09:30:00Z'
      },
      {
        id: 2,
        senderId: '1', // Current user
        content: 'It\'s going well! I\'m working on the new features we discussed.',
        timestamp: '2023-09-14T09:35:00Z'
      },
      {
        id: 3,
        senderId: contactId,
        content: 'That sounds great! Would you like to meet up and discuss the progress?',
        timestamp: '2023-09-14T09:40:00Z'
      },
      {
        id: 4,
        senderId: '1', // Current user
        content: 'Sure, that would be helpful. When were you thinking?',
        timestamp: '2023-09-14T09:45:00Z'
      },
      {
        id: 5,
        senderId: contactId,
        content: 'How about tomorrow afternoon? Around 2 PM?',
        timestamp: '2023-09-14T09:50:00Z'
      },
      {
        id: 6,
        senderId: '1', // Current user
        content: 'Sounds good! Let\'s meet at the usual place.',
        timestamp: '2023-09-14T09:55:00Z'
      },
      {
        id: 7,
        senderId: contactId,
        content: 'Perfect! Looking forward to our collaboration!',
        timestamp: '2023-09-15T10:15:00Z'
      }
    ];
    
    // Generate avatar initials
    let avatarContent = '';
    if (contact.avatar) {
      avatarContent = `<img src="${contact.avatar}" alt="${contact.name}">`;
    } else {
      const initials = contact.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      avatarContent = initials;
    }
    
    // Format last seen time
    let statusText = '';
    if (contact.online) {
      statusText = 'Online';
    } else {
      const lastSeenDate = new Date(contact.lastSeen);
      const timeAgo = formatTimeAgo(lastSeenDate);
      statusText = `Last seen ${timeAgo}`;
    }
    
    // Create conversation UI
    messagesArea.innerHTML = `
      <div class="conversation-header">
        <div class="contact-avatar">
          ${avatarContent}
          <div class="status-indicator ${contact.online ? 'online' : 'offline'}"></div>
        </div>
        <div class="conversation-info">
          <h3 class="conversation-name">${contact.name}</h3>
          <p class="conversation-status">${statusText}</p>
        </div>
        <div class="conversation-actions">
          <button class="action-btn" title="Video Call">
            <i class="fas fa-video"></i>
          </button>
          <button class="action-btn" title="Voice Call">
            <i class="fas fa-phone"></i>
          </button>
          <button class="action-btn" title="More Options">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
      <div class="messages-container" id="messages-container">
        <!-- Messages will be inserted here -->
      </div>
      <div class="message-composer">
        <div class="composer-attachments">
          <button class="attachment-btn" title="Attach File">
            <i class="fas fa-paperclip"></i>
          </button>
          <button class="attachment-btn" title="Add Emoji">
            <i class="far fa-smile"></i>
          </button>
        </div>
        <div class="message-input-container">
          <textarea class="message-input" id="message-input" placeholder="Type a message..." rows="1"></textarea>
        </div>
        <button class="send-button" id="send-message-btn" disabled>
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;
    
    // Load messages
    const messagesContainer = document.getElementById('messages-container');
    if (mockMessages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="no-messages">
          <p>No messages yet. Start a conversation!</p>
        </div>
      `;
    } else {
      // Group messages by date
      const groupedMessages = groupMessagesByDate(mockMessages);
      
      // Render messages
      messagesContainer.innerHTML = '';
      groupedMessages.forEach(group => {
        // Add date separator
        if (group.date) {
          const dateElement = document.createElement('div');
          dateElement.className = 'date-separator';
          dateElement.textContent = group.date;
          messagesContainer.appendChild(dateElement);
        }
        
        // Add messages
        group.messages.forEach(message => {
          const messageElement = createMessageElement(message, contact);
          messagesContainer.appendChild(messageElement);
        });
      });
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Add event listeners for message input and send button
    setupMessageInputListeners();
    
  } catch (error) {
    console.error('Error opening conversation:', error);
    messagesArea.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Error Loading Conversation</h3>
        <p>There was a problem loading this conversation. Please try again later.</p>
        <button class="primary-btn" onclick="loadContacts()">Go Back</button>
      </div>
    `;
  }
}

/**
 * Group messages by date for display
 * @param {Array} messages - Messages to group
 * @returns {Array} - Grouped messages
 */
function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;
  
  messages.forEach(message => {
    const messageDate = new Date(message.timestamp);
    const dateString = formatDateForGrouping(messageDate);
    
    if (dateString !== currentDate) {
      currentDate = dateString;
      currentGroup = { date: dateString, messages: [] };
      groups.push(currentGroup);
    }
    
    currentGroup.messages.push(message);
  });
  
  return groups;
}

/**
 * Format date for message grouping
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDateForGrouping(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Format options
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  
  // Check if the date is today
  if (date.getFullYear() === today.getFullYear() && 
      date.getMonth() === today.getMonth() && 
      date.getDate() === today.getDate()) {
    return 'Today';
  }
  
  // Check if the date is yesterday
  if (date.getFullYear() === yesterday.getFullYear() && 
      date.getMonth() === yesterday.getMonth() && 
      date.getDate() === yesterday.getDate()) {
    return 'Yesterday';
  }
  
  // Otherwise, return the formatted date
  return date.toLocaleDateString(undefined, options);
}

/**
 * Create a message element
 * @param {Object} message - Message data
 * @param {Object} contact - Contact data
 * @returns {HTMLElement} - Message element
 */
function createMessageElement(message, contact) {
  const messageElement = document.createElement('div');
  const currentUser = JSON.parse(localStorage.getItem('user_data'));
  const isSent = message.senderId === currentUser.id;
  
  messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
  
  // Format message time
  const messageDate = new Date(message.timestamp);
  const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Generate avatar initials (for received messages)
  let avatarContent = '';
  if (!isSent) {
    if (contact.avatar) {
      avatarContent = `<img src="${contact.avatar}" alt="${contact.name}">`;
    } else {
      const initials = contact.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      avatarContent = initials;
    }
  }
  
  messageElement.innerHTML = `
    ${!isSent ? `<div class="message-avatar">${avatarContent}</div>` : ''}
    <div class="message-bubble">
      <p class="message-text">${message.content}</p>
      <span class="message-time">${timeString}</span>
      <div class="message-actions">
        <button class="message-action-btn" title="Reply">
          <i class="fas fa-reply"></i>
        </button>
        <button class="message-action-btn" title="Forward">
          <i class="fas fa-share"></i>
        </button>
        <button class="message-action-btn" title="More">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </div>
    ${isSent ? `<div class="message-avatar">${currentUser.name.charAt(0)}</div>` : ''}
  `;
  
  // Add event listeners for message actions
  const actionButtons = messageElement.querySelectorAll('.message-action-btn');
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = button.getAttribute('title').toLowerCase();
      handleMessageAction(action, message);
    });
  });
  
  return messageElement;
}

/**
 * Handle message action (reply, forward, etc.)
 * @param {string} action - Action to perform
 * @param {Object} message - Message data
 */
function handleMessageAction(action, message) {
  switch (action) {
    case 'reply':
      const messageInput = document.getElementById('message-input');
      messageInput.value = `Replying to: "${message.content.substring(0, 30)}..." \n\n`;
      messageInput.focus();
      break;
    case 'forward':
      alert('Forward feature will be implemented soon');
      break;
    case 'more':
      const options = ['Copy', 'Edit', 'Delete'];
      const selectedOption = prompt(`Choose an action:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
      
      if (selectedOption && options[parseInt(selectedOption) - 1]) {
        const option = options[parseInt(selectedOption) - 1];
        
        switch (option) {
          case 'Copy':
            navigator.clipboard.writeText(message.content)
              .then(() => alert('Message copied to clipboard'))
              .catch(err => console.error('Error copying text:', err));
            break;
          case 'Edit':
            // Only allow editing of own messages
            if (message.senderId === JSON.parse(localStorage.getItem('user_data')).id) {
              const newText = prompt('Edit message:', message.content);
              if (newText && newText !== message.content) {
                alert('Message updated');
                // In a real app, we would update the message on the server
              }
            } else {
              alert("You can only edit your own messages");
            }
            break;
          case 'Delete':
            if (confirm('Are you sure you want to delete this message?')) {
              alert('Message deleted');
              // In a real app, we would delete the message from the server
            }
            break;
        }
      }
      break;
  }
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
 * Set up event listeners for message input
 */
function setupMessageInputListeners() {
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-message-btn');
  
  // Enable/disable send button based on input
  messageInput.addEventListener('input', () => {
    sendButton.disabled = !messageInput.value.trim();
    
    // Auto-resize textarea
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
  });
  
  // Handle enter key (send message)
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendButton.disabled) {
        sendMessage();
      }
    }
  });
  
  // Send button click
  sendButton.addEventListener('click', () => {
    sendMessage();
  });
}

/**
 * Send message
 */
function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages-container');
  const text = messageInput.value.trim();
  
  if (!text) return;
  
  // In a real app, we would send the message to the server
  console.log('Sending message:', text);
  
  // Create message element
  const currentUser = JSON.parse(localStorage.getItem('user_data'));
  const now = new Date();
  
  const messageData = {
    id: Date.now(),
    senderId: currentUser.id,
    content: text,
    timestamp: now.toISOString()
  };
  
  // Get active contact
  const activeContact = document.querySelector('.contact-item.active');
  let contactData = null;
  
  if (activeContact) {
    const contactId = activeContact.dataset.contactId;
    // In a real app, we would get the contact data from the server
    // For demo, we'll create mock data
    contactData = {
      id: contactId,
      name: activeContact.querySelector('.contact-name').textContent,
      avatar: null
    };
  }
  
  const messageElement = createMessageElement(messageData, contactData || { name: 'Unknown' });
  messagesContainer.appendChild(messageElement);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';
  
  // Disable send button
  document.getElementById('send-message-btn').disabled = true;
  
  // Update contact list (in a real app)
  updateContactWithNewMessage(contactData.id, text);
}

/**
 * Update contact in list with new message
 * @param {string} contactId - Contact ID
 * @param {string} message - Message text
 */
function updateContactWithNewMessage(contactId, message) {
  const contactItem = document.querySelector(`.contact-item[data-contact-id="${contactId}"]`);
  
  if (contactItem) {
    // Update the message preview
    const previewElement = contactItem.querySelector('.contact-preview');
    previewElement.textContent = message;
    
    // Update the time
    const timeElement = contactItem.querySelector('.contact-time');
    timeElement.textContent = 'Just now';
    
    // Move the contact to the top (in a real app)
    const contactsList = document.getElementById('contacts-list');
    contactsList.insertBefore(contactItem, contactsList.firstChild);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // New message button
  const newMessageBtn = document.getElementById('new-message-btn');
  const newMessageModal = document.getElementById('new-message-modal');
  
  if (newMessageBtn && newMessageModal) {
    newMessageBtn.addEventListener('click', () => {
      openNewMessageModal();
    });
  }
  
  // Start conversation button in empty state
  const startConversationBtn = document.getElementById('start-conversation-btn');
  if (startConversationBtn) {
    startConversationBtn.addEventListener('click', () => {
      openNewMessageModal();
    });
  }
  
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
 * Open new message modal
 */
function openNewMessageModal() {
  const modal = document.getElementById('new-message-modal');
  modal.style.display = 'block';
  
  // Clear previous state
  document.getElementById('recipient-search').value = '';
  document.getElementById('recipient-results').style.display = 'none';
  document.getElementById('selected-recipients').innerHTML = '';
  document.getElementById('message-text').value = '';
  document.getElementById('send-message-btn').disabled = true;
  
  // Focus search input
  setTimeout(() => {
    document.getElementById('recipient-search').focus();
  }, 100);
  
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
  
  // Set up recipient search
  setupRecipientSearch();
}

/**
 * Set up recipient search
 */
function setupRecipientSearch() {
  const searchInput = document.getElementById('recipient-search');
  const resultsContainer = document.getElementById('recipient-results');
  const selectedContainer = document.getElementById('selected-recipients');
  const sendButton = document.getElementById('send-message-btn');
  
  // Handle input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
      resultsContainer.style.display = 'none';
      return;
    }
    
    // In a real app, we would search the API
    // For demo, we'll use mock data
    const mockResults = [
      {
        id: '2',
        name: 'Jane Smith',
        username: 'janesmith',
        avatar: null
      },
      {
        id: '3',
        name: 'Tech Innovators',
        username: 'techinnovate',
        avatar: null
      },
      {
        id: '4',
        name: 'Alex Johnson',
        username: 'alexj',
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
      if (document.querySelector(`.selected-recipient[data-id="${user.id}"]`)) {
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
      resultItem.className = 'recipient-item';
      resultItem.dataset.id = user.id;
      resultItem.dataset.name = user.name;
      resultItem.innerHTML = `
        <div class="recipient-avatar">${avatarContent}</div>
        <div class="recipient-name">${user.name}</div>
      `;
      
      resultItem.addEventListener('click', () => {
        // Add to selected recipients
        const selectedItem = document.createElement('div');
        selectedItem.className = 'selected-recipient';
        selectedItem.dataset.id = user.id;
        selectedItem.innerHTML = `
          <span class="selected-recipient-name">${user.name}</span>
          <button class="remove-recipient">
            <i class="fas fa-times"></i>
          </button>
        `;
        
        // Add remove button handler
        selectedItem.querySelector('.remove-recipient').addEventListener('click', () => {
          selectedItem.remove();
          sendButton.disabled = selectedContainer.children.length === 0 || !document.getElementById('message-text').value.trim();
        });
        
        selectedContainer.appendChild(selectedItem);
        
        // Clear search
        searchInput.value = '';
        resultsContainer.style.display = 'none';
        
        // Enable send button if message is not empty
        sendButton.disabled = !document.getElementById('message-text').value.trim();
      });
      
      resultsContainer.appendChild(resultItem);
    });
  });
  
  // Message text input
  const messageTextInput = document.getElementById('message-text');
  messageTextInput.addEventListener('input', () => {
    sendButton.disabled = selectedContainer.children.length === 0 || !messageTextInput.value.trim();
  });
  
  // Send button
  sendButton.addEventListener('click', () => {
    const recipients = Array.from(selectedContainer.children).map(child => ({
      id: child.dataset.id,
      name: child.querySelector('.selected-recipient-name').textContent
    }));
    
    const messageText = messageTextInput.value.trim();
    
    // In a real app, we would send the message to the server
    console.log('Sending new message:', { recipients, messageText });
    
    // For demo, open the conversation with the first recipient
    if (recipients.length > 0) {
      const firstRecipient = recipients[0];
      
      // Close the modal
      document.getElementById('new-message-modal').style.display = 'none';
      
      // Open the conversation
      openConversation(firstRecipient.id);
      
      // Find or create contact item
      let contactItem = document.querySelector(`.contact-item[data-contact-id="${firstRecipient.id}"]`);
      
      if (!contactItem) {
        // Create new contact item
        const contactElement = createContactElement({
          id: firstRecipient.id,
          name: firstRecipient.name,
          username: '',
          avatar: null,
          online: false,
          lastMessage: messageText,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        });
        
        // Add to contacts list
        const contactsList = document.getElementById('contacts-list');
        contactsList.insertBefore(contactElement, contactsList.firstChild);
        
        // Simulate click to open conversation
        contactElement.click();
      } else {
        // Update existing contact
        contactItem.querySelector('.contact-preview').textContent = messageText;
        contactItem.querySelector('.contact-time').textContent = 'Just now';
        
        // Move to top
        const contactsList = document.getElementById('contacts-list');
        contactsList.insertBefore(contactItem, contactsList.firstChild);
        
        // Simulate click to open conversation
        contactItem.click();
      }
    }
  });
}