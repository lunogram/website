"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { animate, createTimeline, type Timeline } from "animejs";

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type StepType = "entrance" | "delay" | "gate" | "email" | "push";

interface Step {
  id: StepType;
  title: string;
  label: string;
  value: string;
}

// Step styling configuration
const stepConfig = {
  entrance: {
    iconBg: "rgba(156, 163, 175, 0.15)",
    iconColor: "#9ca3af",
    glowColor: "rgba(156, 163, 175, 0.4)",
  },
  delay: {
    iconBg: "rgba(251, 191, 36, 0.15)",
    iconColor: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.4)",
  },
  gate: {
    iconBg: "rgba(167, 139, 250, 0.15)",
    iconColor: "#a78bfa",
    glowColor: "rgba(167, 139, 250, 0.4)",
  },
  email: {
    iconBg: "rgba(96, 165, 250, 0.15)",
    iconColor: "#60a5fa",
    glowColor: "rgba(96, 165, 250, 0.4)",
  },
  push: {
    iconBg: "rgba(244, 114, 182, 0.15)",
    iconColor: "#f472b6",
    glowColor: "rgba(244, 114, 182, 0.4)",
  },
} as const;

// Journey steps data
const steps: Step[] = [
  {
    id: "entrance",
    title: "Entrance",
    label: "Event Trigger",
    value: "user_signed_up",
  },
  { id: "delay", title: "Delay", label: "Wait for", value: "1 hour" },
  {
    id: "gate",
    title: "Gate",
    label: "Check condition",
    value: "has opened app",
  },
  {
    id: "email",
    title: "Email",
    label: "Active users",
    value: "Welcome Series",
  },
  { id: "push", title: "Push", label: "Inactive users", value: "Re-engage" },
];

// =============================================================================
// ICONS
// =============================================================================

const Icons: Record<StepType, React.ReactNode> = {
  entrance: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
        clipRule="evenodd"
      />
    </svg>
  ),
  delay: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  gate: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.379 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  email: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
  ),
  push: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

// =============================================================================
// HOOKS
// =============================================================================

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StepCard({ step }: { step: Step }) {
  const config = stepConfig[step.id];

  return (
    <div
      className="step-card relative flex-shrink-0 w-[160px] sm:w-[180px]"
      data-step={step.id}
      style={{ opacity: 0.7 }}
    >
      <div
        className="step-card-inner rounded-xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="step-icon w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: config.iconBg,
              color: config.iconColor,
            }}
          >
            {Icons[step.id]}
          </div>
          <span className="font-medium text-[14px] text-white/90 truncate">
            {step.title}
          </span>
        </div>
        <div className="px-4 py-3">
          <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">
            {step.label}
          </div>
          <div className="text-[14px] text-white/80 font-medium truncate">
            {step.value}
          </div>
        </div>
      </div>
    </div>
  );
}

// Horizontal connector between steps (Entrance->Delay, Delay->Gate)
function HorizontalConnector({ id }: { id: string }) {
  return (
    <div
      className="horizontal-connector relative h-[2px] w-[40px] mx-3 flex-shrink-0"
      data-connector={id}
    >
      {/* Base line (always visible) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      />
      {/* Animated glow line */}
      <div
        className="connector-line absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(167,139,250,0.9), rgba(139,92,246,0.9))",
          boxShadow: "0 0 8px rgba(139,92,246,0.6)",
          transform: "scaleX(0)",
          transformOrigin: "left center",
        }}
      />
      {/* Animated dot */}
      <div
        className="connector-dot absolute w-[6px] h-[6px] rounded-full"
        style={{
          background: "rgba(167,139,250,1)",
          boxShadow: "0 0 8px rgba(139,92,246,0.8)",
          top: "50%",
          right: "-3px",
          transform: "translateY(-50%)",
          opacity: 0,
        }}
      />
    </div>
  );
}

