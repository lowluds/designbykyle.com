/*
	Animated Background Controller
	Adds interactive behavior and performance optimization
*/

class AnimatedBackgroundController {
	constructor() {
		this.init();
		this.setupInteractivity();
		this.optimizePerformance();
	}

	init() {
		// Add mouse movement interaction
		this.setupMouseInteraction();
		
		// Add scroll-based effects
		this.setupScrollEffects();
		
		// Initialize performance monitoring
		this.monitorPerformance();
	}

	setupMouseInteraction() {
		let mouseX = 0;
		let mouseY = 0;
		
		document.addEventListener('mousemove', (e) => {
			mouseX = e.clientX / window.innerWidth;
			mouseY = e.clientY / window.innerHeight;
			
			// Update orb positions based on mouse
			const orbs = document.querySelectorAll('.floating-orb');
			orbs.forEach((orb, index) => {
				const intensity = (index + 1) * 0.5;
				const offsetX = (mouseX - 0.5) * intensity * 20;
				const offsetY = (mouseY - 0.5) * intensity * 20;
				
				orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
			});
		});
	}

	setupScrollEffects() {
		let ticking = false;
		
		const updateBackgroundOnScroll = () => {
			const scrollY = window.pageYOffset;
			const windowHeight = window.innerHeight;
			const scrollProgress = scrollY / (document.body.scrollHeight - windowHeight);
			
			// Update background elements based on scroll
			const background = document.querySelector('.animated-background::before');
			if (background) {
				document.documentElement.style.setProperty(
					'--scroll-progress', 
					scrollProgress
				);
			}
			
			ticking = false;
		};
		
		const requestTick = () => {
			if (!ticking) {
				requestAnimationFrame(updateBackgroundOnScroll);
				ticking = true;
			}
		};
		
		window.addEventListener('scroll', requestTick);
	}

	optimizePerformance() {
		// Reduce animations on mobile devices
		if (window.innerWidth < 768) {
			const orbs = document.querySelectorAll('.floating-orb');
			orbs.forEach((orb, index) => {
				if (index > 3) {
					orb.style.display = 'none';
				}
			});
		}
		
		// Pause animations when tab is not visible
		document.addEventListener('visibilitychange', () => {
			const animatedElements = document.querySelectorAll('.floating-orb, .animated-background::before, .animated-background::after');
			
			if (document.hidden) {
				animatedElements.forEach(el => {
					el.style.animationPlayState = 'paused';
				});
			} else {
				animatedElements.forEach(el => {
					el.style.animationPlayState = 'running';
				});
			}
		});
	}

	monitorPerformance() {
		// Monitor FPS and reduce effects if needed
		let lastFrameTime = performance.now();
		let frameCount = 0;
		let fps = 60;
		
		const measureFPS = (currentTime) => {
			frameCount++;
			
			if (currentTime - lastFrameTime >= 1000) {
				fps = frameCount;
				frameCount = 0;
				lastFrameTime = currentTime;
				
				// Reduce effects if FPS is too low
				if (fps < 30) {
					this.reducedEffectsMode();
				}
			}
			
			requestAnimationFrame(measureFPS);
		};
		
		requestAnimationFrame(measureFPS);
	}

	reducedEffectsMode() {
		console.log('Activating reduced effects mode for better performance');
		
		// Hide some orbs
		const orbs = document.querySelectorAll('.floating-orb');
		orbs.forEach((orb, index) => {
			if (index > 2) {
				orb.style.opacity = '0.3';
				orb.style.filter = 'blur(3px)';
			}
		});
		
		// Slow down animations
		document.documentElement.style.setProperty('--animation-speed', '0.5');
	}

	// Add particles on click
	addClickEffect(x, y) {
		const particle = document.createElement('div');
		particle.className = 'click-particle';
		particle.style.position = 'fixed';
		particle.style.left = x + 'px';
		particle.style.top = y + 'px';
		particle.style.width = '4px';
		particle.style.height = '4px';
		particle.style.background = 'radial-gradient(circle, rgba(109, 40, 217, 1), transparent)';
		particle.style.borderRadius = '50%';
		particle.style.pointerEvents = 'none';
		particle.style.zIndex = '1000';
		
		document.body.appendChild(particle);
		
		// Animate particle
		particle.animate([
			{ transform: 'scale(0) translate(0, 0)', opacity: 1 },
			{ transform: 'scale(1) translate(0, 0)', opacity: 0.8, offset: 0.1 },
			{ transform: 'scale(0) translate(0, -100px)', opacity: 0 }
		], {
			duration: 1000,
			easing: 'ease-out'
		}).onfinish = () => {
			particle.remove();
		};
	}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const controller = new AnimatedBackgroundController();
	
	// Add click effects
	document.addEventListener('click', (e) => {
		if (e.target.closest('.animated-background')) {
			controller.addClickEffect(e.clientX, e.clientY);
		}
	});
});

// Handle window resize
window.addEventListener('resize', () => {
	// Reinitialize on resize if needed
	const orbs = document.querySelectorAll('.floating-orb');
	if (window.innerWidth < 768) {
		orbs.forEach((orb, index) => {
			if (index > 3) {
				orb.style.display = 'none';
			}
		});
	} else {
		orbs.forEach(orb => {
			orb.style.display = 'block';
		});
	}
});
