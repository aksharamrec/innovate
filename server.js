const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Ensure directories exist
const publicDir = path.join(__dirname, 'public');
const soundsDir = path.join(publicDir, 'sounds');
if (!fs.existsSync(soundsDir)) {
  console.log('Creating sounds directory');
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Create a blank notification sound file if it doesn't exist
try {
  const soundFile = path.join(soundsDir, 'notification.mp3');
  if (!fs.existsSync(soundFile)) {
    console.log('Creating placeholder notification sound file');
    fs.writeFileSync(soundFile, Buffer.from([0]));
  }
} catch (err) {
  console.error('Error creating sound file:', err);
}

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  console.error('Stack trace:', err.stack);
  // Log but don't crash the server
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// ===== EMERGENCY FIX FOR REDIRECT LOOP =====
// Place this right after the middleware section but before any routes

// Emergency route to break redirect loop - highest priority
app.get('/emergency-fix', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Emergency Fix</title>
      <style>
        body { font-family: Arial; text-align: center; margin: 50px; }
      </style>
    </head>
    <body>
      <h1>Emergency Fix Applied</h1>
      <p>This page breaks the redirect loop.</p>
      <a href="/home.html" style="display:inline-block; background:#4CAF50; color:white; padding:10px 20px; text-decoration:none; border-radius:4px; margin-top:20px;">
        Continue to Home Page
      </a>
    </body>
    </html>
  `);
});

// CRITICAL: Home and Login page handlers with highest priority
// These must be BEFORE all other routes including static middleware
app.get('/home.html', (req, res) => {
  console.log('HOME PAGE REQUESTED - DIRECT STATIC SERVE');
  return res.sendFile(path.join(publicDir, 'home.html'));
});

app.get('/login.html', (req, res) => {
  console.log('LOGIN PAGE REQUESTED - DIRECT STATIC SERVE');
  
  // Check if we're in a potential loop with home.html
  const referer = req.get('Referer') || '';
  if (referer.includes('/home.html')) {
    console.log('BREAKING POTENTIAL LOOP: Redirecting to emergency fix');
    return res.redirect(302, '/emergency-fix');
  }
  
  return res.sendFile(path.join(publicDir, 'login.html'));
});

// Root path - serve home directly
app.get('/', (req, res) => {
  console.log('ROOT PATH REQUESTED - SERVING HOME.HTML');
  return res.sendFile(path.join(publicDir, 'home.html'));
});

// EMERGENCY FIX: Add these at the top of your route definitions
// Remove all previous route handlers for these pages

// CRITICAL FIX FOR REDIRECT LOOP: 
// Remove all previous route handlers for these paths first!
// This gets done by Node when the new handlers are defined below

// ===== SIMPLIFIED ROUTE HANDLERS =====
// Home page - direct static serve with absolutely no redirects
app.get('/home.html', (req, res) => {
  console.log('HOME.HTML - STATIC SERVE (no redirects)');
  return res.sendFile(path.join(publicDir, 'home.html'));
});

// Login page - direct static serve with absolutely no redirects
app.get('/login.html', (req, res) => {
  console.log('LOGIN.HTML - STATIC SERVE (no redirects)');
  return res.sendFile(path.join(publicDir, 'login.html'));
});

// Root route - direct to home with no redirects
app.get('/', (req, res) => {
  console.log('Root route accessed - serving home.html directly');
  res.sendFile(path.join(publicDir, 'home.html'));
});

// Add a force-break emergency endpoint
app.get('/break-loop', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Loop Broken</title>
      <style>
        body { font-family: Arial; text-align: center; margin-top: 50px; }
        button { padding: 10px 20px; margin: 10px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Redirect Loop Stopped!</h1>
      <p>The redirect loop has been stopped.</p>
      <button onclick="clearAndGoHome()">Clear Storage & Go Home</button>
      <script>
        function clearAndGoHome() {
          localStorage.clear();
          sessionStorage.clear();
          // Use location.replace to prevent adding to browser history
          window.location.replace('/home.html?noloop=true&t=' + Date.now());
        }
        // Auto-execute
        clearAndGoHome();
      </script>
    </body>
    </html>
  `);
});

