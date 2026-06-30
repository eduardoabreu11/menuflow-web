import { apiFetch, getApiErrorMessage } from "./api";
import { getMe, getUser } from "./authService";

export type Restaurant = {
  id: string;
  owner_user_id: string;
  plan_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  address: string | null;
  opening_hours: string | null;
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  created_at: string;
  updated_at: string;
};

type CreateRestaurantData = {
  owner_user_id: string;
  name: string;
  slug: string;
  description?: string;
};

type UpdateRestaurantData = {
  name?: string;
  slug?: string;
  description?: string | null;
  logo_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  address?: string | null;
  opening_hours?: string | null;
};

export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await apiFetch("/restaurants", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar restaurantes"),
    );
  }

  return response.json();
}

export async function getMyRestaurants() {
  let user = getUser();

  if (!user) {
    user = await getMe();
  }

  const restaurants = await getRestaurants();

  if (user.role === "MASTER") {
    return restaurants;
  }

  return restaurants.filter(
    (restaurant) => restaurant.owner_user_id === user.id,
  );
}

export async function createRestaurant(data: CreateRestaurantData) {
  const response = await apiFetch("/restaurants", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao criar restaurante"),
    );
  }

  return response.json();
}

export async function updateRestaurant(
  id: string,
  data: UpdateRestaurantData,
): Promise<Restaurant> {
  const response = await apiFetch(`/restaurants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao atualizar restaurante"),
    );
  }

  return response.json();
}

export function saveSelectedRestaurant(restaurant: Restaurant) {
  localStorage.setItem(
    "menuflow_selected_restaurant",
    JSON.stringify(restaurant),
  );
}

export function getSelectedRestaurant(): Restaurant | null {
  const restaurant = localStorage.getItem("menuflow_selected_restaurant");

  if (!restaurant) return null;

  return JSON.parse(restaurant);
}

export function clearSelectedRestaurant() {
  localStorage.removeItem("menuflow_selected_restaurant");
}