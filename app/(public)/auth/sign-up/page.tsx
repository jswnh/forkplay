import { SignupForm } from "@/components/forms/signup-form";
import { AppLogo } from "@/components/app-logo";
import Link from "next/link";
import Image from "next/image";

const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME || "ForkPlay";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2.5 font-medium group transition-opacity hover:opacity-90">
            <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 transition-transform group-hover:scale-105">
              <AppLogo size={22} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-bold font-brand tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={"/images/cyberpunk-soldier-futuristic-battle.jpg"}
          alt="ForkPlay Cyberpunk Platform"
          loading="eager"
          fill
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
