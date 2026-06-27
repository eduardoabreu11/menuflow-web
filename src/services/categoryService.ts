// src/services/categoryService.ts

import { API_URL } from "./api";
import { getAuthHeaders } from "./authService";

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

export async function getCategories(restaurantId: string) {
  const response = await fetch(
    `${API_URL}/categories?restaurant_id=${restaurantId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar categorias");
  }

  return response.json();
}

export async function createCategory(data: CreateCategoryData) {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar categoria");
  }

  return response.json();
}

export async function updateCategory(id: string, data: UpdateCategoryData) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar categoria");
  }

  return response.json();
}

export async function activateCategory(id: string) {
  const response = await fetch(`${API_URL}/categories/${id}/activate`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao ativar categoria");
  }

  return response.json();
}

export async function disableCategory(id: string) {
  const response = await fetch(`${API_URL}/categories/${id}/disable`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao desativar categoria");
  }

  return response.json();
}

export async function deleteCategory(id: string) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir categoria");
  }

  return response.json();
}