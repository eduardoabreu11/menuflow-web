"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getUser } from "@/services/authService";
import {
  createRestaurant,
  saveSelectedRestaurant,
} from "@/services/restaurantService";

export default function NewRestaurantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const user = getUser();

      if (!user) {
        alert("Usuário não autenticado");
        router.push("/login");
        return;
      }

      if (!name.trim()) {
        alert("Informe o nome do restaurante");
        return;
      }

      if (!slug.trim()) {
        alert("Informe o slug do restaurante");
        return;
      }

      setLoading(true);

      const restaurant = await createRestaurant({
        owner_user_id: user.id,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      saveSelectedRestaurant(restaurant);

      router.push("/admin");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar restaurante");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            Criar restaurante
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Cadastre seu restaurante para começar a montar seu cardápio digital.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Nome do restaurante *
            </label>

            <input
              value={name}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                setSlug(generateSlug(value));
              }}
              placeholder="Ex: Pizzaria do João"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Slug *
            </label>

            <input
              value={slug}
              onChange={(event) => setSlug(generateSlug(event.target.value))}
              placeholder="pizzaria-do-joao"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-600"
            />

            <p className="mt-2 text-xs text-zinc-500">
              Seu cardápio ficará em:
            </p>

            <p className="text-xs font-medium text-violet-600">
              /cardapio/{slug || "seu-restaurante"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Descrição
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Conte um pouco sobre seu restaurante..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-600"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-zinc-300 px-5 py-3 font-medium text-zinc-700"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar restaurante"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}