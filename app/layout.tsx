import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";
import { cn } from "@/lib/utils";
import { russoOne, audex } from "./fonts";

export const metadata: Metadata = {
  title: "Forkplay",
  description: "Game account manager and codebase launcher",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        "font-sans",
        russoOne.variable,
        audex.variable,
      )}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
