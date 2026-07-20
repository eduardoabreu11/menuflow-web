"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Calendar,
  CreditCard,
  Eye,
  Lock,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Unlock,
  UserRound,
} from "lucide-react";

import ConfirmDialog from "@/components/ConfirmDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

import {
  activateUser,
  createUser,
  deleteUser,
  disableUser,
  getUsers,
  updateUser,
  type User,
  type UserRole,
} from "@/services/userService";

import { getPlans, type Plan } from "@/services/planService";

import {
  cancelSubscription,
  createSubscription,
  getPayments,
  getSubscriptions,
  updateSubscription,
  type Payment,
  type Subscription,
} from "@/services/financeService";

type EditableUserRole = "MASTER" | "RESTAURANT_OWNER";
type RoleFilter = "ALL" | EditableUserRole;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

type SubscriptionFilter =
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "OVERDUE"
  | "CANCELED"
  | "NONE"
  | "FINANCE_PENDING"
  | "FINANCE_OVERDUE"
  | "FINANCE_BLOCKED"
  | "NO_PAYMENT";

type ManageSubscriptionStatus = "ACTIVE" | "PENDING" | "OVERDUE";

function getRoleLabel(role: UserRole) {
  if (role === "MASTER") return "Master";
  if (role === "RESTAURANT_OWNER") return "Dono";

  return "Outro";
}

function getRoleStyle(role: UserRole) {
  if (role === "MASTER") return "bg-purple-100 text-purple-700";
  if (role === "RESTAURANT_OWNER") return "bg-primary/10 text-primary";

  return "bg-zinc-100 text-zinc-700";
}

function getSubscriptionStatusLabel(status?: string) {
  if (status === "ACTIVE") return "Ativa";
  if (status === "PENDING") return "Pendente";
  if (status === "OVERDUE") return "Em atraso";
  if (status === "CANCELED") return "Cancelada";

  return "Sem assinatura";
}

function getSubscriptionStatusStyle(status?: string) {
  if (status === "ACTIVE") return "bg-green-100 text-green-700";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "OVERDUE") return "bg-red-100 text-red-700";
  if (status === "CANCELED") return "bg-zinc-100 text-zinc-700";

  return "bg-zinc-100 text-zinc-700";
}

type OwnerFinancialStatus =
  | "PAID"
  | "PENDING"
  | "OVERDUE"
  | "BLOCKED"
  | "CANCELED"
  | "NO_PAYMENT"
  | "NO_SUBSCRIPTION";

function getOwnerFinancialStatusLabel(status: OwnerFinancialStatus) {
  if (status === "PAID") return "Pago";
  if (status === "PENDING") return "Pendente";
  if (status === "OVERDUE") return "Atrasado";
  if (status === "BLOCKED") return "Bloqueável";
  if (status === "CANCELED") return "Cancelado";
  if (status === "NO_PAYMENT") return "Sem fatura";

  return "Sem assinatura";
}

function getOwnerFinancialStatusStyle(status: OwnerFinancialStatus) {
  if (status === "PAID") return "bg-green-100 text-green-700";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  if (status === "OVERDUE") return "bg-orange-100 text-orange-700";
  if (status === "BLOCKED") return "bg-red-100 text-red-700";
  if (status === "CANCELED") return "bg-zinc-100 text-zinc-700";

  return "bg-zinc-100 text-zinc-700";
}

function getCleanDate(value?: string | null) {
  return value?.split("T")[0] ?? "";
}

