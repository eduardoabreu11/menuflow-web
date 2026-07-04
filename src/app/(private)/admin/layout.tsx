import { ReactNode } from "react";

import RoleGuard from "@/guards/RoleGuard";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["RESTAURANT_OWNER", "RESTAURANT_STAFF"]}>
      {children}
    </RoleGuard>
  );
}