import { apiFetch, getApiErrorMessage } from "./api";

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  monthly_price: string | number;
  annual_price: string | number;
  max_restaurants: number | null;
  max_products: number | null;
  max_categories: number | null;
  max_users?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreatePlanData = {
  name: string;
  description?: string;
  monthly_price: number;
  annual_price: number;
  max_restaurants?: number | null;
  max_products?: number | null;
  max_categories?: number | null;
  max_users?: number | null;
};

export type UpdatePlanData = {
  name?: string;
  description?: string;
  monthly_price?: number;
  annual_price?: number;
  max_restaurants?: number | null;
  max_products?: number | null;
  max_categories?: number | null;
  max_users?: number | null;
};

export async function getPlans(): Promise<Plan[]> {
  const response = await apiFetch("/plans", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar planos"),
    );
  }

  return response.json();
}

export async function getPlanById(id: string): Promise<Plan> {
  const response = await apiFetch(`/plans/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar plano"),
    );
  }

  return response.json();
}

export async function createPlan(data: CreatePlanData): Promise<Plan> {
  const response = await apiFetch("/plans", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao criar plano"),
    );
  }

  return response.json();
}

export async function updatePlan(
  id: string,
  data: UpdatePlanData,
): Promise<Plan> {
  const response = await apiFetch(`/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao atualizar plano"),
    );
  }

  return response.json();
}

export async function disablePlan(id: string): Promise<Plan> {
  const response = await apiFetch(`/plans/${id}/disable`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao desativar plano"),
    );
  }

  return response.json();
}

export async function deletePlan(id: string): Promise<void> {
  const response = await apiFetch(`/plans/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao excluir plano"),
    );
  }
}