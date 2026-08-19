"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLoader2, IconSend, IconMailForward } from "@tabler/icons-react";
import { useComposeMessage } from "@/hooks/use-inbox";
import { useToast } from "@/providers/toast-provider";

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComposeMessageModal({
  isOpen,
  onClose,
}: ComposeMessageModalProps) {
  const [type, setType] = React.useState<"social" | "game" | "system">("social");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  const { showToast } = useToast();
  const composeMutation = useComposeMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    composeMutation.mutate(
      {
        type,
        title: title.trim(),
        body: body.trim(),
        metadata: {
          tags: ["Direct Comms", type.toUpperCase()],
        },
      },
      {
        onSuccess: () => {
          showToast({
            title: "Transmission Dispatched",
            description: "Your message has been posted to your communications log.",
            type: "success",
          });
          setTitle("");
          setBody("");
          onClose();
        },
        onError: (err: any) => {
          showToast({
            title: "Dispatch Error",
            description: err.message || "Failed to send message.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-lg border-white/15 bg-background/95 p-6 backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <IconMailForward className="size-5" />
            <span className="text-xs uppercase font-mono tracking-widest">
              Comms Terminal
            </span>
          </div>
          <DialogTitle className="text-xl font-bold font-brand text-foreground">
            Compose Network Message
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Dispatch a tactical message, game log, or platform notification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase font-mono text-muted-foreground">
              Channel Type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(["social", "game", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg border text-xs font-mono capitalize transition-all ${
                    type === t
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs uppercase font-mono text-muted-foreground">
              Subject
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Squad Tactics / Sector Raid briefing"
              className="bg-white/5 border-white/15"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body" className="text-xs uppercase font-mono text-muted-foreground">
              Message Body
            </Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Enter message details..."
              className="w-full rounded-md border border-white/15 bg-white/5 p-2.5 text-sm text-foreground focus-visible:border-cyan-500 focus-visible:outline-none"
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/15 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={composeMutation.isPending || !title.trim() || !body.trim()}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {composeMutation.isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin mr-2" />
                  Dispatching...
                </>
              ) : (
                <>
                  <IconSend className="size-4 mr-2" />
                  Dispatch Message
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
