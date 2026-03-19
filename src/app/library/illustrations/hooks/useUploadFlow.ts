"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useUploadFlow(onSuccess: (data: any) => void) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<"method" | "light" | "ask-dark" | "dark" | "complete">("method");
  const [tempLightUrl, setTempLightUrl] = useState<string | null>(null);
  const [tempDarkUrl, setTempDarkUrl] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [nameTag, setNameTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  const handleLightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempName(file.name.split('.').slice(0, -1).join('.') || file.name);
    setIsUploading(true);

    const fileName = `light_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('illustrations_storage')
      .upload(fileName, file);

    if (error) {
      alert(`Upload error: ${error.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('illustrations_storage')
      .getPublicUrl(fileName);

    setTempLightUrl(publicUrl);
    setIsUploading(false);
    setUploadStep("ask-dark");
  };

  const handleDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `dark_${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('illustrations_storage')
      .upload(fileName, file);

    if (error) {
      alert(`Upload error: ${error.message}`);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('illustrations_storage')
      .getPublicUrl(fileName);

    setTempDarkUrl(publicUrl);
    setIsUploading(false);
    setUploadStep("complete");
  };

  const finalizeUpload = async () => {
    if (!tempLightUrl) return;

    setIsUploading(true);
    const insertData: { name: string; image_url: string; dark_image_url?: string; name_tag?: string } = {
      name: tempName,
      image_url: tempLightUrl,
    };
    if (tempDarkUrl) insertData.dark_image_url = tempDarkUrl;
    if (nameTag) insertData.name_tag = nameTag;

    const { data, error } = await supabase
      .from('illustrations')
      .insert([insertData])
      .select();

    setIsUploading(false);
    if (error) {
      alert(`DB error: ${error.message}`);
    } else if (data) {
      onSuccess(data[0]);
      closeModal();
    }
  };

  const resetUploadState = () => {
    setUploadStep("method");
    setTempLightUrl(null);
    setTempDarkUrl(null);
    setTempName("");
    setNameTag("");
  };

  const openModal = () => setShowUploadModal(true);

  const closeModal = () => {
    setShowUploadModal(false);
    resetUploadState();
  };

  return {
    showUploadModal,
    uploadStep,
    setUploadStep,
    isUploading,
    fileInputRef,
    darkFileInputRef,
    handleLightUpload,
    handleDarkUpload,
    finalizeUpload,
    openModal,
    closeModal,
    nameTag,
    setNameTag,
  };
}
