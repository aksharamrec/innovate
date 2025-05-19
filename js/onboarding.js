/**
 * Onboarding JavaScript for new user setup
 * Handles multi-step form, avatar upload, experience management and more
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize onboarding process
    setupStepNavigation();
    setupAvatarUpload();
    setupUsernameCheck();
    setupBioCounter();
    setupSkillsInput();
    setupExperienceManager();
    setupFollowButtons();
    setupFinishAction();
    
    // Prefill information if already in localStorage
    prefillUserData();
});

/**
 * Setup navigation between onboarding steps
 */
function setupStepNavigation() {
    // Next step buttons
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = button.closest('.onboarding-step');
            const nextStepNum = button.dataset.next;
            const nextStep = document.getElementById(`step-${nextStepNum}`);
            
            // Validate current step if needed
            if (!validateStep(currentStep.id)) {
                return;
            }
            
            // Save data from current step
            saveStepData(currentStep.id);
            
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show next step
            nextStep.classList.add('active');
            
            // Update progress indicator
            updateProgressIndicator(nextStepNum);
        });
    });
    
    // Previous step buttons
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = button.closest('.onboarding-step');
            const prevStepNum = button.dataset.prev;
            const prevStep = document.getElementById(`step-${prevStepNum}`);
            
            // Save data from current step
            saveStepData(currentStep.id);
            
            // Hide current step
            currentStep.classList.remove('active');
            
            // Show previous step
            prevStep.classList.add('active');
            
            // Update progress indicator
            updateProgressIndicator(prevStepNum);
        });
    });
}

/**
 * Update progress indicator in sidebar
 */
function updateProgressIndicator(stepNumber) {
    // Remove active class from all steps
    document.querySelectorAll('.progress-steps li').forEach(step => {
        step.classList.remove('active');
        step.classList.remove('completed');
    });
    
    // Add completed class to steps before current step
    for (let i = 1; i < stepNumber; i++) {
        document.querySelector(`.progress-steps li[data-step="${i}"]`).classList.add('completed');
    }
    
    // Add active class to current step
    document.querySelector(`.progress-steps li[data-step="${stepNumber}"]`).classList.add('active');
}

/**
 * Setup avatar upload functionality
 */
function setupAvatarUpload() {
    const uploadBtn = document.getElementById('uploadAvatarBtn');
    const fileInput = document.getElementById('avatarUpload');
    const preview = document.getElementById('avatarPreview');
    
    if (uploadBtn && fileInput && preview) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    preview.style.backgroundImage = `url(${e.target.result})`;
                    
                    // Store avatar in session for later upload
                    sessionStorage.setItem('userAvatar', e.target.result);
                };
                
                reader.readAsDataURL(fileInput.files[0]);
            }
        });
    }
}

/**
 * Check username availability
 */
function setupUsernameCheck() {
    const usernameInput = document.getElementById('username');
    const availabilityIndicator = document.getElementById('usernameAvailability');
    
    if (usernameInput && availabilityIndicator) {
        let debounceTimer;
        
        usernameInput.addEventListener('input', () => {
            const username = usernameInput.value.trim();
            
            // Clear previous message
            availabilityIndicator.textContent = '';
            availabilityIndicator.className = 'form-help';
            
            // Clear previous timeout
            clearTimeout(debounceTimer);
            
            if (username.length < 3) {
                return;
            }
            
            // Show checking message
            availabilityIndicator.textContent = 'Checking availability...';
            
            // Debounce the check
            debounceTimer = setTimeout(async () => {
                try {
                    // In production: API call to check username availability
                    // const response = await fetch(`/api/check-username?username=${username}`);
                    // const data = await response.json();
                    
                    // For demo, simulate API call
                    const isAvailable = await simulateUsernameCheck(username);
                    
                    if (isAvailable) {
                        availabilityIndicator.textContent = '✓ Username is available';
                        availabilityIndicator.className = 'form-help text-success';
                    } else {
                        availabilityIndicator.textContent = '✗ Username is already taken';
                        availabilityIndicator.className = 'form-help text-error';
                    }
                } catch (error) {
                    console.error('Error checking username:', error);
                    availabilityIndicator.textContent = 'Could not check availability';
                }
            }, 500);
        });
    }
}

