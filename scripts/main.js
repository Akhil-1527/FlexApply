// Main JavaScript file for FlexApply

document.addEventListener('DOMContentLoaded', function() {
    // Load component HTML
    loadComponents();

    // Initialize mobile menu toggle
    initMobileMenu();

    // Add scroll animation
    initScrollAnimation();

    // Initialize counter animation
    initCounterAnimation();
    
    // Initialize floating CTA
    initFloatingCTA();
});

// Function to load all component HTML
function loadComponents() {
    const components = [
        { id: 'hero-component', path: 'components/hero/index.html' },
        { id: 'about-component', path: 'components/about/index.html' },
        { id: 'process-component', path: 'components/process/index.html' },
        { id: 'why-choose-component', path: 'components/why-choose/index.html' },
        { id: 'quality-focus-component', path: 'components/quality-focus/index.html' },
        { id: 'pricing-component', path: 'components/pricing/index.html' },
        { id: 'trust-component', path: 'components/trust/index.html' },
        { id: 'faq-component', path: 'components/faq/index.html' },
        { id: 'form-component', path: 'components/form/index.html' },
        { id: 'footer-component', path: 'components/footer/index.html' }
    ];

    const loadPromises = components.map(component => {
        const container = document.getElementById(component.id);
        if (!container) return Promise.resolve();
        
        return fetch(component.path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${component.path}: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                
                // Initialize component-specific functionality
                if (component.id === 'form-component') {
                    initFormHandling();
                } else if (component.id === 'faq-component') {
                    initFaq();
                }
            })
            .catch(error => {
                console.error(`Error loading ${component.path}:`, error);
                container.innerHTML = `<div class="component-error">Error loading component. Please refresh the page.</div>`;
            });
    });
    
    // After all components are loaded
    Promise.all(loadPromises).then(() => {
        // Handle hash fragment navigation after components load
        if (window.location.hash) {
            setTimeout(() => {
                scrollToSection(window.location.hash);
            }, 500);
        }
    });
}

// Function to initialize mobile menu
function initMobileMenu() {
    document.addEventListener('click', function(e) {
        const mobileToggle = e.target.closest('.mobile-toggle');
        if (!mobileToggle) return;
        
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;
        
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-links a');
        if (!navLink) return;
        
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (!navLinks || !mobileToggle) return;
        
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
    });
    
    // Handle Escape key to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (!navLinks || !mobileToggle || !navLinks.classList.contains('active')) return;
        
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.focus();
    });
}

// Function to handle smooth scrolling
function initScrollAnimation() {
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;
        
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        e.preventDefault();
        scrollToSection(targetId);
    });
}

// Reusable function to scroll to a section
function scrollToSection(targetId) {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    // No need to calculate offset manually as scroll-margin-top handles it in CSS
    const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
    
    if (supportsNativeSmoothScroll && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        targetElement.scrollIntoView();
    }
}

