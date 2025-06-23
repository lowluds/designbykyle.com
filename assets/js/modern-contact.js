/* Modern Contact Form JavaScript */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    // Form field elements
    const fields = {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        subject: document.getElementById('subject'),
        message: document.getElementById('message')
    };
    
    // Error elements
    const errors = {
        name: document.getElementById('nameError'),
        email: document.getElementById('emailError'),
        subject: document.getElementById('subjectError'),
        message: document.getElementById('messageError')
    };
    
    // Floating label functionality
    Object.values(fields).forEach(field => {
        if (field) {
            // Check if field has value on load
            updateFloatingLabel(field);
            
            // Add event listeners
            field.addEventListener('input', () => {
                updateFloatingLabel(field);
                clearFieldError(field);
            });
            
            field.addEventListener('blur', () => {
                validateField(field);
            });
            
            field.addEventListener('focus', () => {
                clearFieldError(field);
            });
        }
    });
    
    // Update floating label based on field value
    function updateFloatingLabel(field) {
        const formGroup = field.closest('.form-group');
        if (field.value.trim() !== '') {
            formGroup.classList.add('has-value');
        } else {
            formGroup.classList.remove('has-value');
        }
    }
    
    // Validation functions
    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                if (value === '') {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value === '') {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
                
            case 'subject':
                if (value === '') {
                    errorMessage = 'Subject is required';
                    isValid = false;
                } else if (value.length < 5) {
                    errorMessage = 'Subject must be at least 5 characters';
                    isValid = false;
                }
                break;
                
            case 'message':
                if (value === '') {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
                    isValid = false;
                }
                break;
        }
        
        showFieldError(field, errorMessage, isValid);
        return isValid;
    }
    
    // Show field error
    function showFieldError(field, message, isValid) {
        const formGroup = field.closest('.form-group');
        const errorElement = errors[field.name];
        
        if (isValid) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            if (errorElement) errorElement.textContent = '';
        } else {
            formGroup.classList.remove('success');
            formGroup.classList.add('error');
            if (errorElement) errorElement.textContent = message;
        }
    }
    
    // Clear field error
    function clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        const errorElement = errors[field.name];
        
        formGroup.classList.remove('error', 'success');
        if (errorElement) errorElement.textContent = '';
    }
    
    // Validate entire form
    function validateForm() {
        let isFormValid = true;
        
        Object.values(fields).forEach(field => {
            if (field && !validateField(field)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                submitForm();
            } else {
                // Scroll to first error
                const firstError = form.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        });
    }
    
    // Submit form with loading state
    function submitForm() {
        // Set loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual submission logic)
        setTimeout(() => {
            // Reset loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            resetForm();
        }, 2000);
    }
    
    // Show success message
    function showSuccessMessage() {
        successMessage.classList.add('show');
        successMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Hide after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }
    
    // Reset form
    function resetForm() {
        form.reset();
        
        // Clear all states
        Object.values(fields).forEach(field => {
            if (field) {
                clearFieldError(field);
                updateFloatingLabel(field);
            }
        });
    }
    
    // Character counter for textarea (optional enhancement)
    const messageField = fields.message;
    if (messageField) {
        const maxLength = 500;
        let counter = null;
        
        // Create character counter
        function createCharacterCounter() {
            counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.style.cssText = `
                position: absolute;
                bottom: -1.5em;
                right: 0;
                font-size: 0.8em;
                color: #9ca3af;
                font-weight: 500;
            `;
            
            const formGroup = messageField.closest('.form-group');
            formGroup.style.position = 'relative';
            formGroup.appendChild(counter);
            
            updateCharacterCounter();
        }
        
        // Update character counter
        function updateCharacterCounter() {
            if (counter) {
                const length = messageField.value.length;
                counter.textContent = `${length}/${maxLength}`;
                
                if (length > maxLength * 0.9) {
                    counter.style.color = '#ef4444';
                } else if (length > maxLength * 0.7) {
                    counter.style.color = '#f59e0b';
                } else {
                    counter.style.color = '#9ca3af';
                }
            }
        }
        
        // Initialize character counter
        createCharacterCounter();
        
        messageField.addEventListener('input', updateCharacterCounter);
    }
    
    // Auto-resize textarea
    if (messageField) {
        messageField.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 300) + 'px';
        });
    }
    
    // Smooth focus transitions
    Object.values(fields).forEach(field => {
        if (field) {
            field.addEventListener('focus', function() {
                this.closest('.form-group').style.transform = 'translateY(-2px)';
            });
            
            field.addEventListener('blur', function() {
                this.closest('.form-group').style.transform = 'translateY(0)';
            });
        }
    });
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Real-time validation with debounce
document.addEventListener('DOMContentLoaded', function() {
    const fields = document.querySelectorAll('.modern-input, .modern-textarea');
    
    fields.forEach(field => {
        const debouncedValidation = debounce(() => {
            if (field.value.trim() !== '') {
                validateField(field);
            }
        }, 300);
        
        field.addEventListener('input', debouncedValidation);
    });
});
