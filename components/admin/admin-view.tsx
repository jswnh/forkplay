"use client";

import * as React from "react";
import {
  IconShield,
  IconDeviceGamepad2,
  IconTrophy,
  IconSpeakerphone,
  IconPlus,
  IconTrash,
  IconUpload,
  IconLoader2,
  IconCheck,
  IconBuildingStore,
  IconCoin,
  IconUsers,
  IconMail,
  IconSparkles,
  IconRefresh,
  IconEdit,
  IconPackage,
} from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAdminStats,
  useCreateGame,
  useUpdateGame,
  useDeleteGame,
  useCreateStoreItem,
  useUpdateStoreItem,
  useDeleteStoreItem,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useBroadcastAnnouncement,
} from "@/hooks/use-admin";
import { formatPrice, formatRawAmount, APP_CURRENCY_SYMBOL } from "@/lib/currency";
import { useGamesList } from "@/hooks/use-games";
import { useStoreItems } from "@/hooks/use-items";
import { useAchievementsList } from "@/hooks/use-achievements";
import { useUploadFile } from "@/hooks/use-upload";
import { useToast } from "@/providers/toast-provider";

export function AdminView() {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "games" | "items" | "achievements" | "broadcast"
  >("overview");

  // Modals
  const [deployGameOpen, setDeployGameOpen] = React.useState(false);
  const [editingGame, setEditingGame] = React.useState<any | null>(null);

  const [deployItemOpen, setDeployItemOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);

  const [createAchOpen, setCreateAchOpen] = React.useState(false);
  const [editingAch, setEditingAch] = React.useState<any | null>(null);
  const [selectedAchFilterGame, setSelectedAchFilterGame] = React.useState("all");

  // New Game Form
  const [gameTitle, setGameTitle] = React.useState("");
  const [gameSlug, setGameSlug] = React.useState("");
  const [gameGenre, setGameGenre] = React.useState("Action RPG");
  const [gamePrice, setGamePrice] = React.useState("999.00");
  const [gameOriginalPrice, setGameOriginalPrice] = React.useState("1499.00");
  const [gameDesc, setGameDesc] = React.useState("");
  const [gameShortDesc, setGameShortDesc] = React.useState("");
  const [gameCoverUrl, setGameCoverUrl] = React.useState("");
  const [gameBannerUrl, setGameBannerUrl] = React.useState("");
  const [gameDev, setGameDev] = React.useState("Cyber Forge Games");
  const [gamePublisher, setGamePublisher] = React.useState("ForkPlay Publishing");
  const [gameSize, setGameSize] = React.useState("28.4 GB");

  // New Store Item Form
  const [itemName, setItemName] = React.useState("");
  const [itemSlug, setItemSlug] = React.useState("");
  const [itemCategory, setItemCategory] = React.useState("dlc");
  const [itemGameId, setItemGameId] = React.useState("");
  const [itemPrice, setItemPrice] = React.useState("349.00");
  const [itemOriginalPrice, setItemOriginalPrice] = React.useState("499.00");
  const [itemRarity, setItemRarity] = React.useState("rare");
  const [itemDesc, setItemDesc] = React.useState("");
  const [itemShortDesc, setItemShortDesc] = React.useState("");
  const [itemImageUrl, setItemImageUrl] = React.useState("");

  // New Achievement Form
  const [achGameId, setAchGameId] = React.useState("");
  const [achTitle, setAchTitle] = React.useState("");
  const [achDesc, setAchDesc] = React.useState("");
  const [achPoints, setAchPoints] = React.useState("50");
  const [achRarity, setAchRarity] = React.useState("rare");
  const [achIconUrl, setAchIconUrl] = React.useState("");

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = React.useState("");
  const [broadcastBody, setBroadcastBody] = React.useState("");
  const [broadcastActionUrl, setBroadcastActionUrl] = React.useState("/games");
  const [broadcastActionLabel, setBroadcastActionLabel] = React.useState("Explore Update");

  const { showToast } = useToast();

  // Queries & Mutations
  const { data: adminData, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: gamesData, isLoading: gamesLoading, refetch: refetchGames } = useGamesList();
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } = useStoreItems();
  const { data: achData, isLoading: achLoading, refetch: refetchAchs } = useAchievementsList({
    gameId: selectedAchFilterGame,
  });

  const createGameMutation = useCreateGame();
  const updateGameMutation = useUpdateGame();
  const deleteGameMutation = useDeleteGame();

  const createItemMutation = useCreateStoreItem();
  const updateItemMutation = useUpdateStoreItem();
  const deleteItemMutation = useDeleteStoreItem();

  const createAchMutation = useCreateAchievement();
  const updateAchMutation = useUpdateAchievement();
  const deleteAchMutation = useDeleteAchievement();

  const broadcastMutation = useBroadcastAnnouncement();
  const uploadMutation = useUploadFile();

  const stats = adminData?.stats || {
    totalUsers: 0,
    totalGames: 0,
    totalItems: 0,
    totalAchievements: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalMessages: 0,
  };

  const recentTransactions = adminData?.recentTransactions || [];
  const games = gamesData?.games || [];
  const items = itemsData?.items || adminData?.items || [];
  const achievements = achData?.achievements || [];

  // Helper Slug Generator
  const handleGameTitleChange = (val: string) => {
    setGameTitle(val);
    setGameSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  };

  const handleItemNameChange = (val: string) => {
    setItemName(val);
    setItemSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  };

  // Image Upload Handlers
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    folder = "games",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadMutation.mutateAsync({ file, folder });
      setter(res.url);
      showToast({
        title: "Image Uploaded",
        description: "Asset saved and linked to form.",
        type: "success",
      });
    } catch (err: any) {
      showToast({
        title: "Upload Failed",
        description: err.message || "Failed to upload image asset.",
        type: "error",
      });
    }
  };

  // --- Handlers: Game CRUD ---
  const handleDeployGame = () => {
    if (!gameTitle.trim() || !gameSlug.trim()) {
      showToast({ title: "Validation Error", description: "Title and slug are required.", type: "error" });
      return;
    }

    createGameMutation.mutate(
      {
        title: gameTitle,
        slug: gameSlug,
        genre: gameGenre,
        price: Number(gamePrice) || 0,
        originalPrice: gameOriginalPrice ? Number(gameOriginalPrice) : null,
        description: gameDesc || "High performance tactical cyber warfare title.",
        shortDescription: gameShortDesc || gameDesc.slice(0, 100),
        coverUrl: gameCoverUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
        bannerUrl: gameBannerUrl || gameCoverUrl || null,
        developer: gameDev,
        publisher: gamePublisher,
        downloadSize: gameSize,
        rating: 4.9,
      },
      {
        onSuccess: () => {
          showToast({
            title: "🚀 Title Deployed to Platform",
            description: `${gameTitle} is now live in the Store and Games catalogue.`,
            type: "success",
          });
          setDeployGameOpen(false);
          setGameTitle("");
          setGameSlug("");
          setGameDesc("");
          setGameCoverUrl("");
          refetchGames();
        },
        onError: (err: any) => {
          showToast({ title: "Deployment Error", description: err.message, type: "error" });
        },
      },
    );
  };

  const handleOpenEditGame = (game: any) => {
    setEditingGame({ ...game });
  };

  const handleSaveEditGame = () => {
    if (!editingGame) return;

    updateGameMutation.mutate(
      {
        id: editingGame.gameId,
        data: {
          title: editingGame.title,
          genre: editingGame.genre,
          price: Number(editingGame.price) || 0,
          originalPrice: editingGame.originalPrice ? Number(editingGame.originalPrice) : null,
          developer: editingGame.developer,
          publisher: editingGame.publisher,
          downloadSize: editingGame.downloadSize,
          coverUrl: editingGame.coverUrl,
          bannerUrl: editingGame.bannerUrl,
          description: editingGame.description,
          shortDescription: editingGame.shortDescription,
        },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Game Updated",
            description: `${editingGame.title} configuration updated.`,
            type: "success",
          });
          setEditingGame(null);
          refetchGames();
        },
        onError: (err: any) => {
          showToast({ title: "Update Error", description: err.message, type: "error" });
        },
      },
    );
  };

  const handleDeleteGame = (game: any) => {
    if (!confirm(`Are you sure you want to decommission "${game.title}"?`)) return;

    deleteGameMutation.mutate(game.gameId, {
      onSuccess: () => {
        showToast({
          title: "Title Decommissioned",
          description: `${game.title} removed from active deployment.`,
          type: "info",
        });
        refetchGames();
      },
      onError: (err: any) => {
        showToast({ title: "Deletion Error", description: err.message, type: "error" });
      },
    });
  };

  // --- Handlers: Store Item CRUD ---
  const handleDeployItem = () => {
    if (!itemName.trim() || !itemSlug.trim()) {
      showToast({ title: "Validation Error", description: "Name and slug are required.", type: "error" });
      return;
    }

    createItemMutation.mutate(
      {
        name: itemName,
        slug: itemSlug,
        category: itemCategory,
        gameId: itemGameId || null,
        price: Number(itemPrice) || 0,
        originalPrice: itemOriginalPrice ? Number(itemOriginalPrice) : null,
        rarity: itemRarity,
        description: itemDesc || "Exclusive tactical DLC and cosmetics pack.",
        shortDescription: itemShortDesc || itemDesc.slice(0, 100),
        imageUrl: itemImageUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      },
      {
        onSuccess: () => {
          showToast({
            title: "🎒 Item Added to Vault",
            description: `${itemName} is now live in the Store.`,
            type: "success",
          });
          setDeployItemOpen(false);
          setItemName("");
          setItemSlug("");
          setItemDesc("");
          setItemImageUrl("");
          refetchItems();
        },
        onError: (err: any) => {
          showToast({ title: "Deployment Error", description: err.message, type: "error" });
        },
      },
    );
  };

  const handleOpenEditItem = (item: any) => {
    setEditingItem({ ...item });
  };

  const handleSaveEditItem = () => {
    if (!editingItem) return;

    updateItemMutation.mutate(
      {
        id: editingItem.itemId,
        data: {
          name: editingItem.name,
          category: editingItem.category,
          gameId: editingItem.gameId || null,
          price: Number(editingItem.price) || 0,
          originalPrice: editingItem.originalPrice ? Number(editingItem.originalPrice) : null,
          rarity: editingItem.rarity,
          imageUrl: editingItem.imageUrl,
          description: editingItem.description,
          shortDescription: editingItem.shortDescription,
        },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Store Item Updated",
            description: `${editingItem.name} updated successfully.`,
            type: "success",
          });
          setEditingItem(null);
          refetchItems();
        },
        onError: (err: any) => {
          showToast({ title: "Update Error", description: err.message, type: "error" });
        },
      },
    );
  };

  const handleDeleteItem = (item: any) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    deleteItemMutation.mutate(item.itemId, {
      onSuccess: () => {
        showToast({
          title: "Item Deleted",
          description: `${item.name} removed from store vault.`,
          type: "info",
        });
        refetchItems();
      },
      onError: (err: any) => {
        showToast({ title: "Deletion Error", description: err.message, type: "error" });
      },
    });
  };

  // --- Handlers: Achievement CRUD ---
  const handleCreateAchievement = () => {
    if (!achGameId || !achTitle.trim()) {
      showToast({ title: "Validation Error", description: "Select a game and enter an accolade title.", type: "error" });
      return;
    }

    createAchMutation.mutate(
      {
        gameId: achGameId,
        title: achTitle,
        description: achDesc || "Tactical milestone reached.",
        points: Number(achPoints) || 50,
        rarity: achRarity,
        iconUrl: achIconUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=400&auto=format&fit=crop",
      },
      {
        onSuccess: () => {
          showToast({
            title: "🏆 Accolade Registered",
            description: `${achTitle} added to honors system.`,
            type: "success",
          });
          setCreateAchOpen(false);
          setAchTitle("");
          setAchDesc("");
          setAchIconUrl("");
          refetchAchs();
        },
        onError: (err: any) => {
          showToast({ title: "Error", description: err.message, type: "error" });
        },
      },
    );
  };

  const handleOpenEditAch = (ach: any) => {
    setEditingAch({ ...ach });
  };

  const handleSaveEditAch = () => {
    if (!editingAch) return;

    updateAchMutation.mutate(
      {
        id: editingAch.achievementId,
        data: {
          title: editingAch.title,
          description: editingAch.description,
          points: Number(editingAch.points) || 50,
          rarity: editingAch.rarity,
          iconUrl: editingAch.iconUrl,
        },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Accolade Updated",
            description: `${editingAch.title} updated.`,
            type: "success",
          });
          setEditingAch(null);
          refetchAchs();
        },
        onError: (err: any) => {
          showToast({ title: "Update Error", description: err.message, type: "error" });
        },
      },
    );
  };

  const handleDeleteAch = (ach: any) => {
    if (!confirm(`Are you sure you want to delete accolade "${ach.title}"?`)) return;

    deleteAchMutation.mutate(ach.achievementId, {
      onSuccess: () => {
        showToast({
          title: "Accolade Deleted",
          description: `${ach.title} removed from game rewards.`,
          type: "info",
        });
        refetchAchs();
      },
      onError: (err: any) => {
        showToast({ title: "Deletion Error", description: err.message, type: "error" });
      },
    });
  };

  // --- Handlers: Broadcast ---
  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      showToast({ title: "Validation Error", description: "Title and message body are required.", type: "error" });
      return;
    }

    broadcastMutation.mutate(
      {
        title: broadcastTitle,
        body: broadcastBody,
        actionUrl: broadcastActionUrl,
        actionLabel: broadcastActionLabel,
      },
      {
        onSuccess: (resData: any) => {
          showToast({
            title: "⚡ Global Bulletin Dispatched",
            description: `Transmitted to ${resData.recipientCount || "all"} operator inboxes.`,
            type: "success",
          });
          setBroadcastTitle("");
          setBroadcastBody("");
        },
        onError: (err: any) => {
          showToast({ title: "Broadcast Failed", description: err.message, type: "error" });
        },
      },
    );
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <IconShield className="size-4 text-cyan-400" />
            <span>PLATFORM OVERSEER // ROOT CLEARANCE ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-foreground">
            Platform Management Center
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Oversee telemetry, games, store items & DLCs, accolades, and global operator comms.
          </p>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setDeployGameOpen(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] h-10"
          >
            <IconPlus className="size-4 mr-1.5" />
            Deploy Game
          </Button>

          <Button
            onClick={() => setDeployItemOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] h-10"
          >
            <IconPackage className="size-4 mr-1.5" />
            Add Store Item
          </Button>

          <Button
            onClick={() => setCreateAchOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] h-10"
          >
            <IconTrophy className="size-4 mr-1.5" />
            Add Accolade
          </Button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5">
        {[
          { id: "overview", label: "Overview & Telemetry", icon: IconBuildingStore },
          { id: "games", label: "Games Deployed", icon: IconDeviceGamepad2 },
          { id: "items", label: "Store Items & DLCs", icon: IconPackage },
          { id: "achievements", label: "Accolades Engine", icon: IconTrophy },
          { id: "broadcast", label: "System Broadcaster", icon: IconSpeakerphone },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono transition-all ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="size-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <IconCoin className="size-3.5 text-emerald-400" />
                Gross Revenue
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {formatRawAmount(stats.totalRevenue)}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <IconBuildingStore className="size-3.5 text-cyan-400" />
                Total Orders
              </div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {stats.totalOrders}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <IconUsers className="size-3.5 text-blue-400" />
                Operators
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {stats.totalUsers}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <IconDeviceGamepad2 className="size-3.5 text-purple-400" />
                Games
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {stats.totalGames}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <IconPackage className="size-3.5 text-amber-400" />
                Store Items
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {stats.totalItems || items.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-1">
              <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                <IconTrophy className="size-3.5 text-yellow-400" />
                Accolades
              </div>
              <div className="text-xl font-bold font-mono text-yellow-400">
                {stats.totalAchievements || achievements.length}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-white/10 bg-card/60 p-6 space-y-4">
            <h3 className="font-bold text-base text-foreground font-brand flex items-center gap-2">
              <IconBuildingStore className="size-4 text-cyan-400" />
              Live Purchases & Transactions Stream
            </h3>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-muted-foreground font-mono py-4 text-center">No orders recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="pb-2 px-3">Order Ref</th>
                      <th className="pb-2 px-3">Customer</th>
                      <th className="pb-2 px-3">Item / Game</th>
                      <th className="pb-2 px-3">Amount</th>
                      <th className="pb-2 px-3">Method</th>
                      <th className="pb-2 px-3">Status</th>
                      <th className="pb-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentTransactions.map((tx: any) => (
                      <tr key={tx.transactionId} className="hover:bg-white/5">
                        <td className="py-2.5 px-3 text-muted-foreground truncate max-w-28">
                          {tx.transactionId.substring(0, 8)}...
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">
                          {tx.username ? `@${tx.username}` : tx.userEmail}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-400 font-bold">
                          {tx.gameTitle || tx.itemName || "Store Purchase"}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold font-mono">
                          {formatRawAmount(tx.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="success" className="text-[10px] py-0 px-1.5">
                            {tx.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GAMES DEPLOYED (ADD, EDIT, DELETE) */}
      {activeTab === "games" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground font-brand">
              Deployed Titles Catalogue ({games.length})
            </h3>
            <Button
              onClick={() => setDeployGameOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-mono"
            >
              <IconPlus className="size-4 mr-1.5" />
              Deploy New Game
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game: any) => (
              <div
                key={game.gameId}
                className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 border border-white/10">
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

                  <h4 className="font-bold text-sm text-foreground truncate">
                    {game.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mt-1">
                    <span className="text-cyan-400 font-bold">
                      {formatPrice(game.price)}
                    </span>
                    <span>{game.downloadSize || "12 GB"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-muted-foreground truncate flex-1">
                    {game.developer}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditGame(game)}
                      className="border-white/10 hover:bg-white/10 text-xs font-mono h-7 px-2"
                    >
                      <IconEdit className="size-3.5 mr-1 text-cyan-400" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGame(game)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-mono h-7 px-2"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STORE ITEMS & DLC (ADD, EDIT, DELETE) */}
      {activeTab === "items" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground font-brand">
              Store Items, DLCs & Packs ({items.length})
            </h3>
            <Button
              onClick={() => setDeployItemOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-mono"
            >
              <IconPlus className="size-4 mr-1.5" />
              Add Store Item
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/30 p-12 text-center space-y-3">
              <IconPackage className="size-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-mono">No items deployed yet in the vault.</p>
              <Button onClick={() => setDeployItemOpen(true)} className="bg-purple-600 text-xs font-mono">
                Deploy First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item: any) => (
                <div
                  key={item.itemId}
                  className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 border border-white/10">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge variant="outline" className="text-[10px] bg-black/70 uppercase font-mono text-purple-300">
                          {item.rarity}
                        </Badge>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-foreground truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mt-1">
                      <span className="text-purple-400 font-bold font-mono">
                        {formatPrice(item.price)}
                      </span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground truncate flex-1">
                      {item.gameTitle || "Platform Item"}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditItem(item)}
                        className="border-white/10 hover:bg-white/10 text-xs font-mono h-7 px-2"
                      >
                        <IconEdit className="size-3.5 mr-1 text-purple-400" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item)}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-mono h-7 px-2"
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACCOLADES ENGINE (ADD, EDIT, DELETE) */}
      {activeTab === "achievements" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-foreground font-brand">
                Accolades & Achievements Registry ({achievements.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage tactical milestones, XP rewards, and custom badges.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedAchFilterGame}
                onChange={(e) => setSelectedAchFilterGame(e.target.value)}
                className="h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono"
              >
                <option value="all">All Game Accolades</option>
                {games.map((g: any) => (
                  <option key={g.gameId} value={g.gameId}>{g.title}</option>
                ))}
              </select>

              <Button
                onClick={() => setCreateAchOpen(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-mono font-bold"
              >
                <IconPlus className="size-4 mr-1.5" />
                Register Accolade
              </Button>
            </div>
          </div>

          {achLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-card/40 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : achievements.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-card/30 p-12 text-center space-y-3">
              <IconTrophy className="size-8 mx-auto text-amber-400" />
              <h4 className="font-bold text-sm text-foreground">No Accolades Found</h4>
              <p className="text-xs text-muted-foreground">Register an accolade to reward operators with XP.</p>
              <Button onClick={() => setCreateAchOpen(true)} className="bg-amber-600 text-xs font-mono">
                Register First Accolade
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((ach: any) => (
                <div
                  key={ach.achievementId}
                  className="rounded-2xl border border-white/10 bg-card/60 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative size-12 rounded-xl overflow-hidden border border-white/15 bg-black/40 shrink-0">
                      <Image
                        src={ach.iconUrl}
                        alt={ach.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getRarityBadgeVariant(ach.rarity) as any}
                          className="text-[10px] uppercase py-0 px-1.5 font-mono"
                        >
                          {ach.rarity}
                        </Badge>
                        <span className="text-[11px] font-mono text-amber-400 font-bold">
                          +{ach.points} XP
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground truncate mt-1">
                        {ach.title}
                      </h4>
                      {ach.gameTitle && (
                        <p className="text-[11px] text-cyan-400 font-mono truncate">
                          {ach.gameTitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditAch(ach)}
                      className="border-white/10 hover:bg-white/10 text-xs font-mono h-7 px-2"
                    >
                      <IconEdit className="size-3.5 mr-1 text-amber-400" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAch(ach)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-mono h-7 px-2"
                    >
                      <IconTrash className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SYSTEM BROADCASTER */}
      {activeTab === "broadcast" && (
        <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl">
          <h3 className="font-bold text-lg text-foreground font-brand">
            High Command Global Broadcaster
          </h3>

          <div className="rounded-2xl border border-white/10 bg-card/60 p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Bulletin Title</Label>
              <Input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="⚡ Major Platform Upgrade Deployed"
                className="bg-white/5 border-white/15 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono uppercase text-muted-foreground">Announcement Body</Label>
              <textarea
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="All operators are advised of newly deployed titles and hardware updates..."
                rows={4}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-3 text-xs text-foreground focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Action URL</Label>
                <Input
                  value={broadcastActionUrl}
                  onChange={(e) => setBroadcastActionUrl(e.target.value)}
                  placeholder="/store"
                  className="bg-white/5 border-white/15 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-mono uppercase text-muted-foreground">Action Button Label</Label>
                <Input
                  value={broadcastActionLabel}
                  onChange={(e) => setBroadcastActionLabel(e.target.value)}
                  placeholder="View Store"
                  className="bg-white/5 border-white/15 text-xs font-mono"
                />
              </div>
            </div>

            <Button
              onClick={handleBroadcast}
              disabled={broadcastMutation.isPending}
              className="w-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-mono text-xs font-bold h-11 shadow-[0_0_25px_rgba(244,63,94,0.3)]"
            >
              {broadcastMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
                  Transmitting to Network...
                </>
              ) : (
                <>
                  <IconSpeakerphone className="size-4 mr-2" />
                  Transmit Global Announcement
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: DEPLOY NEW GAME                                  */}
      {/* ========================================================= */}
      <Dialog open={deployGameOpen} onOpenChange={setDeployGameOpen}>
        <DialogContent className="max-w-xl border-white/15 bg-background/95 p-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-brand">Deploy New Game Title</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a full title in the ForkPlay store catalogue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Title</Label>
                <Input
                  value={gameTitle}
                  onChange={(e) => handleGameTitleChange(e.target.value)}
                  placeholder="Cyberpunk 2088"
                  className="bg-white/5 border-white/15 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Genre</Label>
                <Input
                  value={gameGenre}
                  onChange={(e) => setGameGenre(e.target.value)}
                  placeholder="Action RPG"
                  className="bg-white/5 border-white/15 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Price ({APP_CURRENCY_SYMBOL})</Label>
                <Input
                  value={gamePrice}
                  onChange={(e) => setGamePrice(e.target.value)}
                  placeholder="999.00"
                  className="bg-white/5 border-white/15 font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Original Price ({APP_CURRENCY_SYMBOL})</Label>
                <Input
                  value={gameOriginalPrice}
                  onChange={(e) => setGameOriginalPrice(e.target.value)}
                  placeholder="1499.00"
                  className="bg-white/5 border-white/15 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Cover Artwork URL</Label>
              <div className="flex gap-2">
                <Input
                  value={gameCoverUrl}
                  onChange={(e) => setGameCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/15 text-xs flex-1"
                />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-foreground border border-white/10">
                    <IconUpload className="size-3.5 mr-1" /> Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setGameCoverUrl, "covers")} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Description</Label>
              <textarea
                value={gameDesc}
                onChange={(e) => setGameDesc(e.target.value)}
                placeholder="Tactical description of gameplay and storyline..."
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeployGameOpen(false)}>Cancel</Button>
            <Button onClick={handleDeployGame} disabled={createGameMutation.isPending} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold">
              {createGameMutation.isPending ? "Deploying..." : "Deploy Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2: EDIT GAME                                        */}
      {/* ========================================================= */}
      {editingGame && (
        <Dialog open={Boolean(editingGame)} onOpenChange={() => setEditingGame(null)}>
          <DialogContent className="max-w-xl border-white/15 bg-background/95 p-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-brand">Edit Game: {editingGame.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update pricing, metadata, or media assets.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Title</Label>
                  <Input
                    value={editingGame.title}
                    onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Genre</Label>
                  <Input
                    value={editingGame.genre}
                    onChange={(e) => setEditingGame({ ...editingGame, genre: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Price ({APP_CURRENCY_SYMBOL})</Label>
                  <Input
                    value={editingGame.price}
                    onChange={(e) => setEditingGame({ ...editingGame, price: e.target.value })}
                    className="bg-white/5 border-white/15 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Original Price ({APP_CURRENCY_SYMBOL})</Label>
                  <Input
                    value={editingGame.originalPrice || ""}
                    onChange={(e) => setEditingGame({ ...editingGame, originalPrice: e.target.value })}
                    className="bg-white/5 border-white/15 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Cover Artwork URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingGame.coverUrl}
                    onChange={(e) => setEditingGame({ ...editingGame, coverUrl: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs flex-1"
                  />
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-foreground border border-white/10">
                      <IconUpload className="size-3.5 mr-1" /> Upload
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setEditingGame({ ...editingGame, coverUrl: url }), "covers")} />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Description</Label>
                <textarea
                  value={editingGame.description || ""}
                  onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGame(null)}>Cancel</Button>
              <Button onClick={handleSaveEditGame} disabled={updateGameMutation.isPending} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold">
                {updateGameMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DEPLOY NEW STORE ITEM                            */}
      {/* ========================================================= */}
      <Dialog open={deployItemOpen} onOpenChange={setDeployItemOpen}>
        <DialogContent className="max-w-xl border-white/15 bg-background/95 p-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-brand">Add New Store Item / DLC</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add expansion DLCs, weapon skins, profile themes, or credit packs to the Vault.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Item Name</Label>
                <Input
                  value={itemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  placeholder="Nightfall Expansion Pack"
                  className="bg-white/5 border-white/15 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Category</Label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="dlc">DLC & Expansion</option>
                  <option value="cosmetic">Skin / Cosmetic</option>
                  <option value="pass">Profile Theme & Pass</option>
                  <option value="currency">Credit Pack</option>
                  <option value="consumable">Consumable</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Associated Game (Optional)</Label>
                <select
                  value={itemGameId}
                  onChange={(e) => setItemGameId(e.target.value)}
                  className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="">None (Platform-wide Item)</option>
                  {games.map((g: any) => (
                    <option key={g.gameId} value={g.gameId}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Rarity Tier</Label>
                <select
                  value={itemRarity}
                  onChange={(e) => setItemRarity(e.target.value)}
                  className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Price ({APP_CURRENCY_SYMBOL})</Label>
                <Input
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="349.00"
                  className="bg-white/5 border-white/15 font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Original Price ({APP_CURRENCY_SYMBOL})</Label>
                <Input
                  value={itemOriginalPrice}
                  onChange={(e) => setItemOriginalPrice(e.target.value)}
                  placeholder="499.00"
                  className="bg-white/5 border-white/15 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Item Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={itemImageUrl}
                  onChange={(e) => setItemImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/15 text-xs flex-1"
                />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-foreground border border-white/10">
                    <IconUpload className="size-3.5 mr-1" /> Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setItemImageUrl, "items")} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Description</Label>
              <textarea
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Details on what this item or DLC delivers..."
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeployItemOpen(false)}>Cancel</Button>
            <Button onClick={handleDeployItem} disabled={createItemMutation.isPending} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold">
              {createItemMutation.isPending ? "Adding..." : "Deploy Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 4: EDIT STORE ITEM                                  */}
      {/* ========================================================= */}
      {editingItem && (
        <Dialog open={Boolean(editingItem)} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-xl border-white/15 bg-background/95 p-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-brand">Edit Item: {editingItem.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Item Name</Label>
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Category</Label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono"
                  >
                    <option value="dlc">DLC & Expansion</option>
                    <option value="cosmetic">Skin / Cosmetic</option>
                    <option value="pass">Profile Theme & Pass</option>
                    <option value="currency">Credit Pack</option>
                    <option value="consumable">Consumable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Price ({APP_CURRENCY_SYMBOL})</Label>
                  <Input
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="bg-white/5 border-white/15 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Rarity Tier</Label>
                  <select
                    value={editingItem.rarity}
                    onChange={(e) => setEditingItem({ ...editingItem, rarity: e.target.value })}
                    className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono"
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs flex-1"
                  />
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-foreground border border-white/10">
                      <IconUpload className="size-3.5 mr-1" /> Upload
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setEditingItem({ ...editingItem, imageUrl: url }), "items")} />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Description</Label>
                <textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-xs text-foreground font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSaveEditItem} disabled={updateItemMutation.isPending} className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold">
                {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: REGISTER NEW ACHIEVEMENT                         */}
      {/* ========================================================= */}
      <Dialog open={createAchOpen} onOpenChange={setCreateAchOpen}>
        <DialogContent className="max-w-lg border-white/15 bg-background/95 p-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-brand">Register New Accolade</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add milestone challenges and XP rewards for games.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Associated Game Title</Label>
              <select
                value={achGameId}
                onChange={(e) => setAchGameId(e.target.value)}
                className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="">Select a game...</option>
                {games.map((g: any) => (
                  <option key={g.gameId} value={g.gameId}>{g.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Accolade Title</Label>
                <Input
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="Apex Predator"
                  className="bg-white/5 border-white/15 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">XP Reward</Label>
                <Input
                  value={achPoints}
                  onChange={(e) => setAchPoints(e.target.value)}
                  placeholder="100"
                  className="bg-white/5 border-white/15 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Rarity Tier</Label>
              <select
                value={achRarity}
                onChange={(e) => setAchRarity(e.target.value)}
                className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono focus:outline-none focus:border-amber-500"
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Icon Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={achIconUrl}
                  onChange={(e) => setAchIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-white/5 border-white/15 text-xs flex-1"
                />
                <label className="cursor-pointer">
                  <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-foreground border border-white/10">
                    <IconUpload className="size-3.5 mr-1" /> Upload
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, setAchIconUrl, "achievements")} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase font-mono text-muted-foreground">Description</Label>
              <textarea
                value={achDesc}
                onChange={(e) => setAchDesc(e.target.value)}
                placeholder="Eliminate 100 opposing operators without taking shield damage."
                rows={3}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAchOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAchievement} disabled={createAchMutation.isPending} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold">
              {createAchMutation.isPending ? "Registering..." : "Add Accolade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 6: EDIT ACHIEVEMENT                                 */}
      {/* ========================================================= */}
      {editingAch && (
        <Dialog open={Boolean(editingAch)} onOpenChange={() => setEditingAch(null)}>
          <DialogContent className="max-w-lg border-white/15 bg-background/95 p-6 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-brand">Edit Accolade: {editingAch.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">Title</Label>
                  <Input
                    value={editingAch.title}
                    onChange={(e) => setEditingAch({ ...editingAch, title: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-mono text-muted-foreground">XP Reward</Label>
                  <Input
                    value={editingAch.points}
                    onChange={(e) => setEditingAch({ ...editingAch, points: e.target.value })}
                    className="bg-white/5 border-white/15 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Rarity Tier</Label>
                <select
                  value={editingAch.rarity}
                  onChange={(e) => setEditingAch({ ...editingAch, rarity: e.target.value })}
                  className="w-full h-9 rounded-xl bg-card border border-white/15 px-3 text-xs text-foreground font-mono"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Icon Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={editingAch.iconUrl}
                    onChange={(e) => setEditingAch({ ...editingAch, iconUrl: e.target.value })}
                    className="bg-white/5 border-white/15 text-xs flex-1"
                  />
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-foreground border border-white/10">
                      <IconUpload className="size-3.5 mr-1" /> Upload
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setEditingAch({ ...editingAch, iconUrl: url }), "achievements")} />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-muted-foreground">Description</Label>
                <textarea
                  value={editingAch.description || ""}
                  onChange={(e) => setEditingAch({ ...editingAch, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/15 p-2.5 text-xs text-foreground font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingAch(null)}>Cancel</Button>
              <Button onClick={handleSaveEditAch} disabled={updateAchMutation.isPending} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold">
                {updateAchMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