/**
 * Character counter for bio field
 */
function setupBioCounter() {
    const bioField = document.getElementById('bio');
    const counter = document.querySelector('.text-count');
    const MAX_LENGTH = 160;
    
    if (bioField && counter) {
        bioField.addEventListener('input', () => {
            const count = bioField.value.length;
            counter.textContent = `${count}/${MAX_LENGTH}`;
            
            if (count > MAX_LENGTH) {
                counter.classList.add('text-error');
            } else {
                counter.classList.remove('text-error');
            }
        });
    }
}

/**
 * Setup skills input with tags functionality
 */
function setupSkillsInput() {
    const skillInput = document.getElementById('skillInput');
    const skillsList = document.getElementById('skillsList');
    
    if (skillInput && skillsList) {
        const addSkill = (skill) => {
            if (!skill.trim()) return;
            
            // Check if skill already exists
            const existingSkills = Array.from(skillsList.querySelectorAll('.skill-tag span')).map(span => span.textContent.toLowerCase());
            
            if (existingSkills.includes(skill.toLowerCase())) {
                return;
            }
            
            // Create skill tag
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                <span>${skill}</span>
                <button type="button" class="remove-skill">&times;</button>
            `;
            
            // Add to DOM
            skillsList.appendChild(skillTag);
            
            // Clear input
            skillInput.value = '';
            
            // Add remove functionality
            skillTag.querySelector('.remove-skill').addEventListener('click', () => {
                skillTag.remove();
            });
        };
        
        skillInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addSkill(skillInput.value.trim());
            }
        });
        
        // Add skill when input loses focus
        skillInput.addEventListener('blur', () => {
            if (skillInput.value.trim()) {
                addSkill(skillInput.value.trim());
            }
        });
    }
}

/**
 * Setup experience manager with modal
 */
function setupExperienceManager() {
    const addBtn = document.getElementById('addExperienceBtn');
    const modal = document.getElementById('experienceModal');
    const closeBtn = modal?.querySelector('.close-modal');
    const form = document.getElementById('experienceForm');
    const experienceList = document.getElementById('experienceList');
    const currentCheckbox = document.getElementById('currentJob');
    const endDateInput = document.getElementById('endDate');
    
    if (!addBtn || !modal || !form || !experienceList) return;
    
    // Open modal
    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            form.reset();
        });
    }
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            form.reset();
        }
    });
    
    // Handle "I currently work here" checkbox
    if (currentCheckbox && endDateInput) {
        currentCheckbox.addEventListener('change', () => {
            endDateInput.disabled = currentCheckbox.checked;
            if (currentCheckbox.checked) {
                endDateInput.value = '';
            }
        });
    }
    
    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const jobTitle = document.getElementById('jobTitle').value;
        const company = document.getElementById('company').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = currentCheckbox.checked ? 'Present' : endDateInput.value;
        const description = document.getElementById('jobDescription').value;
        
        // Create experience item
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        experienceItem.innerHTML = `
            <h4>${jobTitle}</h4>
            <div class="subtitle">${company}</div>
            <div class="dates">${formatDateRange(startDate, endDate)}</div>
            ${description ? `<p>${description}</p>` : ''}
            <button type="button" class="remove-experience">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to list
        experienceList.appendChild(experienceItem);
        
        // Add remove functionality
        experienceItem.querySelector('.remove-experience').addEventListener('click', () => {
            experienceItem.remove();
        });
        
        // Close modal and reset form
        modal.classList.remove('active');
        form.reset();
    });
}

/**
 * Format date range for display
 */
function formatDateRange(startDate, endDate) {
    // Format dates like "Jan 2020 - Mar 2022" or "Jan 2020 - Present"
    const formatYearMonth = (dateString) => {
        if (dateString === 'Present') return 'Present';
        
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    };
    
    return `${formatYearMonth(startDate)} - ${formatYearMonth(endDate)}`;
}

/**
 * Setup follow buttons for suggested connections
 */
