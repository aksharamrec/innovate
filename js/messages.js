/**
 * JavaScript for the Messages page functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the messaging interface
    initializeMessaging();
    
    // Setup event listeners
    setupMessageEvents();
});

/**
 * Initialize the messaging interface
 */
async function initializeMessaging() {
    // Load conversations
    await loadConversations();
    
    // Check if a specific conversation is requested via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
        // Open conversation with this user
        openConversation(userId);
    } else if (document.querySelector('.conversation-item')) {
        // Open first conversation by default if available
        document.querySelector('.conversation-item').click();
    }
}

/**
 * Load all conversations for the current user
 */
async function loadConversations() {
    try {
        const conversationsContainer = document.getElementById('conversationsList');
        
        // Show loading indicator
        conversationsContainer.innerHTML = '<div class="loading-spinner">Loading conversations...</div>';
        
        // In a real app, this would be an API call
        const conversations = await simulateGetConversations();
        
        // Clear loading indicator
        conversationsContainer.innerHTML = '';
        
        if (conversations.length === 0) {
            conversationsContainer.innerHTML = `
                <div class="no-conversations">
                    <p>No conversations yet</p>
                    <button class="btn btn-primary btn-sm" id="startNewConversation">Start a New Conversation</button>
                </div>
            `;
            return;
        }
        
        // Render each conversation
        conversations.forEach(conversation => {
            const conversationElement = createConversationElement(conversation);
            conversationsContainer.appendChild(conversationElement);
        });
    } catch (error) {
        console.error('Error loading conversations:', error);
        showToast('Failed to load conversations. Please try again.', 'error');
    }
}

/**
 * Create a DOM element for a conversation
 */
function createConversationElement(conversation) {
    const element = document.createElement('div');
    element.className = 'conversation-item';
    element.dataset.conversationId = conversation.id;
    element.dataset.userId = conversation.user.id;
    
    // Check if there's unread messages
    const unreadClass = conversation.unreadCount > 0 ? 'unread' : '';
    
    element.innerHTML = `
        <img src="${conversation.user.avatar}" alt="${conversation.user.username}" class="conversation-avatar">
        <div class="conversation-info ${unreadClass}">
            <h4>${conversation.user.username}</h4>
            <p>${conversation.lastMessage.text}</p>
        </div>
        <div class="conversation-meta">
            <span class="conversation-time">${formatRelativeTime(conversation.lastMessage.timestamp)}</span>
            ${conversation.unreadCount > 0 ? `<span class="unread-badge">${conversation.unreadCount}</span>` : ''}
        </div>
    `;
    
    return element;
}

/**
 * Setup message-related event listeners
 */
function setupMessageEvents() {
    const conversationsList = document.getElementById('conversationsList');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    
    // Conversation selection
    conversationsList.addEventListener('click', (e) => {
        const conversationItem = e.target.closest('.conversation-item');
        if (conversationItem) {
            const userId = conversationItem.dataset.userId;
            const conversationId = conversationItem.dataset.conversationId;
            
            // Mark all conversation items as inactive
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Mark this conversation as active
            conversationItem.classList.add('active');
            
            // Load messages for this conversation
            loadMessages(conversationId, userId);
            
            // Mark as read
            if (conversationItem.querySelector('.unread-badge')) {
                conversationItem.querySelector('.conversation-info').classList.remove('unread');
                conversationItem.querySelector('.unread-badge').remove();
            }
        }
    });
    
    // Message submission
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        const activeConversation = document.querySelector('.conversation-item.active');
        if (!activeConversation) return;
        
        const conversationId = activeConversation.dataset.conversationId;
        const userId = activeConversation.dataset.userId;
        
        try {
            // Clear input
            messageInput.value = '';
            
            // Add message to UI immediately (optimistic UI)
            addMessageToUI({
                text: message,
                timestamp: new Date().toISOString(),
                isOutgoing: true
            });
            
            // In a real app, this would be an API call
            await simulateSendMessage(conversationId, message);
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Failed to send message. Please try again.', 'error');
        }
    });
    
    // New conversation button
    const newConversationBtn = document.getElementById('startNewConversation');
    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', () => {
            // Show a modal to select users
            showNewConversationModal();
        });
    }
    
    // Attachment button
    const attachmentBtn = document.getElementById('attachmentButton');
    if (attachmentBtn) {
        attachmentBtn.addEventListener('click', () => {
            document.getElementById('fileUpload').click();
        });
    }
    
    // File upload change
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
}