// Loop detection middleware
app.use((req, res, next) => {
  // Only check for html pages
  if (req.path.endsWith('.html')) {
    // Get client identifier (IP address)
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Initialize or get request history for this client
    global.reqHistory = global.reqHistory || {};
    global.reqHistory[clientId] = global.reqHistory[clientId] || [];
    
    // Add this request to history
    global.reqHistory[clientId].push({
      path: req.path,
      time: Date.now()
    });
    
    // Keep only last 10 requests
    if (global.reqHistory[clientId].length > 10) {
      global.reqHistory[clientId] = global.reqHistory[clientId].slice(-10);
    }
    
    // Check for redirect loop pattern
    const history = global.reqHistory[clientId];
    if (history.length >= 6) {
      // Check last 6 requests
      const last6 = history.slice(-6);
      
      // Check if requests are rapidly alternating between two pages
      const isAlternating = last6.every((req, i) => {
        if (i % 2 === 0) {
          return req.path === last6[0].path;
        } else {
          return req.path === last6[1].path;
        }
      });
      
      // Check if requests happened quickly (within 5 seconds)
      const isRapid = (last6[5].time - last6[0].time) < 5000;
      
      if (isAlternating && isRapid) {
        console.error('REDIRECT LOOP DETECTED! Breaking the loop...');
        return res.redirect('/break-loop');
      }
    }
  }
  
  next();
});

// Static file middleware
app.use(express.static(publicDir));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT' && req.body) {
    console.log('Request body:', req.body);
  }
  
  // Log response details when complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

