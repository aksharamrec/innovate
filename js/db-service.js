/**
 * Database service for SQLite interaction
 * Handles all post-related database operations
 */

/**
 * Create post in SQLite database
 * @param {Object} postData - Post data including content, images, tags
 * @returns {Promise<Object>} Created post with ID
 */
async function createPost(postData) {
    try {
        // In production: API call to server for SQLite database insertion
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create post');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error creating post:', error);
        throw error;
    }
}

/**
 * Get posts for home feed
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Number of posts to return
 * @returns {Promise<Array>} List of post objects
 */
async function getFeedPosts(page = 1, limit = 10) {
    try {
        // In production: API call to get posts from SQLite
        const response = await fetch(`/api/posts/feed?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error fetching posts:', error);
        throw error;
    }
}

/**
 * Update post interest count
 * @param {Number} postId - Post ID
 * @param {Boolean} interested - Whether user is interested or not
 * @returns {Promise<Object>} Updated post data
 */
async function updatePostInterest(postId, interested) {
    try {
        // In production: API call to update interest in SQLite
        const response = await fetch(`/api/posts/${postId}/interest`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ interested })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update post interest');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error updating interest:', error);
        throw error;
    }
}

/**
 * Add comment to a post
 * @param {Number} postId - Post ID
 * @param {String} commentText - Comment content
 * @returns {Promise<Object>} Created comment data
 */
async function addPostComment(postId, commentText) {
    try {
        // In production: API call to add comment to SQLite
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ text: commentText })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add comment');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error adding comment:', error);
        throw error;
    }
}

/**
 * Archive a post (owner-only)
 * @param {Number} postId - Post ID
 * @returns {Promise<Object>} Result of archiving operation
 */
async function archivePost(postId) {
    try {
        // In production: API call to archive post in SQLite
        const response = await fetch(`/api/posts/${postId}/archive`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to archive post');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error archiving post:', error);
        throw error;
    }
}

/**
 * Delete a post from SQLite (owner-only)
 * @param {Number} postId - Post ID
 * @returns {Promise<Object>} Result of deletion operation
 */
async function deletePost(postId) {
    try {
        // In production: API call to delete post from SQLite
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete post');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error deleting post:', error);
        throw error;
    }
}

/**
 * Update post content (owner-only)
 * @param {Number} postId - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise<Object>} Updated post data
 */
async function updatePost(postId, postData) {
    try {
        // In production: API call to update post in SQLite
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(postData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update post');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Database error updating post:', error);
        throw error;
    }
}

// Export functions for use in other modules
export {
    createPost,
    getFeedPosts,
    updatePostInterest,
    addPostComment,
    archivePost,
    deletePost,
    updatePost
};
