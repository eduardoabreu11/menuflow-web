"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  DollarSign,
  ExternalLink,
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
  createAsaasCharge,
  createPayment,
  generateMonthlyPayments,
  getPaymentReminders,
  getPayments,
  getSubscriptions,
  markPaymentAsPaid,
  type Payment,
  type PaymentGatewayProvider,
  type PaymentReminder,
  type PaymentReminderChannel,
  type PaymentReminderStatus,
  type PaymentReminderType,
  type PaymentStatus,
  type Subscription,
} from "@/services/financeService";

type FinanceTab = "PAYMENTS" | "REMINDERS";
type PaymentStatusFilter = PaymentStatus | "ALL";
type ReminderStatusFilter = PaymentReminderStatus | "ALL";
type MetricsPeriod = "CURRENT_MONTH" | "ALL" | "CUSTOM_MONTH";

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

const gatewayLabels: Record<PaymentGatewayProvider, string> = {
  MANUAL: "Manual",
  ASAAS: "Asaas",
};

const gatewayStyles: Record<PaymentGatewayProvider, string> = {
  MANUAL: "bg-zinc-100 text-zinc-700",
  ASAAS: "bg-blue-100 text-blue-700",
};

const metricsPeriodLabels: Record<MetricsPeriod, string> = {
  CURRENT_MONTH: "Este mês",
  ALL: "Todos os meses",
  CUSTOM_MONTH: "Mês específico",
};

const reminderTypeLabels: Record<PaymentReminderType, string> = {
  BEFORE_DUE: "Antes do vencimento",
  DUE_TODAY: "Vence hoje",
  OVERDUE: "Atrasado",
  BLOCKED: "Bloqueado",
};

const reminderStatusLabels: Record<PaymentReminderStatus, string> = {
  PENDING: "Pendente",
  SENT: "Enviado",
  FAILED: "Falhou",
  SKIPPED: "Ignorado",
};

const reminderStatusStyles: Record<PaymentReminderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SENT: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  SKIPPED: "bg-zinc-100 text-zinc-700",
};

const reminderChannelLabels: Record<PaymentReminderChannel, string> = {
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
};

const reminderChannelStyles: Record<PaymentReminderChannel, string> = {
  EMAIL: "bg-blue-100 text-blue-700",
  WHATSAPP: "bg-green-100 text-green-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCurrencyInput(value: number | string | null | undefined) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  if (!date) return "-";

  const cleanDate = date.split("T")[0];
  const [year, month, day] = cleanDate.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function formatDateTime(date: string | null) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return formatDate(date);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsedDate);
}

