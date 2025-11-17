"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  trigger: boolean;
  continuous?: boolean;
  memberId?: string;
}

export function ConfettiEffect({
  trigger,
  continuous = false,
  memberId,
}: ConfettiEffectProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const runConfetti = () => {
      confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() < 0.5 ? -0.1 : 1.1,
        },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181"],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(runConfetti);
      }
    };

    runConfetti();

    if (continuous) {
      intervalRef.current = setInterval(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4"],
        });
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trigger, continuous, memberId]);

  return null;
}
