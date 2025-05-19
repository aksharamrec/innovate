/**
 * Authentication JavaScript for Innovate platform
 * Handles login and registration functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Setup login form
    setupLoginForm();
    
    // Setup registration form
    setupRegistrationForm();
    
    // Setup password visibility toggle
    setupPasswordToggles();
    
    // Setup forgot password modal
    setupForgotPassword();
    
    // Check if user is already logged in
    checkAuthStatus();
});

/**
 * Check if user is already logged in
 */
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        // Redirect to home page if already logged in
        window.location.href = 'home.html';
    }
}

/**
 * Setup login form submission
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember')?.checked;
        const errorElement = document.getElementById('login-error');
        
        // Validate form data
        if (!email || !password) {
            errorElement.textContent = 'Please enter both email and password';
            return;
        }
        
        // Clear any previous errors
        errorElement.textContent = '';
        
        try {
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Signing In...';
            
            // In a production environment, this would be an API call
            // const response = await fetch('/api/auth/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ email, password, rememberMe })
            // });
            // const data = await response.json();
            
            // Simulate API call
            const data = await simulateLogin(email, password);
            
            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to home page
            window.location.href = 'home.html';
        } catch (error) {
            // Display error message
            errorElement.textContent = error.message || 'Failed to sign in. Please check your credentials.';
            
            // Reset button
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

/**
 * Setup registration form submission
 */
function setupRegistrationForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms')?.checked;
        const errorElement = document.getElementById('register-error');
        
        // Validate form data
        if (!fullName || !email || !password) {
            errorElement.textContent = 'Please fill in all required fields';
            return;
        }
        
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }
        
        if (!agreeTerms) {
            errorElement.textContent = 'You must agree to the terms and privacy policy';
            return;
        }
        
        // Password strength validation
        if (password.length < 8) {
            errorElement.textContent = 'Password must be at least 8 characters long';
            return;
        }
        
        // Clear any previous errors
        errorElement.textContent = '';
        
        try {
            // Show loading state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';
            
            // In a production environment, this would be an API call
            // const response = await fetch('/api/auth/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ fullName, email, password })
            // });
            // const data = await response.json();
            
            // Simulate API call
            const data = await simulateRegister(fullName, email, password);
            
            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to onboarding or home page
            window.location.href = 'onboarding.html';
        } catch (error) {
            // Display error message
            errorElement.textContent = error.message || 'Failed to create account. Please try again.';
            
            // Reset button
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

/**
 * Setup password visibility toggles
 */
function setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * Setup forgot password functionality
 */
function setupForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeModalBtn = forgotPasswordModal?.querySelector('.close-modal');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    if (!forgotPasswordLink || !forgotPasswordModal) return;
    
    // Open modal
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.classList.add('active');
    });
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            forgotPasswordModal.classList.remove('active');
        });
    }
    
    // Close when clicking outside modal content
    forgotPasswordModal.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.classList.remove('active');
        }
    });
    
    // Handle form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('reset-email').value;
            const errorElement = document.getElementById('reset-error');
            
            if (!email) {
                errorElement.textContent = 'Please enter your email address';
                return;
            }
            
            errorElement.textContent = '';
            
            try {
                // Show loading state
                const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
                
                // In a production environment, this would be an API call
                // const response = await fetch('/api/auth/reset-password', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json'
                //     },
                //     body: JSON.stringify({ email })
                // });
                // const data = await response.json();
                
                // Simulate API call
                await simulatePasswordReset(email);
                
                // Show success message
                forgotPasswordForm.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h4>Reset Link Sent!</h4>
                        <p>We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.</p>
                    </div>
                `;
            } catch (error) {
                // Display error message
                errorElement.textContent = error.message || 'Failed to send reset link. Please try again.';
                
                // Reset button
                const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
}

/**
 * Simulate login API call
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login response with token and user data
 */
async function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // For demo purposes, accept any email with a valid format and any non-empty password
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                reject(new Error('Please enter a valid email address'));
                return;
            }
            
            if (password.length < 6) {
                reject(new Error('Password is incorrect'));
                return;
            }
            
            // Generate mock user data
            const username = email.split('@')[0];
            
            resolve({
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: Date.now().toString(),
                    email,
                    username,
                    avatar: 'assets/images/avatars/default.png',
                    fullName: username.charAt(0).toUpperCase() + username.slice(1),
                    bio: '',
                    role: 'user'
                }
            });
        }, 1000);
    });
}

/**
 * Simulate register API call
 * @param {string} fullName - User's full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Registration response with token and user data
 */
async function simulateRegister(fullName, email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // For demo purposes, accept any valid inputs
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                reject(new Error('Please enter a valid email address'));
                return;
            }
            
            // Generate username from email
            const username = email.split('@')[0];
            
            resolve({
                success: true,
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                    id: Date.now().toString(),
                    email,
                    username,
                    fullName,
                    avatar: 'assets/images/avatars/default.png',
                    bio: '',
                    role: 'user'
                }
            });
        }, 1500);
    });
}

/**
 * Simulate password reset API call
 * @param {string} email - User email
 * @returns {Promise} Password reset response
 */
async function simulatePasswordReset(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                reject(new Error('Please enter a valid email address'));
                return;
            }
            
            resolve({
                success: true,
                message: 'Password reset email sent'
            });
        }, 2000);
    });
}
