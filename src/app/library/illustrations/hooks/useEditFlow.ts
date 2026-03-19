"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Illustration } from "@/types/illustration";

export function useEditFlow(onSuccess: (id: number, fields: Partial<Illustration>) => void) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIllustration, setEditingIllustration] = useState<Illustration | null>(null);
  const [uploadStep, setUploadStep] = useState<"light" | "ask-dark" | "dark" | "complete">("light");
  const [tempLightUrl, setTempLightUrl] = useState<string | null>(null);
  const [tempDarkUrl, setTempDarkUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  const openEditModal = (illustration: Illustration) => {
    setEditingIllustration(illustration);
    setUploadStep("light");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingIllustration(null);
    setTempLightUrl(null);
    setTempDarkUrl(null);
    setUploadStep("light");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (darkFileInputRef.current) darkFileInputRef.current.value = "";
  };

  const getBaseName = (raw: string) => raw.replace(/\.[^.]+$/, "").replace(/_dark$/i, "").replace(/_light$/i, "");

  const handleLightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedBase = getBaseName(file.name);
    const expectedBase = getBaseName(editingIllustration?.name ?? "");
    if (uploadedBase.toLowerCase() !== expectedBase.toLowerCase()) {
      setUploadError(`File name "${file.name.replace(/\.[^.]+$/, "")}" doesn't match. Expected "${editingIllustration?.name}".`);
      e.target.value = "";
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    const fileName = `light_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("illustrations_storage").upload(fileName, file);
    if (error) { alert(`Upload error: ${error.message}`); setIsUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("illustrations_storage").getPublicUrl(fileName);
    setTempLightUrl(publicUrl);
    setIsUploading(false);
    setUploadStep("ask-dark");
  };

  const handleDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedBase = getBaseName(file.name);
    const expectedBase = getBaseName(editingIllustration?.name ?? "");
    if (uploadedBase.toLowerCase() !== expectedBase.toLowerCase()) {
      setUploadError(`File name "${file.name.replace(/\.[^.]+$/, "")}" doesn't match. Expected "${editingIllustration?.name.replace(/_light$/i, "_dark")}".`);
      e.target.value = "";
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    const fileName = `dark_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("illustrations_storage").upload(fileName, file);
    if (error) { alert(`Upload error: ${error.message}`); setIsUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("illustrations_storage").getPublicUrl(fileName);
    setTempDarkUrl(publicUrl);
    setIsUploading(false);
    setUploadStep("complete");
  };

  const finalizeEdit = async () => {
    if (!editingIllustration || !tempLightUrl) return;
    setIsUploading(true);

    // Archive current version
    const { error: versionError } = await supabase.from("illustration_versions").insert([{
      illustration_id: editingIllustration.id,
      image_url: editingIllustration.image_url,
      dark_image_url: editingIllustration.dark_image_url ?? null,
    }]);
    if (versionError) {
      setIsUploading(false);
      alert(`Could not save version history. Make sure you've run:\n\nCREATE TABLE illustration_versions (\n  id SERIAL PRIMARY KEY,\n  illustration_id INTEGER REFERENCES illustrations(id) ON DELETE CASCADE,\n  image_url TEXT NOT NULL,\n  dark_image_url TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nError: ${versionError.message}`);
      return;
    }

    // Update illustration with new URLs (dark only updated if re-uploaded)
    const updatePayload: Partial<Illustration> = { image_url: tempLightUrl };
    if (tempDarkUrl) updatePayload.dark_image_url = tempDarkUrl;

    const { error } = await supabase.from("illustrations").update(updatePayload).eq("id", editingIllustration.id);
    setIsUploading(false);

    if (error) {
      alert(`Update error: ${error.message}`);
    } else {
      onSuccess(editingIllustration.id, updatePayload);
      closeEditModal();
    }
  };

  return {
    showEditModal,
    editingIllustration,
    uploadStep,
    setUploadStep,
    isUploading,
    fileInputRef,
    darkFileInputRef,
    handleLightUpload,
    handleDarkUpload,
    finalizeEdit,
    openEditModal,
    closeEditModal,
    uploadError,
  };
}
