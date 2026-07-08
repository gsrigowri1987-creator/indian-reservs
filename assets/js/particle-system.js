class ParticleSystem {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.config = {
      count: 36,
      speed: 0.3,
      size: 2,
      color: '#22D3EE',
      opacity: 0.3,
      ...config
    };
    this.animating = false;
    this.animationId = null;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
    this.bindEvents();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.width = rect.width;
    this.height = rect.height;
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const scale = window.devicePixelRatio || 1;
    for (let i = 0; i < this.config.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: (Math.random() * this.config.size + 1) * scale,
        vy: (Math.random() * 0.3 + 0.1) * scale,
        vx: (Math.random() - 0.5) * 0.15 * scale,
        o: Math.random() * this.config.opacity + 0.2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.draw();
    });
  }

  update() {
    if (this.reduced) return;
    const h = this.canvas.height;
    for (const p of this.particles) {
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -10) p.y = h + 10;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const color = getComputedStyle(document.body).getPropertyValue('--cyan') || this.config.color;
    this.ctx.fillStyle = color;
    
    for (const p of this.particles) {
      this.ctx.globalAlpha = p.o;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;
  }

  start() {
    if (this.animating) return;
    this.animating = true;
    this.loop();
  }

  stop() {
    this.animating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    if (!this.animating) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }
}

let heroParticleSystem = null;

function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    heroParticleSystem = new ParticleSystem(canvas);
    heroParticleSystem.start();
  }
}
