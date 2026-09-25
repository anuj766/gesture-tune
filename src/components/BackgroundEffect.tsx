'use client';

import { useEffect, useRef } from 'react';

export function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle constellation
    const numParticles = 65;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.8,
      color: Math.random() > 0.5 ? 'rgba(0, 243, 255, ' : 'rgba(255, 0, 127, ',
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#0c071e');
      bgGrad.addColorStop(0.5, '#05020c');
      bgGrad.addColorStop(1, '#020005');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render glowing mesh orbs
      const time = Date.now() * 0.0005;
      const orb1X = width * 0.3 + Math.sin(time) * 120;
      const orb1Y = height * 0.4 + Math.cos(time * 0.8) * 80;
      const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, 350);
      orb1Grad.addColorStop(0, 'rgba(0, 243, 255, 0.08)');
      orb1Grad.addColorStop(1, 'rgba(0, 243, 255, 0)');
      ctx.fillStyle = orb1Grad;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.7 + Math.cos(time * 0.9) * 140;
      const orb2Y = height * 0.6 + Math.sin(time * 0.7) * 90;
      const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, 380);
      orb2Grad.addColorStop(0, 'rgba(255, 0, 127, 0.07)');
      orb2Grad.addColorStop(1, 'rgba(255, 0, 127, 0)');
      ctx.fillStyle = orb2Grad;
      ctx.fillRect(0, 0, width, height);

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
