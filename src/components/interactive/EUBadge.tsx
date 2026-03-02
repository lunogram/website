"use client";

import { useRef } from "react";
import { animate, utils } from "animejs";

export default function EUBadge() {
  const containerRef = useRef<HTMLSpanElement>(null);
  const flagsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const animationsRef = useRef<ReturnType<typeof animate>[]>([]);

  // Create multiple flag elements for confetti effect
  // Positioned in a radial starburst pattern around the text with variable sizes
  const flags = [
    { emoji: "🇳🇱", x: -40, y: -25, rotate: -20, delay: 0, scale: 1.8 },     // upper-left (large)
    { emoji: "🇪🇺", x: 40, y: -25, rotate: 20, delay: 50, scale: 1.4 },      // upper-right (medium)
    { emoji: "🇳🇱", x: 50, y: 5, rotate: 15, delay: 100, scale: 1.1 },       // right (small)
    { emoji: "🇪🇺", x: -50, y: 5, rotate: -15, delay: 75, scale: 1.5 },      // left (medium)
    { emoji: "🇳🇱", x: -30, y: 28, rotate: -25, delay: 25, scale: 1.2 },     // lower-left (small)
    { emoji: "🇪🇺", x: 30, y: 28, rotate: 25, delay: 125, scale: 1.7 },      // lower-right (large)
  ];

  const handleMouseEnter = () => {
    // Cancel any existing animations
    animationsRef.current.forEach((anim) => anim?.pause());
    animationsRef.current = [];

    flags.forEach((flag, i) => {
      const el = flagsRef.current[i];
      if (!el) return;

      // Reset position using Anime.js utils.set for proper transform handling
      utils.set(el, {
        opacity: 0,
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0,
      });

      // Animate outward like confetti using Anime.js v4 syntax
      const anim = animate(el, {
        opacity: [0, 1],
        scale: [0, flag.scale * 1.2, flag.scale],
        x: [0, flag.x],
        y: [0, flag.y],
        rotate: [0, flag.rotate + (Math.random() * 20 - 10)],
        duration: 500,
        delay: flag.delay,
        ease: "outBack",
      });
      animationsRef.current.push(anim);
    });
  };

  const handleMouseLeave = () => {
    // Cancel any existing animations
    animationsRef.current.forEach((anim) => anim?.pause());
    animationsRef.current = [];

    flags.forEach((flag, i) => {
      const el = flagsRef.current[i];
      if (!el) return;

      // Animate out with fade
      const anim = animate(el, {
        opacity: 0,
        scale: 0,
        y: `+=${15}`,
        rotate: `+=${20}`,
        duration: 300,
        delay: i * 20,
        ease: "inQuad",
      });
      animationsRef.current.push(anim);
    });
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center cursor-default select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ overflow: "visible" }}
    >
      {/* Confetti flags container - positioned to allow flags to appear on all sides */}
      <span 
        className="absolute pointer-events-none flex items-center justify-center"
        style={{ 
          left: "50%", 
          top: "50%", 
          transform: "translate(-50%, -50%)",
          width: "200px",
          height: "120px",
        }}
      >
        {flags.map((flag, i) => (
          <span
            key={i}
            ref={(el) => { flagsRef.current[i] = el; }}
            className="absolute text-lg"
            style={{ 
              opacity: 0, 
              transform: "scale(0)",
              color: "initial",
              WebkitTextFillColor: "initial",
            }}
          >
            {flag.emoji}
          </span>
        ))}
      </span>
      {/* "the EU" text - styled in EU blue (lightened for dark background) */}
      <span
        className="relative font-semibold"
        style={{ color: "#4d7acc" }}
      >
        the EU
      </span>
    </span>
  );
}
