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
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";
import {
  IconLoader2,
  IconMailCheck,
  IconCheck,
  IconArrowRight,
  IconMailForward,
} from "@tabler/icons-react";
import { useResendVerification } from "@/hooks/use-user";
import { useToast } from "@/providers/toast-provider";
import { AppLogo } from "@/components/app-logo";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpDto = z.infer<typeof signUpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(
    null,
  );
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpDto>({
    resolver: zodResolver(signUpSchema),
  });

  const resendMutation = useResendVerification();

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: SignUpDto) => {
      const res = await (client.api.user["sign-up"].$post as any)({
        json: { email, password },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }
      return data;
    },
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email);
      showToast({
        title: "⚡ Verification Link Dispatched",
        description: `Please check ${variables.email} to verify your account.`,
        type: "success",
      });
    },
  });

  const onSubmit = (data: SignUpDto) => {
    signUpMutation.mutate(data);
  };

  const handleResend = () => {
    if (!registeredEmail) return;
    resendMutation.mutate(registeredEmail, {
      onSuccess: () => {
        showToast({
          title: "Link Resent",
          description: `A new verification email has been dispatched to ${registeredEmail}.`,
          type: "success",
        });
      },
      onError: (err: any) => {
        showToast({
          title: "Resend Failed",
          description: err.message,
          type: "error",
        });
      },
    });
  };

  // Success view: Check email inbox
  if (registeredEmail) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="size-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <IconMailCheck className="size-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-brand text-foreground">
            Check Your Inbox
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            We sent an identity authorization link to{" "}
            <strong className="text-cyan-400 font-mono">{registeredEmail}</strong>.
            Click the link in the email to activate your account and start gaming.
          </p>
        </div>

        <div className="w-full space-y-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="w-full border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono h-10"
          >
            {resendMutation.isPending ? (
              <>
                <IconLoader2 className="size-3.5 animate-spin mr-1.5" />
                Resending Link...
              </>
            ) : (
              <>
                <IconMailForward className="size-3.5 mr-1.5" />
                Resend Verification Email
              </>
            )}
          </Button>

          <Link href="/auth/sign-in" className="block w-full">
            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5 text-xs font-mono h-10"
            >
              Proceed to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Link href="/" className="mb-1 inline-flex items-center justify-center group" title="Return to ForkPlay Home">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
              <AppLogo size={28} />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-brand tracking-tight">Create Operator Account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Join the decentralized next-gen game launcher network
          </p>
        </div>

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
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

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="bg-white/5 border-white/15"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword.message}</FieldError>
          )}
        </Field>

        {signUpMutation.isError && (
          <FieldError>{signUpMutation.error.message}</FieldError>
        )}

        <Field>
          <Button
            type="submit"
            disabled={signUpMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-[0_0_15px_rgba(6,182,212,0.25)] h-10 font-mono text-xs"
          >
            {signUpMutation.isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin mr-2" />
                Dispatching Verification Link...
              </>
            ) : (
              "Create Account & Verify"
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
            Sign up with Google
          </Button>

          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="underline underline-offset-4 text-cyan-400">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
