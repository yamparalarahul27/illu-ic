"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Illustration, Comment } from "@/types/illustration";
import IllustrationPreview from "./illustration-panel/IllustrationPreview";
import CommentsList from "./illustration-panel/CommentsList";
import AuthPopup from "./illustration-panel/AuthPopup";
import CommentPopup from "./illustration-panel/CommentPopup";
import { UserRole, can, STATUS_CONFIG, AssetStatus } from "@/lib/permissions";
import TagSelector from "@/components/TagSelector";
import { updateIllustrationStatus, updateIllustrationNameTag } from "@/lib/admin";
import { formatIllustrationName } from "@/lib/formatName";

interface IllustrationSidePanelProps {
  illustration: Illustration | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  role?: UserRole;
  onIllustrationUpdate?: (id: number, fields: Partial<Illustration>) => void;
  isDarkView?: boolean;
  availableTags?: string[];
  onNewTag?: (tag: string) => void;
}

export default function IllustrationSidePanel({ illustration, onClose, role = 'USER', onIllustrationUpdate, isDarkView = false, availableTags = [], onNewTag }: IllustrationSidePanelProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"1x" | "2x" | "3x">("1x");
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<number, Comment[]>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [pendingReplyParentId, setPendingReplyParentId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDarkPreview, setIsDarkPreview] = useState(isDarkView);
  const [nameCopied, setNameCopied] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; team: string } | null>(null);
  const [nameTag, setNameTag] = useState("");
  const [savingTag, setSavingTag] = useState(false);
  const [resolveToast, setResolveToast] = useState(false);
  const [versions, setVersions] = useState<{ id: number; image_url: string; dark_image_url: string | null; created_at: string }[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<{ image_url: string; dark_image_url: string | null; created_at: string } | null>(null);

  const canAssignStatus = can.assignStatusTag(role);
  const canAssignNameTag = can.assignNameTag(role);
  const canResolve = can.resolveComment(role);

  useEffect(() => { setIsDarkPreview(isDarkView); }, [isDarkView]);

  useEffect(() => {
    if (illustration) {
      if (role !== 'USER') {
        // Admin — use their session directly, no identity popup needed
        const adminRaw = localStorage.getItem("graphicsLabAdminSession");
        if (adminRaw) {
          const { name, email } = JSON.parse(adminRaw);
          setUserInfo({ name: name ?? email, email, team: role });
        }
      } else {
        const storedUser = localStorage.getItem("graphicsLabCommentUser");
        if (storedUser) setUserInfo(JSON.parse(storedUser));
      }

      const storedBookmarks = localStorage.getItem("graphicsLabBookmarks");
      if (storedBookmarks) {
        const bookmarks = JSON.parse(storedBookmarks);
        setIsBookmarked(bookmarks.includes(illustration.id));
      }

      setNameTag(illustration.name_tag ?? "");
      fetchComments();
      fetchVersions(illustration.id);
      setShowVersionHistory(false);
      setPreviewVersion(null);
    }
  }, [illustration]);

  const fetchVersions = async (id: number) => {
    const { data } = await supabase
      .from("illustration_versions")
      .select("id, image_url, dark_image_url, created_at")
      .eq("illustration_id", id)
      .order("created_at", { ascending: false });
    setVersions(data ?? []);
  };

  const handleStatusChange = async (status: string) => {
    if (!illustration) return;
    await updateIllustrationStatus(illustration.id, status);
    onIllustrationUpdate?.(illustration.id, { status: status as AssetStatus });
  };


  const fetchComments = async () => {
    if (!illustration) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('illustration_id', illustration.id)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else if (data) {
      const topLevel = data.filter((c: Comment) => !c.parent_id);
      const nested: Record<number, Comment[]> = {};
      data.filter((c: Comment) => c.parent_id).forEach((c: Comment) => {
        if (!nested[c.parent_id!]) nested[c.parent_id!] = [];
        nested[c.parent_id!].push(c);
      });
      setComments(topLevel);
      setReplies(nested);
    }
  };

  const handleReply = async (parentId: number, text: string) => {
    if (!userInfo || !illustration) return;
    const { error } = await supabase.from('comments').insert([{
      illustration_id: illustration.id,
      user_name: userInfo.name,
      user_email: userInfo.email,
      user_team: userInfo.team,
      text,
      timestamp: Date.now(),
      parent_id: parentId,
    }]);
    if (error) { alert(`Reply error: ${error.message}`); return; }
    await fetchComments();
  };

  const handleReplyAuthNeeded = (parentId: number) => {
    setPendingReplyParentId(parentId);
    setShowAuthPopup(true);
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
    navigator.clipboard.writeText(displayName).then(() => {
      setNameCopied(true);
      setTimeout(() => setNameCopied(false), 2000);
    });
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

  const getDownloadName = () => {
    if (isDarkPreview && illustration.dark_image_url) {
      return illustration.name.replace(/_light$/i, "_dark");
    }
    return illustration.name;
  };

  const downloadPNG = () => {
    const src = (isDarkPreview && illustration.dark_image_url) ? illustration.dark_image_url : (illustration.image_url || illustration.image);
    const canvas = document.createElement("canvas");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const scale = parseInt(selectedSize);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.download = `${getDownloadName()}_${selectedSize}.png`;
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

  const downloadSVG = async () => {
    const src = (isDarkPreview && illustration.dark_image_url) ? illustration.dark_image_url : (illustration.image_url || illustration.image);
    const filename = `${getDownloadName()}.svg`;
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.download = filename;
      link.href = src;
      link.click();
    }
    const storedDownloads = JSON.parse(localStorage.getItem("graphicsLabDownloaded") || "[]");
    if (!storedDownloads.some((i: any) => i.id === illustration.id)) {
      localStorage.setItem("graphicsLabDownloaded", JSON.stringify([illustration, ...storedDownloads]));
      window.dispatchEvent(new Event("storage"));
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
    if (pendingReplyParentId !== null) {
      setPendingReplyParentId(null);
      // Reply form will now open since userInfo is set — trigger via replyingToId in CommentsList
      // We just need to re-open the reply inline; CommentsList handles it from userInfo being set
    } else {
      setShowCommentPopup(true);
    }
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

  const handleResolveComment = async (id: number, resolved: boolean) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved } : c));

    const { error } = await supabase.from('comments').update({ resolved }).eq('id', id);
    if (error) {
      setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !resolved } : c));
      alert(`Could not update comment. Make sure you've run:\n\nalter table comments add column if not exists resolved boolean default false;\n\nError: ${error.message}`);
      return;
    }

    if (resolved) {
      setResolveToast(true);
      setTimeout(() => setResolveToast(false), 3000);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.text);
    setShowCommentPopup(true);
  };


  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 3000, backdropFilter: "blur(4px)", transition: "opacity 0.3s ease" }} />

      {/* Resolve toast */}
      {resolveToast && (
        <div style={{ position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 4500, display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#16a34a", color: "#fff", padding: "12px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, boxShadow: "0 8px 24px rgba(22,163,74,0.35)", animation: "fadeInUp 0.25s ease-out" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Comment resolved
        </div>
      )}

      {/* Side Panel */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "450px", backgroundColor: "var(--background)", zIndex: 3100, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflowY: "auto", animation: "slideIn 0.3s ease-out" }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {formatIllustrationName(illustration.name, isDarkPreview)}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <IllustrationPreview illustration={illustration} isDarkPreview={isDarkPreview} onTogglePreview={setIsDarkPreview} />

          {/* Dev name badge + copy */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              onClick={handleCopyName}
              title="Copy developer name"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#ede9fe", borderRadius: "10px", padding: "8px 12px", cursor: "pointer" }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#6d28d9", fontFamily: "monospace", letterSpacing: "0.01em" }}>
                {(() => {
                  if (isDarkPreview && illustration.dark_image_url) {
                    if (illustration.name.toLowerCase().includes("_light")) {
                      return illustration.name.replace(/_light/i, "_dark");
                    }
                    return illustration.name + "_dark";
                  }
                  return illustration.name;
                })()}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
            {nameCopied && (
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#16a34a" }}>Copied</span>
            )}
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

          {/* Name tag — all admins */}
          {canAssignNameTag && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Label</label>
              <TagSelector
                value={nameTag}
                onChange={async (next) => {
                  setNameTag(next);
                  setSavingTag(true);
                  await updateIllustrationNameTag(illustration.id, next);
                  onIllustrationUpdate?.(illustration.id, { name_tag: next });
                  setSavingTag(false);
                }}
                availableTags={availableTags}
                onNewTag={onNewTag}
                disabled={savingTag}
              />
            </div>
          )}


          {/* Version History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => setShowVersionHistory(v => !v)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Version History {versions.length > 0 && `(${versions.length})`}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showVersionHistory ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {showVersionHistory && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {versions.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", padding: "12px", backgroundColor: "var(--input-bg)", borderRadius: "10px", textAlign: "center" }}>
                    No previous versions yet. Edit the asset to create one.
                  </p>
                ) : (
                  versions.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setPreviewVersion(previewVersion?.created_at === v.created_at ? null : v)}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: previewVersion?.created_at === v.created_at ? "#ede9fe" : "var(--input-bg)", cursor: "pointer", transition: "background 0.15s" }}
                    >
                      <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                        <img src={v.image_url} alt="version" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {new Date(v.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          {v.dark_image_url ? " · Light + Dark" : " · Light only"}
                        </p>
                      </div>
                      <a href={v.image_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title="Open in new tab" style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    </div>
                  ))
                )}

                {/* Inline preview of selected version */}
                {previewVersion && (
                  <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #c4b5fd", backgroundColor: "#f5f3ff" }}>
                    <img src={previewVersion.image_url} alt="version preview" style={{ width: "100%", objectFit: "contain", maxHeight: "200px", padding: "16px" }} />
                    {previewVersion.dark_image_url && (
                      <img src={previewVersion.dark_image_url} alt="dark version preview" style={{ width: "100%", objectFit: "contain", maxHeight: "200px", padding: "16px", backgroundColor: "#1f2937" }} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <CommentsList
            comments={comments}
            replies={replies}
            successMessage={successMessage}
            userInfo={userInfo}
            onAddComment={handleAddCommentClick}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onReply={handleReply}
            onReplyAuthNeeded={handleReplyAuthNeeded}
            canResolve={canResolve}
            onResolve={handleResolveComment}
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
