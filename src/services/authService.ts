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
  const response = await apiFetch("/logout", {
    method: "POST",
  });

  clearAuth();

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Erro ao sair da conta"));
  }
}

export function getUser(): AuthUser | null {
  return currentUser;
}

export function setUser(user: AuthUser | null) {
  currentUser = user;
}

export function clearAuth() {
  currentUser = null;

  localStorage.removeItem("menuflow_token");
  localStorage.removeItem("menuflow_user");
  localStorage.removeItem("menuflow_selected_restaurant");
}