function setupFollowButtons() {
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isFollowing = btn.classList.contains('btn-primary');
            
            if (isFollowing) {
                // Unfollow
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
                btn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            } else {
                // Follow
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-outline');
                btn.innerHTML = '<i class="fas fa-check"></i> Following';
            }
        });
    });
}

/**
 * Setup finish button action
 */
function setupFinishAction() {
    const finishBtn = document.getElementById('finishOnboarding');
    
    if (finishBtn) {
        finishBtn.addEventListener('click', async () => {
            // Save all data
            saveStepData('step-4');
            
            // Show loading state
            finishBtn.disabled = true;
            finishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finishing...';
            
            try {
                // Collect all data
                const userData = collectAllUserData();
                
                // In production: API call to update user profile
                // const response = await fetch('/api/user/onboarding', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(userData)
                // });
                // const data = await response.json();
                
                // For demo, simulate API call
                await simulateProfileUpdate(userData);
                
                // Update userData in localStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, ...userData };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Redirect to home page
                window.location.href = 'home.html';
            } catch (error) {
                console.error('Error completing onboarding:', error);
                
                // Reset button state
                finishBtn.disabled = false;
                finishBtn.textContent = 'Finish';
                
                // Show error message
                alert('Failed to complete onboarding. Please try again.');
            }
        });
    }
}

/**
 * Validate step data
 */
function validateStep(stepId) {
    switch (stepId) {
        case 'step-1':
            // Display name and username are required
            const displayName = document.getElementById('displayName').value;
            const username = document.getElementById('username').value;
            
            if (!displayName.trim()) {
                alert('Please enter your display name');
                return false;
            }
            
            if (!username.trim()) {
                alert('Please choose a username');
                return false;
            }
            
            // Check if username is valid
            const usernameAvailability = document.getElementById('usernameAvailability');
            if (usernameAvailability.textContent.includes('taken')) {
                alert('Please choose a different username');
                return false;
            }
            
            return true;
            
        default:
            return true;
    }
}

/**
 * Save data from current step to session storage
 */
function saveStepData(stepId) {
    switch (stepId) {
        case 'step-1':
            sessionStorage.setItem('displayName', document.getElementById('displayName').value);
            sessionStorage.setItem('username', document.getElementById('username').value);
            sessionStorage.setItem('bio', document.getElementById('bio').value);
            sessionStorage.setItem('location', document.getElementById('location').value);
            break;
            
        case 'step-2':
            sessionStorage.setItem('headline', document.getElementById('headline').value);
            sessionStorage.setItem('industry', document.getElementById('industry').value);
            
            // Save skills
            const skills = Array.from(document.querySelectorAll('#skillsList .skill-tag span'))
                .map(span => span.textContent);
            sessionStorage.setItem('skills', JSON.stringify(skills));
            
            // Save experience
            const experience = Array.from(document.querySelectorAll('#experienceList .experience-item'))
                .map(item => {
                    return {
                        title: item.querySelector('h4').textContent,
                        company: item.querySelector('.subtitle').textContent,
                        dateRange: item.querySelector('.dates').textContent,
                        description: item.querySelector('p')?.textContent || ''
                    };
                });
            sessionStorage.setItem('experience', JSON.stringify(experience));
            break;
            
        case 'step-3':
            // Save interests
            const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                .map(input => input.value);
            sessionStorage.setItem('interests', JSON.stringify(interests));
            break;
            
        case 'step-4':
            // Save followed connections
            const connections = Array.from(document.querySelectorAll('.follow-btn.btn-primary'))
                .map(btn => {
                    const card = btn.closest('.connection-card');
                    return {
                        name: card.querySelector('h4').textContent,
                        bio: card.querySelector('p').textContent
                    };
                });
            sessionStorage.setItem('connections', JSON.stringify(connections));
            break;
    }
}

/**
 * Collect all user data from session storage
 */
