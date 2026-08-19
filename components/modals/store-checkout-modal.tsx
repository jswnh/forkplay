"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCreditCard,
  IconWallet,
  IconCoins,
  IconCheck,
  IconLoader2,
  IconShoppingBag,
  IconPlayerPlay,
  IconShieldCheck,
  IconExternalLink,
  IconBuildingStore,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";
import Image from "next/image";
import { usePurchaseGame, useCheckoutXendit, useVerifyXendit } from "@/hooks/use-store";
import { useToast } from "@/providers/toast-provider";
import { formatPrice, formatRawAmount, APP_CURRENCY_SYMBOL } from "@/lib/currency";

interface StoreCheckoutModalProps {
  game: {
    gameId: string;
    slug: string;
    title: string;
    coverUrl: string;
    genre: string;
    price: number;
    originalPrice?: number | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchGame?: (game: any) => void;
}

export function StoreCheckoutModal({
  game,
  isOpen,
  onClose,
  onLaunchGame,
}: StoreCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<
    "online" | "platform_credits"
  >("online");

  const [checkoutStage, setCheckoutStage] = React.useState<
    "select" | "pending_clearance" | "success"
  >("select");

  const [pendingTx, setPendingTx] = React.useState<{
    externalId: string;
    invoiceUrl: string;
    transactionId: string;
  } | null>(null);

  const { showToast } = useToast();
  const purchaseMutation = usePurchaseGame();
  const checkoutMutation = useCheckoutXendit();
  const verifyMutation = useVerifyXendit();

  React.useEffect(() => {
    if (isOpen) {
      setCheckoutStage("select");
      setPendingTx(null);
    }
  }, [isOpen]);

  if (!isOpen || !game) return null;

  const isFree = game.price === 0;

  // Handle Initial Checkout
  const handleProceedPayment = () => {
    if (isFree) {
      purchaseMutation.mutate(
        { gameId: game.gameId, paymentMethod: "Free License" },
        {
          onSuccess: () => {
            setCheckoutStage("success");
            showToast({
              title: `🎉 Free License Claimed: ${game.title}`,
              description: `Game is now permanently in your library.`,
              type: "success",
            });
          },
        },
      );
      return;
    }

    if (paymentMethod === "platform_credits") {
      purchaseMutation.mutate(
        { gameId: game.gameId, paymentMethod: "Platform Demo Balance" },
        {
          onSuccess: () => {
            setCheckoutStage("success");
            showToast({
              title: `🛍️ Order Complete: ${game.title}`,
              description: `Digital license assigned. Transaction receipt delivered to Inbox.`,
              type: "success",
            });
          },
          onError: (err: any) => {
            showToast({
              title: "Purchase Failed",
              description: err.message || "Failed to process checkout.",
              type: "error",
            });
          },
        },
      );
      return;
    }

    // Direct Online Payment Route
    checkoutMutation.mutate(
      { gameId: game.gameId },
      {
        onSuccess: (data: any) => {
          if (data.alreadyOwned) {
            showToast({
              title: "Already In Library",
              description: "You already own this game!",
              type: "info",
            });
            onClose();
            return;
          }

          if (data.invoiceUrl) {
            setPendingTx({
              externalId: data.externalId,
              invoiceUrl: data.invoiceUrl,
              transactionId: data.transactionId,
            });
            setCheckoutStage("pending_clearance");

            // Open payment portal window
            window.open(data.invoiceUrl, "_blank");

            showToast({
              title: "💳 Secure Checkout Portal Opened",
              description: "Complete your transaction in the checkout window.",
              type: "info",
            });
          }
        },
        onError: (err: any) => {
          showToast({
            title: "Checkout Error",
            description: err.message || "Failed to initialize payment gateway.",
            type: "error",
          });
        },
      },
    );
  };

  // Handle Verify Payment Status
  const handleVerifyPayment = () => {
    if (!pendingTx) return;

    verifyMutation.mutate(
      { externalId: pendingTx.externalId },
      {
        onSuccess: (data: any) => {
          if (data.success && (data.isPaid || data.alreadyCompleted)) {
            setCheckoutStage("success");
            showToast({
              title: "🎉 Payment Clearance Verified!",
              description: `${game.title} is now registered in your library.`,
              type: "success",
            });
          } else {
            showToast({
              title: "Payment Awaiting Clearance",
              description: "If you completed the payment, please allow a moment and click verify again.",
              type: "info",
            });
          }
        },
        onError: (err: any) => {
          showToast({
            title: "Verification Error",
            description: err.message,
            type: "error",
          });
        },
      },
    );
  };

  const discountPercent =
    game.originalPrice && game.originalPrice > game.price
      ? Math.round(
          ((game.originalPrice - game.price) / game.originalPrice) * 100,
        )
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/15 bg-background/95 p-6 backdrop-blur-2xl shadow-2xl">
        {checkoutStage === "select" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <IconShoppingBag className="size-5" />
                <span className="text-xs uppercase font-mono tracking-widest">
                  Secure Game Checkout
                </span>
              </div>
              <DialogTitle className="text-2xl text-foreground font-brand">
                Acquire Game License
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Digital license will be tied to your operator ID and available for immediate deployment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Game Item Row */}
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
                <div className="relative size-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={game.coverUrl}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="cyber" className="text-[10px] py-0 px-1.5">
                      {game.genre}
                    </Badge>
                    {discountPercent && (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5">
                        -{discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-foreground mt-1 truncate">
                    {game.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isFree ? (
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        FREE TO PLAY
                      </span>
                    ) : (
                      <>
                        <span className="text-cyan-400 font-mono font-bold text-sm">
                          {formatPrice(game.price)}
                        </span>
                        {game.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through font-mono">
                            {formatRawAmount(game.originalPrice)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Selector (Only if not free) */}
              {!isFree && (
                <div className="space-y-2.5">
                  <label className="text-xs uppercase font-mono text-muted-foreground tracking-wider">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Direct Online Payment Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-xs font-mono text-left ${
                        paymentMethod === "online"
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <IconCreditCard className="size-4 text-cyan-400" />
                        <span>Online Payment</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Cards, GCash, Maya, QR & Banks
                      </span>
                    </button>

                    {/* Platform Credits Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("platform_credits")}
                      className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-xs font-mono text-left ${
                        paymentMethod === "platform_credits"
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <IconWallet className="size-4 text-purple-400" />
                        <span>Platform Credits</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Instant demo balance checkout
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Order Breakdown */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(game.price)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Gateway Fee</span>
                  <span className="text-emerald-400">{APP_CURRENCY_SYMBOL}0.00 (Waived)</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Due</span>
                  <span className="text-cyan-400 font-mono">
                    {formatPrice(game.price)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                <IconShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>Encrypted 256-Bit Payment Gateway Clearance</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/15 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedPayment}
                disabled={checkoutMutation.isPending || purchaseMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)] flex-1 text-xs font-mono h-10"
              >
                {checkoutMutation.isPending || purchaseMutation.isPending ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin mr-2" />
                    Initializing Payment...
                  </>
                ) : isFree ? (
                  "Claim Free Game Now"
                ) : (
                  `Buy Game (${formatPrice(game.price)})`
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* In-Flight Payment Pending View */}
        {checkoutStage === "pending_clearance" && pendingTx && (
          <div className="py-4 space-y-6 animate-in fade-in duration-200">
            <DialogHeader>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <IconCreditCard className="size-5" />
                <span className="text-xs uppercase font-mono tracking-widest">
                  Payment Processing
                </span>
              </div>
              <DialogTitle className="text-xl text-foreground font-brand">
                Complete Your Payment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Follow the instructions on the secure checkout portal to complete your order.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 space-y-3 text-center">
              <div className="size-12 rounded-xl bg-black/60 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center">
                <IconCreditCard className="size-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  Transaction Reference
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {pendingTx.externalId}
                </div>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Payment window opened. If it didn&apos;t launch automatically, click below to open the checkout portal.
              </p>
              <div className="pt-1">
                <a
                  href={pendingTx.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-lg"
                >
                  <span>Open Payment Portal</span>
                  <IconExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyPayment}
                disabled={verifyMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs font-mono h-11 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                {verifyMutation.isPending ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin mr-2" />
                    Verifying Payment Clearance...
                  </>
                ) : (
                  <>
                    <IconCheck className="size-4 mr-2" />
                    I Have Completed Payment (Verify Status)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full border-white/10 text-xs font-mono"
              >
                Close & Check Later
              </Button>
            </div>
          </div>
        )}

        {/* Success View */}
        {checkoutStage === "success" && (
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <IconCheck className="size-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold font-brand text-foreground">
                Acquisition Successful!
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                <strong className="text-foreground">{game.title}</strong> is now permanently registered in your game library. An official receipt has been delivered to your Inbox.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              <Button
                onClick={() => {
                  onClose();
                  if (onLaunchGame) onLaunchGame(game);
                }}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <IconPlayerPlay className="size-4 mr-2 fill-current" />
                Launch Game Now
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/15 hover:bg-white/10"
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
