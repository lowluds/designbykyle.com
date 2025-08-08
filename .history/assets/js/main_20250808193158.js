/**
 * Modern Portfolio JavaScript
 * Kyle L. - Frontend Developer & UI Designer
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initThemeToggle();
    initScrollAnimations();
    initStatCounters();
    initPortfolioFilters();
    initSmoothScrolling();
    initContactForm();
    initScrollIndicator();
    initAnimatedText();
    initHero3DText();
});

/**
 * Navigation Functions
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect - only backdrop blur, always visible
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for backdrop blur effect
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Active navigation link highlighting
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial call
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarHeight = 80; // Match CSS navbar height
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - (navbarHeight + 50);
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && 
            window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Theme Toggle Functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme or default to system preference
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = prefersDarkScheme.matches ? 'dark' : 'light';
    }
    
    // Apply initial theme
    applyTheme(currentTheme);
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', function() {
        if (!localStorage.getItem('theme')) {
            applyTheme(prefersDarkScheme.matches ? 'dark' : 'light');
        }
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll(`
        .service-card,
        .portfolio-item,
        .contact-item,
        .skill-category,
        .about-text,
        .contact-form-container
    `);

    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Add staggered animation delays
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    document.querySelectorAll('.portfolio-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

/**
 * Animated Stat Counters (Static display - no animation needed)
 */
function initStatCounters() {
    // Stats are now static text (10+, 5+, 24HR) - no animation needed
    // This function is kept for compatibility but performs no actions
    console.log('Static stats loaded: 10+ Projects, 5+ Years, 24HR Response');
}

/**
 * Portfolio Filters
 */
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            // Filter portfolio items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/**
 * Smooth Scrolling
 */
function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navbarHeight = 80; // Match CSS navbar height
                const offsetTop = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Contact Form
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Submit form via AJAX
            fetch(this.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reset form
                    this.reset();
                    
                    // Show success message
                    submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    submitButton.style.background = 'var(--accent-success)';
                    
                    // Show success notification
                    showNotification(data.message || 'Message sent successfully!', 'success');
                } else {
                    // Show error message
                    submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                    submitButton.style.background = 'var(--accent-error)';
                    
                    // Show error notification
                    showNotification(data.message || 'Failed to send message. Please try again.', 'error');
                }
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 3000);
            })
            .catch(error => {
                console.error('Form submission error:', error);
                
                // Show error message
                submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                submitButton.style.background = 'var(--accent-error)';
                
                // Show error notification
                showNotification('Network error. Please check your connection and try again.', 'error');
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 3000);
            });
        });

        // Real-time form validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    clearFieldError(e);

    // Validation rules
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'text':
        case 'textarea':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'This field must be at least 2 characters long';
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function clearFieldError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    field.style.borderColor = '';
}

function showFieldError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.style.color = 'var(--accent-error)';
    errorElement.style.fontSize = 'var(--text-sm)';
    errorElement.style.marginTop = 'var(--space-1)';
    errorElement.textContent = message;
    
    field.style.borderColor = 'var(--accent-error)';
    field.parentNode.appendChild(errorElement);
}

/**
 * Scroll Indicator
 */
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (scrollIndicator) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 200) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });

        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const navbarHeight = 80;
                const offsetTop = aboutSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '10000',
        background: getNotificationColor(type),
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        maxWidth: '400px'
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        removeNotification(notification);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'var(--accent-success)';
        case 'error': return 'var(--accent-error)';
        case 'warning': return 'var(--accent-warning)';
        default: return 'var(--accent-primary)';
    }
}

/**
 * Performance Optimizations
 */

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function for resize events
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Optimize scroll events
const optimizedScrollHandler = throttle(function() {
    updateActiveNavLink();
}, 100);

window.addEventListener('scroll', optimizedScrollHandler);

// Handle resize events
const optimizedResizeHandler = debounce(function() {
    // Recalculate any layout-dependent features
    updateActiveNavLink();
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

/**
 * Keyboard Navigation Support
 */
document.addEventListener('keydown', function(e) {
    // Skip to main content with Tab key
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        const firstFocusable = document.querySelector('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            e.preventDefault();
            firstFocusable.focus();
        }
    }
    
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navMenu.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            mobileMenuToggle.focus();
        }
    }
});

/**
 * Copy Email Functionality
 */
function copyEmail() {
    const email = 'kyle@designbykyle.com';
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(() => {
            showNotification('Email address copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(email);
        });
    } else {
        fallbackCopyTextToClipboard(email);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Email address copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy email address', 'error');
    }
    
    document.body.removeChild(textArea);
}

/**
 * Animated Text Typewriter Effect
 */
function initAnimatedText() {
    const animatedElement = document.getElementById('animated-role');
    if (!animatedElement) return;

    const roles = [
        'Web Developer',
        'Responsive Frontend Developer',
        'Modern UX/UI Designer',
        'Clean Code, Beautiful Interfaces',
        'Backend Tools: Python & PHP'
    ];

    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100; // Faster typing for longer text
    let deleteSpeed = 75; // Faster deleting for longer text
    let pauseTime = 2500; // Longer pause to read the complete text

    // Helper function to format text with gradient last word
    function formatTextWithGradientLastWord(text) {
        if (!text || text.trim() === '') return text;
        
        const words = text.split(' ');
        if (words.length === 1) {
            // If it's a single word, apply gradient to the whole word
            return `<span class="gradient-word">${text}</span>`;
        }
        
        // Apply gradient to the last word
        const lastWord = words.pop();
        const otherWords = words.join(' ');
        
        if (otherWords) {
            return `${otherWords} <span class="gradient-word">${lastWord}</span>`;
        } else {
            return `<span class="gradient-word">${lastWord}</span>`;
        }
    }

    function typeWriter() {
        const currentRole = roles[currentRoleIndex];
        
        if (isDeleting) {
            // Remove characters
            const currentText = currentRole.substring(0, currentCharIndex - 1);
            animatedElement.innerHTML = formatTextWithGradientLastWord(currentText);
            currentCharIndex--;
            
            if (currentCharIndex === 0) {
                isDeleting = false;
                currentRoleIndex = (currentRoleIndex + 1) % roles.length;
                setTimeout(typeWriter, 500); // Pause before typing next role
            } else {
                setTimeout(typeWriter, deleteSpeed);
            }
        } else {
            // Add characters
            const currentText = currentRole.substring(0, currentCharIndex + 1);
            animatedElement.innerHTML = formatTextWithGradientLastWord(currentText);
            currentCharIndex++;
            
            if (currentCharIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(typeWriter, pauseTime); // Pause when word is complete
            } else {
                setTimeout(typeWriter, typeSpeed);
            }
        }
    }

    // Start the animation after a short delay
    setTimeout(typeWriter, 1000);
}

/**
 * Profile Image Placeholder Generator
 */
function generateProfilePlaceholder() {
    const profileImg = document.querySelector('.profile-photo');
    if (!profileImg) return;

    // Check if image fails to load
    profileImg.addEventListener('error', function() {
        // Create canvas placeholder
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 300;
        canvas.height = 300;
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 300, 300);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#8b5cf6');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 300, 300);
        
        // Add initials
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('KL', 150, 150);
        
        // Replace image source
        this.src = canvas.toDataURL();
        this.style.objectFit = 'cover';
    });
}

// Initialize profile placeholder on load
document.addEventListener('DOMContentLoaded', generateProfilePlaceholder);

// Make copy function globally available
window.copyEmail = copyEmail;
