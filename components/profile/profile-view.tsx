"use client";

import * as React from "react";
import {
  IconUser,
  IconTrophy,
  IconClock,
  IconDeviceGamepad2,
  IconEdit,
  IconSparkles,
  IconBookmarkFilled,
  IconShoppingBag,
  IconPlayerPlay,
  IconAward,
  IconShield,
  IconActivity,
} from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileData } from "@/hooks/use-profile";
import { ProfileEditModal } from "@/components/modals/profile-edit-modal";
import { GameLauncherModal, GameLauncherTarget } from "@/components/modals/game-launcher-modal";

const TABS = [
  { id: "overview", label: "Overview & Badges" },
  { id: "activity", label: "Recent Activity Feed" },
  { id: "library", label: "Games Library" },
];

export function ProfileView() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [launchGame, setLaunchGame] = React.useState<GameLauncherTarget | null>(null);

  const { data, isLoading, isError, refetch } = useProfileData();

  const user = data?.user;
  const stats = data?.stats;
  const library = data?.library || [];
  const favoriteGames = data?.favoriteGames || [];
  const recentActivity = data?.recentActivity || [];
  const badges = data?.badges || [];

  const displayName = user?.displayName || user?.username || "Operator";
  const handle = user?.username ? `@${user.username}` : user?.email;
  const avatarUrl = user?.avatarUrl || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop";
  const bannerUrl = user?.bannerUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop";

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-card shadow-2xl">
        <div className="relative h-48 sm:h-64 w-full">
          <Image
            src={bannerUrl}
            alt="Profile Banner"
            fill
            priority
            className="object-cover brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        {/* Profile Details Bar */}
        <div className="p-6 sm:p-8 pt-0 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar with level badge */}
            <div className="relative size-28 sm:size-32 rounded-2xl overflow-hidden border-4 border-background shadow-2xl shrink-0 bg-card">
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-center text-[10px] font-mono text-cyan-400 font-bold border-t border-cyan-500/30">
                LEVEL {stats?.level ?? 1}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-brand text-foreground">
                  {displayName}
                </h1>
                <Badge variant="cyber" className="text-xs">
                  {user?.role?.toUpperCase() || "OPERATOR"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm font-mono text-cyan-400">
                {handle}
              </p>
              <p className="text-xs text-muted-foreground max-w-md mt-1">
                {user?.bio || "Tactical operator on the ForkPlay Network."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(true)}
              className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono font-medium"
            >
              <IconEdit className="size-3.5 mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid Bar */}
        <div className="border-t border-white/5 bg-white/5 grid grid-cols-2 sm:grid-cols-4 p-4 gap-4 text-center">
          <div>
            <div className="text-[11px] font-mono text-muted-foreground uppercase">
              Games Owned
            </div>
            <div className="text-xl font-bold font-mono text-foreground mt-0.5">
              {stats?.totalGames ?? 0}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-muted-foreground uppercase">
              Total Playtime
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
              {stats?.totalPlaytimeHours ?? 0} hrs
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-muted-foreground uppercase">
              Achievements
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {stats?.achievementsCount ?? 0}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-muted-foreground uppercase">
              Completion Rate
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              {stats?.completionRate ?? 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all ${
              activeTab === tab.id
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Badges */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Favorite Games Shelf */}
          {favoriteGames.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconBookmarkFilled className="size-4 text-amber-400" />
                <h2 className="text-base font-bold font-brand text-foreground">
                  Favorite Titles Showcase
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {favoriteGames.map((game: any) => (
                  <div
                    key={game.gameId}
                    className="group relative rounded-2xl border border-white/10 bg-card/60 overflow-hidden hover:border-cyan-500/40 transition-all p-3 space-y-3"
                  >
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-muted">
                      <Image
                        src={game.coverUrl}
                        alt={game.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {game.title}
                      </h4>
                      <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                        {Math.round(game.playtimeMinutes / 60)} hrs logged
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setLaunchGame(game)}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold h-8"
                    >
                      <IconPlayerPlay className="size-3.5 mr-1 fill-current" />
                      Launch
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gamer Badges & Honors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconAward className="size-4 text-purple-400" />
              <h2 className="text-base font-bold font-brand text-foreground">
                Platform Honors & Badges
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges.map((badge: any) => (
                <div
                  key={badge.id}
                  className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <IconSparkles className="size-5" />
                    </div>
                    <Badge variant={badge.tier as any} className="text-[9px] uppercase font-mono">
                      {badge.tier}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Recent Activity Feed */}
      {activeTab === "activity" && (
        <div className="rounded-2xl border border-white/10 bg-card/60 p-6 space-y-4 animate-in fade-in duration-200">
          <h2 className="text-base font-bold font-brand text-foreground mb-4">
            Transmission & Action History
          </h2>

          {recentActivity.length === 0 ? (
            <p className="text-xs font-mono text-muted-foreground text-center py-8">
              No recent activity recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((act: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-3.5 rounded-xl border border-white/5 bg-white/5"
                >
                  <div className="size-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    {act.icon === "play" ? (
                      <IconPlayerPlay className="size-4" />
                    ) : act.icon === "trophy" ? (
                      <IconTrophy className="size-4 text-amber-400" />
                    ) : (
                      <IconShoppingBag className="size-4 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {act.title}
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {act.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Games Library */}
      {activeTab === "library" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h2 className="text-base font-bold font-brand text-foreground">
            Owned Tactical Deployments ({library.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {library.map((game: any) => (
              <div
                key={game.gameId}
                className="group rounded-2xl border border-white/10 bg-card/60 overflow-hidden hover:border-cyan-500/40 transition-all p-3 space-y-3 flex flex-col justify-between"
              >
                <div className="relative h-44 w-full rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={game.coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="cyber" className="text-[10px] bg-black/70">
                      {game.genre}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {game.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mt-1">
                    <span className="text-cyan-400">
                      {Math.round(game.playtimeMinutes / 60)} hrs logged
                    </span>
                    <span>Installed</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => setLaunchGame(game)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold h-9"
                >
                  <IconPlayerPlay className="size-3.5 mr-1.5 fill-current" />
                  Launch Game
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ProfileEditModal
        user={user || null}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      <GameLauncherModal
        game={launchGame}
        isOpen={Boolean(launchGame)}
        onClose={() => setLaunchGame(null)}
      />
    </div>
  );
}
