"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  Lock,
  Pencil,
  Plus,
  Search,
  Store,
  Trash2,
  Unlock,
  UserRound,
} from "lucide-react";

import ConfirmDialog from "@/components/ConfirmDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

import {
  activateRestaurant,
  blockRestaurant,
  createRestaurant,
  deleteRestaurant,
  getRestaurants,
  updateRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

import { getUsers, type User } from "@/services/userService";

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
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null,
  );

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [createOwnerId, setCreateOwnerId] = useState("");
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const ownerUsers = useMemo(() => {
    return users.filter((user) => user.role === "RESTAURANT_OWNER");
  }, [users]);

  async function loadRestaurants() {
    try {
      setLoading(true);

      const [restaurantsData, usersData] = await Promise.all([
        getRestaurants(),
        getUsers(),
      ]);

      setRestaurants(restaurantsData);
      setUsers(usersData);
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

  function getOwnerById(ownerUserId: string) {
    return users.find((user) => user.id === ownerUserId) ?? null;
  }

  function getOwnerName(ownerUserId: string) {
    const owner = getOwnerById(ownerUserId);

    return owner?.name ?? "Dono não encontrado";
  }

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const ownerName = getOwnerName(restaurant.owner_user_id).toLowerCase();

      const matchesSearch =
        restaurant.name.toLowerCase().includes(normalizedSearch) ||
        restaurant.slug.toLowerCase().includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || restaurant.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, users, search, statusFilter]);

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(date);
  }

  function generateSlug(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function resetCreateForm() {
    setCreateOwnerId(ownerUsers[0]?.id ?? "");
    setCreateName("");
    setCreateSlug("");
    setCreateDescription("");
  }

  function handleOpenCreateDialog() {
    resetCreateForm();
    setCreateDialogOpen(true);
  }

  function handleOpenEditDialog(restaurant: Restaurant) {
    setEditingRestaurant(restaurant);
    setEditName(restaurant.name);
    setEditSlug(restaurant.slug);
    setEditDescription(restaurant.description ?? "");
    setEditDialogOpen(true);
  }

  function handleViewRestaurant(restaurant: Restaurant) {
    router.push(`/master/restaurantes/${restaurant.id}`);
  }

  function handleViewOwner(ownerUserId: string) {
    router.push(`/master/usuarios/${ownerUserId}`);
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

  async function handleCreateRestaurant() {
    if (!createOwnerId) {
      alert("Selecione o dono do restaurante");
      return;
    }

    if (!createName.trim()) {
      alert("Informe o nome do restaurante");
      return;
    }

    if (!createSlug.trim()) {
      alert("Informe o slug do restaurante");
      return;
    }

    try {
      setCreateLoading(true);

      await createRestaurant({
        owner_user_id: createOwnerId,
        name: createName.trim(),
        slug: createSlug.trim(),
        description: createDescription.trim() || undefined,
      });

      await loadRestaurants();

      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao criar restaurante");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleUpdateRestaurant() {
    if (!editingRestaurant) return;

    if (!editName.trim()) {
      alert("Informe o nome do restaurante");
      return;
    }

    if (!editSlug.trim()) {
      alert("Informe o slug do restaurante");
      return;
    }

    try {
      setEditLoading(true);

      await updateRestaurant(editingRestaurant.id, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim() || undefined,
      });

      await loadRestaurants();

      setEditDialogOpen(false);
      setEditingRestaurant(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao atualizar restaurante");
    } finally {
      setEditLoading(false);
    }
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
              onClick={handleOpenCreateDialog}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={18} />
              Novo restaurante
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
                placeholder="Buscar restaurante ou dono..."
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
                    filteredRestaurants.map((restaurant) => {
                      const owner = getOwnerById(restaurant.owner_user_id);

                      return (
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

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-foreground">
                                  {owner?.name ?? "Dono não encontrado"}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {owner?.email ?? restaurant.owner_user_id}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewOwner(restaurant.owner_user_id)
                                }
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Ver dono"
                              >
                                <UserRound size={15} />
                              </button>
                            </div>
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

                              <button
                                type="button"
                                onClick={() => handleOpenEditDialog(restaurant)}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Editar restaurante"
                              >
                                <Pencil size={16} />
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
                                onClick={() =>
                                  handleOpenDeleteDialog(restaurant)
                                }
                                className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-50"
                                title="Excluir restaurante"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo restaurante</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Dono do restaurante</Label>

              <select
                value={createOwnerId}
                onChange={(event) => setCreateOwnerId(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Selecione um dono</option>

                {ownerUsers.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} — {owner.email}
                  </option>
                ))}
              </select>

              {ownerUsers.length === 0 && (
                <p className="mt-2 text-xs text-red-600">
                  Cadastre um usuário dono antes de criar um restaurante.
                </p>
              )}
            </div>

            <div>
              <Label>Nome</Label>

              <Input
                value={createName}
                onChange={(event) => {
                  const value = event.target.value;

                  setCreateName(value);

                  if (!createSlug.trim()) {
                    setCreateSlug(generateSlug(value));
                  }
                }}
                placeholder="Nome do restaurante"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Slug</Label>

              <Input
                value={createSlug}
                onChange={(event) =>
                  setCreateSlug(generateSlug(event.target.value))
                }
                placeholder="slug-do-restaurante"
                className="mt-2"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Será usado no link público do cardápio.
              </p>
            </div>

            <div>
              <Label>Descrição</Label>

              <textarea
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                placeholder="Descrição do restaurante"
                className="mt-2 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={createLoading}
              onClick={() => {
                resetCreateForm();
                setCreateDialogOpen(false);
              }}
            >
              Cancelar
            </Button>

            <Button
              disabled={createLoading || ownerUsers.length === 0}
              onClick={handleCreateRestaurant}
            >
              {createLoading ? "Criando..." : "Criar restaurante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar restaurante</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome</Label>

              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Nome do restaurante"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Slug</Label>

              <Input
                value={editSlug}
                onChange={(event) =>
                  setEditSlug(generateSlug(event.target.value))
                }
                placeholder="slug-do-restaurante"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Descrição</Label>

              <textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                placeholder="Descrição do restaurante"
                className="mt-2 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              O dono atual não é alterado por este formulário.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={editLoading}
              onClick={() => {
                setEditDialogOpen(false);
                setEditingRestaurant(null);
              }}
            >
              Cancelar
            </Button>

            <Button disabled={editLoading} onClick={handleUpdateRestaurant}>
              {editLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
