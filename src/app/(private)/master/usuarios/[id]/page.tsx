"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Calendar,
  Eye,
  Lock,
  Mail,
  Pencil,
  Shield,
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

import { MasterSidebar } from "../../_components/masterSidebar";
import { MasterTopbar } from "../../_components/masterTopbar";

import {
  activateUser,
  deleteUser,
  disableUser,
  getUserById,
  updateUser,
  type User,
  type UserRole,
} from "@/services/userService";

import { getRestaurants, type Restaurant } from "@/services/restaurantService";

type EditableUserRole = "MASTER" | "RESTAURANT_OWNER";

function getRoleLabel(role: UserRole) {
  if (role === "MASTER") return "Master";
  if (role === "RESTAURANT_OWNER") return "Dono do restaurante";

  return "Outro";
}

function getRoleStyle(role: UserRole) {
  if (role === "MASTER") return "text-purple-600";
  if (role === "RESTAURANT_OWNER") return "text-primary";

  return "text-zinc-600";
}

export default function MasterUserDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const userId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] =
    useState<EditableUserRole>("RESTAURANT_OWNER");

  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function loadUserDetails() {
    try {
      setLoading(true);

      const [userData, restaurantsData] = await Promise.all([
        getUserById(userId),
        getRestaurants(),
      ]);

      setUser(userData);
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar usuário");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;

    queueMicrotask(() => {
      void loadUserDetails();
    });
  }, [userId]);

  const userRestaurants = useMemo(() => {
    if (!user) return [];

    return restaurants.filter(
      (restaurant) => restaurant.owner_user_id === user.id,
    );
  }, [restaurants, user]);

  function formatDate(value?: string) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(date);
  }

  function handleOpenEditDialog() {
    if (!user) return;

    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role === "MASTER" ? "MASTER" : "RESTAURANT_OWNER");
    setEditDialogOpen(true);
  }

  async function handleUpdateUser() {
    if (!user) return;

    if (!editName.trim()) {
      alert("Informe o nome do usuário");
      return;
    }

    if (!editEmail.trim()) {
      alert("Informe o e-mail do usuário");
      return;
    }

    try {
      setEditLoading(true);

      await updateUser(user.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      });

      await loadUserDetails();

      setEditDialogOpen(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao atualizar usuário");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleActivateUser() {
    if (!user) return;

    try {
      setActionLoading(true);

      await activateUser(user.id);
      await loadUserDetails();

      setActivateDialogOpen(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao ativar usuário");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisableUser() {
    if (!user) return;

    try {
      setActionLoading(true);

      await disableUser(user.id);
      await loadUserDetails();

      setDisableDialogOpen(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao desativar usuário");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!user) return;

    try {
      setActionLoading(true);

      await deleteUser(user.id);

      setDeleteDialogOpen(false);

      router.push("/master/usuarios");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao excluir usuário");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MasterSidebar />

        <div className="ml-64">
          <MasterTopbar />

          <main className="p-8">
            <h1 className="text-3xl font-bold text-foreground">Usuário</h1>

            <p className="mt-2 text-muted-foreground">
              Carregando detalhes do usuário...
            </p>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MasterSidebar />

        <div className="ml-64">
          <MasterTopbar />

          <main className="p-8">
            <h1 className="text-3xl font-bold text-foreground">
              Usuário não encontrado
            </h1>

            <p className="mt-2 text-muted-foreground">
              Não foi possível carregar este usuário.
            </p>

            <button
              type="button"
              onClick={() => router.push("/master/usuarios")}
              className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Voltar para usuários
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/master/usuarios")}
                className="mb-3 text-sm font-medium text-primary hover:underline"
              >
                ← Voltar para usuários
              </button>

              <h1 className="text-3xl font-bold text-foreground">
                {user.name}
              </h1>

              <p className="mt-1 text-muted-foreground">
                Informações completas do usuário.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleOpenEditDialog}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Pencil size={17} />
                Editar
              </button>

              {user.is_active ? (
                <button
                  type="button"
                  onClick={() => setDisableDialogOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Lock size={17} />
                  Desativar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActivateDialogOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-green-200 bg-background px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                >
                  <Unlock size={17} />
                  Ativar
                </button>
              )}

              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={17} />
                Excluir
              </button>
            </div>
          </div>

          {!user.is_active && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              Este usuário está inativo e não pode acessar o sistema.
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserRound size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Status</p>

              <h3
                className={`mt-2 text-xl font-bold ${
                  user.is_active ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.is_active ? "Ativo" : "Inativo"}
              </h3>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Função</p>

              <h3 className={`mt-2 text-xl font-bold ${getRoleStyle(user.role)}`}>
                {getRoleLabel(user.role)}
              </h3>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Restaurantes</p>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                {userRestaurants.length}
              </h3>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Cadastro</p>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                {formatDate(user.created_at)}
              </h3>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Dados do Usuário
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem label="Nome" value={user.name} />
                  <InfoItem label="E-mail" value={user.email} />
                  <InfoItem label="Função" value={getRoleLabel(user.role)} />
                  <InfoItem
                    label="Status"
                    value={user.is_active ? "Ativo" : "Inativo"}
                  />
                  <InfoItem
                    label="Criado em"
                    value={formatDate(user.created_at)}
                  />
                  <InfoItem
                    label="Atualizado em"
                    value={formatDate(user.updated_at)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Restaurantes vinculados
                </h2>

                {userRestaurants.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
                    <Store className="mx-auto mb-2 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      Este usuário não possui restaurante vinculado.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">
                            Restaurante
                          </th>
                          <th className="px-4 py-3 font-medium">Slug</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">
                            Ações
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {userRestaurants.map((restaurant) => (
                          <tr key={restaurant.id}>
                            <td className="px-4 py-4 font-medium text-foreground">
                              {restaurant.name}
                            </td>

                            <td className="px-4 py-4 text-muted-foreground">
                              {restaurant.slug}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  restaurant.status === "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : restaurant.status === "BLOCKED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-zinc-100 text-zinc-700"
                                }`}
                              >
                                {restaurant.status === "ACTIVE"
                                  ? "Ativo"
                                  : restaurant.status === "BLOCKED"
                                    ? "Bloqueado"
                                    : "Inativo"}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/master/restaurantes/${restaurant.id}`,
                                  )
                                }
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Ver restaurante"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Contato
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <UserRound size={17} className="text-primary" />
                    {user.name}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail size={17} className="text-primary" />
                    {user.email}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield size={17} className="text-primary" />
                    {getRoleLabel(user.role)}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Store size={17} className="text-primary" />
                    {userRestaurants.length} restaurante(s)
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Observações
                </h2>

                <p className="text-sm text-muted-foreground">
                  Usuários do tipo dono podem ter restaurantes vinculados.
                  Usuários Master administram a plataforma.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome</Label>

              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Nome do usuário"
                className="mt-2"
              />
            </div>

            <div>
              <Label>E-mail</Label>

              <Input
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Função</Label>

              <select
                value={editRole}
                onChange={(event) =>
                  setEditRole(event.target.value as EditableUserRole)
                }
                className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="RESTAURANT_OWNER">Dono do restaurante</option>
                <option value="MASTER">Master</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={editLoading}
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>

            <Button disabled={editLoading} onClick={handleUpdateUser}>
              {editLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Ativar usuário"
        description={`Deseja ativar ${user.name} novamente? Ele poderá acessar o sistema.`}
        type="success"
        confirmText="Ativar"
        loading={actionLoading}
        onConfirm={handleActivateUser}
      />

      <ConfirmDialog
        open={disableDialogOpen}
        onOpenChange={setDisableDialogOpen}
        title="Desativar usuário"
        description={`Tem certeza que deseja desativar ${user.name}? Ele não poderá mais acessar o sistema.`}
        type="danger"
        confirmText="Desativar"
        loading={actionLoading}
        onConfirm={handleDisableUser}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir ${user.name}? Essa ação não poderá ser desfeita.`}
        type="danger"
        confirmText="Excluir"
        loading={actionLoading}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}