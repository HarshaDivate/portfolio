const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Configuration
const getParticleCount = () => window.innerWidth < 600 ? 30 : 60;

const config = {
    count: getParticleCount(),
    connectionDist: 150, 
    mouseDist: 200, 
    color: '56, 189, 248' // RGB Cyan
};

// Resize
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

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

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

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
initParticles();

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

animate();

// --- EMAIL COPY FUNCTION ---
function copyEmail() {
    const email = "harshadivate.2003@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
        const toast = document.getElementById("toast");
        toast.className = "show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }).catch(err => {
        console.error('Failed to copy email', err);
    });
}