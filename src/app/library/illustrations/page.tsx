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
import FilterSidebar, { SortBy, ViewFilters } from "./components/FilterSidebar";
import { useSession } from "@/hooks/useSession";
import { can, NAME_TAGS } from "@/lib/permissions";

const DEFAULT_VIEW_FILTERS: ViewFilters = {
  confirmed: false, inProgress: false, updated: false,
  underReview: false, darkOnly: false, lightOnly: false,
};

export default function IllustrationsLibrary() {
  const session = useSession();
  const role = session.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});

  // Light / Dark view — synced with global Navbar theme toggle
  const [isDarkView, setIsDarkView] = useState(false);

  useEffect(() => {
    setIsDarkView(localStorage.getItem("graphicsLabTheme") === "dark");
    const handler = (e: Event) => setIsDarkView((e as CustomEvent).detail?.dark ?? false);
    window.addEventListener("graphicsLabThemeChange", handler);
    return () => window.removeEventListener("graphicsLabThemeChange", handler);
  }, []);

  // Filter sidebar
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [viewFilters, setViewFilters] = useState<ViewFilters>(DEFAULT_VIEW_FILTERS);

  const isFilterActive = sortBy !== "newest" || Object.values(viewFilters).some(Boolean);

  // Custom tags persisted in localStorage so new labels are never forgotten
  const [customTags, setCustomTags] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("graphicsLabCustomTags") || "[]"); } catch { return []; }
  });

  const handleNewTag = (tag: string) => {
    setCustomTags(prev => {
      if (prev.includes(tag)) return prev;
      const next = [...prev, tag];
      localStorage.setItem("graphicsLabCustomTags", JSON.stringify(next));
      return next;
    });
  };

  // Merge predefined + persisted custom + any tags already on illustrations
  const availableTags = [...new Set([...NAME_TAGS, ...customTags, ...illustrations.map(i => i.name_tag).filter((t): t is string => !!t)])];

  const upload = useUploadFlow((newIllustration) => {
    setIllustrations([newIllustration, ...illustrations]);
    setSelectedId(newIllustration.id);
  });

  useEffect(() => {
    setIsMounted(true);
    fetchIllustrations();
    fetchCommentCounts();
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

  const fetchCommentCounts = async () => {
    const { data, error } = await supabase.from('comments').select('illustration_id');
    if (!error && data) {
      const counts: Record<number, number> = {};
      (data as { illustration_id: number }[]).forEach((row) => {
        counts[row.illustration_id] = (counts[row.illustration_id] || 0) + 1;
      });
      setCommentCounts(counts);
    }
  };

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("graphicsLabIllustrations", JSON.stringify(illustrations));
      window.dispatchEvent(new Event("storage"));
    }
  }, [illustrations, isMounted]);

  const handleApplyFilter = (newSortBy: SortBy, newViewFilters: ViewFilters) => {
    setSortBy(newSortBy);
    setViewFilters(newViewFilters);
  };

  const filteredIllustrations = (() => {
    let result = illustrations.filter((item) => {
      const name = item.name.toLowerCase();
      if (!name.includes(searchQuery.toLowerCase())) return false;

      const anyViewActive = Object.values(viewFilters).some(Boolean);
      if (!anyViewActive) return true;

      if (viewFilters.darkOnly && name.includes("dark")) return true;
      if (viewFilters.lightOnly && name.includes("light")) return true;
      if (viewFilters.confirmed && name.includes("confirmed")) return true;
      if (viewFilters.inProgress && (name.includes("progress") || name.includes("in_progress"))) return true;
      if (viewFilters.updated && name.includes("updated")) return true;
      if (viewFilters.underReview && (name.includes("review") || name.includes("under_review"))) return true;

      return false;
    });

    // Sort
    if (sortBy === "oldest") {
      result = [...result].reverse();
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }
    // "newest" is already the default order from the DB query

    return result;
  })();

  const selectedIllustration = illustrations.find(i => i.id === selectedId) || null;

  const handleCardClick = (id: number) => {
    if (isSelectionMode) {
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
    if (error) { alert(`Error deleting: ${error.message}`); return; }

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
    const { error } = await supabase.from('illustrations').delete().eq('id', id);
    if (error) { alert(`Error deleting: ${error.message}`); return; }

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
          canAssignTag={can.assignNameTag(role)}
          nameTag={upload.nameTag}
          onNameTagChange={upload.setNameTag}
          availableTags={availableTags}
          onNewTag={handleNewTag}
        />
      )}

      <IllustrationSidePanel
        illustration={selectedIllustration}
        onClose={() => setSelectedId(null)}
        onDelete={handleDeleteIllustration}
        role={role}
        isDarkView={isDarkView}
        availableTags={availableTags}
        onNewTag={handleNewTag}
        onIllustrationUpdate={(id, fields) => {
          setIllustrations(prev => prev.map(ill => ill.id === id ? { ...ill, ...fields } : ill));
        }}
      />

      <FilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        appliedSortBy={sortBy}
        appliedViewFilters={viewFilters}
        onApply={handleApplyFilter}
      />

      <input type="file" accept="image/*" ref={upload.fileInputRef} onChange={upload.handleLightUpload} style={{ display: "none" }} />
      <input type="file" accept="image/*" ref={upload.darkFileInputRef} onChange={upload.handleDarkUpload} style={{ display: "none" }} />

      <SearchControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSidebarOpen(true)}
        isFilterActive={isFilterActive}
        onUploadClick={upload.openModal}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
        selectedIdsCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        role={role}
      />

      <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "16px 0 32px", color: "var(--text-primary)" }}>
        Illustrations Library
      </h1>

      {(() => {
        const sections = availableTags
          .map(tag => ({ tag, items: filteredIllustrations.filter(i => i.name_tag === tag) }))
          .filter(s => s.items.length > 0);
        const untagged = filteredIllustrations.filter(i => !i.name_tag);
        const hasAny = sections.length > 0 || untagged.length > 0;

        if (!hasAny) return (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "18px", fontWeight: 500 }}>No illustrations found.</p>
            <p style={{ marginTop: "8px" }}>Try adjusting your filters or search query.</p>
          </div>
        );

        const renderGrid = (items: typeof filteredIllustrations) => (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
            {items.map(illustration => (
              <IllustrationCard
                key={illustration.id}
                illustration={illustration}
                onClick={handleCardClick}
                isSelected={selectedIds.has(illustration.id)}
                isSelectionMode={isSelectionMode}
                commentCount={commentCounts[illustration.id] || 0}
                isDarkView={isDarkView}
              />
            ))}
          </div>
        );

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {sections.map(({ tag, items }) => (
              <div key={tag}>
                <div style={{ display: "inline-block", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#6d28d9", margin: 0, letterSpacing: "-0.3px", padding: "10px 20px", backgroundColor: "#ede9fe", border: "1.5px solid #c4b5fd", borderRadius: "14px", display: "inline-block" }}>
                    {tag}
                  </h2>
                </div>
                {renderGrid(items)}
              </div>
            ))}
            {untagged.length > 0 && (
              <div>
                <div style={{ display: "inline-block", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#6d28d9", margin: 0, letterSpacing: "-0.3px", padding: "10px 20px", backgroundColor: "#ede9fe", border: "1.5px solid #c4b5fd", borderRadius: "14px", display: "inline-block" }}>
                    Uncategorised
                  </h2>
                </div>
                {renderGrid(untagged)}
              </div>
            )}
          </div>
        );
      })()}

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
