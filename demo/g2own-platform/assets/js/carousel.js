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
