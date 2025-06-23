// Skills Animation Script
document.addEventListener('DOMContentLoaded', function() {
    // Create Intersection Observer for skills animation
    const observeSkills = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-bar');
                
                skillBars.forEach((bar, index) => {
                    const width = bar.dataset.width;
                    
                    // Set CSS custom property for the target width
                    bar.style.setProperty('--target-width', width + '%');
                    
                    // Animate with staggered delay
                    setTimeout(() => {
                        bar.style.width = width + '%';
                        bar.classList.add('animated');
                        
                        // Add pulse animation to percentage text
                        const percentageElement = bar.closest('.skill-item').querySelector('.skill-percentage');
                        if (percentageElement) {
                            percentageElement.style.animation = 'pulse 0.5s ease-in-out';
                        }
                    }, index * 200); // 200ms delay between each bar
                });
                
                // Unobserve after animation triggers
                observeSkills.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation a bit before element is fully visible
    });
    
    // Observe the skills section
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        observeSkills.observe(skillsSection);
    }
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Add hover effects for skill items
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const bar = this.querySelector('.skill-bar');
            if (bar) {
                bar.style.animationDuration = '1.5s';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const bar = this.querySelector('.skill-bar');
            if (bar) {
                bar.style.animationDuration = '3s';
            }
        });
    });
});

// Optional: Reset animations when scrolling back up (for demo purposes)
function resetSkillAnimations() {
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
        bar.style.width = '0%';
        bar.classList.remove('animated');
    });
    
    // Re-observe the skills section
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        observeSkills.observe(skillsSection);
    }
}
