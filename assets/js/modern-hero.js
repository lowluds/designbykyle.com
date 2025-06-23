// Modern Hero Animations and Interactions
document.addEventListener('DOMContentLoaded', function() {
    
    // Typewriter effect for hero subtitle
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        element.style.borderRight = '3px solid #f39c12';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 2000);
            }
        }
        type();
    }

    // Initialize typewriter effect
    const heroSubtitle = document.querySelector('.typewriter');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        setTimeout(() => {
            typeWriter(heroSubtitle, originalText, 80);
        }, 500);
    }

    // Magnetic effect for buttons
    const magneticElements = document.querySelectorAll('.cta-button, .stat');
    
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    });

    // Parallax scrolling effect for background particles
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        const heroSection = document.querySelector('#main > .panel.intro');
        if (heroSection) {
            heroSection.style.backgroundPositionY = rate + 'px';
        }
    });

    // Stats counter animation
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.ceil(start) + (element.textContent.includes('+') ? '+' : '') + 
                                   (element.textContent.includes('h') ? 'h' : '');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + (element.textContent.includes('+') ? '+' : '') + 
                                   (element.textContent.includes('h') ? 'h' : '');
            }
        }
        updateCounter();
    }

    // Intersection Observer for stats animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    const number = parseInt(text.replace(/\D/g, ''));
                    stat.textContent = '0' + (text.includes('+') ? '+' : '') + 
                                      (text.includes('h') ? 'h' : '');
                    
                    setTimeout(() => {
                        animateCounter(stat, number);
                    }, 500);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // Smooth scrolling for CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mouse movement particle effect
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Create floating particles on mouse move
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #f39c12;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${x}px;
            top: ${y}px;
            opacity: 1;
            transition: all 1s ease-out;
        `;
        
        document.body.appendChild(particle);
        
        // Animate particle
        setTimeout(() => {
            particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0)`;
            particle.style.opacity = '0';
        }, 10);
        
        // Remove particle
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 1000);
    }

    // Throttled particle creation on hero section hover
    let lastParticleTime = 0;
    const heroSection = document.querySelector('#main > .panel.intro');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastParticleTime > 100) { // Throttle to every 100ms
                createParticle(e.clientX, e.clientY);
                lastParticleTime = now;
            }
        });
    }
});

// Add CSS for mobile touch feedback
const style = document.createElement('style');
style.textContent = `
    @media (hover: none) and (pointer: coarse) {
        .cta-button:active {
            transform: scale(0.95) !important;
        }
        
        .stat:active {
            transform: scale(0.95) !important;
        }
    }
`;
document.head.appendChild(style);
