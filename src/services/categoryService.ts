import { apiFetch, getApiErrorMessage } from "./api";

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  emoji: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CreateCategoryData = {
  restaurant_id: string;
  name: string;
  emoji?: string;
  sort_order?: number;
};

type UpdateCategoryData = {
  name?: string;
  emoji?: string;
  sort_order?: number;
};

export async function getCategories(
  restaurantId: string,
): Promise<Category[]> {
  const response = await apiFetch(
    `/categories?restaurant_id=${encodeURIComponent(restaurantId)}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar categorias"),
    );
  }

  return response.json();
}

export async function createCategory(
  data: CreateCategoryData,
): Promise<Category> {
  const response = await apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao criar categoria"),
    );
  }

  return response.json();
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryData,
): Promise<Category> {
  const response = await apiFetch(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao atualizar categoria"),
    );
  }

  return response.json();
}

export async function activateCategory(id: string): Promise<Category> {
  const response = await apiFetch(`/categories/${id}/activate`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao ativar categoria"),
    );
  }

  return response.json();
}

export async function disableCategory(id: string): Promise<Category> {
  const response = await apiFetch(`/categories/${id}/disable`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao desativar categoria"),
    );
  }

  return response.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await apiFetch(`/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao excluir categoria"),
    );
  }
}