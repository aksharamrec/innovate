/**
 * Enhanced redirect loop breaker - with better debugging
 */
(function() {
  console.log('🔄 Loop breaker running');
  
  // Add this early check
  if (!window.sessionStorage) {
    console.log('SessionStorage not available - skipping loop detection');
    return;
  }

  try {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    
    // If debug or bypass is set, skip detection
    if (params.get('debug') === 'true' || params.get('bypass') === 'true') {
      console.log('Debug/bypass mode - skipping loop detection');
      return;
    }
    
    // Get visit history
    let visitHistory;
    try {
      visitHistory = JSON.parse(sessionStorage.getItem('visitHistory') || '[]');
    } catch (e) {
      console.error('Error parsing visit history:', e);
      visitHistory = [];
    }
    
    // Add current visit
    visitHistory.push({
      path: window.location.pathname,
      time: Date.now()
    });
    
    // Keep only the last 5 visits
    if (visitHistory.length > 5) {
      visitHistory = visitHistory.slice(-5);
    }
    
    // Save history
    sessionStorage.setItem('visitHistory', JSON.stringify(visitHistory));
    
    // Only analyze if we have at least 3 visits
    if (visitHistory.length >= 3) {
      // Count occurrences of each path
      const pathCounts = {};
      visitHistory.forEach(visit => {
        pathCounts[visit.path] = (pathCounts[visit.path] || 0) + 1;
      });
      
      // Check for rapid loops (more than 3 visits to same page within 3 seconds)
      const highestCount = Math.max(...Object.values(pathCounts));
      
      if (highestCount >= 3) {
        // Check if the frequent page visits happened quickly
        const samePages = visitHistory.filter(v => v.path === visitHistory[visitHistory.length - 1].path);
        const firstVisit = samePages[0].time;
        const lastVisit = samePages[samePages.length - 1].time;
        const timeSpan = lastVisit - firstVisit;
        
        // Only consider it a loop if 3 visits happened within 3 seconds
        if (samePages.length >= 3 && timeSpan < 3000) {
          console.warn('🔄 Possible redirect loop detected!');
          console.warn('Visit history:', visitHistory);
          
          // Emergency redirect - but less aggressive
          if (window.location.pathname !== '/debug.html') {
            // Store emergency flag
            localStorage.setItem('redirect_emergency', 'true');
            
            // Redirect to debug page
            window.location.href = '/debug.html?source=' + encodeURIComponent(window.location.pathname);
            
            // Prevent further execution
            throw new Error('Redirect loop prevented - emergency redirect to debug page');
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in redirect loop breaker:', err);
  }
})();