// Branch section with both YES and NO paths originating from the same point
function BranchPaths() {
  return (
    <div
      className="branch-paths absolute"
      style={{
        left: "0",
        top: "50%",
        transform: "translateY(-50%)",
        width: "70px",
        height: "280px",
      }}
      data-branch-paths
    >
      <svg
        className="absolute"
        style={{
          left: "0",
          top: "0",
          width: "70px",
          height: "280px",
          overflow: "visible",
        }}
        viewBox="0 0 70 280"
        fill="none"
      >
        <defs>
          <filter id="glow-up" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-down" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* YES path - curves up from center to top */}
        {/* Base path */}
        <path
          d="M 0 140 C 30 140 30 70 70 70"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Animated glow path */}
        <path
          className="branch-path-up"
          d="M 0 140 C 30 140 30 70 70 70"
          stroke="rgba(96, 165, 250, 0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow-up)"
          style={{
            strokeDasharray: 140,
            strokeDashoffset: 140,
            opacity: 0,
          }}
        />
        {/* Dot */}
        <circle
          className="branch-dot-up"
          cx={68}
          cy={70}
          r="3"
          fill="rgba(96, 165, 250, 1)"
          filter="url(#glow-up)"
          style={{ opacity: 0 }}
        />

        {/* NO path - curves down from center to bottom */}
        {/* Base path */}
        <path
          d="M 0 140 C 30 140 30 210 70 210"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Animated glow path */}
        <path
          className="branch-path-down"
          d="M 0 140 C 30 140 30 210 70 210"
          stroke="rgba(244, 114, 182, 0.9)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow-down)"
          style={{
            strokeDasharray: 140,
            strokeDashoffset: 140,
            opacity: 0,
          }}
        />
        {/* Dot */}
        <circle
          className="branch-dot-down"
          cx={68}
          cy={210}
          r="3"
          fill="rgba(244, 114, 182, 1)"
          filter="url(#glow-down)"
          style={{ opacity: 0 }}
        />
      </svg>

      {/* YES label */}
      <span
        className="branch-label-up absolute text-[10px] font-bold tracking-wider text-sky-400"
        style={{
          left: "45px",
          top: "45px",
          opacity: 0,
        }}
      >
        YES
      </span>

      {/* NO label */}
      <span
        className="branch-label-down absolute text-[10px] font-bold tracking-wider text-pink-400"
        style={{
          left: "45px",
          bottom: "45px",
          opacity: 0,
        }}
      >
        NO
      </span>
    </div>
  );
}

