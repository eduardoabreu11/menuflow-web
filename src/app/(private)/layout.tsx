import { ReactNode } from "react";

import AuthGuard from "@/guards/AuthGuard";

export default function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}