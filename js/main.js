/**
 * Main JavaScript file for common functionality across the Innovate platform
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initializeDropdowns();
    initializeModals();
    
    // Check authentication state
    checkAuthState();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Setup logout functionality
    setupLogout();
    
    // Initialize theme preferences
    initializeTheme();
});

/**
 * Initialize dropdown menus
 */
function initializeDropdowns() {
    // Find all dropdown toggles
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Get the dropdown parent
            const dropdown = toggle.closest('.dropdown');
            
            // Close all other open dropdowns first
            document.querySelectorAll('.dropdown.active').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('active');
                }
            });
            
            // Toggle active class
            dropdown.classList.toggle('active');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

/**
 * Initialize modal functionality
 */
function initializeModals() {
    // Close modal when clicking the close button
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        const modal = closeBtn.closest('.modal');
        
        if (modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    });
    
    // Close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

/**
 * Create a modal dynamically
 * @param {string} title - Modal title
 * @param {string} content - HTML content for the modal
 * @param {Function} onConfirm - Callback function when confirmed
 * @param {string} confirmText - Text for confirmation button
 */
function createModal(title, content, onConfirm = null, confirmText = 'Confirm') {
    // Check if there's already a dynamic modal and remove it
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'dynamicModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>${title}</h3>
            <div class="modal-body">
                ${content}
            </div>
            ${onConfirm ? `
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelBtn">Cancel</button>
                    <button class="btn btn-primary" id="confirmBtn">${confirmText}</button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Setup event handlers
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const confirmBtn = modal.querySelector('#confirmBtn');
    
    // Show modal
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Close button event
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Cancel button event if it exists
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }
    
    // Confirm button event if it exists
    if (confirmBtn && onConfirm) {
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            closeModal(modal);
        });
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    return modal;
}

/**
 * Close modal with animation
 * @param {Element} modal - Modal element to close
 */
function closeModal(modal) {
    modal.classList.remove('active');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

/**
 * Check authentication state and update UI accordingly
 */
function checkAuthState() {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // If we have user data, populate UI elements
    if (token && userData) {
        // Update navigation profile information
        updateUserProfile(userData);
        
        // Set auth state for conditional UI elements
        document.body.classList.add('authenticated');
    } else {
        // Remove authenticated class from body
        document.body.classList.remove('authenticated');
        
        // Redirect to login if on protected page
        const protectedPages = ['home.html', 'profile.html', 'messages.html', 'communities.html', 'events.html', 'notifications.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Update user profile information in UI
 * @param {Object} userData - User data object
 */
function updateUserProfile(userData) {
    // Update all avatar images
    const avatarImages = document.querySelectorAll('#navbarAvatar, #sidebarAvatar, #postAvatarImg, #modalAvatarImg');
    avatarImages.forEach(img => {
        if (img && userData.avatar) {
            img.src = userData.avatar;
        }
    });
    
    // Update user name in UI
    const userNameElements = document.querySelectorAll('#userName, #modalUserName');
    userNameElements.forEach(el => {
        if (el) {
            el.textContent = userData.displayName || userData.username || userData.fullName || 'User';
        }
    });
    
    // Update user headline/tagline if available
    const taglineElement = document.getElementById('userTagline');
    if (taglineElement) {
        taglineElement.textContent = userData.headline || 'Innovate member';
    }
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
    // Handle escape key press to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            activeModals.forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

/**
 * Set up logout functionality
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logout-button');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Create confirmation modal
            createModal(
                'Log Out',
                '<p>Are you sure you want to log out?</p>',
                () => {
                    // Clear authentication data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    // Redirect to login page
                    window.location.href = 'login.html';
                },
                'Log Out'
            );
        });
    }
}

/**
 * Initialize theme preferences (light/dark mode)
 */
function initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Handle theme toggle buttons
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            
            // Update button icons
            updateThemeToggleIcons();
        });
    });
    
    // Initialize toggle icons
    updateThemeToggleIcons();
}

/**
 * Update theme toggle button icons based on current theme
 */
function updateThemeToggleIcons() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    themeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        if (icon) {
            if (isDarkMode) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    });
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 3000) {
    // Get or create toast container
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show with animation (setTimeout to trigger CSS transition)
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Setup close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

/**
 * Remove a toast with animation
 * @param {Element} toast - Toast element to remove
 */
function removeToast(toast) {
    toast.classList.add('toast-hiding');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
            
            // Check if container is empty and remove it
            const toastContainer = document.getElementById('toastContainer');
            if (toastContainer && toastContainer.childElementCount === 0) {
                document.body.removeChild(toastContainer);
            }
        }
    }, 300);
}

/**
 * Format relative time for timestamps
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted relative time
 */
function formatRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    // Handle future dates
    if (seconds < 0) {
        return 'just now';
    }
    
    // Define time intervals
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];
    
    // Find appropriate interval
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return count === 1 
                ? `1 ${interval.label} ago`
                : `${count} ${interval.label}s ago`;
        }
    }
    
    return 'just now';
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const dateObj = new Date(date);
    
    return dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Simulate API loading delay
 * @param {*} data - Data to return after delay
 * @param {number} delay - Milliseconds to delay
 * @returns {Promise} Promise resolving to data after delay
 */
async function simulateLoadPosts(delay = 1500) {
    return new Promise(resolve => {
        setTimeout(() => {
            // Generate mock posts data
            resolve([
                {
                    id: 1,
                    content: "Just finished working on a new healthcare app design! Looking for feedback from UI/UX designers with experience in the medical field.",
                    user: {
                        username: "Sarah Johnson",
                        avatar: "assets/images/avatars/user1.png",
                        role: "UI/UX Designer"
                    },
                    images: ["assets/images/posts/healthcare-app.jpg"],
                    tags: ["#uidesign", "#healthcare", "#feedback"],
                    interestedCount: 24,
                    commentCount: 7,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    comments: [
                        {
                            user: {
                                username: "Alex Rivera",
                                avatar: "assets/images/avatars/user3.png"
                            },
                            content: "Love the color scheme! I've worked on a similar project, would be happy to share insights.",
                            timestamp: new Date(Date.now() - 1800000).toISOString()
                        }
                    ],
                    userInterested: false
                },
                {
                    id: 2,
                    content: "Our company is hiring Node.js developers with 3+ years of experience. Remote work available, competitive salary and benefits!",
                    user: {
                        username: "Michael Chen",
                        avatar: "assets/images/avatars/user2.png",
                        role: "Senior Developer"
                    },
                    images: [],
                    tags: ["#hiring", "#nodejs", "#remotework"],
                    interestedCount: 56,
                    commentCount: 12,
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    comments: [
                        {
                            user: {
                                username: "David Wilson",
                                avatar: "assets/images/avatars/user5.png"
                            },
                            content: "Is this open to international applicants as well?",
                            timestamp: new Date(Date.now() - 43200000).toISOString()
                        },
                        {
                            user: {
                                username: "Michael Chen",
                                avatar: "assets/images/avatars/user2.png"
                            },
                            content: "Yes, we're open to hiring from anywhere as long as you can work in our core hours!",
                            timestamp: new Date(Date.now() - 39600000).toISOString()
                        }
                    ],
                    userInterested: true
                },
                {
                    id: 3,
                    content: "Just launched my portfolio website showcasing my latest design projects. Would appreciate any feedback from fellow designers!",
                    user: {
                        username: "Emily Brown",
                        avatar: "assets/images/avatars/user4.png",
                        role: "Product Designer"
                    },
                    images: ["assets/images/posts/portfolio.jpg"],
                    tags: ["#portfolio", "#webdesign", "#creativity"],
                    interestedCount: 42,
                    commentCount: 8,
                    timestamp: new Date(Date.now() - 172800000).toISOString(),
                    comments: [
                        {
                            user: {
                                username: "Sarah Johnson",
                                avatar: "assets/images/avatars/user1.png"
                            },
                            content: "The layout is really clean and the project showcases are excellent. Great work!",
                            timestamp: new Date(Date.now() - 151200000).toISOString()
                        }
                    ],
                    userInterested: false
                }
            ]);
        }, delay);
    });
}

/**
 * Export common functions for use in other scripts
 */
window.showToast = showToast;
window.createModal = createModal;
window.closeModal = closeModal;
window.formatRelativeTime = formatRelativeTime;
window.formatDate = formatDate;
window.simulateLoadPosts = simulateLoadPosts;
