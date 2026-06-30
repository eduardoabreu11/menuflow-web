import { apiFetch, getApiErrorMessage } from "./api";

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
  const response = await apiFetch(
    `/banners?restaurant_id=${encodeURIComponent(restaurantId)}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar banners"),
    );
  }

  return response.json();
}

export async function createBanner(data: CreateBannerData): Promise<Banner> {
  const response = await apiFetch("/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao criar banner"),
    );
  }

  return response.json();
}

export async function updateBanner(
  id: string,
  data: UpdateBannerData,
): Promise<Banner> {
  const response = await apiFetch(`/banners/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao atualizar banner"),
    );
  }

  return response.json();
}

export async function activateBanner(id: string): Promise<Banner> {
  const response = await apiFetch(`/banners/${id}/activate`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao ativar banner"),
    );
  }

  return response.json();
}

export async function disableBanner(id: string): Promise<Banner> {
  const response = await apiFetch(`/banners/${id}/disable`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao desativar banner"),
    );
  }

  return response.json();
}

export async function deleteBanner(id: string): Promise<void> {
  const response = await apiFetch(`/banners/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao excluir banner"),
    );
  }
}