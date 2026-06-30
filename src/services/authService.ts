import { apiFetch, getApiErrorMessage } from "./api";

type LoginData = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "MASTER" | "RESTAURANT_OWNER" | "RESTAURANT_STAFF";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type LoginResponse = {
  token?: string;
  user: AuthUser;
};

export type SelectedRestaurant = {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  status: string;
};

let currentUser: AuthUser | null = null;

export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = "Erro ao fazer login";

    if (response.status === 401) {
      errorMessage = "E-mail ou senha inválidos";
    }

    if (response.status === 429) {
      errorMessage =
        "Muitas tentativas de login. Tente novamente em 15 minutos.";
    }

    throw new Error(await getApiErrorMessage(response, errorMessage));
  }

  const result: LoginResponse = await response.json();

  currentUser = result.user;

  return result;
}

export async function getMe(): Promise<AuthUser> {
  const response = await apiFetch("/me", {
    method: "GET",
  });

  if (!response.ok) {
    currentUser = null;

    throw new Error(
      await getApiErrorMessage(response, "Usuário não autenticado"),
    );
  }

  const user: AuthUser = await response.json();

  currentUser = user;

  return user;
}

export async function logout() {
  await apiFetch("/logout", {
    method: "POST",
  });

  clearAuth();
}

export function getUser(): AuthUser | null {
  return currentUser;
}

export function clearAuth() {
  currentUser = null;

  localStorage.removeItem("menuflow_token");
  localStorage.removeItem("menuflow_user");
  localStorage.removeItem("menuflow_selected_restaurant");
}

export function saveAuth(data: LoginResponse) {
  currentUser = data.user;
}

export function getToken() {
  return null;
}

export function getAuthHeaders() {
  return {};
}

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