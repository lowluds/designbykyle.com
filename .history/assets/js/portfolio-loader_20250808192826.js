/**
 * Portfolio Loader with 3D Card Effects
 * Dynamically loads portfolio items with Aceternity UI inspired effects
 */

class PortfolioLoader {
    constructor() {
        this.container = document.getElementById('portfolio-grid');
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadPortfolio();
        this.setupFilters();
    }

    loadPortfolio() {
        if (!this.container || !window.portfolioData) {
            console.error('Portfolio container or data not found');
            return;
        }

        this.container.innerHTML = '';
        
        window.portfolioData.forEach((project, index) => {
            const projectElement = this.createProjectCard(project, index);
            this.container.appendChild(projectElement);
        });

        // Re-initialize scroll animations for new elements
        this.initScrollAnimations();
    }

    createProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = `portfolio-item card-container animate-on-scroll`;
        card.setAttribute('data-category', project.category);
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="card-body portfolio-card">
                <div class="portfolio-image card-item card-item-image">
                    <a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer" class="portfolio-image-link" aria-label="View ${project.title} project">
                        <img src="${project.image}" 
                             alt="${project.title}" 
                             loading="lazy"
                             decoding="async"
                             onload="this.style.opacity='1'"
                             style="opacity:0; transition: opacity 0.3s ease">
                        <div class="portfolio-overlay">
                            <div class="portfolio-preview-text card-item card-item-preview">
                                Preview
                            </div>
                        </div>
                    </a>
                    ${project.featured ? '<div class="featured-badge card-item">Featured</div>' : ''}
                </div>
                <div class="portfolio-content">
                    <div class="card-item card-item-title">
                        <h3 class="portfolio-title">${project.title}</h3>
                        ${project.year ? `<span class="project-year">${project.year}</span>` : ''}
                    </div>
                    <p class="portfolio-description card-item card-item-description">${project.description}</p>
                    <div class="portfolio-tags card-item card-item-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add mouse tracking for 3D effect
        this.addMouseTracking(card);

        return card;
    }

    addMouseTracking(cardElement) {
        const card = cardElement.querySelector('.card-body');
        const cardContainer = cardElement;
        let isHovering = false;
        let animationFrame = null;
        let isInitialized = false;

        // Cache DOM elements and calculations for better performance
        let cachedCardItems = null;
        let cachedRect = null;
        let lastUpdateTime = 0;
        const throttleDelay = 16; // ~60fps

        // Initialize card items cache
        const initializeCard = () => {
            if (!isInitialized) {
                cachedCardItems = card.querySelectorAll('.card-item');
                isInitialized = true;
                
                // Preload 3D transforms to avoid layout shifts
                card.style.transformStyle = 'preserve-3d';
                card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
                
                cachedCardItems.forEach((item) => {
                    const baseZ = this.getBaseZTranslation(item);
                    item.style.transform = `translateZ(${baseZ}px)`;
                    item.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
                });
            }
        };

        // Optimized mouse move handler with throttling
        const handleMouseMove = (e) => {
            if (!card || !isHovering) return;

            const now = performance.now();
            if (now - lastUpdateTime < throttleDelay) return;
            lastUpdateTime = now;

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                // Update cached rect only when needed
                if (!cachedRect) {
                    cachedRect = cardContainer.getBoundingClientRect();
                }

                const x = e.clientX - cachedRect.left;
                const y = e.clientY - cachedRect.top;
                
                const centerX = cachedRect.width / 2;
                const centerY = cachedRect.height / 2;
                
                // Calculate rotation with smooth curves and limits
                const rotateX = Math.max(-12, Math.min(12, (y - centerY) / centerY * -10));
                const rotateY = Math.max(-12, Math.min(12, (x - centerX) / centerX * 10));

                // Use more efficient transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;

                // Enhanced Z-translations on hover (cached elements)
                if (cachedCardItems) {
                    cachedCardItems.forEach((item) => {
                        const baseZ = this.getBaseZTranslation(item);
                        const hoverZ = baseZ + 15;
                        item.style.transform = `translateZ(${hoverZ}px)`;
                    });
                }
            });
        };

        cardContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            cardContainer.style.cursor = 'pointer';
            
            // Initialize card on first hover for better performance
            initializeCard();
            
            // Reset cached rect for accurate calculations
            cachedRect = null;
        });

        cardContainer.addEventListener('mousemove', handleMouseMove);

        cardContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            cachedRect = null; // Clear cache
            
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            if (!card) return;

            // Smooth transition back to neutral state
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

            // Reset Z-translations using cached elements if available
            if (cachedCardItems) {
                cachedCardItems.forEach((item) => {
                    const baseZ = this.getBaseZTranslation(item);
                    item.style.transform = `translateZ(${baseZ}px)`;
                });
            }

            cardContainer.style.cursor = 'default';
        });
    }

    getBaseZTranslation(element) {
        if (element.classList.contains('card-item-image')) return 20;
        if (element.classList.contains('card-item-title')) return 40;
        if (element.classList.contains('card-item-description')) return 30;
        if (element.classList.contains('card-item-tags')) return 35;
        if (element.classList.contains('card-item-preview')) return 80;
        if (element.classList.contains('card-item-actions')) return 50;
        if (element.classList.contains('featured-badge')) return 60;
        return 25; // default
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get filter value
                const filter = button.getAttribute('data-filter');
                this.filterProjects(filter);
            });
        });
    }

    filterProjects(filter) {
        this.currentFilter = filter;
        const items = this.container.querySelectorAll('.portfolio-item');

        items.forEach(item => {
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || category === filter;

            if (shouldShow) {
                item.style.display = 'block';
                // Animate in
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);
            } else {
                // Animate out
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add a more natural staggered delay
                    const delay = index * 150;
                    
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                        
                        // Ensure smooth loading by preloading images
                        const img = entry.target.querySelector('img');
                        if (img && !img.complete) {
                            img.addEventListener('load', () => {
                                setTimeout(() => {
                                    entry.target.classList.add('card-loaded');
                                }, 50);
                            });
                        } else {
                            // Image already loaded, apply effect immediately
                            setTimeout(() => {
                                entry.target.classList.add('card-loaded');
                            }, 150);
                        }
                    }, delay);
                    
                    // Stop observing once animated to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe new portfolio items
        const portfolioItems = this.container.querySelectorAll('.portfolio-item');
        portfolioItems.forEach((item, index) => {
            // Add initial loading state
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            observer.observe(item);
        });
    }

    // Method to add new project (for future use)
    addProject(projectData) {
        if (!window.portfolioData) {
            window.portfolioData = [];
        }
        
        window.portfolioData.push({
            id: Date.now(), // Simple ID generation
            ...projectData
        });
        
        this.loadPortfolio();
    }

    // Method to remove project (for future use)
    removeProject(projectId) {
        if (!window.portfolioData) return;
        
        window.portfolioData = window.portfolioData.filter(project => project.id !== projectId);
        this.loadPortfolio();
    }
}

// Initialize when DOM is ready with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Use requestIdleCallback for better performance if available
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            window.portfolioLoader = new PortfolioLoader();
        }, { timeout: 200 });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            window.portfolioLoader = new PortfolioLoader();
        }, 50);
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioLoader;
}