function StatsBar({ userCount }: { userCount: number }) {
  return (
    <div
      className="stats-bar px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-5 sm:gap-8">
        <div className="flex items-center gap-2">
          <div className="live-dot w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-white/50 text-sm">Live</span>
        </div>
        <div className="text-white/60 text-sm">
          <span className="text-white tabular-nums font-semibold">
            {userCount.toLocaleString()}
          </span>{" "}
          users in journey
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/50">
        <span>
          <span className="text-emerald-400 tabular-nums font-semibold">
            94%
          </span>{" "}
          delivered
        </span>
        <span>
          <span className="text-sky-400 tabular-nums font-semibold">42%</span>{" "}
          opened
        </span>
        <span>
          <span className="text-violet-400 tabular-nums font-semibold">
            12%
          </span>{" "}
          converted
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function JourneyAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [userCount, setUserCount] = useState(2847);

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const liveDotAnimRef = useRef<ReturnType<typeof animate> | null>(null);

  // Alternate between YES and NO paths
  const takeYesPath = cycleCount % 2 === 0;

  // Build the animation timeline
  const buildTimeline = useCallback(() => {
    if (!containerRef.current || prefersReducedMotion) return null;

    const container = containerRef.current;

    const tl = createTimeline({
      defaults: { ease: "outQuart" },
      autoplay: false,
      onBegin: () => {
        // Increment user count when animation starts
        setUserCount((prev) => prev + 1);
      },
      onComplete: () => {
        // Trigger next cycle (will rebuild timeline with alternating path)
        setCycleCount((prev) => prev + 1);
      },
    });

    // Get elements
    const entranceCard = container.querySelector(
      '[data-step="entrance"]',
    ) as HTMLElement;
    const delayCard = container.querySelector(
      '[data-step="delay"]',
    ) as HTMLElement;
    const gateCard = container.querySelector(
      '[data-step="gate"]',
    ) as HTMLElement;
    const emailCard = container.querySelector(
      '[data-step="email"]',
    ) as HTMLElement;
    const pushCard = container.querySelector(
      '[data-step="push"]',
    ) as HTMLElement;

    const connector1 = container.querySelector(
      '[data-connector="1"]',
    ) as HTMLElement;
    const connector2 = container.querySelector(
      '[data-connector="2"]',
    ) as HTMLElement;
    const branchPaths = container.querySelector(
      "[data-branch-paths]",
    ) as HTMLElement;

    // Helper to activate a card
    const activateCard = (card: HTMLElement | null) => {
      if (!card) return;
      const inner = card.querySelector(".step-card-inner") as HTMLElement;
      const stepId = card.dataset.step as StepType;
      const config = stepConfig[stepId];
      if (inner) {
        inner.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
        inner.style.borderColor = "rgba(255, 255, 255, 0.20)";
        inner.style.boxShadow = `0 0 24px ${config.glowColor}, 0 4px 16px rgba(0,0,0,0.2)`;
      }
    };

    const deactivateCard = (card: HTMLElement | null) => {
      if (!card) return;
      const inner = card.querySelector(".step-card-inner") as HTMLElement;
      if (inner) {
        inner.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
        inner.style.borderColor = "rgba(255, 255, 255, 0.08)";
        inner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      }
    };

    // =====================
    // FORWARD ANIMATION
    // =====================

    // 1. Activate entrance
    tl.add(entranceCard, {
      opacity: 1,
      duration: 400,
      onBegin: () => activateCard(entranceCard),
    });

    // 2. Animate connector 1
    if (connector1) {
      const line1 = connector1.querySelector(".connector-line") as HTMLElement;
      const dot1 = connector1.querySelector(".connector-dot") as HTMLElement;

      if (line1) {
        tl.add(
          line1,
          {
            scaleX: [0, 1],
            duration: 400,
            ease: "outQuad",
          },
          "-=100",
        );
      }

      if (dot1) {
        tl.add(dot1, { opacity: [0, 1], duration: 150 }, "-=50");
      }
    }

    // 3. Activate delay
    tl.add(
      delayCard,
      {
        opacity: 1,
        duration: 400,
        onBegin: () => activateCard(delayCard),
      },
      "-=200",
    );

    // 4. Animate connector 2
    if (connector2) {
      const line2 = connector2.querySelector(".connector-line") as HTMLElement;
      const dot2 = connector2.querySelector(".connector-dot") as HTMLElement;

      if (line2) {
        tl.add(
          line2,
          {
            scaleX: [0, 1],
            duration: 400,
            ease: "outQuad",
          },
          "-=100",
        );
      }

      if (dot2) {
        tl.add(dot2, { opacity: [0, 1], duration: 150 }, "-=50");
      }
    }

    // 5. Activate gate
    tl.add(
      gateCard,
      {
        opacity: 1,
        duration: 400,
        onBegin: () => activateCard(gateCard),
      },
      "-=200",
    );

    // 6. Branch animation
    if (branchPaths) {
      if (takeYesPath) {
        const path = branchPaths.querySelector(".branch-path-up") as SVGElement;
        const dot = branchPaths.querySelector(".branch-dot-up") as SVGElement;
        const label = branchPaths.querySelector(
          ".branch-label-up",
        ) as HTMLElement;

        if (path) {
          tl.add(
            path,
            {
              strokeDashoffset: [140, 0],
              opacity: [0, 1],
              duration: 500,
              ease: "outQuad",
            },
            "-=100",
          );
        }

        if (label) {
          tl.add(label, { opacity: [0, 1], duration: 250 }, "-=350");
        }

        if (dot) {
          tl.add(dot, { opacity: [0, 1], duration: 150 }, "-=50");
        }

        tl.add(
          emailCard,
          {
            opacity: 1,
            duration: 400,
            onBegin: () => activateCard(emailCard),
          },
          "-=150",
        );
      } else {
        const path = branchPaths.querySelector(
          ".branch-path-down",
        ) as SVGElement;
        const dot = branchPaths.querySelector(".branch-dot-down") as SVGElement;
        const label = branchPaths.querySelector(
          ".branch-label-down",
        ) as HTMLElement;

        if (path) {
          tl.add(
            path,
            {
              strokeDashoffset: [140, 0],
              opacity: [0, 1],
              duration: 500,
              ease: "outQuad",
            },
            "-=100",
          );
        }

        if (label) {
          tl.add(label, { opacity: [0, 1], duration: 250 }, "-=350");
        }

        if (dot) {
          tl.add(dot, { opacity: [0, 1], duration: 150 }, "-=50");
        }

        tl.add(
          pushCard,
          {
            opacity: 1,
            duration: 400,
            onBegin: () => activateCard(pushCard),
          },
          "-=150",
        );
      }
    }

    // 7. Hold state
    tl.add({ duration: 2500 });

    // =====================
    // RESET ANIMATION - Simultaneous fade out
    // =====================

    // Collect all elements to fade out
    const elementsToFade: (HTMLElement | SVGElement | null)[] = [
      entranceCard,
      delayCard,
      gateCard,
    ];

    // Add the active destination card
    if (takeYesPath) {
      elementsToFade.push(emailCard);
    } else {
      elementsToFade.push(pushCard);
    }

    // Get connector elements
    const line1 = connector1?.querySelector(".connector-line") as HTMLElement;
    const dot1 = connector1?.querySelector(".connector-dot") as HTMLElement;
    const line2 = connector2?.querySelector(".connector-line") as HTMLElement;
    const dot2 = connector2?.querySelector(".connector-dot") as HTMLElement;

    // Get branch path elements
    const branchPath = takeYesPath
      ? branchPaths?.querySelector(".branch-path-up")
      : branchPaths?.querySelector(".branch-path-down");
    const branchDot = takeYesPath
      ? branchPaths?.querySelector(".branch-dot-up")
      : branchPaths?.querySelector(".branch-dot-down");
    const branchLabel = takeYesPath
      ? branchPaths?.querySelector(".branch-label-up")
      : branchPaths?.querySelector(".branch-label-down");

    // Deactivate all cards
    tl.call(() => {
      deactivateCard(entranceCard);
      deactivateCard(delayCard);
      deactivateCard(gateCard);
      if (takeYesPath) {
        deactivateCard(emailCard);
      } else {
        deactivateCard(pushCard);
      }
    });

    // Fade out all cards simultaneously
    tl.add(elementsToFade.filter(Boolean) as HTMLElement[], {
      opacity: 0.7,
      duration: 400,
    });

    // Fade out connector lines
    if (line1) {
      tl.add(line1, { opacity: 0, duration: 400 }, "-=400");
    }
    if (line2) {
      tl.add(line2, { opacity: 0, duration: 400 }, "-=400");
    }

    // Fade out connector dots
    if (dot1) {
      tl.add(dot1, { opacity: 0, duration: 400 }, "-=400");
    }
    if (dot2) {
      tl.add(dot2, { opacity: 0, duration: 400 }, "-=400");
    }

    // Fade out branch path, dot, and label
    if (branchPath) {
      tl.add(branchPath, { opacity: 0, duration: 400 }, "-=400");
    }
    if (branchDot) {
      tl.add(branchDot, { opacity: 0, duration: 400 }, "-=400");
    }
    if (branchLabel) {
      tl.add(branchLabel, { opacity: 0, duration: 400 }, "-=400");
    }

    // Reset properties for next cycle
    tl.call(() => {
      if (connector1) {
        const line = connector1.querySelector(".connector-line") as HTMLElement;
        const dot = connector1.querySelector(".connector-dot") as HTMLElement;
        if (line) {
          line.style.transform = "scaleX(0)";
          line.style.opacity = "1";
        }
        if (dot) {
          dot.style.opacity = "0";
        }
      }
      if (connector2) {
        const line = connector2.querySelector(".connector-line") as HTMLElement;
        const dot = connector2.querySelector(".connector-dot") as HTMLElement;
        if (line) {
          line.style.transform = "scaleX(0)";
          line.style.opacity = "1";
        }
        if (dot) {
          dot.style.opacity = "0";
        }
      }
      if (branchPaths) {
        const pathUp = branchPaths.querySelector(
          ".branch-path-up",
        ) as SVGPathElement;
        const dotUp = branchPaths.querySelector(
          ".branch-dot-up",
        ) as SVGCircleElement;
        const labelUp = branchPaths.querySelector(
          ".branch-label-up",
        ) as HTMLElement;
        const pathDown = branchPaths.querySelector(
          ".branch-path-down",
        ) as SVGPathElement;
        const dotDown = branchPaths.querySelector(
          ".branch-dot-down",
        ) as SVGCircleElement;
        const labelDown = branchPaths.querySelector(
          ".branch-label-down",
        ) as HTMLElement;

        if (pathUp) {
          pathUp.style.strokeDashoffset = "140";
          pathUp.style.opacity = "0";
        }
        if (dotUp) {
          dotUp.style.opacity = "0";
        }
        if (labelUp) {
          labelUp.style.opacity = "0";
        }
        if (pathDown) {
          pathDown.style.strokeDashoffset = "140";
          pathDown.style.opacity = "0";
        }
        if (dotDown) {
          dotDown.style.opacity = "0";
        }
        if (labelDown) {
          labelDown.style.opacity = "0";
        }
      }
    });

    // Pause before next cycle
    tl.add({ duration: 1000 });

    return tl;
  }, [prefersReducedMotion, takeYesPath]);

  // Run timeline when visible - rebuilds on each cycle to alternate paths
  useEffect(() => {
    if (!isVisible || prefersReducedMotion) {
      if (timelineRef.current) {
        timelineRef.current.pause();
        timelineRef.current = null;
      }
      return;
    }

    // Build new timeline for this cycle (alternates YES/NO path)
    const timeline = buildTimeline();
    if (timeline) {
      timelineRef.current = timeline;
      timeline.play();
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
        timelineRef.current = null;
      }
    };
  }, [isVisible, cycleCount, buildTimeline, prefersReducedMotion]);

  // Live dot pulsing
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const liveDot = containerRef.current.querySelector(".live-dot");
    if (liveDot) {
      liveDotAnimRef.current = animate(liveDot, {
        opacity: [0.5, 1, 0.5],
        duration: 2000,
        ease: "inOutSine",
        loop: true,
      });
    }

    return () => {
      if (liveDotAnimRef.current) {
        liveDotAnimRef.current.pause();
      }
    };
  }, [prefersReducedMotion]);

  // Intersection observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Reduced motion: static state
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(12, 12, 18, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-white/40 text-sm font-medium">
              Welcome Journey
            </span>
          </div>
        </div>

        <div className="py-10 px-5 sm:px-8 overflow-x-auto">
          <div className="flex items-center min-w-[800px]">
            {steps.slice(0, 3).map((step, i) => (
              <div key={step.id} className="flex items-center">
                <StepCard step={step} />
                {i < 2 && <HorizontalConnector id={String(i + 1)} />}
              </div>
            ))}

            <div className="relative h-[200px] flex flex-col justify-center">
              <div
                className="flex items-center"
                style={{ marginBottom: "10px" }}
              >
                <HorizontalConnector id="branch-up" />
                <StepCard step={steps[3]} />
              </div>
              <div className="flex items-center" style={{ marginTop: "10px" }}>
                <HorizontalConnector id="branch-down" />
                <StepCard step={steps[4]} />
              </div>
            </div>
          </div>
        </div>

        <StatsBar userCount={userCount} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "rgba(12, 12, 18, 0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-white/40 text-sm font-medium">
            Welcome Journey
          </span>
        </div>
      </div>

      {/* Journey canvas */}
      <div className="py-10 px-5 sm:px-8 overflow-x-auto journey-scrollbar">
        <div className="flex items-center w-max mx-auto">
          {/* Entrance */}
          <StepCard step={steps[0]} />

          {/* Connector 1 */}
          <HorizontalConnector id="1" />

          {/* Delay */}
          <StepCard step={steps[1]} />

          {/* Connector 2 */}
          <HorizontalConnector id="2" />

          {/* Gate */}
          <StepCard step={steps[2]} />

          {/* Branch section with unified paths */}
          <div
            className="relative flex flex-col justify-center flex-shrink-0"
            style={{ height: "280px", marginLeft: "0px", width: "250px" }}
          >
            {/* SVG paths container */}
            <BranchPaths />

            {/* Cards positioned absolutely to align with path endpoints */}
            <div
              className="absolute"
              style={{ left: "70px", top: "0", height: "100%" }}
            >
              {/* Email card - aligned with YES path (y=70 in 280px) */}
              <div
                style={{
                  position: "absolute",
                  top: "70px",
                  transform: "translateY(-50%)",
                }}
              >
                <StepCard step={steps[3]} />
              </div>

              {/* Push card - aligned with NO path (y=210 in 280px) */}
              <div
                style={{
                  position: "absolute",
                  top: "210px",
                  transform: "translateY(-50%)",
                }}
              >
                <StepCard step={steps[4]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <StatsBar userCount={userCount} />
    </div>
  );
}
