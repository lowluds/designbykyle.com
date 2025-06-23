// Clean Portfolio - Essential JavaScript Only

// Create animated background with floating programming characters
function createFloatingBackground() {
    const background = document.getElementById('animatedBg');
    const characters = {
        symbols: ['{', '}', '(', ')', '[', ']', '<', '>', '/', '*', '+', '-', '=', ';', ':', '.', '!', '?', '@', '#', '$', '%', '&', '|', '\\', '^', '~', '`', '_', '"', '\'', '`', '=>', '</>', '::', '/*', '*/', 'function', 'var', 'let', 'const', 'return', 'if', 'else', 'for', 'while', '=>', '===', '!==', '&&', '||', 'html', 'css', 'js', 'php', 'py'],
        letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    };
    
    function createFloatingChar() {
        const char = document.createElement('div');
        char.className = 'floating-char';
        
        // Randomly select character type (favor symbols and letters)
        const rand = Math.random();
        let selectedType, charArray;
        
        if (rand < 0.5) {
            selectedType = 'symbol';
            charArray = characters.symbols;
        } else if (rand < 0.8) {
            selectedType = 'letter';
            charArray = characters.letters;
        } else {
            selectedType = 'number';
            charArray = characters.numbers;
        }
        
        char.textContent = charArray[Math.floor(Math.random() * charArray.length)];
        char.classList.add(selectedType);
          // Random positioning
        char.style.left = Math.random() * 100 + '%';
        char.style.fontSize = (Math.random() * 28 + 20) + 'px'; // Smaller: 20-48px
        
        // Random animation duration (20-35 seconds - slower for fewer chars)
        const duration = Math.random() * 15 + 20;
        char.style.animationDuration = duration + 's';
        
        // Random delay before starting
        char.style.animationDelay = Math.random() * 2 + 's';
        
        background.appendChild(char);
        
        // Remove element after animation completes
        setTimeout(() => {
            if (char.parentNode) {
                char.parentNode.removeChild(char);
            }
        }, (duration + 2) * 1000);
    }
      // Create initial characters - fewer for cleaner look
    for (let i = 0; i < 7; i++) {
        setTimeout(() => createFloatingChar(), Math.random() * 1200); // More random initial appearance
    }
    // Continue creating characters periodically - more random
    setInterval(() => {
        setTimeout(createFloatingChar, Math.random() * 1200);
    }, 900); // Quicker: 900ms instead of 1800ms
}

