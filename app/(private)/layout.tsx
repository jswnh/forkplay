import { PrivateShell } from "@/components/layout/private-shell";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <PrivateShell>{children}</PrivateShell>;
}
