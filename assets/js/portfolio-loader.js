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
                <div class="portfolio-image card-item card-item-image" data-translate-z="100">
                            <a href="${project.demoUrl}" class="portfolio-image-link" aria-label="View ${project.title} live demo" target="_blank" rel="noopener noreferrer">                        <img src="${project.image}" 
                             alt="${project.title}" 
                             loading="lazy"
                             decoding="async"
                             onload="this.style.opacity='1'"
                             style="opacity:0; transition: opacity 0.3s ease"
                             class="portfolio-img">
                        <div class="portfolio-overlay">
                            <div class="portfolio-preview-text card-item card-item-preview" data-translate-z="80">
                                Preview
                            </div>
                        </div>
                    </a>
                    ${project.featured ? '<div class="featured-badge card-item" data-translate-z="40">Featured</div>' : ''}
                </div>
                <div class="portfolio-content">
                    <div class="card-item card-item-title" data-translate-z="50">
                        <h3 class="portfolio-title">${project.title}</h3>
                        ${project.year ? `<span class="project-year">${project.year}</span>` : ''}
                    </div>
                    <p class="portfolio-description card-item card-item-description" data-translate-z="60">${project.description}</p>
                    <div class="portfolio-tags card-item card-item-tags" data-translate-z="20">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="portfolio-actions card-item" data-translate-z="30">
                        <a href="${project.demoUrl}" 
                           class="btn btn-primary portfolio-btn"
                           target="_blank" 
                           rel="noopener noreferrer"
                           aria-label="View ${project.title} live demo">
                            <span>Live Demo</span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                        ${project.projectUrl ? `
                        <a href="${project.projectUrl}" 
                           class="btn btn-secondary portfolio-btn"
                           aria-label="View ${project.title} case study">
                            <span>Case Study</span>
                            <i class="fas fa-book-open"></i>
                        </a>
                        ` : `
                        <a href="${project.codeUrl}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary portfolio-btn"
                           aria-label="View ${project.title} source code">
                            <span>View Code</span>
                            <i class="fab fa-github"></i>
                        </a>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Add mouse tracking for 3D effect
        this.addMouseTracking(card);

        return card;
    }

    addMouseTracking(cardElement) {
        const cardContainer = cardElement;
        const cardBody = cardElement.querySelector('.card-body');
        
        if (!cardBody) return;

        // Set up the container and body for 3D transforms (Aceternity pattern)
        cardContainer.style.transformStyle = 'preserve-3d';
        cardContainer.style.perspective = '1000px';
        
        cardBody.style.transformStyle = 'preserve-3d';
        cardBody.style.transition = 'transform 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)';

        // Initialize all card items with their specific translateZ values
        this.initializeCardItems(cardBody);

        let mouseX = 0;
        let mouseY = 0;
        let isHovered = false;

        // Mouse move handler
        const handleMouseMove = (e) => {
            if (!isHovered) return;

            const rect = cardContainer.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            mouseX = (e.clientX - rect.left - width / 2) / width;
            mouseY = (e.clientY - rect.top - height / 2) / height;

            // Apply Aceternity-style rotations
            const rotateX = mouseY * 10; // Reduced from original for subtlety
            const rotateY = mouseX * 10;

            cardBody.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Update card items with enhanced transforms
            this.updateCardItemsOnHover(cardBody, mouseX, mouseY);
        };

        cardContainer.addEventListener('mouseenter', () => {
            isHovered = true;
            cardContainer.style.cursor = 'pointer';
        });

        cardContainer.addEventListener('mousemove', handleMouseMove);

        cardContainer.addEventListener('mouseleave', () => {
            isHovered = false;
            cardContainer.style.cursor = 'default';
            
            // Reset to neutral state
            cardBody.style.transform = 'rotateX(0deg) rotateY(0deg)';
            this.resetCardItems(cardBody);
        });
    }

    initializeCardItems(cardBody) {
        const cardItems = cardBody.querySelectorAll('.card-item');
        
        cardItems.forEach((item) => {
            // Set transform style for each item
            item.style.transformStyle = 'preserve-3d';
            item.style.transition = 'transform 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)';
            
            // Apply base translateZ values following Aceternity pattern
            const baseZ = this.getAcetternityZTranslation(item);
            item.style.transform = `translateZ(${baseZ}px)`;
        });
    }

    updateCardItemsOnHover(cardBody, mouseX, mouseY) {
        const cardItems = cardBody.querySelectorAll('.card-item');
        
        cardItems.forEach((item) => {
            const baseZ = this.getAcetternityZTranslation(item);
            const hoverZ = baseZ + 20; // Enhanced depth on hover
            
            // Add subtle mouse-following effect for individual items
            const itemRotateX = mouseY * 2;
            const itemRotateY = mouseX * 2;
            
            item.style.transform = `translateZ(${hoverZ}px) rotateX(${itemRotateX}deg) rotateY(${itemRotateY}deg)`;
        });
    }

    resetCardItems(cardBody) {
        const cardItems = cardBody.querySelectorAll('.card-item');
        
        cardItems.forEach((item) => {
            const baseZ = this.getAcetternityZTranslation(item);
            item.style.transform = `translateZ(${baseZ}px)`;
        });
    }

    getAcetternityZTranslation(element) {
        // Check for data attribute first (more precise)
        const dataZ = element.getAttribute('data-translate-z');
        if (dataZ) return parseInt(dataZ);
        
        // Following Aceternity UI's translateZ pattern from the example
        if (element.classList.contains('card-item-image')) return 100; // Like main image
        if (element.classList.contains('card-item-title')) return 50;   // Like main title
        if (element.classList.contains('card-item-description')) return 60; // Like description
        if (element.classList.contains('card-item-tags')) return 20;    // Like buttons
        if (element.classList.contains('card-item-preview')) return 80; // Preview text
        if (element.classList.contains('featured-badge')) return 40;    // Badge
        return 30; // default
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
