const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route handlers with NO redirects
app.get('/home.html', (req, res) => {
  console.log('HOME PAGE - DIRECT STATIC FILE SERVE');
  res.sendFile(path.join(__dirname, 'public', 'static-home.html'));
});

app.get('/login.html', (req, res) => {
  console.log('LOGIN PAGE - DIRECT STATIC FILE SERVE');
  res.sendFile(path.join(__dirname, 'public', 'static-login.html'));
});

app.get('/', (req, res) => {
  console.log('ROOT - DIRECT STATIC FILE SERVE');
  res.sendFile(path.join(__dirname, 'public', 'static-home.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Emergency server running on port ${port}`);
  console.log(`Static home page: http://localhost:${port}/home.html`);
  console.log(`Static login page: http://localhost:${port}/login.html`);
});