/**
 * Load messages for a specific conversation
 */
async function loadMessages(conversationId, userId) {
    const messagesContainer = document.getElementById('messagesContainer');
    const conversationHeader = document.getElementById('conversationHeader');
    
    // Show loading indicator
    messagesContainer.innerHTML = '<div class="loading-spinner">Loading messages...</div>';
    
    try {
        // Update header
        const user = await simulateGetUserDetails(userId);
        conversationHeader.innerHTML = `
            <div class="conversation-user">
                <img src="${user.avatar}" alt="${user.username}" class="conversation-avatar">
                <div class="conversation-user-details">
                    <h3>${user.username}</h3>
                    <span class="user-status ${user.isOnline ? 'online' : ''}">
                        ${user.isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>
            <div class="conversation-actions">
                <button class="btn-icon"><i class="fas fa-phone"></i></button>
                <button class="btn-icon"><i class="fas fa-video"></i></button>
                <button class="btn-icon"><i class="fas fa-info-circle"></i></button>
            </div>
        `;
        
        // In a real app, this would be an API call
        const messages = await simulateGetMessages(conversationId);
        
        // Clear loading indicator
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <p>No messages yet. Send a message to start the conversation!</p>
                </div>
            `;
            return;
        }
        
        // Group messages by date
        const groupedMessages = groupMessagesByDate(messages);
        
        // Render messages
        groupedMessages.forEach(group => {
            // Add date separator
            const dateElement = document.createElement('div');
            dateElement.className = 'message-date-separator';
            dateElement.textContent = group.date;
            messagesContainer.appendChild(dateElement);
            
            // Add messages
            group.messages.forEach(message => {
                const messageElement = createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Make message input available
        document.getElementById('messageActions').style.display = 'flex';
    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('Failed to load messages. Please try again.', 'error');
    }
}

/**
 * Create a DOM element for a message
 */
function createMessageElement(message) {
    const element = document.createElement('div');
    element.className = `message ${message.isOutgoing ? 'outgoing' : 'incoming'}`;
    
    const bubbleClass = message.isOutgoing ? 'outgoing-bubble' : 'incoming-bubble';
    
    // Check if message has attachment
    let attachmentHTML = '';
    if (message.attachment) {
        if (message.attachment.type.startsWith('image/')) {
            attachmentHTML = `
                <div class="message-attachment">
                    <img src="${message.attachment.url}" alt="Image attachment" class="attachment-image">
                </div>
            `;
        } else if (message.attachment.type.startsWith('video/')) {
            attachmentHTML = `
                <div class="message-attachment">
                    <video controls class="attachment-video">
                        <source src="${message.attachment.url}" type="${message.attachment.type}">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        } else {
            attachmentHTML = `
                <div class="message-attachment file-attachment">
                    <i class="fas fa-file"></i>
                    <a href="${message.attachment.url}" target="_blank" download>${message.attachment.name}</a>
                </div>
            `;
        }
    }
    
    element.innerHTML = `
        <div class="message-bubble ${bubbleClass}">
            ${attachmentHTML}
            ${message.text ? `<p>${message.text}</p>` : ''}
            <span class="message-time">${formatMessageTime(message.timestamp)}</span>
        </div>
    `;
    
    return element;
}

/**
 * Add a new message to the UI
 */
function addMessageToUI(message) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageElement = createMessageElement(message);
    
    // Add the message
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Group messages by date
 */
function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    
    messages.forEach(message => {
        const messageDate = new Date(message.timestamp);
        const dateString = formatMessageDate(messageDate);
        
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
 * Format a date for message grouping
 */
function formatMessageDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
}

/**
 * Format a timestamp for message bubbles
 */
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Handle file uploads
 */
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const activeConversation = document.querySelector('.conversation-item.active');
    if (!activeConversation) {
        showToast('Please select a conversation first', 'error');
        return;
    }
    
    const conversationId = activeConversation.dataset.conversationId;
    
    // Show preview and send
    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            // Add message with attachment to UI
            addMessageToUI({
                text: '',
                timestamp: new Date().toISOString(),
                isOutgoing: true,
                attachment: {
                    type: file.type,
                    name: file.name,
                    url: event.target.result
                }
            });
            
            // In a real app, this would upload the file to server
            await simulateSendAttachment(conversationId, file);
        } catch (error) {
            console.error('Error sending attachment:', error);
            showToast('Failed to send attachment. Please try again.', 'error');
        }
    };
    
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
}

