import { apiFetch, getApiErrorMessage } from "./api";

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
  owner_user_id?: string;
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

const SELECTED_RESTAURANT_KEY = "menuflow_selected_restaurant";

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

export async function getMyRestaurants(): Promise<Restaurant[]> {
  return getRestaurants();
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
  if (typeof window === "undefined") return;

  localStorage.setItem(
    SELECTED_RESTAURANT_KEY,
    JSON.stringify(restaurant),
  );
}

export function getSelectedRestaurant(): Restaurant | null {
  if (typeof window === "undefined") return null;

  const restaurant = localStorage.getItem(SELECTED_RESTAURANT_KEY);

  if (!restaurant) return null;

  try {
    return JSON.parse(restaurant);
  } catch {
    clearSelectedRestaurant();
    return null;
  }
}

export function clearSelectedRestaurant() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SELECTED_RESTAURANT_KEY);
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  const response = await apiFetch(`/restaurants/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar restaurante"),
    );
  }

  return response.json();
}

export async function blockRestaurant(id: string): Promise<Restaurant> {
  const response = await apiFetch(`/restaurants/${id}/block`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao bloquear restaurante"),
    );
  }

  return response.json();
}

export async function activateRestaurant(id: string): Promise<Restaurant> {
  const response = await apiFetch(`/restaurants/${id}/activate`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao ativar restaurante"),
    );
  }

  return response.json();
}

export async function deleteRestaurant(id: string): Promise<void> {
  const response = await apiFetch(`/restaurants/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao excluir restaurante"),
    );
  }
}