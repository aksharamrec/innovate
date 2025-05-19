/**
 * This script prevents redirect loops between pages
 * Include it on all pages that might be part of a redirect cycle
 */

// Track page visits in session storage
(function() {
  // Get the current page path
  const currentPath = window.location.pathname;
  
  // Get visit history from sessionStorage
  const visitHistory = JSON.parse(sessionStorage.getItem('pageVisitHistory') || '[]');
  
  // Add current page to history
  visitHistory.push({
    path: currentPath,
    timestamp: Date.now()
  });
  
  // Keep only the last 10 visits
  if (visitHistory.length > 10) {
    visitHistory.shift();
  }
  
  // Save updated history
  sessionStorage.setItem('pageVisitHistory', JSON.stringify(visitHistory));
  
  // Check for redirect loops
  const lastMinuteVisits = visitHistory.filter(v => Date.now() - v.timestamp < 60000);
  
  // Count occurrences of each page
  const pageCounts = {};
  lastMinuteVisits.forEach(visit => {
    pageCounts[visit.path] = (pageCounts[visit.path] || 0) + 1;
  });
  
  // Check if any page was visited more than 3 times in the last minute
  const loopDetected = Object.values(pageCounts).some(count => count > 3);
  
  if (loopDetected) {
    console.error('REDIRECT LOOP DETECTED!');
    
    // Clear any auth data that might be causing loops
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Clear history to prevent further detections
    sessionStorage.removeItem('pageVisitHistory');
    
    // Alert the user
    if (!sessionStorage.getItem('loopAlertShown')) {
      alert('A redirect loop was detected and stopped. Your authentication data has been cleared. Please try logging in again.');
      sessionStorage.setItem('loopAlertShown', 'true');
      
      // Redirect to a safe page
      window.location.href = '/login.html?loop=detected';
    }
  }
})();