/**
 * Show modal to start a new conversation
 */
function showNewConversationModal() {
    createModal('Start a New Conversation', `
        <div class="new-conversation-modal">
            <div class="search-users">
                <div class="input-with-icon">
                    <i class="fas fa-search"></i>
                    <input type="text" id="userSearchInput" placeholder="Search users...">
                </div>
            </div>
            <div class="users-list" id="usersList">
                <div class="loading-spinner">Loading users...</div>
            </div>
        </div>
    `);
    
    // Load users
    loadAvailableUsers();
    
    // Setup search functionality
    const searchInput = document.getElementById('userSearchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const userElements = document.querySelectorAll('.user-item');
        
        userElements.forEach(element => {
            const username = element.querySelector('h4').textContent.toLowerCase();
            if (username.includes(searchTerm)) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    });
}

/**
 * Load available users for new conversations
 */
async function loadAvailableUsers() {
    const usersList = document.getElementById('usersList');
    
    try {
        // In a real app, this would be an API call
        const users = await simulateGetAvailableUsers();
        
        // Clear loading spinner
        usersList.innerHTML = '';
        
        if (users.length === 0) {
            usersList.innerHTML = '<p class="no-users">No users found</p>';
            return;
        }
        
        // Add users
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.dataset.userId = user.id;
            
            userElement.innerHTML = `
                <img src="${user.avatar}" alt="${user.username}" class="user-avatar">
                <div class="user-details">
                    <h4>${user.username}</h4>
                    <p>${user.bio || 'No bio available'}</p>
                </div>
                <button class="btn btn-outline btn-sm start-chat-btn">Chat</button>
            `;
            
            usersList.appendChild(userElement);
            
            // Add click event for chat button
            userElement.querySelector('.start-chat-btn').addEventListener('click', () => {
                openConversation(user.id);
                document.querySelector('.modal').classList.remove('active');
            });
        });
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<p class="error-message">Failed to load users. Please try again.</p>';
    }
}

/**
 * Open a conversation with a specific user
 */
async function openConversation(userId) {
    try {
        // In a real app, this would be an API call to get or create a conversation
        const conversation = await simulateGetOrCreateConversation(userId);
        
        // Check if conversation already exists in the list
        let conversationElement = document.querySelector(`.conversation-item[data-conversation-id="${conversation.id}"]`);
        
        if (!conversationElement) {
            // Add conversation to list
            conversationElement = createConversationElement(conversation);
            const conversationsList = document.getElementById('conversationsList');
            
            // Remove "no conversations" message if present
            const noConversations = conversationsList.querySelector('.no-conversations');
            if (noConversations) {
                conversationsList.removeChild(noConversations);
            }
            
            conversationsList.insertBefore(conversationElement, conversationsList.firstChild);
        }
        
        // Select the conversation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        conversationElement.classList.add('active');
        
        // Load messages
        loadMessages(conversation.id, userId);
    } catch (error) {
        console.error('Error opening conversation:', error);
        showToast('Failed to open conversation. Please try again.', 'error');
    }
}

// Simulation functions for testing
async function simulateGetConversations() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    user: {
                        id: '2',
                        username: 'Sarah Johnson',
                        avatar: 'assets/images/avatars/user1.png'
                    },
                    lastMessage: {
                        text: 'I loved your design concept! When can we discuss it further?',
                        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
                    },
                    unreadCount: 2
                },
                {
                    id: '2',
                    user: {
                        id: '3',
                        username: 'Michael Chen',
                        avatar: 'assets/images/avatars/user2.png'
                    },
                    lastMessage: {
                        text: 'The project deadline has been extended to next Friday',
                        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
                    },
                    unreadCount: 0
                },
                {
                    id: '3',
                    user: {
                        id: '4',
                        username: 'Alex Rivera',
                        avatar: 'assets/images/avatars/user3.png'
                    },
                    lastMessage: {
                        text: 'Are you available for a quick call tomorrow?',
                        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    unreadCount: 0
                }
            ]);
        }, 800);
    });
}

