"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getMyRestaurants,
  saveSelectedRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

export default function SelectRestaurantPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const data = await getMyRestaurants();

        if (data.length === 1) {
          saveSelectedRestaurant(data[0]);
          router.push("/admin");
          return;
        }

        setRestaurants(data);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar restaurantes");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, [router]);

  function handleSelectRestaurant(restaurant: Restaurant) {
    saveSelectedRestaurant(restaurant);
    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Escolha um restaurante
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Selecione qual restaurante deseja gerenciar agora.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/master/restaurantes")}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Inserir restaurante
          </button>
        </div>
        {loading && (
          <p className="text-sm text-zinc-500">Carregando restaurantes...</p>
        )}

        {!loading && restaurants.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nenhum restaurante encontrado.
          </p>
        )}

        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => handleSelectRestaurant(restaurant)}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 text-left transition hover:border-violet-500 hover:bg-violet-50"
            >
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  {restaurant.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {restaurant.address || "Sem endereço cadastrado"}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  /cardapio/{restaurant.slug}
                </p>
              </div>

              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                {restaurant.status}
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
