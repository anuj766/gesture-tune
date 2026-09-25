'use client';

import { motion } from 'framer-motion';

export function ViolinBackground({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* High-Definition Western Classical Symphony & Sheet Music Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-screen scale-105 transition-transform duration-[20000ms] ease-out"
        style={{ backgroundImage: "url('/images/violin_bg.jpg')" }}
      />

      {/* Dark Walnut Mahogany & Orchestral Golden Amber Vignette Glows */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0705] via-transparent to-[#140c09]/80" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-[#d97706]/25 via-[#b45309]/15 to-transparent rounded-full blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-[#78350f]/30 via-[#d97706]/20 to-transparent rounded-full blur-[150px]" />

      {/* Musical Staff Line & Treble Clef Overlay Animations */}
      <div className="absolute inset-0 opacity-15 flex flex-col justify-around py-12 pointer-events-none">
        {Array.from({ length: 4 }).map((_, staffIdx) => (
          <div key={staffIdx} className="relative w-full h-8 flex flex-col justify-between">
            <div className="w-full h-[1px] bg-amber-400/40" />
            <div className="w-full h-[1px] bg-amber-400/40" />
            <div className="w-full h-[1px] bg-amber-400/40" />
            <div className="w-full h-[1px] bg-amber-400/40" />
            <div className="w-full h-[1px] bg-amber-400/40" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
