/**
 * Helper functions for poll creation and interaction
 */

// Create a new poll post
function createPollPost(question, options, duration) {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!question) {
        throw new Error('Poll question is required');
      }
      
      if (!options || options.length < 2) {
        throw new Error('At least two poll options are required');
      }
      
      // Get user data
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Parse JWT token
      const userData = parseJwt(token);
      if (!userData) {
        throw new Error('Invalid user data');
      }
      
      // Calculate expiry date
      const durationInDays = parseInt(duration) || 3;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationInDays);
      
      // Create poll data
      const pollData = {
        options: options.map(option => ({
          text: option,
          votes: 0
        })),
        expiryDate: expiryDate.toISOString(),
        voters: []
      };
      
      // Create post object
      const post = {
        id: Date.now(),
        user_id: userData.id,
        username: userData.username,
        content: question,
        type: 'poll',
        poll_data: JSON.stringify(pollData),
        created_at: new Date().toISOString(),
        interested_users: JSON.stringify([]),
        visibility: 'public'
      };
      
      // Get existing posts
      let posts = [];
      const postsData = localStorage.getItem('posts');
      
      if (postsData) {
        posts = JSON.parse(postsData);
        if (!Array.isArray(posts)) {
          posts = [];
        }
      }
      
      // Add new post
      posts.unshift(post);
      
      // Save to localStorage
      localStorage.setItem('posts', JSON.stringify(posts));
      
      console.log('Poll created successfully:', post);
      resolve(post);
    } catch (error) {
      console.error('Error creating poll:', error);
      reject(error);
    }
  });
}

// Vote on a poll
function votePoll(postId, optionIndex) {
  return new Promise((resolve, reject) => {
    try {
      // Get user data
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const userData = parseJwt(token);
      if (!userData) {
        throw new Error('Invalid user data');
      }
      
      // Get posts
      const postsData = localStorage.getItem('posts');
      if (!postsData) {
        throw new Error('No posts found');
      }
      
      let posts = JSON.parse(postsData);
      if (!Array.isArray(posts)) {
        throw new Error('Invalid posts data');
      }
      
      // Find the post
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        throw new Error('Poll not found');
      }
      
      const post = posts[postIndex];
      
      // Ensure it's a poll
      if (post.type !== 'poll' || !post.poll_data) {
        throw new Error('Not a valid poll');
      }
      
      // Parse poll data
      const pollData = JSON.parse(post.poll_data);
      
      // Check if already voted
      if (pollData.voters.includes(userData.id)) {
        throw new Error('You have already voted on this poll');
      }
      
      // Check if poll has expired
      const expiryDate = new Date(pollData.expiryDate);
      if (expiryDate < new Date()) {
        throw new Error('This poll has ended');
      }
      
      // Check option index is valid
      if (optionIndex < 0 || optionIndex >= pollData.options.length) {
        throw new Error('Invalid option');
      }
      
      // Cast vote
      pollData.options[optionIndex].votes += 1;
      pollData.voters.push(userData.id);
      
      // Update post
      post.poll_data = JSON.stringify(pollData);
      posts[postIndex] = post;
      
      // Save back to localStorage
      localStorage.setItem('posts', JSON.stringify(posts));
      
      console.log('Vote recorded successfully');
      resolve(pollData);
    } catch (error) {
      console.error('Error voting on poll:', error);
      reject(error);
    }
  });
}

// Helper for parsing JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Calculate percentages for poll results
function calculatePollPercentages(options) {
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);
  
  return options.map(option => ({
    ...option,
    percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
  }));
}

// Format poll expiry time
function formatPollExpiry(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  
  if (expiry < now) {
    return 'Poll ended';
  }
  
  const diffMs = expiry - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} left`;
}
