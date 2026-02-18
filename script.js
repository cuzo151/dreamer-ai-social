/* ═══════════════════════════════════════════════════════
   DREAMER AI SOCIAL — script.js
   Spline 3D loader + Nav blur + Smooth interactions.
   ═══════════════════════════════════════════════════════ */

// ── Load Spline 3D scene ─────────────────────────────
import { Application } from 'https://esm.sh/@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const loader = document.getElementById('loader');

if (canvas) {
    const spline = new Application(canvas);
    spline.load('https://prod.spline.design/9aPp2nOUkM3wqAUO/scene.splinecode')
        .then(() => {
            console.log('✅ Spline 3D scene loaded');
            // Hide custom loader
            if (loader) loader.style.display = 'none';
            // Fade in the canvas
            canvas.style.opacity = '1';
        })
        .catch((err) => console.warn('Spline load error:', err));

    // ── Spline Scroll Interaction (Skill Integration) ────
    window.addEventListener('scroll', () => {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        // Calculate progress 0 to 1
        const progress = Math.min(window.scrollY / maxScroll, 1);

        // Pass to Spline variable 'scrollProgress' (if defined in scene)
        // Wrappped in try-catch in case variable doesn't exist to avoid console spam
        try {
            spline.setVariable('scrollProgress', progress);
        } catch (e) {
            // Variable might not exist in this specific scene export, which is fine
        }
    });

    // ── Spline Event Listeners (Skill Integration) ───────
    spline.addEventListener('mouseDown', (e) => {
        console.log('3D Object Clicked:', e.target.name);
        // Example: If an object named "Button" is clicked, scroll to contact
        if (e.target.name === 'Button' || e.target.name === 'CTA') {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ── Nav blur on scroll ───────────────────────────────
const nav = document.getElementById('nav');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            if (nav) {
                nav.style.background =
                    window.scrollY > 40
                        ? 'rgba(0,0,0,.85)'
                        : 'rgba(0,0,0,.6)';
            }
            ticking = false;
        });
        ticking = true;
    }
});

// ── Smooth anchor scroll ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ── Intersection Observer for Portfolio Items ────────
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.portfolio__item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);

    // Video Play/Pause on Hover
    const video = item.querySelector('video');
    if (video) {
        // Start paused
        video.pause();

        item.addEventListener('mouseenter', () => {
            // Reset to start if it was finished, or just play
            if (video.ended) video.currentTime = 0;
            video.play().catch(e => { /* Ignore auto-play errors */ });
        });

        item.addEventListener('mouseleave', () => {
            video.pause();
            // video.currentTime = 0; // Keeping it paused at current frame is often nicer
        });
    }
});

/* 
   VIDEO MODAL INTERACTION 
   Handles opening videos in a full-screen modal with sound on click.
*/
const modal = document.getElementById('video-modal');
const modalVideo = modal.querySelector('video');
const closeBtn = document.querySelector('.video-modal__close');
const portfolioItems = document.querySelectorAll('.portfolio__item');

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const sourceVideo = item.querySelector('video source');
        if (sourceVideo) {
            const videoSrc = sourceVideo.getAttribute('src');
            modalVideo.src = videoSrc;
            modal.classList.add('active');
            modalVideo.muted = false; // Enable audio for full experience
            modalVideo.play();
        }
    });
});

const closeModal = () => {
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = ''; // Clear source
};

if (closeBtn) closeBtn.addEventListener('click', closeModal);

// Close on click outside video content
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
    }
});