// Function to initialize form handling with validation
function initFormHandling() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset previous validation
        this.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        });
        
        // Validate the form
        let isValid = true;
        let firstInvalidElement = null;
        
        // Required fields validation
        const requiredFields = this.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
                if (!firstInvalidElement) {
                    firstInvalidElement = field;
                }
            }
        });
        
        // Email validation
        const emailField = this.querySelector('input[type="email"]');
        if (emailField && emailField.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailField.value.trim())) {
                emailField.classList.add('is-invalid');
                isValid = false;
                if (!firstInvalidElement) {
                    firstInvalidElement = emailField;
                }
            }
        }
        
        // Radio buttons validation
        const radioGroups = Array.from(this.querySelectorAll('input[type="radio"][required]')).reduce((groups, radio) => {
            if (!groups[radio.name]) groups[radio.name] = [];
            groups[radio.name].push(radio);
            return groups;
        }, {});
        
        for (const [name, radios] of Object.entries(radioGroups)) {
            const isChecked = radios.some(radio => radio.checked);
            if (!isChecked) {
                radios.forEach(radio => {
                    const radioParent = radio.closest('.challenge-option, .pricing-option');
                    if (radioParent) {
                        radioParent.classList.add('is-invalid');
                    }
                });
                isValid = false;
                if (!firstInvalidElement) {
                    firstInvalidElement = radios[0];
                }
            }
        }
        
        // Focus the first invalid element
        if (firstInvalidElement) {
            firstInvalidElement.focus();
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        
        if (isValid) {
            // Replace with actual Formspree endpoint
            const actionUrl = this.getAttribute('action') || 'https://formspree.io/f/yourformid';
            
            // Form data
            const formData = new FormData(this);
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            // Send form data
            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                
                if (response.ok) {
                    // Show success popup instead of toast
                    showSuccessPopup();
                    contactForm.reset();
                } else {
                    showToast('Oops! Something went wrong. Please try again later.', 'error');
                }
            })
            .catch(error => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                
                showToast('Oops! Something went wrong. Please try again later.', 'error');
                console.error('Error:', error);
            });
        }
    });
    
    // Real-time validation for better UX
    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
    
    function validateField(field) {
        // Clear previous validation
        field.classList.remove('is-invalid');
        
        // Skip validation if field is not required and empty
        if (!field.hasAttribute('required') && !field.value.trim()) {
            return;
        }
        
        // Check if empty
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('is-invalid');
            return;
        }
        
        // Email validation
        if (field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value.trim())) {
                field.classList.add('is-invalid');
            }
        }
    }
}

// Function to show success popup
function showSuccessPopup() {
    const popup = document.getElementById('success-popup');
    if (!popup) return;
    
    popup.classList.add('show');
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        popup.classList.remove('show');
    }, 5000);
    
    // Add click handler for manual close
    const closeButton = popup.querySelector('.close-popup');
    if (closeButton) {
        closeButton.onclick = () => {
            popup.classList.remove('show');
        };
    }
    
    // Close on escape key
    document.addEventListener('keydown', function popupKeyHandler(e) {
        if (e.key === 'Escape' && popup.classList.contains('show')) {
            popup.classList.remove('show');
            document.removeEventListener('keydown', popupKeyHandler);
        }
    });
}

// Function to show toast notifications
function showToast(message, type = '') {
    // Create toast if it doesn't exist
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        
        const toastMessage = document.createElement('div');
        toastMessage.className = 'toast-message';
        toast.appendChild(toastMessage);
        
        document.body.appendChild(toast);
    }
    
    // Clear previous classes
    toast.classList.remove('success', 'error', 'show');
    
    // Add type class if provided
    if (type) {
        toast.classList.add(type);
    }
    
    // Set message
    toast.querySelector('.toast-message').textContent = message;
    
    // Show toast
    // Small delay to ensure transition works after any previous ones
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide after 5 seconds
    const toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
    
    // Allow clicking to dismiss
    toast.onclick = function() {
        clearTimeout(toastTimeout);
        toast.classList.remove('show');
    };
    
    // Add keyboard dismissal
    document.addEventListener('keydown', function toastKeyHandler(e) {
        if (e.key === 'Escape' && toast.classList.contains('show')) {
            clearTimeout(toastTimeout);
            toast.classList.remove('show');
            document.removeEventListener('keydown', toastKeyHandler);
        }
    });
}

// Initialize FAQ accordion
function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');
        
        // Set initial state
        if (item.hasAttribute('open')) {
            toggle.textContent = '×';
        } else {
            toggle.textContent = '+';
        }
        
        // Toggle state on click
        question.addEventListener('click', () => {
            // This will be handled by the native details/summary behavior
            // We just need to update the toggle icon
            setTimeout(() => {
                if (item.hasAttribute('open')) {
                    toggle.textContent = '×';
                } else {
                    toggle.textContent = '+';
                }
            }, 0);
        });
        
        // Handle keyboard interaction
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.open = !item.open;
                
                if (item.open) {
                    toggle.textContent = '×';
                    
                    // Close other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.open) {
                            otherItem.open = false;
                            otherItem.querySelector('.faq-toggle').textContent = '+';
                        }
                    });
                } else {
                    toggle.textContent = '+';
                }
            }
        });
    });
}

