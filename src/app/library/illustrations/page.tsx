"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import IllustrationSidePanel from "@/components/IllustrationSidePanel";
import LoadingOverlay from "@/components/LoadingOverlay";
import { supabase } from "@/lib/supabase";

// Interface for Illustration objects
interface Illustration {
  id: number;
  name: string;
  image: string;
  image_url: string; // Light version (Primary)
  dark_image_url?: string; // Optional dark version
}

// Mock data for illustrations to populate the grid
const INITIAL_ILLUSTRATIONS: Illustration[] = [];

export default function IllustrationsLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<"light" | "dark" | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  
  // New Upload Modal States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<"method" | "light" | "ask-dark" | "dark" | "complete">("method");
  const [tempLightUrl, setTempLightUrl] = useState<string | null>(null);
  const [tempDarkUrl, setTempDarkUrl] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  // Load illustrations from Supabase on mount
  useEffect(() => {
    setIsMounted(true);
    fetchIllustrations();
  }, []);

  const fetchIllustrations = async () => {
    const { data, error } = await supabase
      .from('illustrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching illustrations:", error);
    } else if (data) {
      setIllustrations(data);
    }
  };

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("graphicsLabIllustrations", JSON.stringify(illustrations));
      window.dispatchEvent(new Event("storage"));
    }
  }, [illustrations, isMounted]);

  // Sync dark mode class with filterMode
  useEffect(() => {
    if (isMounted) {
      if (filterMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [filterMode, isMounted]);

  const filteredIllustrations = illustrations.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === "all") return matchesSearch;
    
    const matchesMode = filterMode === "light" 
      ? item.name.toLowerCase().includes("light")
      : item.name.toLowerCase().includes("dark");
    return matchesSearch && matchesMode;
  });

  const selectedIllustration = illustrations.find(i => i.id === selectedId) || null;

  // New Upload Handlers
  const handleLightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempName(file.name.split('.').slice(0, -1).join('.') || file.name);
    setIsLoading(true);
    
    const fileName = `light_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('illustrations_storage')
      .upload(fileName, file);

    if (error) {
      alert(`Upload error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('illustrations_storage')
      .getPublicUrl(fileName);

    setTempLightUrl(publicUrl);
    setIsLoading(false);
    setUploadStep("ask-dark");
  };

  const handleDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const fileName = `dark_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('illustrations_storage')
      .upload(fileName, file);

    if (error) {
      alert(`Upload error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('illustrations_storage')
      .getPublicUrl(fileName);

    setTempDarkUrl(publicUrl);
    setIsLoading(false);
    setUploadStep("complete");
  };

  const finalizeUpload = async () => {
    if (!tempLightUrl) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('illustrations')
      .insert([{
        name: tempName,
        image_url: tempLightUrl,
        dark_image_url: tempDarkUrl
      }])
      .select();

    setIsLoading(false);
    if (error) {
      alert(`DB error: ${error.message}`);
    } else if (data) {
      setIllustrations([data[0], ...illustrations]);
      setShowUploadModal(false);
      resetUploadState();
      setSelectedId(data[0].id);
    }
  };

  const resetUploadState = () => {
    setUploadStep("method");
    setTempLightUrl(null);
    setTempDarkUrl(null);
    setTempName("");
    setUploadProgress(0);
  };

  const triggerFileUpload = () => {
    setShowUploadModal(true);
  };

  const handleCardClick = (id: number) => {
    setIsLoading(true);
    // Brief delay to allow the loading animation to be seen
    setTimeout(() => {
      setSelectedId(id);
      setIsLoading(false);
    }, 400);
  };

  const handleDeleteIllustration = async (id: number) => {
    // 1. Get the illustration to find its storage path if needed
    const illustrationToDelete = illustrations.find(i => i.id === id);
    if (!illustrationToDelete) return;

    // 2. Delete from Supabase Database
    const { error } = await supabase
      .from('illustrations')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Error deleting: ${error.message}`);
      return;
    }

    // (Optional) We could also delete from storage here if we extract the filename
    // from the publicUrl, but for simplicity we'll just remove the DB reference.
    
    // 3. Update state
    setIllustrations(illustrations.filter(ill => ill.id !== id));
    
    // 4. Clear associated local data (Bookmarks/Downloads)
    const storedBookmarks = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    localStorage.setItem("graphicsLabBookmarks", JSON.stringify(storedBookmarks.filter((bid: number) => bid !== id)));
    
    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    localStorage.setItem("graphicsLabDownloaded", JSON.stringify(storedDownloads.filter((d: any) => d.id !== id)));
    
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px", position: "relative" }}>
      {isLoading && <LoadingOverlay message="Uploading Illustration..." />}

      {/* Structured Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px",
            width: "100%", maxWidth: "450px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column", gap: "24px", border: "1px solid var(--border-color)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {uploadStep === "method" && "Select Upload Method"}
                {uploadStep === "light" && "Upload Light Version"}
                {uploadStep === "ask-dark" && "Add Dark Version?"}
                {uploadStep === "dark" && "Upload Dark Version"}
                {uploadStep === "complete" && "Ready to Publish"}
              </h3>
              <button onClick={() => { setShowUploadModal(false); resetUploadState(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "24px" }}>&times;</button>
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
              Upload in <b>SVG</b> for the best quality and resolution.
            </p>

            {uploadStep === "method" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button 
                  onClick={() => setUploadStep("light")}
                  style={{ height: "56px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px", cursor: "pointer" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Upload from computer</span>
                </button>
                <button 
                  onClick={() => alert("Zoho Drive integration coming soon!")}
                  style={{ height: "56px", backgroundColor: "var(--input-bg)", border: "1px solid var(--border-color)", borderRadius: "14px", display: "flex", alignItems: "center", padding: "0 20px", gap: "12px", cursor: "pointer" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Upload from Zoho Drive</span>
                </button>
              </div>
            )}

            {uploadStep === "light" && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ height: "160px", border: "2px dashed var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", backgroundColor: "var(--input-bg)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M12 5v14M5 12h14"></path></svg>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Choose Light illustration</span>
              </div>
            )}

            {uploadStep === "ask-dark" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "16px", backgroundColor: "#f0fdf4", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #bbf7d0" }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   <span style={{ color: "#166534", fontSize: "14px", fontWeight: 600 }}>Light version uploaded</span>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setUploadStep("complete")} style={{ flex: 1, height: "48px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "none", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer" }}>No dark version</button>
                  <button onClick={() => setUploadStep("dark")} style={{ flex: 1, height: "48px", borderRadius: "12px", background: "#7c3aed", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}>Add dark version</button>
                </div>
              </div>
            )}

            {uploadStep === "dark" && (
              <div 
                onClick={() => darkFileInputRef.current?.click()}
                style={{ height: "160px", border: "2px dashed var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", backgroundColor: "var(--input-bg)" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Choose Dark illustration</span>
              </div>
            )}

            {uploadStep === "complete" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ textAlign: "center", color: "#16a34a" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ margin: "0 auto 12px" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <p style={{ margin: 0, fontWeight: 700 }}>Great! Versions are ready.</p>
                </div>
                <button 
                  onClick={finalizeUpload}
                  style={{ height: "48px", borderRadius: "12px", background: "#7c3aed", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}
                >
                  Confirm & Publish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Side Panel Integration */}
      <IllustrationSidePanel 
        illustration={selectedIllustration} 
        onClose={() => setSelectedId(null)} 
        onDelete={handleDeleteIllustration}
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleLightUpload} 
        style={{ display: "none" }} 
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={darkFileInputRef} 
        onChange={handleDarkUpload} 
        style={{ display: "none" }} 
      />

      {/* Search Bar Row (Sticky) */}
      <div style={{
        position: "sticky",
        top: "60px", // Just below the navbar
        zIndex: 1000,
        backgroundColor: "var(--background)",
        padding: "24px 0",
        display: "flex",
        alignItems: "center",
        gap: "16px"
      }}>
        {/* Back Link (Left) */}
        <Link 
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-primary)",
            textDecoration: "none",
            transition: "background-color 0.2s ease",
            flexShrink: 0
          }}
          className="back-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </Link>
        
        {/* Search Input Container (Center) */}
        <div style={{
          position: "relative",
          flex: 1,
          height: "48px",
        }}>
          <div style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-secondary)",
            pointerEvents: "none"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Search illustrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              padding: "0 16px 0 48px",
              borderRadius: "24px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          />
        </div>

        {/* Light/Dark/All Toggle Filter (Right of Search) */}
        <button
          onClick={() => {
            if (filterMode === "light") setFilterMode("dark");
            else if (filterMode === "dark") setFilterMode("all");
            else setFilterMode("light");
          }}
          title={
            filterMode === "light" ? "Switch to Dark illustrations" :
            filterMode === "dark" ? "Show All illustrations" :
            "Switch to Light illustrations"
          }
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "1px solid var(--border-color)",
            backgroundColor: 
              filterMode === "light" ? "#fef3c7" : 
              filterMode === "dark" ? "#1e1b4b" : 
              "var(--input-bg)",
            color: 
              filterMode === "light" ? "#d97706" : 
              filterMode === "dark" ? "#818cf8" : 
              "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            flexShrink: 0,
            boxShadow: 
              filterMode === "light" ? "0 4px 12px rgba(217, 119, 6, 0.15)" : 
              filterMode === "dark" ? "0 4px 12px rgba(30, 27, 75, 0.3)" : 
              "none"
          }}
        >
          {filterMode === "light" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : filterMode === "dark" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            /* "All" state - inactive sun icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>

        {/* Upload Button (Right) */}
        <button
          onClick={triggerFileUpload}
          style={{
            display: "flex",
            alignItems: "center",
            height: "48px",
            padding: "0 28px",
            borderRadius: "24px",
            backgroundColor: "#7c3aed",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(124, 58, 237, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.2)";
          }}
        >
          Upload
        </button>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "16px 0 32px", color: "var(--text-primary)" }}>
        Illustrations Library
      </h1>

      {/* Grid Layout for Square Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "24px"
      }}>
        {filteredIllustrations.length > 0 ? (
          filteredIllustrations.map((illustration) => (
            <div 
              key={illustration.id}
              onClick={() => handleCardClick(illustration.id)}
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
              {/* Image Container (Takes up most of the card) */}
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

              {/* Title Section (Fixed at bottom) */}
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
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px 0", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "18px", fontWeight: 500 }}>No illustrations found.</p>
            <p style={{ marginTop: "8px" }}>Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Embedded Styles for hover effects */}
      <style dangerouslySetInnerHTML={{__html: `
        .illustration-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
        }
        .illustration-card:hover .illustration-img {
          transform: scale(1.05);
        }
        
        @media (min-width: 768px) {
          main > div:first-of-type {
            top: 64px; /* Adjust for taller header on larger screens */
          }
        }
      `}} />
    </main>
  );
}
