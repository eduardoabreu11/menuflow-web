"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  User,
  Mail,
  Shield,
  Eye,
  EyeOff,
  LogOut,
  Save,
  KeyRound,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const router = useRouter();

  const { user, signOut } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    try {
      setLogoutLoading(true);

      await signOut();

      router.push("/admin/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao encerrar sessão");
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminSidebar />

      <section className="ml-64 min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Configurações
          </h1>

          <p className="mt-2 text-muted-foreground">
            Gerencie sua conta e credenciais de acesso.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />

              <h2 className="text-xl font-semibold text-card-foreground">
                Dados da conta
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <Label>Nome</Label>

                <Input
                  value={user?.name ?? ""}
                  disabled
                  className="mt-2 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <Label>E-mail</Label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="pl-10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de usuário</Label>

                <Input
                  disabled
                  value={
                    user?.role === "RESTAURANT_OWNER"
                      ? "Dono do restaurante"
                      : user?.role === "MASTER"
                        ? "Master"
                        : user?.role === "RESTAURANT_STAFF"
                          ? "Funcionário"
                          : ""
                  }
                  className="mt-2 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <Label>Status da conta</Label>

                <Input
                  disabled
                  value={user?.is_active ? "Ativa" : "Inativa"}
                  className="mt-2 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <Button
                disabled
                className="w-full bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                Alteração de dados em breve
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />

              <h2 className="text-xl font-semibold text-card-foreground">
                Segurança da conta
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <Label>Senha atual</Label>

                <div className="relative mt-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    disabled
                    className="pr-10 disabled:cursor-not-allowed disabled:opacity-70"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Nova senha</Label>

                <Input
                  type="password"
                  placeholder="Digite a nova senha"
                  disabled
                  className="mt-2 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <Label>Confirmar nova senha</Label>

                <Input
                  type="password"
                  placeholder="Confirme a nova senha"
                  disabled
                  className="mt-2 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <Button
                variant="outline"
                disabled
                className="w-full border-primary text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Atualizar senha em breve
              </Button>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 text-primary" />

                  <div>
                    <p className="font-medium text-foreground">
                      Esqueceu sua senha?
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      A redefinição de senha será implementada depois com envio
                      de e-mail seguro.
                    </p>

                    <Button
                      variant="link"
                      disabled
                      className="mt-2 h-auto p-0 text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Redefinir senha em breve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold text-card-foreground">
              Sessão
            </h2>

            <p className="mb-5 text-sm text-muted-foreground">
              Encerre sua sessão atual no painel administrativo.
            </p>

            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />
              {logoutLoading ? "Saindo..." : "Encerrar sessão"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}