"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPlayerPlay,
  IconSparkles,
  IconCpu,
  IconTrophy,
  IconMail,
  IconBuildingStore,
  IconShieldCheck,
  IconActivity,
  IconArrowRight,
  IconBrandGithub,
  IconBrandDiscord,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconStarFilled,
  IconChevronRight,
  IconFlame,
  IconCloudUpload,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import AppLogo from "@/components/app-logo";
import { useUserSession } from "@/hooks/use-user";

const SHOWCASE_GAMES = [
  {
    title: "Cyberpunk 2088: Neon Genesis",
    genre: "Action RPG",
    rating: 4.9,
    coverUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    tagline: "Immerse in a cybernetic underworld of neon and rogue androids.",
  },
  {
    title: "Starfall: Rogue Galaxy",
    genre: "Space Sim",
    rating: 4.8,
    coverUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    tagline: "Command your starship fleet across uncharted gravitational anomalies.",
  },
  {
    title: "Chrono Blades: Cyber Awakening",
    genre: "Hack & Slash",
    rating: 4.7,
    coverUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop",
    tagline: "Time-bending melee katana combat against rogue AI syndicates.",
  },
  {
    title: "Neon Overdrive: Velocity 9",
    genre: "Rhythm Runner",
    rating: 4.6,
    coverUrl:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
    tagline: "Synthwave hyper-speed anti-gravity hoverboard racing.",
  },
];

const FEATURES = [
  {
    icon: IconCpu,
    title: "Vulkan RT Engine",
    description:
      "Direct shader pre-compilation, zero stutter, and real-time hardware telemetry benchmarking up to 144 FPS.",
    color: "cyan",
  },
  {
    icon: IconCloudUpload,
    title: "Global Cloud Saves",
    description:
      "Edge-distributed cloud save states, custom banners, and player avatar dossiers synchronized globally with zero latency.",
    color: "blue",
  },
  {
    icon: IconTrophy,
    title: "Trophy Room & XP",
    description:
      "Compete for common, rare, epic, and legendary honors. Track progression and level up your tactical operator profile.",
    color: "amber",
  },
  {
    icon: IconMail,
    title: "Encrypted Comms Hub",
    description:
      "Integrated inbox for real-time tactical updates, achievement alerts, direct squad comms, and store receipts.",
    color: "purple",
  },
  {
    icon: IconBuildingStore,
    title: "Digital Emporium",
    description:
      "Instant game licensing with transparent deals, price tier filtering, and multi-rail sandbox checkout.",
    color: "emerald",
  },
  {
    icon: IconShieldCheck,
    title: "Next-Gen Security",
    description:
      "Single Sign-On with Google Cloud Identity, 256-bit quantum token encryption, and automated session guarding.",
    color: "pink",
  },
];

