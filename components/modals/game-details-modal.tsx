"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPlayerPlay,
  IconStarFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconTrophy,
  IconBuildingStore,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import { useGameDetails, useToggleFavorite } from "@/hooks/use-games";
import { useToast } from "@/providers/toast-provider";
import { formatPrice } from "@/lib/currency";

interface GameDetailsModalProps {
  slugOrId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (game: any) => void;
  onOpenStoreCheckout?: (game: any) => void;
}

export function GameDetailsModal({
  slugOrId,
  isOpen,
  onClose,
  onLaunch,
  onOpenStoreCheckout,
}: GameDetailsModalProps) {
  const { showToast } = useToast();
  const { data, isLoading } = useGameDetails(slugOrId, isOpen);
  const toggleFavoriteMutation = useToggleFavorite();

  const game = data?.game;

  const handleToggleFavorite = () => {
    if (!game) return;
    toggleFavoriteMutation.mutate(game.gameId, {
      onSuccess: (resData: any) => {
        showToast({
          title: resData.isFavorite ? "Saved to Favorites" : "Removed from Favorites",
          description: resData.isFavorite
            ? `${game.title} is pinned to your favorites shelf.`
            : `${game.title} removed from favorites.`,
          type: "info",
        });
      },
    });
  };

  if (!isOpen || !slugOrId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className="max-w-3xl border-white/15 bg-background/95 p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {isLoading || !game ? (
          <div className="p-12 text-center text-muted-foreground font-mono text-sm">
            Loading telemetry & asset dossiers...
          </div>
        ) : (
          <div className="overflow-y-auto">
            {/* Banner Header */}
            <div className="relative h-64 w-full bg-muted">
              <Image
                src={game.bannerUrl || game.coverUrl}
                alt={game.title}
                fill
                className="object-cover brightness-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="cyber">{game.genre}</Badge>
                    {game.isNewRelease && (
                      <Badge variant="success">NEW RELEASE</Badge>
                    )}
                    <div className="flex items-center gap-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/30 text-xs text-amber-400 font-mono">
                      <IconStarFilled className="size-3 text-amber-400" />
                      <span>{game.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-brand text-white">
                    {game.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                    className="border-white/20 bg-black/50 backdrop-blur-md hover:bg-white/10"
                  >
                    {game.isFavorite ? (
                      <IconBookmarkFilled className="size-5 text-amber-400" />
                    ) : (
                      <IconBookmark className="size-5 text-white/80" />
                    )}
                  </Button>

                  {game.inLibrary ? (
                    <Button
                      onClick={() => {
                        onClose();
                        onLaunch(game);
                      }}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                    >
                      <IconPlayerPlay className="size-4 mr-2 fill-current" />
                      Play Now
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        if (onOpenStoreCheckout) {
                          onClose();
                          onOpenStoreCheckout(game);
                        }
                      }}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                    >
                      <IconBuildingStore className="size-4 mr-2" />
                      {game.price === 0 ? "Get Free" : `Buy ${formatPrice(game.price)}`}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Tags & Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] text-muted-foreground uppercase font-mono">
                    Developer
                  </div>
                  <div className="font-semibold text-sm text-foreground mt-0.5 truncate">
                    {game.developer}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] text-muted-foreground uppercase font-mono">
                    Publisher
                  </div>
                  <div className="font-semibold text-sm text-foreground mt-0.5 truncate">
                    {game.publisher}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] text-muted-foreground uppercase font-mono">
                    Storage Size
                  </div>
                  <div className="font-semibold text-sm text-cyan-400 font-mono mt-0.5">
                    {game.downloadSize || "12.4 GB"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] text-muted-foreground uppercase font-mono">
                    Playtime Logged
                  </div>
                  <div className="font-semibold text-sm text-emerald-400 font-mono mt-0.5">
                    {game.inLibrary
                      ? `${Math.round(game.playtimeMinutes / 60)} hrs`
                      : "Not Owned"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase font-mono text-muted-foreground tracking-wider">
                  Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Tags */}
              {game.tags && game.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase font-mono text-muted-foreground tracking-wider">
                    Tags & Features
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {game.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-white/10 bg-white/5 text-muted-foreground text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements Shelf */}
              {game.achievements && game.achievements.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase font-mono text-muted-foreground tracking-wider flex items-center gap-2">
                      <IconTrophy className="size-4 text-amber-400" />
                      Game Achievements ({game.achievements.filter((a: any) => a.unlocked).length}/{game.achievements.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {game.achievements.map((ach: any) => (
                      <div
                        key={ach.achievementId}
                        className={`rounded-xl border p-3 flex items-start gap-3 transition-all ${
                          ach.unlocked
                            ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                            : "border-white/10 bg-white/5 opacity-70"
                        }`}
                      >
                        <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <Image
                            src={ach.iconUrl}
                            alt={ach.title}
                            fill
                            className="object-cover"
                          />
                          {ach.unlocked && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                              <IconCheck className="size-5 text-amber-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-xs text-foreground truncate">
                              {ach.title}
                            </h4>
                            <span className="text-[11px] font-mono text-amber-400">
                              +{ach.points} XP
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {ach.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
