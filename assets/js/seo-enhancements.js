/* SEO Enhancement and Analytics Setup */

// Enhanced Meta Tags Management
function updateMetaTags() {
    // Update title with current section
    const sections = ['home', 'about', 'work', 'testimonials', 'contact'];
    const sectionTitles = {
        'home': 'Kyle L. - Full-Stack Web Developer | Modern Web Solutions',
        'about': 'Services - Kyle L. | Full-Stack Development & UI/UX Design',
        'work': 'Portfolio - Kyle L. | Web Development Projects & Case Studies',
        'testimonials': 'Testimonials - Kyle L. | Client Reviews & Success Stories',
        'contact': 'Contact - Kyle L. | Schedule Your Web Development Consultation'
    };
    
    // Get current section based on scroll position
    let currentSection = 'home';
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section;
            }
        }
    });
    
    // Update title
    document.title = sectionTitles[currentSection];
    
    // Update meta description based on section
    const metaDescriptions = {
        'home': 'Kyle L. - Experienced Full-Stack Web Developer specializing in modern, responsive websites and web applications. Serving North American businesses with 24h response time.',
        'about': 'Full-stack development services including React, Node.js, Python, UI/UX design, and web consulting. Modern solutions that drive business growth.',
        'work': 'View Kyle L.\'s portfolio of web development projects including business websites, web applications, and e-commerce solutions. Real results for real businesses.',
        'testimonials': 'Read what clients say about working with Kyle L. Professional web development services with proven results and exceptional client satisfaction.',
        'contact': 'Ready to start your web development project? Schedule a free consultation with Kyle L. 24h response time guaranteed. Let\'s build something amazing together.'
    };
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', metaDescriptions[currentSection]);
    }
}

// Schema.org Structured Data Enhancement
function addStructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Kyle L.",
        "jobTitle": "Full-Stack Web Developer",
        "description": "Experienced Full-Stack Web Developer specializing in modern, responsive websites and web applications that drive business growth.",
        "url": "https://lowluds.github.io/DesignByKyle",
        "image": "https://lowluds.github.io/DesignByKyle/assets/images/me1.jpg",
        "email": "kyle@lowluds.dev",
        "telephone": "+1-XXX-XXX-XXXX",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
        },
        "sameAs": [
            "https://linkedin.com/in/kyle-ludlow-designs",
            "https://github.com/lowluds"
        ],
        "knowsAbout": [
            "Web Development",
            "Full-Stack Development",
            "Frontend Development",
            "Backend Development",
            "React",
            "Node.js",
            "Python",
            "JavaScript",
            "TypeScript",
            "HTML5",
            "CSS3",
            "UI/UX Design",
            "Responsive Design",
            "Database Design",
            "API Development",
            "Web Applications",
            "E-commerce Development",
            "WordPress Development",
            "SEO Optimization",
            "Performance Optimization"
        ],
        "hasOccupation": {
            "@type": "Occupation",
            "name": "Web Developer",
            "description": "Full-stack web developer specializing in modern web applications and responsive design"
        },
        "alumniOf": {
            "@type": "EducationalOrganization",
            "name": "Self-Taught Developer"
        },
        "award": [
            "Client Satisfaction Excellence",
            "Modern Web Development Best Practices",
            "Responsive Design Specialist"
        ],
        "offers": {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Web Development Services",
                "description": "Full-stack web development, UI/UX design, and web consulting services"
            }
        }
    };
    
    // Add or update structured data script
    let existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
        existingScript.textContent = JSON.stringify(structuredData, null, 2);
    } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
    }
}

// Performance and Core Web Vitals Monitoring
function initPerformanceMonitoring() {
    // Measure and report Core Web Vitals
    function measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            // Send to analytics if needed
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                console.log('FID:', entry.processingStart - entry.startTime);
                // Send to analytics if needed
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
            // Send to analytics if needed
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // Run after page load
    if (document.readyState === 'complete') {
        measureCoreWebVitals();
    } else {
        window.addEventListener('load', measureCoreWebVitals);
    }
}