export default function LandingPage() {
  const { data: sessionData, isLoading } = useUserSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const user = sessionData?.user;
  const isAuthenticated = Boolean(user);
  const displayName = user?.displayName || user?.username || "Commander";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Dynamic Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-transform group-hover:scale-105">
              <AppLogo size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold font-brand tracking-wider text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                ForkPlay
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase -mt-1">
                Gaming Network
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Platform Features
            </a>
            <a href="#games" className="hover:text-cyan-400 transition-colors">
              Featured Titles
            </a>
            <a href="#telemetry" className="hover:text-cyan-400 transition-colors">
              Live Telemetry
            </a>
            <a href="#store" className="hover:text-cyan-400 transition-colors">
              Emporium
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">

            {/* Auth Action Buttons */}
            {isAuthenticated ? (
              <Link href="/games">
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.35)] h-9 px-4 rounded-xl">
                  <span className="size-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
                  <span>Go to Command Hub ({displayName})</span>
                  <IconChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 h-9"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-in">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)] h-9 px-4 rounded-xl"
                  >
                    Launch Terminal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 sm:size-[600px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 size-72 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-in fade-in slide-in-from-top-4 duration-500">
            <IconSparkles className="size-3.5 animate-pulse text-cyan-400" />
            <span>FORKPLAY NETWORK PROTOCOL 2.0 IS LIVE</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-brand tracking-tight text-white leading-tight">
              The Next-Gen{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Cloud Game Launcher
              </span>{" "}
              & Tactical Hub.
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Instant hardware-accelerated game deployment, edge-synchronized cloud saves, live achievements, and encrypted comms in one unified operator hub.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <>
                <Link href="/games">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm font-mono shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105">
                    <IconPlayerPlay className="size-4 mr-2 fill-current" />
                    Enter Command Hub (Private)
                  </Button>
                </Link>
                <Link href="/store">
                  <Button
                    variant="outline"
                    className="border-white/15 bg-card/60 backdrop-blur-md hover:bg-white/10 text-foreground h-12 px-6 rounded-xl font-mono text-sm"
                  >
                    <IconBuildingStore className="size-4 mr-2 text-cyan-400" />
                    Browse Digital Store
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm font-mono shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105">
                    <IconPlayerPlay className="size-4 mr-2 fill-current" />
                    Sign In to Play
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button
                    variant="outline"
                    className="border-white/15 bg-card/60 backdrop-blur-md hover:bg-white/10 text-foreground h-12 px-6 rounded-xl font-mono text-sm"
                  >
                    Register Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Interactive Preview Mockup Card */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="relative rounded-3xl border border-white/15 bg-card/40 backdrop-blur-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_50px_rgba(6,182,212,0.1)] overflow-hidden">
              {/* Top Window Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500/80" />
                  <span className="size-3 rounded-full bg-amber-500/80" />
                  <span className="size-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-white/80 font-bold">FORKPLAY_OS_V2.0.4</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-400">
                  <span className="flex items-center gap-1">
                    <IconActivity className="size-3.5 text-emerald-400" />
                    144 FPS
                  </span>
                  <span>•</span>
                  <span>12ms LATENCY</span>
                  <span>•</span>
                  <span className="text-emerald-400">CLOUD SYNC: ACTIVE</span>
                </div>
              </div>

              {/* Mockup Body: Hero Game Spotlight Banner */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden mt-4 border border-white/10 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400&auto=format&fit=crop"
                  alt="Spotlight Mockup"
                  fill
                  className="object-cover brightness-60 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="cyber">FEATURED TITLES</Badge>
                      <Badge variant="legendary">9.8 RATING</Badge>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-brand text-white">
                      Cyberpunk 2088: Neon Genesis
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md">
                      Vulkan RT shader optimization enabled with real-time positional spatial audio.
                    </p>
                  </div>

                  <Link href={isAuthenticated ? "/games" : "/auth/sign-in"}>
                    <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-mono font-bold h-10 px-5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
                      <IconPlayerPlay className="size-3.5 mr-1.5 fill-current" />
                      {isAuthenticated ? "Launch Game" : "Sign In to Play"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Telemetry Strip */}
      <section id="telemetry" className="border-y border-white/10 bg-card/30 backdrop-blur-lg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
                144 FPS
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Hardware Acceleration
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                99.99%
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Server Fleet Uptime
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">
                &lt; 15ms
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Cloud Relay Latency
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
                EDGE CDN
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Global Asset Storage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Matrix Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="cyber">ENGINE CAPABILITIES</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-brand text-foreground">
            Engineered for High-Stakes Gamers
          </h2>
          <p className="text-sm text-muted-foreground">
            A comprehensive suite of gaming utilities designed to maximize performance, track honors, and orchestrate co-op comms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const IconComp = f.icon;
            return (
              <div
                key={i}
                className="group rounded-3xl border border-white/10 bg-card/50 backdrop-blur-md p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 transition-transform group-hover:scale-110">
                  <IconComp className="size-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-foreground font-brand">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top Games Showcase Section */}
      <section id="games" className="py-20 border-t border-white/10 bg-card/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="legendary">SPOTLIGHT RELEASES</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-brand text-foreground mt-2">
                Featured Platform Titles
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore popular next-generation games deployed on the ForkPlay Network.
              </p>
            </div>

            <Link href={isAuthenticated ? "/games" : "/auth/sign-in"}>
              <Button
                variant="outline"
                className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-mono"
              >
                <span>View Full Library</span>
                <IconArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOWCASE_GAMES.map((game, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-card/60 overflow-hidden hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <Image
                    src={game.coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="cyber" className="text-[10px] bg-black/70">
                      {game.genre}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded text-[11px] text-amber-400 font-mono">
                    <IconStarFilled className="size-3" />
                    <span>{game.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {game.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {game.tagline}
                    </p>
                  </div>

                  <Link
                    href={isAuthenticated ? "/games" : "/auth/sign-in"}
                    className="pt-2"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold h-8 rounded-lg"
                    >
                      <IconPlayerPlay className="size-3 mr-1 fill-current" />
                      Play Title
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-card to-blue-950/60 p-8 sm:p-14 text-center space-y-6 shadow-[0_0_60px_rgba(6,182,212,0.15)] relative">
            <div className="size-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 mx-auto flex items-center justify-center shadow-lg">
              <IconSparkles className="size-8 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-brand text-white">
                Ready to Join the Network?
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Log in to synchronize your operator call-sign, unlock trophies, and access your personalized game dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link href="/games">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm font-mono shadow-[0_0_35px_rgba(6,182,212,0.4)]">
                    <span>Enter Command Hub</span>
                    <IconArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 h-12 rounded-xl text-sm font-mono shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                      Instant Demo Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button
                      variant="outline"
                      className="border-white/20 hover:bg-white/10 text-white h-12 px-6 rounded-xl font-mono text-sm"
                    >
                      Register New Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-10 mt-auto text-xs font-mono text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AppLogo size={18} />
            <span className="font-bold text-foreground">ForkPlay Platform</span>
            <span>• Next-Gen Tactical Launcher</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/games" className="hover:text-cyan-400 transition-colors">
              Command Hub
            </Link>
            <Link href="/store" className="hover:text-cyan-400 transition-colors">
              Store
            </Link>
            <Link href="/achievements" className="hover:text-cyan-400 transition-colors">
              Trophies
            </Link>
            <Link href="/inbox" className="hover:text-cyan-400 transition-colors">
              Inbox
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} ForkPlay Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
