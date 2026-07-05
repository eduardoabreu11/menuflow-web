"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Ban,
  Calendar,
  CheckCircle,
  CreditCard,
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
  Store,
  Tag,
  User,
  Users,
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
  activateRestaurant,
  blockRestaurant,
  getRestaurantById,
  updateRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

import { getCategories, type Category } from "@/services/categoryService";
import { getProducts, type Product } from "@/services/productService";
import { getBanners, type Banner } from "@/services/bannerService";
import { getUserById, type User as OwnerUser } from "@/services/userService";

const statusLabels = {
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  INACTIVE: "Inativo",
};

const statusTextStyles = {
  ACTIVE: "text-green-600",
  BLOCKED: "text-red-600",
  INACTIVE: "text-zinc-600",
};

const userStatusStyles = {
  true: "bg-green-100 text-green-700",
  false: "bg-red-100 text-red-700",
};

export default function RestaurantDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const restaurantId = params.id;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ownerUser, setOwnerUser] = useState<OwnerUser | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editOpeningHours, setEditOpeningHours] = useState("");

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  async function loadRestaurantDetails() {
    try {
      setLoading(true);

      const restaurantData = await getRestaurantById(restaurantId);

      const [categoriesData, productsData, bannersData, ownerData] =
        await Promise.all([
          getCategories(restaurantId),
          getProducts(restaurantId),
          getBanners(restaurantId),
          getUserById(restaurantData.owner_user_id),
        ]);

      setRestaurant(restaurantData);
      setCategories(categoriesData);
      setProducts(productsData);
      setBanners(bannersData);
      setOwnerUser(ownerData);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar detalhes do restaurante");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!restaurantId) return;

    queueMicrotask(() => {
      void loadRestaurantDetails();
    });
  }, [restaurantId]);

  const publicUrl = useMemo(() => {
    if (!restaurant) return "";

    if (typeof window === "undefined") {
      return `/cardapio/${restaurant.slug}`;
    }

    return `${window.location.origin}/cardapio/${restaurant.slug}`;
  }, [restaurant]);

  const activeProductsCount = useMemo(() => {
    return products.filter((product) => product.is_active).length;
  }, [products]);

  const activeBannersCount = useMemo(() => {
    return banners.filter((banner) => banner.is_active).length;
  }, [banners]);

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

  function handleViewOwner() {
    if (!restaurant) return;

    router.push(`/master/usuarios/${restaurant.owner_user_id}`);
  }

  function handleOpenEditDialog() {
    if (!restaurant) return;

    setEditName(restaurant.name);
    setEditSlug(restaurant.slug);
    setEditDescription(restaurant.description ?? "");
    setEditLogoUrl(restaurant.logo_url ?? "");
    setEditWhatsapp(restaurant.whatsapp ?? "");
    setEditPhone(restaurant.phone ?? "");
    setEditAddress(restaurant.address ?? "");
    setEditOpeningHours(restaurant.opening_hours ?? "");

    setEditDialogOpen(true);
  }

  async function handleUpdateRestaurant() {
    if (!restaurant) return;

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

      await updateRestaurant(restaurant.id, {
        name: editName.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim() || null,
        logo_url: editLogoUrl.trim() || null,
        whatsapp: editWhatsapp.trim() || null,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
        opening_hours: editOpeningHours.trim() || null,
      });

      await loadRestaurantDetails();

      setEditDialogOpen(false);
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
    if (!restaurant) return;

    try {
      setActionLoading(true);

      await blockRestaurant(restaurant.id);
      await loadRestaurantDetails();

      setBlockDialogOpen(false);
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
    if (!restaurant) return;

    try {
      setActionLoading(true);

      await activateRestaurant(restaurant.id);
      await loadRestaurantDetails();

      setActivateDialogOpen(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MasterSidebar />

        <div className="ml-64">
          <MasterTopbar />

          <main className="p-8">
            <h1 className="text-3xl font-bold text-foreground">
              Restaurante
            </h1>

            <p className="mt-2 text-muted-foreground">
              Carregando detalhes do restaurante...
            </p>
          </main>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MasterSidebar />

        <div className="ml-64">
          <MasterTopbar />

          <main className="p-8">
            <h1 className="text-3xl font-bold text-foreground">
              Restaurante não encontrado
            </h1>

            <p className="mt-2 text-muted-foreground">
              Não foi possível carregar este restaurante.
            </p>

            <button
              type="button"
              onClick={() => router.push("/master/restaurantes")}
              className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Voltar para restaurantes
            </button>
          </main>
        </div>
      </div>
    );
  }

  const isBlocked = restaurant.status === "BLOCKED";

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
                onClick={() => router.push("/master/restaurantes")}
                className="mb-3 text-sm font-medium text-primary hover:underline"
              >
                ← Voltar para restaurantes
              </button>

              <h1 className="text-3xl font-bold text-foreground">
                {restaurant.name}
              </h1>

              <p className="mt-1 text-muted-foreground">
                Informações completas do restaurante.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <ExternalLink size={17} />
                Ver cardápio
              </a>

              <button
                type="button"
                onClick={handleViewOwner}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <User size={17} />
                Ver dono
              </button>

              <button
                type="button"
                onClick={handleOpenEditDialog}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Pencil size={17} />
                Editar
              </button>

              {isBlocked ? (
                <button
                  type="button"
                  onClick={() => setActivateDialogOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-green-200 bg-background px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                >
                  <CheckCircle size={17} />
                  Ativar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setBlockDialogOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Ban size={17} />
                  Bloquear
                </button>
              )}
            </div>
          </div>

          {isBlocked && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              Este restaurante está bloqueado. O dono pode visualizar, mas não
              pode gerenciar categorias, produtos, banners, dados do cardápio ou
              dashboard.
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Status</p>

              <h3
                className={`mt-2 text-xl font-bold ${
                  statusTextStyles[restaurant.status]
                }`}
              >
                {statusLabels[restaurant.status]}
              </h3>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Plano</p>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                Completo
              </h3>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar size={20} />
              </div>

              <p className="text-sm text-muted-foreground">Cadastro</p>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                {formatDate(restaurant.created_at)}
              </h3>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Dados do Restaurante
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem label="Nome" value={restaurant.name} />
                  <InfoItem label="Slug" value={restaurant.slug} />
                  <InfoItem
                    label="Descrição"
                    value={restaurant.description || "Sem descrição"}
                  />
                  <InfoItem
                    label="Dono"
                    value={ownerUser?.name ?? "Dono não encontrado"}
                  />
                  <InfoItem
                    label="E-mail do dono"
                    value={ownerUser?.email ?? "-"}
                  />
                  <InfoItem label="Telefone" value={restaurant.phone || "-"} />
                  <InfoItem
                    label="Criado em"
                    value={formatDate(restaurant.created_at)}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Informações do Cardápio
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem
                    label="WhatsApp"
                    value={restaurant.whatsapp || "-"}
                  />
                  <InfoItem
                    label="Endereço"
                    value={restaurant.address || "-"}
                  />
                  <InfoItem
                    label="Horário de funcionamento"
                    value={restaurant.opening_hours || "-"}
                  />
                  <InfoItem label="Categorias" value={categories.length} />
                  <InfoItem label="Produtos" value={products.length} />
                  <InfoItem label="Banners ativos" value={activeBannersCount} />
                </div>

                <div className="mt-5 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">
                    Link público do cardápio
                  </p>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex break-all text-sm font-medium text-primary hover:underline"
                  >
                    {publicUrl}
                    <ExternalLink size={15} className="ml-2 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Usuários Vinculados
                </h2>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Nome</th>
                        <th className="px-4 py-3 font-medium">E-mail</th>
                        <th className="px-4 py-3 font-medium">Função</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td className="px-4 py-4 font-medium text-foreground">
                          {ownerUser?.name ?? "Dono não encontrado"}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {ownerUser?.email ?? "-"}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          Dono
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              userStatusStyles[
                                String(
                                  Boolean(ownerUser?.is_active),
                                ) as "true" | "false"
                              ]
                            }`}
                          >
                            {ownerUser?.is_active ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={handleViewOwner}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
                          >
                            Ver dono
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Por enquanto existe apenas o usuário dono vinculado.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Assinatura
                </h2>

                <div className="space-y-4">
                  <InfoItem label="Status" value="Em breve" />
                  <InfoItem label="Valor" value="Em breve" />
                  <InfoItem label="Próxima cobrança" value="Em breve" />
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Assinaturas e pagamentos serão ligados depois quando o módulo
                  financeiro estiver pronto.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Resumo do Cardápio
                </h2>

                <div className="space-y-4">
                  <SummaryItem label="Categorias" value={categories.length} />
                  <SummaryItem label="Produtos" value={products.length} />
                  <SummaryItem
                    label="Produtos ativos"
                    value={activeProductsCount}
                  />
                  <SummaryItem label="Banners" value={banners.length} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Contato
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <User size={17} className="text-primary" />
                    Dono: {ownerUser?.name ?? "Dono não encontrado"}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone size={17} className="text-primary" />
                    {restaurant.phone || restaurant.whatsapp || "-"}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin size={17} className="text-primary" />
                    {restaurant.address || "-"}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users size={17} className="text-primary" />1 usuário dono
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Tag size={17} className="text-primary" />
                    {categories.length} categorias
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar restaurante</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
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

              <p className="mt-2 text-xs text-muted-foreground">
                Alterar o slug também altera o link público do cardápio.
              </p>
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

            <div>
              <Label>Logo URL</Label>

              <Input
                value={editLogoUrl}
                onChange={(event) => setEditLogoUrl(event.target.value)}
                placeholder="https://..."
                className="mt-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>WhatsApp</Label>

                <Input
                  value={editWhatsapp}
                  onChange={(event) => setEditWhatsapp(event.target.value)}
                  placeholder="(98) 99999-9999"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Telefone</Label>

                <Input
                  value={editPhone}
                  onChange={(event) => setEditPhone(event.target.value)}
                  placeholder="(98) 3333-3333"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Endereço</Label>

              <Input
                value={editAddress}
                onChange={(event) => setEditAddress(event.target.value)}
                placeholder="Endereço do restaurante"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Horário de funcionamento</Label>

              <Input
                value={editOpeningHours}
                onChange={(event) => setEditOpeningHours(event.target.value)}
                placeholder="Seg a Dom, 18h às 23h"
                className="mt-2"
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
              onClick={() => setEditDialogOpen(false)}
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
        description={`Tem certeza que deseja bloquear ${restaurant.name}? O dono não poderá gerenciar cardápio, produtos, categorias, banners ou dashboard.`}
        type="danger"
        confirmText="Bloquear"
        loading={actionLoading}
        onConfirm={handleBlockRestaurant}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title="Ativar restaurante"
        description={`Deseja ativar ${restaurant.name} novamente? O dono voltará a gerenciar o cardápio.`}
        type="success"
        confirmText="Ativar"
        loading={actionLoading}
        onConfirm={handleActivateRestaurant}
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

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}