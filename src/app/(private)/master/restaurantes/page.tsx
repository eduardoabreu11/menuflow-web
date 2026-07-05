"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Eye, Lock, Plus, Search, Store, Trash2, Unlock } from "lucide-react";

import ConfirmDialog from "@/components/ConfirmDialog";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

import {
  activateRestaurant,
  blockRestaurant,
  deleteRestaurant,
  getRestaurants,
  type Restaurant,
} from "@/services/restaurantService";

type StatusFilter = "ALL" | "ACTIVE" | "BLOCKED" | "INACTIVE";

const statusStyles = {
  ACTIVE: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
  INACTIVE: "bg-zinc-100 text-zinc-700",
};

const statusLabels = {
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  INACTIVE: "Inativo",
};

export default function MasterRestaurantsPage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  async function loadRestaurants() {
    try {
      setLoading(true);

      const data = await getRestaurants();

      setRestaurants(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar restaurantes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadRestaurants();
    });
  }, []);

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(normalizedSearch) ||
        restaurant.slug.toLowerCase().includes(normalizedSearch) ||
        restaurant.owner_user_id.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || restaurant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR").format(date);
  }

  function getShortOwnerId(ownerUserId: string) {
    return `${ownerUserId.slice(0, 8)}...`;
  }

  function handleViewRestaurant(restaurant: Restaurant) {
    router.push(`/master/restaurantes/${restaurant.id}`);
  }

  function handleOpenBlockDialog(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    setBlockDialogOpen(true);
  }

  function handleOpenActivateDialog(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    setActivateDialogOpen(true);
  }

  function handleOpenDeleteDialog(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    setDeleteDialogOpen(true);
  }

  async function handleBlockRestaurant() {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);

      await blockRestaurant(selectedRestaurant.id);
      await loadRestaurants();

      setBlockDialogOpen(false);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao bloquear restaurante");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivateRestaurant() {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);

      await activateRestaurant(selectedRestaurant.id);
      await loadRestaurants();

      setActivateDialogOpen(false);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao ativar restaurante");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteRestaurant() {
    if (!selectedRestaurant) return;

    try {
      setActionLoading(true);

      await deleteRestaurant(selectedRestaurant.id);
      await loadRestaurants();

      setDeleteDialogOpen(false);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao excluir restaurante");
    } finally {
      setActionLoading(false);
    }
  }

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

            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60"
              title="Cadastro pelo Master será implementado depois"
            >
              <Plus size={18} />
              Novo Restaurante em breve
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar restaurante..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">Todos os status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="BLOCKED">Bloqueados</option>
                <option value="INACTIVE">Inativos</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Restaurante</th>
                    <th className="px-5 py-4 font-medium">Slug</th>
                    <th className="px-5 py-4 font-medium">Dono</th>
                    <th className="px-5 py-4 font-medium">Plano</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Cadastro</th>
                    <th className="px-5 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        Carregando restaurantes...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredRestaurants.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        Nenhum restaurante encontrado.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredRestaurants.map((restaurant) => (
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
                          {getShortOwnerId(restaurant.owner_user_id)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Completo
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[restaurant.status]
                            }`}
                          >
                            {statusLabels[restaurant.status]}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(restaurant.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewRestaurant(restaurant)}
                              className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
                            </button>

                            {restaurant.status === "BLOCKED" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenActivateDialog(restaurant)
                                }
                                className="rounded-lg border border-border p-2 text-green-600 transition hover:bg-green-50"
                                title="Ativar restaurante"
                              >
                                <Unlock size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenBlockDialog(restaurant)
                                }
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Bloquear restaurante"
                              >
                                <Lock size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteDialog(restaurant)}
                              className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-50"
                              title="Excluir restaurante"
                            >
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
                Mostrando {filteredRestaurants.length} de {restaurants.length}{" "}
                restaurantes
              </p>
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        title="Bloquear restaurante"
        description={`Tem certeza que deseja bloquear ${
          selectedRestaurant?.name ?? "este restaurante"
        }? O dono não poderá gerenciar cardápio, produtos, categorias, banners ou dashboard.`}
        type="danger"
        confirmText="Bloquear"
        loading={actionLoading}
        onConfirm={handleBlockRestaurant}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Ativar restaurante"
        description={`Deseja ativar ${
          selectedRestaurant?.name ?? "este restaurante"
        } novamente? O dono voltará a gerenciar o cardápio.`}
        type="success"
        confirmText="Ativar"
        loading={actionLoading}
        onConfirm={handleActivateRestaurant}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir restaurante"
        description={`Tem certeza que deseja excluir ${
          selectedRestaurant?.name ?? "este restaurante"
        }? Essa ação não poderá ser desfeita.`}
        type="danger"
        confirmText="Excluir"
        loading={actionLoading}
        onConfirm={handleDeleteRestaurant}
      />
    </div>
  );
}
