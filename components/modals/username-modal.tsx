"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCheck, IconX, IconLoader2, IconSparkles, IconUserCheck } from "@tabler/icons-react";
import { useCheckUsername, useSetUsername } from "@/hooks/use-user";
import { useToast } from "@/providers/toast-provider";

interface UsernameModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export function UsernameModal({ isOpen, onSuccess }: UsernameModalProps) {
  const [username, setUsername] = React.useState("");
  const [debouncedUsername, setDebouncedUsername] = React.useState("");

  const { showToast } = useToast();

  // Debounce username input for availability check
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(username.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [username]);

  const { data: availability, isLoading: checking } = useCheckUsername(debouncedUsername);
  const setUsernameMutation = useSetUsername();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!availability?.available || checking) return;

    setUsernameMutation.mutate(username.trim(), {
      onSuccess: () => {
        showToast({
          title: "🎮 Call-Sign Established!",
          description: `Welcome aboard, Commander @${username}! Your profile is fully activated.`,
          type: "success",
        });
        if (onSuccess) onSuccess();
      },
      onError: (err: any) => {
        showToast({
          title: "Setup Failed",
          description: err.message || "Could not claim this username.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md border-cyan-500/20 bg-background/95 p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <IconSparkles className="size-5" />
            <span className="text-xs uppercase font-mono tracking-widest">
              Operator Initialization
            </span>
          </div>
          <DialogTitle className="text-2xl text-foreground font-brand">
            Claim Your Call-Sign
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Welcome to the ForkPlay Network. Choose a unique handle to identify yourself across game servers, global leaderboards, and co-op comms.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase font-mono text-muted-foreground">
              Unique Username
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
                @
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="CyberSamurai_99"
                className="pl-8 pr-10 font-mono text-sm bg-background/60 border-white/15 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30"
                autoFocus
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking ? (
                  <IconLoader2 className="size-4 text-muted-foreground animate-spin" />
                ) : availability?.available ? (
                  <IconCheck className="size-4 text-emerald-400" />
                ) : availability && !availability.available ? (
                  <IconX className="size-4 text-destructive" />
                ) : null}
              </div>
            </div>

            {/* Live Inline Feedback */}
            {availability && (
              <p
                className={`text-xs flex items-center gap-1.5 transition-all ${
                  availability.available
                    ? "text-emerald-400"
                    : "text-destructive"
                }`}
              >
                {availability.available ? (
                  <>
                    <IconUserCheck className="size-3.5" />
                    <span>Handle is available!</span>
                  </>
                ) : (
                  <span>{availability.message}</span>
                )}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground/70">
              3 to 20 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={
                !availability?.available ||
                checking ||
                setUsernameMutation.isPending
              }
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            >
              {setUsernameMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
                  Registering Operator ID...
                </>
              ) : (
                "Confirm & Enter Platform"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
