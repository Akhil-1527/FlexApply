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
        { id: 'trust-component', path: 'components/trust/index.html' },
        { id: 'form-component', path: 'components/form/index.html' },
        { id: 'quality-focus-component', path: 'components/quality-focus/index.html' },
        { id: 'footer-component', path: 'components/footer/index.html' }
    ];

    components.forEach(component => {
        const container = document.getElementById(component.id);
        if (container) {
            fetch(component.path)
                .then(response => response.text())
                .then(html => {
                    container.innerHTML = html;
                    
                    // Initialize form if this is the form component
                    if (component.id === 'form-component') {
                        initFormHandling();
                    }
                })
                .catch(error => {
                    console.error(`Error loading ${component.path}:`, error);
                });
        }
    });
}

// Function to initialize mobile menu
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle hamburger animation
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
}

// Function to handle smooth scrolling
function initScrollAnimation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Function to initialize form handling
function initFormHandling() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Replace with actual Formspree endpoint
            const actionUrl = 'https://formspree.io/f/yourformid';
            
            // Form data
            const formData = new FormData(this);
            
            // Send form data
            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    showToast('Thank you for contacting us! We\'ll get back to you shortly.');
                    contactForm.reset();
                } else {
                    showToast('Oops! Something went wrong. Please try again later.');
                }
            })
            .catch(error => {
                showToast('Oops! Something went wrong. Please try again later.');
                console.error('Error:', error);
            });
        });
    }
}

// Function to show toast notifications
function showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set message and show
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize FAQ accordion
function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }
}

// Add this to your existing DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Your existing code here
    
    // Initialize FAQ
    initFaq();
});

function initCounterAnimation() {
    const counterElements = document.querySelectorAll('.counter-animate');
    
    if (counterElements.length === 0) return;
    
    const options = {
        threshold: 0.5
    };
    
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
}

// Floating CTA for better conversion
function initFloatingCTA() {
    const floatingCTA = document.createElement('div');
    floatingCTA.className = 'floating-cta';
    floatingCTA.innerHTML = `
        <button class="close-floating-cta">&times;</button>
        <p>We're accepting limited applications this month</p>
        <div class="floating-cta-buttons">
            <a href="#form" class="btn btn-sm btn-primary">Apply Now</a>
            <a href="https://calendly.com/flexapply/consultation" target="_blank" class="btn btn-sm btn-outline">Free Consultation</a>
        </div>
    `;
    document.body.appendChild(floatingCTA);
    
    // Show CTA after 30 seconds
    setTimeout(() => {
        if (!sessionStorage.getItem('cta-closed')) {
            floatingCTA.classList.add('show');
        }
    }, 30000);
    
    // Or show when scrolled 50% of page
    window.addEventListener('scroll', () => {
        if (!sessionStorage.getItem('cta-closed')) {
            const scrollPosition = window.scrollY;
            const pageHeight = document.body.scrollHeight;
            const viewportHeight = window.innerHeight;
            
            if (scrollPosition > (pageHeight - viewportHeight) * 0.5) {
                floatingCTA.classList.add('show');
            }
        }
    });
    
    // Close button functionality
    const closeButton = floatingCTA.querySelector('.close-floating-cta');
    closeButton.addEventListener('click', () => {
        floatingCTA.classList.remove('show');
        sessionStorage.setItem('cta-closed', 'true');
    });
    
    // Clicking CTA buttons should also close it
    const ctaButtons = floatingCTA.querySelectorAll('.btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            floatingCTA.classList.remove('show');
        });
    });
}