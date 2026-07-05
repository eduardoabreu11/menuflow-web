"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  Lock,
  Mail,
  Pencil,
  Plus,
  Search,
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
  activateUser,
  createUser,
  deleteUser,
  disableUser,
  getUsers,
  updateUser,
  type User,
  type UserRole,
} from "@/services/userService";

type EditableUserRole = "MASTER" | "RESTAURANT_OWNER";
type RoleFilter = "ALL" | EditableUserRole;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

function getRoleLabel(role: UserRole) {
  if (role === "MASTER") return "Master";
  if (role === "RESTAURANT_OWNER") return "Dono";

  return "Outro";
}

function getRoleStyle(role: UserRole) {
  if (role === "MASTER") return "bg-purple-100 text-purple-700";
  if (role === "RESTAURANT_OWNER") return "bg-primary/10 text-primary";

  return "bg-zinc-100 text-zinc-700";
}

export default function MasterUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] =
    useState<EditableUserRole>("RESTAURANT_OWNER");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] =
    useState<EditableUserRole>("RESTAURANT_OWNER");

  const [actionLoading, setActionLoading] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
    });
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      if (user.role === "RESTAURANT_STAFF") {
        return false;
      }

      const matchesSearch =
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.is_active) ||
        (statusFilter === "INACTIVE" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }).format(date);
  }

  function handleViewUser(user: User) {
    router.push(`/master/usuarios/${user.id}`);
  }

  function handleOpenCreateDialog() {
    resetCreateForm();
    setCreateDialogOpen(true);
  }

  function resetCreateForm() {
    setCreateName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateRole("RESTAURANT_OWNER");
  }

  function handleOpenEditDialog(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role === "MASTER" ? "MASTER" : "RESTAURANT_OWNER");
    setEditDialogOpen(true);
  }

  function handleOpenActivateDialog(user: User) {
    setSelectedUser(user);
    setActivateDialogOpen(true);
  }

  function handleOpenDisableDialog(user: User) {
    setSelectedUser(user);
    setDisableDialogOpen(true);
  }

  function handleOpenDeleteDialog(user: User) {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }

  async function handleCreateUser() {
    if (!createName.trim()) {
      alert("Informe o nome do usuário");
      return;
    }

    if (!createEmail.trim()) {
      alert("Informe o e-mail do usuário");
      return;
    }

    if (!createPassword.trim()) {
      alert("Informe uma senha inicial");
      return;
    }

    try {
      setCreateLoading(true);

      await createUser({
        name: createName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        role: createRole,
      });

      await loadUsers();

      resetCreateForm();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao criar usuário");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleUpdateUser() {
    if (!editingUser) return;

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

      await updateUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
      });

      await loadUsers();

      setEditDialogOpen(false);
      setEditingUser(null);
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
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await activateUser(selectedUser.id);
      await loadUsers();

      setActivateDialogOpen(false);
      setSelectedUser(null);
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
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await disableUser(selectedUser.id);
      await loadUsers();

      setDisableDialogOpen(false);
      setSelectedUser(null);
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
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await deleteUser(selectedUser.id);
      await loadUsers();

      setDeleteDialogOpen(false);
      setSelectedUser(null);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Usuários</h1>

              <p className="mt-1 text-muted-foreground">
                Gerencie os usuários cadastrados na plataforma.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateDialog}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus size={18} />
              Novo usuário
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar usuário..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as RoleFilter)
                }
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">Todas as funções</option>
                <option value="MASTER">Master</option>
                <option value="RESTAURANT_OWNER">Donos</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="ALL">Todos os status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="INACTIVE">Inativos</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-hidden rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Usuário</th>
                    <th className="px-5 py-4 font-medium">E-mail</th>
                    <th className="px-5 py-4 font-medium">Função</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Cadastro</th>
                    <th className="px-5 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        Carregando usuários...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-accent/50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <UserRound size={18} />
                            </div>

                            <span className="font-medium text-foreground">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail size={15} />
                            {user.email}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleStyle(
                              user.role,
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleViewUser(user)}
                              className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditDialog(user)}
                              className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                              title="Editar usuário"
                            >
                              <Pencil size={16} />
                            </button>

                            {user.is_active ? (
                              <button
                                type="button"
                                onClick={() => handleOpenDisableDialog(user)}
                                className="rounded-lg border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                title="Desativar usuário"
                              >
                                <Lock size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenActivateDialog(user)}
                                className="rounded-lg border border-border p-2 text-green-600 transition hover:bg-green-50"
                                title="Ativar usuário"
                              >
                                <Unlock size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteDialog(user)}
                              className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-50"
                              title="Excluir usuário"
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
                Mostrando {filteredUsers.length} de {users.length} usuários
              </p>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome</Label>

              <Input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Nome do usuário"
                className="mt-2"
              />
            </div>

            <div>
              <Label>E-mail</Label>

              <Input
                value={createEmail}
                onChange={(event) => setCreateEmail(event.target.value)}
                placeholder="email@exemplo.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Senha inicial</Label>

              <Input
                type="password"
                value={createPassword}
                onChange={(event) => setCreatePassword(event.target.value)}
                placeholder="Senha inicial"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Função</Label>

              <select
                value={createRole}
                onChange={(event) =>
                  setCreateRole(event.target.value as EditableUserRole)
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
              disabled={createLoading}
              onClick={() => {
                resetCreateForm();
                setCreateDialogOpen(false);
              }}
            >
              Cancelar
            </Button>

            <Button disabled={createLoading} onClick={handleCreateUser}>
              {createLoading ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={() => {
                setEditDialogOpen(false);
                setEditingUser(null);
              }}
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
        description={`Deseja ativar ${
          selectedUser?.name ?? "este usuário"
        } novamente? Ele poderá acessar o sistema.`}
        type="success"
        confirmText="Ativar"
        loading={actionLoading}
        onConfirm={handleActivateUser}
      />

      <ConfirmDialog
        open={disableDialogOpen}
        onOpenChange={setDisableDialogOpen}
        title="Desativar usuário"
        description={`Tem certeza que deseja desativar ${
          selectedUser?.name ?? "este usuário"
        }? Ele não poderá mais acessar o sistema.`}
        type="danger"
        confirmText="Desativar"
        loading={actionLoading}
        onConfirm={handleDisableUser}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir ${
          selectedUser?.name ?? "este usuário"
        }? Essa ação não poderá ser desfeita.`}
        type="danger"
        confirmText="Excluir"
        loading={actionLoading}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}