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
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                    <div class="portfolio-overlay">
                        <div class="portfolio-actions card-item card-item-actions">
                            <a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer" 
                               class="portfolio-link" title="View Project" 
                               aria-label="View ${project.title} project">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                            <a href="${project.codeUrl}" target="_blank" rel="noopener noreferrer" 
                               class="portfolio-link" title="View Code"
                               aria-label="View ${project.title} source code">
                                <i class="fab fa-github"></i>
                            </a>
                        </div>
                    </div>
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

        cardContainer.addEventListener('mousemove', (e) => {
            if (!card) return;

            const rect = cardContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10; // Inverted for natural feel
            const rotateY = (x - centerX) / centerX * 10;

            card.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale3d(1.02, 1.02, 1.02)
            `;

            // Enhanced Z-translations on hover
            const cardItems = card.querySelectorAll('.card-item');
            cardItems.forEach((item, index) => {
                const baseZ = this.getBaseZTranslation(item);
                const hoverZ = baseZ + 20;
                item.style.transform = `translateZ(${hoverZ}px)`;
            });
        });

        cardContainer.addEventListener('mouseleave', () => {
            if (!card) return;

            card.style.transform = `
                perspective(1000px) 
                rotateX(0deg) 
                rotateY(0deg) 
                scale3d(1, 1, 1)
            `;

            // Reset Z-translations
            const cardItems = card.querySelectorAll('.card-item');
            cardItems.forEach((item) => {
                const baseZ = this.getBaseZTranslation(item);
                item.style.transform = `translateZ(${baseZ}px)`;
            });
        });
    }

    getBaseZTranslation(element) {
        if (element.classList.contains('card-item-image')) return 20;
        if (element.classList.contains('card-item-title')) return 40;
        if (element.classList.contains('card-item-description')) return 30;
        if (element.classList.contains('card-item-tags')) return 35;
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
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Add staggered 3D effect
                    setTimeout(() => {
                        entry.target.classList.add('card-loaded');
                    }, 100);
                }
            });
        }, observerOptions);

        // Observe new portfolio items
        const portfolioItems = this.container.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.portfolioLoader = new PortfolioLoader();
    }, 100);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortfolioLoader;
}
