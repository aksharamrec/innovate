/**
 * Communities page functionality for the Innovate platform
 */

document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    initTabNavigation();
    
    // Community search and filtering
    initSearchAndFilter();
    
    // Initialize animations
    initAnimations();
    
    // Initialize community actions
    initCommunityActions();
    
    // Initialize avatar upload preview
    initAvatarUpload();
});

/**
 * Initialize tab navigation functionality
 */
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Store the active tab in session storage
            sessionStorage.setItem('activeCommunitiesTab', tabId);
        });
    });
    
    // Check if there's a stored active tab
    const activeTab = sessionStorage.getItem('activeCommunitiesTab');
    if (activeTab) {
        const activeButton = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
        if (activeButton) activeButton.click();
    } else {
        // Set the first tab as active by default
        if (tabButtons.length > 0) tabButtons[0].click();
    }
}

/**
 * Initialize search and filter functionality
 */
function initSearchAndFilter() {
    const searchInput = document.querySelector('.search-container input');
    const categorySelect = document.querySelector('#category-filter');
    const sortSelect = document.querySelector('#sort-filter');
    const communityCards = document.querySelectorAll('.community-card:not(.joined)');
    
    // Combined search and filter function
    function filterCommunities() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        
        communityCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('.community-description')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.community-tag')).map(tag => tag.textContent.toLowerCase());
            
            // Check if card matches search term
            const matchesSearch = title.includes(searchTerm) || 
                                description.includes(searchTerm) || 
                                tags.some(tag => tag.includes(searchTerm));
            
            // Check if card matches selected category
            const matchesCategory = selectedCategory === 'all' || 
                                    tags.includes(selectedCategory.toLowerCase());
            
            // Show/hide card based on filters
            card.style.display = (matchesSearch && matchesCategory) ? 'flex' : 'none';
        });
    }
    
    // Apply sorting
    function sortCommunities() {
        const sortOption = sortSelect.value;
        const communityGrid = document.querySelector('.communities-grid');
        const cards = Array.from(communityCards);
        
        switch (sortOption) {
            case 'newest':
                cards.sort((a, b) => {
                    const dateA = new Date(a.dataset.createdAt || 0);
                    const dateB = new Date(b.dataset.createdAt || 0);
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                cards.sort((a, b) => {
                    const dateA = new Date(a.dataset.createdAt || 0);
                    const dateB = new Date(b.dataset.createdAt || 0);
                    return dateA - dateB;
                });
                break;
            case 'alphabetical':
                cards.sort((a, b) => {
                    const titleA = a.querySelector('h3').textContent;
                    const titleB = b.querySelector('h3').textContent;
                    return titleA.localeCompare(titleB);
                });
                break;
            case 'members':
                cards.sort((a, b) => {
                    const membersA = parseInt(a.dataset.members || 0);
                    const membersB = parseInt(b.dataset.members || 0);
                    return membersB - membersA;
                });
                break;
            case 'activity':
                cards.sort((a, b) => {
                    const activityA = parseInt(a.dataset.activity || 0);
                    const activityB = parseInt(b.dataset.activity || 0);
                    return activityB - activityA;
                });
                break;
        }
        
        // Reorder DOM elements
        cards.forEach(card => communityGrid.appendChild(card));
    }
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterCommunities);
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', filterCommunities);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', sortCommunities);
    }
}

/**
 * Initialize animations for community cards
 */
function initAnimations() {
    const communityCards = document.querySelectorAll('.communities-grid .community-card');
    
    // Set animation order for cards
    communityCards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
    });
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Observe each card
    communityCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * Initialize community action buttons
 */
