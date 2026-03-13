"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [logoVisible, setLogoVisible] = useState(false);
  const [screenVisible, setScreenVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // 1. Fade in the logo shortly after mount
    const logoInTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 100);

    // 2. Wait 3 seconds, then fade out the entire screen
    const screenOutTimer = setTimeout(() => {
      setScreenVisible(false);
    }, 3000);

    // 3. Remove from DOM after fade-out transition completes (3000ms + 1000ms transition)
    const removeTimer = setTimeout(() => {
      setIsRendered(false);
    }, 4000);

    return () => {
      clearTimeout(logoInTimer);
      clearTimeout(screenOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#ffffff] transition-opacity duration-1000 ease-in-out ${
        screenVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`transition-all duration-1000 ease-out ${
          logoVisible ? "scale-100 opacity-100" : "scale-110 opacity-0 blur-sm"
        }`}
      >
        <Image
          src="/logo-dark.png"
          alt="Crpko Graphics Logo"
          width={400}
          height={200}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
