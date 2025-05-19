/**
 * Cloudinary integration service for the Innovate platform
 * Handles image and video uploads for posts and user content
 */

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'innovate',
    uploadPreset: 'innovate_posts',
    apiKey: 'your_cloudinary_api_key' // Would be stored in environment variables in production
};

/**
 * Upload single file to Cloudinary
 * @param {File} file - File object to upload
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<Object>} Cloudinary response with secure_url
 */
async function uploadToCloudinary(file, folder = 'posts') {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', folder);
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to upload to Cloudinary');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

/**
 * Upload multiple files to Cloudinary
 * @param {Array<File>} files - Array of File objects
 * @param {string} folder - Optional folder path in Cloudinary
 * @returns {Promise<Array<Object>>} Array of Cloudinary responses
 */
async function uploadMultipleToCloudinary(files, folder = 'posts') {
    try {
        const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Multiple Cloudinary upload error:', error);
        throw error;
    }
}

/**
 * Delete file from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id of the resource
 * @returns {Promise<Object>} Deletion response
 */
async function deleteFromCloudinary(publicId) {
    try {
        // In a production environment, this would typically be handled by a server endpoint
        // that would authenticate with Cloudinary using API secret
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/delete_by_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    public_id: publicId,
                    api_key: CLOUDINARY_CONFIG.apiKey,
                    // In a real implementation, signature would be calculated on the server
                    // timestamp and signature are omitted here as this is just for illustration
                })
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to delete from Cloudinary');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
}

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string} public_id of the resource
 */
function getPublicIdFromUrl(url) {
    // Extract public_id from URL like:
    // https://res.cloudinary.com/innovate/image/upload/v1234567890/posts/abc123.jpg
    const regex = /\/v\d+\/(.+)\./;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Export functions for use in other modules
export {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    getPublicIdFromUrl
};
