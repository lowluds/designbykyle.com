// Enhanced About Section Animations and Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize about section features
    function initAboutSection() {
        initStatCounters();
        initScrollAnimations();
        initSkillPreviewHovers();
        initTimelineAnimations();
        initFloatingElements();
        initSkillLevels();
        initTechStack();
        initValuesSection();
        initProfileCard();
        initHeroCTA();
        initEnhancedFloatingElements();
        initParallaxEffect();
        addEnhancedAnimations();
    }
    
    // Animated counter for statistics
    function initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const animateCounter = (element, target, duration = 2500) => {
            const start = 0;
            const increment = target / (duration / 16); // 60fps
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 16);
            
            element.classList.add('counting');
        };
        
        // Intersection Observer for counter animation
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    
                    statNumbers.forEach((stat, index) => {
                        const target = parseInt(stat.dataset.target);
                        
                        setTimeout(() => {
                            animateCounter(stat, target);
                        }, index * 300); // Stagger the animations
                    });
                    
                    counterObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.6,
            rootMargin: '0px 0px -30px 0px'
        });
        
        const statsContainer = document.querySelector('.stats-container');
        if (statsContainer) {
            counterObserver.observe(statsContainer);
        }
    }
    
    // Enhanced scroll animations
    function initScrollAnimations() {
        // Timeline items animation
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -20px 0px'
        });
        
        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-30px)';
            item.style.transition = `all 0.6s ease ${index * 0.2}s`;
            
            setTimeout(() => {
                timelineObserver.observe(item);
            }, 100);
        });
        
        // Skills preview animation
        const skillsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    skillsObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        document.querySelectorAll('.skill-preview-item').forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = `all 0.6s ease ${index * 0.15}s`;
            
            setTimeout(() => {
                skillsObserver.observe(item);
            }, 200);
        });
    }
    
    // Skill preview hover effects
    function initSkillPreviewHovers() {
        const skillItems = document.querySelectorAll('.skill-preview-item');
        
        skillItems.forEach(item => {
            item.addEventListener('click', function() {
                const skillType = this.dataset.skill;
                createRippleEffect(this);
                showSkillDetail(skillType);
            });
        });
    }
    
    // Timeline animations
    function initTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.timeline-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.timeline-icon');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    }
    
    // Floating elements
    function initFloatingElements() {
        const floatingItems = document.querySelectorAll('.floating-item');
        
        floatingItems.forEach(item => {
            item.addEventListener('click', function() {
                this.style.animation = 'floatingPulse 0.6s ease-out';
                
                setTimeout(() => {
                    this.style.animation = '';
                }, 600);
            });
        });
    }
    
    // Initialize skill level animations
    function initSkillLevels() {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    skillObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        document.querySelectorAll('.skill-preview-item').forEach(item => {
            skillObserver.observe(item);
        });
    }
    
    // Initialize tech stack interactions
    function initTechStack() {
        const techItems = document.querySelectorAll('.tech-item');
        
        techItems.forEach(item => {
            item.addEventListener('click', function() {
                // Create ripple effect
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    animation: techRipple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                // Add pulse animation
                this.style.animation = 'techPulse 0.4s ease-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 400);
            });
        });
    }
    
    // Initialize values section interactions
    function initValuesSection() {
        const valueItems = document.querySelectorAll('.value-item');
        
        valueItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.value-icon');
                if (icon) {
                    icon.style.animation = 'valueIconBounce 0.6s ease-out';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.value-icon');
                if (icon) {
                    icon.style.animation = '';
                }
            });
        });
    }
    
    // Initialize profile card interactions
    function initProfileCard() {
        const profileCard = document.querySelector('.profile-card');
        
        if (profileCard) {
            profileCard.addEventListener('click', function() {
                this.style.animation = 'profileCardFlip 0.8s ease-in-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 800);
            });
        }
    }
    
    // Initialize hero CTA buttons
    function initHeroCTA() {
        const ctaButtons = document.querySelectorAll('.btn-hero');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('div');
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.cssText = `
                    position: absolute;
                    left: ${e.clientX - rect.left - size/2}px;
                    top: ${e.clientY - rect.top - size/2}px;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ctaRipple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    // Enhanced floating elements with tooltips
    function initEnhancedFloatingElements() {
        const floatingItems = document.querySelectorAll('.floating-item');
        
        floatingItems.forEach(item => {
            // Add tooltip functionality
            const title = item.getAttribute('title');
            if (title) {
                const tooltip = document.createElement('div');
                tooltip.className = 'floating-tooltip';
                tooltip.textContent = title;
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                `;
                
                item.appendChild(tooltip);
                item.style.position = 'relative';
                
                item.addEventListener('mouseenter', () => {
                    tooltip.style.opacity = '1';
                });
                
                item.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                });
            }
            
            // Enhanced click interaction
            item.addEventListener('click', function() {
                this.style.animation = 'floatingClick 0.4s ease-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 400);
            });
        });
    }
    
    // Initialize parallax scrolling effect
    function initParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.about-hero, .floating-item');
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const aboutSection = document.getElementById('about');
            
            if (!aboutSection) return;
            
            const aboutRect = aboutSection.getBoundingClientRect();
            const isVisible = aboutRect.top < window.innerHeight && aboutRect.bottom > 0;
            
            if (isVisible) {
                parallaxElements.forEach((element, index) => {
                    const speed = 0.1 + (index * 0.02);
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
            }
        }
        
        // Throttle scroll event for better performance
        let ticking = false;
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
                setTimeout(() => { ticking = false; }, 16);
            }
        }
        
        window.addEventListener('scroll', requestTick);
    }
    
    // Add additional CSS animations
    function addEnhancedAnimations() {
        if (!document.querySelector('#enhanced-about-animations')) {
            const style = document.createElement('style');
            style.id = 'enhanced-about-animations';
            style.textContent = `
                @keyframes techRipple {
                    to {
                        width: 100px;
                        height: 100px;
                        opacity: 0;
                    }
                }
                
                @keyframes techPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes valueIconBounce {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    25% { transform: scale(1.1) rotate(-5deg); }
                    75% { transform: scale(1.1) rotate(5deg); }
                }
                
                @keyframes profileCardFlip {
                    0% { transform: rotateY(0deg); }
                    50% { transform: rotateY(180deg); }
                    100% { transform: rotateY(360deg); }
                }
                
                @keyframes ctaRipple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                
                @keyframes floatingClick {
                    0% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.2) rotate(10deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                
                @keyframes floatingPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                
                @keyframes statusPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                
                .status-indicator {
                    animation: statusPulse 2s infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create ripple effect
    function createRippleEffect(element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = ripple.style.marginTop = -(size / 2) + 'px';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Show skill detail (placeholder for future enhancement)
    function showSkillDetail(skillType) {
        console.log(`Showing details for: ${skillType}`);
        // Could expand to show modal or detailed info
    }
    
    // Initialize everything
    initAboutSection();
});

// Export functions for external use
window.AboutSection = {
    restartCounters: function() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            stat.textContent = '0';
            const animateCounter = (element, target, duration = 2000) => {
                const start = 0;
                const increment = target / (duration / 16);
                let current = start;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    element.textContent = Math.floor(current);
                }, 16);
                
                element.classList.add('counting');
            };
            animateCounter(stat, target);
        });
    },
    
    highlightStat: function(index) {
        const statItems = document.querySelectorAll('.stat-card');
        if (statItems[index]) {
            statItems[index].click();
        }
    }
};
