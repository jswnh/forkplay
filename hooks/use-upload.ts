"use client";

import { useMutation } from "@tanstack/react-query";

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      file,
      folder = "avatars",
    }: {
      file: File;
      folder?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload file to Cloudflare R2");
      }

      return data as { success: boolean; url: string; key: string; size: number };
    },
  });
}
