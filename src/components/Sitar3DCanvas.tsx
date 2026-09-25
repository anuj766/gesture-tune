'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Sitar3DCanvasProps {
  active: boolean;
  activeNotesCount?: number;
}

const ART_CARDS = [
  {
    title: 'Tabla & Tanpura Raga',
    subtitle: 'Rhythm & Drone Harmony',
    tag: 'Rhythms of India',
    color: 'from-amber-600 via-rose-700 to-yellow-600',
    icon: '🥁',
  },
  {
    title: 'Classical Sitar Maestro',
    subtitle: 'Authentic Carved Mahogany Tumba',
    tag: 'Strings of Devotion',
    color: 'from-[#800f2f] via-[#b8860b] to-[#4a0e17]',
    icon: '🪕',
  },
  {
    title: 'Traditional Harmonium',
    subtitle: 'Indian Classical Vocal & Reed Companion',
    tag: 'Heritage Melodies',
    color: 'from-[#b8860b] via-[#d4af37] to-[#800f2f]',
    icon: '🎹',
  },
  {
    title: 'Royal Paisley Tapestry',
    subtitle: 'Intricate Indian Floral Art & Mandalas',
    tag: 'Cultural Heritage',
    color: 'from-rose-800 via-amber-600 to-[#1c060a]',
    icon: '✨',
  },
];

export function Sitar3DCanvas({ active, activeNotesCount = 0 }: Sitar3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);

  useEffect(() => {
    if (activeNotesCount > 0) {
      pulseRef.current = 1.0;
    }
  }, [activeNotesCount]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning || !canvas) return;

      const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 450);

      ctx.clearRect(0, 0, width, height);

      angleRef.current += 0.008; // Continuous 3D rotation speed
      pulseRef.current = Math.max(0, pulseRef.current - 0.03); // Decay string pulse

      const centerX = width / 2;
      const centerY = height / 2;
      const angle = angleRef.current;

      ctx.save();

      // 1. Ambient Background Glowing Halo
      const bgGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        20,
        centerX,
        centerY,
        Math.min(width, height) * 0.45
      );
      bgGlow.addColorStop(0, `rgba(212, 175, 55, ${0.15 + pulseRef.current * 0.2})`);
      bgGlow.addColorStop(0.5, 'rgba(128, 15, 47, 0.12)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Render 3D Rotating Glowing Sitar Model
      ctx.save();
      ctx.translate(centerX, centerY);

      // 3D Perspective Tilt & Rotation Matrix Math
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tilt = Math.sin(angle * 0.5) * 0.15;

      // Draw Sympathetic String Aura Lines (Tarab Strings)
      const numStrings = 7;
      for (let i = 0; i < numStrings; i++) {
        const offset = (i - numStrings / 2) * 4;
        ctx.beginPath();
        const startX = offset * cosA - 160 * sinA * 0.3;
        const startY = -180 + offset * tilt;
        const endX = offset * cosA + 140 * sinA * 0.3;
        const endY = 160 + offset * tilt;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = i === 0 || i === 1 ? 2.5 : 1.2;
        const stringAlpha = 0.4 + pulseRef.current * 0.5 + Math.sin(angle * 3 + i) * 0.2;
        ctx.strokeStyle = `rgba(252, 211, 77, ${stringAlpha})`;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8 + pulseRef.current * 15;
        ctx.stroke();
      }

      // Draw Main Neck (Dandi)
      ctx.beginPath();
      const neckWidth = 24 * (0.8 + 0.2 * cosA);
      ctx.rect(-neckWidth / 2, -190, neckWidth, 310);
      const neckGrad = ctx.createLinearGradient(-neckWidth / 2, 0, neckWidth / 2, 0);
      neckGrad.addColorStop(0, '#2b1810');
      neckGrad.addColorStop(0.5, '#5c2c16');
      neckGrad.addColorStop(1, '#1c0f0a');
      ctx.fillStyle = neckGrad;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Draw Curved Metallic Frets (Parda)
      for (let f = -170; f < 110; f += 18) {
        ctx.beginPath();
        ctx.moveTo(-neckWidth / 2 - 2, f);
        ctx.quadraticCurveTo(0, f + 4, neckWidth / 2 + 2, f);
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.7 + Math.sin(f + angle * 4) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Tuning Pegs (Kunti) at Top
      for (let p = -180; p < -130; p += 16) {
        const pegSide = p % 32 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(pegSide * (neckWidth / 2 + 10), p, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af37';
        ctx.fill();
      }

      // Draw Carved Gourd (Tumba) at Bottom
      const tumbaRadius = 65 + 10 * cosA;
      ctx.beginPath();
      ctx.arc(0, 150, tumbaRadius, 0, Math.PI * 2);
      const tumbaGrad = ctx.createRadialGradient(
        -15,
        135,
        10,
        0,
        150,
        tumbaRadius
      );
      tumbaGrad.addColorStop(0, '#800f2f');
      tumbaGrad.addColorStop(0.6, '#4a0e17');
      tumbaGrad.addColorStop(1, '#1c0509');
      ctx.fillStyle = tumbaGrad;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 15 + pulseRef.current * 20;
      ctx.fill();
      ctx.stroke();

      // Draw Floral Carvings on Tumba
      ctx.beginPath();
      ctx.arc(0, 150, tumbaRadius * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      // 3. Orbiting 3D Indian Cultural Reference Art Cards
      const orbitRadiusX = width * 0.36;
      const orbitRadiusY = height * 0.22;

      ART_CARDS.forEach((card, idx) => {
        const cardAngle = angle + (idx * Math.PI) / 2;
        const cardX = centerX + Math.cos(cardAngle) * orbitRadiusX;
        const cardY = centerY + Math.sin(cardAngle) * orbitRadiusY;
        const scale = 0.75 + 0.25 * Math.sin(cardAngle);
        const alpha = 0.5 + 0.5 * Math.sin(cardAngle);

        ctx.save();
        ctx.translate(cardX, cardY);
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(0.2, alpha);

        // Draw 3D Card Backdrop
        const cardW = 140;
        const cardH = 80;
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
        ctx.fillStyle = 'rgba(42, 7, 14, 0.85)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.stroke();

        // Draw Card Content
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(card.icon, 0, -18);

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#fcd34d';
        ctx.fillText(card.title, 0, 4);

        ctx.font = '8px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(card.subtitle, 0, 18);

        ctx.restore();
      });

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full h-[450px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#2a070e]/90 via-[#1c0509]/95 to-[#120306] border border-[#d4af37]/40 shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col items-center justify-center p-4"
    >
      {/* 3D WebGL Canvas Layer */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Showcase Footer Banner */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#3b0a13]/90 border border-[#d4af37]/50 text-center shadow-lg backdrop-blur-md flex items-center gap-2">
        <span className="text-sm">🪕</span>
        <span className="text-xs font-mono font-bold text-[#fcd34d] tracking-wider uppercase">
          3D Glowing Sitar & Indian Classical Art Showcase
        </span>
      </div>
    </motion.div>
  );
}
