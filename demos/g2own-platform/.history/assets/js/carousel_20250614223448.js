// G2Own Carousel - Advanced Game Showcase Carousel

class GameCarousel {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 1;
        this.isTransitioning = false;
        this.autoPlayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // Game data for the carousel
        this.gameData = [
            [
                {
                    id: 1,
                    title: "Cyberpunk 2077",
                    category: "Open-world RPG",
                    price: 39.99,
                    originalPrice: 59.99,
                    discount: 33,
                    image: "cyberpunk-2077",
                    gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))",
                    color: "#ef4444",
                    featured: true,
                    rating: 4.2,
                    platforms: ["Steam", "Epic Games", "GOG"]
                },
                {
                    id: 2,
                    title: "Call of Duty: MW3",
                    category: "First Person Shooter",
                    price: 69.99,
                    originalPrice: 69.99,
                    discount: 0,
                    image: "cod-mw3",
                    gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))",
                    color: "#06b6d4",
                    featured: true,
                    rating: 4.5,
                    platforms: ["Steam", "Battle.net"]
                },
                {
                    id: 3,
                    title: "Fortnite Battle Pass",
                    category: "Battle Royale",
                    price: 9.99,
                    originalPrice: 9.99,
                    discount: 0,
                    image: "fortnite",
                    gradient: "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))",
                    color: "#a855f7",
                    featured: false,
                    rating: 4.8,
                    platforms: ["Epic Games"]
                }
            ],
            [
                {
                    id: 4,
                    title: "Grand Theft Auto V",
                    category: "Action Adventure",
                    price: 29.99,
                    originalPrice: 59.99,
                    discount: 50,
                    image: "gta-v",
                    gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))",
                    color: "#22c55e",
                    featured: true,
                    rating: 4.7,
                    platforms: ["Steam", "Epic Games", "Rockstar"]
                },
                {
                    id: 5,
                    title: "Minecraft Java Edition",
                    category: "Sandbox",
                    price: 26.95,
                    originalPrice: 26.95,
                    discount: 0,
                    image: "minecraft",
                    gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(132, 204, 22, 0.2))",
                    color: "#84cc16",
                    featured: false,
                    rating: 4.9,
                    platforms: ["Minecraft.net", "Microsoft Store"]
                },
                {
                    id: 6,
                    title: "Assassin's Creed Valhalla",
                    category: "Action RPG",
                    price: 19.99,
                    originalPrice: 59.99,
                    discount: 67,
                    image: "ac-valhalla",
                    gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))",
                    color: "#f59e0b",
                    featured: true,
                    rating: 4.3,
                    platforms: ["Steam", "Epic Games", "Ubisoft"]
                }
            ]
        ];
        
        this.totalSlides = this.gameData.length;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeCarousel();
            });
        } else {
            this.initializeCarousel();
        }
    }

    initializeCarousel() {
        this.createCarouselSlides();
        this.setupEventListeners();
        this.setupAutoPlay();
        this.setupTouchHandlers();
        this.setupKeyboardControls();
        console.log('Game Carousel initialized with', this.gameData.length, 'slides');
    }

    createCarouselSlides() {
        const track = document.getElementById('carousel-track');
        if (!track) {
            console.warn('Carousel track not found');
            return;
        }

        // Clear existing content
        track.innerHTML = '';

        this.gameData.forEach((slideGames, slideIndex) => {
            const slide = this.createSlide(slideGames, slideIndex);
            track.appendChild(slide);
        });

        // Update track width
        track.style.width = `${this.totalSlides * 100}%`;
    }

    createSlide(games, slideIndex) {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.style.minWidth = '100%';
        slide.style.display = 'flex';
        slide.style.justifyContent = 'center';
        slide.style.gap = '1.5rem';
        slide.style.flexWrap = 'wrap';
        slide.dataset.slide = slideIndex;

        games.forEach(game => {
            const gameCard = this.createGameCard(game);
            slide.appendChild(gameCard);
        });

        return slide;
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameId = game.id;

        card.innerHTML = `
            <div class="game-card-image" style="background: ${game.gradient}">
                <span style="color: ${game.color}">${game.title}</span>
            </div>
            <div class="game-card-content">
                <h3 class="game-card-title">${game.title}</h3>
                <p class="game-card-genre">${game.category}</p>
                <div class="game-card-footer">
                    <span class="game-card-price">$${game.price}</span>
                    <button class="game-card-button" data-game-id="${game.id}">Add to Cart</button>
                </div>
            </div>
        `;

        // Add click handler
        card.addEventListener('click', (e) => {
            if (!e.target.matches('.game-card-button')) {
                this.openGameModal(game);
            }
        });

        return card;
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Add to cart button handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.game-card-button')) {
                const gameId = parseInt(e.target.dataset.gameId);
                this.addToCart(gameId);
            }
        });

        // Resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.createCarouselSlides();
            this.updateSlidePosition();
        }, 250));
    }

    setupAutoPlay() {
        // Auto-play every 5 seconds
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);

        // Pause on hover
        const carousel = document.getElementById('game-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
            carousel.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
    }

    setupTouchHandlers() {
        const carousel = document.getElementById('game-carousel');
        if (!carousel) return;

        carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });
    }

    nextSlide() {
        if (this.isTransitioning) return;
        
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlidePosition();
    }

    previousSlide() {
        if (this.isTransitioning) return;
        
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateSlidePosition();
    }

    updateSlidePosition() {
        const track = document.getElementById('carousel-track');
        if (!track) return;

        this.isTransitioning = true;
        const translateX = -this.currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;

        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
        }
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    resumeAutoPlay() {
        this.setupAutoPlay();
    }

    addToCart(gameId) {
        // Find the game data
        let game = null;
        for (const slide of this.gameData) {
            game = slide.find(g => g.id === gameId);
            if (game) break;
        }

        if (game) {
            console.log('Adding to cart:', game.title);
            // Here you would integrate with your cart system
            this.showAddToCartFeedback(game);
        }
    }

    showAddToCartFeedback(game) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = `${game.title} added to cart!`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    openGameModal(game) {
        console.log('Opening modal for:', game.title);
        // Here you would implement the game modal functionality
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners if needed
    }
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameCarousel = new GameCarousel();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameCarousel;
}

    createSlide(games, slideIndex) {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide min-w-full flex justify-center gap-6 flex-wrap';
        slide.setAttribute('data-slide', slideIndex);

        games.forEach(game => {
            const gameCard = this.createGameCard(game);
            slide.appendChild(gameCard);
        });

        return slide;
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card relative group cursor-pointer transform transition-all duration-500 hover:scale-105';
        card.setAttribute('data-game-id', game.id);

        const discountBadge = game.discount > 0 ? `
            <div class="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                -${game.discount}%
            </div>
        ` : '';

        const ratingStars = this.generateStarRating(game.rating);

        card.innerHTML = `
            <div class="w-64 h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-red-500/30 overflow-hidden group-hover:border-red-500 transition-all duration-500 relative">
                ${discountBadge}
                
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-5"></div>
                
                <!-- Game Image Area -->
                <div class="h-48 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-black/20"></div>
                    <span class="text-${game.color} text-lg font-bold relative z-10">${game.title}</span>
                    
                    <!-- Floating particles effect -->
                    <div class="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity">
                        ${this.createFloatingParticles()}
                    </div>
                </div>
                
                <!-- Game Info -->
                <div class="p-4 relative z-10">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-semibold text-white truncate">${game.title}</h3>
                        ${game.featured ? '<span class="text-yellow-400 text-xs">★ FEATURED</span>' : ''}
                    </div>
                    
                    <p class="text-gray-400 text-sm mb-2">${game.category}</p>
                    
                    <!-- Rating -->
                    <div class="flex items-center gap-2 mb-3">
                        <div class="flex text-yellow-400 text-sm">
                            ${ratingStars}
                        </div>
                        <span class="text-gray-400 text-xs">(${game.rating})</span>
                    </div>
                    
                    <!-- Platforms -->
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${game.platforms.map(platform => `
                            <span class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">${platform}</span>
                        `).join('')}
                    </div>
                    
                    <!-- Price and Action -->
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            ${game.discount > 0 ? `<span class="text-gray-500 line-through text-sm">$${game.originalPrice}</span>` : ''}
                            <span class="text-red-400 font-bold text-xl">$${game.price}</span>
                        </div>
                        <button class="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 group-hover:shadow-lg group-hover:shadow-red-500/30" 
                                onclick="window.G2OwnWebsite.addToCart(${game.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
                
                <!-- Hover Effects -->
                <div class="absolute inset-0 border-2 border-transparent group-hover:border-red-500/50 rounded-xl transition-all duration-300 pointer-events-none"></div>
            </div>
        `;

        // Add click handler for game details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.showGameDetails(game);
            }
        });

        return card;
    }

    createFloatingParticles() {
        let particles = '';
        for (let i = 0; i < 6; i++) {
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const animationDelay = Math.random() * 2;
            const duration = 3 + Math.random() * 2;
            
            particles += `
                <div class="absolute w-${Math.floor(size)} h-${Math.floor(size)} bg-white/20 rounded-full" 
                     style="left: ${left}%; 
                            animation: floatUp ${duration}s infinite linear;
                            animation-delay: ${animationDelay}s;"></div>
            `;
        }
        return particles;
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '☆';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        
        return stars;
    }

    createSlideIndicators() {
        // Remove existing indicators
        const existingIndicators = document.querySelector('.carousel-indicators');
        if (existingIndicators) {
            existingIndicators.remove();
        }

        const carousel = document.getElementById('game-carousel');
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators flex justify-center gap-2 mt-6';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `w-3 h-3 rounded-full transition-all duration-300 ${i === 0 ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`;
            indicator.setAttribute('data-slide', i);
            indicator.addEventListener('click', () => this.goToSlide(i));
            indicators.appendChild(indicator);
        }
        
        carousel.appendChild(indicators);
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Pause auto-play on hover
        const carousel = document.getElementById('game-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', () => this.pauseAutoPlay());
            carousel.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }
        
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    setupTouchHandlers() {
        const track = document.getElementById('carousel-track');
        if (!track) return;
        
        track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.pauseAutoPlay();
        }, { passive: true });
        
        track.addEventListener('touchmove', (e) => {
            // Prevent default to avoid scrolling
            if (Math.abs(e.touches[0].clientX - this.touchStartX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });
        
        track.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
            this.resumeAutoPlay();
        }, { passive: true });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.closest('#game-carousel')) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSlide();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSlide();
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToSlide(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goToSlide(this.totalSlides - 1);
                        break;
                }
            }
        });
    }

    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        const minSwipeDistance = 50;
        
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                this.previousSlide();
            } else {
                this.nextSlide();
            }
        }
    }

    nextSlide() {
        if (this.isTransitioning) return;
        
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        if (this.isTransitioning) return;
        
        const prevIndex = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    goToSlide(slideIndex) {
        if (this.isTransitioning || slideIndex === this.currentSlide) return;
        
        this.isTransitioning = true;
        this.currentSlide = slideIndex;
        
        const track = document.getElementById('carousel-track');
        if (track) {
            const translateX = -slideIndex * 100;
            track.style.transform = `translateX(${translateX}%)`;
            
            // Update indicators
            this.updateIndicators();
            
            // Add animation classes to cards in current slide
            setTimeout(() => {
                this.animateCurrentSlideCards();
                this.isTransitioning = false;
            }, 500);
        }
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicators button');
        indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.className = 'w-3 h-3 rounded-full transition-all duration-300 bg-red-500';
            } else {
                indicator.className = 'w-3 h-3 rounded-full transition-all duration-300 bg-gray-600 hover:bg-gray-500';
            }
        });
    }

    animateCurrentSlideCards() {
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (currentSlideElement) {
            const cards = currentSlideElement.querySelectorAll('.game-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = 'slideInUp 0.6s ease-out forwards';
                }, index * 100);
            });
        }
    }

    setupAutoPlay() {
        this.resumeAutoPlay();
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resumeAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Auto-advance every 5 seconds
    }

    handleResize() {
        // Recreate slides with appropriate number of games per slide
        this.createCarouselSlides();
        this.goToSlide(0); // Reset to first slide
    }

    showGameDetails(game) {
        // Create modal with game details
        const modal = this.createGameModal(game);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    createGameModal(game) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content max-w-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">${game.title}</h2>
                    <button class="close-modal text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-gradient-to-br ${game.gradient} rounded-lg h-64 flex items-center justify-center">
                        <span class="text-${game.color} text-3xl font-bold">${game.title}</span>
                    </div>
                    
                    <div>
                        <p class="text-gray-300 mb-4">${game.category}</p>
                        <div class="flex items-center gap-2 mb-4">
                            <div class="flex text-yellow-400">
                                ${this.generateStarRating(game.rating)}
                            </div>
                            <span class="text-gray-400">(${game.rating})</span>
                        </div>
                        
                        <div class="mb-4">
                            <h4 class="text-white font-semibold mb-2">Available on:</h4>
                            <div class="flex flex-wrap gap-2">
                                ${game.platforms.map(platform => `
                                    <span class="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">${platform}</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div>
                                ${game.discount > 0 ? `<span class="text-gray-500 line-through">$${game.originalPrice}</span>` : ''}
                                <span class="text-red-400 font-bold text-2xl block">$${game.price}</span>
                            </div>
                            <button class="btn-primary-glow" onclick="window.G2OwnWebsite.addToCart(${game.id})">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Close modal handlers
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        });
        
        return modal;
    }

    // Utility functions
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    addGame(gameData) {
        this.gameData.push(gameData);
        this.createCarouselSlides();
    }

    removeGame(gameId) {
        this.gameData = this.gameData.filter(game => game.id !== gameId);
        this.createCarouselSlides();
    }

    updateGame(gameId, updatedData) {
        const gameIndex = this.gameData.findIndex(game => game.id === gameId);
        if (gameIndex !== -1) {
            this.gameData[gameIndex] = { ...this.gameData[gameIndex], ...updatedData };
            this.createCarouselSlides();
        }
    }
}

// Add required CSS animations
const carouselStyles = document.createElement('style');
carouselStyles.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes floatUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(-100%);
            opacity: 1;
        }
    }
    
    .carousel-slide {
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .game-card:hover .floating-particles {
        animation-play-state: running;
    }
`;
document.head.appendChild(carouselStyles);

// Initialize the carousel
const gameCarousel = new GameCarousel();

// Export for global access
window.GameCarousel = gameCarousel;
