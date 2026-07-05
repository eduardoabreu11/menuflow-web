import { ReactNode } from "react";

import RoleGuard from "@/guards/RoleGuard";
import AdminRestaurantGuard from "@/guards/AdminRestaurantGuard";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["RESTAURANT_OWNER"]}>
      <AdminRestaurantGuard>{children}</AdminRestaurantGuard>
    </RoleGuard>
  );
}