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
        this.container = document.querySelector('.hero-carousel-independent .featured-games .game-grid');
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
            this.makeCarouselWider();
            this.collectGameCards();
            this.createCarouselStructure();
            this.setupEventListeners();
            this.adjustCarouselWidth(); // Initial width adjustment
            this.startAutoAdvance();
            this.showCard(0);
            
            console.log('✅ G2Own Featured Carousel initialized with', this.games.length, 'games');
        } catch (error) {
            console.error('❌ Error initializing carousel:', error);
        }
    }    makeCarouselWider() {
        // Get the independent hero carousel container
        const independentCarousel = this.container.closest('.hero-carousel-independent');
        const featuredSection = this.container.closest('.featured-games-section');
        const heroSection = document.querySelector('.hero');
        
        if (independentCarousel && heroSection) {
            // Make carousel responsive to hero section height and position
            const updateCarouselPosition = () => {
                const heroRect = heroSection.getBoundingClientRect();
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                const viewportHeight = window.innerHeight;
                
                // Position carousel higher, closer to navbar
                independentCarousel.style.cssText = `
                    position: absolute !important;
                    top: ${navbarHeight + 100}px !important;
                    right: 5% !important;
                    width: 500px !important;
                    max-width: 500px !important;
                    z-index: 10 !important;
                    pointer-events: all !important;
                    transition: all 0.3s ease !important;
                `;
            };
            
            // Initial positioning
            updateCarouselPosition();
            
            // Update position on scroll and resize for dynamic behavior
            window.addEventListener('scroll', updateCarouselPosition);
            window.addEventListener('resize', updateCarouselPosition);
            
            // Style the featured games section for independent positioning
            if (featuredSection) {
                featuredSection.style.cssText = `
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;
            }
            
            // Style the featured games container
            const featuredGames = featuredSection.querySelector('.featured-games');
            if (featuredGames) {
                featuredGames.style.cssText = `
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;
            }
            
            // Style the game grid for independent positioning
            this.container.style.cssText = `
                width: 100% !important;
                max-width: 480px !important;
                margin: 0 auto !important;
                position: relative !important;
            `;
            
            console.log('🎮 Carousel positioned dynamically closer to navbar - wider and responsive');
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
            <div class="card-header">
                <div class="card-date">Featured Game</div>
                <div class="card-menu">⋮</div>
            </div>
            <div class="game-image-container">
                <img src="${imgSrc}" alt="${imgAlt}" class="game-image" ${imgOnError ? `onerror="${imgOnError}"` : ''}>
                ${badges ? `<div class="card-badges">${badges}</div>` : ''}
            </div>
            <h3 class="game-title">${title}</h3>
            <p class="game-subtitle">${platform}</p>
            
            <div class="progress-section">
                <div class="progress-label">Popularity</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.floor(Math.random() * 60) + 40}%"></div>
                </div>
                <div class="progress-value">${Math.floor(Math.random() * 60) + 40}%</div>
            </div>
            
            <div class="card-footer">
                <div class="user-avatars">
                    <div class="avatar">🎮</div>
                    <div class="avatar">🎯</div>
                    <div class="avatar">🏆</div>
                </div>
                <div class="card-action">
                    <span class="price-text">${priceNew}</span>
                </div>
            </div>
        `;
    }
      createCarouselStructure() {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create single-card carousel wrapper with enhanced wide styling
        this.container.innerHTML = `
            <div class="single-card-carousel wide-showcase">
                <div class="carousel-viewport">
                    <div class="carousel-slides">                        ${this.games.map((game, index) => `
                            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <div class="enhanced-card slide-in wide-card">
                                    <div class="enhanced-card-content">
                                        ${this.extractGameContent(game.element)}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Enhanced Navigation Buttons -->
                <button class="carousel-nav carousel-prev wide-nav" aria-label="Previous game">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <button class="carousel-nav carousel-next wide-nav" aria-label="Next game">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <!-- Pagination Dots -->
                <div class="carousel-pagination wide-pagination">
                    ${this.games.map((_, index) => `
                        <button class="pagination-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Go to game ${index + 1}"></button>
                    `).join('')}
                </div>
                
                <!-- Auto-advance Progress Bar -->
                <div class="auto-advance-progress wide-progress"></div>
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
        
        // Apply additional wide styling
        this.applyWideCarouselStyling();
        
        console.log('🏗️ Wide showcase single-card carousel structure created');
    }    applyWideCarouselStyling() {
        const carousel = this.container.querySelector('.single-card-carousel');
        if (carousel) {
            carousel.style.cssText = `
                width: 100% !important;
                max-width: 460px !important;
                margin: 0 auto !important;
                position: relative !important;
                padding: 2rem !important;
                border-radius: 24px !important;
                background: linear-gradient(135deg, 
                    rgba(139, 0, 0, 0.12) 0%, 
                    rgba(255, 68, 68, 0.06) 50%, 
                    rgba(139, 0, 0, 0.12) 100%) !important;
                backdrop-filter: blur(20px) !important;
                border: 1px solid rgba(139, 0, 0, 0.3) !important;
                box-shadow: 
                    0 20px 40px rgba(139, 0, 0, 0.3),
                    0 8px 25px rgba(255, 68, 68, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            `;
        }
        
        // Make cards wider for the independent positioning
        const slides = this.container.querySelectorAll('.carousel-slide');
        slides.forEach(slide => {
            slide.style.cssText = `
                width: 100% !important;
                max-width: 420px !important;
                margin: 0 auto !important;
            `;
        });
        
        console.log('🎨 Independent wide carousel styling applied');
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
        
        // Responsive width adjustments
        window.addEventListener('resize', () => {
            this.adjustCarouselWidth();
        });
          console.log('🎯 Event listeners set up including responsive width adjustments');
    }    adjustCarouselWidth() {
        const carousel = this.container.querySelector('.single-card-carousel');
        const independentCarousel = this.container.closest('.hero-carousel-independent');
        const heroSection = document.querySelector('.hero');
        
        if (carousel && independentCarousel && heroSection) {
            const screenWidth = window.innerWidth;
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
            
            if (screenWidth >= 1400) {
                // Extra wide for large screens
                carousel.style.maxWidth = '500px';
                independentCarousel.style.width = '540px';
                independentCarousel.style.right = '3%';
                independentCarousel.style.top = `${navbarHeight + 80}px`;
            } else if (screenWidth >= 1200) {
                // Wide for desktop
                carousel.style.maxWidth = '460px';
                independentCarousel.style.width = '500px';
                independentCarousel.style.right = '5%';
                independentCarousel.style.top = `${navbarHeight + 100}px`;
            } else if (screenWidth >= 1024) {
                // Medium desktop
                carousel.style.maxWidth = '420px';
                independentCarousel.style.width = '460px';
                independentCarousel.style.right = '3%';
                independentCarousel.style.top = `${navbarHeight + 120}px`;
            } else {
                // Switch to relative positioning for tablets/mobile
                independentCarousel.style.position = 'relative';
                independentCarousel.style.top = 'auto';
                independentCarousel.style.right = 'auto';
                independentCarousel.style.width = '100%';
                independentCarousel.style.maxWidth = '600px';
                independentCarousel.style.margin = '3rem auto 0';
                carousel.style.maxWidth = '400px';
            }
            
            console.log(`📱 Dynamic carousel positioning adjusted for screen width: ${screenWidth}px`);
        }
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
    }    applyCardGradient(index) {
        const gradientColors = [
            { hex: '#8b0000', rgb: '139, 0, 0' },    // Boston Red
            { hex: '#a50000', rgb: '165, 0, 0' },    // Bright Boston Red
            { hex: '#660000', rgb: '102, 0, 0' },    // Dark Boston Red
            { hex: '#750000', rgb: '117, 0, 0' },    // Medium Boston Red
            { hex: '#990000', rgb: '153, 0, 0' }     // Deep Boston Red
        ];
        
        const colorIndex = index % gradientColors.length;
        const colorData = gradientColors[colorIndex];
        
        // Apply to the active card
        const activeCard = this.slides[index]?.querySelector('.enhanced-card');
        if (activeCard) {
            activeCard.style.setProperty('--card-gradient-color', colorData.hex);
            activeCard.style.setProperty('--card-gradient-rgb', colorData.rgb);
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
