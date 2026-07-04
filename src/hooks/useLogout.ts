"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export function useLogout() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      await signOut();

      router.replace("/admin/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao sair da conta");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    handleLogout,
  };
}