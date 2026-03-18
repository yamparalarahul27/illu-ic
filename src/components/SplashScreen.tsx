"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [logoVisible, setLogoVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    const logoIn = setTimeout(() => setLogoVisible(true), 100);

    const done = setTimeout(() => {
      // Returning admin → go straight to dashboard
      const adminSession = localStorage.getItem('graphicsLabAdminSession');
      const userMode = localStorage.getItem('graphicsLabUserMode');
      if (adminSession || userMode) {
        router.push('/dashboard');
      }
      setIsRendered(false);
    }, 2200);

    return () => { clearTimeout(logoIn); clearTimeout(done); };
  }, [router]);

  if (!isRendered) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#ffffff",
      transition: "opacity 0.5s ease",
    }}>
      <div style={{
        transition: "all 1s ease-out",
        opacity: logoVisible ? 1 : 0,
        transform: logoVisible ? "scale(1)" : "scale(1.08)",
        filter: logoVisible ? "none" : "blur(4px)",
      }}>
        <Image
          src="/logo-dark.png"
          alt="Graphics Lab"
          width={300}
          height={150}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
}
