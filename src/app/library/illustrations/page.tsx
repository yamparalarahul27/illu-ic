"use client";

import { useState, useEffect } from "react";
import IllustrationSidePanel from "@/components/IllustrationSidePanel";
import LoadingOverlay from "@/components/LoadingOverlay";
import { supabase } from "@/lib/supabase";
import { Illustration } from "@/types/illustration";
import { useUploadFlow } from "./hooks/useUploadFlow";
import UploadModal from "./components/UploadModal";
import IllustrationCard from "./components/IllustrationCard";
import SearchControlBar from "./components/SearchControlBar";

export default function IllustrationsLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [filterMode, setFilterMode] = useState<"light" | "dark" | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const upload = useUploadFlow((newIllustration) => {
    setIllustrations([newIllustration, ...illustrations]);
    setSelectedId(newIllustration.id);
  });

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


  const handleCardClick = (id: number) => {
    if (isSelectionMode) {
      // Toggle selection
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setSelectedId(id);
      setIsLoading(false);
    }, 400);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} illustration${count > 1 ? 's' : ''}? This cannot be undone.`)) return;

    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('illustrations').delete().in('id', ids);
    if (error) {
      alert(`Error deleting: ${error.message}`);
      return;
    }

    // Clean up localStorage
    const storedBookmarks = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    localStorage.setItem("graphicsLabBookmarks", JSON.stringify(storedBookmarks.filter((bid: number) => !ids.includes(bid))));
    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    localStorage.setItem("graphicsLabDownloaded", JSON.stringify(storedDownloads.filter((d: any) => !ids.includes(d.id))));

    setIllustrations(prev => prev.filter(ill => !ids.includes(ill.id)));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    window.dispatchEvent(new Event("storage"));
  };

  const handleDeleteIllustration = async (id: number) => {
    const illustrationToDelete = illustrations.find(i => i.id === id);
    if (!illustrationToDelete) return;

    const { error } = await supabase
      .from('illustrations')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Error deleting: ${error.message}`);
      return;
    }

    setIllustrations(illustrations.filter(ill => ill.id !== id));

    const storedBookmarks = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    localStorage.setItem("graphicsLabBookmarks", JSON.stringify(storedBookmarks.filter((bid: number) => bid !== id)));

    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    localStorage.setItem("graphicsLabDownloaded", JSON.stringify(storedDownloads.filter((d: any) => d.id !== id)));

    window.dispatchEvent(new Event("storage"));
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px", position: "relative" }}>
      {(isLoading || upload.isUploading) && <LoadingOverlay message="Uploading Illustration..." />}

      {upload.showUploadModal && (
        <UploadModal
          uploadStep={upload.uploadStep}
          setUploadStep={upload.setUploadStep}
          fileInputRef={upload.fileInputRef}
          darkFileInputRef={upload.darkFileInputRef}
          onClose={upload.closeModal}
          onFinalize={upload.finalizeUpload}
        />
      )}

      <IllustrationSidePanel
        illustration={selectedIllustration}
        onClose={() => setSelectedId(null)}
        onDelete={handleDeleteIllustration}
      />
      <input type="file" accept="image/*" ref={upload.fileInputRef} onChange={upload.handleLightUpload} style={{ display: "none" }} />
      <input type="file" accept="image/*" ref={upload.darkFileInputRef} onChange={upload.handleDarkUpload} style={{ display: "none" }} />

      <SearchControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        onUploadClick={upload.openModal}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
        selectedIdsCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
      />

      <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "16px 0 32px", color: "var(--text-primary)" }}>
        Illustrations Library
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "24px"
      }}>
        {filteredIllustrations.length > 0 ? (
          filteredIllustrations.map((illustration) => (
            <IllustrationCard
              key={illustration.id}
              illustration={illustration}
              onClick={handleCardClick}
              isSelected={selectedIds.has(illustration.id)}
              isSelectionMode={isSelectionMode}
            />
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px 0", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "18px", fontWeight: 500 }}>No illustrations found.</p>
            <p style={{ marginTop: "8px" }}>Try adjusting your search query.</p>
          </div>
        )}
      </div>

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
            top: 64px;
          }
        }
      `}} />
    </main>
  );
}
