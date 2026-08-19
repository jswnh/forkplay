"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signInSchema, type SignInDto } from "@/lib/schemas/sign-in.schema";
import { IconLoader2, IconAlertCircle, IconMailForward } from "@tabler/icons-react";
import { useResendVerification } from "@/hooks/use-user";
import { useToast } from "@/providers/toast-provider";

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const { showToast } = useToast();
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInDto>({
    resolver: zodResolver(signInSchema),
  });

  const resendMutation = useResendVerification();

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: SignInDto) => {
      setUnverifiedEmail(null);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED") || result.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email);
          throw new Error("Email identity not verified yet. Please check your inbox.");
        }
        throw new Error("Invalid email or password");
      }

      return result;
    },
    onSuccess: () => {
      router.push("/games");
      router.refresh();
    },
  });

  const onSubmit = (data: SignInDto) => {
    signInMutation.mutate(data);
  };

  const handleResend = () => {
    const email = unverifiedEmail || getValues("email");
    if (!email) return;

    resendMutation.mutate(email, {
      onSuccess: () => {
        showToast({
          title: "Verification Email Sent",
          description: `A new authorization link was dispatched to ${email}.`,
          type: "success",
        });
      },
      onError: (err: any) => {
        showToast({
          title: "Failed to Send",
          description: err.message || "Failed to dispatch verification email.",
          type: "error",
        });
      },
    });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold font-brand tracking-tight">Sign in to ForkPlay</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your operator credentials to access your game library
          </p>
        </div>

        {/* Unverified Email Alert */}
        {unverifiedEmail && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <IconAlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-300 font-mono uppercase">
                  Email Verification Required
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Your account requires email verification before signing in. Please check your inbox for the authorization link.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resendMutation.isPending}
              className="w-full border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono h-8"
            >
              {resendMutation.isPending ? (
                <>
                  <IconLoader2 className="size-3.5 animate-spin mr-1.5" />
                  Sending Link...
                </>
              ) : (
                <>
                  <IconMailForward className="size-3.5 mr-1.5" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="operator@forkplay.io"
            className="bg-white/5 border-white/15"
            {...register("email")}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="#"
              className="ml-auto text-xs text-cyan-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="bg-white/5 border-white/15"
            {...register("password")}
          />
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        {signInMutation.isError && !unverifiedEmail && (
          <FieldError>{signInMutation.error.message}</FieldError>
        )}

        <Field>
          <Button
            type="submit"
            disabled={signInMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_15px_rgba(6,182,212,0.25)] h-10 font-mono text-xs"
          >
            {signInMutation.isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in to Command Hub"
            )}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => signIn("google", { redirectTo: "/games" })}
            className="w-full border-white/15 hover:bg-white/5 h-10 text-xs font-mono"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 48 48"
              className="mr-2"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
            Sign in with Google
          </Button>

          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4 text-cyan-400">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}