import { Injectable } from '@angular/core';

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;

  private colors = [
    '#FF70BF', // brand-highlight
    '#D552A3', // brand-accent
    '#831C91', // brand-secondary
    '#462C7D', // brand-primary
    '#10B981', // success
    '#3B82F6', // info
    '#F59E0B'  // warning
  ];

  burst(): void {
    if (!this.canvas) {
      this.initCanvas();
    }
    
    // Spawn particles
    const particleCount = 150;
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: width / 2,
        y: height + 20, // Start from the bottom
        size: Math.random() * 8 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        speedX: (Math.random() - 0.5) * 15,
        speedY: -Math.random() * 18 - 8, // Shoot upwards
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (this.animationFrameId === null) {
      this.animate();
    }
  }

  private initCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    
    this.resizeCanvas();
    
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private animate = (): void => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Physics calculations
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.45; // Gravity
      p.speedX *= 0.98; // Air resistance drag
      p.rotation += p.rotationSpeed;

      // Draw
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      
      // Draw rectangular confetti piece
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 1.5);
      this.ctx.restore();

      // Remove offscreen particles
      if (p.y > this.canvas.height + 50 || p.x < -50 || p.x > this.canvas.width + 50) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.cleanup();
    }
  };

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}
