import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";
import { cn } from "@/lib/utils";
import { russoOne, minecrafter } from "./fonts";

export const metadata: Metadata = {
  title: "Forkplay",
  description: "Game account manager and codebase launcher",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        russoOne.variable,
        minecrafter.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
