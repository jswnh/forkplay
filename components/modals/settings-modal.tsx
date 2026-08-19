"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  IconSettings,
  IconMoon,
  IconLock,
  IconUser,
  IconUpload,
  IconLoader2,
  IconCheck,
  IconShieldCheck,
  IconBrandGoogle,
  IconVolume,
  IconCpu,
  IconCloudUpload,
  IconBrush,
} from "@tabler/icons-react";
import Image from "next/image";
import { useUserSession, useUpdateProfile, useChangePassword } from "@/hooks/use-user";
import { useUploadFile } from "@/hooks/use-upload";
import { useToast } from "@/providers/toast-provider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "appearance" | "security" | "profile" | "hardware"
  >("appearance");

  // Profile fields
  const [displayName, setDisplayName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Hardware preferences
  const [spatialAudio, setSpatialAudio] = React.useState(true);
  const [hardwareAccel, setHardwareAccel] = React.useState(true);
  const [cloudSync, setCloudSync] = React.useState(true);

  const { showToast } = useToast();
  const { data: sessionData } = useUserSession();
  const user = sessionData?.user;

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadMutation = useUploadFile();

  React.useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      setBannerUrl(user.bannerUrl || "");
    }
  }, [user, isOpen]);

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, folder: "avatars" },
      {
        onSuccess: (data) => {
          setAvatarUrl(data.url);
          showToast({
            title: "Avatar Uploaded",
            description: "Your new avatar has been set.",
            type: "success",
          });
        },
        onError: (err: any) => {
          showToast({
            title: "Upload Failed",
            description: err.message || "Failed to upload avatar.",
            type: "error",
          });
        },
      },
    );
  };

  // Upload banner
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, folder: "banners" },
      {
        onSuccess: (data) => {
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
            description: err.message || "Failed to upload banner.",
            type: "error",
          });
        },
      },
    );
  };

  // Save profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl,
        bannerUrl,
      },
      {
        onSuccess: () => {
          showToast({
            title: "Settings Saved",
            description: "Profile specifications updated.",
            type: "success",
          });
        },
        onError: (err: any) => {
          showToast({
            title: "Save Failed",
            description: err.message || "Failed to update profile.",
            type: "error",
          });
        },
      },
    );
  };

  // Save password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast({
        title: "Passwords Do Not Match",
        description: "Please verify your new password confirmation.",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      showToast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showToast({
            title: "Security Updated",
            description: "Your operator password has been successfully updated.",
            type: "success",
          });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: any) => {
          showToast({
            title: "Password Change Failed",
            description: err.message || "Incorrect current password.",
            type: "error",
          });
        },
      },
    );
  };

  const isGoogleUser = (user as any)?.isGoogleUser || !(user as any)?.hasPassword;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className="max-w-2xl border-white/15 bg-background/95 p-0 overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 pb-4 bg-card/40">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <IconSettings className="size-5" />
            <span className="text-xs uppercase font-mono tracking-widest">
              System Configuration
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold font-brand text-foreground">
            Platform Settings & Preferences
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Configure appearance theme, security credentials, profile assets, and hardware.
          </DialogDescription>

          {/* Settings Tabs */}
          <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "appearance", label: "Appearance", icon: IconBrush },
              { id: "security", label: "Security & Auth", icon: IconLock },
              { id: "profile", label: "Profile & Assets", icon: IconUser },
              { id: "hardware", label: "Hardware & Audio", icon: IconCpu },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IconComp className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">
                    Interface Theme
                  </Label>
                  <Badge variant="cyber" className="text-[10px]">
                    DARK MODE LOCKED
                  </Badge>
                </div>

                <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4 flex items-center gap-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <div className="size-12 rounded-xl bg-black border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                    <IconMoon className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground font-brand">
                      Pure Cyberpunk Dark (OLED Native)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tuned to deep space obsidian black (#030712) with neon cyan highlights for optimal contrast and eye comfort.
                    </p>
                  </div>
                </div>
              </div>

              {/* Accent & Visual Effects */}
              <div className="rounded-xl border border-white/10 bg-card/40 p-4 space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase text-foreground">
                  Visual Fidelity
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-foreground">
                      Cyberpunk Neon Glow & Shaders
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Enables real-time backdrop blur and emissive glow on buttons
                    </p>
                  </div>
                  <Badge variant="cyber" className="font-mono text-[10px]">
                    ENABLED
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {isGoogleUser ? (
                /* Google Authenticated Account View */
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 space-y-4 text-center">
                  <div className="size-14 rounded-2xl bg-white text-black mx-auto flex items-center justify-center shadow-lg">
                    <IconBrandGoogle className="size-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                      <IconShieldCheck className="size-4" />
                      <span className="font-bold text-sm font-mono uppercase">
                        Google Cloud Identity Connected
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground font-brand">
                      Google OAuth Managed Account
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Your ForkPlay profile is authenticated via Google Single Sign-On ({user?.email}).
                      Password security and credential management are securely handled by Google.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Badge variant="success" className="font-mono text-xs py-1 px-3">
                      <IconCheck className="size-3.5 mr-1" />
                      Google Security Verified
                    </Badge>
                  </div>
                </div>
              ) : (
                /* Email/Password Account Password Change Form */
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-foreground font-brand">
                      Update Access Password
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Ensure your operator credentials use a strong passphrase.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-mono text-muted-foreground">
                      Current Password
                    </Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white/5 border-white/15"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase font-mono text-muted-foreground">
                        New Password
                      </Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="bg-white/5 border-white/15"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase font-mono text-muted-foreground">
                        Confirm New Password
                      </Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        className="bg-white/5 border-white/15"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      changePasswordMutation.isPending ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin mr-2" />
                        Updating Password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & ASSETS */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in duration-200">
              {/* Avatar with File Uploader */}
              <div className="space-y-2">
                <Label className="text-xs uppercase font-mono text-muted-foreground">
                  Avatar Photo
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative size-16 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shrink-0 bg-muted">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center font-bold text-cyan-400">
                        OP
                      </div>
                    )}
                    {uploadMutation.isPending && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <IconLoader2 className="size-5 text-cyan-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 transition-all">
                      <IconUpload className="size-3.5 text-cyan-400" />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Upload any JPG, PNG, or WEBP image.
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner with File Uploader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">
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
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg or paste image URL"
                  className="bg-white/5 border-white/15 text-xs font-mono"
                />
              </div>

              {/* Display Name & Bio */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">
                  Display Name
                </Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Commander Walker"
                  className="bg-white/5 border-white/15"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">
                  Operator Bio
                </Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tactical summary..."
                  className="w-full rounded-md border border-white/15 bg-white/5 p-2 text-xs text-foreground focus-visible:border-cyan-500 focus-visible:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)]"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin mr-2" />
                    Saving Specifications...
                  </>
                ) : (
                  "Save Specifications"
                )}
              </Button>
            </form>
          )}

          {/* TAB 4: HARDWARE & AUDIO */}
          {activeTab === "hardware" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-xl border border-white/10 bg-card/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconVolume className="size-5 text-cyan-400" />
                    <div>
                      <div className="font-bold text-xs text-foreground font-mono">
                        Dolby Atmos Spatial Audio Simulation
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Positional 3D audio telemetry
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={spatialAudio ? "default" : "outline"}
                    onClick={() => setSpatialAudio(!spatialAudio)}
                    className="text-xs font-mono h-7"
                  >
                    {spatialAudio ? "ENABLED" : "DISABLED"}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3">
                    <IconCpu className="size-5 text-purple-400" />
                    <div>
                      <div className="font-bold text-xs text-foreground font-mono">
                        Hardware Vulkan RT Acceleration
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Direct GPU pipeline cache allocation
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={hardwareAccel ? "default" : "outline"}
                    onClick={() => setHardwareAccel(!hardwareAccel)}
                    className="text-xs font-mono h-7"
                  >
                    {hardwareAccel ? "ENABLED" : "DISABLED"}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3">
                    <IconCloudUpload className="size-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs text-foreground font-mono">
                        Cloud Save Auto-Sync
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Seamlessly backup and sync game saves across devices
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={cloudSync ? "default" : "outline"}
                    onClick={() => setCloudSync(!cloudSync)}
                    className="text-xs font-mono h-7"
                  >
                    {cloudSync ? "ENABLED" : "DISABLED"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
