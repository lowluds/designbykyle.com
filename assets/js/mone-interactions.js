/* Mone-Inspired Animations and Interactions */

document.addEventListener('DOMContentLoaded', function() {
    
    // Intersection Observer for skill bars animation
    const skillBars = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillFill = entry.target;
                const width = skillFill.style.width;
                skillFill.style.width = '0%';
                setTimeout(() => {
                    skillFill.style.width = width;
                }, 200);
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });

    // Staggered animation for service items
    const serviceItems = document.querySelectorAll('.service-item');
    const serviceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, {
        threshold: 0.3
    });

    serviceItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        serviceObserver.observe(item);
    });

    // Portfolio cards hover effect enhancement
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    portfolioCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle scale animation to image
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1.05)';
                img.style.transition = 'transform 0.4s ease';
            }
        });

        card.addEventListener('mouseleave', function() {
            const img = this.querySelector('img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
    });

    // Gradient text animation cycling
    let gradientCycle = 0;
    const gradientTexts = document.querySelectorAll('.gradient-text, .gradient-text-reverse');
    
    setInterval(() => {
        gradientTexts.forEach((text, index) => {
            if (index % 2 === gradientCycle % 2) {
                text.style.animationDuration = '2s';
            } else {
                text.style.animationDuration = '4s';
            }
        });
        gradientCycle++;
    }, 5000);

    // Smooth scrolling enhancement for navigation
    const navLinks = document.querySelectorAll('#nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active navigation state
                navLinks.forEach(navLink => navLink.removeAttribute('aria-current'));
                this.setAttribute('aria-current', 'page');
            }
        });
    });

    // Dynamic background particle interaction with scroll
    let scrollPosition = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const scrollDiff = currentScroll - scrollPosition;
        scrollPosition = currentScroll;

        // Update floating orbs based on scroll
        const orbs = document.querySelectorAll('.floating-orb');
        orbs.forEach((orb, index) => {
            const factor = (index + 1) * 0.1;
            orb.style.transform += ` translateY(${scrollDiff * factor}px)`;
        });
    });

    // Tech stack tags interaction
    const techTags = document.querySelectorAll('.tech-stack span, .skill-tags span');
    techTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
            this.style.boxShadow = '0 4px 15px rgba(109, 40, 217, 0.3)';
        });

        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.cta-button, .modern-submit-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
    });

    // Stats counter animation
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalText = target.textContent;
                const number = parseInt(finalText.replace(/\D/g, ''));
                const suffix = finalText.replace(/\d/g, '');
                
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            current = number;
                            clearInterval(timer);
                        }
                        target.textContent = Math.floor(current) + suffix;
                    }, 40);
                }
                
                statsObserver.unobserve(target);
            }
        });
    }, {
        threshold: 0.7
    });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Form enhancement - real-time validation styling
    const formInputs = document.querySelectorAll('.modern-input, .modern-textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.borderColor = 'rgba(109, 40, 217, 0.5)';
            this.parentElement.style.boxShadow = '0 0 0 3px rgba(109, 40, 217, 0.1)';
        });

        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.parentElement.style.boxShadow = 'none';
            } else {
                this.parentElement.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                this.parentElement.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
            }
        });
    });

});

// Additional utility functions for enhanced interactions
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.cta-button, .modern-submit-btn')) {
        addRippleEffect(e.target, e);
    }
});

// CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