function initCounterAnimation() {
    const counterElements = document.querySelectorAll('.counter-animate');
    
    if (counterElements.length === 0) return;
    
    // Don't animate if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        counterElements.forEach(element => {
            element.classList.add('visible');
        });
        return;
    }
    
    const options = {
        threshold: 0.5,
        rootMargin: '0px 0px -10% 0px'
    };
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        counterElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        counterElements.forEach(element => {
            element.classList.add('visible');
        });
    }
}

// Floating CTA for better conversion
function initFloatingCTA() {
    // Check if floating CTA already exists
    if (document.querySelector('.floating-cta')) return;
    
    const floatingCTA = document.createElement('div');
    floatingCTA.className = 'floating-cta';
    floatingCTA.setAttribute('role', 'dialog');
    floatingCTA.setAttribute('aria-label', 'Application reminder');
    
    floatingCTA.innerHTML = `
        <button class="close-floating-cta" aria-label="Close reminder">&times;</button>
        <p>Ready to save time on your job search?</p>
        <div class="floating-cta-buttons">
        <a href="#form" class="btn btn-sm btn-primary">Apply Now</a>
            <a href="https://calendly.com/flexapply/consultation" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">Free Consultation</a>
        </div>
    `;
    document.body.appendChild(floatingCTA);
    
    // Don't show floating CTA for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sessionStorage.setItem('cta-closed', 'true');
    }
    
    // Show CTA after 30 seconds, but only if user hasn't closed it before
    let showCTATimeout;
    if (!sessionStorage.getItem('cta-closed')) {
        showCTATimeout = setTimeout(() => {
            floatingCTA.classList.add('show');
        }, 30000);
    }
    
    // Or show when scrolled 50% of page
    const scrollHandler = () => {
        if (sessionStorage.getItem('cta-closed')) return;
        
        const scrollPosition = window.scrollY;
        const pageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        if (scrollPosition > (pageHeight - viewportHeight) * 0.5) {
            floatingCTA.classList.add('show');
            window.removeEventListener('scroll', scrollHandler);
        }
    };
    
    // Throttle scroll event for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(scrollHandler, 100);
    });
    
    // Close button functionality
    const closeButton = floatingCTA.querySelector('.close-floating-cta');
    closeButton.addEventListener('click', () => {
        floatingCTA.classList.remove('show');
        sessionStorage.setItem('cta-closed', 'true');
        clearTimeout(showCTATimeout);
    });
    
    // Clicking CTA buttons should also close it
    const ctaButtons = floatingCTA.querySelectorAll('.btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            floatingCTA.classList.remove('show');
        });
    });
    
    // Add keyboard accessibility
    floatingCTA.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            floatingCTA.classList.remove('show');
            sessionStorage.setItem('cta-closed', 'true');
            clearTimeout(showCTATimeout);
        }
    });
    
    // Hide CTA if user submits the form
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'contact-form') {
            floatingCTA.classList.remove('show');
            sessionStorage.setItem('cta-closed', 'true');
            clearTimeout(showCTATimeout);
        }
    });
}

// 🧠 PostHog Event Tracking for FlexApply MVP
document.addEventListener('DOMContentLoaded', function () {
    // ✅ Apply Now Click
    const applyBtn = document.querySelector('.btn-primary');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            posthog.capture('click_apply_now');
        });
    }

    // ✅ FAQ Toggle Click
    document.querySelectorAll('.faq-question')?.forEach(el => {
        el.addEventListener('click', () => {
            posthog.capture('faq_toggle');
        });
    });

    // ✅ Form Submit Attempt
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', () => {
            posthog.capture('form_submit_attempt');
        });

        // Optional: fire after success logic if you use AJAX
        form.addEventListener('formSuccess', () => {
            posthog.capture('form_success');
        });
    }

    // ✅ Scroll Depth Tracking
    const milestones = [25, 50, 75, 100];
    const triggered = new Set();

    window.addEventListener('scroll', () => {
        const scrolled = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100;
        milestones.forEach(p => {
            if (scrolled >= p && !triggered.has(p)) {
                posthog.capture('scroll_depth', { percent: p });
                triggered.add(p);
            }
        });
    });
});
