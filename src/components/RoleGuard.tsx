"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/services/authService";

type UserRole = AuthUser["role"];

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();

  const { user, loading } = useAuth();

  const hasPermission = user ? allowedRoles.includes(user.role) : false;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!hasPermission) {
      if (user.role === "MASTER") {
        router.replace("/master");
        return;
      }

      router.replace("/admin");
    }
  }, [loading, user, hasPermission, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Verificando permissão...
        </p>
      </main>
    );
  }

  if (!user || !hasPermission) {
    return null;
  }

  return children;
}