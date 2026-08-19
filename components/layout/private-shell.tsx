"use client";

import * as React from "react";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UsernameModal } from "@/components/modals/username-modal";
import { useQuery } from "@tanstack/react-query";

export function PrivateShell({ children }: { children: React.ReactNode }) {
  const { data } = useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const res = await fetch("/api/user/session");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const user = data?.user;
  const isMissingUsername = Boolean(user && !user.username);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-background min-h-screen">
        {children}
      </SidebarInset>

      {/* Mandatory Onboarding Modal if username is missing */}
      <UsernameModal isOpen={isMissingUsername} />
    </SidebarProvider>
  );
}
