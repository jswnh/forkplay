"use client";

import * as React from "react";
import {
  IconBuildingStore,
  IconSearch,
  IconStarFilled,
  IconShoppingBag,
  IconBookmark,
  IconBookmarkFilled,
  IconPlayerPlay,
  IconCheck,
  IconSparkles,
  IconTag,
  IconFlame,
  IconRefresh,
  IconDeviceGamepad2,
  IconPackage,
} from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStoreGames, useVerifyXendit } from "@/hooks/use-store";
import { useStoreItems, useVerifyItemPayment } from "@/hooks/use-items";
import { useToggleFavorite } from "@/hooks/use-games";
import { useToast } from "@/providers/toast-provider";
import { useSearchParams, useRouter } from "next/navigation";
import { StoreCheckoutModal } from "@/components/modals/store-checkout-modal";
import { ItemCheckoutModal } from "@/components/modals/item-checkout-modal";
import { GameDetailsModal } from "@/components/modals/game-details-modal";
import { GameLauncherModal, GameLauncherTarget } from "@/components/modals/game-launcher-modal";
import { formatPrice, formatRawAmount } from "@/lib/currency";

const STORE_GENRES = [
  "All",
  "Action RPG",
  "Space Sim",
  "Hack & Slash",
  "Rhythm Runner",
  "Sci-Fi Horror",
  "Tactical Shooter",
  "Puzzle Platformer",
];

const PRICE_FILTERS = [
  { id: "all", label: "All Prices" },
  { id: "free", label: "Free to Play" },
  { id: "under20", label: "Under ₱1,000" },
  { id: "deals", label: "Special Deals & Discounts" },
];

const ITEM_CATEGORIES = [
  { id: "all", label: "All Store Items" },
  { id: "dlc", label: "DLC & Expansions" },
  { id: "cosmetic", label: "Skins & Cosmetics" },
  { id: "pass", label: "Passes & Themes" },
  { id: "currency", label: "Credit Bundles" },
  { id: "consumable", label: "Consumables" },
];

const ITEM_RARITIES = [
  "all",
  "common",
  "rare",
  "epic",
  "legendary",
];