function initCommunityActions() {
    // Join community buttons
    const joinButtons = document.querySelectorAll('.btn-join');
    joinButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const communityId = this.closest('.community-card').dataset.id;
            
            // Show loading state
            this.classList.add('loading');
            this.textContent = 'Joining...';
            
            // Simulate API call
            setTimeout(() => {
                // Success state
                this.classList.remove('loading');
                this.classList.remove('btn-primary');
                this.classList.add('btn-success');
                this.textContent = 'Joined';
                
                // Redirect to community page after a short delay
                setTimeout(() => {
                    window.location.href = `/community/${communityId}`;
                }, 1000);
            }, 1500);
        });
    });
    
    // Leave community buttons
    const leaveButtons = document.querySelectorAll('.btn-leave');
    leaveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.community-card');
            const communityName = card.querySelector('h3').textContent;
            
            // Show confirmation modal
            if (confirm(`Are you sure you want to leave ${communityName}?`)) {
                // Show loading state
                this.classList.add('loading');
                this.textContent = 'Leaving...';
                
                // Simulate API call
                setTimeout(() => {
                    // Remove the card with animation
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        card.remove();
                        
                        // If no communities left, show empty state
                        const remainingCards = document.querySelectorAll('.community-card.joined');
                        if (remainingCards.length === 0) {
                            const emptyState = document.createElement('div');
                            emptyState.className = 'no-communities';
                            emptyState.innerHTML = `
                                <i class="fas fa-users-slash"></i>
                                <h3>No Communities Yet</h3>
                                <p>You haven't joined any communities yet. Explore and find communities that interest you.</p>
                                <button class="btn btn-primary" onclick="document.querySelector('.tab-btn[data-tab=\'explore\']').click()">Explore Communities</button>
                            `;
                            document.querySelector('#my-communities').appendChild(emptyState);
                        }
                    }, 300);
                }, 1000);
            }
        });
    });
    
    // Handle invite response buttons
    const acceptButtons = document.querySelectorAll('.btn-accept-invite');
    const declineButtons = document.querySelectorAll('.btn-decline-invite');
    
    acceptButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inviteCard = this.closest('.invite-card');
            handleInviteResponse(inviteCard, true);
        });
    });
    
    declineButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inviteCard = this.closest('.invite-card');
            handleInviteResponse(inviteCard, false);
        });
    });
    
    function handleInviteResponse(inviteCard, accepted) {
        // Disable buttons
        const buttons = inviteCard.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        // Show loading animation
        inviteCard.classList.add('processing');
        
        // Simulate API call
        setTimeout(() => {
            // Fade out the card
            inviteCard.style.opacity = '0';
            inviteCard.style.height = '0';
            inviteCard.style.margin = '0';
            inviteCard.style.padding = '0';
            
            setTimeout(() => {
                inviteCard.remove();
                
                // Update badge count
                const inviteBadge = document.querySelector('.tab-btn[data-tab="invites"] .badge');
                if (inviteBadge) {
                    const currentCount = parseInt(inviteBadge.textContent);
                    inviteBadge.textContent = Math.max(0, currentCount - 1).toString();
                    
                    if (currentCount - 1 <= 0) {
                        inviteBadge.style.display = 'none';
                    }
                }
                
                // Show empty state if no more invites
                const remainingInvites = document.querySelectorAll('.invite-card');
                if (remainingInvites.length === 0) {
                    const emptyState = document.createElement('div');
                    emptyState.className = 'no-invites';
                    emptyState.innerHTML = `
                        <i class="fas fa-envelope-open"></i>
                        <h3>No Pending Invites</h3>
                        <p>You don't have any community invites at the moment.</p>
                    `;
                    document.querySelector('#invites').appendChild(emptyState);
                }
                
                // If accepted, add to my communities tab
                if (accepted) {
                    // This would typically be handled by the server response
                    // and page refresh, but for demo purposes we could update the UI
                    document.querySelector('.tab-btn[data-tab="my-communities"]').click();
                }
            }, 300);
        }, 800);
    }
}

/**
 * Initialize avatar upload preview functionality
 */
function initAvatarUpload() {
    const avatarInput = document.querySelector('#community-avatar');
    const avatarPreview = document.querySelector('.avatar-preview > div');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    avatarPreview.style.backgroundImage = `url(${e.target.result})`;
                }
                
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Handle "Load More" functionality
 */
document.querySelector('.load-more button')?.addEventListener('click', function() {
    this.textContent = 'Loading...';
    this.disabled = true;
    
    // Simulate loading more communities
    setTimeout(() => {
        // This would typically fetch more communities from the server
        // For demo purposes, we'll create new cards programmatically
        const communityGrid = document.querySelector('.communities-grid');
        
        // Example data for new communities
        const newCommunities = [
            {
                name: 'AI Research Group',
                description: 'Discussing latest advances in artificial intelligence and machine learning research',
                members: 1342,
                tags: ['Technology', 'Research', 'AI'],
                activity: 'high',
                avatar: 'https://via.placeholder.com/80?text=AI'
            },
            {
                name: 'Sustainable Living',
                description: 'Sharing tips and ideas for environmentally conscious living',
                members: 984,
                tags: ['Environment', 'Lifestyle'],
                activity: 'medium',
                avatar: 'https://via.placeholder.com/80?text=ECO'
            },
            {
                name: 'Digital Marketing Pros',
                description: 'Strategies and discussions for digital marketing professionals',
                members: 1567,
                tags: ['Marketing', 'Business'],
                activity: 'high',
                avatar: 'https://via.placeholder.com/80?text=MKT'
            }
        ];
        
        // Create new community cards
        newCommunities.forEach((community, index) => {
            const card = document.createElement('div');
            card.className = 'community-card';
            card.dataset.animationOrder = document.querySelectorAll('.community-card').length + index;
            
            const activityIconClass = community.activity === 'high' ? 'fas fa-bolt' : 
                                    community.activity === 'medium' ? 'fas fa-fire' : 'fas fa-clock';
            
            const tagsHtml = community.tags.map(tag => `<span class="community-tag">${tag}</span>`).join('');
            
            card.innerHTML = `
                <img src="${community.avatar}" alt="${community.name}" class="community-avatar">
                <h3>${community.name}</h3>
                <div class="community-stats">${community.members.toLocaleString()} members</div>
                <div class="activity-indicator ${community.activity}">
                    <i class="${activityIconClass}"></i>
                    <span>${community.activity.charAt(0).toUpperCase() + community.activity.slice(1)} activity</span>
                </div>
                <div class="community-tags">${tagsHtml}</div>
                <p class="community-description">${community.description}</p>
                <a href="#" class="btn btn-primary btn-join">Join Community</a>
            `;
            
            communityGrid.appendChild(card);
        });
        
        // Reinitialize animations for new cards
        initAnimations();
        
        // Re-enable the load more button
        this.textContent = 'Load More';
        this.disabled = false;
    }, 1500);
});
