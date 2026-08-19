"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPlayerPlay,
  IconSquare,
  IconCpu,
  IconDeviceGamepad2,
  IconTrophy,
  IconLoader2,
  IconVolume,
  IconClock,
  IconActivity,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRecordPlaySession } from "@/hooks/use-games";
import { useToast } from "@/providers/toast-provider";

export interface GameLauncherTarget {
  gameId: string;
  slug: string;
  title: string;
  coverUrl: string;
  bannerUrl?: string | null;
  genre: string;
  rating: number;
}

interface GameLauncherModalProps {
  game: GameLauncherTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameLauncherModal({
  game,
  isOpen,
  onClose,
}: GameLauncherModalProps) {
  const [launchStage, setLaunchStage] = React.useState<
    "booting" | "syncing" | "running"
  >("booting");
  const [secondsElapsed, setSecondsElapsed] = React.useState(0);
  const [fps, setFps] = React.useState(144);
  const [resolution] = React.useState("3840 x 2160 @ 144Hz");

  const { showToast } = useToast();
  const playSessionMutation = useRecordPlaySession();

  // Reset and run boot sequence on open
  React.useEffect(() => {
    if (!isOpen || !game) {
      setLaunchStage("booting");
      setSecondsElapsed(0);
      return;
    }

    setLaunchStage("booting");
    setSecondsElapsed(0);

    const timer1 = setTimeout(() => setLaunchStage("syncing"), 900);
    const timer2 = setTimeout(() => setLaunchStage("running"), 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, game]);

  // Session timer
  React.useEffect(() => {
    if (launchStage !== "running" || !isOpen) return;

    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
      // Subtle FPS fluctuation
      setFps(140 + Math.floor(Math.random() * 8));
    }, 1000);

    return () => clearInterval(interval);
  }, [launchStage, isOpen]);

  const handleRecordPlay = () => {
    if (!game) return;

    playSessionMutation.mutate(
      { gameId: game.gameId, minutes: 30 },
      {
        onSuccess: (data: any) => {
          showToast({
            title: `🎮 Session Logged: ${game?.title}`,
            description: `+30 minutes recorded. Current total playtime: ${Math.round(
              (data.playtimeMinutes || 30) / 60,
            )} hours.`,
            type: "success",
          });

          if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
            for (const ach of data.newlyUnlocked) {
              showToast({
                title: `🏆 Achievement Unlocked: ${ach.title}!`,
                description: `+${ach.points} XP added to your operator profile.`,
                type: "achievement",
              });
            }
          }
        },
        onError: (err: any) => {
          showToast({
            title: "Telemetry Sync Error",
            description: err.message || "Failed to record session.",
            type: "error",
          });
        },
      },
    );
  };

  if (!game) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-cyan-500/30 bg-background/95 p-0 overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.15)]">
        {/* Banner Backdrop */}
        <div className="relative h-44 w-full overflow-hidden bg-card">
          <Image
            src={game.bannerUrl || game.coverUrl}
            alt={game.title}
            fill
            className="object-cover brightness-50 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Top telemetry bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Badge variant="cyber" className="bg-black/60 backdrop-blur-md">
                <span className="size-2 rounded-full bg-cyan-400 animate-ping mr-1.5" />
                VULKAN RT ENGINE
              </Badge>
              <Badge variant="outline" className="bg-black/60 backdrop-blur-md text-white/80 border-white/10 font-mono text-[11px]">
                {game.genre}
              </Badge>
            </div>
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-cyan-300 backdrop-blur-md">
              <IconActivity className="size-3.5 text-emerald-400" />
              <span>{fps} FPS</span>
            </div>
          </div>

          {/* Title on banner */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold font-brand text-white drop-shadow-md">
                {game.title}
              </h2>
              <p className="text-xs font-mono text-cyan-400/90 mt-0.5">
                EXEC // FORKPLAY_CLIENT_INSTANCE_ID_{game.slug.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Launcher Status Stage */}
          {launchStage === "booting" && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <IconLoader2 className="size-8 text-cyan-400 animate-spin" />
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">
                  Initializing Hardware Acceleration...
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Loading direct memory buffers and shader caches
                </p>
              </div>
            </div>
          )}

          {launchStage === "syncing" && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <IconLoader2 className="size-8 text-emerald-400 animate-spin" />
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">
                  Syncing Cloud Save Data...
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Verifying persistent state checksums with ForkPlay Relay
                </p>
              </div>
            </div>
          )}

          {launchStage === "running" && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Telemetry Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <IconClock className="size-3.5 text-cyan-400" />
                    <span>SESSION</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground mt-1">
                    {formatTimer(secondsElapsed)}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <IconActivity className="size-3.5 text-emerald-400" />
                    <span>FPS RATE</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                    {fps}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <IconCpu className="size-3.5 text-purple-400" />
                    <span>GPU TEMP</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-purple-300 mt-1">
                    52°C
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <IconDeviceGamepad2 className="size-3.5 text-amber-400" />
                    <span>STATUS</span>
                  </div>
                  <div className="text-xs font-bold font-mono text-emerald-400 mt-2">
                    ACTIVE
                  </div>
                </div>
              </div>

              {/* Resolution & Specs bar */}
              <div className="rounded-xl border border-white/10 bg-card/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>OUTPUT: {resolution}</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <IconVolume className="size-4" />
                  <span>DOLBY ATMOS SPATIAL AUDIO</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleRecordPlay}
                  disabled={playSessionMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium shadow-[0_0_20px_rgba(16,185,129,0.25)] h-11"
                >
                  {playSessionMutation.isPending ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin mr-2" />
                      Logging Session Data...
                    </>
                  ) : (
                    <>
                      <IconTrophy className="size-4 mr-2 text-amber-300" />
                      Simulate 30-min Play & Check Achievements
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-white/15 hover:bg-white/10 text-muted-foreground hover:text-foreground h-11"
                >
                  <IconSquare className="size-4 mr-2 text-red-400" />
                  Close Game
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
