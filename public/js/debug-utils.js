// Debugging utilities for the Innovate application

// Enhanced console logging
(function() {
  // Save original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
  
  // Override console.error to include stack trace
  console.error = function() {
    // Get stack trace
    const stack = new Error().stack;
    
    // Call original with arguments and stack
    originalConsole.error.apply(console, [...arguments, '\n', stack]);
    
    // Log to localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      logs.push({
        type: 'error',
        message: Array.from(arguments).map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        stack: stack,
        timestamp: new Date().toISOString()
      });
      
      // Keep only the last 50 logs
      if (logs.length > 50) logs.splice(0, logs.length - 50);
      
      localStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      // Silently fail if localStorage isn't working
    }
  };
  
  // Initialize unhandled error tracking
  window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
  });
  
  // Initialize unhandled promise rejection tracking
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  console.info('Debug utilities loaded');
})();