async function simulateGetMessages(conversationId) {
    return new Promise(resolve => {
        setTimeout(() => {
            switch(conversationId) {
                case '1':
                    resolve([
                        {
                            id: '101',
                            text: 'Hi Sarah! I just saw your portfolio and I'm really impressed with your work.',
                            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                            isOutgoing: true
                        },
                        {
                            id: '102',
                            text: 'Thank you so much! I've been working hard on refining my design process.',
                            timestamp: new Date(Date.now() - 35.8 * 60 * 60 * 1000).toISOString(),
                            isOutgoing: false
                        },
                        {
                            id: '103',
                            text: 'I especially liked your approach to the healthcare app redesign.',
                            timestamp: new Date(Date.now() - 35.5 * 60 * 60 * 1000).toISOString(),
                            isOutgoing: true
                        },
                        {
                            id: '104',
                            text: 'I have a similar project I'm working on. Would you be interested in collaborating?',
                            timestamp: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString(),
                            isOutgoing: true
                        },
                        {
                            id: '105',
                            text: 'That sounds interesting! I'd love to hear more about it.',
                            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                            isOutgoing: false
                        },
                        {
                            id: '106',
                            text: 'Here's a quick mockup I created for the project',
                            timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(),
                            isOutgoing: false,
                            attachment: {
                                type: 'image/png',
                                name: 'mockup.png',
                                url: 'assets/images/posts/design-mockup.jpg'
                            }
                        },
                        {
                            id: '107',
                            text: 'I loved your design concept! When can we discuss it further?',
                            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                            isOutgoing: false
                        }
                    ]);
                    break;
                default:
                    resolve([]);
            }
        }, 800);
    });
}

async function simulateGetUserDetails(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id: userId,
                username: userId === '2' ? 'Sarah Johnson' : 
                         userId === '3' ? 'Michael Chen' : 'Alex Rivera',
                avatar: userId === '2' ? 'assets/images/avatars/user1.png' : 
                        userId === '3' ? 'assets/images/avatars/user2.png' : 'assets/images/avatars/user3.png',
                isOnline: Math.random() > 0.5
            });
        }, 300);
    });
}

async function simulateSendMessage(conversationId, text) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true });
        }, 500);
    });
}

async function simulateSendAttachment(conversationId, file) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                url: 'mock-url-for-attachment'
            });
        }, 1500);
    });
}

async function simulateGetAvailableUsers() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: '5',
                    username: 'Emma Wilson',
                    avatar: 'assets/images/avatars/user4.png',
                    bio: 'Product Designer | UX/UI Specialist'
                },
                {
                    id: '6',
                    username: 'David Kim',
                    avatar: 'assets/images/avatars/user5.png',
                    bio: 'Full Stack Developer | React & Node.js'
                },
                {
                    id: '7',
                    username: 'Sofia Rodriguez',
                    avatar: 'assets/images/avatars/user6.png',
                    bio: 'Marketing Specialist | Branding Expert'
                }
            ]);
        }, 800);
    });
}

async function simulateGetOrCreateConversation(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Check if it's an existing conversation
            if (userId === '2' || userId === '3' || userId === '4') {
                resolve({
                    id: userId === '2' ? '1' : userId === '3' ? '2' : '3',
                    user: {
                        id: userId,
                        username: userId === '2' ? 'Sarah Johnson' : 
                                userId === '3' ? 'Michael Chen' : 'Alex Rivera',
                        avatar: userId === '2' ? 'assets/images/avatars/user1.png' : 
                                userId === '3' ? 'assets/images/avatars/user2.png' : 'assets/images/avatars/user3.png'
                    },
                    lastMessage: {
                        text: 'No messages yet',
                        timestamp: new Date().toISOString()
                    },
                    unreadCount: 0
                });
            } else {
                // Create new conversation
                resolve({
                    id: `new-${Date.now()}`,
                    user: {
                        id: userId,
                        username: userId === '5' ? 'Emma Wilson' : 
                                userId === '6' ? 'David Kim' : 'Sofia Rodriguez',
                        avatar: userId === '5' ? 'assets/images/avatars/user4.png' : 
                                userId === '6' ? 'assets/images/avatars/user5.png' : 'assets/images/avatars/user6.png'
                    },
                    lastMessage: {
                        text: 'No messages yet',
                        timestamp: new Date().toISOString()
                    },
                    unreadCount: 0
                });
            }
        }, 800);
    });
}