function getLocalDateFromDateString(value?: string | null) {
  const cleanDate = getCleanDate(value);
  const [year, month, day] = cleanDate.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getDaysLate(value?: string | null) {
  const date = getLocalDateFromDateString(value);

  if (!date) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  const diffInMs = today.getTime() - date.getTime();

  if (diffInMs <= 0) return 0;

  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

function getPaymentDateTime(payment: Payment) {
  const date = getLocalDateFromDateString(payment.due_date);

  return date?.getTime() ?? 0;
}

function getOwnerFinancialInfo(
  subscription?: Subscription | null,
  payment?: Payment | null,
) {
  if (!subscription || subscription.status === "CANCELED") {
    return {
      status: "NO_SUBSCRIPTION" as OwnerFinancialStatus,
      label: getOwnerFinancialStatusLabel("NO_SUBSCRIPTION"),
      style: getOwnerFinancialStatusStyle("NO_SUBSCRIPTION"),
      description: "Sem assinatura ativa",
      dueDate: null,
    };
  }

  if (!payment) {
    return {
      status: "NO_PAYMENT" as OwnerFinancialStatus,
      label: getOwnerFinancialStatusLabel("NO_PAYMENT"),
      style: getOwnerFinancialStatusStyle("NO_PAYMENT"),
      description: `Próximo vencimento: ${formatDate(subscription.next_billing_date)}`,
      dueDate: subscription.next_billing_date,
    };
  }

  const daysLate = getDaysLate(payment.due_date);

  if (payment.status === "PAID") {
    return {
      status: "PAID" as OwnerFinancialStatus,
      label: getOwnerFinancialStatusLabel("PAID"),
      style: getOwnerFinancialStatusStyle("PAID"),
      description: `Fatura paga · venc. ${formatDate(payment.due_date)}`,
      dueDate: payment.due_date,
    };
  }

  if (payment.status === "CANCELED") {
    return {
      status: "CANCELED" as OwnerFinancialStatus,
      label: getOwnerFinancialStatusLabel("CANCELED"),
      style: getOwnerFinancialStatusStyle("CANCELED"),
      description: `Fatura cancelada · venc. ${formatDate(payment.due_date)}`,
      dueDate: payment.due_date,
    };
  }

  if (daysLate > 3) {
    return {
      status: "BLOCKED" as OwnerFinancialStatus,
      label: getOwnerFinancialStatusLabel("BLOCKED"),
      style: getOwnerFinancialStatusStyle("BLOCKED"),
      description: `Vencida há ${daysLate} dias · deve bloquear`,
      dueDate: payment.due_date,
    };
  }

  if (daysLate > 0) {
    return {
      status: "OVERDUE" as OwnerFinancialStatus,
      label: getOwnerFinancialStatusLabel("OVERDUE"),
      style: getOwnerFinancialStatusStyle("OVERDUE"),
      description: `Vencida há ${daysLate} dia(s)`,
      dueDate: payment.due_date,
    };
  }

  return {
    status: "PENDING" as OwnerFinancialStatus,
    label: getOwnerFinancialStatusLabel("PENDING"),
    style: getOwnerFinancialStatusStyle("PENDING"),
    description: `Fatura vence em ${formatDate(payment.due_date)}`,
    dueDate: payment.due_date,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function formatCurrency(value?: string | number | null) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizeMoney(value: string) {
  const cleanedValue = value.replace("R$", "").replace(/\s/g, "").trim();

  if (!cleanedValue) {
    return 0;
  }

  if (cleanedValue.includes(",")) {
    const normalizedValue = cleanedValue.replace(/\./g, "").replace(",", ".");

    const numberValue = Number(normalizedValue);

    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  const numberValue = Number(cleanedValue);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return (Number(digits) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMoneyForInput(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numberValue = normalizeMoney(String(value));

  return numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function getSubscriptionDateTime(subscription: Subscription) {
  const value = subscription.created_at;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}

function getDefaultNextBillingDate() {
  const date = new Date();

  date.setDate(date.getDate() + 30);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MasterUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [subscriptionFilter, setSubscriptionFilter] =
    useState<SubscriptionFilter>("ALL");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] =
    useState<EditableUserRole>("RESTAURANT_OWNER");

  const [createWithSubscription, setCreateWithSubscription] = useState(true);
  const [createSubscriptionPlanId, setCreateSubscriptionPlanId] = useState("");
  const [createSubscriptionStatus, setCreateSubscriptionStatus] =
    useState<ManageSubscriptionStatus>("ACTIVE");
  const [createSubscriptionMonthlyPrice, setCreateSubscriptionMonthlyPrice] =
    useState("");
  const [
    createSubscriptionNextBillingDate,
    setCreateSubscriptionNextBillingDate,
  ] = useState(getDefaultNextBillingDate());

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] =
    useState<EditableUserRole>("RESTAURANT_OWNER");

  const [editSubscription, setEditSubscription] = useState<Subscription | null>(
    null,
  );
  const [editWithSubscription, setEditWithSubscription] = useState(false);
  const [editSubscriptionPlanId, setEditSubscriptionPlanId] = useState("");
  const [editSubscriptionStatus, setEditSubscriptionStatus] =
    useState<ManageSubscriptionStatus>("ACTIVE");
  const [editSubscriptionMonthlyPrice, setEditSubscriptionMonthlyPrice] =
    useState("");
  const [editSubscriptionNextBillingDate, setEditSubscriptionNextBillingDate] =
    useState(getDefaultNextBillingDate());

  const [actionLoading, setActionLoading] = useState(false);

  const activePlans = useMemo(() => {
    return plans.filter((plan) => plan.is_active);
  }, [plans]);

  function getFirstAvailablePlan() {
    return activePlans[0] ?? plans[0] ?? null;
  }

  function getPlanById(planId: string) {
    return plans.find((plan) => plan.id === planId) ?? null;
  }

  function getPlanMonthlyPrice(plan: Plan | null) {
    if (!plan) return "";

    return formatMoneyForInput(plan.monthly_price);
  }

  async function loadUsers() {
    try {
      setLoading(true);

      const [usersData, subscriptionsData, paymentsData, plansData] =
        await Promise.all([
          getUsers(),
          getSubscriptions(),
          getPayments(),
          getPlans(),
        ]);

      setUsers(usersData);
      setSubscriptions(subscriptionsData);
      setPayments(paymentsData);
      setPlans(plansData);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
    });
  }, []);

  const subscriptionByOwnerId = useMemo(() => {
    const map = new Map<string, Subscription>();

    const orderedSubscriptions = [...subscriptions].sort(
      (a, b) => getSubscriptionDateTime(b) - getSubscriptionDateTime(a),
    );

    for (const subscription of orderedSubscriptions) {
      const current = map.get(subscription.owner_user_id);

      if (!current) {
        map.set(subscription.owner_user_id, subscription);
        continue;
      }

      if (current.status === "CANCELED" && subscription.status !== "CANCELED") {
        map.set(subscription.owner_user_id, subscription);
        continue;
      }

      if (current.status !== "ACTIVE" && subscription.status === "ACTIVE") {
        map.set(subscription.owner_user_id, subscription);
      }
    }

    return map;
  }, [subscriptions]);

  const paymentByOwnerId = useMemo(() => {
    const map = new Map<string, Payment>();

    const orderedPayments = [...payments]
      .filter((payment) => payment.status !== "CANCELED")
      .sort((a, b) => getPaymentDateTime(b) - getPaymentDateTime(a));

    for (const payment of orderedPayments) {
      if (!map.has(payment.owner_user_id)) {
        map.set(payment.owner_user_id, payment);
      }
    }

    return map;
  }, [payments]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      if (user.role === "RESTAURANT_STAFF") {
        return false;
      }

      const subscription = subscriptionByOwnerId.get(user.id);
      const payment = paymentByOwnerId.get(user.id);
      const financialInfo = getOwnerFinancialInfo(subscription, payment);

      const matchesSearch =
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (subscription?.plan_name ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        financialInfo.label.toLowerCase().includes(normalizedSearch) ||
        financialInfo.description.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.is_active) ||
        (statusFilter === "INACTIVE" && !user.is_active);

      const matchesSubscription =
        subscriptionFilter === "ALL" ||
        (subscriptionFilter === "NONE" &&
          user.role === "RESTAURANT_OWNER" &&
          (!subscription || subscription.status === "CANCELED")) ||
        (subscriptionFilter === "FINANCE_PENDING" &&
          financialInfo.status === "PENDING") ||
        (subscriptionFilter === "FINANCE_OVERDUE" &&
          financialInfo.status === "OVERDUE") ||
        (subscriptionFilter === "FINANCE_BLOCKED" &&
          financialInfo.status === "BLOCKED") ||
        (subscriptionFilter === "NO_PAYMENT" &&
          financialInfo.status === "NO_PAYMENT") ||
        subscription?.status === subscriptionFilter;

      return (
        matchesSearch && matchesRole && matchesStatus && matchesSubscription
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
    subscriptionFilter,
    subscriptionByOwnerId,
    paymentByOwnerId,
  ]);

  function handleViewUser(user: User) {
    router.push(`/master/usuarios/${user.id}`);
  }

  function resetCreateSubscriptionFields() {
    const firstPlan = getFirstAvailablePlan();

    setCreateWithSubscription(true);
    setCreateSubscriptionPlanId(firstPlan?.id ?? "");
    setCreateSubscriptionStatus("ACTIVE");
    setCreateSubscriptionMonthlyPrice(getPlanMonthlyPrice(firstPlan));
    setCreateSubscriptionNextBillingDate(getDefaultNextBillingDate());
  }

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateRole("RESTAURANT_OWNER");
    resetCreateSubscriptionFields();
  }

  function handleOpenCreateDialog() {
    resetCreateForm();
    setCreateDialogOpen(true);
  }

  function handleCreateRoleChange(role: EditableUserRole) {
    setCreateRole(role);

    if (role === "MASTER") {
      setCreateWithSubscription(false);
      return;
    }

    setCreateWithSubscription(true);

    if (!createSubscriptionPlanId) {
      const firstPlan = getFirstAvailablePlan();

      setCreateSubscriptionPlanId(firstPlan?.id ?? "");
      setCreateSubscriptionMonthlyPrice(getPlanMonthlyPrice(firstPlan));
    }
  }

  function handleCreateSubscriptionPlanChange(planId: string) {
    const plan = getPlanById(planId);

    setCreateSubscriptionPlanId(planId);
    setCreateSubscriptionMonthlyPrice(getPlanMonthlyPrice(plan));
  }

  function resetEditSubscriptionFields(user: User) {
    const subscription = subscriptionByOwnerId.get(user.id) ?? null;
    const editableSubscription =
      subscription && subscription.status !== "CANCELED" ? subscription : null;

    const matchedPlan = editableSubscription
      ? (plans.find((plan) => plan.name === editableSubscription.plan_name) ??
        null)
      : null;

    const selectedPlan = matchedPlan ?? getFirstAvailablePlan();

    setEditSubscription(editableSubscription);
    setEditWithSubscription(Boolean(editableSubscription));
    setEditSubscriptionPlanId(selectedPlan?.id ?? "");
    setEditSubscriptionMonthlyPrice(
      editableSubscription
        ? formatMoneyForInput(editableSubscription.monthly_price)
        : getPlanMonthlyPrice(selectedPlan),
    );
    setEditSubscriptionNextBillingDate(
      editableSubscription?.next_billing_date ?? getDefaultNextBillingDate(),
    );

    if (
      editableSubscription?.status === "ACTIVE" ||
      editableSubscription?.status === "PENDING" ||
      editableSubscription?.status === "OVERDUE"
    ) {
      setEditSubscriptionStatus(editableSubscription.status);
      return;
    }

    setEditSubscriptionStatus("ACTIVE");
  }

  function handleOpenEditDialog(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role === "MASTER" ? "MASTER" : "RESTAURANT_OWNER");
    resetEditSubscriptionFields(user);
    setEditDialogOpen(true);
  }

  function handleEditRoleChange(role: EditableUserRole) {
    setEditRole(role);

    if (role === "MASTER") {
      setEditWithSubscription(false);
      return;
    }

    if (!editSubscriptionPlanId) {
      const firstPlan = getFirstAvailablePlan();

      setEditSubscriptionPlanId(firstPlan?.id ?? "");
      setEditSubscriptionMonthlyPrice(getPlanMonthlyPrice(firstPlan));
    }
  }

  function handleEditSubscriptionPlanChange(planId: string) {
    const plan = getPlanById(planId);

    setEditSubscriptionPlanId(planId);
    setEditSubscriptionMonthlyPrice(getPlanMonthlyPrice(plan));
  }

  function handleOpenActivateDialog(user: User) {
    setSelectedUser(user);
    setActivateDialogOpen(true);
  }

  function handleOpenDisableDialog(user: User) {
    setSelectedUser(user);
    setDisableDialogOpen(true);
  }

  function handleOpenDeleteDialog(user: User) {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }

  async function handleCreateUser() {
    if (!createName.trim()) {
      alert("Informe o nome do usuário");
      return;
    }

    if (!createEmail.trim()) {
      alert("Informe o e-mail do usuário");
      return;
    }

    if (!createPassword.trim()) {
      alert("Informe uma senha inicial");
      return;
    }

    const shouldCreateSubscription =
      createRole === "RESTAURANT_OWNER" && createWithSubscription;

    const selectedPlan = getPlanById(createSubscriptionPlanId);
    const monthlyPrice = normalizeMoney(createSubscriptionMonthlyPrice);

    if (shouldCreateSubscription && !selectedPlan) {
      alert("Selecione o plano do dono");
      return;
    }

    if (shouldCreateSubscription && (!monthlyPrice || monthlyPrice <= 0)) {
      alert("Informe um valor mensal válido para a assinatura");
      return;
    }

    if (shouldCreateSubscription && !createSubscriptionNextBillingDate) {
      alert("Informe o próximo vencimento da assinatura");
      return;
    }

    try {
      setCreateLoading(true);

      const createdUser = await createUser({
        name: createName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        role: createRole,
      });

      if (shouldCreateSubscription && selectedPlan) {
        await createSubscription({
          owner_user_id: createdUser.id,
          status: createSubscriptionStatus,
          plan_name: selectedPlan.name,
          monthly_price: monthlyPrice,
          next_billing_date: createSubscriptionNextBillingDate,
        });
      }

      await loadUsers();

      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao criar usuário");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleUpdateUser() {
    if (!editingUser) return;

    if (!editName.trim()) {
      alert("Informe o nome do usuário");
      return;
    }

    if (!editEmail.trim()) {
      alert("Informe o e-mail do usuário");
      return;
    }

    const shouldSaveSubscription =
      editRole === "RESTAURANT_OWNER" && editWithSubscription;

    const shouldCancelSubscription =
      Boolean(editSubscription) &&
      editSubscription?.status !== "CANCELED" &&
      (editRole === "MASTER" || !editWithSubscription);

    const selectedPlan = getPlanById(editSubscriptionPlanId);
    const monthlyPrice = normalizeMoney(editSubscriptionMonthlyPrice);

    if (shouldSaveSubscription && !selectedPlan) {
      alert("Selecione o plano do dono");
      return;
    }

    if (shouldSaveSubscription && (!monthlyPrice || monthlyPrice <= 0)) {
      alert("Informe um valor mensal válido para a assinatura");
      return;
    }

    if (shouldSaveSubscription && !editSubscriptionNextBillingDate) {
      alert("Informe o próximo vencimento da assinatura");
      return;
    }

    if (shouldCancelSubscription) {
      const confirmed = confirm(
        "Você desmarcou/removeu a assinatura deste dono. Ao salvar, a assinatura atual será cancelada. Deseja continuar?",
      );

      if (!confirmed) return;
    }

    try {
      setEditLoading(true);

      await updateUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      });

      if (shouldCancelSubscription && editSubscription) {
        await cancelSubscription(editSubscription.id);
      }

      if (shouldSaveSubscription && selectedPlan) {
        if (editSubscription && editSubscription.status !== "CANCELED") {
          await updateSubscription(editSubscription.id, {
            status: editSubscriptionStatus,
            plan_name: selectedPlan.name,
            monthly_price: monthlyPrice,
            next_billing_date: editSubscriptionNextBillingDate,
          });
        } else {
          await createSubscription({
            owner_user_id: editingUser.id,
            status: editSubscriptionStatus,
            plan_name: selectedPlan.name,
            monthly_price: monthlyPrice,
            next_billing_date: editSubscriptionNextBillingDate,
          });
        }
      }

      await loadUsers();

      setEditDialogOpen(false);
      setEditingUser(null);
      setEditSubscription(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao atualizar usuário");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleActivateUser() {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await activateUser(selectedUser.id);
      await loadUsers();

      setActivateDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao ativar usuário");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisableUser() {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await disableUser(selectedUser.id);
      await loadUsers();

      setDisableDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao desativar usuário");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await deleteUser(selectedUser.id);
      await loadUsers();

      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao excluir usuário");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Usuários</h1>

              <p className="mt-1 text-muted-foreground">
                Gerencie usuários, planos e assinaturas dos donos de
                restaurante.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateDialog}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={18} />
              Novo usuário
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar usuário, e-mail ou plano..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as RoleFilter)
                }
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">Todas as funções</option>
                <option value="MASTER">Master</option>
                <option value="RESTAURANT_OWNER">Donos</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">Todos os usuários</option>
                <option value="ACTIVE">Usuários ativos</option>
                <option value="INACTIVE">Usuários inativos</option>
              </select>

              <select
                value={subscriptionFilter}
                onChange={(event) =>
                  setSubscriptionFilter(
                    event.target.value as SubscriptionFilter,
                  )
                }
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">Todos os financeiros</option>
                <option value="ACTIVE">Assinatura ativa</option>
                <option value="FINANCE_PENDING">Fatura pendente</option>
                <option value="FINANCE_OVERDUE">Fatura atrasada</option>
                <option value="FINANCE_BLOCKED">Bloqueio financeiro</option>
                <option value="NO_PAYMENT">Sem fatura</option>
                <option value="CANCELED">Assinatura cancelada</option>
                <option value="NONE">Sem assinatura</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Usuário</th>
                    <th className="px-5 py-4 font-medium">E-mail</th>
                    <th className="px-5 py-4 font-medium">Função</th>
                    <th className="px-5 py-4 font-medium">Plano</th>
                    <th className="px-5 py-4 font-medium">Financeiro</th>
                    <th className="px-5 py-4 font-medium">Status usuário</th>
                    <th className="px-5 py-4 font-medium">Cadastro</th>
                    <th className="px-5 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        Carregando usuários...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredUsers.map((user) => {
                      const subscription = subscriptionByOwnerId.get(user.id);
                      const payment = paymentByOwnerId.get(user.id);
                      const financialInfo = getOwnerFinancialInfo(
                        subscription,
                        payment,
                      );
                      const isOwner = user.role === "RESTAURANT_OWNER";

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-accent/50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <UserRound size={18} />
                              </div>

                              <span className="font-medium text-foreground">
                                {user.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail size={15} />
                              {user.email}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleStyle(
                                user.role,
                              )}`}
                            >
                              {getRoleLabel(user.role)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {isOwner && subscription ? (
                              <div>
                                <div className="flex items-center gap-2 font-medium text-foreground">
                                  <CreditCard size={15} />
                                  {subscription.plan_name}
                                </div>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {formatCurrency(subscription.monthly_price)}
                                  /mês
                                </p>
                              </div>
                            ) : isOwner ? (
                              <span className="text-sm text-muted-foreground">
                                Sem plano
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Não se aplica
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {isOwner ? (
                              <div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${financialInfo.style}`}
                                >
                                  {financialInfo.label}
                                </span>

                                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar size={13} />
                                  {financialInfo.description}
                                </p>

                                {subscription && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Assinatura:{" "}
                                    {getSubscriptionStatusLabel(
                                      subscription.status,
                                    )}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                user.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {user.is_active ? "Ativo" : "Inativo"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {formatDate(user.created_at)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewUser(user)}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Ver detalhes"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditDialog(user)}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Editar usuário e assinatura"
                              >
                                <Pencil size={16} />
                              </button>

                              {user.is_active ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDisableDialog(user)}
                                  className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                  title="Desativar usuário"
                                >
                                  <Lock size={16} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenActivateDialog(user)}
                                  className="rounded-lg border border-border p-2 text-green-600 transition hover:bg-green-50"
                                  title="Ativar usuário"
                                >
                                  <Unlock size={16} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenDeleteDialog(user)}
                                className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-50"
                                title="Excluir usuário"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredUsers.length} de {users.length} usuários
              </p>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div>
              <Label>Nome</Label>

              <Input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Nome do usuário"
                className="mt-2"
              />
            </div>

            <div>
              <Label>E-mail</Label>

              <Input
                value={createEmail}
                onChange={(event) => setCreateEmail(event.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Senha inicial</Label>

              <Input
                type="password"
                value={createPassword}
                onChange={(event) => setCreatePassword(event.target.value)}
                placeholder="Senha inicial"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Função</Label>

              <select
                value={createRole}
                onChange={(event) =>
                  handleCreateRoleChange(event.target.value as EditableUserRole)
                }
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="RESTAURANT_OWNER">Dono do restaurante</option>
                <option value="MASTER">Master</option>
              </select>
            </div>

            {createRole === "RESTAURANT_OWNER" && (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="create-with-subscription"
                    type="checkbox"
                    checked={createWithSubscription}
                    onChange={(event) =>
                      setCreateWithSubscription(event.target.checked)
                    }
                    className="mt-1"
                  />

                  <div>
                    <Label htmlFor="create-with-subscription">
                      Definir plano/assinatura agora
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Se desmarcar, o dono será criado sem plano e poderá
                      receber uma assinatura depois.
                    </p>
                  </div>
                </div>

                {createWithSubscription && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label>Plano</Label>

                      <select
                        value={createSubscriptionPlanId}
                        onChange={(event) =>
                          handleCreateSubscriptionPlanChange(event.target.value)
                        }
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Selecione um plano</option>

                        {activePlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} — {formatCurrency(plan.monthly_price)}
                            /mês
                          </option>
                        ))}
                      </select>

                      {activePlans.length === 0 && (
                        <p className="mt-2 text-xs text-red-600">
                          Cadastre ou ative um plano antes de criar assinatura.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Status inicial</Label>

                      <select
                        value={createSubscriptionStatus}
                        onChange={(event) =>
                          setCreateSubscriptionStatus(
                            event.target.value as ManageSubscriptionStatus,
                          )
                        }
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="ACTIVE">Ativa</option>
                        <option value="PENDING">Pendente</option>
                        <option value="OVERDUE">Em atraso</option>
                      </select>
                    </div>

                    <div>
                      <Label>Próximo vencimento</Label>

                      <Input
                        type="date"
                        value={createSubscriptionNextBillingDate}
                        onChange={(event) =>
                          setCreateSubscriptionNextBillingDate(
                            event.target.value,
                          )
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Valor mensal</Label>

                      <Input
                        type="text"
                        inputMode="numeric"
                        value={createSubscriptionMonthlyPrice}
                        onChange={(event) =>
                          setCreateSubscriptionMonthlyPrice(
                            formatMoneyInput(event.target.value),
                          )
                        }
                        placeholder="59,90"
                        className="mt-2"
                      />

                      <p className="mt-2 text-xs text-muted-foreground">
                        O valor vem do plano selecionado, mas pode ser ajustado
                        manualmente.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={createLoading}
              onClick={() => {
                resetCreateForm();
                setCreateDialogOpen(false);
              }}
            >
              Cancelar
            </Button>

            <Button disabled={createLoading} onClick={handleCreateUser}>
              {createLoading ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div>
              <Label>Nome</Label>

              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Nome do usuário"
                className="mt-2"
              />
            </div>

            <div>
              <Label>E-mail</Label>

              <Input
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Função</Label>

              <select
                value={editRole}
                onChange={(event) =>
                  handleEditRoleChange(event.target.value as EditableUserRole)
                }
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="RESTAURANT_OWNER">Dono do restaurante</option>
                <option value="MASTER">Master</option>
              </select>
            </div>

            {editRole === "RESTAURANT_OWNER" && (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="edit-with-subscription"
                    type="checkbox"
                    checked={editWithSubscription}
                    onChange={(event) =>
                      setEditWithSubscription(event.target.checked)
                    }
                    className="mt-1"
                  />

                  <div>
                    <Label htmlFor="edit-with-subscription">
                      Este dono possui plano/assinatura
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Desmarcar e salvar cancela a assinatura atual, se existir.
                    </p>
                  </div>
                </div>

                {editSubscription && (
                  <div className="mt-4 rounded-lg border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">
                      Assinatura atual
                    </p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {editSubscription.plan_name} —{" "}
                      {formatCurrency(editSubscription.monthly_price)}/mês
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Status:{" "}
                      {getSubscriptionStatusLabel(editSubscription.status)} ·
                      Vence em {formatDate(editSubscription.next_billing_date)}
                    </p>
                  </div>
                )}

                {editWithSubscription && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label>Plano</Label>

                      <select
                        value={editSubscriptionPlanId}
                        onChange={(event) =>
                          handleEditSubscriptionPlanChange(event.target.value)
                        }
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Selecione um plano</option>

                        {activePlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} — {formatCurrency(plan.monthly_price)}
                            /mês
                          </option>
                        ))}
                      </select>

                      {activePlans.length === 0 && (
                        <p className="mt-2 text-xs text-red-600">
                          Cadastre ou ative um plano antes de criar assinatura.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Status</Label>

                      <select
                        value={editSubscriptionStatus}
                        onChange={(event) =>
                          setEditSubscriptionStatus(
                            event.target.value as ManageSubscriptionStatus,
                          )
                        }
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                      >
                        <option value="ACTIVE">Ativa</option>
                        <option value="PENDING">Pendente</option>
                        <option value="OVERDUE">Em atraso</option>
                      </select>
                    </div>

                    <div>
                      <Label>Próximo vencimento</Label>

                      <Input
                        type="date"
                        value={editSubscriptionNextBillingDate}
                        onChange={(event) =>
                          setEditSubscriptionNextBillingDate(event.target.value)
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Valor mensal</Label>

                      <Input
                        type="text"
                        inputMode="numeric"
                        value={editSubscriptionMonthlyPrice}
                        onChange={(event) =>
                          setEditSubscriptionMonthlyPrice(
                            formatMoneyInput(event.target.value),
                          )
                        }
                        placeholder="59,90"
                        className="mt-2"
                      />

                      <p className="mt-2 text-xs text-muted-foreground">
                        Ao trocar o plano, o valor é preenchido automaticamente,
                        mas você pode ajustar manualmente.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {editRole === "MASTER" && editSubscription && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Este usuário possui assinatura. Se salvar como Master, a
                assinatura atual será cancelada.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={editLoading}
              onClick={() => {
                setEditDialogOpen(false);
                setEditingUser(null);
                setEditSubscription(null);
              }}
            >
              Cancelar
            </Button>

            <Button disabled={editLoading} onClick={handleUpdateUser}>
              {editLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Ativar usuário"
        description={`Deseja ativar ${
          selectedUser?.name ?? "este usuário"
        } novamente? Ele poderá acessar o sistema.`}
        type="success"
        confirmText="Ativar"
        loading={actionLoading}
        onConfirm={handleActivateUser}
      />

      <ConfirmDialog
        open={disableDialogOpen}
        onOpenChange={setDisableDialogOpen}
        title="Desativar usuário"
        description={`Tem certeza que deseja desativar ${
          selectedUser?.name ?? "este usuário"
        }? Ele não poderá mais acessar o sistema.`}
        type="danger"
        confirmText="Desativar"
        loading={actionLoading}
        onConfirm={handleDisableUser}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir ${
          selectedUser?.name ?? "este usuário"
        }? Essa ação não poderá ser desfeita.`}
        type="danger"
        confirmText="Excluir"
        loading={actionLoading}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}