/* 
    Security & Logic Controller 
    Contains: Canvas Animation, UI Interactions, Email Obfuscation, Analyst Decryption
*/

// --- 1. CANVAS BACKGROUND ANIMATION ---
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuration: Reduce count on mobile for performance
const getParticleCount = () => window.innerWidth < 600 ? 30 : 60;

const config = {
    count: getParticleCount(),
    connectionDist: 150, 
    mouseDist: 200, 
    color: '56, 189, 248' // RGB Cyan
};

// Resize Logic
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles(); // Re-init to prevent gaps
}

// Mouse tracking
const mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse Interactivity
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.mouseDist) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (config.mouseDist - distance) / config.mouseDist;
                const directionX = forceDirectionX * force * 2;
                const directionY = forceDirectionY * force * 2;
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw() {
        ctx.fillStyle = `rgba(${config.color}, 0.6)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.connectionDist) {
                ctx.beginPath();
                let opacity = 1 - (distance / config.connectionDist);
                ctx.strokeStyle = `rgba(${config.color}, ${opacity * 0.15})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// --- 2. SECURE APP INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // A. Start Animation
    window.addEventListener('resize', resize);
    resize();
    animate();

    // B. Set Footer Year Dynamically
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // C. Email Privacy & Copy Logic
    const user = "harshadivate.2003";
    const domain = "gmail.com";
    const email = `${user}@${domain}`;
    
    // Inject email into the footer display
    const emailDisplay = document.querySelector('.email-display');
    if(emailDisplay) {
        emailDisplay.innerHTML = `${email} <i class="ri-file-copy-line"></i>`;
    }

    // Copy Handler
    const handleCopy = () => {
        navigator.clipboard.writeText(email).then(() => {
            const toast = document.getElementById("toast");
            toast.className = "show";
            setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
        }).catch(err => console.error('Clipboard access denied:', err));
    };

    // Attach listeners to all elements with class 'js-copy-btn'
    const copyButtons = document.querySelectorAll('.js-copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', handleCopy);
    });

    // D. ANALYST COUNTER ANIMATION (DECRYPTION EFFECT)
    const counters = document.querySelectorAll('.counter');
    
    // Helper: Generate random number string of specific length
    const getRandom = (target, isFloat) => {
        if (isFloat) {
            // Returns random float like "4.92"
            return (Math.random() * 10).toFixed(2);
        } else {
            // Returns random int like "05" or "09"
            const val = Math.floor(Math.random() * 99);
            return val < 10 ? `0${val}` : val;
        }
    };

    const startDecryption = (entry, observer) => {
        const counter = entry.target;
        const target = parseFloat(counter.getAttribute('data-target'));
        const isFloat = counter.getAttribute('data-target').includes('.');
        
        let iterations = 0;
        const maxIterations = 25; // How many "scrambles" before stopping
        const speed = 40; // Speed of scramble in ms

        const interval = setInterval(() => {
            // 1. Show random "decryption" noise
            counter.textContent = getRandom(target, isFloat);
            
            iterations++;

            // 2. Stop condition
            if (iterations >= maxIterations) {
                clearInterval(interval);
                // 3. Lock in the final correct value
                counter.textContent = isFloat ? target.toFixed(target === 6.5 ? 1 : 2) : (target < 10 ? `0${target}` : target);
                // 4. Add color class to show it's "verified"
                counter.classList.add('decrypted');
            }
        }, speed);

        observer.unobserve(counter);
    };

    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startDecryption(entry, observer);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
});