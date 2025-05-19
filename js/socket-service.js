/**
 * Socket.IO service for real-time notifications
 * Handles all real-time communication between users on the Innovate platform
 */

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }

    /**
     * Initialize Socket.IO connection
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            // In production, import the Socket.IO client library
            // this.socket = io(process.env.SOCKET_SERVER_URL, {
            //     auth: {
            //         token: localStorage.getItem('token')
            //     },
            //     reconnection: true,
            //     reconnectionDelay: 1000,
            //     reconnectionDelayMax: 5000,
            //     reconnectionAttempts: this.maxReconnectAttempts
            // });

            // For development/demo purposes
            console.log('Socket.IO service initialized');
            this.setupEventListeners();
        } catch (error) {
            console.error('Socket initialization error:', error);
            throw error;
        }
    }

    /**
     * Setup Socket.IO event listeners
     */
    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('Socket.IO connected');
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log(`Socket.IO disconnected: ${reason}`);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        // Post-related events
        this.socket.on('post_interest', (data) => {
            this.notifyListeners('post_interest', data);
        });

        this.socket.on('new_comment', (data) => {
            this.notifyListeners('new_comment', data);
        });

        this.socket.on('post_share', (data) => {
            this.notifyListeners('post_share', data);
        });

        // Meeting-related events
        this.socket.on('meeting_request', (data) => {
            this.notifyListeners('meeting_request', data);
        });

        this.socket.on('meeting_accepted', (data) => {
            this.notifyListeners('meeting_accepted', data);
        });

        // Message-related events
        this.socket.on('new_message', (data) => {
            this.notifyListeners('new_message', data);
        });
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
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
    notifyListeners(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    }

    /**
     * Emit event to server
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (!this.socket || !this.isConnected) {
            console.warn('Socket not connected, cannot emit event:', event);
            return;
        }
        
        this.socket.emit(event, data);
    }

    /**
     * Join a room for specific notifications
     * @param {string} room - Room name (e.g., post ID, conversation ID)
     */
    joinRoom(room) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('join_room', { room });
    }

    /**
     * Leave a room
     * @param {string} room - Room name
     */
    leaveRoom(room) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('leave_room', { room });
    }

    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
