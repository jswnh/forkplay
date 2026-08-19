"use client";

import * as React from "react";
import Link from "next/link";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
    onClick?: () => void;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const IconComp = item.icon;
            return (
              <SidebarMenuItem key={item.title}>
                {item.onClick ? (
                  <SidebarMenuButton
                    onClick={item.onClick}
                    className="cursor-pointer"
                  >
                    <IconComp className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    render={
                      <Link href={item.url}>
                        <IconComp className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
