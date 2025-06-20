// Testimonials Animation and Interaction
(function() {
    'use strict';

    // Initialize testimonials when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initTestimonials();
    });

    function initTestimonials() {
        setupScrollAnimation();
        setupHoverEffects();
        setupStarAnimations();
    }

    // Scroll-triggered animation for testimonial cards
    function setupScrollAnimation() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        if (!testimonialCards.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered animation delay
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 150);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        testimonialCards.forEach(card => {
            observer.observe(card);
        });
    }

    // Enhanced hover effects for testimonial cards
    function setupHoverEffects() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        testimonialCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Add glow effect
                this.style.boxShadow = '0 15px 40px rgba(76, 175, 80, 0.2)';
                
                // Animate stars on hover
                const stars = this.querySelectorAll('.rating i');
                stars.forEach((star, index) => {
                    setTimeout(() => {
                        star.style.transform = 'scale(1.2) rotate(360deg)';
                        star.style.color = '#FFD700';
                    }, index * 50);
                });
            });

            card.addEventListener('mouseleave', function() {
                // Remove glow effect
                this.style.boxShadow = '';
                
                // Reset stars
                const stars = this.querySelectorAll('.rating i');
                stars.forEach(star => {
                    star.style.transform = '';
                    star.style.color = '';
                });
            });
        });
    }

    // Star rating animations
    function setupStarAnimations() {
        const ratings = document.querySelectorAll('.rating');
        
        ratings.forEach(rating => {
            const stars = rating.querySelectorAll('i');
            
            // Initial animation when cards become visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        stars.forEach((star, index) => {
                            setTimeout(() => {
                                star.style.opacity = '1';
                                star.style.transform = 'scale(1)';
                            }, index * 100);
                        });
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(rating);
            
            // Set initial state
            stars.forEach(star => {
                star.style.opacity = '0';
                star.style.transform = 'scale(0)';
                star.style.transition = 'all 0.3s ease';
            });
        });
    }

    // Add floating animation to testimonial cards
    function addFloatingAnimation() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        testimonialCards.forEach((card, index) => {
            // Create subtle floating effect
            card.style.animation = `float 6s ease-in-out infinite`;
            card.style.animationDelay = `${index * 0.5}s`;
        });
    }

    // CSS keyframes for floating animation (injected via JavaScript)
    function injectFloatingKeyframes() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize floating animation after scroll animation
    setTimeout(() => {
        injectFloatingKeyframes();
        addFloatingAnimation();
    }, 1000);

    // Add parallax effect to testimonials section
    function setupParallaxEffect() {
        const testimonialsSection = document.querySelector('.testimonials-section');
        
        if (!testimonialsSection) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const sectionTop = testimonialsSection.offsetTop;
            const sectionHeight = testimonialsSection.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Check if section is in viewport
            if (scrolled + windowHeight > sectionTop && scrolled < sectionTop + sectionHeight) {
                const parallaxSpeed = 0.5;
                const yPos = -(scrolled - sectionTop) * parallaxSpeed;
                testimonialsSection.style.transform = `translateY(${yPos}px)`;
            }
        });
    }

    // Initialize parallax effect
    setupParallaxEffect();

})();
