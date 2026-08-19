"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDeviceGamepad2,
  IconBuildingStore,
  IconTrophy,
  IconMail,
  IconUser,
  IconPlayerPlay,
  IconShield,
  IconSettings,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useUserSession } from "@/hooks/use-user";

export function NavMain({
  onQuickPlay,
}: {
  onQuickPlay?: () => void;
}) {
  const pathname = usePathname();
  const { data: sessionData } = useUserSession();
  const user = sessionData?.user;
  const isAdmin = user?.role === "admin";

  const { data: inboxData } = useQuery({
    queryKey: ["inbox-unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/inbox/unread-count");
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 15000,
  });

  const unreadCount = inboxData?.unreadCount ?? 0;

  const navItems = [
    {
      title: "Games",
      url: "/games",
      icon: IconDeviceGamepad2,
      isActive: pathname === "/games" || pathname === "/" || pathname === "/dashboard",
    },
    {
      title: "Store",
      url: "/store",
      icon: IconBuildingStore,
      isActive: pathname === "/store",
    },
    {
      title: "Achievements",
      url: "/achievements",
      icon: IconTrophy,
      isActive: pathname === "/achievements",
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: IconMail,
      badge: unreadCount > 0 ? unreadCount : undefined,
      isActive: pathname === "/inbox",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: IconUser,
      isActive: pathname === "/profile",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
      isActive: pathname === "/settings",
    },
    ...(isAdmin
      ? [
          {
            title: "Platform Overseer",
            url: "/admin",
            icon: IconShield,
            isActive: pathname === "/admin",
          },
        ]
      : []),
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Quick Play button on top of nav */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onQuickPlay}
              tooltip="Quick Play"
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_15px_rgba(6,182,212,0.25)] duration-200"
            >
              <IconPlayerPlay className="size-4 fill-current shrink-0" />
              <span className="font-semibold text-sm">Quick Play</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Primary nav list */}
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  render={
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className="size-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="ml-auto inline-flex items-center justify-center size-5 rounded-full bg-cyan-500 text-[10px] font-mono font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
