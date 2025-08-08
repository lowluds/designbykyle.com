/**
 * Fixed G2Own Featured Games Carousel
 * - Shows 1 card at a time
 * - Auto-advance every 4 seconds
 * - Left/Right navigation buttons
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
            this.createNavigation();
            this.createPagination();
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
    
    createCarouselStructure() {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create carousel wrapper
        this.container.innerHTML = `
            <div class="carousel-wrapper">
                <div class="carousel-track">
                    ${this.games.map((game, index) => `
                        <div class="carousel-slide" data-index="${index}">
                            ${game.element.outerHTML}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Navigation Buttons -->
                <button class="carousel-nav carousel-prev" aria-label="Previous game">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <button class="carousel-nav carousel-next" aria-label="Next game">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <!-- Pagination Dots -->
                <div class="carousel-pagination">
                    ${this.games.map((_, index) => `
                        <button class="pagination-dot" data-index="${index}" aria-label="Go to game ${index + 1}"></button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Get references to new elements
        this.track = this.container.querySelector('.carousel-track');
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        this.pagination = this.container.querySelector('.carousel-pagination');
        this.dots = this.container.querySelectorAll('.pagination-dot');
        
        console.log('🏗️ Carousel structure created');
    }
    
    createNavigation() {
        // Add carousel-specific styles
        const carouselStyles = document.createElement('style');
        carouselStyles.id = 'featured-carousel-styles';
        carouselStyles.textContent = `
            /* Featured Games Carousel Styles */
            .featured-games .game-grid {
                position: relative;
                overflow: hidden;
                border-radius: 16px;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
            }
            
            .carousel-wrapper {
                position: relative;
                width: 100%;
                height: 450px;
                overflow: hidden;
            }
            
            .carousel-track {
                display: flex;
                width: ${this.games.length * 100}%;
                height: 100%;
                transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .carousel-slide {
                width: ${100 / this.games.length}%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .carousel-slide .game-card {
                width: 100%;
                max-width: 350px;
                height: 400px;
                margin: 0 auto;
                transform: scale(0.95);
                opacity: 0.7;
                transition: all 0.4s ease;
            }
            
            .carousel-slide.active .game-card {
                transform: scale(1);
                opacity: 1;
            }
            
            /* Navigation Buttons */
            .carousel-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 50px;
                height: 50px;
                background: rgba(239, 68, 68, 0.9);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            }
            
            .carousel-nav:hover {
                background: rgba(239, 68, 68, 1);
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            }
            
            .carousel-prev {
                left: 20px;
            }
            
            .carousel-next {
                right: 20px;
            }
            
            /* Pagination Dots */
            .carousel-pagination {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 10px;
                z-index: 10;
            }
            
            .pagination-dot {
                width: 12px;
                height: 12px;
                border: none;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .pagination-dot:hover {
                background: rgba(255, 255, 255, 0.6);
                transform: scale(1.2);
            }
            
            .pagination-dot.active {
                background: #ef4444;
                transform: scale(1.3);
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
            }
            
            /* Auto-advance indicator */
            .carousel-wrapper::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: linear-gradient(90deg, #ef4444, #dc2626);
                z-index: 15;
                transition: width ${this.autoAdvanceInterval}ms linear;
            }
            
            .carousel-wrapper.auto-advancing::before {
                width: 100%;
            }
            
            .carousel-wrapper.user-interacting::before {
                width: 0%;
                transition: width 0.3s ease;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .carousel-wrapper {
                    height: 380px;
                }
                
                .carousel-nav {
                    width: 40px;
                    height: 40px;
                }
                
                .carousel-prev {
                    left: 10px;
                }
                
                .carousel-next {
                    right: 10px;
                }
                
                .pagination-dot {
                    width: 10px;
                    height: 10px;
                }
            }
            
            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .carousel-track,
                .carousel-slide .game-card,
                .carousel-nav,
                .pagination-dot {
                    transition-duration: 0.1s;
                }
                
                .carousel-wrapper::before {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(carouselStyles);
        console.log('🎨 Carousel styles added');
    }
    
    createPagination() {
        // Pagination dots are created in createCarouselStructure
        console.log('📍 Pagination created with', this.dots.length, 'dots');
    }
    
    setupEventListeners() {
        // Previous button
        this.prevBtn.addEventListener('click', () => {
            this.onUserInteraction();
            this.prevSlide();
        });
        
        // Next button
        this.nextBtn.addEventListener('click', () => {
            this.onUserInteraction();
            this.nextSlide();
        });
        
        // Pagination dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.onUserInteraction();
                this.goToSlide(index);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.onUserInteraction();
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                this.onUserInteraction();
                this.nextSlide();
            }
        });
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoAdvance();
        });
        
        this.container.addEventListener('mouseleave', () => {
            if (!this.isUserInteracting) {
                this.startAutoAdvance();
            }
        });
        
        console.log('👂 Carousel event listeners setup');
    }
    
    showCard(index) {
        // Ensure index is within bounds
        this.currentIndex = ((index % this.games.length) + this.games.length) % this.games.length;
        
        // Update track position
        const translateX = -this.currentIndex * (100 / this.games.length);
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update active states
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentIndex);
        });
        
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
        
        console.log('🎯 Showing card', this.currentIndex + 1, 'of', this.games.length);
    }
    
    nextSlide() {
        this.showCard(this.currentIndex + 1);
    }
    
    prevSlide() {
        this.showCard(this.currentIndex - 1);
    }
    
    goToSlide(index) {
        this.showCard(index);
    }
    
    startAutoAdvance() {
        this.pauseAutoAdvance(); // Clear any existing timer
        
        this.autoAdvanceTimer = setInterval(() => {
            if (!this.isUserInteracting) {
                this.nextSlide();
            }
        }, this.autoAdvanceInterval);
        
        // Add visual indicator
        const wrapper = this.container.querySelector('.carousel-wrapper');
        if (wrapper) {
            wrapper.classList.add('auto-advancing');
            wrapper.classList.remove('user-interacting');
        }
        
        console.log('▶️ Auto-advance started');
    }
    
    pauseAutoAdvance() {
        if (this.autoAdvanceTimer) {
            clearInterval(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        
        // Remove visual indicator
        const wrapper = this.container.querySelector('.carousel-wrapper');
        if (wrapper) {
            wrapper.classList.remove('auto-advancing');
        }
        
        console.log('⏸️ Auto-advance paused');
    }
    
    onUserInteraction() {
        this.isUserInteracting = true;
        this.pauseAutoAdvance();
        
        // Add visual indicator
        const wrapper = this.container.querySelector('.carousel-wrapper');
        if (wrapper) {
            wrapper.classList.add('user-interacting');
        }
        
        // Clear previous timer
        if (this.userInteractionTimer) {
            clearTimeout(this.userInteractionTimer);
        }
        
        // Resume auto-advance after inactivity
        this.userInteractionTimer = setTimeout(() => {
            this.isUserInteracting = false;
            this.startAutoAdvance();
            console.log('🔄 Auto-advance resumed after user inactivity');
        }, this.userInactivityDelay);
        
        console.log('👆 User interaction detected, auto-advance paused');
    }
    
    destroy() {
        console.log('🧹 Cleaning up featured carousel');
        
        this.pauseAutoAdvance();
        
        if (this.userInteractionTimer) {
            clearTimeout(this.userInteractionTimer);
        }
        
        const styles = document.getElementById('featured-carousel-styles');
        if (styles) {
            styles.remove();
        }
        
        // Remove event listeners would go here if needed
    }
    
    // Public methods for external control
    pause() {
        this.onUserInteraction();
    }
    
    resume() {
        this.isUserInteracting = false;
        this.startAutoAdvance();
    }
    
    getCurrentIndex() {
        return this.currentIndex;
    }
    
    getTotalSlides() {
        return this.games.length;
    }
    
    getDebugInfo() {
        return {
            currentIndex: this.currentIndex,
            totalGames: this.games.length,
            isAutoAdvancing: !!this.autoAdvanceTimer,
            isUserInteracting: this.isUserInteracting,
            autoAdvanceInterval: this.autoAdvanceInterval,
            userInactivityDelay: this.userInactivityDelay
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing G2Own Featured Carousel');
    
    setTimeout(() => {
        try {
            // Clean up any existing carousel
            if (window.featuredCarousel && typeof window.featuredCarousel.destroy === 'function') {
                window.featuredCarousel.destroy();
            }
            
            window.featuredCarousel = new G2OwnFeaturedCarousel();
            
            // Debug function
            window.debugCarousel = () => console.log(window.featuredCarousel.getDebugInfo());
            
            console.log('✅ G2Own Featured Carousel initialized successfully');
            console.log('💡 Type "debugCarousel()" in console for debug info');
            
        } catch (error) {
            console.error('❌ Failed to initialize featured carousel:', error);
        }
    }, 1000); // Wait for other scripts to load
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2OwnFeaturedCarousel;
}
