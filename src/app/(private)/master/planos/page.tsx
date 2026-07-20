"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

import {
  createPlan,
  deletePlan,
  disablePlan,
  getPlans,
  updatePlan,
  type Plan,
} from "@/services/planService";

type PlanFormData = {
  name: string;
  description: string;
  monthly_price: string;
  annual_price: string;
  max_restaurants: string;
  max_products: string;
  max_categories: string;
  max_users: string;
};

const UNLIMITED_LIMIT = 999999;

const initialFormData: PlanFormData = {
  name: "",
  description: "",
  monthly_price: "",
  annual_price: "",
  max_restaurants: "",
  max_products: "",
  max_categories: "",
  max_users: "",
};

function formatCurrency(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatLimit(value: number | string | null | undefined, label: string) {
  if (value === null || value === undefined || value === "") {
    return "Ilimitado";
  }

  const numberValue = Number(value);

  if (!numberValue || numberValue <= 0 || numberValue >= UNLIMITED_LIMIT) {
    return "Ilimitado";
  }

  if (numberValue === 1) {
    return `1 ${label}`;
  }

  return `${numberValue} ${label}s`;
}

function getPlanStatus(plan: Plan) {
  return plan.is_active ? "Ativo" : "Inativo";
}

function getStatusClass(plan: Plan) {
  return plan.is_active
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
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
function normalizeLimit(value: string) {
  if (!value.trim()) {
    return UNLIMITED_LIMIT;
  }

  const numberValue = Number(value);

  if (!numberValue || numberValue <= 0) {
    return UNLIMITED_LIMIT;
  }

  return numberValue;
}

function getLimitInputValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numberValue = Number(value);

  if (!numberValue || numberValue <= 0 || numberValue >= UNLIMITED_LIMIT) {
    return "";
  }

  return String(numberValue);
}

export default function MasterPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(
    null,
  );

  const [formData, setFormData] = useState<PlanFormData>(initialFormData);

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        !normalizedSearch ||
        plan.name.toLowerCase().includes(normalizedSearch) ||
        (plan.description ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && plan.is_active) ||
        (statusFilter === "INACTIVE" && !plan.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  async function loadPlans() {
    try {
      setLoading(true);
      setError("");

      const data = await getPlans();

      setPlans(data);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : "Erro ao carregar planos";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadPlans();
    });
  }, []);

  function openCreateModal() {
    setSelectedPlan(null);
    setFormData({
      name: "Plano Serviu",
      description: "Plano único com acesso completo ao cardápio digital.",
      monthly_price: "59,90",
      annual_price: "599,90",
      max_restaurants: "",
      max_products: "",
      max_categories: "",
      max_users: "",
    });
    setModalMode("create");
  }

  function openViewModal(plan: Plan) {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description ?? "",
      monthly_price: formatMoneyForInput(plan.monthly_price),
      annual_price: formatMoneyForInput(plan.annual_price),
      max_restaurants: getLimitInputValue(plan.max_restaurants),
      max_products: getLimitInputValue(plan.max_products),
      max_categories: getLimitInputValue(plan.max_categories),
      max_users: getLimitInputValue(plan.max_users),
    });
    setModalMode("view");
  }

  function openEditModal(plan: Plan) {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description ?? "",
      monthly_price: formatMoneyForInput(plan.monthly_price),
      annual_price: formatMoneyForInput(plan.annual_price),
      max_restaurants: getLimitInputValue(plan.max_restaurants),
      max_products: getLimitInputValue(plan.max_products),
      max_categories: getLimitInputValue(plan.max_categories),
      max_users: getLimitInputValue(plan.max_users),
    });
    setModalMode("edit");
  }

  function closeModal() {
    if (saving) return;

    setModalMode(null);
    setSelectedPlan(null);
    setFormData(initialFormData);
  }

  function updateFormField(field: keyof PlanFormData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSavePlan() {
    try {
      if (!formData.name.trim()) {
        alert("Informe o nome do plano");
        return;
      }

      const monthlyPrice = normalizeMoney(formData.monthly_price);
      const annualPrice = normalizeMoney(formData.annual_price);

      if (!monthlyPrice || monthlyPrice <= 0) {
        alert("Informe um preço mensal válido");
        return;
      }

      if (!annualPrice || annualPrice <= 0) {
        alert("Informe um preço anual válido");
        return;
      }

      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        monthly_price: monthlyPrice,
        annual_price: annualPrice,
        max_restaurants: normalizeLimit(formData.max_restaurants),
        max_products: normalizeLimit(formData.max_products),
        max_categories: normalizeLimit(formData.max_categories),
        max_users: normalizeLimit(formData.max_users),
      };

      if (modalMode === "create") {
        await createPlan(payload);
      }

      if (modalMode === "edit" && selectedPlan) {
        await updatePlan(selectedPlan.id, payload);
      }

      closeModal();
      await loadPlans();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        alert(err.message);
        return;
      }

      alert("Erro ao salvar plano");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisablePlan(plan: Plan) {
    if (!plan.is_active) {
      alert("Este plano já está inativo.");
      return;
    }

    const confirmed = confirm(`Deseja desativar o plano "${plan.name}"?`);

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await disablePlan(plan.id);
      await loadPlans();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        alert(err.message);
        return;
      }

      alert("Erro ao desativar plano");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePlan(plan: Plan) {
    const confirmed = confirm(
      `Tem certeza que deseja excluir o plano "${plan.name}"? Essa ação não poderá ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await deletePlan(plan.id);
      await loadPlans();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        alert(err.message);
        return;
      }

      alert("Erro ao excluir plano");
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
              <h1 className="text-3xl font-bold text-foreground">Planos</h1>

              <p className="mt-1 text-muted-foreground">
                Gerencie os planos reais disponíveis para os restaurantes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadPlans}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                Atualizar
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus size={18} />
                Novo Plano
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar plano..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="ALL">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Plano</th>
                    <th className="px-5 py-4 font-medium">Mensal</th>
                    <th className="px-5 py-4 font-medium">Anual</th>
                    <th className="px-5 py-4 font-medium">Restaurantes</th>
                    <th className="px-5 py-4 font-medium">Produtos</th>
                    <th className="px-5 py-4 font-medium">Categorias</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="transition hover:bg-accent/50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {plan.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {plan.description || "Sem descrição"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatCurrency(plan.monthly_price)}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatCurrency(plan.annual_price)}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatLimit(plan.max_restaurants, "restaurante")}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatLimit(plan.max_products, "produto")}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatLimit(plan.max_categories, "categoria")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            plan,
                          )}`}
                        >
                          {getPlanStatus(plan)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openViewModal(plan)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(plan)}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDisablePlan(plan)}
                            disabled={actionLoading || !plan.is_active}
                            className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Power size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePlan(plan)}
                            disabled={actionLoading}
                            className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredPlans.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-sm text-muted-foreground"
                      >
                        Nenhum plano encontrado.
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-sm text-muted-foreground"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Carregando planos...
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredPlans.length} de {plans.length} planos
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
                >
                  1
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {modalMode === "create" && "Novo plano"}
                  {modalMode === "edit" && "Editar plano"}
                  {modalMode === "view" && "Detalhes do plano"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {modalMode === "view"
                    ? "Visualize as informações cadastradas."
                    : "Preencha os dados do plano."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Nome do plano *
                </label>

                <input
                  value={formData.name}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField("name", event.target.value)
                  }
                  placeholder="Ex.: Plano Serviu"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Descrição
                </label>

                <textarea
                  value={formData.description}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField("description", event.target.value)
                  }
                  placeholder="Descrição do plano"
                  className="mt-2 min-h-24 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Preço mensal *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.monthly_price}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField(
                      "monthly_price",
                      formatMoneyInput(event.target.value),
                    )
                  }
                  placeholder="59,90"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Preço anual *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.annual_price}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField(
                      "annual_price",
                      formatMoneyInput(event.target.value),
                    )
                  }
                  placeholder="599,90"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Máximo de restaurantes
                </label>

                <input
                  value={formData.max_restaurants}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField("max_restaurants", event.target.value)
                  }
                  placeholder="Vazio = ilimitado"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Máximo de produtos
                </label>

                <input
                  value={formData.max_products}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField("max_products", event.target.value)
                  }
                  placeholder="Vazio = ilimitado"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Máximo de categorias
                </label>

                <input
                  value={formData.max_categories}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField("max_categories", event.target.value)
                  }
                  placeholder="Vazio = ilimitado"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Máximo de usuários
                </label>

                <input
                  value={formData.max_users}
                  disabled={modalMode === "view"}
                  onChange={(event) =>
                    updateFormField("max_users", event.target.value)
                  }
                  placeholder="Vazio = ilimitado"
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {selectedPlan && (
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Status
                  </label>

                  <div className="mt-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        selectedPlan,
                      )}`}
                    >
                      {getPlanStatus(selectedPlan)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {modalMode === "view" ? "Fechar" : "Cancelar"}
              </button>

              {modalMode !== "view" && (
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Salvando..." : "Salvar plano"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}