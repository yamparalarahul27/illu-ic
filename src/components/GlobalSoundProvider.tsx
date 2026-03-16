"use client";

import { useEffect } from "react";
import { useSound } from "@/hooks/use-sound";
import { clickSoftSound } from "@/sounds/click-soft";

export function GlobalSoundProvider({ children }: { children: React.ReactNode }) {
  const [play] = useSound(clickSoftSound);

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Find the closest button, anchor, or custom interactive element
      const interactive = target.closest("button") || target.closest("a");
      
      if (interactive) {
        play();
      }
    };

    // Use capture phase to catch clicks before they might be stopped by other handlers
    window.addEventListener("click", handleGlobalClick, true);
    return () => window.removeEventListener("click", handleGlobalClick, true);
  }, [play]);

  return <>{children}</>;
}
