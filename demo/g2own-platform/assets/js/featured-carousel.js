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
            this.addCarouselStyles();
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
        
        // Create single-card carousel wrapper
        this.container.innerHTML = `
            <div class="single-card-carousel">
                <div class="carousel-viewport">
                    <div class="carousel-slides">
                        ${this.games.map((game, index) => `
                            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                                ${game.element.outerHTML}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Enhanced Navigation Buttons -->
                <button class="carousel-nav carousel-prev" aria-label="Previous game">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <button class="carousel-nav carousel-next" aria-label="Next game">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
      
    addCarouselStyles() {
        // Remove existing carousel styles
        const existingStyles = document.getElementById('featured-carousel-styles');
        if (existingStyles) {
            existingStyles.remove();
        }
        
        // Add new carousel-specific styles
        const carouselStyles = document.createElement('style');
        carouselStyles.id = 'featured-carousel-styles';
        carouselStyles.textContent = `
            /* Featured Games Section Styles */
            .featured-games-section {
                margin: 40px 0;
                padding: 0 20px;
            }
            
            .featured-games-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .featured-title {
                font-size: 2.5rem;
                font-weight: 700;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 10px;
            }
            
            .featured-subtitle {
                color: rgba(255, 255, 255, 0.7);
                font-size: 1.1rem;
                margin: 0;
            }
            
            /* Single Card Carousel Styles */
            .featured-games .game-grid {
                position: relative;
                max-width: 400px;
                margin: 0 auto;
                border-radius: 20px;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(15px);
                padding: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            }
            
            .single-card-carousel {
                position: relative;
                width: 100%;
                height: 500px;
                overflow: hidden;
                border-radius: 16px;
            }
            
            .carousel-viewport {
                width: 100%;
                height: 100%;
                overflow: hidden;
                position: relative;
            }
            
            .carousel-slides {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .carousel-slide {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .carousel-slide.active {
                opacity: 1;
                transform: translateX(0);
                z-index: 2;
            }
            
            .carousel-slide.prev {
                transform: translateX(-100%);
                opacity: 0;
            }
            
            .carousel-slide .game-card {
                width: 100%;
                height: auto;
                max-height: 460px;
                margin: 0;
                transform: scale(1);
                opacity: 1;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            /* Enhanced Navigation Buttons */
            .carousel-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 45px;
                height: 45px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
                backdrop-filter: blur(10px);
            }
            
            .carousel-nav:hover {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                transform: translateY(-50%) scale(1.15);
                box-shadow: 0 12px 35px rgba(239, 68, 68, 0.6);
            }
            
            .carousel-nav:active {
                transform: translateY(-50%) scale(1.05);
            }
            
            .carousel-prev {
                left: -60px;
            }
            
            .carousel-next {
                right: -60px;
            }
            
            /* Enhanced Pagination Dots */
            .carousel-pagination {
                position: absolute;
                bottom: -50px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                z-index: 10;
            }
            
            .pagination-dot {
                width: 14px;
                height: 14px;
                border: none;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
            }
            
            .pagination-dot:hover {
                background: rgba(255, 255, 255, 0.6);
                transform: scale(1.2);
            }
            
            .pagination-dot.active {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                transform: scale(1.4);
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
            }
            
            .pagination-dot.active::before {
                content: '';
                position: absolute;
                top: -3px;
                left: -3px;
                right: -3px;
                bottom: -3px;
                border: 2px solid rgba(239, 68, 68, 0.3);
                border-radius: 50%;
                animation: pulse-ring 2s infinite;
            }
            
            /* Auto-advance Progress Bar */
            .auto-advance-progress {
                position: absolute;
                top: 0;
                left: 0;
                width: 0%;
                height: 4px;
                background: linear-gradient(90deg, #ef4444, #dc2626);
                z-index: 15;
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            
            .single-card-carousel.auto-advancing .auto-advance-progress {
                animation: progress-advance ${this.autoAdvanceInterval}ms linear;
            }
            
            .single-card-carousel.user-interacting .auto-advance-progress {
                width: 0%;
                animation: none;
            }
            
            /* Animations */
            @keyframes progress-advance {
                from { width: 0%; }
                to { width: 100%; }
            }
            
            @keyframes pulse-ring {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.5;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .featured-games .game-grid {
                    max-width: 350px;
                    padding: 15px;
                }
                
                .single-card-carousel {
                    height: 450px;
                }
                
                .carousel-nav {
                    width: 40px;
                    height: 40px;
                }
                
                .carousel-prev {
                    left: -50px;
                }
                
                .carousel-next {
                    right: -50px;
                }
                
                .featured-title {
                    font-size: 2rem;
                }
            }
            
            @media (max-width: 480px) {
                .carousel-prev {
                    left: 10px;
                }
                
                .carousel-next {
                    right: 10px;
                }
                
                .featured-games .game-grid {
                    max-width: 320px;
                }
            }
        `;
        
        document.head.appendChild(carouselStyles);
        console.log('🎨 Carousel styles added');
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
