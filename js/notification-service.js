/**
 * Notification service for the Innovate platform
 * Handles push notifications, alerts, and reminders
 */

class NotificationService {
    constructor() {
        this.eventSource = null;
        this.notifications = [];
        this.listeners = new Map();
        this.notificationPermission = 'default';
    }
    
    /**
     * Initialize the notification service
     */
    async initialize() {
        try {
            // Check browser notification permission
            if ("Notification" in window) {
                this.notificationPermission = Notification.permission;
                
                // Request permission if not already granted
                if (this.notificationPermission !== 'granted' && this.notificationPermission !== 'denied') {
                    this.notificationPermission = await Notification.requestPermission();
                }
            }
            
            // Setup Server-Sent Events for push notifications from server
            this.setupSSE();
            
            // Load existing notifications from local storage
            this.loadNotifications();
            
            // Setup check for reminders
            this.checkReminders();
            
            // Schedule periodic checks
            setInterval(() => this.checkReminders(), 60000); // Check every minute
            
            console.log('Notification service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize notification service:', error);
            return false;
        }
    }
    
    /**
     * Setup Server-Sent Events for real-time notifications
     */
    setupSSE() {
        try {
            // In production, connect to SSE endpoint
            // this.eventSource = new EventSource('/api/notifications/events');
            
            // Handle incoming SSE events
            /* this.eventSource.addEventListener('notification', (event) => {
                const notification = JSON.parse(event.data);
                this.addNotification(notification);
                
                // Show browser notification if permission granted
                this.showBrowserNotification(notification);
            });
            
            this.eventSource.addEventListener('error', (error) => {
                console.error('SSE connection error:', error);
                // Try to reconnect after delay
                setTimeout(() => this.setupSSE(), 5000);
            }); */
            
            console.log('SSE would be initialized here in production');
        } catch (error) {
            console.error('Failed to setup SSE:', error);
        }
    }
    
    /**
     * Show browser notification
     * @param {Object} notification - Notification data
     */
    showBrowserNotification(notification) {
        if (this.notificationPermission !== 'granted') return;
        
        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/assets/images/innovate-logo.svg'
        });
        
        browserNotification.onclick = () => {
            window.focus();
            if (notification.url) {
                window.location.href = notification.url;
            }
            browserNotification.close();
        };
    }
    
    /**
     * Add a notification to the service
     * @param {Object} notification - Notification data
     */
    addNotification(notification) {
        // Add timestamp if missing
        if (!notification.timestamp) {
            notification.timestamp = new Date().toISOString();
        }
        
        // Add unique id if missing
        if (!notification.id) {
            notification.id = Date.now().toString();
        }
        
        // Set read status if missing
        if (notification.read === undefined) {
            notification.read = false;
        }
        
        // Add to notifications array
        this.notifications.unshift(notification);
        
        // Limit to 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        // Save to local storage
        this.saveNotifications();
        
        // Notify listeners
        this.notify('new', notification);
    }
    
    /**
     * Mark notification as read
     * @param {string} notificationId - ID of the notification
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.notify('read', notification);
        }
    }
    
    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        this.saveNotifications();
        this.notify('read-all', null);
    }
    
    /**
     * Delete a notification
     * @param {string} notificationId - ID of the notification
     */
    deleteNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            const notification = this.notifications[index];
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.notify('delete', notification);
        }
    }
    
    /**
     * Get all notifications
     * @returns {Array} Array of notifications
     */
    getNotifications() {
        return [...this.notifications];
    }
    
    /**
     * Get unread notification count
     * @returns {number} Number of unread notifications
     */
    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
    
    /**
     * Save notifications to local storage
     */
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }
    
    /**
     * Load notifications from local storage
     */
    loadNotifications() {
        try {
            const storedNotifications = localStorage.getItem('notifications');
            if (storedNotifications) {
                this.notifications = JSON.parse(storedNotifications);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            this.notifications = [];
        }
    }
    
    /**
     * Check for due reminders
     */
    async checkReminders() {
        try {
            // In production, this would check reminders in the SQLite database
            // const reminders = await fetchDueReminders();
            
            // For simulation, check if there are any demo reminders due
            const now = new Date();
            const demoReminders = this.getDemoReminders();
            
            demoReminders.forEach(reminder => {
                const reminderTime = new Date(reminder.date + 'T' + reminder.time);
                
                if (reminderTime <= now) {
                    // Add as notification
                    this.addNotification({
                        type: 'reminder',
                        title: 'Gentle Reminder',
                        message: reminder.note || `Reminder for post: ${reminder.postTitle}`,
                        url: `/post.html?id=${reminder.postId}`,
                        read: false
                    });
                    
                    // Show toast
                    if (window.showToast) {
                        showToast(`Reminder: ${reminder.note || reminder.postTitle}`, 'info');
                    }
                    
                    // Show browser notification
                    this.showBrowserNotification({
                        title: 'Gentle Reminder',
                        message: reminder.note || `Reminder for post: ${reminder.postTitle}`
                    });
                }
            });
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    }
    
    /**
     * Add event listener
     * @param {string} event - Event name: 'new', 'read', 'read-all', 'delete'
     * @param {Function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    removeEventListener(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }
    
    /**
     * Notify all listeners for an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    notify(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in notification listener (${event}):`, error);
            }
        });
    }
    
    /**
     * Get demo reminders for simulation
     * @returns {Array} Array of demo reminders
     */
    getDemoReminders() {
        // In a real app, these would come from the SQLite database
        const now = new Date();
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
        
        return [
            {
                id: 'demo1',
                postId: 1,
                postTitle: 'Healthcare App UI Design Collaboration',
                note: 'Follow up with Sarah about the healthcare UI design',
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().split(' ')[0],
            },
            {
                id: 'demo2',
                postId: 2,
                postTitle: 'Node.js Developer Position',
                note: 'Check if the Node.js position is still available',
                date: fiveMinutesFromNow.toISOString().split('T')[0],
                time: fiveMinutesFromNow.toTimeString().split(' ')[0],
            }
        ];
    }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