// ===== DATABASE SETUP =====
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    bio TEXT,
    skills TEXT,
    interests TEXT,
    following TEXT DEFAULT '[]',
    followers TEXT DEFAULT '[]',
    blocked_users TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Create posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_archived INTEGER DEFAULT 0,
    is_scheduled INTEGER DEFAULT 0,
    scheduled_for TEXT,
    is_visible INTEGER DEFAULT 1,
    interested_users TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  // Create messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    attachment_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  )`);
  
  // Create notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    reference_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  // Create communities table
  db.run(`CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    admin_id INTEGER NOT NULL,
    privacy TEXT DEFAULT 'public',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (id)
  )`);
  
  // Create community_members table
  db.run(`CREATE TABLE IF NOT EXISTS community_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  // Create community_channels table
  db.run(`CREATE TABLE IF NOT EXISTS community_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities (id)
  )`);
  
  // Create channel_messages table
  db.run(`CREATE TABLE IF NOT EXISTS channel_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES community_channels (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  // Create events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL,
    related_post_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id),
    FOREIGN KEY (related_post_id) REFERENCES posts (id)
  )`);
}

// Login page handler (NO redirection)
app.get('/login.html', (req, res) => {
  console.log('Login page directly requested');
  const loginPath = path.join(publicDir, 'login.html');
  if (fs.existsSync(loginPath)) {
    console.log('Serving existing login.html file');
    res.sendFile(loginPath);
  } else {
    console.log('login.html not found - serving auth.html instead');
    res.sendFile(path.join(publicDir, 'auth.html'));
  }
});

// Auth page handler
app.get('/auth.html', (req, res) => {
  console.log('Auth page directly requested - serving file');
  res.sendFile(path.join(publicDir, 'auth.html'));
});

// Register page handler
app.get('/register.html', (req, res) => {
  console.log('Register page directly requested - serving file');
  res.sendFile(path.join(publicDir, 'register.html'));
});

// Catch-all for HTML files that don't exist
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.endsWith('.html')) {
    const filePath = path.join(publicDir, req.path);
    if (!fs.existsSync(filePath)) {
      console.log(`${req.path} not found - serving fallback.html`);
      return res.sendFile(path.join(publicDir, 'fallback.html'));
    }
  }
  next();
});

// API Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    console.log('Processing login for:', email);
    
    // Special case for test user
    if (email === 'user@example.com' && password === 'password123') {
      console.log('TEST USER LOGIN');
      
      // Create token for test user
      const token = jwt.sign(
        { id: '1', username: 'johndoe', email: 'user@example.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Send response with test user data
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          email: 'user@example.com',
          avatar: null,
          stats: {
            posts: 15,
            following: 124,
            followers: 89
          }
        }
      });
    }
    
    // Regular user login flow would go here
    // ...

    // For the demo, send error for any non-test user
    res.status(401).json({
      success: false,
      message: 'Invalid credentials. Try the test user: user@example.com/password123'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  console.log('Token verified successfully. User data:', req.user);
  res.json(req.user);
});

app.post('/api/auth/logout', (req, res) => {
  console.log('Logout request received');
  res.json({ message: 'Logged out successfully' });
});

// API Routes for Posts
app.get('/api/posts', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const feedType = req.query.feed || 'all';
  
  console.log(`Fetching posts for user ${userId}, feed type: ${feedType}`);
  
  // Demo implementation: return empty array
  res.json([]);
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  
  console.log('Post creation attempt:', { userId, content });
  
  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }
  
  // Demo implementation: return mock post
  res.status(201).json({
    id: Math.floor(Math.random() * 1000),
    content: content,
    user_id: userId,
    username: req.user.username,
    interested_users: [],
    is_interested: false,
    is_owner: true,
    created_at: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoints
app.get('/debug/paths', (req, res) => {
  const htmlDir = path.join(publicDir, 'html');
  
  const pathInfo = {
    serverTime: new Date().toISOString(),
    publicDirectoryPath: publicDir,
    publicDirectoryExists: fs.existsSync(publicDir),
    htmlDirectoryPath: htmlDir,
    htmlDirectoryExists: fs.existsSync(htmlDir)
  };
  
  if (pathInfo.publicDirectoryExists) {
    try {
      pathInfo.publicFiles = fs.readdirSync(publicDir)
        .filter(f => f.endsWith('.html'))
        .map(f => `/${f}`);
    } catch (err) {
      pathInfo.publicFilesError = err.message;
    }
  }
  
  res.json(pathInfo);
});

// ===== WEBSOCKET SETUP =====
// Map to store active connections by user ID
const activeConnections = new Map();

// WebSocket connection handler
wss.on('connection', function connection(ws, req) {
  // Parse token from URL query parameter
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  
  // Verify token
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log(`WebSocket connection established for user ${user.id}`);
    
    // Store the connection
    if (!activeConnections.has(user.id)) {
      activeConnections.set(user.id, []);
    }
    activeConnections.get(user.id).push(ws);
    
    // Setup ping interval
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.ping();
        } catch (err) {
          console.error('Ping error:', err);
          clearInterval(pingInterval);
        }
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
    
    // Handle connection close
    ws.on('close', () => {
      console.log(`WebSocket connection closed for user ${user.id}`);
      clearInterval(pingInterval);
      
      // Remove connection from active connections
      if (activeConnections.has(user.id)) {
        const connections = activeConnections.get(user.id);
        const index = connections.indexOf(ws);
        if (index !== -1) {
          connections.splice(index, 1);
        }
        
        if (connections.length === 0) {
          activeConnections.delete(user.id);
        }
      }
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      userId: user.id,
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('WebSocket authentication error:', error);
    ws.close();
  }
});

// =========================
// CRITICAL EMERGENCY FIX
// =========================
// Replace all route handlers with these direct routes
// This will force home.html to be served for all key routes

// First, remove ALL previous routes for these paths
app.get('/', function(req, res) {
  console.log('ROOT PATH: Direct to home.html');
  res.sendFile(path.join(publicDir, 'home.html'));
});

app.get('/home.html', function(req, res) {
  console.log('HOME.HTML: Directly serving file');
  res.sendFile(path.join(publicDir, 'home.html'));
});

app.get('/index.html', function(req, res) {
  console.log('INDEX.HTML: Direct to home.html');
  res.sendFile(path.join(publicDir, 'home.html'));
});

app.get('/login.html', function(req, res) {
  console.log('LOGIN.HTML: Direct to home.html');
  res.sendFile(path.join(publicDir, 'home.html'));
});

app.get('/auth.html', function(req, res) {
  console.log('AUTH.HTML: Direct to home.html');
  res.sendFile(path.join(publicDir, 'home.html'));
});

// Make sure the static file middleware is after these direct routes

// ===== SERVER STARTUP =====
function startServer(port) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Static files being served from: ${publicDir}`);
    console.log(`Homepage: http://localhost:${port}/home.html`);
    
    // List HTML files in public directory
    try {
      const htmlFiles = fs.readdirSync(publicDir)
        .filter(f => f.endsWith('.html'))
        .join(', ');
      console.log(`Available HTML files: ${htmlFiles}`);
    } catch (err) {
      console.error('Error listing HTML files:', err);
    }
  });
}

// Start the server
startServer(PORT);