"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Illustration, Comment } from "@/types/illustration";
import IllustrationPreview from "./illustration-panel/IllustrationPreview";
import CommentsList from "./illustration-panel/CommentsList";
import AuthPopup from "./illustration-panel/AuthPopup";
import CommentPopup from "./illustration-panel/CommentPopup";
import { UserRole, can, STATUS_CONFIG, AssetStatus } from "@/lib/permissions";
import { updateIllustrationStatus, updateIllustrationNameTag } from "@/lib/admin";

interface IllustrationSidePanelProps {
  illustration: Illustration | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  role?: UserRole;
  onIllustrationUpdate?: (id: number, fields: Partial<Illustration>) => void;
}

export default function IllustrationSidePanel({ illustration, onClose, onDelete, role = 'USER', onIllustrationUpdate }: IllustrationSidePanelProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"1x" | "2x" | "3x">("1x");
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDarkPreview, setIsDarkPreview] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; team: string } | null>(null);
  const [nameTag, setNameTag] = useState("");
  const [savingTag, setSavingTag] = useState(false);

  const canDelete = can.delete(role);
  const canAssignStatus = can.assignStatusTag(role);
  const canAssignNameTag = can.assignNameTag(role);

  useEffect(() => {
    if (illustration) {
      const storedUser = localStorage.getItem("graphicsLabCommentUser");
      if (storedUser) setUserInfo(JSON.parse(storedUser));

      const storedBookmarks = localStorage.getItem("graphicsLabBookmarks");
      if (storedBookmarks) {
        const bookmarks = JSON.parse(storedBookmarks);
        setIsBookmarked(bookmarks.includes(illustration.id));
      }

      setNameTag(illustration.name_tag ?? "");
      fetchComments();
    }
  }, [illustration]);

  const handleStatusChange = async (status: string) => {
    if (!illustration) return;
    await updateIllustrationStatus(illustration.id, status);
    onIllustrationUpdate?.(illustration.id, { status: status as AssetStatus });
  };

  const handleSaveNameTag = async () => {
    if (!illustration) return;
    setSavingTag(true);
    await updateIllustrationNameTag(illustration.id, nameTag.trim());
    onIllustrationUpdate?.(illustration.id, { name_tag: nameTag.trim() });
    setSavingTag(false);
  };

  const fetchComments = async () => {
    if (!illustration) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('illustration_id', illustration.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else if (data) {
      setComments(data);
    }
  };

  if (!illustration) return null;

  const handleCopyName = () => {
    let displayName = illustration.name;
    if (isDarkPreview && illustration.dark_image_url) {
      if (illustration.name.toLowerCase().includes("_light")) {
        displayName = illustration.name.replace(/_light/i, "_dark");
      } else {
        displayName = illustration.name + "_dark";
      }
    }
    navigator.clipboard.writeText(displayName);
    alert("Name copied to clipboard!");
  };

  const handleCopySVG = () => {
    if (illustration.image.startsWith("data:image/svg+xml")) {
      const svgContent = atob(illustration.image.split(",")[1]);
      navigator.clipboard.writeText(svgContent);
      alert("SVG copied to clipboard!");
    } else {
      alert("This is not an SVG file.");
    }
  };

  const toggleBookmark = () => {
    const storedBookmarks = JSON.parse(localStorage.getItem("graphicsLabBookmarks") || "[]");
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = storedBookmarks.filter((id: number) => id !== illustration.id);
    } else {
      newBookmarks = [...storedBookmarks, illustration.id];
    }
    localStorage.setItem("graphicsLabBookmarks", JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
    window.dispatchEvent(new Event("storage"));
  };

  const downloadPNG = () => {
    const canvas = document.createElement("canvas");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = (isDarkPreview && illustration.dark_image_url) ? illustration.dark_image_url : (illustration.image_url || illustration.image);
    img.onload = () => {
      const scale = parseInt(selectedSize);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.download = `${illustration.name}_${selectedSize}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
        if (!storedDownloads.some((i: any) => i.id === illustration.id)) {
          localStorage.setItem("graphicsLabDownloaded", JSON.stringify([illustration, ...storedDownloads]));
          window.dispatchEvent(new Event("storage"));
        }
      }
    };
  };

  const downloadSVG = () => {
    const isSvg = (illustration.image_url && illustration.image_url.toLowerCase().endsWith('.svg')) ||
                  illustration.image.startsWith("data:image/svg+xml");

    if (isSvg) {
      const link = document.createElement("a");
      link.download = `${illustration.name}${isDarkPreview ? '_dark' : ''}.svg`;
      link.href = (isDarkPreview && illustration.dark_image_url) ? illustration.dark_image_url : (illustration.image_url || illustration.image);
      link.click();

      const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
      if (!storedDownloads.some((i: any) => i.id === illustration.id)) {
        localStorage.setItem("graphicsLabDownloaded", JSON.stringify([illustration, ...storedDownloads]));
        window.dispatchEvent(new Event("storage"));
      }
    } else {
      alert("Original file is not an SVG.");
    }
  };

  const handleAddCommentClick = () => {
    if (!userInfo) {
      setShowAuthPopup(true);
    } else {
      setShowCommentPopup(true);
    }
  };

  const handleAuthSubmit = (data: { name: string; email: string; team: string }) => {
    setUserInfo(data);
    localStorage.setItem("graphicsLabCommentUser", JSON.stringify(data));
    setShowAuthPopup(false);
    setShowCommentPopup(true);
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInfo || !illustration) return;

    if (editingCommentId !== null) {
      const { error } = await supabase
        .from('comments')
        .update({ text: commentText })
        .eq('id', editingCommentId);

      if (error) {
        alert(`Update error: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase
        .from('comments')
        .insert([{
          illustration_id: illustration.id,
          user_name: userInfo.name,
          user_email: userInfo.email,
          user_team: userInfo.team,
          text: commentText,
          timestamp: Date.now()
        }]);

      if (error) {
        alert(`Submit error: ${error.message}`);
        return;
      }
    }

    await fetchComments();
    setCommentText("");
    setEditingCommentId(null);
    setShowCommentPopup(false);
    setSuccessMessage("Comment successfully submitted");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteComment = async (id: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) {
        alert(`Delete error: ${error.message}`);
      } else {
        await fetchComments();
      }
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.text);
    setShowCommentPopup(true);
  };

  const handleDeleteIllustration = () => {
    if (confirm(`Are you sure you want to delete "${illustration.name}" from your library? This action cannot be undone.`)) {
      onDelete(illustration.id);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 3000, backdropFilter: "blur(4px)", transition: "opacity 0.3s ease" }} />

      {/* Side Panel */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "450px", backgroundColor: "var(--background)", zIndex: 3100, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflowY: "auto", animation: "slideIn 0.3s ease-out" }}>
        {/* Header */}
        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => isDarkPreview ? setIsDarkPreview(false) : onClose()}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <button onClick={toggleBookmark} style={{ background: "none", border: "none", cursor: "pointer", color: isBookmarked ? "#7c3aed" : "var(--text-secondary)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <IllustrationPreview illustration={illustration} isDarkPreview={isDarkPreview} onTogglePreview={setIsDarkPreview} />

          {/* Name & Copy */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {(() => {
                if (isDarkPreview && illustration.dark_image_url) {
                  // Replace _light -> _dark in the name
                  if (illustration.name.toLowerCase().includes("_light")) {
                    return illustration.name.replace(/_light/i, "_dark");
                  }
                  // If no _light suffix, append _dark
                  return illustration.name + "_dark";
                }
                return illustration.name;
              })()}
            </h2>
            <button onClick={handleCopyName} title="Copy Name" style={{ background: "var(--input-bg)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>

          {/* Actions grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button onClick={handleCopySVG} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--background)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Copy SVG
            </button>
            <button onClick={downloadSVG} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--background)", color: "var(--text-primary)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Download SVG
            </button>
          </div>

          {/* PNG Download row */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as any)}
                style={{ width: "100%", height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px", outline: "none", appearance: "none" }}
              >
                <option value="1x">1x Size</option>
                <option value="2x">2x Size</option>
                <option value="3x">3x Size</option>
              </select>
              <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-secondary)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <button onClick={downloadPNG} style={{ flex: 1.5, background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", padding: "0 20px" }}>
              Download as PNG
            </button>
          </div>

          {/* Status tag — superadmin only */}
          {canAssignStatus && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status Tag</label>
              <div style={{ position: "relative" }}>
                <select
                  value={illustration.status ?? ""}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ width: "100%", height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "15px", outline: "none", appearance: "none", cursor: "pointer" }}
                >
                  <option value="">— No Status —</option>
                  {(Object.keys(STATUS_CONFIG) as AssetStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-secondary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          )}

          {/* Name tag — creator + superadmin */}
          {canAssignNameTag && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name Tag</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={nameTag}
                  onChange={(e) => setNameTag(e.target.value)}
                  placeholder="e.g. onboarding, error-state"
                  style={{ flex: 1, height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "15px", outline: "none" }}
                />
                <button
                  onClick={handleSaveNameTag}
                  disabled={savingTag}
                  style={{ height: "48px", padding: "0 20px", borderRadius: "12px", background: "#7c3aed", color: "#fff", fontWeight: 700, border: "none", cursor: savingTag ? "not-allowed" : "pointer", opacity: savingTag ? 0.7 : 1, fontSize: "14px", whiteSpace: "nowrap" }}
                >
                  {savingTag ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Delete Action — creator + superadmin */}
          {canDelete && (
            <button
              onClick={handleDeleteIllustration}
              style={{ marginTop: "8px", padding: "12px", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fecaca"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fee2e2"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Delete Illustration
            </button>
          )}

          <CommentsList
            comments={comments}
            successMessage={successMessage}
            onAddComment={handleAddCommentClick}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
          />
        </div>
      </div>

      {showAuthPopup && <AuthPopup onSubmit={handleAuthSubmit} onClose={() => setShowAuthPopup(false)} />}
      {showCommentPopup && (
        <CommentPopup
          commentText={commentText}
          onCommentChange={setCommentText}
          onSubmit={handleCommentSubmit}
          onCancel={() => { setShowCommentPopup(false); setEditingCommentId(null); setCommentText(""); }}
          isEditing={editingCommentId !== null}
        />
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
