"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { animate, type JSAnimation } from "animejs";

// Demo data - always visible
const DEMO_USERS = [
  {
    name: "Sarah K.",
    email: "sarah@example.com",
    plan: "premium",
    purchases: 3,
  },
  { name: "Mike T.", email: "mike@example.com", plan: "premium", purchases: 5 },
  { name: "Emma L.", email: "emma@example.com", plan: "basic", purchases: 1 },
  {
    name: "James W.",
    email: "james@example.com",
    plan: "premium",
    purchases: 2,
  },
  { name: "Lisa M.", email: "lisa@example.com", plan: "basic", purchases: 4 },
];

// User counts for different filter states
const USER_COUNTS = {
  basic: 7613,
  basicAndPurchases: 4231,
  premium: 5234,
  premiumAndPurchases: 2847,
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
// MAIN COMPONENT
// =============================================================================

export default function ListAnimation() {
  // Filter state - these control which users match
  const [planFilter, setPlanFilter] = useState<"basic" | "premium">("basic");
  const [purchaseFilter, setPurchaseFilter] = useState<number>(0);
  const [userCount, setUserCount] = useState(USER_COUNTS.basic);

  // Animation phase
  const [phase, setPhase] = useState<
    "initial" | "animate-rule1" | "animate-rule2" | "hold" | "reset"
  >("initial");

  // Typing animation states
  const [planText, setPlanText] = useState("");
  const [planValueText, setPlanValueText] = useState("");
  const [showPlanCursor, setShowPlanCursor] = useState(false);
  const [showValueCursor, setShowValueCursor] = useState(false);

  // Highlight states for animated values
  const [highlightPlanValue, setHighlightPlanValue] = useState(false);
  const [highlightPurchaseValue, setHighlightPurchaseValue] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const rule1Ref = useRef<HTMLDivElement>(null);
  const rule2Ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<JSAnimation | null>(null);

  // Compute which users match current filters
  const matchingUsers = DEMO_USERS.map((user) => {
    const matchesPlan = user.plan === planFilter;
    const matchesPurchases =
      purchaseFilter === 0 || user.purchases >= purchaseFilter;
    return matchesPlan && matchesPurchases;
  });

  // Typewriter animation
  const typeText = useCallback(
    (
      text: string,
      setter: React.Dispatch<React.SetStateAction<string>>,
      duration: number,
      onComplete?: () => void,
    ) => {
      const chars = text.split("");
      let index = 0;

      const interval = setInterval(() => {
        if (index < chars.length) {
          setter(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          onComplete?.();
        }
      }, duration / chars.length);

      return () => clearInterval(interval);
    },
    [],
  );

  // Backspace animation - delete text character by character
  const deleteText = useCallback(
    (
      currentText: string,
      setter: React.Dispatch<React.SetStateAction<string>>,
      duration: number,
      onComplete?: () => void,
    ) => {
      let index = currentText.length;

      const interval = setInterval(() => {
        if (index > 0) {
          index--;
          setter(currentText.slice(0, index));
        } else {
          clearInterval(interval);
          onComplete?.();
        }
      }, duration / currentText.length);

      return () => clearInterval(interval);
    },
    [],
  );

  // Animate counter from one value to another
  const animateCounter = useCallback(
    (from: number, to: number, duration: number, onComplete?: () => void) => {
      const counter = { value: from };
      animate(counter, {
        value: to,
        duration,
        ease: "outQuart",
        onUpdate: () => setUserCount(Math.round(counter.value)),
        onComplete,
      });
    },
    [],
  );

  // Main animation sequence
  useEffect(() => {
    if (prefersReducedMotion) {
      // Show final state immediately
      setPlanFilter("premium");
      setPurchaseFilter(2);
      setPlanText("plan");
      setPlanValueText('"premium"');
      setUserCount(USER_COUNTS.premiumAndPurchases);
      return;
    }

    const runAnimation = async () => {
      // Initial state - show "basic" filter
      setPlanFilter("basic");
      setPurchaseFilter(0);
      setPlanText("plan");
      setPlanValueText('"basic"');
      setUserCount(USER_COUNTS.basic);
      setShowPlanCursor(false);
      setShowValueCursor(false);

      // Wait before starting
      await new Promise((r) => setTimeout(r, 1500));

      // Phase 1: Animate rule 1 - change plan filter
      setPhase("animate-rule1");

      // Highlight the plan value pill
      setHighlightPlanValue(true);

      await new Promise((r) => setTimeout(r, 300));

      // Type the new value
      setShowValueCursor(true);
      setPlanValueText("");
      await new Promise((r) => setTimeout(r, 200));

      await new Promise<void>((resolve) => {
        typeText('"premium"', setPlanValueText, 400, resolve);
      });

      setShowValueCursor(false);
      setPlanFilter("premium");

      // Animate counter down
      animateCounter(USER_COUNTS.basic, USER_COUNTS.premium, 800);

      await new Promise((r) => setTimeout(r, 1000));

      // Remove highlight from plan value
      setHighlightPlanValue(false);

      // Phase 2: Animate rule 2 - change purchase filter
      setPhase("animate-rule2");

      // Highlight the purchase value pill
      setHighlightPurchaseValue(true);

      await new Promise((r) => setTimeout(r, 400));

      // Update purchase filter (animate the number)
      const purchaseCounter = { value: 0 };
      animate(purchaseCounter, {
        value: 3,
        duration: 400,
        ease: "outQuart",
        onUpdate: () => setPurchaseFilter(Math.round(purchaseCounter.value)),
      });

      await new Promise((r) => setTimeout(r, 500));

      // Animate counter to final value
      animateCounter(USER_COUNTS.premium, USER_COUNTS.premiumAndPurchases, 800);

      await new Promise((r) => setTimeout(r, 600));

      // Remove highlight from purchase value
      setHighlightPurchaseValue(false);

      // Done - enter hold phase
      setPhase("hold");

      // Hold for a while to show final state
      await new Promise((r) => setTimeout(r, 3000));

      // Reset phase - smoothly animate back to initial state
      setPhase("reset");

      // Highlight the purchase value for reset
      setHighlightPurchaseValue(true);

      // Animate purchase filter back to 0
      const resetPurchaseCounter = { value: 3 };
      animate(resetPurchaseCounter, {
        value: 0,
        duration: 600,
        ease: "inOutQuart",
        onUpdate: () =>
          setPurchaseFilter(Math.round(resetPurchaseCounter.value)),
      });

      await new Promise((r) => setTimeout(r, 400));

      // Animate counter back up (fewer filters = more users)
      animateCounter(USER_COUNTS.premiumAndPurchases, USER_COUNTS.premium, 600);

      await new Promise((r) => setTimeout(r, 700));

      // Remove highlight from purchase, add to plan value
      setHighlightPurchaseValue(false);
      setHighlightPlanValue(true);

      // Reset plan filter text with backspace then typing effect
      setShowValueCursor(true);

      // Delete "premium" character by character
      await new Promise<void>((resolve) => {
        deleteText('"premium"', setPlanValueText, 250, resolve);
      });

      await new Promise((r) => setTimeout(r, 100));

      // Type "basic" character by character
      await new Promise<void>((resolve) => {
        typeText('"basic"', setPlanValueText, 300, resolve);
      });

      setShowValueCursor(false);
      setPlanFilter("basic");

      // Animate counter to basic count
      animateCounter(USER_COUNTS.premium, USER_COUNTS.basic, 800);

      await new Promise((r) => setTimeout(r, 1000));

      // Remove highlight from plan value
      setHighlightPlanValue(false);

      // Small pause before restarting
      await new Promise((r) => setTimeout(r, 1500));

      // Loop the animation
      setPhase("initial");
      runAnimation();
    };

    runAnimation();

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [prefersReducedMotion, typeText, animateCounter]);

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto">
      <div className="list-card bg-white/5 rounded-2xl ring-1 ring-white/10 overflow-hidden">
        {/* List Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Engaged Premium Users</h3>
              <p className="text-xs text-white/40">Dynamic List</p>
            </div>
          </div>
        </div>

        {/* Rule Builder Section */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-white/60">
            Include users matching{" "}
            <span className="text-white font-medium">ALL</span> of the
            following:
          </p>

          {/* Rule 1: User Property */}
          <div
            ref={rule1Ref}
            className="rule-row bg-white/5 rounded-xl p-4 ring-1 ring-white/10 transition-shadow"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm min-h-[32px]">
              <span className="px-3 py-1.5 rounded-lg ring-1 font-medium bg-blue-500/10 text-blue-400 ring-blue-500/20">
                String
              </span>

              <span className="px-3 py-1.5 rounded-lg ring-1 font-medium bg-white/5 text-white ring-white/10 font-mono">
                {planText || "plan"}
                {showPlanCursor && (
                  <span className="inline-block w-0.5 h-4 bg-white/80 ml-0.5 align-middle animate-pulse" />
                )}
              </span>

              <span className="px-3 py-1.5 rounded-lg ring-1 font-medium bg-violet-500/10 text-violet-400 ring-violet-500/20">
                equals
              </span>

              <span
                className={`px-3 py-1.5 rounded-lg ring-1 font-medium bg-green-500/10 text-green-400 ring-green-500/20 font-mono transition-all duration-300 ${
                  highlightPlanValue
                    ? "ring-2 ring-green-400/60 shadow-[0_0_12px_rgba(74,222,128,0.4)]"
                    : ""
                }`}
              >
                {showValueCursor ? planValueText : planValueText || '"basic"'}
                {showValueCursor && (
                  <span className="inline-block w-0.5 h-4 bg-white/80 ml-0.5 align-middle animate-pulse" />
                )}
              </span>
            </div>
          </div>

          {/* Rule 2: Event Condition */}
          <div
            ref={rule2Ref}
            className="rule-row bg-white/5 rounded-xl p-4 ring-1 ring-white/10 transition-shadow"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm min-h-[32px]">
              <span className="text-white/60">Did</span>

              <span className="px-3 py-1.5 rounded-lg ring-1 font-medium bg-amber-500/10 text-amber-400 ring-amber-500/20">
                Purchase
              </span>

              <span className="px-3 py-1.5 rounded-lg ring-1 font-medium bg-violet-500/10 text-violet-400 ring-violet-500/20">
                &gt;=
              </span>

              <span
                className={`px-3 py-1.5 rounded-lg ring-1 font-medium bg-white/5 text-white ring-white/10 tabular-nums min-w-[32px] text-center transition-all duration-300 ${
                  highlightPurchaseValue
                    ? "ring-2 ring-violet-400/60 shadow-[0_0_12px_rgba(167,139,250,0.4)]"
                    : ""
                }`}
              >
                {purchaseFilter}
              </span>

              <span className="text-white/60">times in last</span>

              <span className="px-3 py-1.5 rounded-lg ring-1 font-medium bg-white/5 text-white ring-white/10">
                30
              </span>

              <span className="text-white/60">days</span>
            </div>
          </div>

          {/* Add Rule Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1 cursor-default">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              User condition
            </button>
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1 cursor-default">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              User event
            </button>
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1 cursor-default">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Org condition
            </button>
            <button className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1 cursor-default">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Org event
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Results Section */}
        <div className="p-6">
          {/* Status Row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-white font-medium">Users:</span>
            <span className="text-2xl font-bold text-white tabular-nums">
              {userCount.toLocaleString()}
            </span>
          </div>

          {/* User Table Preview - Always visible */}
          <div className="users-table bg-white/5 rounded-xl overflow-hidden ring-1 ring-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 font-medium px-4 py-3">
                    Name
                  </th>
                  <th className="text-left text-white/60 font-medium px-4 py-3 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left text-white/60 font-medium px-4 py-3">
                    Plan
                  </th>
                  <th className="text-left text-white/60 font-medium px-4 py-3">
                    Purchases
                  </th>
                  <th className="text-left text-white/60 font-medium px-4 py-3 w-20">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DEMO_USERS.map((user, index) => {
                  const isMatching = matchingUsers[index];
                  return (
                    <tr
                      key={user.email}
                      className={`transition-all duration-300 ${
                        isMatching ? "bg-transparent" : "bg-white/[0.02]"
                      }`}
                    >
                      <td
                        className={`px-4 py-3 transition-colors duration-300 ${
                          isMatching ? "text-white" : "text-white/30"
                        }`}
                      >
                        {user.name}
                      </td>
                      <td
                        className={`px-4 py-3 hidden sm:table-cell transition-colors duration-300 ${
                          isMatching ? "text-white/60" : "text-white/20"
                        }`}
                      >
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ring-1 transition-all duration-300 ${
                            user.plan === "premium"
                              ? isMatching
                                ? "bg-violet-500/10 text-violet-400 ring-violet-500/20"
                                : "bg-violet-500/5 text-violet-400/40 ring-violet-500/10"
                              : isMatching
                                ? "bg-white/5 text-white/60 ring-white/10"
                                : "bg-white/[0.02] text-white/20 ring-white/5"
                          }`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 tabular-nums transition-colors duration-300 ${
                          isMatching ? "text-white" : "text-white/30"
                        }`}
                      >
                        {user.purchases}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                            isMatching
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/5 text-white/20"
                          }`}
                        >
                          {isMatching ? (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* More Users Indicator */}
          <p className="text-center text-xs text-white/40 mt-3">
            +{" "}
            {(
              userCount - DEMO_USERS.filter((_, i) => matchingUsers[i]).length
            ).toLocaleString()}{" "}
            more users matching criteria
          </p>
        </div>
      </div>
    </div>
  );
}
