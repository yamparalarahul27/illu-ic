"use client";

import { useState, useEffect } from "react";
import IconSidePanel from "./components/IconSidePanel";
import LoadingOverlay from "@/components/LoadingOverlay";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/types/icon";
import { Illustration } from "@/types/illustration";
import { useIconUploadFlow } from "./hooks/useIconUploadFlow";
import { useIconEditFlow } from "./hooks/useIconEditFlow";
import IconUploadModal from "./components/IconUploadModal";
import EditAssetModal from "@/app/library/illustrations/components/EditAssetModal";
import IconCard from "./components/IconCard";
import SearchControlBar, { CardSize } from "@/app/library/illustrations/components/SearchControlBar";
import FilterSidebar, { SortBy, ViewFilters } from "@/app/library/illustrations/components/FilterSidebar";
import { useSession } from "@/hooks/useSession";
import { can, NAME_TAGS } from "@/lib/permissions";

const DEFAULT_VIEW_FILTERS: ViewFilters = {
  confirmed: false, inProgress: false, underReview: false,
};

export default function IconsLibrary() {
  const session = useSession();
  const role = session.role;
  const [searchQuery, setSearchQuery] = useState("");
  const [icons, setIcons] = useState<Icon[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});

  const [isDarkView, setIsDarkView] = useState(false);

  useEffect(() => {
    setIsDarkView(localStorage.getItem("graphicsLabTheme") === "dark");
    const handler = (e: Event) => setIsDarkView((e as CustomEvent).detail?.dark ?? false);
    window.addEventListener("graphicsLabThemeChange", handler);
    return () => window.removeEventListener("graphicsLabThemeChange", handler);
  }, []);

  const [cardSize, setCardSize] = useState<CardSize>("normal");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [viewFilters, setViewFilters] = useState<ViewFilters>(DEFAULT_VIEW_FILTERS);

  const isFilterActive = sortBy !== "newest" || Object.values(viewFilters).some(Boolean);

  const [customTags, setCustomTags] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("graphicsLabCustomIconTags") || "[]"); } catch { return []; }
  });

  const handleNewTag = (tag: string) => {
    setCustomTags(prev => {
      if (prev.includes(tag)) return prev;
      const next = [...prev, tag];
      localStorage.setItem("graphicsLabCustomIconTags", JSON.stringify(next));
      return next;
    });
  };

  const availableTags = [...new Set([...NAME_TAGS, ...customTags, ...icons.map(i => i.name_tag).filter((t): t is string => !!t)])];

  const upload = useIconUploadFlow((newIcon) => {
    setIcons([newIcon, ...icons]);
    setSelectedId(newIcon.id);
  });

  const edit = useIconEditFlow((id, fields) => {
    setIcons(prev => prev.map(ic => ic.id === id ? { ...ic, ...fields } : ic));
  });

  useEffect(() => {
    setIsMounted(true);
    fetchIcons();
    fetchCommentCounts();
  }, []);

  const fetchIcons = async () => {
    const { data, error } = await supabase
      .from('icons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching icons:", error);
    } else if (data) {
      setIcons(data);
    }
  };

  const fetchCommentCounts = async () => {
    const { data, error } = await supabase.from('icon_comments').select('icon_id');
    if (!error && data) {
      const counts: Record<number, number> = {};
      (data as { icon_id: number }[]).forEach((row) => {
        counts[row.icon_id] = (counts[row.icon_id] || 0) + 1;
      });
      setCommentCounts(counts);
    }
  };

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("graphicsLabIcons", JSON.stringify(icons));
      window.dispatchEvent(new Event("storage"));
    }
  }, [icons, isMounted]);

  const handleApplyFilter = (newSortBy: SortBy, newViewFilters: ViewFilters) => {
    setSortBy(newSortBy);
    setViewFilters(newViewFilters);
  };

  const filteredIcons = (() => {
    let result = icons.filter((item) => {
      const name = item.name.toLowerCase();
      const nameTag = (item.name_tag || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      if (!name.includes(query) && !nameTag.includes(query)) return false;

      const anyViewActive = Object.values(viewFilters).some(Boolean);
      if (!anyViewActive) return true;

      if (viewFilters.confirmed && item.status === "CONFIRMED") return true;
      if (viewFilters.inProgress && item.status === "IN_PROGRESS") return true;
      if (viewFilters.underReview && item.status === "UNDER_REVIEW") return true;

      return false;
    });

    if (sortBy === "newest") {
      result = [...result].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  })();

  const selectedIcon = icons.find(i => i.id === selectedId) || null;

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
    if (!confirm(`Delete ${count} icon${count > 1 ? 's' : ''}? This cannot be undone.`)) return;

    const ids = Array.from(selectedIds);
    const { error } = await supabase.from('icons').delete().in('id', ids);
    if (error) { alert(`Error deleting: ${error.message}`); return; }

    const storedBookmarks = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    localStorage.setItem("graphicsLabBookmarks", JSON.stringify(storedBookmarks.filter((bid: number) => !ids.includes(bid))));
    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    localStorage.setItem("graphicsLabDownloaded", JSON.stringify(storedDownloads.filter((d: any) => !ids.includes(d.id))));

    setIcons(prev => prev.filter(ic => !ids.includes(ic.id)));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    window.dispatchEvent(new Event("storage"));
  };

  const handleDeleteIcon = async (id: number) => {
    const { error } = await supabase.from('icons').delete().eq('id', id);
    if (error) { alert(`Error deleting: ${error.message}`); return; }

    setIcons(icons.filter(ic => ic.id !== id));
    const storedBookmarks = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    localStorage.setItem("graphicsLabBookmarks", JSON.stringify(storedBookmarks.filter((bid: number) => bid !== id)));
    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    localStorage.setItem("graphicsLabDownloaded", JSON.stringify(storedDownloads.filter((d: any) => d.id !== id)));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px", position: "relative" }}>
      {(isLoading || upload.isUploading) && <LoadingOverlay />}

      {upload.showUploadModal && (
        <IconUploadModal
          uploadStep={upload.uploadStep}
          setUploadStep={upload.setUploadStep}
          fileInputRef={upload.fileInputRef}
          darkFileInputRef={upload.darkFileInputRef}
          onClose={upload.closeModal}
          onFinalize={upload.finalizeUpload}
          onChooseVariants={upload.chooseVariants}
          onChooseNeutral={upload.chooseNeutral}
          canAssignTag={can.assignNameTag(role)}
          nameTag={upload.nameTag}
          onNameTagChange={upload.setNameTag}
          availableTags={availableTags}
          onNewTag={handleNewTag}
        />
      )}

      {selectedIcon && (
        <IconSidePanel
          icon={selectedIcon}
          onClose={() => setSelectedId(null)}
          onDelete={handleDeleteIcon}
          role={role}
          isDarkView={isDarkView}
          availableTags={availableTags}
          onNewTag={handleNewTag}
          onIconUpdate={(id, fields) => {
            setIcons(prev => prev.map(ic => ic.id === id ? { ...ic, ...fields } : ic));
          }}
        />
      )}

      <FilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        appliedSortBy={sortBy}
        appliedViewFilters={viewFilters}
        onApply={handleApplyFilter}
      />

      <input type="file" accept="image/*" ref={upload.fileInputRef} onChange={upload.isNeutral ? upload.handleSingleUpload : upload.handleLightUpload} style={{ display: "none" }} />
      <input type="file" accept="image/*" ref={upload.darkFileInputRef} onChange={upload.handleDarkUpload} style={{ display: "none" }} />
      <input type="file" accept="image/*" ref={edit.fileInputRef} onChange={edit.handleLightUpload} style={{ display: "none" }} />
      <input type="file" accept="image/*" ref={edit.darkFileInputRef} onChange={edit.handleDarkUpload} style={{ display: "none" }} />

      {edit.showEditModal && edit.editingIcon && (
        <EditAssetModal
          illustration={edit.editingIcon as unknown as Illustration}
          uploadStep={edit.uploadStep}
          setUploadStep={edit.setUploadStep}
          fileInputRef={edit.fileInputRef}
          darkFileInputRef={edit.darkFileInputRef}
          isUploading={edit.isUploading}
          isDarkView={isDarkView}
          uploadError={edit.uploadError}
          onClose={edit.closeEditModal}
          onFinalize={edit.finalizeEdit}
        />
      )}

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
        cardSize={cardSize}
        onCardSizeChange={setCardSize}
        searchPlaceholder="Search icons..."
      />

      <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "16px 0 32px", color: "var(--text-primary)" }}>
        Icons Library
      </h1>

      {(() => {
        const sections = availableTags
          .map(tag => ({ tag, items: filteredIcons.filter(i => i.name_tag === tag) }))
          .filter(s => s.items.length > 0);
        const untagged = filteredIcons.filter(i => !i.name_tag);
        const hasAny = sections.length > 0 || untagged.length > 0;

        if (!hasAny) return (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-secondary)" }}>
            <p style={{ fontSize: "18px", fontWeight: 500 }}>No icons yet.</p>
            <p style={{ marginTop: "8px" }}>Upload your first icon to get started.</p>
          </div>
        );

        const colWidth = cardSize === "small" ? "160px" : cardSize === "large" ? "340px" : "240px";
        const renderGrid = (items: typeof filteredIcons) => (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${colWidth}, 1fr))`, gap: "24px" }}>
            {items.map(icon => (
              <IconCard
                key={icon.id}
                icon={icon}
                onClick={handleCardClick}
                isSelected={selectedIds.has(icon.id)}
                isSelectionMode={isSelectionMode}
                commentCount={commentCounts[icon.id] || 0}
                isDarkView={isDarkView}
                onEditClick={can.upload(role) ? edit.openEditModal : undefined}
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
