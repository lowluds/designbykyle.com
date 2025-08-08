/**
 * G2Own Featured Games Carousel - Single Card Display
 * - Shows exactly 1 card at a time
 * - Auto-advance every 4 seconds
 * - Enhanced left/right navigation buttons
 * - Pagination dots
 * - Pauses on user interaction, resumes after 3 seconds of inactivity
 */

class G2OwnFeaturedCarousel {
    constructor() {
        this.container = document.querySelector('.featured-games .game-grid');
        this.games = [];
        this.currentIndex = 0;
        this.autoAdvanceTimer = null;
        this.userInteractionTimer = null;
        this.isUserInteracting = false;
        this.autoAdvanceInterval = 4000; // 4 seconds
        this.userInactivityDelay = 3000; // 3 seconds after user interaction
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('❌ Featured games carousel container not found');
            return;
        }
        
        try {
            this.collectGameCards();
            this.createCarouselStructure();
            this.setupEventListeners();
            this.startAutoAdvance();
            this.showCard(0);
            
            console.log('✅ G2Own Featured Carousel initialized with', this.games.length, 'games');
        } catch (error) {
            console.error('❌ Error initializing carousel:', error);
        }
    }
      collectGameCards() {
        // Get all existing game cards
        const gameCards = this.container.querySelectorAll('.game-card');
        this.games = Array.from(gameCards).map(card => ({
            element: card.cloneNode(true),
            title: card.querySelector('.game-title')?.textContent || 'Unknown Game',
            price: card.querySelector('.game-price')?.textContent || '$0.00'
        }));
        
        console.log('🎮 Collected', this.games.length, 'game cards');
    }
    
    extractGameContent(gameElement) {
        // Extract the image
        const imgElement = gameElement.querySelector('.game-image');
        const imgSrc = imgElement?.src || '';
        const imgAlt = imgElement?.alt || 'Game Image';
        const imgOnError = imgElement?.getAttribute('onerror') || '';
        
        // Extract the title
        const title = gameElement.querySelector('.game-title')?.textContent || 'Unknown Game';
        
        // Extract the description
        const description = gameElement.querySelector('.game-description')?.textContent || 'No description available';
        
        // Extract the price info
        const priceOld = gameElement.querySelector('.price-old')?.textContent || '';
        const priceNew = gameElement.querySelector('.game-price')?.textContent || '$0.00';
        
        // Extract rating info
        const stars = gameElement.querySelector('.stars')?.textContent || '⭐⭐⭐⭐⭐';
        const rating = gameElement.querySelector('.rating-text')?.textContent || '(5.0/5)';
        
        // Extract platform info
        const platform = gameElement.querySelector('.game-platform')?.textContent || '🎮 Multi-platform';
        
        // Extract badges
        const badges = Array.from(gameElement.querySelectorAll('.badge')).map(badge => 
            `<span class="badge ${badge.className.split(' ').slice(1).join(' ')}">${badge.textContent}</span>`
        ).join('');
        
        return `
            <div class="game-image-container">
                <img src="${imgSrc}" alt="${imgAlt}" class="game-image" ${imgOnError ? `onerror="${imgOnError}"` : ''}>
                ${badges ? `<div class="card-badges">${badges}</div>` : ''}
            </div>
            <h3 class="game-title">${title}</h3>
            <p class="game-description">${description}</p>
            <div class="game-meta">
                <div class="game-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-text">${rating}</span>
                </div>
                <div class="game-platform">${platform}</div>
            </div>
            <div class="card-footer">
                <div class="price-container">
                    ${priceOld ? `<span class="price-old">${priceOld}</span>` : ''}
                    <span class="game-price">${priceNew}</span>
                </div>
                <button class="game-button add-to-cart-btn">Add to Cart</button>
            </div>
        `;
    }
    
    createCarouselStructure() {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create single-card carousel wrapper
        this.container.innerHTML = `
            <div class="single-card-carousel">
                <div class="carousel-viewport">
                    <div class="carousel-slides">                        ${this.games.map((game, index) => `
                            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <div class="enhanced-card slide-in">
                                    <div class="enhanced-card-content">
                                        ${this.extractGameContent(game.element)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Enhanced Navigation Buttons -->
                <button class="carousel-nav carousel-prev" aria-label="Previous game">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <button class="carousel-nav carousel-next" aria-label="Next game">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <!-- Pagination Dots -->
                <div class="carousel-pagination">
                    ${this.games.map((_, index) => `
                        <button class="pagination-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to game ${index + 1}"></button>
                    `).join('')}
                </div>
                
                <!-- Auto-advance Progress Bar -->
                <div class="auto-advance-progress"></div>
            </div>
        `;
        
        // Get references to new elements
        this.viewport = this.container.querySelector('.carousel-viewport');
        this.slidesContainer = this.container.querySelector('.carousel-slides');
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.pagination = this.container.querySelector('.carousel-pagination');
        this.dots = this.container.querySelectorAll('.pagination-dot');
        this.progressBar = this.container.querySelector('.auto-advance-progress');
        
        console.log('🏗️ Single-card carousel structure created');
    }
    
    setupEventListeners() {
        // Navigation button listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.handleUserInteraction();
                this.previousCard();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.handleUserInteraction();
                this.nextCard();
            });
        }
        
        // Pagination dot listeners
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.handleUserInteraction();
                this.showCard(index);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.handleUserInteraction();
                this.previousCard();
            } else if (e.key === 'ArrowRight') {
                this.handleUserInteraction();
                this.nextCard();
            }
        });
        
        // Touch/swipe support
        let startX = 0;
        let endX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                this.handleUserInteraction();
                if (diff > 0) {
                    this.nextCard();
                } else {
                    this.previousCard();
                }
            }
        });
        
        console.log('🎯 Event listeners set up');
    }
      showCard(index) {
        if (index < 0 || index >= this.games.length) return;
        
        // Update current index
        this.currentIndex = index;
        
        // Update slides
        this.slides.forEach((slide, slideIndex) => {
            slide.classList.remove('active', 'prev');
            if (slideIndex === index) {
                slide.classList.add('active');
            } else {
                slide.classList.add('prev');
            }
        });
        
        // Update pagination dots
        this.dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
        
        // Apply gradient color for current card
        this.applyCardGradient(index);
        
        console.log(`🎮 Showing card ${index + 1}/${this.games.length}:`, this.games[index].title);
    }
    
    applyCardGradient(index) {
        const gradientColors = [
            '#8b0000', // Red - Boston Red theme
            '#0d9488', // Teal
            '#ea580c', // Orange
            '#1d4ed8', // Blue
            '#7c2d12'  // Brown
        ];
        
        const colorIndex = index % gradientColors.length;
        const color = gradientColors[colorIndex];
        
        // Apply to the active card
        const activeCard = this.slides[index]?.querySelector('.enhanced-card');
        if (activeCard) {
            activeCard.style.setProperty('--card-gradient-color', color);
        }
    }
    
    nextCard() {
        const nextIndex = (this.currentIndex + 1) % this.games.length;
        this.showCard(nextIndex);
    }
    
    previousCard() {
        const prevIndex = (this.currentIndex - 1 + this.games.length) % this.games.length;
        this.showCard(prevIndex);
    }
    
    startAutoAdvance() {
        this.stopAutoAdvance();
        
        const carouselElement = this.container.querySelector('.single-card-carousel');
        if (carouselElement) {
            carouselElement.classList.add('auto-advancing');
            carouselElement.classList.remove('user-interacting');
        }
        
        this.autoAdvanceTimer = setInterval(() => {
            if (!this.isUserInteracting) {
                this.nextCard();
            }
        }, this.autoAdvanceInterval);
        
        console.log('🔄 Auto-advance started');
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceTimer) {
            clearInterval(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        
        const carouselElement = this.container.querySelector('.single-card-carousel');
        if (carouselElement) {
            carouselElement.classList.remove('auto-advancing');
        }
        
        console.log('⏸️ Auto-advance stopped');
    }
    
    handleUserInteraction() {
        this.isUserInteracting = true;
        this.stopAutoAdvance();
        
        const carouselElement = this.container.querySelector('.single-card-carousel');
        if (carouselElement) {
            carouselElement.classList.add('user-interacting');
        }
        
        // Clear existing timer
        if (this.userInteractionTimer) {
            clearTimeout(this.userInteractionTimer);
        }
        
        // Resume auto-advance after delay
        this.userInteractionTimer = setTimeout(() => {
            this.isUserInteracting = false;
            this.startAutoAdvance();
        }, this.userInactivityDelay);
        
        console.log('👆 User interaction detected, pausing auto-advance');
    }
    
    destroy() {
        this.stopAutoAdvance();
        
        if (this.userInteractionTimer) {
            clearTimeout(this.userInteractionTimer);
        }
        
        console.log('🗑️ Carousel destroyed');
    }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all other scripts have loaded
    setTimeout(() => {
        new G2OwnFeaturedCarousel();
    }, 500);
});

// Export for potential external use
if (typeof window !== 'undefined') {
    window.G2OwnFeaturedCarousel = G2OwnFeaturedCarousel;
}
