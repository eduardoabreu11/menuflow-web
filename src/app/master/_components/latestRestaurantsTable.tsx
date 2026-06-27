const restaurants = [
  {
    name: "Pizzaria do João",
    plan: "Pro",
    status: "Ativo",
    date: "02/05/2025",
  },
  {
    name: "Hamburgueria Prime",
    plan: "Básico",
    status: "Ativo",
    date: "01/05/2025",
  },
  {
    name: "Sushi House",
    plan: "Premium",
    status: "Ativo",
    date: "30/04/2025",
  },
  {
    name: "Açaí do Centro",
    plan: "Básico",
    status: "Bloqueado",
    date: "28/04/2025",
  },
  {
    name: "Cantinho da Pizza",
    plan: "Pro",
    status: "Ativo",
    date: "27/04/2025",
  },
];

export function LatestRestaurantsTable() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Últimos Restaurantes Cadastrados
        </h2>

        <button className="text-sm font-medium text-primary hover:opacity-80">
          Ver todos
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {restaurants.map((restaurant) => (
              <tr
                key={restaurant.name}
                className="text-muted-foreground transition hover:bg-accent/50"
              >
                <td className="px-4 py-4 font-medium text-foreground">
                  {restaurant.name}
                </td>

                <td className="px-4 py-4">
                  {restaurant.plan}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`
                      rounded-full px-3 py-1 text-xs font-medium
                      ${
                        restaurant.status === "Ativo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {restaurant.status}
                  </span>
                </td>

                <td className="px-4 py-4">
                  {restaurant.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}