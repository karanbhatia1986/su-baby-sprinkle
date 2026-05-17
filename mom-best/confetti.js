class ConfettiCannon {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#E8B4BC', '#C9A0B6', '#B8A4C9', '#F9F5F6', '#D4AF37', '#90C695'];
        this.shapes = ['circle', 'square', 'triangle'];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(x, y) {
        return {
            x: x || Math.random() * this.canvas.width,
            y: y || -10,
            size: Math.random() * 8 + 4,
            speedX: Math.random() * 6 - 3,
            speedY: Math.random() * -15 - 5,
            gravity: 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            shape: this.shapes[Math.floor(Math.random() * this.shapes.length)],
            opacity: 1
        };
    }

    drawParticle(particle) {
        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation * Math.PI / 180);
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;

        switch(particle.shape) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'square':
                this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                break;
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(0, -particle.size);
                this.ctx.lineTo(particle.size, particle.size);
                this.ctx.lineTo(-particle.size, particle.size);
                this.ctx.closePath();
                this.ctx.fill();
                break;
        }

        this.ctx.restore();
    }

    updateParticle(particle) {
        particle.speedY += particle.gravity;
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        if (particle.y > this.canvas.height - 100) {
            particle.opacity -= 0.02;
        }

        return particle.y < this.canvas.height && particle.opacity > 0;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (this.updateParticle(particle)) {
                this.drawParticle(particle);
            } else {
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }

    burst(count = 150, x, y) {
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        if (this.particles.length === count) {
            this.animate();
        }
    }

    continuous(duration = 3000) {
        const interval = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                this.particles.push(this.createParticle());
            }
        }, 50);

        this.animate();

        setTimeout(() => {
            clearInterval(interval);
        }, duration);
    }
}

const confetti = new ConfettiCannon();
