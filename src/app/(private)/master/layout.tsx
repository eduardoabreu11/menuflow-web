import { ReactNode } from "react";

import RoleGuard from "@/guards/RoleGuard";

export default function MasterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RoleGuard allowedRoles={["MASTER"]}>{children}</RoleGuard>;
}