document.addEventListener('DOMContentLoaded', function() {
    // Start animated background
    createFloatingBackground();
    
    // Get navigation elements
    const navLinks = document.querySelectorAll('#nav a[href^="#"]');
    const sections = document.querySelectorAll('.panel');
    
    // Initialize - show home section by default
    showSection('home');
    
    // Add click handlers to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            updateActiveNav(sectionId);
            
            // Update URL without page reload
            history.pushState(null, null, `#${sectionId}`);
        });
    });
    
    // Section management
    function showSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        
        if (sectionId === 'home') {
            // Show home section
            document.body.classList.remove('section-active');
            sections.forEach(section => {
                section.classList.remove('visible');
                if (section.id === 'home') {
                    section.style.display = 'flex';
                } else {
                    section.style.display = 'none';
                }
            });
        } else {
            // Show other sections
            document.body.classList.add('section-active');
            sections.forEach(section => {
                section.classList.remove('visible');
                section.style.display = 'none';
            });
            
            if (targetSection) {
                targetSection.classList.add('visible');
                targetSection.style.display = 'block';
            }
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Update active navigation
    function updateActiveNav(sectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        updateActiveNav(hash);
    });    // Cycling Typewriter effect for subtitle
    const typewriterElement = document.querySelector('.typewriter');
    if (typewriterElement) {
        const titles = [
            "Front End Developer",
            "Web Designer",
            "Full Stack Developer",
            "JavaScript Specialist",
            "Python Automation Developer",
            "UI and UX Designer",
            "Responsive Design Expert",
            "E-Commerce Integrator"
        ];
        
        let currentTitleIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        
        // Find the longest title to set container width
        const longestTitle = titles.reduce((a, b) => a.length > b.length ? a : b);
        
        // Create invisible placeholder to reserve space for longest title
        const placeholder = document.createElement('span');
        placeholder.textContent = longestTitle;
        placeholder.style.visibility = 'hidden';
        placeholder.style.position = 'absolute';
        placeholder.style.whiteSpace = 'nowrap';
        
        // Create visible typing text
        const typingText = document.createElement('span');
        typingText.textContent = '';
        typingText.style.display = 'inline-block';
        typingText.style.minHeight = '1em';
        
        // Clear original and add both elements
        typewriterElement.textContent = '';
        typewriterElement.style.position = 'relative';
        typewriterElement.appendChild(placeholder);
        typewriterElement.appendChild(typingText);
        
        function typeWriter() {
            const currentTitle = titles[currentTitleIndex];
            
            if (isDeleting) {
                // Deleting characters
                typingText.textContent = currentTitle.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                
                if (currentCharIndex === 0) {
                    isDeleting = false;
                    currentTitleIndex = (currentTitleIndex + 1) % titles.length;
                    setTimeout(typeWriter, 500); // Pause before starting new word
                } else {
                    setTimeout(typeWriter, 50); // Faster deletion
                }
            } else {
                // Typing characters
                typingText.textContent = currentTitle.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                
                if (currentCharIndex === currentTitle.length) {
                    isDeleting = true;
                    setTimeout(typeWriter, 2000); // Pause when word is complete
                } else {
                    setTimeout(typeWriter, 100); // Normal typing speed
                }
            }
        }
        
        // Start typewriter effect after a short delay
        setTimeout(typeWriter, 1000);
    }
    
    // Smooth button interactions
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Glassmorphic context menu logic
    const glassMenu = document.getElementById('glass-menu');
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (glassMenu) {
            glassMenu.style.left = e.clientX + 'px';
            glassMenu.style.top = e.clientY + 'px';
            glassMenu.classList.add('open');
        }
    });
    document.addEventListener('mousedown', function(e) {
        if (glassMenu && !glassMenu.contains(e.target)) {
            glassMenu.classList.remove('open');
        }
    });

    // --- Creative Glass Menu Actions ---
    const email = "kyle.ludlow.designs@gmail.com";
    const resumeUrl = "assets/Kyle_Ludlow_Resume.pdf"; // Place your resume here
    const copyEmailBtn = document.getElementById('menu-copy-email');
    const downloadResumeBtn = document.getElementById('menu-download-resume');
    const toggleThemeBtn = document.getElementById('menu-toggle-theme');
    const visitPortfolioBtn = document.getElementById('menu-visit-portfolio');
    const contactMeBtn = document.getElementById('menu-contact-me');

    if (copyEmailBtn) {
        copyEmailBtn.style.cursor = 'pointer';
        copyEmailBtn.onclick = function() {
            navigator.clipboard.writeText(email);
            copyEmailBtn.innerHTML = '<i class="fas fa-check"></i> Email Copied!';
            setTimeout(() => {
                copyEmailBtn.innerHTML = '<i class="fas fa-envelope"></i> Copy Email';
            }, 1200);
        };
    }
    if (downloadResumeBtn) {
        downloadResumeBtn.style.cursor = 'pointer';
        downloadResumeBtn.onclick = function() {
            const a = document.createElement('a');
            a.href = resumeUrl;
            a.download = 'Kyle_Ludlow_Resume.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    }
    if (toggleThemeBtn) {
        toggleThemeBtn.style.cursor = 'pointer';
        toggleThemeBtn.onclick = function() {
            const isLight = document.body.classList.contains('light-mode');
            setTheme(isLight ? 'dark' : 'light');
        };
    }
    if (visitPortfolioBtn) {
        visitPortfolioBtn.style.cursor = 'pointer';
        visitPortfolioBtn.onclick = function() {
            document.querySelector('#nav a[href="#work"]').click();
            glassMenu.classList.remove('open');
        };
    }
    if (contactMeBtn) {
        contactMeBtn.style.cursor = 'pointer';
        contactMeBtn.onclick = function() {
            document.querySelector('#nav a[href="#contact"]').click();
            glassMenu.classList.remove('open');
        };
    }
    
    // Animate hero stats numbers
    function animateStats() {
        document.querySelectorAll('.stat-number').forEach(function(el) {
            const target = +el.getAttribute('data-target');
            let start = 0;
            let duration = 900;
            let step = Math.ceil(target / (duration / 18));
            if (target <= 10) step = 1;
            function update() {
                start += step;
                if (start >= target) {
                    el.textContent = target + (target === 24 ? 'h' : '+');
                } else {
                    el.textContent = start + (target === 24 ? 'h' : '+');
                    setTimeout(update, 18);
                }
            }
            update();
        });
    }
    animateStats();
    
    // Theme toggle logic
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

function setTheme(mode) {
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', 'dark');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        setTheme(isLight ? 'dark' : 'light');
    });
    // On load, set theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}
});