// Social Media Sharing Enhancement
function setupSocialSharing() {
    // Update Open Graph tags dynamically
    function updateOGTags(section) {
        const ogData = {
            'home': {
                title: 'Kyle L. - Full-Stack Web Developer',
                description: 'Experienced developer specializing in modern web applications and responsive design. 24h response time.',
                image: 'https://lowluds.github.io/DesignByKyle/assets/images/me1.jpg'
            },
            'work': {
                title: 'Kyle L. - Web Development Portfolio',
                description: 'View my latest web development projects and case studies. Modern solutions for real businesses.',
                image: 'https://lowluds.github.io/DesignByKyle/assets/images/portfolio1.png'
            }
        };
        
        const data = ogData[section] || ogData.home;
        
        // Update existing OG tags
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', data.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', data.description);
        document.querySelector('meta[property="og:image"]')?.setAttribute('content', data.image);
        
        // Update Twitter Card tags
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', data.title);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', data.description);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', data.image);
    }
    
    // Create social sharing buttons (if needed)
    function createShareButtons() {
        const shareContainer = document.createElement('div');
        shareContainer.className = 'social-share-buttons';
        shareContainer.innerHTML = `
            <button onclick="shareToLinkedIn()" class="share-btn linkedin">
                <i class="fab fa-linkedin"></i> Share on LinkedIn
            </button>
            <button onclick="shareToTwitter()" class="share-btn twitter">
                <i class="fab fa-twitter"></i> Share on Twitter
            </button>
        `;
        
        // Add to contact section if desired
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.appendChild(shareContainer);
        }
    }
}

// Analytics and Tracking Setup
function initAnalytics() {
    // Google Analytics 4 setup (replace with your GA4 ID)
    const GA4_ID = 'G-XXXXXXXXXX'; // Replace with actual GA4 ID
    
    // Load Google Analytics
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(gaScript);
    
    // Initialize GA4
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA4_ID);
    
    // Track custom events
    function trackEvent(eventName, parameters = {}) {
        gtag('event', eventName, parameters);
    }
    
    // Track section views
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = entry.target.id;
                trackEvent('section_view', {
                    section_name: sectionName,
                    engagement_time: Date.now()
                });
                updateMetaTags();
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all sections
    document.querySelectorAll('article[id]').forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Track form submissions
    document.getElementById('contactForm')?.addEventListener('submit', function() {
        trackEvent('form_submit', {
            form_name: 'contact_form',
            page_location: window.location.href
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('cta_click', {
                cta_text: this.textContent.trim(),
                cta_location: this.closest('article')?.id || 'unknown'
            });
        });
    });
}

// SEO-friendly URL Management
function initSEOFriendlyNavigation() {
    // Update URL without page reload for better SEO
    const navLinks = document.querySelectorAll('#nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Update URL
                history.pushState(null, null, `#${targetId}`);
                
                // Update page title and meta tags
                updateMetaTags();
                
                // Track navigation
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_view', {
                        page_title: document.title,
                        page_location: window.location.href
                    });
                }
            }
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        updateMetaTags();
    });
}

// Initialize all SEO enhancements
document.addEventListener('DOMContentLoaded', function() {
    addStructuredData();
    initPerformanceMonitoring();
    setupSocialSharing();
    initAnalytics();
    initSEOFriendlyNavigation();
    
    // Initial meta tag update
    setTimeout(updateMetaTags, 500);
});

// Social sharing functions
function shareToLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const description = encodeURIComponent(document.querySelector('meta[name="description"]')?.content || '');
    
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${description}`, '_blank');
}

function shareToTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out ${document.title}`);
    
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

// Export functions for external use
window.seoEnhancements = {
    updateMetaTags,
    trackEvent: (eventName, params) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }
    }
};
