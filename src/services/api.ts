// src/services/api.ts

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export type ApiErrorResponse = {
  message?: string;
};

type ApiFetchOptions = RequestInit & {
  skipJsonContentType?: boolean;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
) {
  const { skipJsonContentType, headers, body, ...rest } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  return fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    credentials: "include",
    headers: {
      ...(skipJsonContentType || isFormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    },
  });
}

export async function getApiErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const errorData: ApiErrorResponse = await response.json();

    if (errorData.message) {
      return errorData.message;
    }
  } catch {
    return fallback;
  }

  return fallback;
}