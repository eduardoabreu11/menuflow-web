"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  Calendar,
  CreditCard,
  ExternalLink,
  MessageCircle,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";

import { Button } from "@/components/ui/button";

import {
  getSelectedRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

function getRestaurantStatusInfo(status?: string) {
  if (status === "ACTIVE") {
    return {
      label: "Ativo",
      description: "Seu restaurante está liberado para uso.",
      badgeClass: "bg-emerald-100 text-emerald-700",
      cardClass: "border-emerald-500/20 bg-emerald-500/10",
    };
  }

  if (status === "BLOCKED") {
    return {
      label: "Bloqueado",
      description:
        "Seu restaurante está bloqueado. Entre em contato com o suporte.",
      badgeClass: "bg-red-100 text-red-700",
      cardClass: "border-red-500/20 bg-red-500/10",
    };
  }

  return {
    label: "Pendente",
    description: "Status do restaurante ainda não identificado.",
    badgeClass: "bg-orange-100 text-orange-700",
    cardClass: "border-orange-500/20 bg-orange-500/10",
  };
}

export default function AssinaturaPage() {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
  const selectedRestaurant = getSelectedRestaurant();

  if (!selectedRestaurant) {
    router.push("/admin/restaurantes/selecionar");
    return;
  }

  queueMicrotask(() => {
    setRestaurant(selectedRestaurant);
  });
}, [router]);

  const statusInfo = useMemo(() => {
    return getRestaurantStatusInfo(restaurant?.status);
  }, [restaurant]);

  const cardapioLink = useMemo(() => {
    if (!restaurant) return "";

    if (typeof window === "undefined") {
      return `/cardapio/${restaurant.slug}`;
    }

    return `${window.location.origin}/cardapio/${restaurant.slug}`;
  }, [restaurant]);

  function handleOpenCardapio() {
    if (!cardapioLink) return;

    window.open(cardapioLink, "_blank");
  }

  function handleWhatsAppSupport() {
    const message = encodeURIComponent(
      `Olá, preciso de ajuda com a assinatura do restaurante ${restaurant?.name ?? ""}.`,
    );

    window.open(`https://wa.me/?text=${message}`, "_blank");
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AdminSidebar />

        <main className="ml-64 min-h-screen p-8">
          <h1 className="text-3xl font-bold text-foreground">Assinatura</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Carregando restaurante...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />

      <main className="ml-64 min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Assinatura</h1>

          <p className="mt-1 text-muted-foreground">
            Veja o status do seu acesso ao Serviu e as informações do seu plano.
          </p>
        </div>

        {restaurant.status === "BLOCKED" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <strong>Restaurante bloqueado.</strong>

              <p className="mt-1">
                O cardápio pode ficar limitado até a regularização da
                assinatura. Entre em contato com o suporte para resolver.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Plano atual</p>

            <h3 className="mt-2 text-xl font-bold text-foreground">
              Plano Serviu
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Acesso ao cardápio digital completo.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Status do acesso</p>

            <h3 className="mt-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </span>
            </h3>

            <p className="mt-3 text-sm text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Cobranças</p>

            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Gerenciadas pelo Serviu
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Vencimentos e pagamentos são acompanhados pela plataforma.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Histórico</p>

            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Em breve
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              O histórico financeiro do restaurante será liberado depois.
            </p>
          </div>
        </div>

        <div className={`mt-8 rounded-2xl border p-6 ${statusInfo.cardClass}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Restaurante: {restaurant.name}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                O acesso ao cardápio depende do status financeiro e operacional
                do restaurante.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenCardapio}
                className="border-border bg-card text-foreground hover:bg-accent"
              >
                <ExternalLink size={16} />
                Abrir cardápio
              </Button>

              <Button
                type="button"
                onClick={handleWhatsAppSupport}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                <MessageCircle size={16} />
                Falar com suporte
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Histórico de pagamentos
            </h2>

            <p className="text-sm text-muted-foreground">
              O histórico detalhado ainda não está disponível no painel do
              restaurante.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

            <h3 className="font-semibold text-foreground">
              Nenhum histórico disponível aqui
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Por enquanto, as cobranças, confirmações de pagamento e ajustes de
              assinatura são controlados pelo painel master do Serviu. Quando o
              acesso financeiro do restaurante for liberado, os pagamentos
              aparecerão nesta área.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Gerenciar assinatura
          </h2>

          <p className="mb-5 text-sm text-muted-foreground">
            Para alterar plano, forma de pagamento, regularizar acesso ou
            cancelar assinatura, fale com o suporte.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleWhatsAppSupport}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              <MessageCircle size={16} />
              Falar com suporte
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/link")}
              className="border-border bg-background text-foreground hover:bg-accent"
            >
              <ExternalLink size={16} />
              Ver Link & QR Code
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}