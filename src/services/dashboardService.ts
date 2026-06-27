import { API_URL } from "./api";
import { getAuthHeaders } from "./authService";

export type DashboardStats = {
  categories: number;
  products: number;
  activeProducts: number;
};

export async function getDashboardStats(
  restaurantId: string
): Promise<DashboardStats> {
  const response = await fetch(
    `${API_URL}/dashboard?restaurant_id=${restaurantId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar dashboard");
  }

  return response.json();
}

export type RecentProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;

  category_id: string;
  category_name: string | null;
  category_emoji: string | null;
};

export async function getRecentProducts(
  restaurantId: string
): Promise<RecentProduct[]> {
  const response = await fetch(
    `${API_URL}/dashboard/recent-products?restaurant_id=${restaurantId}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar últimos produtos");
  }

  return response.json();
}