"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/types/icon";

export function useIconEditFlow(onSuccess: (id: number, fields: Partial<Icon>) => void) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIcon, setEditingIcon] = useState<Icon | null>(null);
  const [uploadStep, setUploadStep] = useState<"light" | "ask-dark" | "dark" | "complete">("light");
  const [tempLightUrl, setTempLightUrl] = useState<string | null>(null);
  const [tempDarkUrl, setTempDarkUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  const openEditModal = (icon: Icon) => {
    setEditingIcon(icon);
    setUploadStep("light");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingIcon(null);
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
    const expectedBase = getBaseName(editingIcon?.name ?? "");
    if (uploadedBase.toLowerCase() !== expectedBase.toLowerCase()) {
      setUploadError(`File name "${file.name.replace(/\.[^.]+$/, "")}" doesn't match. Expected "${editingIcon?.name}".`);
      e.target.value = "";
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    const fileName = `light_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("icons_storage").upload(fileName, file);
    if (error) { alert(`Upload error: ${error.message}`); setIsUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("icons_storage").getPublicUrl(fileName);
    setTempLightUrl(publicUrl);
    setIsUploading(false);
    setUploadStep("ask-dark");
  };

  const handleDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedBase = getBaseName(file.name);
    const expectedBase = getBaseName(editingIcon?.name ?? "");
    if (uploadedBase.toLowerCase() !== expectedBase.toLowerCase()) {
      setUploadError(`File name "${file.name.replace(/\.[^.]+$/, "")}" doesn't match. Expected "${editingIcon?.name.replace(/_light$/i, "_dark")}".`);
      e.target.value = "";
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    const fileName = `dark_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("icons_storage").upload(fileName, file);
    if (error) { alert(`Upload error: ${error.message}`); setIsUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("icons_storage").getPublicUrl(fileName);
    setTempDarkUrl(publicUrl);
    setIsUploading(false);
    setUploadStep("complete");
  };

  const finalizeEdit = async () => {
    if (!editingIcon || !tempLightUrl) return;
    setIsUploading(true);

    const { error: versionError } = await supabase.from("icon_versions").insert([{
      icon_id: editingIcon.id,
      image_url: editingIcon.image_url,
      dark_image_url: editingIcon.dark_image_url ?? null,
    }]);
    if (versionError) {
      setIsUploading(false);
      alert(`Could not save version history. Make sure you've run:\n\nCREATE TABLE icon_versions (\n  id SERIAL PRIMARY KEY,\n  icon_id INTEGER REFERENCES icons(id) ON DELETE CASCADE,\n  image_url TEXT NOT NULL,\n  dark_image_url TEXT,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nError: ${versionError.message}`);
      return;
    }

    const updatePayload: Partial<Icon> = { image_url: tempLightUrl };
    if (tempDarkUrl) updatePayload.dark_image_url = tempDarkUrl;

    const { error } = await supabase.from("icons").update(updatePayload).eq("id", editingIcon.id);
    setIsUploading(false);

    if (error) {
      alert(`Update error: ${error.message}`);
    } else {
      onSuccess(editingIcon.id, updatePayload);
      closeEditModal();
    }
  };

  return {
    showEditModal,
    editingIcon,
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
