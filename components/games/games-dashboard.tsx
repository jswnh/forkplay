"use client";

import * as React from "react";
import {
  IconSearch,
  IconPlayerPlay,
  IconStarFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconInfoCircle,
  IconSparkles,
  IconClock,
  IconBuildingStore,
  IconRefresh,
  IconBell,
  IconShoppingBag,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSession } from "@/hooks/use-user";
import { useGamesList, useFeaturedGame, useToggleFavorite } from "@/hooks/use-games";
import { useToast } from "@/providers/toast-provider";
import { GameLauncherModal, GameLauncherTarget } from "@/components/modals/game-launcher-modal";
import { GameDetailsModal } from "@/components/modals/game-details-modal";
import { StoreCheckoutModal } from "@/components/modals/store-checkout-modal";
import { formatPrice } from "@/lib/currency";

const GENRES = [
  "All",
  "Action RPG",
  "Space Sim",
  "Hack & Slash",
  "Rhythm Runner",
  "Sci-Fi Horror",
  "Tactical Shooter",
  "Puzzle Platformer",
];

const TABS = [
  { id: "all", label: "All Games" },
  { id: "library", label: "My Library" },
  { id: "recent", label: "Recently Played" },
  { id: "favorites", label: "Wishlist & Favorites" },
  { id: "new", label: "New Releases" },
  { id: "popular", label: "Most Played" },
];

