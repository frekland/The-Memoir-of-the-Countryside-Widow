// Password Protection
const CORRECT_PASSWORD = 'butterfly';

function checkPassword() {
    const input = document.getElementById('passwordInput');
    const error = document.getElementById('passwordError');
    const gate = document.getElementById('passwordGate');

    if (input.value === CORRECT_PASSWORD) {
        sessionStorage.setItem('authenticated', 'true');
        gate.classList.add('hidden');
        error.textContent = '';
    } else {
        error.textContent = 'Incorrect password. Please try again.';
        input.value = '';
        input.focus();

        // Shake animation
        input.style.animation = 'shake 0.5s';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
}

// Allow Enter key to submit password
document.addEventListener('DOMContentLoaded', () => {
    // Load novel content
    fetch('novel.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            attachSmoothScroll(); // Attach scroll listeners after content is loaded
        });

    // Load saved font
    const savedFont = localStorage.getItem('font');
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
        document.getElementById('font-select').value = savedFont;
    }

    const input = document.getElementById('passwordInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
        input.focus();
    }

    loadScrollPosition();

    // Check if already authenticated
    if (sessionStorage.getItem('authenticated') === 'true') {
        document.getElementById('passwordGate').classList.add('hidden');
    }

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.body.classList.add('zen-mode');
        } else {
            document.body.classList.remove('zen-mode');
        }
    });
});

// Enhanced mobile-friendly interactions
let lastScrollTop = 0;
let scrollTimeout;
let touchStartY = 0;
let touchEndY = 0;

// Theme management with smooth transitions
const themes = ['light', 'dark', 'sepia', 'super-dark', 'high-contrast'];
let currentThemeIndex = 0;

function toggleTheme() {
    const html = document.documentElement;
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    addRipple(event);
}

// Font size management
let fontSize = parseInt(localStorage.getItem('fontSize')) || 18;
document.documentElement.style.setProperty('--font-size', fontSize + 'px');

function changeFont() {
    const selectedFont = document.getElementById('font-select').value;
    document.body.style.fontFamily = selectedFont;
    localStorage.setItem('font', selectedFont);
}

function toggleZenMode() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    addRipple(event);
}

function increaseFont() {
    if (fontSize < 28) {
        fontSize += 2;
        document.documentElement.style.setProperty('--font-size', fontSize + 'px');
        localStorage.setItem('fontSize', fontSize);
        addRipple(event);
    }
}

function decreaseFont() {
    if (fontSize > 14) {
        fontSize -= 2;
        document.documentElement.style.setProperty('--font-size', fontSize + 'px');
        localStorage.setItem('fontSize', fontSize);
        addRipple(event);
    }
}

// Smooth navigation with overlay
function toggleNav() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const isOpen = sidebar.classList.contains('open');

    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');

    // Prevent body scroll when nav is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
}

// Close nav when clicking a link
document.querySelectorAll('.chapter-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('visible');
        document.body.style.overflow = '';
        addRipple(e);
    });
});

// Auto-hide controls on scroll (mobile)
let isScrolling = false;
window.addEventListener('scroll', () => {
    const controls = document.getElementById('controls');
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Clear timeout
    clearTimeout(scrollTimeout);

    // Show controls
    controls.classList.remove('hidden');

    // Hide controls after scrolling stops (mobile only)
    if (window.innerWidth <= 768) {
        scrollTimeout = setTimeout(() => {
            if (currentScrollTop > 100) {
                controls.classList.add('hidden');
            }
        }, 1500);
    }

    lastScrollTop = currentScrollTop;
    highlightActiveChapter();
    updateProgressBar();
    saveScrollPosition();
});

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolledPercentage = (window.scrollY / scrollableHeight) * 100;
    progressBar.style.width = scrolledPercentage + '%';
}

function saveScrollPosition() {
    localStorage.setItem('scrollPosition', window.scrollY);
}

function loadScrollPosition() {
    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
    }
}

// Highlight active chapter
function highlightActiveChapter() {
    const chapters = document.querySelectorAll('.chapter');
    const links = document.querySelectorAll('.chapter-link');

    let current = '';
    chapters.forEach(chapter => {
        const rect = chapter.getBoundingClientRect();
        if (rect.top <= 150) {
            current = chapter.getAttribute('id');
        }
    });

    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Ripple effect for touch feedback
function addRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', addRipple);
});

// Touch gestures for navigation
document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    // Swipe detection logic (for future enhancements)
    if (Math.abs(swipeDistance) > minSwipeDistance) {
        // Can be used for chapter navigation
    }
}

// Load saved theme with prefers-color-scheme support
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
currentThemeIndex = themes.indexOf(theme);

// Tap to show controls on mobile
let tapTimeout;
document.getElementById('content').addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !e.target.closest('a, button')) {
        const controls = document.getElementById('controls');
        controls.classList.remove('hidden');

        clearTimeout(tapTimeout);
        tapTimeout = setTimeout(() => {
            controls.classList.add('hidden');
        }, 3000);
    }
});

// Initial chapter highlight
highlightActiveChapter();

// Smooth scroll polyfill for older browsers
function attachSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}