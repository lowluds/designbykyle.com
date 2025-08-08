// Left Sidebar Controller - Enhanced Navigation with Authentication
// Handles all sidebar functionality including auth, navigation, and user management

class LeftSidebarController {
    constructor() {
        this.sidebar = document.getElementById('left-sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.floatingToggle = document.getElementById('sidebar-floating-toggle');
        this.backdrop = document.getElementById('sidebar-backdrop');
        this.authSection = document.getElementById('sidebar-auth');
        this.profileSection = document.getElementById('sidebar-profile');
        this.registerBtn = document.getElementById('btn-register');
        this.signinBtn = document.getElementById('btn-signin');
        this.themeToggle = document.getElementById('theme-toggle');
        
        this.isOpen = false;
        this.isCollapsed = false;
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentModal = null;
        
        this.init();
    }
      init() {
        this.setupEventListeners();
        this.setupAuthHandlers();
        this.setupThemeToggle();
        this.setupScrollEffects();
        this.checkAuthState();
        this.setupKeyboardShortcuts();
        this.setupTouchGestures();
        this.setupAccessibility();
        
        // Check for notifications on initialization
        this.checkNotifications();
        
        // Set up periodic notification checking (every 30 seconds)
        this.notificationInterval = setInterval(() => {
            this.checkNotifications();
        }, 30000);
        
        console.log('Left Sidebar Controller initialized');
    }
    
    setupEventListeners() {
        // Sidebar toggle buttons
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => {
                this.toggleCollapse();
            });
        }
        
        if (this.floatingToggle) {
            this.floatingToggle.addEventListener('click', () => {
                this.open();
            });
        }
        