export function StoreView() {
  const [storeTab, setStoreTab] = React.useState<"games" | "items">("games");
  
  // Games state
  const [selectedGenre, setSelectedGenre] = React.useState("All");
  const [priceFilter, setPriceFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("featured");

  // Items state
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedRarity, setSelectedRarity] = React.useState("all");

  const [checkoutGame, setCheckoutGame] = React.useState<any | null>(null);
  const [checkoutItem, setCheckoutItem] = React.useState<any | null>(null);
  const [detailsSlug, setDetailsSlug] = React.useState<string | null>(null);
  const [launchGame, setLaunchGame] = React.useState<GameLauncherTarget | null>(null);

  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Fetch Store Games
  const { data: gamesData, isLoading: isGamesLoading, isError: isGamesError, refetch: refetchGames } = useStoreGames({
    genre: selectedGenre,
    priceFilter,
    search: searchQuery,
    sortBy,
  });

  // 2. Fetch Store Items
  const { data: itemsData, isLoading: isItemsLoading, isError: isItemsError, refetch: refetchItems } = useStoreItems({
    category: selectedCategory,
    rarity: selectedRarity,
    search: searchQuery,
  });

  const games = gamesData?.games || [];
  const items = itemsData?.items || [];
  const toggleFavoriteMutation = useToggleFavorite();
  const verifyXenditMutation = useVerifyXendit();
  const verifyItemMutation = useVerifyItemPayment();

  // Check for checkout return redirect
  React.useEffect(() => {
    const checkoutStatus = searchParams?.get("checkout");
    const tx = searchParams?.get("tx");
    const itemId = searchParams?.get("itemId");

    if (checkoutStatus === "success" && tx) {
      if (itemId) {
        verifyItemMutation.mutate(
          { externalId: tx },
          {
            onSuccess: (resData: any) => {
              showToast({
                title: "🎉 Item Payment Verified!",
                description: `${resData.item?.name || "Item"} has been delivered to your inventory!`,
                type: "success",
              });
              router.replace("/store");
            },
            onError: () => router.replace("/store"),
          },
        );
      } else {
        verifyXenditMutation.mutate(
          { externalId: tx },
          {
            onSuccess: (resData: any) => {
              showToast({
                title: "🎉 Payment Clearance Verified!",
                description: `Your order for ${resData.game?.title || "new title"} is complete and in your library!`,
                type: "success",
              });
              router.replace("/store");
            },
            onError: () => router.replace("/store"),
          },
        );
      }
    } else if (checkoutStatus === "failed") {
      showToast({
        title: "Payment Cancelled or Failed",
        description: "Your checkout session was not completed.",
        type: "error",
      });
      router.replace("/store");
    }
  }, [searchParams]);

  const handleToggleFavorite = (game: any) => {
    toggleFavoriteMutation.mutate(game.gameId, {
      onSuccess: (resData: any) => {
        showToast({
          title: resData.isFavorite ? "Added to Wishlist" : "Removed from Wishlist",
          description: `${game.title} wishlist status updated.`,
          type: "info",
        });
      },
    });
  };

  const spotlightDeal = games.find((g: any) => g.originalPrice && g.originalPrice > g.price) || games[0];

  const getRarityBadgeVariant = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "legendary";
      case "epic":
        return "epic";
      case "rare":
        return "cyber";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Store Header & Category Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-start gap-3.5">
          <SidebarTrigger className="mt-1 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 size-9 rounded-xl border border-white/10 shrink-0" />
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
              <IconBuildingStore className="size-4 text-cyan-400" />
              <span>DIRECT NETWORK COMMERCE // CATALOGUE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-foreground">
              Digital Store & Vault
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acquire tactical game licenses, expansion DLCs, cosmetics, and operator perks.
            </p>
          </div>
        </div>

        {/* Global Search & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Department Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-card/80 border border-white/10 shrink-0">
            <button
              onClick={() => setStoreTab("games")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                storeTab === "games"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconDeviceGamepad2 className="size-3.5" />
              <span>Full Games</span>
            </button>

            <button
              onClick={() => setStoreTab("items")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                storeTab === "items"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconPackage className="size-3.5" />
              <span>Store Items & DLC</span>
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={storeTab === "games" ? "Search game catalogue..." : "Search items & add-ons..."}
              className="pl-9 bg-card/60 border-white/10 text-xs focus-visible:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* GAMES SECTION                                             */}
      {/* ========================================================= */}
      {storeTab === "games" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Spotlight Hero Deal Banner */}
          {spotlightDeal && !searchQuery && (
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-card/40 backdrop-blur-2xl shadow-2xl">
              <div className="relative h-72 sm:h-84 w-full">
                <Image
                  src={spotlightDeal.bannerUrl || spotlightDeal.coverUrl}
                  alt={spotlightDeal.title}
                  fill
                  priority
                  className="object-cover brightness-50 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />

                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between max-w-2xl">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="legendary">
                        <IconFlame className="size-3 mr-1" />
                        WEEKLY SPOTLIGHT DEAL
                      </Badge>
                      {spotlightDeal.originalPrice && (
                        <Badge variant="success">
                          -
                          {Math.round(
                            ((spotlightDeal.originalPrice - spotlightDeal.price) /
                              spotlightDeal.originalPrice) *
                              100,
                          )}
                          % OFF
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-brand text-white">
                      {spotlightDeal.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2">
                      {spotlightDeal.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-baseline gap-2">
                      {spotlightDeal.price === 0 ? (
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          FREE
                        </span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold font-mono text-cyan-400">
                            {formatPrice(spotlightDeal.price)}
                          </span>
                          {spotlightDeal.originalPrice && (
                            <span className="text-sm font-mono text-muted-foreground line-through">
                              {formatRawAmount(spotlightDeal.originalPrice)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {spotlightDeal.inLibrary ? (
                      <Button
                        onClick={() => setLaunchGame(spotlightDeal)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold"
                      >
                        <IconPlayerPlay className="size-3.5 mr-1.5 fill-current" />
                        In Library • Launch
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCheckoutGame(spotlightDeal)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                      >
                        <IconShoppingBag className="size-4 mr-1.5" />
                        Acquire License Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs & Genre Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                {PRICE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPriceFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                      priceFilter === f.id
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => refetchGames()}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 shrink-0"
                title="Refresh Store"
              >
                <IconRefresh className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {STORE_GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                    selectedGenre === g
                      ? "bg-foreground text-background font-bold"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          {isGamesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-card/40 p-3 space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
                  <Skeleton className="h-5 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                </div>
              ))}
            </div>
          ) : isGamesError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center">
              <p className="text-sm text-red-400 font-mono">Failed to load games catalogue.</p>
              <Button variant="outline" onClick={() => refetchGames()} className="mt-3 text-xs font-mono">
                Retry Connection
              </Button>
            </div>
          ) : games.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/30 p-12 text-center">
              <h3 className="font-bold text-base text-foreground font-brand">No Games Matched</h3>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game: any) => {
                const discount =
                  game.originalPrice && game.originalPrice > game.price
                    ? Math.round(((game.originalPrice - game.price) / game.originalPrice) * 100)
                    : null;

                return (
                  <div
                    key={game.gameId}
                    className="group relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="relative h-52 w-full overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setDetailsSlug(game.slug)}
                      >
                        <Image
                          src={game.coverUrl}
                          alt={game.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />

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
                            title="Add to Wishlist"
                          >
                            {game.isFavorite ? (
                              <IconBookmarkFilled className="size-3.5 text-amber-400" />
                            ) : (
                              <IconBookmark className="size-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-md border border-white/10 text-[11px] text-amber-400 font-mono backdrop-blur-md">
                          <IconStarFilled className="size-3 text-amber-400" />
                          <span>{game.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3
                            onClick={() => setDetailsSlug(game.slug)}
                            className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            {game.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                            {game.shortDescription}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            {game.price === 0 ? (
                              <span className="text-emerald-400 font-mono font-bold text-sm">
                                FREE
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-cyan-400 font-mono font-bold text-sm">
                                  {formatPrice(game.price)}
                                </span>
                                {discount && (
                                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                                    -{discount}%
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {game.inLibrary ? (
                            <Button
                              size="sm"
                              onClick={() => setLaunchGame(game)}
                              className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono h-8 px-3 rounded-lg"
                            >
                              <IconCheck className="size-3.5 mr-1 text-emerald-400" />
                              Owned
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setCheckoutGame(game)}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold h-8 px-3 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                            >
                              <IconShoppingBag className="size-3.5 mr-1" />
                              {game.price === 0 ? "Get" : "Buy"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* STORE ITEMS & DLC SECTION                                 */}
      {/* ========================================================= */}
      {storeTab === "items" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Category Chips & Rarity Selectors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                {ITEM_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                      selectedCategory === c.id
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => refetchItems()}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 shrink-0"
                title="Refresh Items"
              >
                <IconRefresh className="size-4" />
              </button>
            </div>

            {/* Rarity Pill Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-mono text-muted-foreground uppercase mr-1">Rarity:</span>
              {ITEM_RARITIES.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRarity(r)}
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-all whitespace-nowrap ${
                    selectedRarity === r
                      ? "bg-foreground text-background font-bold"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {isItemsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-card/40 p-3 space-y-3">
                  <Skeleton className="h-44 w-full rounded-xl bg-white/5" />
                  <Skeleton className="h-5 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                </div>
              ))}
            </div>
          ) : isItemsError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12 text-center">
              <p className="text-sm text-red-400 font-mono">Failed to load store items.</p>
              <Button variant="outline" onClick={() => refetchItems()} className="mt-3 text-xs font-mono">
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/30 p-12 text-center space-y-3">
              <div className="size-14 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-muted-foreground">
                <IconPackage className="size-6" />
              </div>
              <h3 className="font-bold text-base text-foreground font-brand">No Store Items Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No items or DLCs currently match this filter. Admins can deploy new items from Platform Overseer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item: any) => (
                <div
                  key={item.itemId}
                  className="group relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.15)] flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <Badge
                          variant={getRarityBadgeVariant(item.rarity) as any}
                          className="text-[10px] uppercase py-0 px-2 font-mono bg-black/70 backdrop-blur-md"
                        >
                          {item.rarity}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize py-0 px-2 font-mono bg-black/70 backdrop-blur-md text-white/80 border-white/15"
                        >
                          {item.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-purple-400 transition-colors">
                          {item.name}
                        </h3>
                        {item.gameTitle && (
                          <p className="text-[11px] text-cyan-400 font-mono truncate">
                            {item.gameTitle}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {item.shortDescription || item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-purple-400 font-mono font-bold text-sm">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {item.inInventory ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <IconCheck className="size-3.5" />
                            {item.ownedQuantity > 1 ? `Owned (${item.ownedQuantity})` : "Owned"}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => setCheckoutItem(item)}
                            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono h-7 px-2 rounded-md"
                          >
                            + Add
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setCheckoutItem(item)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold h-8 px-3 rounded-lg shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        >
                          <IconShoppingBag className="size-3.5 mr-1" />
                          {item.price === 0 ? "Claim" : "Buy"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <StoreCheckoutModal
        game={checkoutGame}
        isOpen={Boolean(checkoutGame)}
        onClose={() => setCheckoutGame(null)}
        onLaunchGame={(g) => setLaunchGame(g)}
      />

      <ItemCheckoutModal
        item={checkoutItem}
        isOpen={Boolean(checkoutItem)}
        onClose={() => setCheckoutItem(null)}
      />

      <GameDetailsModal
        slugOrId={detailsSlug}
        isOpen={Boolean(detailsSlug)}
        onClose={() => setDetailsSlug(null)}
        onLaunch={(g) => setLaunchGame(g)}
        onOpenStoreCheckout={(g) => setCheckoutGame(g)}
      />

      <GameLauncherModal
        game={launchGame}
        isOpen={Boolean(launchGame)}
        onClose={() => setLaunchGame(null)}
      />
    </div>
  );
}
