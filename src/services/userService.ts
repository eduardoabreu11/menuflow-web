import { apiFetch, getApiErrorMessage } from "./api";

export type UserRole = "MASTER" | "RESTAURANT_OWNER" | "RESTAURANT_STAFF";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type UpdateUserData = {
  name?: string;
  email?: string;
  role?: UserRole;
};

export async function getUsers(): Promise<User[]> {
  const response = await apiFetch("/users", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar usuários"),
    );
  }

  return response.json();
}

export async function getUserById(id: string): Promise<User> {
  const response = await apiFetch(`/users/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar usuário"),
    );
  }

  return response.json();
}

export async function createUser(data: CreateUserData): Promise<User> {
  const response = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao criar usuário"),
    );
  }

  return response.json();
}

export async function updateUser(
  id: string,
  data: UpdateUserData,
): Promise<User> {
  const response = await apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao atualizar usuário"),
    );
  }

  return response.json();
}

export async function activateUser(id: string): Promise<User> {
  const response = await apiFetch(`/users/${id}/activate`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao ativar usuário"),
    );
  }

  return response.json();
}

export async function disableUser(id: string): Promise<User> {
  const response = await apiFetch(`/users/${id}/disable`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao desativar usuário"),
    );
  }

  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao excluir usuário"),
    );
  }
}