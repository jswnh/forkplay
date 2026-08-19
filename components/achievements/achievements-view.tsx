"use client";

import * as React from "react";
import {
  IconTrophy,
  IconSearch,
  IconCheck,
  IconLock,
  IconSparkles,
  IconClock,
  IconFlame,
  IconRefresh,
  IconDeviceGamepad2,
} from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievementsList, useUnlockAchievement } from "@/hooks/use-achievements";
import { useToast } from "@/providers/toast-provider";

const STATUS_FILTERS = [
  { id: "all", label: "All Trophies" },
  { id: "unlocked", label: "Unlocked" },
  { id: "in_progress", label: "In Progress" },
  { id: "locked", label: "Locked" },
];

export function AchievementsView() {
  const [selectedGameId, setSelectedGameId] = React.useState("all");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { showToast } = useToast();

  const { data, isLoading, isError, refetch } = useAchievementsList({
    gameId: selectedGameId,
    status: selectedStatus,
    search: searchQuery,
  });

  const unlockMutation = useUnlockAchievement();

  const achievements = data?.achievements || [];
  const stats = data?.stats || {
    totalAchievements: 0,
    unlockedCount: 0,
    lockedCount: 0,
    completionPercentage: 0,
    totalPoints: 0,
    earnedPoints: 0,
  };
  const recentlyUnlocked = data?.recentlyUnlocked || [];

  // Extract unique games for the dropdown
  const gamesList = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const a of achievements) {
      if (a.gameId && a.gameTitle) {
        map.set(a.gameId, a.gameTitle);
      }
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [achievements]);

  const handleUnlockTest = (ach: any) => {
    unlockMutation.mutate(ach.achievementId, {
      onSuccess: () => {
        showToast({
          title: `🏆 Unlocked: ${ach.title}!`,
          description: `+${ach.points} XP added to your operator profile.`,
          type: "achievement",
        });
      },
    });
  };

  const getRarityBadgeVariant = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "legendary";
      case "epic":
        return "epic";
      case "rare":
        return "rare";
      default:
        return "common";
    }
  };

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
            <IconTrophy className="size-4" />
            <span>TROPHY ROOM // OPERATOR HONORS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-foreground">
            Achievements & Medals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track tactical accolades, global completion milestones, and leaderboard XP.
          </p>
        </div>

        {/* Global Stats Overview Strip */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="rounded-xl border border-white/10 bg-card/60 p-3 text-center min-w-28">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              Completion
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
              {stats.completionPercentage}%
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-3 text-center min-w-28">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              Unlocked
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {stats.unlockedCount}/{stats.totalAchievements}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/60 p-3 text-center min-w-28">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">
              Gamer XP
            </div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">
              +{stats.earnedPoints} XP
            </div>
          </div>
        </div>
      </div>

      {/* Recently Unlocked Spotlight Banner */}
      {recentlyUnlocked.length > 0 && !searchQuery && selectedStatus === "all" && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-2">
            <IconSparkles className="size-4 text-amber-400 animate-pulse" />
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-amber-300">
              Recently Unlocked Accolades
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentlyUnlocked.map((ach: any) => (
              <div
                key={ach.achievementId}
                className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-black/40 shadow-sm"
              >
                <div className="relative size-11 rounded-lg overflow-hidden border border-amber-500/40 shrink-0">
                  <Image
                    src={ach.iconUrl}
                    alt={ach.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                    <IconCheck className="size-5 text-amber-300" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground truncate">
                    {ach.title}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 mt-0.5">
                    +{ach.points} XP • {ach.gameTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  selectedStatus === f.id
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                    : "border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search & Game Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trophies..."
                className="pl-8 bg-card/60 border-white/10 text-xs font-mono"
              />
            </div>

            {gamesList.length > 0 && (
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="rounded-lg border border-white/10 bg-card/60 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-cyan-500 shrink-0"
              >
                <option value="all">All Games</option>
                {gamesList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => refetch()}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors shrink-0"
              title="Refresh Achievements"
            >
              <IconRefresh className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Achievement Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-white/5 bg-card/40 space-y-3"
            >
              <div className="flex gap-3">
                <Skeleton className="size-14 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center text-red-400 font-mono text-xs">
          Error retrieving honors roster.
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card/30 p-12 text-center space-y-3">
          <IconTrophy className="size-8 mx-auto text-muted-foreground" />
          <p className="text-xs font-mono text-muted-foreground">
            No achievements located for the chosen filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach: any) => {
            const isCompleted = ach.unlocked;
            const progressPercent =
              ach.maxProgress > 0
                ? Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100))
                : 0;

            return (
              <div
                key={ach.achievementId}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                  isCompleted
                    ? "border-amber-500/30 bg-card/80 shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:border-amber-500/50"
                    : "border-white/10 bg-card/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Icon */}
                  <div className="relative size-14 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-muted">
                    <Image
                      src={ach.iconUrl}
                      alt={ach.title}
                      fill
                      className={`object-cover ${
                        !isCompleted ? "grayscale contrast-125 opacity-60" : ""
                      }`}
                    />
                    {isCompleted ? (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <IconCheck className="size-6 text-amber-300" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <IconLock className="size-5 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <Badge
                        variant={getRarityBadgeVariant(ach.rarity) as any}
                        className="text-[9px] py-0 px-1.5 uppercase font-mono"
                      >
                        {ach.rarity}
                      </Badge>
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        +{ach.points} XP
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground mt-1 truncate">
                      {ach.title}
                    </h3>
                    <p className="text-[11px] font-mono text-cyan-400/90 truncate">
                      {ach.gameTitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ach.description}
                </p>

                {/* Footer Progress / Unlock Status */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                  {isCompleted ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <IconCheck className="size-3.5" />
                      Unlocked{" "}
                      {ach.unlockedAt
                        ? `(${new Date(ach.unlockedAt).toLocaleDateString()})`
                        : ""}
                    </span>
                  ) : (
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {ach.progress}/{ach.maxProgress} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Simulate Unlock Button (if locked, for testing demo) */}
                  {!isCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlockTest(ach)}
                      disabled={unlockMutation.isPending}
                      className="ml-2 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 px-2"
                      title="Test unlock this achievement"
                    >
                      Unlock Test
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
