/**
 * Simple redirect handler for common URL errors
 */
(function() {
    // List of URLs that should be redirected to the home page
    const redirectPaths = [
        '/posts.html',
        '/home.html',
        '/messages.html',
        '/profile.html',
        '/emergency-post.html',
        '/emergency.html',
        '/connection-test.html',
        '/plain-post.html',
        '/post-diagnostics.html',
        '/simplified-home.html',
        '/create-post.html',
        '/modern-home.html',
        '/direct-post.html',
        '/last-resort-post.html',
        '/html/connection-test.html',
        '/html/create-post.html',
        '/html/direct-post.html',
        '/html/emergency-post.html',
        '/html/emergency.html',
        '/html/last-resort-post.html',
        '/html/modern-home.html',
        '/html/plain-post.html',
        '/html/post-diagnostics.html',
        '/html/posts.html',
        '/html/simplified-home.html'
    ];
    
    // Current path
    const currentPath = window.location.pathname;
    
    // Check if current path matches one of our redirect paths
    for (const path of redirectPaths) {
        if (currentPath === path) {
            // Redirect to the home page
            const homePath = '/html/home.html';
            console.log(`Page no longer exists. Redirecting from ${currentPath} to ${homePath}`);
            window.location.href = homePath;
            break;
        }
    }
})();