function getDateInputValue(daysToAdd = 30) {
  const date = new Date();

  date.setDate(date.getDate() + daysToAdd);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonthKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
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

function getPaymentDateTime(payment: Payment) {
  const cleanDate = payment.due_date.split("T")[0];

  if (!cleanDate) return 0;

  return new Date(`${cleanDate}T00:00:00`).getTime();
}

function getPaymentMonthKey(payment: Payment) {
  const cleanDate = payment.due_date.split("T")[0];

  if (!cleanDate) return "";

  const [year, month] = cleanDate.split("-");

  if (!year || !month) return "";

  return `${year}-${month}`;
}

function isCurrentMonthPayment(payment: Payment) {
  return getPaymentMonthKey(payment) === getCurrentMonthKey();
}

function formatMonthLabel(monthKey: string) {
  const [yearText, monthText] = monthKey.split("-");

  const year = Number(yearText);
  const month = Number(monthText);

  if (!year || !month) return monthKey;

  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getEffectiveStatus(payment: Payment): PaymentStatus {
  if (payment.status === "PENDING" && isPastDueDate(payment.due_date)) {
    return "OVERDUE";
  }

  return payment.status;
}

function getPaymentGatewayProvider(payment: Payment): PaymentGatewayProvider {
  return payment.gateway_provider ?? "MANUAL";
}

function getPaymentInvoiceUrl(payment: Payment) {
  return payment.gateway_invoice_url ?? payment.gateway_payment_url ?? "";
}

function getReminderInvoiceUrl(reminder: PaymentReminder) {
  return reminder.gateway_invoice_url ?? reminder.gateway_payment_url ?? "";
}

function canGenerateAsaasCharge(payment: Payment) {
  return (
    payment.status === "PENDING" &&
    getPaymentGatewayProvider(payment) !== "ASAAS" &&
    !payment.gateway_payment_id
  );
}

function mergePaymentDetails(currentPayment: Payment, updatedPayment: Payment) {
  return {
    ...currentPayment,
    ...updatedPayment,
    owner_name: updatedPayment.owner_name ?? currentPayment.owner_name,
    owner_email: updatedPayment.owner_email ?? currentPayment.owner_email,
    total_restaurants:
      updatedPayment.total_restaurants ?? currentPayment.total_restaurants,
    plan_name: updatedPayment.plan_name ?? currentPayment.plan_name,
    subscription_status:
      updatedPayment.subscription_status ?? currentPayment.subscription_status,
  };
}

function getPaymentsByPeriod(
  payments: Payment[],
  metricsPeriod: MetricsPeriod,
  selectedMonth: string,
) {
  return payments
    .filter((payment) => {
      if (metricsPeriod === "CURRENT_MONTH") {
        return isCurrentMonthPayment(payment);
      }

      if (metricsPeriod === "CUSTOM_MONTH") {
        return getPaymentMonthKey(payment) === selectedMonth;
      }

      return true;
    })
    .sort((a, b) => getPaymentDateTime(b) - getPaymentDateTime(a));
}

async function fetchFinanceData() {
  const [paymentsData, subscriptionsData, remindersData] = await Promise.all([
    getPayments(),
    getSubscriptions(),
    getPaymentReminders(),
  ]);

  return {
    paymentsData,
    subscriptionsData,
    remindersData,
  };
}

export default function MasterFinanceiroPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [asaasChargeLoading, setAsaasChargeLoading] = useState<string | null>(
    null,
  );
  const [generateMonthlyLoading, setGenerateMonthlyLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<FinanceTab>("PAYMENTS");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("ALL");
  const [metricsPeriod, setMetricsPeriod] =
    useState<MetricsPeriod>("CURRENT_MONTH");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  const [reminderSearchTerm, setReminderSearchTerm] = useState("");
  const [reminderStatusFilter, setReminderStatusFilter] =
    useState<ReminderStatusFilter>("ALL");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [newPaymentAmount, setNewPaymentAmount] = useState("0,00");
  const [newPaymentDueDate, setNewPaymentDueDate] = useState(
    getDateInputValue(30),
  );

  const availableSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (subscription) => subscription.status !== "CANCELED",
    );
  }, [subscriptions]);

  const selectedCreateSubscription = useMemo(() => {
    const effectiveSubscriptionId =
      selectedSubscriptionId || availableSubscriptions[0]?.id || "";

    return (
      availableSubscriptions.find(
        (subscription) => subscription.id === effectiveSubscriptionId,
      ) ?? null
    );
  }, [availableSubscriptions, selectedSubscriptionId]);

  const availableMonths = useMemo(() => {
    const monthMap = new Map<string, string>();

    payments.forEach((payment) => {
      const monthKey = getPaymentMonthKey(payment);

      if (!monthKey) return;

      monthMap.set(monthKey, formatMonthLabel(monthKey));
    });

    return Array.from(monthMap.entries())
      .map(([value, label]) => ({
        value,
        label,
      }))
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [payments]);

  const selectedPeriodLabel = useMemo(() => {
    if (metricsPeriod === "CUSTOM_MONTH") {
      return selectedMonth ? formatMonthLabel(selectedMonth) : "Mês específico";
    }

    return metricsPeriodLabels[metricsPeriod];
  }, [metricsPeriod, selectedMonth]);

  const periodPayments = useMemo(() => {
    return getPaymentsByPeriod(payments, metricsPeriod, selectedMonth);
  }, [payments, metricsPeriod, selectedMonth]);

  async function handleRefreshFinanceData() {
    try {
      setLoading(true);
      setError("");

      const { paymentsData, subscriptionsData, remindersData } =
        await fetchFinanceData();

      setPayments(paymentsData);
      setSubscriptions(subscriptionsData);
      setReminders(remindersData);
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
        const { paymentsData, subscriptionsData, remindersData } =
          await fetchFinanceData();

        if (!isMounted) return;

        setPayments(paymentsData);
        setSubscriptions(subscriptionsData);
        setReminders(remindersData);
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
    const validPayments = periodPayments.filter(
      (payment) => payment.status !== "CANCELED",
    );

    const monthlyRecurringRevenue = subscriptions
      .filter((subscription) => subscription.status === "ACTIVE")
      .reduce((total, subscription) => total + subscription.monthly_price, 0);

    const expectedRevenue = validPayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );

    const received = validPayments
      .filter((payment) => payment.status === "PAID")
      .reduce((total, payment) => total + payment.amount, 0);

    const pending = validPayments
      .filter((payment) => getEffectiveStatus(payment) === "PENDING")
      .reduce((total, payment) => total + payment.amount, 0);

    const overdue = validPayments
      .filter((payment) => getEffectiveStatus(payment) === "OVERDUE")
      .reduce((total, payment) => total + payment.amount, 0);

    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "ACTIVE",
    ).length;

    return {
      monthlyRecurringRevenue,
      expectedRevenue,
      received,
      pending,
      overdue,
      activeSubscriptions,
      validPaymentsCount: validPayments.length,
    };
  }, [periodPayments, subscriptions]);

  const reminderMetrics = useMemo(() => {
    const sent = reminders.filter((reminder) => reminder.status === "SENT");
    const failed = reminders.filter((reminder) => reminder.status === "FAILED");
    const email = reminders.filter((reminder) => reminder.channel === "EMAIL");
    const whatsapp = reminders.filter(
      (reminder) => reminder.channel === "WHATSAPP",
    );

    return {
      total: reminders.length,
      sent: sent.length,
      failed: failed.length,
      email: email.length,
      whatsapp: whatsapp.length,
    };
  }, [reminders]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return periodPayments.filter((payment) => {
      const status = getEffectiveStatus(payment);
      const gatewayProvider = getPaymentGatewayProvider(payment);

      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      const searchableContent = [
        payment.owner_name ?? "",
        payment.owner_email ?? "",
        payment.plan_name ?? "",
        gatewayLabels[gatewayProvider],
        payment.gateway_status ?? "",
        String(payment.total_restaurants ?? ""),
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
  }, [periodPayments, searchTerm, statusFilter]);

  const filteredReminders = useMemo(() => {
    const normalizedSearch = reminderSearchTerm.trim().toLowerCase();

    return reminders.filter((reminder) => {
      const matchesStatus =
        reminderStatusFilter === "ALL" ||
        reminder.status === reminderStatusFilter;

      const amountText =
        typeof reminder.amount === "number"
          ? formatCurrency(reminder.amount)
          : "";

      const searchableContent = [
        reminder.owner_name ?? "",
        reminder.owner_email ?? "",
        reminder.recipient ?? "",
        reminder.subject ?? "",
        reminder.message ?? "",
        reminder.channel ? reminderChannelLabels[reminder.channel] : "",
        reminder.reminder_type
          ? reminderTypeLabels[reminder.reminder_type]
          : "",
        reminder.status ? reminderStatusLabels[reminder.status] : "",
        reminder.gateway_status ?? "",
        amountText,
        reminder.due_date ? formatDate(reminder.due_date) : "",
        reminder.reminder_date ? formatDate(reminder.reminder_date) : "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableContent.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [reminders, reminderSearchTerm, reminderStatusFilter]);

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "ALL";

  const hasActiveReminderFilters =
    reminderSearchTerm.trim() !== "" || reminderStatusFilter !== "ALL";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("ALL");
  }

  function clearReminderFilters() {
    setReminderSearchTerm("");
    setReminderStatusFilter("ALL");
  }

  function handleMetricsPeriodChange(value: MetricsPeriod) {
    setMetricsPeriod(value);
    setSearchTerm("");
    setStatusFilter("ALL");

    if (value === "CUSTOM_MONTH") {
      const firstAvailableMonth = availableMonths[0]?.value;

      if (firstAvailableMonth) {
        setSelectedMonth(firstAvailableMonth);
      }
    }
  }

  function openCreateModal() {
    const firstSubscription = availableSubscriptions[0] ?? null;

    setSelectedSubscriptionId(firstSubscription?.id ?? "");
    setNewPaymentAmount(formatCurrencyInput(firstSubscription?.monthly_price));
    setNewPaymentDueDate(getDateInputValue(30));
    setCreateModalOpen(true);
  }

  function handleSelectedSubscriptionChange(subscriptionId: string) {
    const subscription =
      availableSubscriptions.find(
        (availableSubscription) =>
          availableSubscription.id === subscriptionId,
      ) ?? null;

    setSelectedSubscriptionId(subscriptionId);
    setNewPaymentAmount(formatCurrencyInput(subscription?.monthly_price));
  }

  function closeCreateModal() {
    if (createLoading) return;

    setCreateModalOpen(false);
  }

  function handleOpenInvoice(payment: Payment) {
    const invoiceUrl = getPaymentInvoiceUrl(payment);

    if (!invoiceUrl) {
      alert("Esta fatura ainda não possui link de pagamento.");
      return;
    }

    window.open(invoiceUrl, "_blank", "noopener,noreferrer");
  }

  function handleOpenReminderInvoice(reminder: PaymentReminder) {
    const invoiceUrl = getReminderInvoiceUrl(reminder);

    if (!invoiceUrl) {
      alert("Este lembrete não possui link de pagamento.");
      return;
    }

    window.open(invoiceUrl, "_blank", "noopener,noreferrer");
  }

  async function handleGenerateMonthlyPayments() {
    const confirmed = window.confirm(
      "Deseja gerar as faturas mensais das assinaturas ativas? O sistema não vai duplicar meses que já possuem fatura pendente, paga ou atrasada.",
    );

    if (!confirmed) return;

    try {
      setGenerateMonthlyLoading(true);

      const result = await generateMonthlyPayments({
        create_asaas_charges: true,
      });

      alert(
        [
          "Geração mensal finalizada.",
          `Assinaturas prontas: ${result.total_subscriptions_ready}`,
          `Faturas geradas: ${result.generated_count}`,
          `Faturas puladas: ${result.skipped_count}`,
          `Cobranças Asaas geradas: ${result.asaas_generated_count}`,
          `Cobranças Asaas com erro: ${result.asaas_failed_count}`,
          `Cobranças Asaas puladas: ${result.asaas_skipped_count}`,
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
        owner_user_id: selectedSubscription.owner_user_id,
        subscription_id: selectedSubscription.id,
        amount,
        due_date: newPaymentDueDate,
        status: "PENDING",
        create_asaas_charge: true,
      });

      const paymentWithDetails: Payment = {
        ...createdPayment,
        owner_name: selectedSubscription.owner_name,
        owner_email: selectedSubscription.owner_email,
        total_restaurants: selectedSubscription.total_restaurants,
        plan_name: selectedSubscription.plan_name,
        subscription_status: selectedSubscription.status,
      };

      setPayments((currentPayments) => [
        paymentWithDetails,
        ...currentPayments,
      ]);

      setCreateModalOpen(false);

      const invoiceUrl = getPaymentInvoiceUrl(createdPayment);

      if (invoiceUrl) {
        const openInvoice = window.confirm(
          "Fatura criada no Asaas com sucesso. Deseja abrir o link de pagamento agora?",
        );

        if (openInvoice) {
          window.open(invoiceUrl, "_blank", "noopener,noreferrer");
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar fatura";

      alert(message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleCreateAsaasCharge(payment: Payment) {
    if (!canGenerateAsaasCharge(payment)) {
      alert("Esta fatura não pode gerar cobrança Asaas.");
      return;
    }

    const confirmed = window.confirm(
      "Deseja gerar uma cobrança no Asaas para esta fatura?",
    );

    if (!confirmed) return;

    try {
      setAsaasChargeLoading(payment.id);

      const result = await createAsaasCharge(payment.id, {
        billing_type: "UNDEFINED",
      });

      setPayments((currentPayments) =>
        currentPayments.map((currentPayment) =>
          currentPayment.id === result.payment.id
            ? mergePaymentDetails(currentPayment, result.payment)
            : currentPayment,
        ),
      );

      const invoiceUrl = getPaymentInvoiceUrl(result.payment);

      if (invoiceUrl) {
        const openNow = window.confirm(
          "Cobrança Asaas gerada com sucesso. Deseja abrir a fatura agora?",
        );

        if (openNow) {
          window.open(invoiceUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        alert("Cobrança Asaas gerada com sucesso.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao gerar cobrança Asaas";

      alert(message);
    } finally {
      setAsaasChargeLoading(null);
    }
  }

  async function handleMarkAsPaid(payment: Payment) {
    const gatewayProvider = getPaymentGatewayProvider(payment);

    if (gatewayProvider === "ASAAS") {
      alert(
        "Faturas Asaas devem ser marcadas como pagas automaticamente pelo webhook do Asaas.",
      );
      return;
    }

    const confirmed = window.confirm("Deseja marcar esta fatura como paga?");

    if (!confirmed) return;

    try {
      setActionLoading(payment.id);

      const updatedPayment = await markPaymentAsPaid(payment.id);

      setPayments((currentPayments) =>
        currentPayments.map((currentPayment) =>
          currentPayment.id === updatedPayment.id
            ? mergePaymentDetails(currentPayment, updatedPayment)
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
            ? mergePaymentDetails(currentPayment, updatedPayment)
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
    const gatewayProvider = getPaymentGatewayProvider(payment);
    const invoiceUrl = getPaymentInvoiceUrl(payment);

    alert(
      [
        `Cliente/Dono: ${payment.owner_name ?? "Não informado"}`,
        `E-mail: ${payment.owner_email ?? "-"}`,
        `Restaurantes: ${payment.total_restaurants ?? 0}`,
        `Plano: ${payment.plan_name ?? "Serviu Completo"}`,
        `Valor: ${formatCurrency(payment.amount)}`,
        `Vencimento: ${formatDate(payment.due_date)}`,
        `Status: ${statusLabels[status]}`,
        `Gateway: ${gatewayLabels[gatewayProvider]}`,
        `Status Gateway: ${payment.gateway_status ?? "-"}`,
        `ID Gateway: ${payment.gateway_payment_id ?? "-"}`,
        `Link da fatura: ${invoiceUrl || "-"}`,
        payment.paid_at
          ? `Pago em: ${formatDate(payment.paid_at)}`
          : "Pago em: -",
      ].join("\n"),
    );
  }

  function handleViewReminder(reminder: PaymentReminder) {
    const invoiceUrl = getReminderInvoiceUrl(reminder);

    alert(
      [
        `Cliente/Dono: ${reminder.owner_name ?? "Não informado"}`,
        `E-mail do dono: ${reminder.owner_email ?? "-"}`,
        `Destinatário: ${reminder.recipient ?? "-"}`,
        `Canal: ${reminderChannelLabels[reminder.channel]}`,
        `Tipo: ${reminderTypeLabels[reminder.reminder_type]}`,
        `Status: ${reminderStatusLabels[reminder.status]}`,
        `Data do lembrete: ${formatDate(reminder.reminder_date)}`,
        `Enviado em: ${formatDateTime(reminder.sent_at)}`,
        `Valor da fatura: ${
          typeof reminder.amount === "number"
            ? formatCurrency(reminder.amount)
            : "-"
        }`,
        `Vencimento: ${reminder.due_date ? formatDate(reminder.due_date) : "-"}`,
        `Status da fatura: ${reminder.payment_status ?? "-"}`,
        `Gateway: ${reminder.gateway_provider ?? "-"}`,
        `Status Gateway: ${reminder.gateway_status ?? "-"}`,
        `Assunto: ${reminder.subject ?? "-"}`,
        `Link da fatura: ${invoiceUrl || "-"}`,
        `Erro: ${reminder.error_message ?? "-"}`,
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
                Gerencie receitas, cobranças, pagamentos e lembretes da
                plataforma.
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

          <div className="mb-5 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div>
                <p className="text-sm font-medium">Filtros gerais</p>

                <p className="text-xs text-muted-foreground">
                  Escolha o período e filtre as cobranças ou lembretes no mesmo
                  bloco.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Período
                  </label>

                  <select
                    value={metricsPeriod}
                    onChange={(event) =>
                      handleMetricsPeriodChange(
                        event.target.value as MetricsPeriod,
                      )
                    }
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="CURRENT_MONTH">Este mês</option>
                    <option value="ALL">Todos os meses</option>
                    <option value="CUSTOM_MONTH">Mês específico</option>
                  </select>
                </div>

                {metricsPeriod === "CUSTOM_MONTH" && (
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Mês
                    </label>

                    <select
                      value={selectedMonth}
                      onChange={(event) => {
                        setSelectedMonth(event.target.value);
                        setSearchTerm("");
                        setStatusFilter("ALL");
                      }}
                      disabled={availableMonths.length === 0}
                      className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {availableMonths.length === 0 ? (
                        <option value="">Nenhum mês disponível</option>
                      ) : (
                        availableMonths.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {activeTab === "PAYMENTS" ? (
                  <>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Buscar cobrança
                      </label>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Cliente, e-mail, plano..."
                          className="h-10 w-72 rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Status
                      </label>

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
                    </div>

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
                  </>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Buscar lembrete
                      </label>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <input
                          value={reminderSearchTerm}
                          onChange={(event) =>
                            setReminderSearchTerm(event.target.value)
                          }
                          placeholder="Cliente, e-mail, assunto..."
                          className="h-10 w-72 rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Status
                      </label>

                      <select
                        value={reminderStatusFilter}
                        onChange={(event) =>
                          setReminderStatusFilter(
                            event.target.value as ReminderStatusFilter,
                          )
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      >
                        <option value="ALL">Todos os status</option>
                        <option value="PENDING">Pendente</option>
                        <option value="SENT">Enviado</option>
                        <option value="FAILED">Falhou</option>
                        <option value="SKIPPED">Ignorado</option>
                      </select>
                    </div>

                    {hasActiveReminderFilters && (
                      <button
                        type="button"
                        onClick={clearReminderFilters}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-accent"
                      >
                        <X className="h-4 w-4" />
                        Limpar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MasterMetricCard
              title="Receita Mensal"
              value={formatCurrency(metrics.monthlyRecurringRevenue)}
              description={`${metrics.activeSubscriptions} assinaturas ativas`}
              icon={<DollarSign size={24} />}
            />

            <MasterMetricCard
              title="Recebido"
              value={formatCurrency(metrics.received)}
              description={selectedPeriodLabel}
              icon={<CheckCircle size={24} />}
            />

            <MasterMetricCard
              title="Pendente"
              value={formatCurrency(metrics.pending)}
              description={selectedPeriodLabel}
              icon={<Wallet size={24} />}
            />

            <MasterMetricCard
              title="Atrasado"
              value={formatCurrency(metrics.overdue)}
              description={selectedPeriodLabel}
              icon={<XCircle size={24} />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("PAYMENTS")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                          activeTab === "PAYMENTS"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border hover:bg-accent"
                        }`}
                      >
                        Cobranças
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("REMINDERS")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                          activeTab === "REMINDERS"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border hover:bg-accent"
                        }`}
                      >
                        Lembretes
                      </button>
                    </div>

                    {activeTab === "PAYMENTS" ? (
                      <>
                        <h2 className="text-lg font-semibold">Cobranças</h2>

                        <p className="text-sm text-muted-foreground">
                          Faturas do período: {selectedPeriodLabel}.
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold">
                          Histórico de lembretes
                        </h2>

                        <p className="text-sm text-muted-foreground">
                          Lembretes enviados por e-mail ou WhatsApp.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {activeTab === "PAYMENTS" ? (
                      <>
                        Mostrando {filteredPayments.length} de{" "}
                        {periodPayments.length} faturas do período. Total geral:{" "}
                        {payments.length}.
                      </>
                    ) : (
                      <>
                        Mostrando {filteredReminders.length} de{" "}
                        {reminders.length} lembrete(s).
                      </>
                    )}
                  </div>
                </div>
              </div>

              {activeTab === "PAYMENTS" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40">
                      <tr>
                        <th className="px-5 py-4 font-medium">Cliente/Dono</th>
                        <th className="px-5 py-4 font-medium">E-mail</th>
                        <th className="px-5 py-4 font-medium">Restaurantes</th>
                        <th className="px-5 py-4 font-medium">Plano</th>
                        <th className="px-5 py-4 font-medium">Valor</th>
                        <th className="px-5 py-4 font-medium">Vencimento</th>
                        <th className="px-5 py-4 font-medium">Gateway</th>
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
                            colSpan={9}
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
                            colSpan={9}
                            className="px-5 py-10 text-center text-muted-foreground"
                          >
                            Nenhuma fatura encontrada neste período/filtro.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment) => {
                          const status = getEffectiveStatus(payment);
                          const gatewayProvider =
                            getPaymentGatewayProvider(payment);
                          const isAsaasPayment = gatewayProvider === "ASAAS";
                          const invoiceUrl = getPaymentInvoiceUrl(payment);

                          const isPaid = payment.status === "PAID";
                          const isCanceled = payment.status === "CANCELED";
                          const isCurrentActionLoading =
                            actionLoading === payment.id;
                          const isCurrentAsaasChargeLoading =
                            asaasChargeLoading === payment.id;
                          const isAnyPaymentActionLoading =
                            isCurrentActionLoading ||
                            isCurrentAsaasChargeLoading;

                          return (
                            <tr key={payment.id} className="hover:bg-accent/50">
                              <td className="px-5 py-4 font-medium">
                                {payment.owner_name ?? "Cliente não informado"}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {payment.owner_email ?? "-"}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {payment.total_restaurants ?? 0}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {payment.plan_name ?? "Serviu Completo"}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {formatCurrency(payment.amount)}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {formatDate(payment.due_date)}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-1">
                                  <span
                                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${gatewayStyles[gatewayProvider]}`}
                                  >
                                    {gatewayLabels[gatewayProvider]}
                                  </span>

                                  {payment.gateway_status && (
                                    <span className="text-xs text-muted-foreground">
                                      {payment.gateway_status}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
                                >
                                  {statusLabels[status]}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewPayment(payment)}
                                    className="rounded-lg border border-border p-2 hover:bg-accent"
                                    title="Ver detalhes"
                                  >
                                    <Eye size={16} />
                                  </button>

                                  {invoiceUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInvoice(payment)}
                                      className="rounded-lg border border-border p-2 text-blue-700 hover:bg-blue-50"
                                      title="Abrir fatura Asaas"
                                    >
                                      <ExternalLink size={16} />
                                    </button>
                                  )}

                                  {canGenerateAsaasCharge(payment) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCreateAsaasCharge(payment)
                                      }
                                      disabled={isAnyPaymentActionLoading}
                                      className="rounded-lg border border-border p-2 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                      title="Gerar cobrança Asaas"
                                    >
                                      {isCurrentAsaasChargeLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CreditCard size={16} />
                                      )}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsPaid(payment)}
                                    disabled={
                                      isPaid ||
                                      isCanceled ||
                                      isAsaasPayment ||
                                      isAnyPaymentActionLoading
                                    }
                                    className="rounded-lg border border-border p-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    title={
                                      isAsaasPayment
                                        ? "Pagamento Asaas é confirmado automaticamente pelo webhook"
                                        : "Marcar como paga"
                                    }
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
                                      isAnyPaymentActionLoading
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
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40">
                      <tr>
                        <th className="px-5 py-4 font-medium">Cliente</th>
                        <th className="px-5 py-4 font-medium">Destinatário</th>
                        <th className="px-5 py-4 font-medium">Canal</th>
                        <th className="px-5 py-4 font-medium">Tipo</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Fatura</th>
                        <th className="px-5 py-4 font-medium">Vencimento</th>
                        <th className="px-5 py-4 font-medium">Enviado em</th>
                        <th className="px-5 py-4 font-medium">Erro</th>
                        <th className="px-5 py-4 text-right font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-5 py-10 text-center text-muted-foreground"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Carregando lembretes...
                            </div>
                          </td>
                        </tr>
                      ) : filteredReminders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-5 py-10 text-center text-muted-foreground"
                          >
                            Nenhum lembrete encontrado.
                          </td>
                        </tr>
                      ) : (
                        filteredReminders.map((reminder) => {
                          const invoiceUrl = getReminderInvoiceUrl(reminder);

                          return (
                            <tr
                              key={reminder.id}
                              className="hover:bg-accent/50"
                            >
                              <td className="px-5 py-4">
                                <div className="font-medium">
                                  {reminder.owner_name ??
                                    "Cliente não informado"}
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  {reminder.owner_email ?? "-"}
                                </div>
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {reminder.recipient ?? "-"}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${reminderChannelStyles[reminder.channel]}`}
                                >
                                  {reminderChannelLabels[reminder.channel]}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {reminderTypeLabels[reminder.reminder_type]}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${reminderStatusStyles[reminder.status]}`}
                                >
                                  {reminderStatusLabels[reminder.status]}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {typeof reminder.amount === "number"
                                  ? formatCurrency(reminder.amount)
                                  : "-"}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {reminder.due_date
                                  ? formatDate(reminder.due_date)
                                  : "-"}
                              </td>

                              <td className="px-5 py-4 text-muted-foreground">
                                {formatDateTime(reminder.sent_at)}
                              </td>

                              <td className="max-w-56 truncate px-5 py-4 text-muted-foreground">
                                {reminder.error_message ?? "-"}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewReminder(reminder)}
                                    className="rounded-lg border border-border p-2 hover:bg-accent"
                                    title="Ver detalhes"
                                  >
                                    <Eye size={16} />
                                  </button>

                                  {invoiceUrl && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenReminderInvoice(reminder)
                                      }
                                      className="rounded-lg border border-border p-2 text-blue-700 hover:bg-blue-50"
                                      title="Abrir fatura"
                                    >
                                      <ExternalLink size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-5 text-lg font-semibold">Resumo</h2>

              <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Período selecionado
                </p>

                <p className="text-sm font-semibold">{selectedPeriodLabel}</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Previsto</p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(metrics.expectedRevenue)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {metrics.validPaymentsCount} fatura(s) válida(s)
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

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Lembretes enviados
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {reminderMetrics.sent}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {reminderMetrics.total} registro(s) no histórico
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Falhas em lembretes
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {reminderMetrics.failed}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    E-mail: {reminderMetrics.email} · WhatsApp:{" "}
                    {reminderMetrics.whatsapp}
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
                  Crie uma cobrança no Asaas para um cliente/dono.
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
                <label className="text-sm font-medium">Cliente/Dono</label>

                <select
                  value={
                    selectedSubscriptionId ||
                    availableSubscriptions[0]?.id ||
                    ""
                  }
                  onChange={(event) =>
                    handleSelectedSubscriptionChange(event.target.value)
                  }
                  disabled={createLoading}
                  className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {availableSubscriptions.length === 0 ? (
                    <option value="">Nenhuma assinatura disponível</option>
                  ) : (
                    availableSubscriptions.map((subscription) => (
                      <option key={subscription.id} value={subscription.id}>
                        {subscription.owner_name ?? "Cliente"} -{" "}
                        {subscription.owner_email ?? "-"} -{" "}
                        {subscription.total_restaurants ?? 0} restaurante(s) -{" "}
                        {subscription.plan_name} -{" "}
                        {formatCurrency(subscription.monthly_price)}/mês
                      </option>
                    ))
                  )}
                </select>

                {selectedCreateSubscription && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Valor padrão desta assinatura:{" "}
                    {formatCurrency(selectedCreateSubscription.monthly_price)}
                    /mês.
                  </p>
                )}
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

                <p className="mt-2 text-xs text-muted-foreground">
                  O valor vem automaticamente da assinatura selecionada, mas pode
                  ser ajustado manualmente antes de gerar a cobrança.
                </p>
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

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
                A fatura será criada como pendente no Asaas. Quando o cliente
                pagar, o webhook do Asaas confirmará o pagamento
                automaticamente.
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
                Criar cobrança Asaas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}