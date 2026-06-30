import { apiFetch, getApiErrorMessage } from "./api";

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

export async function getProducts(
  restaurantId: string,
): Promise<Product[]> {
  const response = await apiFetch(
    `/products?restaurant_id=${encodeURIComponent(restaurantId)}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar produtos"),
    );
  }

  return response.json();
}

export async function createProduct(
  data: CreateProductData,
): Promise<Product> {
  const response = await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao criar produto"),
    );
  }

  return response.json();
}

export async function updateProduct(
  id: string,
  data: UpdateProductData,
): Promise<Product> {
  const response = await apiFetch(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao atualizar produto"),
    );
  }

  return response.json();
}

export async function activateProduct(id: string): Promise<Product> {
  const response = await apiFetch(`/products/${id}/activate`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao ativar produto"),
    );
  }

  return response.json();
}

export async function disableProduct(id: string): Promise<Product> {
  const response = await apiFetch(`/products/${id}/disable`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao desativar produto"),
    );
  }

  return response.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await apiFetch(`/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao excluir produto"),
    );
  }
}