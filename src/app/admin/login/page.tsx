"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login, saveAuth } from "@/services/authService";

import {
  getMyRestaurants,
  saveSelectedRestaurant,
} from "@/services/restaurantService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);

      const data = await login({
        email,
        password,
      });

      saveAuth(data);

      if (data.user.role === "MASTER") {
        router.push("/master");
        return;
      }

      const restaurants = await getMyRestaurants();

      if (restaurants.length === 0) {
        router.push("/admin/restaurantes/novo");
        return;
      }

      if (restaurants.length === 1) {
        saveSelectedRestaurant(restaurants[0]);
        router.push("/admin");
        return;
      }

      router.push("/admin/restaurantes/selecionar");
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "Erro ao fazer login";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
            🔐
          </div>

          <h1 className="text-2xl font-bold text-zinc-900">Acesse sua conta</h1>

          <p className="mt-2 text-sm text-zinc-500">
            Entre para gerenciar o cardápio do seu restaurante.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              E-mail
            </label>

            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Senha
            </label>

            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm font-medium text-violet-600 hover:underline"
          >
            Esqueceu sua senha?
          </a>
        </div>
      </section>
    </main>
  );
}
