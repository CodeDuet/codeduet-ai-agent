import { useCallback } from "react";
import confetti from "canvas-confetti";
import { useSettings } from "./useSettings";

export function useConfetti() {
  const { settings } = useSettings();

  const celebrate = useCallback(() => {
    // Check if confetti is enabled (defaults to true if setting is not present)
    if (settings?.enableConfetti === false) {
      return;
    }

    // First burst from left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6, x: 0.25 },
      colors: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"],
    });

    // Second burst from right
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.75 },
        colors: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"],
      });
    }, 150);

    // Third burst from center
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6, x: 0.5 },
        colors: ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"],
      });
    }, 300);
  }, [settings?.enableConfetti]);

  const celebrateSuccess = useCallback(() => {
    // Check if confetti is enabled (defaults to true if setting is not present)
    if (settings?.enableConfetti === false) {
      return;
    }

    // Focused celebration for setup completion
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.7 },
      colors: ["#10B981", "#22C55E", "#16A34A", "#15803D", "#166534"],
      shapes: ["star", "circle"],
      scalar: 1.2,
    });
  }, [settings?.enableConfetti]);

  return {
    celebrate,
    celebrateSuccess,
  };
}
