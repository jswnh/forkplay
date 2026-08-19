"use client";

import * as React from "react";
import {
  IconSettings,
  IconHelp,
  IconBrandDiscord,
  IconWorld,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import Link from "next/link";
import AppLogo from "@/components/app-logo";
import { GameLauncherModal } from "@/components/modals/game-launcher-modal";
import { SettingsModal } from "@/components/modals/settings-modal";
import { useQuery } from "@tanstack/react-query";

const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME || "ForkPlay";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [quickPlayOpen, setQuickPlayOpen] = React.useState(false);

  const { data: featuredData } = useQuery({
    queryKey: ["featured-game"],
    queryFn: async () => {
      const res = await fetch("/api/games/featured");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const featuredGame = featuredData?.game || {
    gameId: "cyberpunk-2088",
    slug: "cyberpunk-2088",
    title: "Cyberpunk 2088: Neon Genesis",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    genre: "Action RPG",
    rating: 4.9,
  };

  const navSecondary = [
    {
      title: "Settings",
      url: "#settings",
      icon: IconSettings,
      onClick: () => setSettingsOpen(true),
    },
    {
      title: "Network Status",
      url: "#status",
      icon: IconWorld,
    },
  ];

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="border-b border-white/5 pb-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link href="/games" className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0">
                      <AppLogo size={22} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-base font-bold font-brand tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                        {APP_NAME}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase">
                        Command Hub
                      </span>
                    </div>
                  </Link>
                }
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <NavMain onQuickPlay={() => setQuickPlayOpen(true)} />
          <div className="mt-auto px-3 py-2">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                SERVER REGION: AS-EAST
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                Ping: 12ms • All Nodes Operational
              </p>
            </div>
          </div>
          <NavSecondary items={navSecondary} />
        </SidebarContent>

        <SidebarFooter className="border-t border-white/5 pt-3">
          <NavUser onOpenSettings={() => setSettingsOpen(true)} />
        </SidebarFooter>
      </Sidebar>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Quick Play Launcher */}
      <GameLauncherModal
        game={featuredGame}
        isOpen={quickPlayOpen}
        onClose={() => setQuickPlayOpen(false)}
      />
    </>
  );
}
