/* Creative Animation Controller */
/* Modern interactive effects showcasing frontend skills */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Creative animations loading...');
    
    // Initialize all creative effects
    initFloatingLetters();
    initScrollAnimations();
    initCreativeHeaders();
    initTypewriterEffect();
    
    // Simple Floating Letters Background Effect
    function initFloatingLetters() {
        const heroSection = document.querySelector('.panel.intro');
        if (!heroSection) {
            console.log('Hero section not found');
            return;
        }
        
        console.log('Initializing floating letters...');
        
        // Create floating letters container
        const floatingContainer = document.createElement('div');
        floatingContainer.className = 'floating-letters';
        floatingContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        heroSection.appendChild(floatingContainer);
        
        const letters = ['K', 'Y', 'L', 'E', '{', '}', '<', '>', '/', '*'];
        
        function createFloatingLetter() {
            const letter = document.createElement('div');
            letter.className = 'floating-letter';
            letter.textContent = letters[Math.floor(Math.random() * letters.length)];
            letter.style.cssText = `
                position: absolute;
                font-size: ${120 + Math.random() * 80}px;
                font-weight: 900;
                color: rgba(255, 255, 255, 0.03);
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                left: ${Math.random() * 100}%;
                top: 100%;
                animation: floatUp ${15 + Math.random() * 10}s linear forwards;
                user-select: none;
                pointer-events: none;
            `;
            floatingContainer.appendChild(letter);
            
            // Remove letter after animation
            setTimeout(() => {
                if (letter.parentNode) {
                    letter.parentNode.removeChild(letter);
                }
            }, 25000);
        }
        
        // Create initial letters
        for (let i = 0; i < 3; i++) {
            setTimeout(createFloatingLetter, i * 2000);
        }
        
        // Continue creating letters
        setInterval(createFloatingLetter, 5000);
    }
    
    // Scroll-triggered Animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Add animation classes to elements
        const animateElements = document.querySelectorAll('.service-card, .portfolio-card, .contact-method');
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }
    
    // Creative Section Headers
    function initCreativeHeaders() {
        const headers = document.querySelectorAll('#about h2, #work h2, #contact h2');
        headers.forEach(header => {
            header.classList.add('creative-header');
            
            // Add animated underline
            const underline = document.createElement('div');
            underline.style.cssText = `
                position: absolute;
                bottom: -10px;
                left: 50%;
                width: 0;
                height: 3px;
                background: linear-gradient(90deg, #6366f1, #a855f7);
                border-radius: 2px;
                transform: translateX(-50%);
                transition: width 0.8s ease;
            `;
            header.style.position = 'relative';
            header.appendChild(underline);
            
            // Animate underline on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        underline.style.width = '60px';
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(header);
        });
    }
    
    // Mouse Tracker Effect
    function initMouseTracker() {
        const cursor = document.createElement('div');
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(cursor);
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
        
        // Hide cursor on mobile
        if (window.innerWidth <= 768) {
            cursor.style.display = 'none';
        }
    }
    
    // Parallax Effects
    function initParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-content::before');
            
            parallaxElements.forEach(el => {
                const speed = 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
      // Typewriter Effect Enhancement
    function initTypewriterEffect() {
        console.log('Initializing typewriter effect...');
        const typewriterElement = document.querySelector('.typewriter');
        if (!typewriterElement) {
            console.log('Typewriter element not found');
            return;
        }
        
        const roles = [
            'Full-Stack Developer',
            'Frontend Engineer', 
            'UI/UX Designer',
            'Web Developer'
        ];
        
        let currentRole = 0;
        let currentChar = 0;
        let isDeleting = false;
        
        function typeEffect() {
            const current = roles[currentRole];
            
            if (isDeleting) {
                typewriterElement.textContent = current.substring(0, currentChar - 1);
                currentChar--;
            } else {
                typewriterElement.textContent = current.substring(0, currentChar + 1);
                currentChar++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && currentChar === current.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && currentChar === 0) {
                isDeleting = false;
                currentRole = (currentRole + 1) % roles.length;
                typeSpeed = 500; // Pause before next word
            }
            
            setTimeout(typeEffect, typeSpeed);
        }
        
        // Start typewriter effect after initial animation
        setTimeout(() => {
            console.log('Starting typewriter animation');
            typeEffect();
        }, 3000);
    }
    
    // Initialize typewriter after a delay
    setTimeout(initTypewriterEffect, 1500);
    
    // Enhanced Navigation Interactions
    function initNavEnhancements() {
        const navLinks = document.querySelectorAll('#nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(-2px) scale(1)';
            });
            
            // Add ripple effect on click
            link.addEventListener('click', function(e) {
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.6);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                const rect = this.getBoundingClientRect();
                ripple.style.left = (e.clientX - rect.left - 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - 2) + 'px';
                
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
    
    initNavEnhancements();
    
    // CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(10);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Performance optimization
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    }
    
    function updateAnimations() {
        // Update any continuous animations here
        ticking = false;
    }
    
    // Smooth scroll enhancement
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
    
    // Code-style Floating Elements
    function initCodeBackground() {
        const codeElements = [
            'const portfolio = {\n  skills: [\'React\', \'Node.js\'],\n  passion: \'frontend\'\n};',
            'function createAmazingUX() {\n  return design + code + creativity;\n}',
            '<div className="modern-web">\n  <Portfolio />\n</div>',
            'git commit -m "Enhanced user experience"',
            'npm run build --production',
            '// TODO: Build something amazing',
            'export default FrontendDeveloper;',
            '.modern-design {\n  animation: smooth-transition;\n  user-experience: exceptional;\n}'
        ];
        
        function createCodeElement() {
            const codeEl = document.createElement('div');
            codeEl.className = 'code-bg';
            codeEl.textContent = codeElements[Math.floor(Math.random() * codeElements.length)];
            codeEl.style.left = Math.random() * 100 + '%';
            codeEl.style.animationDuration = (20 + Math.random() * 10) + 's';
            codeEl.style.animationDelay = Math.random() * 5 + 's';
            
            document.body.appendChild(codeEl);
            
            setTimeout(() => {
                if (codeEl.parentNode) {
                    codeEl.parentNode.removeChild(codeEl);
                }
            }, 30000);
        }
        
        // Create code elements periodically
        setInterval(createCodeElement, 8000);
        
        // Create initial elements
        for (let i = 0; i < 3; i++) {
            setTimeout(createCodeElement, i * 3000);
        }
    }
    
    // Enhanced Cursor Trail
    function initCursorTrail() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        const trails = [];
        const trailCount = 8;
        
        for (let i = 0; i < trailCount; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            document.body.appendChild(trail);
            trails.push(trail);
        }
        
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function updateTrails() {
            trails.forEach((trail, index) => {
                const delay = index * 0.1;
                setTimeout(() => {
                    trail.style.left = mouseX + 'px';
                    trail.style.top = mouseY + 'px';
                    trail.style.opacity = (trailCount - index) / trailCount * 0.5;
                    trail.style.transform = `scale(${(trailCount - index) / trailCount})`;
                }, delay * 100);
            });
            requestAnimationFrame(updateTrails);
        }
        
        updateTrails();
    }
    
    // Initialize new effects
    initCodeBackground();
    initCursorTrail();
});
