"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import WelcomeBanner from "./components/WelcomeBanner";
import DashboardCard from "./components/DashboardCard";
import { useSession } from "@/hooks/useSession";

function DashboardContent() {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const displayName = session.isLoaded ? session.name : "";
  const greetingPrefix = displayName ? `Hi ${displayName}! Welcome to ` : `Hi! Welcome to `;

  const handleNavigation = (href: string) => {
    setIsLoading(true);
    setTimeout(() => { router.push(href); }, 500);
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      {isLoading && <LoadingOverlay message="Opening Library..." />}

      <WelcomeBanner greetingPrefix={greetingPrefix} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <DashboardCard
          title="Illustrations"
          backgroundImage="/ill_graphic_card_design.png"
          imageStyle={{ objectFit: "contain", objectPosition: "center", zIndex: 0, paddingBottom: "40px", transform: "scale(1.1)" }}
          onClick={() => handleNavigation("/library/illustrations")}
        />
        <DashboardCard
          title="Icons"
          backgroundImage="/ill_icons_card_design.png"
          imageStyle={{ objectFit: "contain", objectPosition: "center", zIndex: 0, padding: "20px", transform: "scale(1.15)" }}
        />
        <DashboardCard title="Branding" backgroundGradient="radial-gradient(circle at center, #7c3aed 10%, transparent 80%)" />
        <DashboardCard title="Brand Guidelines" backgroundGradient="radial-gradient(circle at center, #ec4899 10%, transparent 80%)" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-card:hover { transform: translateY(-8px); }
        .dashboard-card:nth-child(1):hover { box-shadow: 0 30px 60px -15px rgba(251,194,235,0.6) !important; }
        .dashboard-card:nth-child(2):hover { box-shadow: 0 30px 60px -15px rgba(224,195,252,0.6) !important; }
        .dashboard-card:nth-child(3):hover { box-shadow: 0 30px 60px -15px rgba(167,139,250,0.6) !important; }
        .dashboard-card:nth-child(4):hover { box-shadow: 0 30px 60px -15px rgba(244,114,182,0.6) !important; }
      `}} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <main style={{ flex: 1, display: "flex", width: "100%" }}>
      <Suspense fallback={<div style={{ padding: "40px" }}>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
