import { API_URL } from "./api";
import { getAuthHeaders } from "./authService";

export type Product = {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  video_url: string | null;
  is_active: boolean;
  is_promotion: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
};

type CreateProductData = {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  video_url?: string;
  is_promotion?: boolean;
  is_new?: boolean;
};

type UpdateProductData = {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  video_url?: string;
  is_promotion?: boolean;
  is_new?: boolean;
};

export async function getProducts(restaurantId: string) {
  const response = await fetch(
    `${API_URL}/products?restaurant_id=${restaurantId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar produtos");
  }

  return response.json();
}

export async function createProduct(data: CreateProductData) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar produto");
  }

  return response.json();
}

export async function updateProduct(id: string, data: UpdateProductData) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar produto");
  }

  return response.json();
}

export async function activateProduct(id: string) {
  const response = await fetch(`${API_URL}/products/${id}/activate`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao ativar produto");
  }

  return response.json();
}

export async function disableProduct(id: string) {
  const response = await fetch(`${API_URL}/products/${id}/disable`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao desativar produto");
  }

  return response.json();
}

export async function deleteProduct(id: string) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir produto");
  }

  return response.json();
}