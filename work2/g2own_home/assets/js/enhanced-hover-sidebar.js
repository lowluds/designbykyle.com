/**
 * Simple Enhanced Hover Sidebar - Theme Matching Creative Design
 * Clean hover-to-open with G2Own gaming theme enhancements
 */

class EnhancedHoverSidebar {
    constructor() {
        this.sidebar = document.getElementById('left-sidebar');
        if (!this.sidebar) {
            console.error('❌ Left sidebar not found');
            return;
        }
        
        this.isHovering = false;
        this.hoverZone = null;
        this.themeIndicator = null;
        
        this.init();
    }
    
    init() {
        try {
            this.cleanupOldSystems();
            this.setupSidebar();
            this.createThemeIndicators();
            this.setupHoverSystem();
            this.addThemeStyles();
            
            console.log('✅ Enhanced Hover Sidebar initialized');
        } catch (error) {
            console.error('❌ Error initializing enhanced hover:', error);
        }
    }
    
    cleanupOldSystems() {
        // Remove any existing overlay systems
        const oldElements = [
            '.sidebar-hover-zone',
            '.sidebar-edge-indicator',
            '.sidebar-icon-preview',
            '.sidebar-expand-arrow',
            '.g2own-speed-dial-fab'
        ];
        
        oldElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        // Remove old styles
        const oldStyles = document.querySelectorAll('#sidebar-arrow-styles, #g2own-fab-styles, #elegant-fab-styles');
        oldStyles.forEach(style => style.remove());
        
        // Clean body classes
        document.body.classList.remove('sidebar-system', 'user-discovered');
        
        console.log('🧹 Old systems cleaned up');
    }
    
    setupSidebar() {
        // Set sidebar to hidden by default
        this.sidebar.style.transform = 'translateX(-100%)';
        this.sidebar.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.sidebar.style.position = 'fixed';
        this.sidebar.style.zIndex = '1000';
        
        console.log('📐 Sidebar setup complete');
    }
    
