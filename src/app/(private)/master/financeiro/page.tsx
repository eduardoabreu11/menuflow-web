"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";
import { MasterMetricCard } from "../_components/masterMetricCard";

import {
  cancelPayment,
  createPayment,
  getPayments,
  getSubscriptions,
  markPaymentAsPaid,
  type Payment,
  type PaymentStatus,
  type Subscription,
  generateMonthlyPayments,
} from "@/services/financeService";

type PaymentStatusFilter = PaymentStatus | "ALL";
type NewPaymentStatus = "PENDING" | "PAID";

const statusStyles: Record<PaymentStatus, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELED: "bg-zinc-100 text-zinc-700",
};

const statusLabels: Record<PaymentStatus, string> = {
  PAID: "Pago",
  PENDING: "Pendente",
  OVERDUE: "Atrasado",
  CANCELED: "Cancelado",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string) {
  if (!date) return "-";

  const cleanDate = date.split("T")[0];
  const [year, month, day] = cleanDate.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getDateInputValue(daysToAdd = 30) {
  const date = new Date();

  date.setDate(date.getDate() + daysToAdd);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseCurrencyInput(value: string) {
  return Number(value.replace(/\./g, "").replace(",", "."));
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

function getEffectiveStatus(payment: Payment): PaymentStatus {
  if (payment.status === "PENDING" && isPastDueDate(payment.due_date)) {
    return "OVERDUE";
  }

  return payment.status;
}

async function fetchFinanceData() {
  const [paymentsData, subscriptionsData] = await Promise.all([
    getPayments(),
    getSubscriptions(),
  ]);

  return {
    paymentsData,
    subscriptionsData,
  };
}

export default function MasterFinanceiroPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("ALL");

  const [generateMonthlyLoading, setGenerateMonthlyLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("59,90");
  const [newPaymentDueDate, setNewPaymentDueDate] = useState(
    getDateInputValue(30),
  );
  const [newPaymentStatus, setNewPaymentStatus] =
    useState<NewPaymentStatus>("PENDING");

  const availableSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (subscription) => subscription.status !== "CANCELED",
    );
  }, [subscriptions]);

  async function handleRefreshFinanceData() {
    try {
      setLoading(true);
      setError("");

      const { paymentsData, subscriptionsData } = await fetchFinanceData();

      setPayments(paymentsData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar dados financeiros";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialFinanceData() {
      try {
        const { paymentsData, subscriptionsData } = await fetchFinanceData();

        if (!isMounted) return;

        setPayments(paymentsData);
        setSubscriptions(subscriptionsData);
      } catch (err) {
        if (!isMounted) return;

        const message =
          err instanceof Error
            ? err.message
            : "Erro ao carregar dados financeiros";

        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialFinanceData();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const expectedRevenue = subscriptions
      .filter((subscription) => subscription.status !== "CANCELED")
      .reduce((total, subscription) => total + subscription.monthly_price, 0);

    const received = payments
      .filter((payment) => payment.status === "PAID")
      .reduce((total, payment) => total + payment.amount, 0);

    const pending = payments
      .filter((payment) => getEffectiveStatus(payment) === "PENDING")
      .reduce((total, payment) => total + payment.amount, 0);

    const overdue = payments
      .filter((payment) => getEffectiveStatus(payment) === "OVERDUE")
      .reduce((total, payment) => total + payment.amount, 0);

    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "ACTIVE",
    ).length;

    return {
      expectedRevenue,
      received,
      pending,
      overdue,
      activeSubscriptions,
    };
  }, [payments, subscriptions]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const status = getEffectiveStatus(payment);

      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      const searchableContent = [
        payment.restaurant_name ?? "",
        payment.restaurant_slug ?? "",
        payment.plan_name ?? "",
        formatCurrency(payment.amount),
        formatDate(payment.due_date),
        statusLabels[status],
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableContent.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [payments, searchTerm, statusFilter]);

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "ALL";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("ALL");
  }

  function openCreateModal() {
    const firstSubscriptionId = availableSubscriptions[0]?.id ?? "";

    setSelectedSubscriptionId(
      (currentSubscriptionId) => currentSubscriptionId || firstSubscriptionId,
    );

    setNewPaymentAmount("59,90");
    setNewPaymentDueDate(getDateInputValue(30));
    setNewPaymentStatus("PENDING");
    setCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (createLoading) return;

    setCreateModalOpen(false);
  }

  async function handleGenerateMonthlyPayments() {
    const confirmed = window.confirm(
      "Deseja gerar as faturas mensais das assinaturas ativas? O sistema não vai duplicar meses que já possuem fatura pendente, paga ou atrasada.",
    );

    if (!confirmed) return;

    try {
      setGenerateMonthlyLoading(true);

      const result = await generateMonthlyPayments();

      alert(
        [
          "Geração mensal finalizada.",
          `Assinaturas prontas: ${result.total_subscriptions_ready}`,
          `Faturas geradas: ${result.generated_count}`,
          `Faturas puladas: ${result.skipped_count}`,
        ].join("\n"),
      );

      await handleRefreshFinanceData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao gerar faturas mensais";

      alert(message);
    } finally {
      setGenerateMonthlyLoading(false);
    }
  }

  async function handleCreatePayment() {
    const effectiveSubscriptionId =
      selectedSubscriptionId || availableSubscriptions[0]?.id || "";

    const selectedSubscription = availableSubscriptions.find(
      (subscription) => subscription.id === effectiveSubscriptionId,
    );

    if (!selectedSubscription) {
      alert("Selecione uma assinatura válida.");
      return;
    }

    const amount = parseCurrencyInput(newPaymentAmount);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      alert("Informe um valor válido para a fatura.");
      return;
    }

    if (!newPaymentDueDate) {
      alert("Informe a data de vencimento.");
      return;
    }

    try {
      setCreateLoading(true);

      const createdPayment = await createPayment({
        restaurant_id: selectedSubscription.restaurant_id,
        subscription_id: selectedSubscription.id,
        amount,
        due_date: newPaymentDueDate,
        status: "PENDING",
      });

      let finalPayment = createdPayment;

      if (newPaymentStatus === "PAID") {
        finalPayment = await markPaymentAsPaid(createdPayment.id);
      }

      const paymentWithDetails: Payment = {
        ...finalPayment,
        restaurant_name: selectedSubscription.restaurant_name,
        restaurant_slug: selectedSubscription.restaurant_slug,
        plan_name: selectedSubscription.plan_name,
        subscription_status: selectedSubscription.status,
      };

      setPayments((currentPayments) => [
        paymentWithDetails,
        ...currentPayments,
      ]);

      setCreateModalOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar fatura";

      alert(message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleMarkAsPaid(payment: Payment) {
    const confirmed = window.confirm("Deseja marcar esta fatura como paga?");

    if (!confirmed) return;

    try {
      setActionLoading(payment.id);

      const updatedPayment = await markPaymentAsPaid(payment.id);

      setPayments((currentPayments) =>
        currentPayments.map((currentPayment) =>
          currentPayment.id === updatedPayment.id
            ? {
                ...currentPayment,
                ...updatedPayment,
                restaurant_name: currentPayment.restaurant_name,
                restaurant_slug: currentPayment.restaurant_slug,
                plan_name: currentPayment.plan_name,
                subscription_status: currentPayment.subscription_status,
              }
            : currentPayment,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao marcar fatura como paga";

      alert(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelPayment(payment: Payment) {
    const confirmed = window.confirm(
      "Deseja cancelar esta fatura? Essa ação não marca como paga.",
    );

    if (!confirmed) return;

    try {
      setActionLoading(payment.id);

      const updatedPayment = await cancelPayment(payment.id);

      setPayments((currentPayments) =>
        currentPayments.map((currentPayment) =>
          currentPayment.id === updatedPayment.id
            ? {
                ...currentPayment,
                ...updatedPayment,
                restaurant_name: currentPayment.restaurant_name,
                restaurant_slug: currentPayment.restaurant_slug,
                plan_name: currentPayment.plan_name,
                subscription_status: currentPayment.subscription_status,
              }
            : currentPayment,
        ),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cancelar fatura";

      alert(message);
    } finally {
      setActionLoading(null);
    }
  }

  function handleViewPayment(payment: Payment) {
    const status = getEffectiveStatus(payment);

    alert(
      [
        `Restaurante: ${payment.restaurant_name ?? "Não informado"}`,
        `Plano: ${payment.plan_name ?? "MenuFlow Completo"}`,
        `Valor: ${formatCurrency(payment.amount)}`,
        `Vencimento: ${formatDate(payment.due_date)}`,
        `Status: ${statusLabels[status]}`,
        payment.paid_at
          ? `Pago em: ${formatDate(payment.paid_at)}`
          : "Pago em: -",
      ].join("\n"),
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Financeiro</h1>

              <p className="text-muted-foreground">
                Gerencie receitas, cobranças e pagamentos reais da plataforma.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCreateModal}
                disabled={loading || availableSubscriptions.length === 0}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Nova fatura
              </button>

              <button
                type="button"
                onClick={handleGenerateMonthlyPayments}
                disabled={loading || generateMonthlyLoading}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generateMonthlyLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Gerar mensais
              </button>

              <button
                type="button"
                onClick={handleRefreshFinanceData}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Atualizar
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MasterMetricCard
              title="Receita Mensal"
              value={formatCurrency(metrics.expectedRevenue)}
              description={`${metrics.activeSubscriptions} assinaturas ativas`}
              icon={<DollarSign size={24} />}
            />

            <MasterMetricCard
              title="Recebido"
              value={formatCurrency(metrics.received)}
              description="Pagamentos confirmados"
              icon={<CheckCircle size={24} />}
            />

            <MasterMetricCard
              title="Pendente"
              value={formatCurrency(metrics.pending)}
              description="Aguardando pagamento"
              icon={<Wallet size={24} />}
            />

            <MasterMetricCard
              title="Atrasado"
              value={formatCurrency(metrics.overdue)}
              description="Cobranças vencidas"
              icon={<XCircle size={24} />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Cobranças</h2>

                    <p className="text-sm text-muted-foreground">
                      Faturas reais cadastradas no banco de dados.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Pesquisar restaurante, plano..."
                        className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary md:w-72"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value as PaymentStatusFilter,
                        )
                      }
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="ALL">Todos os status</option>
                      <option value="PAID">Pago</option>
                      <option value="PENDING">Pendente</option>
                      <option value="OVERDUE">Atrasado</option>
                      <option value="CANCELED">Cancelado</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-accent"
                      >
                        <X className="h-4 w-4" />
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  Mostrando {filteredPayments.length} de {payments.length}{" "}
                  faturas.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-5 py-4 font-medium">Restaurante</th>
                      <th className="px-5 py-4 font-medium">Plano</th>
                      <th className="px-5 py-4 font-medium">Valor</th>
                      <th className="px-5 py-4 font-medium">Vencimento</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 text-right font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-muted-foreground"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando financeiro...
                          </div>
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-muted-foreground"
                        >
                          Nenhuma fatura encontrada com os filtros atuais.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => {
                        const status = getEffectiveStatus(payment);
                        const isPaid = payment.status === "PAID";
                        const isCanceled = payment.status === "CANCELED";
                        const isCurrentActionLoading =
                          actionLoading === payment.id;

                        return (
                          <tr key={payment.id} className="hover:bg-accent/50">
                            <td className="px-5 py-4 font-medium">
                              {payment.restaurant_name ??
                                "Restaurante não informado"}
                            </td>

                            <td className="px-5 py-4 text-muted-foreground">
                              {payment.plan_name ?? "MenuFlow Completo"}
                            </td>

                            <td className="px-5 py-4 text-muted-foreground">
                              {formatCurrency(payment.amount)}
                            </td>

                            <td className="px-5 py-4 text-muted-foreground">
                              {formatDate(payment.due_date)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
                              >
                                {statusLabels[status]}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewPayment(payment)}
                                  className="rounded-lg border border-border p-2 hover:bg-accent"
                                  title="Ver detalhes"
                                >
                                  <Eye size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    alert(
                                      "Geração de recibo/PDF será implementada depois.",
                                    )
                                  }
                                  className="rounded-lg border border-border p-2 hover:bg-accent"
                                  title="Recibo em breve"
                                >
                                  <FileText size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPaid(payment)}
                                  disabled={
                                    isPaid ||
                                    isCanceled ||
                                    isCurrentActionLoading
                                  }
                                  className="rounded-lg border border-border p-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Marcar como paga"
                                >
                                  {isCurrentActionLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle size={16} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleCancelPayment(payment)}
                                  disabled={
                                    isPaid ||
                                    isCanceled ||
                                    isCurrentActionLoading
                                  }
                                  className="rounded-lg border border-border p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Cancelar fatura"
                                >
                                  <XCircle size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-5 text-lg font-semibold">Resumo do Mês</h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Receita Prevista
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(metrics.expectedRevenue)}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Recebido</p>

                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.received)}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Pendente</p>

                  <p className="mt-1 text-2xl font-bold text-yellow-600">
                    {formatCurrency(metrics.pending)}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Atrasado</p>

                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {formatCurrency(metrics.overdue)}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Assinaturas ativas
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {metrics.activeSubscriptions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Nova fatura</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Crie uma cobrança manual para um restaurante.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={createLoading}
                className="rounded-lg border border-border p-2 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium">Restaurante</label>

                <select
                  value={
                    selectedSubscriptionId ||
                    availableSubscriptions[0]?.id ||
                    ""
                  }
                  onChange={(event) =>
                    setSelectedSubscriptionId(event.target.value)
                  }
                  disabled={createLoading}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {availableSubscriptions.length === 0 ? (
                    <option value="">Nenhuma assinatura disponível</option>
                  ) : (
                    availableSubscriptions.map((subscription) => (
                      <option key={subscription.id} value={subscription.id}>
                        {subscription.restaurant_name ??
                          subscription.restaurant_slug ??
                          "Restaurante"}{" "}
                        - {subscription.plan_name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Valor</label>

                <input
                  value={newPaymentAmount}
                  onChange={(event) => setNewPaymentAmount(event.target.value)}
                  disabled={createLoading}
                  placeholder="59,90"
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Vencimento</label>

                <input
                  type="date"
                  value={newPaymentDueDate}
                  onChange={(event) => setNewPaymentDueDate(event.target.value)}
                  disabled={createLoading}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status inicial</label>

                <select
                  value={newPaymentStatus}
                  onChange={(event) =>
                    setNewPaymentStatus(event.target.value as NewPaymentStatus)
                  }
                  disabled={createLoading}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="PENDING">Pendente</option>
                  <option value="PAID">Já paga</option>
                </select>

                <p className="mt-2 text-xs text-muted-foreground">
                  Se marcar como “Já paga”, o sistema cria a fatura e registra o
                  pagamento manualmente.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={createLoading}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleCreatePayment}
                disabled={createLoading || availableSubscriptions.length === 0}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar fatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
