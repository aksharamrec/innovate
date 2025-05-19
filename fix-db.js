const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('Starting database fix script...');

// Create the sounds directory if it doesn't exist
const soundsDir = path.join(__dirname, 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  console.log('Creating sounds directory');
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Create a blank notification sound file if it doesn't exist
try {
  const soundFile = path.join(soundsDir, 'notification.mp3');
  if (!fs.existsSync(soundFile)) {
    console.log('Creating placeholder notification sound file');
    // Create an empty file as a placeholder
    fs.writeFileSync(soundFile, Buffer.from([0]));
  }
  console.log('Notification sound file exists');
} catch (err) {
  console.error('Error creating sound file:', err);
}

// Open the database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  // Check if posts table exists
  db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='posts'`, (err, table) => {
    if (err) {
      console.error('Error checking posts table:', err);
      closeDb();
      return;
    }
    
    if (!table) {
      console.log('Posts table does not exist. Creating it...');
      db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        is_archived INTEGER DEFAULT 0,
        interested_users TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating posts table:', err);
          closeDb();
          return;
        }
        checkPosts();
      });
    } else {
      checkPosts();
    }
  });
  
  function checkPosts() {
    // Check if posts table is empty
    db.get('SELECT COUNT(*) as count FROM posts', (err, result) => {
      if (err) {
        console.error('Error counting posts:', err);
        closeDb();
        return;
      }
      
      if (result.count === 0) {
        // Get a sample user to attach posts to
        db.get('SELECT id FROM users LIMIT 1', (err, user) => {
          if (err || !user) {
            console.log('No users found. Please register a user first.');
            closeDb();
            return;
          }
          
          console.log(`Found user ID ${user.id} for sample posts.`);
          
          // Sample posts
          const samplePosts = [
            { 
              content: "Just started a new project exploring sustainable energy solutions. Looking for collaborators with experience in solar panel efficiency optimization."
            },
            { 
              content: "Excited to share my latest research on AI-driven agriculture techniques. The results show a 30% increase in crop yield with 20% less water usage."
            },
            { 
              content: "Anyone interested in discussing blockchain applications for supply chain management? I've been developing a prototype that could revolutionize product tracking."
            }
          ];
          
          // Insert sample posts
          console.log('Adding sample posts...');
          let inserted = 0;
          
          samplePosts.forEach(post => {
            db.run('INSERT INTO posts (user_id, content, interested_users) VALUES (?, ?, ?)',
              [user.id, post.content, '[]'],
              function(err) {
                if (err) {
                  console.error('Error inserting sample post:', err);
                } else {
                  inserted++;
                  console.log(`Inserted post #${this.lastID}`);
                }
                
                if (inserted === samplePosts.length) {
                  console.log('All sample posts added successfully');
                  closeDb();
                }
              }
            );
          });
        });
      } else {
        console.log(`Found ${result.count} existing posts. No need to add samples.`);
        closeDb();
      }
    });
  }
  
  function closeDb() {
    db.close((err) => {
      if (err) {
        console.error('Error closing database', err.message);
      } else {
        console.log('Database connection closed');
      }
      console.log('Fix script completed');
    });
  }
});
