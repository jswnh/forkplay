import * as React from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/theme-mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbItemData {
  label: React.ReactNode;
  href?: string;
}

export interface SiteHeaderProps
  extends Omit<React.ComponentProps<"header">, "title"> {
  /**
   * Title text (string) or custom ReactNode. Used if `breadcrumbs` is not provided.
   */
  title?: React.ReactNode;
  /**
   * Breadcrumb items array (e.g. `[{ label: "Dashboard", href: "/dashboard" }, { label: "Games" }]`)
   * or a custom Breadcrumb ReactNode. When provided, replaces the title in the header.
   */
  breadcrumbs?: BreadcrumbItemData[] | React.ReactNode;
  /**
   * Components/buttons to render in the right-side actions area (e.g. action buttons, search, user menu).
   */
  actions?: React.ReactNode;
  /**
   * Whether to show the sidebar trigger button on the left. Defaults to `true`.
   */
  showSidebarTrigger?: boolean;
  /**
   * Whether to show the vertical separator next to the sidebar trigger. Defaults to `true`.
   */
  showSeparator?: boolean;
  /**
   * Whether to show the ModeToggle theme toggle button on the right. Defaults to `true`.
   */
  showThemeToggle?: boolean;
}

function renderBreadcrumbContent(
  breadcrumbs: BreadcrumbItemData[] | React.ReactNode
) {
  if (!breadcrumbs) return null;

  if (Array.isArray(breadcrumbs)) {
    if (breadcrumbs.length === 0) return null;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href && !isLast ? (
                    <BreadcrumbLink
                      render={<Link href={item.href}>{item.label}</Link>}
                    />
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return breadcrumbs;
}

export function SiteHeader({
  title = "Documents",
  breadcrumbs,
  actions,
  showSidebarTrigger = true,
  showSeparator = true,
  showThemeToggle = true,
  className,
  ...props
}: SiteHeaderProps) {
  const hasBreadcrumbs =
    Boolean(breadcrumbs) &&
    (!Array.isArray(breadcrumbs) || breadcrumbs.length > 0);

  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        className
      )}
      {...props}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {showSidebarTrigger && <SidebarTrigger className="-ml-1" />}
        {showSidebarTrigger && showSeparator && (
          <Separator
            orientation="vertical"
            className="mx-2 h-4 data-vertical:self-center"
          />
        )}

        {/* Render Breadcrumbs if provided; otherwise render Title */}
        {hasBreadcrumbs ? (
          renderBreadcrumbContent(breadcrumbs)
        ) : typeof title === "string" ? (
          <h1 className="text-base font-medium truncate">{title}</h1>
        ) : (
          title
        )}

        {/* Right side actions and theme toggle */}
        {(actions || showThemeToggle) && (
          <div className="ml-auto flex items-center gap-2">
            {actions}
            {showThemeToggle && <ModeToggle />}
          </div>
        )}
      </div>
    </header>
  );
}
