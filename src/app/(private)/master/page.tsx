"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CircleCheck,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  RefreshCw,
  Store,
  Wallet,
  XCircle,
} from "lucide-react";

import { MasterSidebar } from "./_components/masterSidebar";
import { MasterTopbar } from "./_components/masterTopbar";
import { MasterMetricCard } from "./_components/masterMetricCard";

import {
  getRestaurants,
  type Restaurant,
} from "@/services/restaurantService";

import { getUsers, type User } from "@/services/userService";

import {
  getPayments,
  getSubscriptions,
  type Payment,
  type PaymentStatus,
  type Subscription,
} from "@/services/financeService";

const restaurantStatusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  INACTIVE: "Inativo",
};

const restaurantStatusStyles: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
  INACTIVE: "bg-zinc-100 text-zinc-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function getDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

function isPastDueDate(date: string) {
  const cleanDate = date.split("T")[0];
  const [year, month, day] = cleanDate.split("-").map(Number);

  if (!year || !month || !day) return false;

  const dueDate = new Date(year, month - 1, day);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function getEffectivePaymentStatus(payment: Payment): PaymentStatus {
  if (payment.status === "PENDING" && isPastDueDate(payment.due_date)) {
    return "OVERDUE";
  }

  return payment.status;
}

function getCurrentMonthKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getPaymentMonthKey(payment: Payment) {
  const cleanDate = payment.due_date.split("T")[0];

  if (!cleanDate) return "";

  const [year, month] = cleanDate.split("-");

  if (!year || !month) return "";

  return `${year}-${month}`;
}

export default function MasterPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [
        restaurantsData,
        usersData,
        paymentsData,
        subscriptionsData,
      ] = await Promise.all([
        getRestaurants(),
        getUsers(),
        getPayments(),
        getSubscriptions(),
      ]);

      setRestaurants(restaurantsData);
      setUsers(usersData);
      setPayments(paymentsData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dashboard master";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadDashboardData();
    });
  }, []);

  function getOwnerById(ownerUserId: string) {
    return users.find((user) => user.id === ownerUserId) ?? null;
  }

  function getOwnerName(ownerUserId: string) {
    const owner = getOwnerById(ownerUserId);

    return owner?.name ?? "Dono não encontrado";
  }

  const metrics = useMemo(() => {
    const activeRestaurants = restaurants.filter(
      (restaurant) => restaurant.status === "ACTIVE",
    ).length;

    const blockedRestaurants = restaurants.filter(
      (restaurant) => restaurant.status === "BLOCKED",
    ).length;

    const inactiveRestaurants = restaurants.filter(
      (restaurant) => restaurant.status === "INACTIVE",
    ).length;

    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "ACTIVE",
    ).length;

    const canceledSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "CANCELED",
    ).length;

    const monthlyRecurringRevenue = subscriptions
      .filter((subscription) => subscription.status === "ACTIVE")
      .reduce((total, subscription) => total + subscription.monthly_price, 0);

    const currentMonthKey = getCurrentMonthKey();

    const currentMonthPayments = payments.filter((payment) => {
      if (payment.status === "CANCELED") return false;

      return getPaymentMonthKey(payment) === currentMonthKey;
    });

    const receivedThisMonth = currentMonthPayments
      .filter((payment) => payment.status === "PAID")
      .reduce((total, payment) => total + payment.amount, 0);

    const expectedThisMonth = currentMonthPayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    const pendingPayments = payments.filter(
      (payment) => getEffectivePaymentStatus(payment) === "PENDING",
    );

    const overduePayments = payments.filter(
      (payment) => getEffectivePaymentStatus(payment) === "OVERDUE",
    );

    const pendingAmount = pendingPayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    const overdueAmount = overduePayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    return {
      totalRestaurants: restaurants.length,
      activeRestaurants,
      blockedRestaurants,
      inactiveRestaurants,
      activeSubscriptions,
      canceledSubscriptions,
      monthlyRecurringRevenue,
      expectedThisMonth,
      receivedThisMonth,
      pendingPaymentsCount: pendingPayments.length,
      overduePaymentsCount: overduePayments.length,
      pendingAmount,
      overdueAmount,
    };
  }, [restaurants, subscriptions, payments]);

  const latestRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => getDateTime(b.created_at) - getDateTime(a.created_at))
      .slice(0, 5);
  }, [restaurants]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard
              </h1>

              <p className="text-sm text-muted-foreground">
                Visão geral real da plataforma Serviu.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Atualizar
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <strong>Erro ao carregar dashboard.</strong>

                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              Carregando dados reais da plataforma...
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MasterMetricCard
              title="Total de Restaurantes"
              value={String(metrics.totalRestaurants)}
              description={`${metrics.activeRestaurants} ativos, ${metrics.blockedRestaurants} bloqueados`}
              icon={<Store size={24} />}
            />

            <MasterMetricCard
              title="Assinaturas Ativas"
              value={String(metrics.activeSubscriptions)}
              description={`${metrics.canceledSubscriptions} canceladas`}
              icon={<CreditCard size={24} />}
            />

            <MasterMetricCard
              title="Receita Recorrente"
              value={formatCurrency(metrics.monthlyRecurringRevenue)}
              description="MRR das assinaturas ativas"
              icon={<Wallet size={24} />}
            />

            <MasterMetricCard
              title="Pendências"
              value={String(
                metrics.pendingPaymentsCount + metrics.overduePaymentsCount,
              )}
              description={`${metrics.overduePaymentsCount} faturas atrasadas`}
              icon={<Clock3 size={24} />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Últimos restaurantes
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Restaurantes cadastrados mais recentemente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/master/restaurantes")}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    Ver todos
                  </button>
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4 font-medium">Restaurante</th>
                      <th className="px-5 py-4 font-medium">Dono</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Criado em</th>
                      <th className="px-5 py-4 font-medium">Ação</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {latestRestaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-muted/30">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {restaurant.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              /{restaurant.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {getOwnerName(restaurant.owner_user_id)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              restaurantStatusStyles[restaurant.status] ??
                              "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {restaurantStatusLabels[restaurant.status] ??
                              restaurant.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(restaurant.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/master/restaurantes/${restaurant.id}`)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
                          >
                            <Eye size={14} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!loading && latestRestaurants.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-10 text-center text-sm text-muted-foreground"
                        >
                          Nenhum restaurante cadastrado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Resumo rápido
                </h2>

                <p className="text-sm text-muted-foreground">
                  Situação operacional e financeira da plataforma.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Restaurantes ativos
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Operando normalmente
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <CircleCheck size={18} />
                    {metrics.activeRestaurants}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Restaurantes bloqueados
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Exigem atenção do master
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                    <XCircle size={18} />
                    {metrics.blockedRestaurants}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Recebido no mês
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Faturas pagas no mês atual
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(metrics.receivedThisMonth)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Previsto no mês
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Soma das faturas do mês atual
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(metrics.expectedThisMonth)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Valor pendente
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Faturas pendentes ainda não vencidas
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(metrics.pendingAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Valor atrasado
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Faturas vencidas e não pagas
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(metrics.overdueAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/master/financeiro")}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Abrir financeiro
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/master/restaurantes")}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  Gerenciar restaurantes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}