    createThemeIndicators() {
        // Create gaming-themed hover zone
        this.hoverZone = document.createElement('div');
        this.hoverZone.className = 'gaming-hover-zone';
        this.hoverZone.innerHTML = `
            <div class="hover-zone-content">
                <!-- Gaming-themed edge indicator -->
                <div class="gaming-edge-bar">
                    <div class="edge-pulse"></div>
                    <div class="edge-glow"></div>
                </div>
                
                <!-- Creative floating navigation hints -->
                <div class="nav-hints">
                    <div class="nav-hint" data-hint="🏠 Home">
                        <div class="hint-icon">🏠</div>
                        <div class="hint-trail"></div>
                    </div>
                    <div class="nav-hint" data-hint="🛒 Shop">
                        <div class="hint-icon">🛒</div>
                        <div class="hint-trail"></div>
                    </div>
                    <div class="nav-hint" data-hint="📚 Library">
                        <div class="hint-icon">📚</div>
                        <div class="hint-trail"></div>
                    </div>
                    <div class="nav-hint" data-hint="👤 Profile">
                        <div class="hint-icon">👤</div>
                        <div class="hint-trail"></div>
                    </div>
                    <div class="nav-hint" data-hint="⚙️ Settings">
                        <div class="hint-icon">⚙️</div>
                        <div class="hint-trail"></div>
                    </div>
                </div>
                
                <!-- Hover instruction -->
                <div class="hover-instruction">
                    <div class="instruction-text">Hover to Navigate</div>
                    <div class="instruction-arrow">→</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.hoverZone);
        
        console.log('🎮 Gaming theme indicators created');
    }
    
    addThemeStyles() {
        const themeStyles = document.createElement('style');
        themeStyles.id = 'enhanced-hover-theme-styles';
        themeStyles.textContent = `            /* Gaming-Themed Hover Zone */
            .gaming-hover-zone {
                position: fixed;
                top: 0;
                left: 0;
                width: 120px;
                height: 100vh;
                z-index: 999;
                pointer-events: all;
                cursor: pointer;
            }
            
            .hover-zone-content {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
              /* Gaming Edge Bar */
            .gaming-edge-bar {
                position: absolute;
                top: 0;
                left: 0;
                width: 6px;
                height: 100vh;
                background: linear-gradient(
                    180deg,
                    transparent 0%,
                    rgba(239, 68, 68, 0.4) 10%,
                    #ef4444 25%,
                    #dc2626 50%,
                    #ef4444 75%,
                    rgba(239, 68, 68, 0.4) 90%,
                    transparent 100%
                );
                overflow: hidden;
                border-radius: 0 3px 3px 0;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
            }
            
            .edge-pulse {
                position: absolute;
                top: -100px;
                left: 0;
                width: 100%;
                height: 150px;
                background: linear-gradient(
                    180deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.9) 40%,
                    rgba(255, 255, 255, 1) 50%,
                    rgba(255, 255, 255, 0.9) 60%,
                    transparent 100%
                );
                animation: edgePulse 4s ease-in-out infinite;
                border-radius: 0 3px 3px 0;
            }
            
            .edge-glow {
                position: absolute;
                top: 0;
                left: -3px;
                width: 12px;
                height: 100%;
                background: rgba(239, 68, 68, 0.4);
                filter: blur(6px);
                opacity: 0.8;
            }
              /* Navigation Hints */
            .nav-hints {
                position: absolute;
                top: 50%;
                left: 20px;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 35px;
            }
              .nav-hint {
                position: relative;
                width: 60px;
                height: 60px;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(25px);
                border: 3px solid rgba(239, 68, 68, 0.7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                overflow: visible;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 
                           inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
              .nav-hint:hover {
                transform: scale(1.25);
                border-color: #ef4444;
                box-shadow: 0 0 30px rgba(239, 68, 68, 0.6),
                           0 0 60px rgba(239, 68, 68, 0.3),
                           inset 0 1px 0 rgba(255, 255, 255, 0.2);
                background: rgba(239, 68, 68, 0.15);
                border-width: 4px;
            }
              .hint-icon {
                font-size: 24px;
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                z-index: 10;
                position: relative;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            }
            
            .nav-hint:hover .hint-icon {
                transform: scale(1.15) rotate(5deg);
                filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4));
            }
            
            /* Fix for middle button background issue */
            .nav-hint:nth-child(3) {
                background: rgba(0, 0, 0, 0.98) !important;
                border-color: rgba(239, 68, 68, 0.8) !important;
            }
            
            .nav-hint:nth-child(3):hover {
                background: rgba(239, 68, 68, 0.2) !important;
            }
              /* Hint Trails */
            .hint-trail {
                position: absolute;
                top: 50%;
                left: 100%;
                width: 0;
                height: 3px;
                background: linear-gradient(
                    90deg,
                    rgba(239, 68, 68, 0.9) 0%,
                    rgba(239, 68, 68, 0.6) 50%,
                    transparent 100%
                );
                transform: translateY(-50%);
                transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                border-radius: 2px;
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
            }
            
            .nav-hint:hover .hint-trail {
                width: 50px;
            }
            
            /* Add pulsing animation rings */
            .nav-hint::before {
                content: '';
                position: absolute;
                inset: -8px;
                border: 2px solid rgba(239, 68, 68, 0.3);
                border-radius: 50%;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.4s ease;
            }
            
            .nav-hint:hover::before {
                opacity: 1;
                transform: scale(1.1);
                border-color: rgba(239, 68, 68, 0.6);
            }
            
            /* Add inner glow effect */
            .nav-hint::after {
                content: '';
                position: absolute;
                inset: 6px;
                background: radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
                border-radius: 50%;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .nav-hint:hover::after {
                opacity: 1;
            }
              /* Hover Instruction */
            .hover-instruction {
                position: absolute;
                bottom: 40px;
                left: 30px;
                transform: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                opacity: 0.8;
                transition: opacity 0.3s ease;
            }
            
            .gaming-hover-zone:hover .hover-instruction {
                opacity: 0.3;
            }
              .instruction-text {
                font-size: 14px;
                color: #ef4444;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.2px;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
              .instruction-arrow {
                font-size: 20px;
                color: #ef4444;
                animation: arrowBounce 2s ease-in-out infinite;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                font-weight: bold;
            }
            
            /* Sidebar Enhancement */
            .left-sidebar.hover-active {
                transform: translateX(0) !important;
                box-shadow: 8px 0 30px rgba(0, 0, 0, 0.3);
            }
            
            .left-sidebar.hover-active .sidebar-container {
                animation: sidebarSlideIn 0.5s ease-out forwards;
            }
            
            /* Backdrop when sidebar is open */
            .sidebar-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(2px);
                z-index: 999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .sidebar-backdrop.active {
                opacity: 1;
                visibility: visible;
            }
              /* Animations */
            @keyframes edgePulse {
                0%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                50% {
                    transform: translateY(100vh);
                    opacity: 1;
                }
            }
            
            @keyframes arrowBounce {
                0%, 100% {
                    transform: translateX(0) scale(1);
                }
                50% {
                    transform: translateX(8px) scale(1.1);
                }
            }
            
            @keyframes sidebarSlideIn {
                0% {
                    opacity: 0.5;
                    transform: translateX(-20px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
              /* Gaming Theme Enhancements */
            .nav-hint:nth-child(1) { 
                animation-delay: 0s; 
                --pulse-delay: 0s;
            }
            .nav-hint:nth-child(2) { 
                animation-delay: 0.3s; 
                --pulse-delay: 0.6s;
            }
            .nav-hint:nth-child(3) { 
                animation-delay: 0.6s; 
                --pulse-delay: 1.2s;
            }
            .nav-hint:nth-child(4) { 
                animation-delay: 0.9s; 
                --pulse-delay: 1.8s;
            }
            .nav-hint:nth-child(5) { 
                animation-delay: 1.2s; 
                --pulse-delay: 2.4s;
            }
            
            @keyframes hintFloat {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                }
                25% {
                    transform: translateY(-4px) rotate(1deg);
                }
                50% {
                    transform: translateY(-2px) rotate(0deg);
                }
                75% {
                    transform: translateY(-6px) rotate(-1deg);
                }
            }
            
            @keyframes hintPulse {
                0%, 100% {
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 
                               inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
                50% {
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4),
                               0 0 0 4px rgba(239, 68, 68, 0.3),
                               0 0 0 8px rgba(239, 68, 68, 0.1),
                               inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
            }
            
            .nav-hint {
                animation: hintFloat 4s ease-in-out infinite, 
                          hintPulse 3s ease-in-out infinite;
                animation-delay: var(--pulse-delay), calc(var(--pulse-delay) + 0.5s);
            }
              /* Responsive Design */
            @media (max-width: 768px) {
                .gaming-hover-zone {
                    width: 90px;
                }
                
                .nav-hints {
                    left: 15px;
                }
                
                .nav-hint {
                    width: 55px;
                    height: 55px;
                }
                
                .hint-icon {
                    font-size: 22px;
                }
                
                .gaming-edge-bar {
                    width: 5px;
                }
            }
            
            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .edge-pulse,
                .nav-hint,
                .instruction-arrow {
                    animation: none;
                }
                
                .nav-hint,
                .sidebar-container {
                    transition-duration: 0.1s;
                }
            }
            
            /* Focus states */
            .nav-hint:focus {
                outline: 3px solid #ef4444;
                outline-offset: 4px;
            }
              /* Dark mode enhancements */
            @media (prefers-color-scheme: dark) {
                .nav-hint {
                    background: rgba(20, 20, 20, 0.9);
                    border-color: rgba(239, 68, 68, 0.7);
                }
                
                .nav-hint:hover {
                    background: rgba(239, 68, 68, 0.3);
                }
            }
            
            /* Button Visibility and Clickability when Sidebar Closed */
            .left-sidebar .sidebar-auth {
                position: relative;
                z-index: 1000;
            }
            
            .left-sidebar .auth-buttons {
                position: relative;
                z-index: 1001;
            }
            
            .left-sidebar .btn-auth,
            .left-sidebar .social-btn {
                pointer-events: all !important;
                cursor: pointer !important;
                position: relative;
                z-index: 1002;
                transition: all 0.3s ease;
            }
            
            /* Enhanced button visibility for collapsed state */
            .left-sidebar:not(.hover-active) .btn-auth:hover,
            .left-sidebar:not(.hover-active) .social-btn:hover {
                transform: translateX(5px) scale(1.05);
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                z-index: 1003;
            }
            
            /* Ensure buttons remain clickable even when sidebar content is hidden */
            .left-sidebar:not(.hover-active) .sidebar-auth,
            .left-sidebar:not(.hover-active) .auth-buttons,
            .left-sidebar:not(.hover-active) .social-auth {
                pointer-events: all;
                position: relative;
                z-index: 1000;
            }
            
            /* Button glow effect when hovering in collapsed state */
            .left-sidebar:not(.hover-active) .btn-auth:hover {
                background: linear-gradient(135deg, #a50000, #750000) !important;
                border-color: rgba(239, 68, 68, 0.6) !important;
            }
            
            .left-sidebar:not(.hover-active) .btn-outline:hover {
                background: rgba(239, 68, 68, 0.2) !important;
                border-color: rgba(239, 68, 68, 0.8) !important;
                color: #ffffff !important;
            }
              .left-sidebar:not(.hover-active) .social-btn:hover {
                background: rgba(239, 68, 68, 0.15) !important;
                border-color: rgba(239, 68, 68, 0.6) !important;
                transform: translateX(8px) scale(1.08);
            }
            
            /* Combined Auth Button Styling */
            .auth-combined {
                width: 100%;
                justify-content: center;
                font-weight: 600;
                letter-spacing: 0.5px;
                position: relative;
                overflow: hidden;
            }
            
            .auth-combined .btn-icon {
                font-size: 1.1rem;
            }
            
            .auth-combined:hover {
                background: linear-gradient(135deg, #a50000, #750000) !important;
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            }
            
            /* Enhanced animation for combined button */
            .auth-combined::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.6s ease;
            }
            
            .auth-combined:hover::before {
                left: 100%;
            }
        `;
        
        document.head.appendChild(themeStyles);
        console.log('🎨 Gaming theme styles added');
    }
      setupHoverSystem() {
        let hoverTimeout;
        let hideTimeout;
        
        // Hover zone enter - but check if hovering over buttons
        this.hoverZone.addEventListener('mouseenter', (e) => {
            clearTimeout(hideTimeout);
            this.isHovering = true;
            
            // Check if we're hovering over a button or clickable element
            if (this.isHoveringOverButton(e.target)) {
                console.log('🔘 Hovering over button - preventing sidebar open');
                return; // Don't open sidebar when hovering over buttons
            }
            
            hoverTimeout = setTimeout(() => {
                if (this.isHovering && !this.isCurrentlyHoveringButton()) {
                    this.showSidebar();
                }
            }, 150);
        });
        
        // Track mouse movement within hover zone to detect button hovers
        this.hoverZone.addEventListener('mousemove', (e) => {
            if (this.isHoveringOverButton(e.target)) {
                clearTimeout(hoverTimeout);
                console.log('🔘 Mouse moved over button - canceling sidebar open');
            } else if (!this.sidebar.classList.contains('hover-active')) {
                // Re-start hover timeout if not over button and sidebar not open
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    if (this.isHovering && !this.isCurrentlyHoveringButton()) {
                        this.showSidebar();
                    }
                }, 150);
            }
        });
        
        // Hover zone leave
        this.hoverZone.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            this.isHovering = false;
            
            hideTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.hideSidebar();
                }
            }, 300);
        });
        
        // Sidebar hover maintenance
        this.sidebar.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            this.isHovering = true;
        });
        
        this.sidebar.addEventListener('mouseleave', () => {
            this.isHovering = false;
            
            hideTimeout = setTimeout(() => {
                if (!this.isHovering) {
                    this.hideSidebar();
                }
            }, 300);
        });
        
        // Individual hint clicks for quick navigation
        this.hoverZone.addEventListener('click', (e) => {
            const hint = e.target.closest('.nav-hint');
            if (hint) {
                this.handleQuickNav(hint);
            }
        });
        
        // Setup button click handlers to ensure they work when sidebar is closed
        this.setupButtonClickHandlers();
        
        console.log('👂 Enhanced hover system with button detection setup');
    }
    
    showSidebar() {
        this.sidebar.classList.add('hover-active');
        this.addBackdrop();
        
        console.log('📖 Enhanced sidebar shown');
    }
    
    hideSidebar() {
        this.sidebar.classList.remove('hover-active');
        this.removeBackdrop();
        
        console.log('📕 Enhanced sidebar hidden');
    }
    
    addBackdrop() {
        if (!document.querySelector('.sidebar-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
            
            requestAnimationFrame(() => {
                backdrop.classList.add('active');
            });
        }
    }
    
    removeBackdrop() {
        const backdrop = document.querySelector('.sidebar-backdrop');
        if (backdrop) {
            backdrop.classList.remove('active');
            setTimeout(() => backdrop.remove(), 300);
        }
    }
    
    handleQuickNav(hint) {
        const hintText = hint.getAttribute('data-hint');
        console.log('🎯 Quick nav clicked:', hintText);
        
        // Extract action from hint
        if (hintText.includes('Home')) {
            this.scrollToSection('#hero');
        } else if (hintText.includes('Shop')) {
            this.scrollToSection('#marketplace');
        } else if (hintText.includes('Library')) {
            this.scrollToSection('#featured-games');
        }
        
        // Show sidebar after quick nav
        this.showSidebar();
    }
    
    scrollToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    destroy() {
        console.log('🧹 Cleaning up enhanced hover sidebar');
        
        if (this.hoverZone) {
            this.hoverZone.remove();
        }
        
        this.removeBackdrop();
        
        const styles = document.getElementById('enhanced-hover-theme-styles');
        if (styles) {
            styles.remove();
        }
        
        this.sidebar.classList.remove('hover-active');
        this.sidebar.style.transform = '';
        this.sidebar.style.transition = '';
    }
    
    // Helper method to check if hovering over a button or clickable element
    isHoveringOverButton(target) {
        if (!target) return false;
        
        // Check if target or its parent is a button or clickable element
        const clickableSelectors = [
            'button',
            '.btn',
            '.btn-auth',
            '.social-btn',
            '.sidebar-toggle',
            'a',
            '[role="button"]',
            '.clickable'
        ];
        
        // Check the target and its parents up to 3 levels
        let currentElement = target;
        let levels = 0;
        
        while (currentElement && levels < 3) {
            // Check if current element matches any clickable selector
            for (const selector of clickableSelectors) {
                if (currentElement.matches && currentElement.matches(selector)) {
                    return true;
                }
            }
            
            // Check by tag name for buttons
            if (currentElement.tagName === 'BUTTON' || currentElement.tagName === 'A') {
                return true;
            }
            
            currentElement = currentElement.parentElement;
            levels++;
        }
        
        return false;
    }
    
    // Helper method to check if currently hovering over any button in the sidebar
    isCurrentlyHoveringButton() {
        const sidebarButtons = this.sidebar.querySelectorAll('button, .btn, a, [role="button"]');
        
        for (const button of sidebarButtons) {
            if (button.matches(':hover')) {
                return true;
            }
        }
        
        return false;
    }
    
    // Setup button click handlers to ensure buttons work when sidebar is closed
    setupButtonClickHandlers() {
        // Get all buttons in the sidebar that should be clickable when closed
        const clickableButtons = this.sidebar.querySelectorAll('.btn-auth, .social-btn, .sidebar-toggle');
        
        clickableButtons.forEach(button => {
            // Ensure buttons are clickable and have proper pointer events
            button.style.pointerEvents = 'all';
            button.style.cursor = 'pointer';
              // Add click event listeners for specific button actions
            if (button.id === 'btn-auth-combined') {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('� Combined Login/Sign Up button clicked');
                    this.handleCombinedAuthClick();
                });
            } else if (button.classList.contains('social-btn')) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const provider = button.getAttribute('data-provider');
                    console.log('🌐 Social login clicked:', provider);
                    this.handleSocialLogin(provider);
                });
            }
        });
        
        console.log('🔘 Button click handlers setup for', clickableButtons.length, 'buttons');
    }    // Handle combined auth button click (matches top nav behavior)
    handleCombinedAuthClick() {
        // Open the same auth modal as top nav for consistency
        console.log('👤 Opening combined auth modal...');
        
        // Use the same logic as top nav - show modal with tabs
        if (window.topNavAuth && typeof window.topNavAuth.showAuthModal === 'function') {
            // Use top nav auth system for consistency
            window.topNavAuth.showAuthModal();
        } else {
            // Fallback if top nav auth not available
            this.showFallbackAuthModal();
        }
    }
    
    // Fallback auth modal for left nav
    showFallbackAuthModal() {
        const choice = confirm('Click OK for Login, Cancel for Sign Up');
        
        if (choice) {
            this.handleSignInClick();
        } else {
            this.handleSignUpClick();
        }
    }
    
    // Handle sign up button click (legacy method for social buttons)
    handleSignUpClick() {
        // You can implement sign up modal or redirect here
        console.log('Opening sign up...');
        alert('Sign up feature - to be implemented');
    }
    
    // Handle sign in button click (legacy method for social buttons)
    handleSignInClick() {
        // You can implement sign in modal or redirect here
        console.log('Opening sign in...');
        alert('Sign in feature - to be implemented');
    }
    
    // Handle social login button click
    handleSocialLogin(provider) {
        // You can implement social login here
        console.log(`Opening ${provider} login...`);
        alert(`${provider} login - to be implemented`);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Enhanced Gaming Hover Sidebar');
    
    setTimeout(() => {
        try {
            // Clean up any existing controllers
            if (window.leftSidebarController && typeof window.leftSidebarController.destroy === 'function') {
                window.leftSidebarController.destroy();
            }
            
            window.leftSidebarController = new EnhancedHoverSidebar();
            
            console.log('✅ Enhanced Gaming Hover Sidebar initialized');
            console.log('🎮 Hover over the left edge to see gaming-themed navigation!');
            
        } catch (error) {
            console.error('❌ Failed to initialize enhanced hover:', error);
        }
    }, 100);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedHoverSidebar;
}
