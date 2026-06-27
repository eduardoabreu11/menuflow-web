import { API_URL } from "./api";

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "MASTER" | "RESTAURANT_OWNER" | "RESTAURANT_STAFF";
    is_active: boolean;
  };
};

type ApiErrorResponse = {
  message?: string;
};

export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = "Erro ao fazer login";

    try {
      const errorData: ApiErrorResponse = await response.json();

      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      if (response.status === 401) {
        errorMessage = "E-mail ou senha inválidos";
      }

      if (response.status === 429) {
        errorMessage =
          "Muitas tentativas de login. Tente novamente em 15 minutos.";
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export function saveAuth(data: LoginResponse) {
  localStorage.setItem("menuflow_token", data.token);
  localStorage.setItem("menuflow_user", JSON.stringify(data.user));
}

export function getToken() {
  return localStorage.getItem("menuflow_token");
}

export function getUser() {
  const user = localStorage.getItem("menuflow_user");

  if (!user) return null;

  return JSON.parse(user);
}

export function logout() {
  localStorage.removeItem("menuflow_token");
  localStorage.removeItem("menuflow_user");
  localStorage.removeItem("menuflow_selected_restaurant");
}

export function getAuthHeaders() {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export type SelectedRestaurant = {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  status: string;
};

export function saveSelectedRestaurant(restaurant: SelectedRestaurant) {
  localStorage.setItem(
    "menuflow_selected_restaurant",
    JSON.stringify(restaurant),
  );
}

export function getSelectedRestaurant(): SelectedRestaurant | null {
  const restaurant = localStorage.getItem("menuflow_selected_restaurant");

  if (!restaurant) return null;

  return JSON.parse(restaurant);
}

export function clearSelectedRestaurant() {
  localStorage.removeItem("menuflow_selected_restaurant");
}