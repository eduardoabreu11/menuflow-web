import {
  Eye,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
} from "lucide-react";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

const plans = [
  {
    id: 1,
    name: "Premium",
    description: "Plano completo para restaurantes.",
    monthlyPrice: "R$ 99,90",
    annualPrice: "R$ 999,90",
    maxRestaurants: "1 restaurante",
    maxProducts: "Ilimitado",
    maxCategories: "Ilimitado",
    status: "Ativo",
  },
];

const statusStyles = {
  Ativo: "bg-green-100 text-green-700",
  Inativo: "bg-red-100 text-red-700",
};

export default function MasterPlansPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Planos
              </h1>

              <p className="mt-1 text-muted-foreground">
                Gerencie os planos disponíveis para os restaurantes.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              <Plus size={18} />
              Novo Plano
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
                placeholder="Buscar plano..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <select className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary">
              <option>Todos os status</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Plano</th>
                    <th className="px-5 py-4 font-medium">Mensal</th>
                    <th className="px-5 py-4 font-medium">Anual</th>
                    <th className="px-5 py-4 font-medium">Restaurantes</th>
                    <th className="px-5 py-4 font-medium">Produtos</th>
                    <th className="px-5 py-4 font-medium">Categorias</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {plans.map((plan) => (
                    <tr
                      key={plan.id}
                      className="transition hover:bg-accent/50"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {plan.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {plan.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {plan.monthlyPrice}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {plan.annualPrice}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {plan.maxRestaurants}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {plan.maxProducts}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {plan.maxCategories}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyles[
                              plan.status as keyof typeof statusStyles
                            ]
                          }`}
                        >
                          {plan.status}
                        </span>
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
                            <Power size={16} />
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
                Mostrando 1 de 1 plano
              </p>

              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                  1
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}