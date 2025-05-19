const fs = require('fs');
const path = require('path');

// Path to the HTML directory
const htmlDir = path.join(__dirname, 'public', 'html');

// Check if the directory exists
if (fs.existsSync(htmlDir)) {
  console.log('Found HTML directory at:', htmlDir);
  
  try {
    // Read all files in the directory
    const files = fs.readdirSync(htmlDir);
    
    if (files.length === 0) {
      console.log('HTML directory is already empty.');
    } else {
      console.log(`Found ${files.length} files to delete:`);
      
      // Delete each file
      files.forEach(file => {
        const filePath = path.join(htmlDir, file);
        
        try {
          // Check if it's a file (not a subdirectory)
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            console.log(`✓ Deleted: ${file}`);
          } else {
            console.log(`⚠️ Skipped directory: ${file}`);
          }
        } catch (err) {
          console.error(`❌ Error deleting ${file}:`, err.message);
        }
      });
      
      console.log('All files deleted successfully!');
    }
    
    // Optionally remove the directory itself
    console.log('Removing HTML directory...');
    fs.rmdirSync(htmlDir);
    console.log('HTML directory removed successfully!');
    
  } catch (err) {
    console.error('Error processing HTML directory:', err.message);
  }
} else {
  console.log('HTML directory does not exist at:', htmlDir);
}

console.log('Done! The application should now correctly use /home.html instead of /html/home.html');
