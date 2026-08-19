"use client";

import Link from "next/link";
import {
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconSettings,
  IconTrophy,
  IconSparkles,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function NavUser({
  onOpenSettings,
}: {
  onOpenSettings?: () => void;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const res = await fetch("/api/user/session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const user = data?.user;
  const stats = data?.stats;

  const displayName = user?.displayName || user?.username || user?.email?.split("@")[0] || "Operator";
  const handle = user?.username ? `@${user.username}` : user?.email;
  const avatarUrl = user?.avatarUrl || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/sign-in");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-white/10 bg-white/5 rounded-xl transition-all"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg border border-cyan-500/40">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="rounded-lg bg-cyan-950 text-cyan-300 font-mono text-xs">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 size-2.5 rounded-full bg-emerald-500 border border-background" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground font-mono">
                    {handle}
                  </span>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
                  LV.{user?.level ?? 1}
                </div>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border border-white/15 bg-card/95 backdrop-blur-xl shadow-2xl p-1.5"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                  <Avatar className="h-9 w-9 rounded-lg border border-cyan-500/40">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="rounded-lg bg-cyan-950 text-cyan-300 font-mono text-xs">
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-foreground">
                        {displayName}
                      </span>
                    </div>
                    <span className="truncate text-xs text-muted-foreground font-mono">
                      {handle}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link href="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                    <IconUserCircle className="size-4 text-cyan-400" />
                    <span>View Profile</span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/achievements" className="flex items-center gap-2 w-full cursor-pointer">
                    <IconTrophy className="size-4 text-amber-400" />
                    <span>Achievements ({stats?.achievementsCount ?? 0})</span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/inbox" className="flex items-center gap-2 w-full cursor-pointer">
                    <IconNotification className="size-4 text-purple-400" />
                    <span>Inbox</span>
                    {stats?.unreadInboxCount ? (
                      <span className="ml-auto text-[10px] font-mono font-bold bg-cyan-500 text-black px-1.5 py-0.2 rounded-full">
                        {stats.unreadInboxCount}
                      </span>
                    ) : null}
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/settings" className="flex items-center gap-2 w-full cursor-pointer">
                    <IconSettings className="size-4 text-cyan-400" />
                    <span>Platform Settings</span>
                  </Link>
                }
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-400 focus:text-red-300 focus:bg-red-950/40 flex items-center gap-2 cursor-pointer"
            >
              <IconLogout className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
