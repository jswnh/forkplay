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
  IconCheck,
  IconLoader2,
  IconShoppingBag,
  IconShieldCheck,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import Image from "next/image";
import { useCheckoutItem, useVerifyItemPayment } from "@/hooks/use-items";
import { useToast } from "@/providers/toast-provider";
import { formatPrice, formatRawAmount, APP_CURRENCY_SYMBOL } from "@/lib/currency";

interface ItemCheckoutModalProps {
  item: {
    itemId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    category: string;
    gameTitle?: string | null;
    price: number;
    originalPrice?: number | null;
    imageUrl: string;
    rarity: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemCheckoutModal({
  item,
  isOpen,
  onClose,
}: ItemCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<"online" | "credits">("online");
  const [stage, setStage] = React.useState<"select" | "pending" | "success">("select");
  const [pendingTx, setPendingTx] = React.useState<{
    externalId: string;
    invoiceUrl: string;
    transactionId: string;
  } | null>(null);

  const { showToast } = useToast();
  const checkoutMutation = useCheckoutItem();
  const verifyMutation = useVerifyItemPayment();

  React.useEffect(() => {
    if (isOpen) {
      setStage("select");
      setPendingTx(null);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isFree = item.price === 0;

  const handleProceedPayment = () => {
    if (isFree || paymentMethod === "credits") {
      checkoutMutation.mutate(
        { itemId: item.itemId, paymentMethod: isFree ? "free" : "credits" },
        {
          onSuccess: () => {
            setStage("success");
            showToast({
              title: `🎒 Item Acquired: ${item.name}`,
              description: "Added to your operator inventory.",
              type: "success",
            });
          },
          onError: (err: any) => {
            showToast({
              title: "Checkout Error",
              description: err.message,
              type: "error",
            });
          },
        },
      );
      return;
    }

    checkoutMutation.mutate(
      { itemId: item.itemId },
      {
        onSuccess: (data: any) => {
          if (data.invoiceUrl) {
            setPendingTx({
              externalId: data.externalId,
              invoiceUrl: data.invoiceUrl,
              transactionId: data.transactionId,
            });
            setStage("pending");
            window.open(data.invoiceUrl, "_blank");
            showToast({
              title: "💳 Payment Window Opened",
              description: "Complete your transaction in the checkout portal.",
              type: "info",
            });
          }
        },
        onError: (err: any) => {
          showToast({
            title: "Checkout Error",
            description: err.message,
            type: "error",
          });
        },
      },
    );
  };

  const handleVerify = () => {
    if (!pendingTx) return;

    verifyMutation.mutate(
      { externalId: pendingTx.externalId },
      {
        onSuccess: (data: any) => {
          if (data.success && (data.isPaid || data.alreadyCompleted)) {
            setStage("success");
            showToast({
              title: "🎉 Payment Clearance Confirmed!",
              description: `${item.name} is now in your inventory.`,
              type: "success",
            });
          } else {
            showToast({
              title: "Payment Awaiting Clearance",
              description: "Please complete payment in the portal then click verify.",
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

  const getRarityBadgeVariant = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "legendary";
      case "epic":
        return "epic";
      case "rare":
        return "cyber";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/15 bg-background/95 p-6 backdrop-blur-2xl shadow-2xl">
        {stage === "select" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <IconShoppingBag className="size-5" />
                <span className="text-xs uppercase font-mono tracking-widest">
                  Acquire Store Item
                </span>
              </div>
              <DialogTitle className="text-2xl text-foreground font-brand">
                {item.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Item will be instantly bound to your operator account inventory.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Item Card Preview */}
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
                <div className="relative size-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getRarityBadgeVariant(item.rarity) as any}
                      className="text-[10px] uppercase py-0 px-1.5 font-mono"
                    >
                      {item.rarity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] capitalize py-0 px-1.5 font-mono text-muted-foreground">
                      {item.category.replace("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-foreground mt-1 truncate">
                    {item.name}
                  </h3>
                  {item.gameTitle && (
                    <p className="text-xs text-cyan-400 font-mono truncate">
                      For: {item.gameTitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {isFree ? (
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        FREE TO CLAIM
                      </span>
                    ) : (
                      <>
                        <span className="text-cyan-400 font-mono font-bold text-sm">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through font-mono">
                            {formatRawAmount(item.originalPrice)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Rail Options (if not free) */}
              {!isFree && (
                <div className="space-y-2.5">
                  <label className="text-xs uppercase font-mono text-muted-foreground tracking-wider">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
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
                        Cards, GCash, Maya & QR
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credits")}
                      className={`flex flex-col items-start p-3.5 rounded-xl border transition-all text-xs font-mono text-left ${
                        paymentMethod === "credits"
                          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <IconWallet className="size-4 text-purple-400" />
                        <span>Platform Credits</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Instant demo balance
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Item Subtotal</span>
                  <span>{formatPrice(item.price)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee</span>
                  <span className="text-emerald-400">{APP_CURRENCY_SYMBOL}0.00 (Waived)</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>Total Due</span>
                  <span className="text-cyan-400 font-mono">
                    {formatPrice(item.price)}
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
                disabled={checkoutMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)] flex-1 text-xs font-mono h-10"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin mr-2" />
                    Initializing Payment...
                  </>
                ) : isFree ? (
                  "Claim Free Item"
                ) : (
                  `Buy Item (${formatPrice(item.price)})`
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {stage === "pending" && pendingTx && (
          <div className="py-4 space-y-6 animate-in fade-in duration-200">
            <DialogHeader>
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <IconCreditCard className="size-5" />
                <span className="text-xs uppercase font-mono tracking-widest">
                  Payment Processing
                </span>
              </div>
              <DialogTitle className="text-xl text-foreground font-brand">
                Complete Your Item Order
              </DialogTitle>
            </DialogHeader>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 space-y-3 text-center">
              <div className="size-12 rounded-xl bg-black/60 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center">
                <IconShoppingBag className="size-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase">
                  Transaction Reference
                </div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {pendingTx.externalId}
                </div>
              </div>
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
                onClick={handleVerify}
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

        {stage === "success" && (
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <IconCheck className="size-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold font-brand text-foreground">
                Item Unlocked!
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                <strong className="text-foreground">{item.name}</strong> is now added to your inventory.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-mono h-10 px-6 rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
