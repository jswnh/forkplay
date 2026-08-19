"use client";

import * as React from "react";
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
  IconDeviceFloppy,
  IconWorld,
  IconBrush,
} from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUserSession, useUpdateProfile, useChangePassword, useSetUsername } from "@/hooks/use-user";
import { useUploadFile } from "@/hooks/use-upload";
import { useToast } from "@/providers/toast-provider";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
];

export function SettingsView() {
  const [activeTab, setActiveTab] = React.useState<
    "appearance" | "security" | "profile" | "hardware"
  >("appearance");

  // Profile fields
  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [bannerUrl, setBannerUrl] = React.useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Visual & Hardware preferences
  const [neonGlow, setNeonGlow] = React.useState(true);
  const [scanlines, setScanlines] = React.useState(false);
  const [spatialAudio, setSpatialAudio] = React.useState(true);
  const [hardwareAccel, setHardwareAccel] = React.useState(true);
  const [cloudSync, setCloudSync] = React.useState(true);
  const [serverRegion, setServerRegion] = React.useState("as-east");

  const { showToast } = useToast();
  const { data: sessionData } = useUserSession();
  const user = sessionData?.user;

  const updateProfileMutation = useUpdateProfile();
  const setUsernameMutation = useSetUsername();
  const changePasswordMutation = useChangePassword();
  const uploadMutation = useUploadFile();

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || AVATAR_PRESETS[0]);
      setBannerUrl(user.bannerUrl || "");
    }
  }, [user]);

  // Upload avatar
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(
      { file, folder: "avatars" },
      {
        onSuccess: (data) => {
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
            description: err.message || "Failed to upload avatar.",
            type: "error",
          });
        },
      },
    );
  };

  // Upload banner
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        bannerUrl: bannerUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({
            title: "Profile Settings Saved",
            description: "Your operator dossier has been updated.",
            type: "success",
          });
        },
        onError: (err: any) => {
          showToast({
            title: "Save Failed",
            description: err.message || "Failed to save profile.",
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
            title: "Security Credentials Updated",
            description: "Your password has been successfully updated.",
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
    <div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
          <IconSettings className="size-4" />
          <span>SYSTEM ARCHITECTURE // OPERATOR CONFIG</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-foreground">
          Platform Settings & Preferences
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure visual shaders, operator security credentials, cloud save assets, and hardware acceleration.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "appearance", label: "Appearance & Shaders", icon: IconBrush },
          { id: "security", label: "Security & Passwords", icon: IconLock },
          { id: "profile", label: "Profile & Assets", icon: IconUser },
          { id: "hardware", label: "Hardware & Telemetry", icon: IconCpu },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconComp className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE & SHADERS */}
      {activeTab === "appearance" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dark Mode Locked Banner */}
          <div className="rounded-2xl border border-cyan-500/30 bg-card/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-black border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                  <IconMoon className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground font-brand">
                      Dark Cyber Mode (OLED Native)
                    </h3>
                    <Badge variant="cyber" className="text-[10px]">
                      LOCKED ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ForkPlay is permanently tuned to ultra-high contrast dark mode with neon cyan highlights.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-xs font-mono space-y-1">
                <div className="font-bold text-cyan-300">Pure Dark Matrix</div>
                <div className="text-muted-foreground text-[11px]">
                  #030712 True OLED black levels
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-xs font-mono space-y-1">
                <div className="font-bold text-foreground">Neon Emissive Glow</div>
                <div className="text-muted-foreground text-[11px]">
                  Cyan #06B6D4 & Emerald #10B981
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/5 text-xs font-mono space-y-1">
                <div className="font-bold text-foreground">Glassmorphic Blur</div>
                <div className="text-muted-foreground text-[11px]">
                  Backdrop blur 24px with border sheen
                </div>
              </div>
            </div>
          </div>

          {/* Shader Customizers */}
          <div className="rounded-2xl border border-white/10 bg-card/60 p-6 space-y-4">
            <h3 className="font-bold text-sm font-brand text-foreground uppercase tracking-wider font-mono">
              Shader & Visual FX Controls
            </h3>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <span className="font-semibold text-xs text-foreground">
                  Cyberpunk Emissive Neon Shaders
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Renders luminous cyan and purple glowing borders on active cards
                </p>
              </div>
              <Button
                size="sm"
                variant={neonGlow ? "default" : "outline"}
                onClick={() => setNeonGlow(!neonGlow)}
                className="text-xs font-mono h-7 px-3"
              >
                {neonGlow ? "ENABLED" : "DISABLED"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-xs text-foreground">
                  Retro CRT Scanline Overlay FX
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Adds subtle horizontal phosphor CRT scanlines across dashboard surfaces
                </p>
              </div>
              <Button
                size="sm"
                variant={scanlines ? "default" : "outline"}
                onClick={() => setScanlines(!scanlines)}
                className="text-xs font-mono h-7 px-3"
              >
                {scanlines ? "ACTIVE" : "OFF"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORDS */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {isGoogleUser ? (
            /* Google OAuth Account View */
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8 space-y-5 text-center">
              <div className="size-16 rounded-2xl bg-white text-black mx-auto flex items-center justify-center shadow-2xl">
                <IconBrandGoogle className="size-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                  <IconShieldCheck className="size-5" />
                  <span className="font-bold text-sm font-mono uppercase">
                    Google Cloud Identity Connected
                  </span>
                </div>
                <h3 className="font-bold text-xl text-foreground font-brand">
                  Google Single Sign-On Account
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your operator profile is connected via Google OAuth (<strong>{user?.email}</strong>).
                  Passwords, 2-Factor Authentication, and recovery are managed directly by Google Security, so no local password update is required.
                </p>
              </div>
              <div className="pt-2">
                <Badge variant="success" className="font-mono text-xs py-1 px-4">
                  <IconCheck className="size-3.5 mr-1.5" />
                  Google OAuth Active & Protected
                </Badge>
              </div>
            </div>
          ) : (
            /* Email/Password Account Password Change Form */
            <div className="rounded-2xl border border-white/10 bg-card/60 p-6 max-w-xl space-y-5">
              <div>
                <h3 className="font-bold text-base text-foreground font-brand">
                  Update Operator Access Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ensure your account credentials use a strong passphrase with minimum 6 characters.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
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
                      placeholder="Re-type new password"
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
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)] h-9 px-4"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin mr-2" />
                      Updating Password...
                    </>
                  ) : (
                    "Save New Password"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE & CLOUD ASSETS */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-white/10 bg-card/60 p-6 space-y-6 max-w-2xl animate-in fade-in duration-200">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar with File Uploader & Presets */}
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
                      <IconLoader2 className="size-4 text-cyan-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 transition-all">
                    <IconUpload className="size-3.5" />
                    <span>Upload Custom Avatar</span>
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
                Operator Bio / Status
              </Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tactical commander & leaderboard strategist..."
                className="w-full rounded-md border border-white/15 bg-white/5 p-2.5 text-xs text-foreground focus-visible:border-cyan-500 focus-visible:outline-none"
              />
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)] h-9 px-5"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4 mr-1.5" />
                  Save Profile Settings
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* TAB 4: HARDWARE & TELEMETRY */}
      {activeTab === "hardware" && (
        <div className="rounded-2xl border border-white/10 bg-card/60 p-6 max-w-2xl space-y-6 animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <IconVolume className="size-5 text-cyan-400" />
                <div>
                  <div className="font-bold text-xs text-foreground font-mono">
                    Dolby Atmos Spatial Audio Simulation
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Positional 3D surround sound telemetry
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={spatialAudio ? "default" : "outline"}
                onClick={() => setSpatialAudio(!spatialAudio)}
                className="text-xs font-mono h-7 px-3"
              >
                {spatialAudio ? "ENABLED" : "DISABLED"}
              </Button>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <IconCpu className="size-5 text-purple-400" />
                <div>
                  <div className="font-bold text-xs text-foreground font-mono">
                    Hardware Vulkan RT Acceleration
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Direct GPU pipeline shader caching for 144 FPS
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant={hardwareAccel ? "default" : "outline"}
                onClick={() => setHardwareAccel(!hardwareAccel)}
                className="text-xs font-mono h-7 px-3"
              >
                {hardwareAccel ? "ENABLED" : "DISABLED"}
              </Button>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
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
                className="text-xs font-mono h-7 px-3"
              >
                {cloudSync ? "ENABLED" : "DISABLED"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconWorld className="size-5 text-amber-400" />
                <div>
                  <div className="font-bold text-xs text-foreground font-mono">
                    Server Fleet Region
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Current: AS-EAST (12ms Ping)
                  </div>
                </div>
              </div>
              <select
                value={serverRegion}
                onChange={(e) => setServerRegion(e.target.value)}
                className="rounded-lg border border-white/10 bg-card px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none"
              >
                <option value="as-east">Asia East (Tokyo)</option>
                <option value="us-east">US East (Virginia)</option>
                <option value="eu-central">EU Central (Frankfurt)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
