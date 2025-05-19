/**
 * Connection Test Script
 * Checks all necessary components for post creation
 */

// Run immediately to test connections
(function() {
  console.log('🔍 Connection test running...');
  
  // Display results on page if the container exists
  const testResultsContainer = document.getElementById('connection-test-results');
  
  function logResult(component, status, details = '') {
    const result = `${status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌'} ${component}: ${status === 'success' ? 'OK' : 'FAILED'} ${details}`;
    console.log(result);
    
    if (testResultsContainer) {
      const resultElement = document.createElement('div');
      resultElement.className = status;
      resultElement.textContent = result;
      testResultsContainer.appendChild(resultElement);
    }
    
    return status === 'success';
  }
  
  // Test 1: Check authentication token
  const token = localStorage.getItem('token');
  let tokenValid = false;
  
  if (!token) {
    logResult('Authentication', 'error', 'No token found in localStorage');
  } else {
    try {
      // Basic validation (not checking signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        logResult('Authentication', 'error', 'Token format invalid (not a JWT)');
      } else {
        const payload = JSON.parse(atob(parts[1]));
        const expiryDate = payload.exp ? new Date(payload.exp * 1000) : null;
        
        if (expiryDate && expiryDate < new Date()) {
          logResult('Authentication', 'error', `Token expired at ${expiryDate.toLocaleString()}`);
        } else {
          tokenValid = logResult('Authentication', 'success', `Authenticated as ${payload.username || 'Unknown'}`);
        }
      }
    } catch (error) {
      logResult('Authentication', 'error', `Token parsing error: ${error.message}`);
    }
  }
  
  // Test 2: Check form elements
  let formValid = false;
  const forms = {
    'post-form': document.getElementById('post-form'),
    'simple-post-form': document.getElementById('simple-post-form'),
    'Direct posting form': document.querySelector('form'),
  };
  
  // Check any form that exists
  let formFound = false;
  for (const [formName, form] of Object.entries(forms)) {
    if (form) {
      formFound = true;
      
      // Check for textarea
      const textarea = form.querySelector('textarea') || document.getElementById('post-content');
      const submitBtn = form.querySelector('button[type="submit"]');
      
      if (!textarea) {
        logResult(`Form (${formName})`, 'error', 'Missing textarea element');
      } else if (!submitBtn) {
        logResult(`Form (${formName})`, 'warning', 'Missing submit button');
      } else {
        formValid = logResult(`Form (${formName})`, 'success', 'Found all required elements');
        
        // Add an event listener to monitor submissions and report issues
        form.addEventListener('submit', function(e) {
          console.log(`📝 Form "${formName}" submitted`);
          // We won't prevent default - let the normal handler work
        });
      }
    }
  }
  
  if (!formFound) {
    logResult('Form', 'error', 'No form found on this page');
  }
  
  // Test 3: Check API connection
  let apiValid = false;
  
  fetch('/health')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Health endpoint returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      apiValid = logResult('API Connection', 'success', `Server running, uptime: ${data.uptime}s`);
    })
    .catch(error => {
      logResult('API Connection', 'error', `Cannot connect to server: ${error.message}`);
    });
  
  // Test 4: Check scripts loaded
  const scripts = document.querySelectorAll('script');
  const loadedScripts = Array.from(scripts).map(script => script.src).filter(Boolean);
  
  const requiredScripts = [
    '/js/auth.js',
    '/js/posts.js',
    '/js/simple-posts.js',
  ];
  
  const foundScripts = requiredScripts.filter(script => 
    loadedScripts.some(src => src.includes(script))
  );
  
  if (foundScripts.length === 0) {
    logResult('Script Loading', 'error', 'No required scripts found');
  } else {
    logResult('Script Loading', 'success', `Found ${foundScripts.length}/${requiredScripts.length} scripts`);
  }

  // Add a direct post button that bypasses all other code
  if (testResultsContainer && tokenValid) {
    const directPostSection = document.createElement('div');
    directPostSection.innerHTML = `
      <h3>Direct Post Test (Bypasses All Scripts)</h3>
      <textarea id="test-content" style="width: 100%; padding: 10px;">Test post created via connection test.</textarea>
      <button id="test-post-btn" style="margin-top: 10px; padding: 8px 16px; background: #4361ee; color: white; border: none; border-radius: 4px;">
        Send Direct Test Post
      </button>
      <div id="test-result" style="margin-top: 10px; font-family: monospace;"></div>
    `;
    testResultsContainer.appendChild(directPostSection);
    
    document.getElementById('test-post-btn').addEventListener('click', function() {
      this.disabled = true;
      const content = document.getElementById('test-content').value.trim();
      const resultDiv = document.getElementById('test-result');
      
      resultDiv.textContent = 'Sending request...';
      
      fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => { throw new Error(data.message || `HTTP error ${response.status}`); });
        }
        return response.json();
      })
      .then(data => {
        resultDiv.innerHTML = `<span style="color: green;">✅ Success! Post ID: ${data.id}</span>`;
      })
      .catch(error => {
        resultDiv.innerHTML = `<span style="color: red;">❌ Error: ${error.message}</span>`;
      })
      .finally(() => {
        this.disabled = false;
      });
    });
  }
  
  console.log('🔍 Connection test complete.');
})();
