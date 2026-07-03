import {
  Eye,
  Lock,
  Pencil,
  Plus,
  Search,
  Store,
  Trash2,
} from "lucide-react";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

const restaurants = [
  {
    id: 1,
    name: "Pizzaria do João",
    slug: "pizzaria-do-joao",
    owner: "João Silva",
    plan: "Pro",
    status: "Ativo",
    createdAt: "02/05/2025",
  },
  {
    id: 2,
    name: "Hamburgueria Prime",
    slug: "hamburgueria-prime",
    owner: "Carlos Mendes",
    plan: "Básico",
    status: "Ativo",
    createdAt: "01/05/2025",
  },
  {
    id: 3,
    name: "Sushi House",
    slug: "sushi-house",
    owner: "Marina Costa",
    plan: "Premium",
    status: "Ativo",
    createdAt: "30/04/2025",
  },
  {
    id: 4,
    name: "Açaí do Centro",
    slug: "acai-do-centro",
    owner: "Fernanda Lima",
    plan: "Básico",
    status: "Bloqueado",
    createdAt: "28/04/2025",
  },
  {
    id: 5,
    name: "Cantinho da Pizza",
    slug: "cantinho-da-pizza",
    owner: "Rafael Souza",
    plan: "Pro",
    status: "Ativo",
    createdAt: "27/04/2025",
  },
];

const planStyles = {
  Básico: "bg-blue-100 text-blue-700",
  Pro: "bg-primary/10 text-primary",
  Premium: "bg-amber-100 text-amber-700",
};

const statusStyles = {
  Ativo: "bg-green-100 text-green-700",
  Bloqueado: "bg-red-100 text-red-700",
};

export default function MasterRestaurantsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Restaurantes
              </h1>

              <p className="mt-1 text-muted-foreground">
                Gerencie os restaurantes cadastrados na plataforma.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              <Plus size={18} />
              Novo Restaurante
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                placeholder="Buscar restaurante..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <select className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary">
                <option>Todos os planos</option>
                <option>Básico</option>
                <option>Pro</option>
                <option>Premium</option>
              </select>

              <select className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary">
                <option>Todos os status</option>
                <option>Ativo</option>
                <option>Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">
                      Restaurante
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Slug
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Dono
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Plano
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Cadastro
                    </th>
                    <th className="px-5 py-4 text-right font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {restaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="transition hover:bg-accent/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Store size={18} />
                          </div>

                          <span className="font-medium text-foreground">
                            {restaurant.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {restaurant.slug}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {restaurant.owner}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            planStyles[
                              restaurant.plan as keyof typeof planStyles
                            ]
                          }`}
                        >
                          {restaurant.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[
                              restaurant.status as keyof typeof statusStyles
                            ]
                          }`}
                        >
                          {restaurant.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {restaurant.createdAt}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                            <Eye size={16} />
                          </button>

                          <button className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                            <Pencil size={16} />
                          </button>

                          <button className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                            <Lock size={16} />
                          </button>

                          <button className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Mostrando 1 a 5 de 24 resultados
              </p>

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                  1
                </button>

                <button className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                  2
                </button>

                <button className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                  3
                </button>

                <span className="px-2 text-muted-foreground">
                  ...
                </span>

                <button className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                  5
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}