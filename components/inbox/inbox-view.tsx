"use client";

import * as React from "react";
import {
  IconMail,
  IconMailOpened,
  IconSearch,
  IconCheck,
  IconChecks,
  IconRefresh,
  IconTrash,
  IconArchive,
  IconArrowLeft,
  IconFlag,
  IconSend,
  IconSparkles,
  IconBell,
  IconDeviceGamepad2,
  IconTrophy,
  IconBuildingStore,
  IconUser,
  IconSpeakerphone,
  IconDotsVertical,
  IconExternalLink,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useInboxMessages,
  useMarkMessageRead,
  useMarkAllMessagesRead,
  useArchiveMessage,
  useDeleteMessage,
} from "@/hooks/use-inbox";
import { useToast } from "@/providers/toast-provider";
import { ComposeMessageModal } from "@/components/modals/compose-message-modal";

const CATEGORIES = [
  { id: "all", label: "All", icon: IconMail },
  { id: "unread", label: "Unread", icon: IconBell },
  { id: "mentions", label: "Mentions", icon: IconUser },
  { id: "system", label: "System", icon: IconSparkles },
  { id: "game", label: "Game Updates", icon: IconDeviceGamepad2 },
  { id: "social", label: "Social", icon: IconUser },
  { id: "achievement", label: "Achievements", icon: IconTrophy },
  { id: "store", label: "Store Receipts", icon: IconBuildingStore },
  { id: "announcement", label: "Announcements", icon: IconSpeakerphone },
];

