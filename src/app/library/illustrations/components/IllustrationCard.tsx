"use client";

import Image from "next/image";
import { Illustration } from "@/types/illustration";

interface IllustrationCardProps {
  illustration: Illustration;
  onClick: (id: number) => void;
}

export default function IllustrationCard({ illustration, onClick }: IllustrationCardProps) {
  return (
    <div
      onClick={() => onClick(illustration.id)}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "16px",
        backgroundColor: "var(--card-bg)",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column"
      }}
      className="illustration-card"
    >
      <div style={{
        position: "relative",
        flex: 1,
        backgroundColor: "var(--input-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <Image
          src={illustration.image_url || illustration.image}
          alt={illustration.name}
          fill
          style={{ objectFit: "contain", padding: "24px", transition: "transform 0.3s ease" }}
          className="illustration-img"
        />
      </div>

      <div style={{
        padding: "16px",
        backgroundColor: "var(--card-bg)",
        borderTop: "1px solid var(--border-color)"
      }}>
        <h3 style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {illustration.name}
        </h3>
      </div>
    </div>
  );
}
