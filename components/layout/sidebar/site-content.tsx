import * as React from "react";
import {
  SiteHeader,
  type SiteHeaderProps,
  type BreadcrumbItemData,
} from "./site-header";
import { cn } from "@/lib/utils";

export type { BreadcrumbItemData };

export interface SiteContentProps
  extends Omit<React.ComponentProps<"div">, "title"> {
  /**
   * Main page content.
   */
  children?: React.ReactNode;
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
   * Custom action components/buttons rendered in the right-side section of the header.
   */
  actions?: React.ReactNode;
  /**
   * Whether to show the sidebar trigger in the header. Defaults to `true`.
   */
  showSidebarTrigger?: boolean;
  /**
   * Whether to show the separator next to the sidebar trigger in the header. Defaults to `true`.
   */
  showSeparator?: boolean;
  /**
   * Whether to show the theme mode toggle in the header. Defaults to `true`.
   */
  showThemeToggle?: boolean;
  /**
   * Optional custom className for the SiteHeader.
   */
  headerClassName?: string;
  /**
   * Optional custom className for the inner main content wrapper.
   */
  contentClassName?: string;
  /**
   * Additional props to pass directly to SiteHeader.
   */
  headerProps?: Partial<SiteHeaderProps>;
  /**
   * Whether to hide the header completely. Defaults to `false`.
   */
  hideHeader?: boolean;
}

export function SiteContent({
  children,
  title,
  breadcrumbs,
  actions,
  showSidebarTrigger,
  showSeparator,
  showThemeToggle,
  headerClassName,
  contentClassName,
  headerProps,
  hideHeader = false,
  className,
  ...props
}: SiteContentProps) {
  return (
    <div className={cn("flex flex-1 flex-col min-w-0", className)} {...props}>
      {!hideHeader && (
        <SiteHeader
          title={title ?? headerProps?.title}
          breadcrumbs={breadcrumbs ?? headerProps?.breadcrumbs}
          actions={actions ?? headerProps?.actions}
          showSidebarTrigger={showSidebarTrigger ?? headerProps?.showSidebarTrigger}
          showSeparator={showSeparator ?? headerProps?.showSeparator}
          showThemeToggle={showThemeToggle ?? headerProps?.showThemeToggle}
          className={headerClassName ?? headerProps?.className}
          {...headerProps}
        />
      )}
      <div className="flex flex-1 flex-col">
        <div className={cn("flex flex-1 flex-col gap-2 p-4 lg:p-6", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