function formatRelativeTime(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSec < 60) return "Just now";
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 172800) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function InboxView() {
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedMessageId, setSelectedMessageId] = React.useState<string | null>(null);
  const [composeOpen, setComposeOpen] = React.useState(false);

  const { showToast } = useToast();

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useInboxMessages({
    category: selectedCategory,
    search: searchQuery,
  });

  const markReadMutation = useMarkMessageRead();
  const markAllReadMutation = useMarkAllMessagesRead();
  const archiveMutation = useArchiveMessage();
  const deleteMutation = useDeleteMessage();

  const messages = data?.messages || [];
  const unreadCount = data?.unreadCount ?? 0;

  // Auto-select first message on desktop if none selected
  const activeMessage = messages.find((m: any) => m.messageId === selectedMessageId) || messages[0] || null;

  // Handle selecting a message and marking as read
  const handleSelectMessage = (msg: any) => {
    setSelectedMessageId(msg.messageId);
    if (!msg.isRead) {
      markReadMutation.mutate({ messageId: msg.messageId, isRead: true });
    }
  };

  const handleToggleRead = (e: React.MouseEvent, msg: any) => {
    e.stopPropagation();
    markReadMutation.mutate(
      { messageId: msg.messageId, isRead: !msg.isRead },
      {
        onSuccess: () => {
          showToast({
            title: msg.isRead ? "Marked as Unread" : "Marked as Read",
            type: "info",
          });
        },
      },
    );
  };

  const handleArchive = (e: React.MouseEvent, msg: any) => {
    e.stopPropagation();
    archiveMutation.mutate(
      { messageId: msg.messageId, isArchived: true },
      {
        onSuccess: () => {
          showToast({
            title: "Message Archived",
            description: "Transmission moved to archive vault.",
            type: "info",
          });
        },
      },
    );
  };

  const handleDelete = (e: React.MouseEvent, msg: any) => {
    e.stopPropagation();
    deleteMutation.mutate(msg.messageId, {
      onSuccess: () => {
        showToast({
          title: "Message Deleted",
          description: "Transmission purged from logs.",
          type: "info",
        });
        if (selectedMessageId === msg.messageId) {
          setSelectedMessageId(null);
        }
      },
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        showToast({
          title: "All Transmissions Read",
          description: "Unread comms queue cleared.",
          type: "success",
        });
      },
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "achievement":
        return "legendary";
      case "game":
        return "cyber";
      case "store":
        return "epic";
      case "social":
        return "rare";
      case "system":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-1rem)] max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 shrink-0">
        <div className="flex items-start gap-3.5">
          <SidebarTrigger className="mt-1 text-cyan-400 hover:text-cyan-300 hover:bg-white/10 size-9 rounded-xl border border-white/10 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight text-foreground">
                Comms & Inbox
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-cyan-500 text-black text-xs font-mono font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-mono">
              Encrypted transmission logs, achievements, and network broadcasts.
            </p>
          </div>
        </div>

        {/* Header Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="border-white/10 hover:bg-white/10 text-xs font-mono"
          >
            <IconChecks className="size-3.5 mr-1.5 text-cyan-400" />
            Mark All Read
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="border-white/10 hover:bg-white/10 size-8 shrink-0"
            title="Refresh Inbox"
          >
            <IconRefresh className="size-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={() => setComposeOpen(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <IconSend className="size-3.5 mr-1.5" />
            Compose
          </Button>
        </div>
      </div>

      {/* Main Split-Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Categories + Message List */}
        <div
          className={`lg:col-span-5 flex flex-col space-y-4 h-full min-h-0 ${
            selectedMessageId ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search Box */}
          <div className="relative shrink-0">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, title, or keywords..."
              className="pl-9 bg-card/60 border-white/10 text-xs font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground hover:text-foreground"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  <IconComp className="size-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Message List Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 rounded-xl">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-white/5 bg-card/40 space-y-2"
                  >
                    <Skeleton className="h-4 w-1/3 bg-white/5" />
                    <Skeleton className="h-4 w-3/4 bg-white/5" />
                    <Skeleton className="h-3 w-1/2 bg-white/5" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-red-400 font-mono text-xs border border-red-500/20 rounded-xl bg-red-500/5">
                Error retrieving comms queue.
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-3 border border-white/5 rounded-xl bg-card/30">
                <IconMailOpened className="size-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs font-mono">No comms in this channel.</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isSelected = activeMessage?.messageId === msg.messageId;
                return (
                  <div
                    key={msg.messageId}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                        : msg.isRead
                        ? "border-white/5 bg-card/40 hover:border-white/15 hover:bg-card/70"
                        : "border-cyan-500/30 bg-card/90 font-medium shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                    }`}
                  >
                    {/* Sender Avatar / Icon */}
                    <div className="relative size-9 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-muted">
                      {msg.senderAvatar ? (
                        <Image
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-cyan-950 text-cyan-400 font-mono font-bold text-xs">
                          {msg.senderName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {!msg.isRead && (
                        <span className="absolute top-0 right-0 size-2 rounded-full bg-cyan-400 ring-2 ring-background animate-pulse" />
                      )}
                    </div>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant={getTypeBadgeVariant(msg.type) as any}
                          className="text-[9px] py-0 px-1 font-mono uppercase"
                        >
                          {msg.type}
                        </Badge>
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {msg.title}
                        </h4>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1 leading-relaxed">
                        {msg.body}
                      </p>
                    </div>

                    {/* Quick Item Actions */}
                    <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleRead(e, msg)}
                        title={msg.isRead ? "Mark unread" : "Mark read"}
                        className="p-1 text-muted-foreground hover:text-cyan-400 transition-colors"
                      >
                        {msg.isRead ? (
                          <IconMail className="size-3.5" />
                        ) : (
                          <IconCheck className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, msg)}
                        title="Delete transmission"
                        className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <IconTrash className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Message Detail View */}
        <div
          className={`lg:col-span-7 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 flex flex-col justify-between overflow-y-auto h-full min-h-0 ${
            !selectedMessageId ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeMessage ? (
            <div className="space-y-6">
              {/* Back button on mobile */}
              <div className="flex items-center justify-between lg:hidden border-b border-white/5 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessageId(null)}
                  className="text-xs font-mono text-cyan-400 -ml-2"
                >
                  <IconArrowLeft className="size-4 mr-1" />
                  Back to Queue
                </Button>
              </div>

              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="relative size-12 rounded-xl overflow-hidden border border-cyan-500/30 shrink-0">
                    {activeMessage.senderAvatar ? (
                      <Image
                        src={activeMessage.senderAvatar}
                        alt={activeMessage.senderName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-cyan-950 text-cyan-400 font-mono font-bold text-sm">
                        {activeMessage.senderName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">
                        {activeMessage.senderName}
                      </h3>
                      <Badge variant={getTypeBadgeVariant(activeMessage.type) as any}>
                        {activeMessage.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      Received: {new Date(activeMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Detail action buttons */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleToggleRead(e, activeMessage)}
                    className="border-white/10 hover:bg-white/10 text-xs font-mono"
                  >
                    {activeMessage.isRead ? "Mark Unread" : "Mark Read"}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => handleArchive(e, activeMessage)}
                    className="border-white/10 hover:bg-white/10 size-8"
                    title="Archive"
                  >
                    <IconArchive className="size-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => handleDelete(e, activeMessage)}
                    className="border-white/10 hover:bg-red-950/40 text-red-400 hover:text-red-300 size-8"
                    title="Delete"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Subject Title */}
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-foreground leading-snug">
                {activeMessage.title}
              </h2>

              {/* Message Body Content */}
              <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed font-sans space-y-4">
                <p className="whitespace-pre-line">{activeMessage.body}</p>
              </div>

              {/* Associated Action Link (if metadata contains actionUrl) */}
              {activeMessage.metadata?.actionUrl && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs font-mono text-cyan-300">
                    {activeMessage.metadata.gameTitle ? (
                      <span>Associated Asset: {activeMessage.metadata.gameTitle}</span>
                    ) : (
                      <span>Target Directive Attached</span>
                    )}
                  </div>
                  <Link href={activeMessage.metadata.actionUrl}>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    >
                      <span>{activeMessage.metadata.actionLabel || "Execute Action"}</span>
                      <IconExternalLink className="size-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground p-12">
              <IconMail className="size-12 text-white/20" />
              <p className="font-mono text-sm">Select a transmission from the log to view dossier.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeMessageModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
      />
    </div>
  );
}
