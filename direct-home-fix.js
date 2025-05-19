/**
 * Emergency Direct Home Fix
 * Run this if the server is looping redirects
 */

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

console.log('EMERGENCY DIRECT HOME SERVER STARTING');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Force home.html for all main routes
app.get('/', (req, res) => {
  console.log('Serving home.html for root path');
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login.html', (req, res) => {
  console.log('Redirecting login.html to home.html');
  res.redirect('/home.html');
});

app.get('/auth.html', (req, res) => {
  console.log('Redirecting auth.html to home.html');
  res.redirect('/home.html');
});

// Start server
app.listen(port, () => {
  console.log('=======================================');
  console.log('  EMERGENCY DIRECT HOME SERVER RUNNING  ');
  console.log('=======================================');
  console.log(`Server running on port ${port}`);
  console.log(`Go to: http://localhost:${port}/home.html`);
  console.log('All authentication routes will go directly to home');
});