        // Backdrop click to close
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => {
                this.close();
            });
        }
        
        // Navigation links
        this.setupNavigationLinks();
        
        // Social auth buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.currentTarget.dataset.provider;
                this.handleSocialAuth(provider);
            });
        });
        
        // Footer links
        document.querySelectorAll('.footer-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.handleFooterLink(href);
            });
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentModal) {
                    this.closeAuthModal(this.currentModal);
                } else if (this.isOpen) {
                    this.close();
                }
            }
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    setupAuthHandlers() {
        // Initialize session bridge integration
        this.sessionBridge = null;
        this.api = null;
        
        // Wait for session bridge to be available
        if (window.sessionBridge) {
            this.sessionBridge = window.sessionBridge;
        } else {
            setTimeout(() => {
                if (window.sessionBridge) {
                    this.sessionBridge = window.sessionBridge;
                    this.checkAuthState();
                }
            }, 1000);
        }

        // Combined auth button - main login/signup button
        const combinedAuthBtn = document.getElementById('btn-auth-combined');
        if (combinedAuthBtn) {
            combinedAuthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔑 Left sidebar login/signup button clicked');
                this.handleLoginSignupClick();
            });
        }

        // Social auth buttons
        document.querySelectorAll('.social-btn[data-provider]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = btn.dataset.provider;
                console.log(`🔑 Social login clicked: ${provider}`);
                this.handleSocialAuth(provider);
            });
        });

        // Listen for auth events from session bridge
        window.addEventListener('g2own:auth-update', (event) => {
            console.log('🔄 Left sidebar received auth update:', event.detail);
            this.handleAuthStateChange(event.detail);
        });

        window.addEventListener('g2own:auth-logout', () => {
            console.log('👋 Left sidebar received auth logout');
            this.updateAuthState(null);
        });

        // Listen for auth state changes from other components
        window.addEventListener('authStateChanged', (e) => {
            console.log('🔄 Left sidebar received auth state change:', e.detail);
            this.handleAuthStateChange(e.detail);
        });

        // Legacy buttons (if present)
        if (this.registerBtn) {
            this.registerBtn.addEventListener('click', () => {
                this.handleLoginSignupClick();
            });
        }
        
        if (this.signinBtn) {
            this.signinBtn.addEventListener('click', () => {
                this.handleLoginSignupClick();
            });
        }
    }
      handleLoginSignupClick() {
        console.log('🔑 Left sidebar login/signup clicked - redirecting to community');
        
        if (this.sessionBridge) {
            this.sessionBridge.redirectToLogin();
        } else {
            // Fallback redirect with return parameter
            const returnUrl = encodeURIComponent(window.location.href);
            window.location.href = `https://g2own.com/community/login/?return=${returnUrl}`;
        }
    }
    
    setupNavigationLinks() {
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Handle navigation
                const href = link.getAttribute('href');
                this.handleNavigation(href);
                
                // Auto-close on mobile
                if (window.innerWidth < 1024) {
                    this.close();
                }
            });
        });
    }
    
    setupThemeToggle() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
        
        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.add(`theme-${savedTheme}`);
        this.updateThemeIcon(savedTheme);
    }
    
    setupScrollEffects() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + S to toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.toggle();
            }
            
            // Ctrl/Cmd + Shift + C to toggle collapse
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                if (this.isOpen) {
                    this.toggleCollapse();
                }
            }
            
            // Ctrl/Cmd + Shift + L to open login
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                if (!this.isLoggedIn) {
                    this.showAuthModal('signin');
                }
            }
        });
    }
    
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipe = false;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                isSwipe = true;
                
                // Swipe right from left edge to open
                if (startX < 50 && deltaX > 100 && !this.isOpen) {
                    this.open();
                }
                
                // Swipe left to close
                if (deltaX < -100 && this.isOpen) {
                    this.close();
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            startX = 0;
            startY = 0;
            isSwipe = false;
        }, { passive: true });
    }
    
    setupAccessibility() {
        // Add ARIA attributes
        if (this.sidebar) {
            this.sidebar.setAttribute('role', 'navigation');
            this.sidebar.setAttribute('aria-label', 'Secondary navigation');
        }
        
        if (this.floatingToggle) {
            this.floatingToggle.setAttribute('aria-label', 'Open sidebar menu');
        }
        
        if (this.sidebarToggle) {
            this.sidebarToggle.setAttribute('aria-label', 'Toggle sidebar collapse');
        }
    }
    
    // Public Methods
    open() {
        this.isOpen = true;
        this.sidebar?.classList.add('active');
        document.body.classList.add('sidebar-open');
        
        // Update ARIA
        if (this.floatingToggle) {
            this.floatingToggle.setAttribute('aria-expanded', 'true');
        }
        
        // Emit custom event
        this.emitEvent('sidebar:opened');
        
        // Focus management
        this.focusFirstElement();
    }
    
    close() {
        this.isOpen = false;
        this.sidebar?.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        
        // Update ARIA
        if (this.floatingToggle) {
            this.floatingToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Emit custom event
        this.emitEvent('sidebar:closed');
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    toggleCollapse() {
        if (!this.isOpen) return;
        
        this.isCollapsed = !this.isCollapsed;
        this.sidebar?.classList.toggle('collapsed', this.isCollapsed);
        
        // Update ARIA
        if (this.sidebarToggle) {
            this.sidebarToggle.setAttribute('aria-label', 
                this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
        }
        
        // Emit custom event
        this.emitEvent('sidebar:collapsed', { collapsed: this.isCollapsed });
    }
    
    // Authentication Methods
    showAuthModal(type) {
        // Close sidebar on mobile when showing modal
        if (window.innerWidth < 768) {
            this.close();
        }
        
        // Create and show authentication modal
        const modal = this.createAuthModal(type);
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Add show class after a brief delay for animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
        
        // Emit custom event
        this.emitEvent('auth:modal-opened', { type });
    }
    
    createAuthModal(type) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-backdrop"></div>
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2 class="auth-modal-title">
                        ${type === 'register' ? 'Create Your Account' : 'Welcome Back'}
                    </h2>
                    <button class="auth-modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="auth-modal-body">
                    ${this.getAuthFormHTML(type)}
                </div>
            </div>
        `;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.auth-modal-close');
        const backdrop = modal.querySelector('.auth-modal-backdrop');
        const form = modal.querySelector('.auth-form');
        
        closeBtn.addEventListener('click', () => {
            this.closeAuthModal(modal);
        });
        
        backdrop.addEventListener('click', () => {
            this.closeAuthModal(modal);
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form, type);
        });
        
        // Switch between signin/register
        const switchLinks = modal.querySelectorAll('.switch-to-signin, .switch-to-register');
        switchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const newType = link.classList.contains('switch-to-signin') ? 'signin' : 'register';
                this.switchAuthModal(modal, newType);
            });
        });
        
        // Social auth buttons
        modal.querySelectorAll('.modal-social-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                this.handleSocialAuth(provider);
            });
        });
        
        // Real-time validation
        this.setupFormValidation(modal);
        
        return modal;
    }
    
    getAuthFormHTML(type) {
        if (type === 'register') {
            return `
                <form class="auth-form" id="register-form">
                    <div class="form-group">
                        <label for="reg-username">Username</label>
                        <input type="text" id="reg-username" name="username" placeholder="Choose a unique username" required>
                        <div class="error-message" id="username-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-email">Email Address</label>
                        <input type="email" id="reg-email" name="email" placeholder="your@email.com" required>
                        <div class="error-message" id="email-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-password">Password</label>
                        <input type="password" id="reg-password" name="password" placeholder="Create a strong password" required>
                        <div class="password-strength">
                            <div class="strength-bar">
                                <div class="strength-fill" id="strength-fill"></div>
                            </div>
                            <div class="strength-text" id="strength-text">Password strength</div>
                        </div>
                        <div class="error-message" id="password-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="reg-confirm-password">Confirm Password</label>
                        <input type="password" id="reg-confirm-password" name="confirm-password" placeholder="Confirm your password" required>
                        <div class="error-message" id="confirm-password-error"></div>
                    </div>
                    <div class="form-group form-checkbox">
                        <input type="checkbox" id="reg-terms" name="terms" required>
                        <label for="reg-terms">I agree to the <a href="#terms" target="_blank">Terms of Service</a> and <a href="#privacy" target="_blank">Privacy Policy</a></label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Create Account</button>
                    
                    <div class="modal-social-auth">
                        <div class="modal-social-title">Or sign up with</div>
                        <div class="modal-social-buttons">
                            <button type="button" class="modal-social-btn google" data-provider="google">
                                <span>🔴</span> Continue with Google
                            </button>
                            <button type="button" class="modal-social-btn discord" data-provider="discord">
                                <span>💜</span> Continue with Discord
                            </button>
                            <button type="button" class="modal-social-btn steam" data-provider="steam">
                                <span>🎮</span> Continue with Steam
                            </button>
                        </div>
                    </div>
                    
                    <p class="auth-switch">
                        Already have an account? 
                        <span class="switch-to-signin">Sign in here</span>
                    </p>
                </form>
            `;
        } else {
            return `
                <form class="auth-form" id="signin-form">
                    <div class="form-group">
                        <label for="login-email">Email or Username</label>
                        <input type="text" id="login-email" name="email" placeholder="Enter your email or username" required>
                        <div class="error-message" id="login-email-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" name="password" placeholder="Enter your password" required>
                        <div class="error-message" id="login-password-error"></div>
                    </div>
                    <div class="form-group form-checkbox">
                        <input type="checkbox" id="remember-me" name="remember">
                        <label for="remember-me">Keep me signed in</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Sign In</button>
                    <a href="#forgot" class="forgot-password">Forgot your password?</a>
                    
                    <div class="modal-social-auth">
                        <div class="modal-social-title">Or continue with</div>
                        <div class="modal-social-buttons">
                            <button type="button" class="modal-social-btn google" data-provider="google">
                                <span>🔴</span> Sign in with Google
                            </button>
                            <button type="button" class="modal-social-btn discord" data-provider="discord">
                                <span>💜</span> Sign in with Discord
                            </button>
                            <button type="button" class="modal-social-btn steam" data-provider="steam">
                                <span>🎮</span> Sign in with Steam
                            </button>
                        </div>
                    </div>
                    
                    <p class="auth-switch">
                        New to G2Own? 
                        <span class="switch-to-register">Create an account</span>
                    </p>
                </form>
            `;
        }
    }
    
    switchAuthModal(modal, newType) {
        const body = modal.querySelector('.auth-modal-body');
        const title = modal.querySelector('.auth-modal-title');
        
        // Update title
        title.textContent = newType === 'register' ? 'Create Your Account' : 'Welcome Back';
        
        // Update form
        body.innerHTML = this.getAuthFormHTML(newType);
        
        // Re-setup event listeners for new form
        const form = modal.querySelector('.auth-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form, newType);
        });
        
        // Re-setup switch links
        const switchLinks = modal.querySelectorAll('.switch-to-signin, .switch-to-register');
        switchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const type = link.classList.contains('switch-to-signin') ? 'signin' : 'register';
                this.switchAuthModal(modal, type);
            });
        });
        
        // Re-setup social auth
        modal.querySelectorAll('.modal-social-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.dataset.provider;
                this.handleSocialAuth(provider);
            });
        });
        
        // Re-setup validation
        this.setupFormValidation(modal);
        
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    setupFormValidation(modal) {
        const form = modal.querySelector('.auth-form');
        const inputs = form.querySelectorAll('input');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('input', () => {
                this.validateField(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
        
        // Password strength checker
        const passwordInput = form.querySelector('#reg-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.updatePasswordStrength(passwordInput);
            });
        }
        
        // Confirm password validation
        const confirmInput = form.querySelector('#reg-confirm-password');
        if (confirmInput && passwordInput) {
            confirmInput.addEventListener('input', () => {
                this.validatePasswordConfirm(passwordInput, confirmInput);
            });
        }
    }
    
    validateField(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        // Reset state
        formGroup.classList.remove('error', 'success');
        if (errorElement) errorElement.textContent = '';
        
        // Validate based on field type
        let isValid = true;
        let errorMessage = '';
        
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (input.value && !emailRegex.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        if (input.name === 'username') {
            if (input.value.length > 0 && input.value.length < 3) {
                isValid = false;
                errorMessage = 'Username must be at least 3 characters';
            }
        }
        
        if (input.required && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Update UI
        if (!isValid) {
            formGroup.classList.add('error');
            if (errorElement) errorElement.textContent = errorMessage;
        } else if (input.value.trim()) {
            formGroup.classList.add('success');
        }
        
        return isValid;
    }
    
    updatePasswordStrength(passwordInput) {
        const password = passwordInput.value;
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        
        if (!strengthFill || !strengthText) return;
        
        let strength = 0;
        let strengthLabel = 'Too weak';
        
        // Check password criteria
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        
        // Update UI based on strength
        strengthFill.className = 'strength-fill';
        
        if (strength >= 4) {
            strengthFill.classList.add('strong');
            strengthLabel = 'Strong password';
        } else if (strength >= 3) {
            strengthFill.classList.add('good');
            strengthLabel = 'Good password';
        } else if (strength >= 2) {
            strengthFill.classList.add('fair');
            strengthLabel = 'Fair password';
        } else if (strength >= 1) {
            strengthFill.classList.add('weak');
            strengthLabel = 'Weak password';
        }
        
        strengthText.textContent = strengthLabel;
    }
    
    validatePasswordConfirm(passwordInput, confirmInput) {
        const formGroup = confirmInput.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        formGroup.classList.remove('error', 'success');
        if (errorElement) errorElement.textContent = '';
        
        if (confirmInput.value && confirmInput.value !== passwordInput.value) {
            formGroup.classList.add('error');
            if (errorElement) errorElement.textContent = 'Passwords do not match';
            return false;
        } else if (confirmInput.value) {
            formGroup.classList.add('success');
        }
        
        return true;
    }
    
    async handleFormSubmission(form, type) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        let isValid = true;
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        try {
            if (type === 'register') {
                await this.register(data);
            } else {
                await this.login(data);
            }
            
            // Close modal on success
            this.closeAuthModal(this.currentModal);
            
        } catch (error) {
            console.error('Auth error:', error);
            this.showNotification(error.message || 'An error occurred', 'error');
        } finally {
            // Reset loading state
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }
    
    closeAuthModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
        
        this.currentModal = null;
        
        // Emit custom event
        this.emitEvent('auth:modal-closed');
    }
    
    // User Authentication
    async login(credentials) {
        try {
            // Simulate API call
            const response = await this.simulateAuthAPI('login', credentials);
            
            if (response.success) {
                this.currentUser = response.user;
                this.isLoggedIn = true;
                this.updateAuthState();
                this.showNotification(`Welcome back, ${response.user.name}!`, 'success');
                
                // Store auth token
                localStorage.setItem('auth_token', response.token);
                
                // Emit custom event
                this.emitEvent('auth:login-success', { user: this.currentUser });
            } else {
                throw new Error(response.message || 'Invalid credentials');
            }
        } catch (error) {
            throw error;
        }
    }
    
    async register(userData) {
        try {
            // Simulate API call
            const response = await this.simulateAuthAPI('register', userData);
            
            if (response.success) {
                this.currentUser = response.user;
                this.isLoggedIn = true;
                this.updateAuthState();
                this.showNotification(`Welcome to G2Own, ${response.user.name}!`, 'success');
                
                // Store auth token
                localStorage.setItem('auth_token', response.token);
                
                // Emit custom event
                this.emitEvent('auth:register-success', { user: this.currentUser });
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            throw error;
        }
    }
    
    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.updateAuthState();
        
        // Clear stored data
        localStorage.removeItem('auth_token');
        
        this.showNotification('Logged out successfully', 'info');
        
        // Emit custom event
        this.emitEvent('auth:logout');
    }
      // Helper Methods
    updateAuthState(user = null) {
        // Update user data if passed
        if (user) {
            this.currentUser = user;
            this.isLoggedIn = true;
        } else if (user === null) {
            this.currentUser = null;
            this.isLoggedIn = false;
        }
        
        console.log('🔄 Left sidebar updating auth state:', this.isLoggedIn ? 'logged in' : 'logged out');
        
        if (this.isLoggedIn && this.currentUser) {
            // Hide auth section, show profile
            if (this.authSection) {
                this.authSection.classList.add('hidden');
                this.authSection.style.display = 'none';
            }
            if (this.profileSection) {
                this.profileSection.classList.remove('hidden');
                this.profileSection.style.display = 'block';
            }
            
            // Update profile information
            this.updateProfileDisplay();
            
            console.log('👤 Left sidebar: Showing profile UI for:', this.currentUser.name || 'User');
        } else {
            // Show auth section, hide profile
            if (this.authSection) {
                this.authSection.classList.remove('hidden');
                this.authSection.style.display = 'block';
            }
            if (this.profileSection) {
                this.profileSection.classList.add('hidden');
                this.profileSection.style.display = 'none';
            }
            
            console.log('🔐 Left sidebar: Showing login/signup UI');
        }
        
        // Emit event for other components
        this.emitEvent('sidebar:auth-state-changed', { 
            isLoggedIn: this.isLoggedIn, 
            user: this.currentUser 
        });
    }    updateProfileDisplay() {
        if (!this.currentUser || !this.profileSection) return;
        
        console.log('🎨 Left sidebar updating profile display for:', this.currentUser.name || 'User');
        
        const avatar = this.profileSection.querySelector('.avatar-image');
        const name = this.profileSection.querySelector('.profile-name');
        const level = this.profileSection.querySelector('.profile-level');
        const stats = this.profileSection.querySelectorAll('.stat');
        
        // Update avatar with security validation
        if (avatar) {
            const avatarUrl = this.currentUser.avatar || this.currentUser.photo || 'assets/images/default-avatar.svg';
            avatar.src = avatarUrl;
            
            const displayName = this.currentUser.name || this.currentUser.display_name || 'User';
            const sanitizedName = window.securityUtils 
                ? window.securityUtils.sanitizeHtml(displayName)
                : displayName;
            avatar.alt = `${sanitizedName}'s avatar`;
            
            avatar.onerror = function() {
                this.src = 'assets/images/default-avatar.svg';
            };
        }
        
        // Update name with sanitization
        if (name) {
            const displayName = this.currentUser.name || this.currentUser.display_name || this.currentUser.username || 'User';
            const sanitizedName = window.securityUtils 
                ? window.securityUtils.sanitizeHtml(displayName)
                : displayName;
            name.textContent = sanitizedName;
        }
        
        // Update level/title with sanitization
        if (level) {
            const userLevel = this.currentUser.level || this.currentUser.group?.name || 'Member';
            const sanitizedLevel = window.securityUtils 
                ? window.securityUtils.sanitizeHtml(userLevel)
                : userLevel;
            const levelText = typeof userLevel === 'number' ? `Level ${userLevel} Trader` : sanitizedLevel;
            level.textContent = levelText;
        }
        
        // Update stats
        if (stats.length >= 2) {
            const rating = this.currentUser.rating || this.currentUser.reputation || 0;
            const sales = this.currentUser.sales || this.currentUser.posts || 0;
            
            if (stats[0]) {
                stats[0].innerHTML = `<i class="ph ph-star gaming-icon"></i> ${rating}`;
            }
            if (stats[1]) {
                stats[1].innerHTML = `<i class="ph ph-shopping-cart gaming-icon"></i> ${sales} Sales`;
            }
        }
    }checkAuthState() {
        console.log('🔍 Left sidebar checking auth state...');
        
        // First try to get current user from session bridge
        if (this.sessionBridge && typeof this.sessionBridge.getCurrentUser === 'function') {
            this.sessionBridge.getCurrentUser().then(user => {
                if (user && user.id) {
                    this.currentUser = user;
                    this.isLoggedIn = true;
                    console.log('✅ Left sidebar: Session bridge user found:', user.name || 'User');
                } else {
                    this.currentUser = null;
                    this.isLoggedIn = false;
                    console.log('❌ Left sidebar: No session bridge user found');
                }
                this.updateAuthState();
            }).catch(error => {
                console.error('❌ Left sidebar: Session bridge error:', error);
                this.fallbackAuthCheck();
            });
        } else {
            console.log('⚠️ Left sidebar: Session bridge not available, using fallback');
            this.fallbackAuthCheck();
        }
        
        // Check notifications after auth state check
        setTimeout(() => {
            this.checkNotifications();
        }, 1000);
    }

    fallbackAuthCheck() {
        // Fallback: Check for stored auth token
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.validateAndRestoreSession(token);
        } else {
            this.updateAuthState();
        }
    }
    
    async validateAndRestoreSession(token) {
        try {
            const response = await this.simulateAuthAPI('validate', { token });
            
            if (response.success) {
                this.currentUser = response.user;
                this.isLoggedIn = true;
                this.updateAuthState();
            } else {
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            localStorage.removeItem('auth_token');
        }
    }
    
    async simulateAuthAPI(action, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        switch (action) {
            case 'login':
                // Simulate login validation
                if (data.email === 'demo@g2own.com' && data.password === 'demo123') {
                    return {
                        success: true,
                        token: 'demo_token_' + Date.now(),
                        user: {
                            id: 1,
                            username: 'demo_user',
                            name: 'Demo User',
                            email: 'demo@g2own.com',
                            avatar: 'assets/images/default-avatar.svg',
                            level: 5,
                            rating: 4.8,
                            sales: 25
                        }
                    };
                } else {
                    return {
                        success: false,
                        message: 'Invalid email or password'
                    };
                }
                
            case 'register':
                // Simulate registration
                return {
                    success: true,
                    token: 'new_token_' + Date.now(),
                    user: {
                        id: Date.now(),
                        username: data.username,
                        name: data.username,
                        email: data.email,                        avatar: 'assets/images/default-avatar.svg',
                        level: 1,
                        rating: 0,
                        sales: 0
                    }
                };
                
            case 'validate':
                // Simulate token validation
                if (data.token && data.token.startsWith('demo_token_')) {
                    return {
                        success: true,
                        user: {
                            id: 1,
                            username: 'demo_user',
                            name: 'Demo User',
                            email: 'demo@g2own.com',
                            avatar: 'assets/images/default-avatar.svg',
                            level: 5,
                            rating: 4.8,
                            sales: 25
                        }
                    };
                }
                return { success: false };
                
            default:
                return { success: false, message: 'Unknown action' };
        }
    }
    
    handleNavigation(href) {
        console.log('Navigating to:', href);
        
        // Update active link in main navbar if exists
        const mainNavLink = document.querySelector(`.navbar .nav-link[href="${href}"]`);
        if (mainNavLink) {
            document.querySelectorAll('.navbar .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            mainNavLink.classList.add('active');
        }
        
        // Smooth scroll to section if it's an anchor
        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        // Emit navigation event
        this.emitEvent('sidebar:navigation', { href });
    }
    
    handleFooterLink(href) {
        console.log('Footer link clicked:', href);
        
        switch (href) {
            case '#settings':
                this.showSettingsModal();
                break;
            case '#notifications':
                this.showNotificationsPanel();
                break;
            case '#theme':
                this.toggleTheme();
                break;
            default:
                this.handleNavigation(href);
        }
    }
      handleSocialAuth(provider) {
        console.log(`🔐 Social auth requested: ${provider}`);
        
        // Close sidebar first
        this.close();
        
        // Redirect to community social auth with return URL
        const returnUrl = encodeURIComponent(window.location.href);
        
        switch (provider) {
            case 'google':
                window.location.href = `https://g2own.com/community/login/google/?return=${returnUrl}`;
                break;
            case 'discord':
                window.location.href = `https://g2own.com/community/login/discord/?return=${returnUrl}`;
                break;
            case 'steam':
                window.location.href = `https://g2own.com/community/login/steam/?return=${returnUrl}`;
                break;
            default:
                console.warn('Unknown social provider:', provider);
        }
    }

    handleAuthStateChange(detail) {
        if (detail && detail.user) {
            this.currentUser = detail.user;
            this.isLoggedIn = true;
            console.log('👤 Left sidebar: User logged in:', detail.user.name || 'User');
        } else {
            this.currentUser = null;
            this.isLoggedIn = false;
            console.log('🚪 Left sidebar: User logged out');
        }
        
        this.updateAuthState();
    }
    
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.classList.contains('theme-dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.classList.remove(`theme-${currentTheme}`);
        body.classList.add(`theme-${newTheme}`);
        
        this.updateThemeIcon(newTheme);
        
        // Store theme preference
        localStorage.setItem('theme', newTheme);
        
        // Emit custom event
        this.emitEvent('theme:changed', { theme: newTheme });
    }
    
    updateThemeIcon(theme) {
        const themeIcon = this.themeToggle?.querySelector('.footer-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }
    
    showSettingsModal() {
        console.log('Settings modal would open here');
        this.showNotification('Settings panel coming soon!', 'info');
    }
    
    showNotificationsPanel() {
        console.log('Notifications panel would open here');
        this.showNotification('Notifications panel coming soon!', 'info');
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add to page
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        container.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove
        const removeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', removeNotification);
        
        // Auto-close
        if (duration > 0) {
            setTimeout(removeNotification, duration);
        }
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info':
            default: return 'ℹ️';
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Auto-hide floating toggle when scrolling up
        if (this.floatingToggle) {
            if (scrollY > 100) {
                this.floatingToggle.style.opacity = '0.7';
            } else {
                this.floatingToggle.style.opacity = '1';
            }
        }
    }
    
    handleResize() {
        // Auto-close sidebar on mobile when resizing to desktop
        if (window.innerWidth >= 1024 && this.isCollapsed) {
            // Reset collapsed state on desktop
            this.isCollapsed = false;
            this.sidebar?.classList.remove('collapsed');
        }
    }
    
    focusFirstElement() {
        const firstFocusable = this.sidebar?.querySelector('button, a, input, [tabindex="0"]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
    
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
    
    // Public API Methods
    setUser(user) {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        this.updateAuthState();
    }
    
    getUser() {
        return this.currentUser;
    }
    
    isAuthenticated() {
        return this.isLoggedIn;
    }
      updateNotificationCount(count) {
        const notificationDot = document.querySelector('.notification-dot');
        if (notificationDot) {
            const numCount = parseInt(count) || 0;
            notificationDot.style.display = numCount > 0 ? 'block' : 'none';
            
            // Add pulse animation for new notifications
            if (numCount > 0) {
                notificationDot.classList.add('pulse');
            } else {
                notificationDot.classList.remove('pulse');
            }
        }
    }
    
    // New method to check and update notifications from OAuth/backend
    async checkNotifications() {
        try {
            // Check if user is authenticated via OAuth
            const oauthManager = window.oauthManager;
            if (oauthManager && oauthManager.isAuthenticated()) {
                // Fetch notifications from Invision Community API
                const notifications = await oauthManager.fetchNotifications();
                const unreadCount = notifications?.unread_count || 0;
                this.updateNotificationCount(unreadCount);
            } else {
                // User not authenticated, hide notification dot
                this.updateNotificationCount(0);
            }
        } catch (error) {
            console.error('Error checking notifications:', error);
            // On error, hide notification dot
            this.updateNotificationCount(0);
        }
    }
    
    updateBadges(badges) {
        Object.keys(badges).forEach(selector => {
            const badge = document.querySelector(`.nav-link[href="${selector}"] .nav-badge`);
            if (badge) {
                const count = badges[selector];
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'none';
                
                // Add 'new' class for emphasis
                if (count > 0) {
                    badge.classList.add('new');
                } else {                    badge.classList.remove('new');
                }
            }
        });
    }
    
    // Cleanup method
    destroy() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
        }
    }
}

// Notification styles (inline CSS)
const notificationStyles = `
<style>
.notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    pointer-events: none;
}

.notification {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    margin-bottom: 10px;
    pointer-events: auto;
    transform: translateX(100%);
    transition: all 0.3s ease;
    border-left: 4px solid;
    min-width: 300px;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left-color: #10b981;
}

.notification-error {
    border-left-color: #ef4444;
}

.notification-warning {
    border-left-color: #f59e0b;
}

.notification-info {
    border-left-color: #3b82f6;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    color: white;
}

.notification-icon {
    font-size: 1.2rem;
}

.notification-message {
    flex: 1;
    font-size: 0.9rem;
}

.notification-close {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.notification-close:hover {
    opacity: 1;
}

@media (max-width: 480px) {
    .notifications-container {
        right: 10px;
        left: 10px;
    }
    
    .notification {
        min-width: auto;
    }
}
</style>
`;

// Add notification styles to head
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize left sidebar controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.leftSidebarController = new LeftSidebarController();
});

// Listen for external events
document.addEventListener('cart:updated', (e) => {
    if (window.leftSidebarController) {
        window.leftSidebarController.updateBadges({
            '#orders': e.detail.count || 0
        });
    }
});

document.addEventListener('user:logout', () => {
    if (window.leftSidebarController) {
        window.leftSidebarController.logout();
    }
});
