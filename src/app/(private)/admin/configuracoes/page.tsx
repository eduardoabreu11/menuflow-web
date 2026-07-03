"use client";

import { useState } from "react";

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

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

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

                <Input defaultValue="João Silva" className="mt-2" />
              </div>

              <div>
                <Label>E-mail</Label>

                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    defaultValue="contato@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Plano atual</Label>

                <Input disabled defaultValue="Premium" className="mt-2" />
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:opacity-90">
                <Save size={16} />
                Salvar alterações
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
                    className="pr-10"
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
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Confirmar nova senha</Label>

                <Input
                  type="password"
                  placeholder="Confirme a nova senha"
                  className="mt-2"
                />
              </div>

              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
              >
                Atualizar senha
              </Button>

              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 text-primary" />

                  <div>
                    <p className="font-medium text-foreground">
                      Esqueceu sua senha?
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Solicite a redefinição através do seu e-mail de acesso.
                    </p>

                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-primary"
                    >
                      Redefinir senha
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

            <Button variant="destructive" className="w-full">
              <LogOut size={16} />
              Encerrar sessão
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}