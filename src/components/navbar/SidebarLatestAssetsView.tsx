"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SidebarLatestAssetsViewProps {
  isDarkMode: boolean;
  onBack: () => void;
}

type TimeFilter = "7d" | "1m" | "3m" | "6m";

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
];

function getStartDate(filter: TimeFilter): string {
  const d = new Date();
  if (filter === "7d") d.setDate(d.getDate() - 7);
  else if (filter === "1m") d.setMonth(d.getMonth() - 1);
  else if (filter === "3m") d.setMonth(d.getMonth() - 3);
  else d.setMonth(d.getMonth() - 6);
  return d.toISOString();
}

type AssetItem = {
  id: number;
  name: string;
  image_url?: string;
  image?: string;
  dark_image_url?: string;
  created_at?: string;
  type: "illustration" | "icon";
};

export default function SidebarLatestAssetsView({ isDarkMode, onBack }: SidebarLatestAssetsViewProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [timeFilter]);

  const fetchAssets = async () => {
    setLoading(true);
    const since = getStartDate(timeFilter);
    const [illRes, iconRes] = await Promise.all([
      supabase.from("illustrations").select("id, name, image_url, image, dark_image_url, created_at").gte("created_at", since).order("created_at", { ascending: false }),
      supabase.from("icons").select("id, name, image_url, image, dark_image_url, created_at").gte("created_at", since).order("created_at", { ascending: false }),
    ]);
    const ills: AssetItem[] = (illRes.data || []).map((i: any) => ({ ...i, type: "illustration" }));
    const icons: AssetItem[] = (iconRes.data || []).map((i: any) => ({ ...i, type: "icon" }));
    const combined = [...ills, ...icons].sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
    setAssets(combined);
    setLoading(false);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center", padding: "4px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", flex: 1, textAlign: "center", paddingRight: "24px" }}>
          Latest Assets
        </h3>
      </div>

      {/* Time filter pills */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
        {TIME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setTimeFilter(opt.value)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: "20px", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 600,
              backgroundColor: timeFilter === opt.value ? "#7c3aed" : "var(--input-bg)",
              color: timeFilter === opt.value ? "#fff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>Loading...</div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
            No assets added in this period.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {assets.map(item => {
              const src = (isDarkMode && item.dark_image_url) ? item.dark_image_url : (item.image_url || item.image);
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  style={{
                    aspectRatio: "1/1",
                    backgroundColor: isDarkMode ? "#1e1b4b" : "var(--input-bg)",
                    borderRadius: "8px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {src && <img src={src} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
