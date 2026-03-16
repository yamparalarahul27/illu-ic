"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Illustration {
  id: number;
  name: string;
  image: string;
  image_url?: string;
}

interface Comment {
  id: number;
  illustration_id: number;
  user_name: string;
  user_email: string;
  user_team: string;
  text: string;
  timestamp: number;
}

interface IllustrationSidePanelProps {
  illustration: Illustration | null;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export default function IllustrationSidePanel({ illustration, onClose, onDelete }: IllustrationSidePanelProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<"1x" | "2x" | "3x">("1x");
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [userInfo, setUserInfo] = useState<{ name: string; email: string; team: string } | null>(null);

  // Load user info and bookmarks/comments
  useEffect(() => {
    if (illustration) {
      // User Info (Keep local)
      const storedUser = localStorage.getItem("graphicsLabCommentUser");
      if (storedUser) setUserInfo(JSON.parse(storedUser));

      // Bookmarks (Keep local)
      const storedBookmarks = localStorage.getItem("graphicsLabBookmarks");
      if (storedBookmarks) {
        const bookmarks = JSON.parse(storedBookmarks);
        setIsBookmarked(bookmarks.includes(illustration.id));
      }

      // Fetch Comments from Supabase
      fetchComments();
    }
  }, [illustration]);

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
    navigator.clipboard.writeText(illustration.name);
    // Simple alert or toast could go here
    alert("Name copied to clipboard!");
  };

  const handleCopySVG = () => {
    // For a base64 image, we can't easily "get SVG" unless it was uploaded as one.
    // If it's a data:image/svg+xml;base64,... we can decode it.
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
    // Trigger storage event for Navbar sync
    window.dispatchEvent(new Event("storage"));
  };

  const downloadPNG = () => {
    const canvas = document.createElement("canvas");
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = illustration.image_url || illustration.image;
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
        
        // Record download in localStorage (Local history)
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
      link.download = `${illustration.name}.svg`;
      link.href = illustration.image_url || illustration.image;
      link.click();

      // Record download in localStorage (Local history)
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

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInfo = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      team: formData.get("team") as string,
    };
    setUserInfo(newInfo);
    localStorage.setItem("graphicsLabCommentUser", JSON.stringify(newInfo));
    setShowAuthPopup(false);
    setShowCommentPopup(true);
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInfo || !illustration) return;

    if (editingCommentId !== null) {
      // Update in Supabase
      const { error } = await supabase
        .from('comments')
        .update({ text: commentText })
        .eq('id', editingCommentId);

      if (error) {
        alert(`Update error: ${error.message}`);
        return;
      }
    } else {
      // Insert into Supabase
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

    // Refresh comments from DB
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
      <div 
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 3000,
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease"
        }}
      />

      {/* Side Panel */}
      <div style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: "450px",
        backgroundColor: "var(--background)",
        zIndex: 3100,
        boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        animation: "slideIn 0.3s ease-out"
      }}>
        {/* Header */}
        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: 0 }}>
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
          {/* Preview */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", backgroundColor: "var(--card-bg)", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
            <img src={illustration.image_url || illustration.image} alt={illustration.name} style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
          </div>

          {/* Name & Copy */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{illustration.name}</h2>
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

          {/* Delete Action */}
          <button 
            onClick={handleDeleteIllustration}
            style={{ 
              marginTop: "8px",
              padding: "12px", 
              borderRadius: "12px", 
              border: "1px solid #fee2e2", 
              background: "#fef2f2", 
              color: "#ef4444", 
              fontWeight: 600, 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.borderColor = "#fecaca";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.borderColor = "#fee2e2";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Delete Illustration
          </button>

          {/* Comments Section */}
          <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Comments ({comments.length})</h3>
              <button 
                onClick={handleAddCommentClick}
                style={{ background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "20px", padding: "8px 16px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
              >
                Add Comment
              </button>
            </div>

            {successMessage && <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{successMessage}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{comment.user_name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{comment.user_team} • {new Date(comment.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleEditComment(comment)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", lineHeight: "1.5" }}>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Popup */}
      {showAuthPopup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div style={{ backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>Verify Identity</h3>
            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input name="name" placeholder="Full Name" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
              <input name="email" type="email" placeholder="Email Address" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
              <input name="team" placeholder="Team Name" required style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px" }} />
              <button type="submit" style={{ height: "48px", background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}>Continue</button>
            </form>
          </div>
        </div>
      )}

      {/* Comment Popup */}
      {showCommentPopup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div style={{ backgroundColor: "var(--background)", padding: "32px", borderRadius: "24px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>{editingCommentId ? "Edit Comment" : "Add Comment"}</h3>
            <form onSubmit={handleCommentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What's on your mind?"
                required
                style={{ height: "150px", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px", resize: "none" }}
              />
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => { setShowCommentPopup(false); setEditingCommentId(null); setCommentText(""); }} style={{ flex: 1, height: "48px", background: "none", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: "12px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, height: "48px", background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}>{editingCommentId ? "Save Changes" : "Submit Comment"}</button>
              </div>
            </form>
          </div>
        </div>
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
