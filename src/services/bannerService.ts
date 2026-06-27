import { API_URL } from "./api";
import { getAuthHeaders } from "./authService";

export type Banner = {
  id: string;
  restaurant_id: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CreateBannerData = {
  restaurant_id: string;
  image_url: string;
};

type UpdateBannerData = {
  image_url?: string;
};

export async function getBanners(restaurantId: string): Promise<Banner[]> {
  const response = await fetch(`${API_URL}/banners?restaurant_id=${restaurantId}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar banners");
  }

  return response.json();
}

export async function createBanner(data: CreateBannerData): Promise<Banner> {
  const response = await fetch(`${API_URL}/banners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar banner");
  }

  return response.json();
}

export async function updateBanner(
  id: string,
  data: UpdateBannerData,
): Promise<Banner> {
  const response = await fetch(`${API_URL}/banners/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar banner");
  }

  return response.json();
}

export async function activateBanner(id: string): Promise<Banner> {
  const response = await fetch(`${API_URL}/banners/${id}/activate`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao ativar banner");
  }

  return response.json();
}

export async function disableBanner(id: string): Promise<Banner> {
  const response = await fetch(`${API_URL}/banners/${id}/disable`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao desativar banner");
  }

  return response.json();
}

export async function deleteBanner(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/banners/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir banner");
  }
}