function collectAllUserData() {
    return {
        displayName: sessionStorage.getItem('displayName') || '',
        username: sessionStorage.getItem('username') || '',
        bio: sessionStorage.getItem('bio') || '',
        location: sessionStorage.getItem('location') || '',
        headline: sessionStorage.getItem('headline') || '',
        industry: sessionStorage.getItem('industry') || '',
        skills: JSON.parse(sessionStorage.getItem('skills') || '[]'),
        experience: JSON.parse(sessionStorage.getItem('experience') || '[]'),
        interests: JSON.parse(sessionStorage.getItem('interests') || '[]'),
        connections: JSON.parse(sessionStorage.getItem('connections') || '[]'),
        avatar: sessionStorage.getItem('userAvatar') || null
    };
}

/**
 * Prefill user data from session storage
 */
function prefillUserData() {
    // Get user data from localStorage if available
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Prefill display name and username
    if (userData.displayName) {
        document.getElementById('displayName').value = userData.displayName;
    }
    
    if (userData.username) {
        document.getElementById('username').value = userData.username;
    }
    
    // Check if we have session data
    if (sessionStorage.getItem('displayName')) {
        document.getElementById('displayName').value = sessionStorage.getItem('displayName');
    }
    
    if (sessionStorage.getItem('username')) {
        document.getElementById('username').value = sessionStorage.getItem('username');
    }
    
    if (sessionStorage.getItem('bio')) {
        document.getElementById('bio').value = sessionStorage.getItem('bio');
        document.querySelector('.text-count').textContent = `${sessionStorage.getItem('bio').length}/160`;
    }
    
    if (sessionStorage.getItem('location')) {
        document.getElementById('location').value = sessionStorage.getItem('location');
    }
    
    // Avatar
    if (sessionStorage.getItem('userAvatar')) {
        document.getElementById('avatarPreview').style.backgroundImage = `url(${sessionStorage.getItem('userAvatar')})`;
    } else if (userData.avatar) {
        document.getElementById('avatarPreview').style.backgroundImage = `url(${userData.avatar})`;
    }
    
    // Professional info
    if (sessionStorage.getItem('headline')) {
        document.getElementById('headline').value = sessionStorage.getItem('headline');
    }
    
    if (sessionStorage.getItem('industry')) {
        document.getElementById('industry').value = sessionStorage.getItem('industry');
    }
    
    // Skills
    try {
        const skills = JSON.parse(sessionStorage.getItem('skills') || '[]');
        const skillsList = document.getElementById('skillsList');
        
        skills.forEach(skill => {
            if (!skill) return;
            
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                <span>${skill}</span>
                <button type="button" class="remove-skill">&times;</button>
            `;
            
            skillsList.appendChild(skillTag);
            
            skillTag.querySelector('.remove-skill').addEventListener('click', () => {
                skillTag.remove();
            });
        });
    } catch (e) {
        console.error('Error parsing skills:', e);
    }
    
    // Experience
    try {
        const experience = JSON.parse(sessionStorage.getItem('experience') || '[]');
        const experienceList = document.getElementById('experienceList');
        
        experience.forEach(exp => {
            const experienceItem = document.createElement('div');
            experienceItem.className = 'experience-item';
            experienceItem.innerHTML = `
                <h4>${exp.title}</h4>
                <div class="subtitle">${exp.company}</div>
                <div class="dates">${exp.dateRange}</div>
                ${exp.description ? `<p>${exp.description}</p>` : ''}
                <button type="button" class="remove-experience">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            experienceList.appendChild(experienceItem);
            
            experienceItem.querySelector('.remove-experience').addEventListener('click', () => {
                experienceItem.remove();
            });
        });
    } catch (e) {
        console.error('Error parsing experience:', e);
    }
    
    // Interests
    try {
        const interests = JSON.parse(sessionStorage.getItem('interests') || '[]');
        
        interests.forEach(interest => {
            const checkbox = document.querySelector(`input[name="interests"][value="${interest}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    } catch (e) {
        console.error('Error parsing interests:', e);
    }
}

/**
 * Simulate username availability check
 */
async function simulateUsernameCheck(username) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For demo purposes, these usernames are "taken"
            const takenUsernames = ['admin', 'user', 'test', 'innovate'];
            resolve(!takenUsernames.includes(username.toLowerCase()));
        }, 800);
    });
}

/**
 * Simulate profile update API call
 */
async function simulateProfileUpdate(userData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Profile updated with:', userData);
            resolve({ success: true });
        }, 1500);
    });
}
