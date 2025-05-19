const fs = require('fs');
const path = require('path');

// List all HTML files in the public directory
console.log('Checking HTML files in public directory:');
const publicDir = path.join(__dirname, 'public');

try {
  const files = fs.readdirSync(publicDir);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  console.log('Found HTML files:');
  htmlFiles.forEach(file => {
    console.log(`- ${file}`);
  });
  
  // Check for a /html directory
  const htmlDir = path.join(publicDir, 'html');
  if (fs.existsSync(htmlDir)) {
    console.log('\nFound /html subdirectory!');
    
    try {
      const htmlDirFiles = fs.readdirSync(htmlDir);
      if (htmlDirFiles.length > 0) {
        console.log('Files in /html subdirectory:');
        htmlDirFiles.forEach(file => {
          console.log(`- html/${file}`);
        });
        
        if (htmlDirFiles.includes('home.html')) {
          console.log('\n⚠️ ISSUE FOUND: There is a duplicate home.html in the /html subdirectory!');
          console.log('This is likely causing the redirect problem.');
          console.log('Recommendation: Remove the /html/home.html file to avoid confusion.');
        }
      } else {
        console.log('The /html directory is empty.');
      }
    } catch (err) {
      console.error('Error reading /html directory:', err.message);
    }
  } else {
    console.log('\nNo /html subdirectory found (this is good).');
  }
  
  // Check for links to /html/home.html in HTML files
  console.log('\nChecking for incorrect links in HTML files...');
  
  htmlFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('/html/home.html') || content.includes('"html/home.html"') || content.includes("'html/home.html'")) {
        console.log(`⚠️ File '${file}' contains incorrect links to /html/home.html`);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  });
  
  console.log('\nDebug complete!');
} catch (err) {
  console.error('Error accessing public directory:', err.message);
}
