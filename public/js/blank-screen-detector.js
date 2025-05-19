/**
 * Blank Screen Detection & Recovery
 * 
 * This script detects when a page is blank and provides recovery options
 */
(function() {
  // Wait for DOMContentLoaded or run immediately if already loaded
  function initDetector() {
    console.log('🚨 Blank screen detector active');
    
    // Give the page some time to render
    setTimeout(function() {
      // Check if body has visible content
      const bodyContent = document.body.innerText.trim();
      const hasVisibleElements = document.body.querySelectorAll('div, p, h1, h2, h3, header, footer, main').length > 0;
      
      if (!bodyContent || !hasVisibleElements) {
        console.error('🚨 BLANK SCREEN DETECTED!');
        
        // Create emergency UI
        const emergencyDiv = document.createElement('div');
        emergencyDiv.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          z-index: 99999;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
        `;
        
        emergencyDiv.innerHTML = `
          <h1 style="color: #4338ca;">Emergency Recovery</h1>
          <p>We detected a blank screen. Let's fix this:</p>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="to-home" style="padding: 10px 15px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Go to Home Page
            </button>
            <button id="to-debug" style="padding: 10px 15px; background: #4338ca; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Go to Debug Page
            </button>
            <button id="reset-all" style="padding: 10px 15px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Reset Everything
            </button>
          </div>
        `;
        
        document.body.appendChild(emergencyDiv);
        
        // Add event listeners
        document.getElementById('to-home').addEventListener('click', function() {
          sessionStorage.clear();
          window.location.href = '/home.html?bypass=true&emergency=true';
        });
        
        document.getElementById('to-debug').addEventListener('click', function() {
          window.location.href = '/debug.html';
        });
        
        document.getElementById('reset-all').addEventListener('click', function() {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/fallback.html';
        });
      }
    }, 2000); // Wait 2 seconds to check
  }
  
  // Initialize either now or when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetector);
  } else {
    initDetector();
  }
})();
