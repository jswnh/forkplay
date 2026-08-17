import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface AppLogoProps
  extends Omit<ImageProps, "src" | "alt" | "width" | "height"> {
  /**
   * The size (width and height) in pixels. Defaults to 24 (icon size).
   */
  size?: number;
  /**
   * Optional custom width in pixels. Overrides `size`.
   */
  width?: number;
  /**
   * Optional custom height in pixels. Overrides `size`.
   */
  height?: number;
  /**
   * Alternative text for the logo.
   */
  alt?: string;
  /**
   * Additional CSS classes.
   */
  className?: string;
}

export function AppLogo({
  size = 24,
  width,
  height,
  alt = "Forkplay Logo",
  className,
  ...props
}: AppLogoProps) {
  const finalWidth = width ?? size;
  const finalHeight = height ?? size;

  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      className={cn("inline-block shrink-0 select-none object-contain", className)}
      {...props}
    />
  );
}

export default AppLogo;
