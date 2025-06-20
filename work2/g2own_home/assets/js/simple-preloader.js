/*!
 * G2Own Simple Preloader Script
 * Handles the loading progression and smooth transition
 */

(function() {
    'use strict';

    // Simple preloader controller
    const SimplePreloader = {
        progressBar: null,
        statusText: null,
        loadingScreen: null,
        currentProgress: 0,
        isComplete: false,

        // Initialize the preloader
        init() {
            this.cacheElements();
            this.startLoadingSequence();
            this.bindEvents();
        },

        // Cache DOM elements
        cacheElements() {
            this.loadingScreen = document.getElementById('loading-screen');
            this.progressBar = document.getElementById('loading-progress');
            this.statusText = document.getElementById('loading-text');
        },

        // Start the loading progression
        startLoadingSequence() {
            // Add loading dots to the existing content
            this.addLoadingDots();

            // Define loading stages with messages
            const stages = [
                { progress: 20, message: 'Loading assets...', delay: 300 },
                { progress: 40, message: 'Initializing components...', delay: 400 },
                { progress: 60, message: 'Loading marketplace...', delay: 500 },
                { progress: 80, message: 'Preparing interface...', delay: 400 },
                { progress: 95, message: 'Almost ready...', delay: 300 },
                { progress: 100, message: 'Welcome to G2Own!', delay: 500 }
            ];

            let currentStage = 0;

            const runNextStage = () => {
                if (currentStage >= stages.length) {
                    setTimeout(() => this.complete(), 800);
                    return;
                }

                const stage = stages[currentStage];
                this.updateProgress(stage.progress, stage.message);

                setTimeout(() => {
                    currentStage++;
                    runNextStage();
                }, stage.delay);
            };

            // Start the sequence after a brief delay
            setTimeout(runNextStage, 200);
        },

        // Update progress bar and status
        updateProgress(percentage, message) {
            this.currentProgress = percentage;

            // Update progress bar
            if (this.progressBar) {
                this.progressBar.style.setProperty('--progress', percentage + '%');
                this.progressBar.querySelector('::before') || 
                this.updateProgressBarVisual(percentage);
            }

            // Update status text
            if (this.statusText) {
                this.statusText.textContent = message || `${percentage}%`;
            }
        },

        // Update progress bar visual
        updateProgressBarVisual(percentage) {
            if (this.progressBar) {
                const progressElement = this.progressBar.querySelector('::before') || 
                                      this.createProgressElement();
                progressElement.style.left = (percentage - 100) + '%';
            }
        },

        // Create progress element if it doesn't exist
        createProgressElement() {
            // The progress animation is handled by CSS ::before pseudo-element
            // This is a fallback for browsers that might need it
            return null;
        },

        // Add animated loading dots
        addLoadingDots() {
            const loadingContent = document.querySelector('.loading-content');
            if (loadingContent && !loadingContent.querySelector('.loading-dots')) {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'loading-dots';
                dotsContainer.innerHTML = '<span></span><span></span><span></span>';
                loadingContent.appendChild(dotsContainer);
            }
        },

        // Complete the loading process
        complete() {
            if (this.isComplete) return;
            this.isComplete = true;

            // Add loaded class to trigger fade out
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('loaded');
            }

            // Remove loading class from body
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');

            // Hide the loading screen completely after animation
            setTimeout(() => {
                if (this.loadingScreen) {
                    this.loadingScreen.style.display = 'none';
                }
                
                // Dispatch a custom event to signal loading is complete
                window.dispatchEvent(new CustomEvent('g2ownLoaded'));
            }, 800);
        },

        // Bind event listeners
        bindEvents() {
            // Complete loading when window is fully loaded
            window.addEventListener('load', () => {
                // Add a small delay to ensure smooth experience
                setTimeout(() => {
                    if (!this.isComplete && this.currentProgress >= 95) {
                        this.complete();
                    }
                }, 300);
            });

            // Handle page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.isComplete) {
                    // Page became visible after loading was complete
                    console.log('G2Own marketplace ready');
                }
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            SimplePreloader.init();
        });
    } else {
        SimplePreloader.init();
    }

    // Fallback: Force complete after maximum time
    setTimeout(() => {
        if (!SimplePreloader.isComplete) {
            console.log('Preloader timeout - completing loading');
            SimplePreloader.complete();
        }
    }, 10000); // 10 second maximum

    // Export for debugging (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.G2OwnPreloader = SimplePreloader;
    }

})();
