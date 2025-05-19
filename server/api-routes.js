/**
 * API routes for the Innovate platform
 * Implements the SQLite database operations for posts
 */

const express = require('express');
const router = express.Router();
const db = require('./db'); // SQLite database connection
const auth = require('./auth-middleware');
const { io } = require('./socket-server');

/**
 * Get posts for home feed with pagination
 * GET /api/posts/feed?page=1&limit=10
 */
router.get('/posts/feed', auth.verifyToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const userId = req.user.id;
        
        // Get posts with all related data using joins
        // This is a simplified version, in production you'd add more filters
        const posts = await db.all(`
            SELECT 
                p.id, p.content, p.visibility, p.created_at,
                u.id as user_id, u.username, u.avatar_url, u.role,
                (SELECT COUNT(*) FROM post_interests WHERE post_id = p.id) AS interest_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
                (SELECT COUNT(*) FROM post_interests WHERE post_id = p.id AND user_id = ?) AS user_interested
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE 
                p.is_archived = 0 
                AND (p.visibility = 'public' OR p.user_id = ?)
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [userId, userId, limit, offset]);
        
        // For each post, get images, tags, and recent comments
        for (const post of posts) {
            // Get images
            post.images = await db.all(`
                SELECT image_url FROM post_images WHERE post_id = ?
            `, [post.id]);
            
            // Get tags
            post.tags = await db.all(`
                SELECT tag_text FROM post_tags WHERE post_id = ?
            `, [post.id]);
            
            // Get recent comments (limit to 2)
            post.comments = await db.all(`
                SELECT 
                    c.id, c.content, c.created_at,
                    u.id as user_id, u.username, u.avatar_url
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at DESC
                LIMIT 2
            `, [post.id]);
            
            // Format data for client
            post.user = {
                id: post.user_id,
                username: post.username,
                avatar: post.avatar_url,
                role: post.role
            };
            
            post.interestedCount = post.interest_count;
            post.commentCount = post.comment_count;
            post.userInterested = post.user_interested > 0;
            
            // Clean up redundant data
            delete post.user_id;
            delete post.username;
            delete post.avatar_url;
            delete post.role;
            delete post.interest_count;
            delete post.comment_count;
            delete post.user_interested;
        }
        
        res.json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                hasMore: posts.length === limit
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts',
            error: error.message
        });
    }
});

/**
 * Create a new post
 * POST /api/posts
 */
router.post('/posts', auth.verifyToken, async (req, res) => {
    try {
        const { content, visibility = 'public', tags = [], images = [] } = req.body;
        const userId = req.user.id;
        
        // Validate input
        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Post content cannot be empty'
            });
        }
        
        // Begin transaction
        await db.run('BEGIN TRANSACTION');
        
        // Insert post
        const postResult = await db.run(`
            INSERT INTO posts (user_id, content, visibility, created_at, updated_at)
            VALUES (?, ?, ?, datetime('now'), datetime('now'))
        `, [userId, content, visibility]);
        
        const postId = postResult.lastID;
        
        // Insert tags
        if (tags.length > 0) {
            const tagValues = tags.map(tag => `(${postId}, '${tag}')`).join(', ');
            await db.run(`
                INSERT INTO post_tags (post_id, tag_text)
                VALUES ${tagValues}
            `);
        }
        
        // Insert images
        if (images.length > 0) {
            for (const imageUrl of images) {
                // Extract public_id from Cloudinary URL
                const urlParts = imageUrl.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const publicId = fileName.split('.')[0];
                
                await db.run(`
                    INSERT INTO post_images (post_id, image_url, public_id)
                    VALUES (?, ?, ?)
                `, [postId, imageUrl, publicId]);
            }
        }
        
        // Commit transaction
        await db.run('COMMIT');
        
        // Get the full post with user info to return
        const post = await db.get(`
            SELECT 
                p.id, p.content, p.visibility, p.created_at,
                u.id as user_id, u.username, u.avatar_url, u.role
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [postId]);
        
        post.user = {
            id: post.user_id,
            username: post.username,
            avatar: post.avatar_url,
            role: post.role
        };
        
        post.images = images;
        post.tags = tags;
        post.interestedCount = 0;
        post.commentCount = 0;
        post.userInterested = false;
        post.comments = [];
        
        // Clean up redundant data
        delete post.user_id;
        delete post.username;
        delete post.avatar_url;
        delete post.role;
        
        res.status(201).json({
            success: true,
            post
        });
    } catch (error) {
        // Rollback transaction on error
        await db.run('ROLLBACK');
        
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: error.message
        });
    }
});

/**
 * Toggle interest in a post
 * PUT /api/posts/:postId/interest
 */
router.put('/posts/:postId/interest', auth.verifyToken, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.id;
        const { interested } = req.body;
        
        // Check if post exists
        const post = await db.get('SELECT * FROM posts WHERE id = ?', [postId]);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Check current interest status
        const existingInterest = await db.get(
            'SELECT * FROM post_interests WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );
        
        if (interested && !existingInterest) {
            // Add interest
            await db.run(
                'INSERT INTO post_interests (post_id, user_id, created_at) VALUES (?, ?, datetime("now"))',
                [postId, userId]
            );
            
            // Send real-time notification to post owner
            if (post.user_id !== userId) {
                const user = await db.get('SELECT username FROM users WHERE id = ?', [userId]);
                io.to(`user_${post.user_id}`).emit('post_interest', {
                    postId,
                    userId,
                    username: user.username
                });
            }
        } else if (!interested && existingInterest) {
            // Remove interest
            await db.run(
                'DELETE FROM post_interests WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
        }
        
        // Get updated interest count
        const interestCount = await db.get(
            'SELECT COUNT(*) as count FROM post_interests WHERE post_id = ?',
            [postId]
        );
        
        res.json({
            success: true,
            interested,
            interestCount: interestCount.count
        });
    } catch (error) {
        console.error('Error updating interest:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating interest',
            error: error.message
        });
    }
});

/**
 * Add comment to a post
 * POST /api/posts/:postId/comments
 */
router.post('/posts/:postId/comments', auth.verifyToken, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.id;
        const { text } = req.body;
        
        // Validate input
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text cannot be empty'
            });
        }
        
        // Check if post exists
        const post = await db.get('SELECT * FROM posts WHERE id = ?', [postId]);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Insert comment
        const result = await db.run(
            'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, datetime("now"))',
            [postId, userId, text]
        );
        
        const commentId = result.lastID;
        
        // Get comment with user info
        const comment = await db.get(`
            SELECT 
                c.id, c.content, c.created_at,
                u.id as user_id, u.username, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [commentId]);
        
        // Format comment for response
        const formattedComment = {
            id: comment.id,
            content: comment.content,
            timestamp: comment.created_at,
            user: {
                id: comment.user_id,
                username: comment.username,
                avatar: comment.avatar_url
            }
        };
        
        // Send real-time notification to post owner
        if (post.user_id !== userId) {
            const user = await db.get('SELECT username FROM users WHERE id = ?', [userId]);
            io.to(`user_${post.user_id}`).emit('new_comment', {
                postId,
                userId,
                username: user.username,
                comment: formattedComment
            });
        }
        
        res.status(201).json({
            success: true,
            comment: formattedComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
});

// ...More API routes for other post operations...

module.exports = router;