export function GamesDashboard() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [selectedGenre, setSelectedGenre] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedGameForLaunch, setSelectedGameForLaunch] = React.useState<GameLauncherTarget | null>(null);
  const [selectedGameSlugForDetails, setSelectedGameSlugForDetails] = React.useState<string | null>(null);
  const [selectedGameForCheckout, setSelectedGameForCheckout] = React.useState<any | null>(null);

  const { showToast } = useToast();

  // 1. Fetch User Session
  const { data: sessionData } = useUserSession();
  const user = sessionData?.user;
  const stats = sessionData?.stats;

  // 2. Fetch Featured Game
  const { data: featuredData } = useFeaturedGame();
  const featuredGame = featuredData?.game;

  // 3. Fetch Games Grid
  const {
    data: gamesData,
    isLoading,
    isError,
    refetch,
  } = useGamesList({
    tab: activeTab,
    genre: selectedGenre,
    search: searchQuery,
  });

  const games = gamesData?.games || [];

  // 4. Toggle Favorite
  const toggleFavoriteMutation = useToggleFavorite();

  const handleToggleFavorite = (game: any) => {
    toggleFavoriteMutation.mutate(game.gameId, {
      onSuccess: (data: any) => {
        showToast({
          title: data.isFavorite ? "Saved to Favorites" : "Removed from Favorites",
          description: data.isFavorite
            ? `${game.title} is pinned to your favorites shelf.`
            : `${game.title} removed from favorites.`,
          type: "info",
        });
      },
    });
  };

  const commanderName = user?.displayName || user?.username || "Commander";

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span>TERMINAL ACTIVE // PROTOCOL FP-77</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-foreground">
            Welcome Back, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{commanderName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats?.gamesCount ? `${stats.gamesCount} owned tactical titles deployed in your library.` : "Select a title below or browse the Store to acquire new games."}
          </p>
        </div>

        {/* Search & Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library & titles..."
              className="pl-9 bg-card/60 border-white/10 text-sm focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                CLEAR
              </button>
            )}
          </div>

          <Link href="/inbox">
            <Button
              variant="outline"
              size="icon"
              className="relative border-white/10 bg-card/60 hover:bg-white/10 shrink-0"
            >
              <IconBell className="size-4 text-foreground" />
              {stats?.unreadInboxCount ? (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-cyan-500 text-[10px] font-bold text-black flex items-center justify-center font-mono">
                  {stats.unreadInboxCount}
                </span>
              ) : null}
            </Button>
          </Link>

          <Link href="/store">
            <Button
              variant="outline"
              className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hidden sm:flex items-center gap-1.5 font-medium text-xs font-mono"
            >
              <IconBuildingStore className="size-3.5" />
              Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Game Hero Section */}
      {featuredGame && !searchQuery && activeTab === "all" && (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-card transition-all duration-300 hover:border-cyan-500/30">
          <div className="relative h-80 sm:h-96 w-full overflow-hidden">
            <Image
              src={featuredGame.bannerUrl || featuredGame.coverUrl}
              alt={featuredGame.title}
              fill
              priority
              className="object-cover brightness-50 contrast-110 transform transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="cyber" className="backdrop-blur-md">
                  <IconSparkles className="size-3 mr-1" />
                  FEATURED SPOTLIGHT
                </Badge>
                <Badge variant="outline" className="bg-black/60 backdrop-blur-md border-white/15 text-white/80 font-mono text-xs">
                  {featuredGame.genre}
                </Badge>
                <div className="flex items-center gap-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-amber-500/30 text-xs text-amber-400 font-mono">
                  <IconStarFilled className="size-3 text-amber-400" />
                  <span>{featuredGame.rating.toFixed(1)}</span>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-brand text-white tracking-tight drop-shadow-md">
                {featuredGame.title}
              </h2>

              <p className="text-sm text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                {featuredGame.shortDescription || featuredGame.description}
              </p>

              <div className="flex items-center gap-4 mt-1 text-xs font-mono text-cyan-300/90">
                <span className="flex items-center gap-1">
                  <IconClock className="size-3.5" />
                  {featuredGame.inLibrary
                    ? "In Your Library"
                    : featuredGame.price === 0
                    ? "Free to Play"
                    : formatPrice(featuredGame.price)}
                </span>
                <span>•</span>
                <span>Developer: {featuredGame.developer}</span>
              </div>

              <div className="flex items-center gap-3 mt-6">
                {featuredGame.inLibrary ? (
                  <Button
                    onClick={() => setSelectedGameForLaunch(featuredGame)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 h-11 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform active:scale-95"
                  >
                    <IconPlayerPlay className="size-4 mr-2 fill-current" />
                    Play Now
                  </Button>
                ) : (
                  <Button
                    onClick={() => setSelectedGameForCheckout(featuredGame)}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold px-6 h-11 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform active:scale-95"
                  >
                    <IconShoppingBag className="size-4 mr-2" />
                    {featuredGame.price === 0
                      ? "Claim Free Game"
                      : `Buy (${formatPrice(featuredGame.price)})`}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setSelectedGameSlugForDetails(featuredGame.slug)}
                  className="border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/15 text-white h-11 px-5 rounded-xl font-medium"
                >
                  <IconInfoCircle className="size-4 mr-2" />
                  View Details
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleToggleFavorite(featuredGame)}
                  className="border-white/20 bg-black/40 backdrop-blur-md hover:bg-white/15 h-11 w-11 rounded-xl shrink-0"
                >
                  {featuredGame.isFavorite ? (
                    <IconBookmarkFilled className="size-5 text-amber-400" />
                  ) : (
                    <IconBookmark className="size-5 text-white/80" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Filter Tabs & Genre Chips */}
      <div className="space-y-4">
        {/* Main Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-white/5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors shrink-0"
            title="Refresh game list"
          >
            <IconRefresh className="size-4" />
          </button>
        </div>

        {/* Genre Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? "bg-foreground text-background font-bold shadow-md"
                  : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-card/40 p-3 space-y-3"
            >
              <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
              <Skeleton className="h-5 w-3/4 bg-white/5" />
              <Skeleton className="h-4 w-1/2 bg-white/5" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center space-y-3">
          <p className="text-sm text-red-400 font-mono">
            Error loading tactical database.
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-red-500/30 text-red-300"
          >
            Retry Connection
          </Button>
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card/30 p-12 text-center space-y-4">
          <div className="size-14 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-muted-foreground">
            <IconSearch className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground font-brand">
              {activeTab === "library" ? "No Games In Library Yet" : "No Games Located"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {activeTab === "library"
                ? "You haven't acquired any games yet. Browse the Store to purchase games with Xendit or claim free titles."
                : "No titles match the selected filter criteria or search query."}
            </p>
          </div>
          {activeTab === "library" ? (
            <Link href="/store">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-mono">
                <IconBuildingStore className="size-3.5 mr-1.5" />
                Explore Store Catalogue
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setActiveTab("all");
                setSelectedGenre("All");
                setSearchQuery("");
              }}
              className="border-white/15 text-xs font-mono"
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game: any) => (
            <div
              key={game.gameId}
              className="group relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between"
            >
              {/* Cover Artwork */}
              <div>
                <div
                  className="relative h-52 w-full overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setSelectedGameSlugForDetails(game.slug)}
                >
                  <Image
                    src={game.coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <Badge variant="cyber" className="text-[10px] py-0 px-2 bg-black/60 backdrop-blur-md">
                      {game.genre}
                    </Badge>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(game);
                      }}
                      className="size-7 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 hover:text-amber-400 transition-colors"
                    >
                      {game.isFavorite ? (
                        <IconBookmarkFilled className="size-3.5 text-amber-400" />
                      ) : (
                        <IconBookmark className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Rating badge bottom right */}
                  <div className="absolute bottom-2.5 right-3 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-md border border-white/10 text-[11px] text-amber-400 font-mono backdrop-blur-md">
                    <IconStarFilled className="size-3 text-amber-400" />
                    <span>{game.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3
                      onClick={() => setSelectedGameSlugForDetails(game.slug)}
                      className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {game.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {game.shortDescription || game.description}
                    </p>
                  </div>

                  {/* Ownership / Playtime indicator */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconClock className="size-3 text-cyan-400" />
                      {game.inLibrary && game.playtimeMinutes > 0
                        ? `${Math.round(game.playtimeMinutes / 60)} hrs logged`
                        : game.inLibrary
                        ? "Owned & Ready"
                        : game.price === 0
                        ? "Free Title"
                        : formatPrice(game.price)}
                    </span>

                    {game.inLibrary && (
                      <span className="text-emerald-400 text-[10px] flex items-center gap-0.5 font-bold">
                        <IconCheck className="size-3" />
                        OWNED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Play (if owned) or Buy/Claim (if not owned) */}
              <div className="p-4 pt-0">
                <div className="flex items-center gap-2 pt-1">
                  {game.inLibrary ? (
                    <Button
                      onClick={() => setSelectedGameForLaunch(game)}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold h-9 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                      <IconPlayerPlay className="size-3.5 mr-1.5 fill-current" />
                      Play
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setSelectedGameForCheckout(game)}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold h-9 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <IconShoppingBag className="size-3.5 mr-1.5" />
                      {game.price === 0 ? "Get Free" : `Buy ${formatPrice(game.price)}`}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedGameSlugForDetails(game.slug)}
                    className="border-white/10 bg-white/5 hover:bg-white/10 size-9 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
                    title="View game details"
                  >
                    <IconInfoCircle className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <GameLauncherModal
        game={selectedGameForLaunch}
        isOpen={Boolean(selectedGameForLaunch)}
        onClose={() => setSelectedGameForLaunch(null)}
      />

      <GameDetailsModal
        slugOrId={selectedGameSlugForDetails}
        isOpen={Boolean(selectedGameSlugForDetails)}
        onClose={() => setSelectedGameSlugForDetails(null)}
        onLaunch={(g) => setSelectedGameForLaunch(g)}
        onOpenStoreCheckout={(g) => setSelectedGameForCheckout(g)}
      />

      <StoreCheckoutModal
        game={selectedGameForCheckout}
        isOpen={Boolean(selectedGameForCheckout)}
        onClose={() => setSelectedGameForCheckout(null)}
        onLaunchGame={(g) => setSelectedGameForLaunch(g)}
      />
    </div>
  );
}
