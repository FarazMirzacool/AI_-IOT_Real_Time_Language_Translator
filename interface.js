// Generate floating particles
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 5 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.opacity = Math.random() * 0.5;
            particlesContainer.appendChild(particle);
        }
    }
    
    createParticles();
    
    // Scroll Reveal
    function handleScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const revealTop = element.getBoundingClientRect().top;
            const revealPoint = 150;
            
            if (revealTop < windowHeight - revealPoint) {
                element.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', handleScrollReveal);
    handleScrollReveal();
    
    // Smooth scroll functions
    function scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function scrollToCTA() {
        document.querySelector('.cta-banner').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    // Make functions global
    window.scrollToSection = scrollToSection;
    window.scrollToCTA = scrollToCTA;
    
    // Modal functionality - Load your existing translator files
    const modal = document.getElementById('translatorModal');
    const launchBtn = document.getElementById('launchTranslatorBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const iframe = document.getElementById('translatorIframe');
    
    function openTranslator() {
        modal.style.display = 'flex';
        
        // Load your existing vocal.html file into the iframe
        // Make sure vocal.html, vocal.css, and vocal.js are in the same directory
        iframe.src = 'Vocal.html';
        
        // Alternative: If you want to inject the content directly without separate files
        // You can use the code below instead of iframe.src
        /*
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Voice Translation Assistant</title>
                <link rel="stylesheet" href="vocal.css">
            </head>
            <body>
                ${document.querySelector('.assistant-card').outerHTML}
                <script src="vocal.js"><\/script>
            </body>
            </html>
        `);
        iframeDoc.close();
        */
    }
    
    function closeTranslator() {
        modal.style.display = 'none';
        // Stop any ongoing speech when closing
        try {
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow && iframeWindow.speechSynthesis) {
                iframeWindow.speechSynthesis.cancel();
            }
        } catch(e) {
            console.log('Could not stop speech synthesis');
        }
        // Reload iframe to clean state
        iframe.src = 'about:blank';
    }
    
    launchBtn.addEventListener('click', openTranslator);
    closeModalBtn.addEventListener('click', closeTranslator);
    
    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTranslator();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeTranslator();
        }
    });
    
    // Add hover effects for cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    // Add this to your existing interface.js file

// Open Voice Synthesizer Studio in new tab/window
function openSynthesizer() {
    // Open the Text.html file in a new tab
    window.open('Text.html', '_blank');
}

// Add event listener for synthesizer button
const synthesizerBtn = document.getElementById('openSynthesizerBtn');
if (synthesizerBtn) {
    synthesizerBtn.addEventListener('click', openSynthesizer);
}

// Add smooth scroll for synthesizer section in nav
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});