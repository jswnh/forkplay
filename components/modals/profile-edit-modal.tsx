"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconLoader2,
  IconDeviceFloppy,
  IconUpload,
  IconLink,
} from "@tabler/icons-react";
import Image from "next/image";
import { useUpdateProfile } from "@/hooks/use-user";
import { useUploadFile } from "@/hooks/use-upload";
import { useToast } from "@/providers/toast-provider";

interface ProfileEditModalProps {
  user: {
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
];

export function ProfileEditModal({
  user,
  isOpen,
  onClose,
}: ProfileEditModalProps) {
  const [displayName, setDisplayName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");

  const { showToast } = useToast();
  const updateProfileMutation = useUpdateProfile();
  const uploadMutation = useUploadFile();

  React.useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || AVATAR_PRESETS[0]);
      setBannerUrl(user.bannerUrl || "");
    }
  }, [user, isOpen]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, folder: "avatars" },
      {
        onSuccess: (data: any) => {
          setAvatarUrl(data.url);
          showToast({
            title: "Avatar Uploaded",
            description: "Your new avatar image has been set.",
            type: "success",
          });
        },
        onError: (err: any) => {
          showToast({
            title: "Upload Failed",
            description: err.message || "Failed to upload image.",
            type: "error",
          });
        },
      },
    );
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, folder: "banners" },
      {
        onSuccess: (data: any) => {
          setBannerUrl(data.url);
          showToast({
            title: "Banner Uploaded",
            description: "Custom banner image has been updated.",
            type: "success",
          });
        },
        onError: (err: any) => {
          showToast({
            title: "Upload Failed",
            description: err.message || "Failed to upload image.",
            type: "error",
          });
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl,
        bannerUrl: bannerUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({
            title: "Profile Updated",
            description: "Your operator dossier has been saved.",
            type: "success",
          });
          onClose();
        },
        onError: (err: any) => {
          showToast({
            title: "Update Failed",
            description: err.message || "Failed to save profile.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className="max-w-lg border-white/15 bg-background/95 p-6 backdrop-blur-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-brand text-foreground">
            Edit Operator Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Customize your gamer identity, bio, avatar presets, or upload a custom image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Avatar Preview & Upload & Presets */}
          <div className="space-y-2">
            <Label className="text-xs uppercase font-mono text-muted-foreground">
              Avatar Photo
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative size-14 rounded-full overflow-hidden border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0 bg-muted">
                <Image
                  src={avatarUrl || AVATAR_PRESETS[0]}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
                {uploadMutation.isPending && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <IconLoader2 className="size-4 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap flex-1">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`relative size-8 rounded-full overflow-hidden border-2 transition-all ${
                      avatarUrl === preset
                        ? "border-cyan-400 scale-110 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                        : "border-white/15 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-400 transition-all">
                  <IconUpload className="size-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="displayName"
              className="text-xs uppercase font-mono text-muted-foreground"
            >
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Commander Walker"
              className="bg-white/5 border-white/15"
              maxLength={35}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="bio"
              className="text-xs uppercase font-mono text-muted-foreground"
            >
              Operator Bio / Status
            </Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tactical strategist & leaderboard contender..."
              className="w-full rounded-md border border-white/15 bg-white/5 p-2.5 text-sm text-foreground focus-visible:border-cyan-500 focus-visible:outline-none"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="bannerUrl"
                className="text-xs uppercase font-mono text-muted-foreground"
              >
                Custom Banner Image (Upload or URL)
              </Label>
              <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline">
                <IconUpload className="size-3" />
                <span>Upload Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>
            </div>
            <Input
              id="bannerUrl"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg or paste image URL"
              className="bg-white/5 border-white/15 text-xs font-mono"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/15 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
