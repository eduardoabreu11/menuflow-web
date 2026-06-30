import { apiFetch, getApiErrorMessage } from "./api";

export type DashboardStats = {
  categories: number;
  products: number;
  activeProducts: number;
};

export type RecentProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;

  category_id: string;
  category_name?: string | null;
  category_emoji?: string | null;
};

export async function getDashboardStats(
  restaurantId: string,
): Promise<DashboardStats> {
  const response = await apiFetch(
    `/dashboard?restaurant_id=${encodeURIComponent(restaurantId)}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar dashboard"),
    );
  }

  return response.json();
}

export async function getRecentProducts(
  restaurantId: string,
): Promise<RecentProduct[]> {
  const response = await apiFetch(
    `/dashboard/recent-products?restaurant_id=${encodeURIComponent(
      restaurantId,
    )}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar últimos produtos"),
    );
  }

  return response.json();
}