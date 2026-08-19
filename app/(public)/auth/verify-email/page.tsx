"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconMailCheck,
  IconAlertTriangle,
  IconLoader2,
  IconCheck,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { useVerifyEmail } from "@/hooks/use-user";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = React.useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [errorMessage, setErrorMessage] = React.useState("");

  const verifyEmailMutation = useVerifyEmail();

  React.useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided in the URL.");
      return;
    }

    verifyEmailMutation.mutate(token, {
      onSuccess: () => {
        setStatus("success");
      },
      onError: (err: any) => {
        setStatus("error");
        setErrorMessage(
          err.message || "This verification link is invalid or has expired.",
        );
      },
    });
  }, [token]);

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/15 bg-card/60 p-8 backdrop-blur-2xl shadow-2xl text-center">
      {/* Brand Icon */}
      <div className="flex justify-center mb-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <AppLogo size={28} />
          </div>
        </Link>
      </div>

      {status === "verifying" && (
        <div className="space-y-4 py-4 animate-in fade-in duration-200">
          <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <IconLoader2 className="size-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-brand text-foreground">
              Validating Identity Token...
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Synchronizing with cryptographic authorization clearance...
            </p>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
          <div className="size-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <IconCheck className="size-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold font-brand text-foreground">
              Account Verified!
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Your email identity has been confirmed. Your operator credentials are now fully active.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/auth/sign-in">
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs h-11 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <span>Sign In to ForkPlay</span>
                <IconArrowRight className="size-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-5 py-2 animate-in zoom-in-95 duration-200">
          <div className="size-16 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <IconAlertTriangle className="size-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-brand text-foreground">
              Verification Link Invalid or Expired
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {errorMessage}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link href="/auth/sign-in">
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-mono text-xs h-10 rounded-xl">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background selection:bg-cyan-500/30 selection:text-cyan-300">
      <Suspense
        fallback={
          <div className="size-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
