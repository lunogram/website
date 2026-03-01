"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

// =============================================================================
// TYPES
// =============================================================================

interface GlowCardsProps {
  children: React.ReactNode;
  /** Size of the glow effect in pixels */
  glowSize?: number;
  /** Color of the glow effect */
  glowColor?: string;
  /** Additional class name for the container */
  className?: string;
  /** CSS selector for the cards within the container */
  cardSelector?: string;
  /** Border radius class for the glow overlay (default: rounded-3xl) */
  borderRadius?: string;
}

interface MousePosition {
  x: number;
  y: number;
}

interface CardRect {
  top: number;
  left: number;
  width: number;
  height: number;
  glowColor?: string;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to detect reduced motion preference
 */
function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * GlowCards - A container component that adds a cursor-following glow effect to its children.
 * 
 * Based on the technique from SmoothUI's Glow Hover Cards:
 * - Tracks actual card positions within the container
 * - Creates overlay elements that match each card's exact size and position
 * - Uses CSS mask-image with radial gradient positioned at cursor
 * - Glow is revealed only where the cursor is via the mask
 */
export function GlowCards({
  children,
  glowSize = 300,
  glowColor = "rgba(139, 92, 246, 0.15)",
  className = "",
  cardSelector = "[data-glow-card]",
  borderRadius = "rounded-3xl",
}: GlowCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [cardRects, setCardRects] = useState<CardRect[]>([]);
  const reducedMotion = useReducedMotion();

  // Measure card positions relative to the container
  const measureCards = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const cards = container.querySelectorAll(cardSelector);
    
    const rects: CardRect[] = [];
    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const customGlowColor = card.getAttribute('data-glow-color');
      rects.push({
        top: cardRect.top - containerRect.top,
        left: cardRect.left - containerRect.left,
        width: cardRect.width,
        height: cardRect.height,
        glowColor: customGlowColor || undefined,
      });
    });
    
    setCardRects(rects);
  }, [cardSelector]);

  // Measure on mount and when window resizes
  useEffect(() => {
    measureCards();
    
    const handleResize = () => measureCards();
    window.addEventListener("resize", handleResize);
    
    // Also re-measure after a short delay to catch any layout shifts
    const timeout = setTimeout(measureCards, 100);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [measureCards]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [reducedMotion]
  );

  const handlePointerEnter = useCallback(() => {
    if (!reducedMotion) {
      setIsHovering(true);
      // Re-measure cards on hover in case layout changed
      measureCards();
    }
  }, [reducedMotion, measureCards]);

  const handlePointerLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Don't render glow overlay if reduced motion is preferred
  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Original content */}
      {children}

      {/* Glow overlay - positioned absolutely over the content */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          maskImage: `radial-gradient(${glowSize}px ${glowSize}px at ${mousePosition.x}px ${mousePosition.y}px, #000 10%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(${glowSize}px ${glowSize}px at ${mousePosition.x}px ${mousePosition.y}px, #000 10%, transparent 70%)`,
        }}
      >
        {/* Render glow overlay for each measured card */}
        {cardRects.map((rect, index) => {
          const color = rect.glowColor || glowColor;
          return (
            <div
              key={index}
              className={`absolute ${borderRadius}`}
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
                boxShadow: `inset 0 0 20px ${color}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default GlowCards;
