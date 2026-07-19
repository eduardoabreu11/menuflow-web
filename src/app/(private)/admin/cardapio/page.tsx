"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import {
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Save,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  activateBanner,
  createBanner,
  deleteBanner,
  disableBanner,
  getBanners,
  updateBanner,
  type Banner,
} from "@/services/bannerService";

import {
  getSelectedRestaurant,
  saveSelectedRestaurant,
  updateRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

import { uploadImage } from "@/services/uploadService";

const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function hasAllowedImageExtension(fileName: string) {
  const normalizedFileName = fileName.toLowerCase();

  return allowedImageExtensions.some((extension) =>
    normalizedFileName.endsWith(extension),
  );
}

function getImageValidationError(file: File) {
  const isImage =
    file.type.startsWith("image/") || hasAllowedImageExtension(file.name);

  if (!isImage) {
    return "Envie apenas arquivos de imagem.";
  }

  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return `A imagem deve ter no máximo ${maxSizeInMB}MB.`;
  }

  return null;
}

export default function MenuSettingsPage() {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const [loadingRestaurant, setLoadingRestaurant] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(false);
  const [deleteBannerOpen, setDeleteBannerOpen] = useState(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const restaurantIsBlocked = restaurant?.status === "BLOCKED";
  const isUploading = logoUploading || bannerUploading;
  const bannerLimitReached = !editingBannerId && banners.length >= 3;

  async function loadBanners(restaurantId: string) {
    try {
      setLoadingBanners(true);

      const data = await getBanners(restaurantId);

      setBanners(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar banners");
    } finally {
      setLoadingBanners(false);
    }
  }

  function fillRestaurantForm(selectedRestaurant: Restaurant) {
    setRestaurant(selectedRestaurant);
    setName(selectedRestaurant.name);
    setDescription(selectedRestaurant.description ?? "");
    setLogoUrl(selectedRestaurant.logo_url ?? "");
    setWhatsapp(selectedRestaurant.whatsapp ?? "");
    setPhone(selectedRestaurant.phone ?? "");
    setAddress(selectedRestaurant.address ?? "");
    setOpeningHours(selectedRestaurant.opening_hours ?? "");
  }

  useEffect(() => {
    const selectedRestaurant = getSelectedRestaurant();

    if (!selectedRestaurant) {
      router.push("/admin/restaurantes/selecionar");
      return;
    }

    queueMicrotask(() => {
      fillRestaurantForm(selectedRestaurant);
      void loadBanners(selectedRestaurant.id);
    });
  }, [router]);

  function openSuccessDialog(title: string, description: string) {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  }

  function getFullRestaurantPayload() {
    if (!restaurant) {
      throw new Error("Restaurante não selecionado");
    }

    return {
      name: name.trim(),
      slug: restaurant.slug,
      description: description.trim() || null,
      logo_url: logoUrl.trim() || null,
      whatsapp: whatsapp.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      opening_hours: openingHours.trim() || null,
    };
  }

  async function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível alterar a logo.");
      event.target.value = "";
      return;
    }

    const validationError = getImageValidationError(file);

    if (validationError) {
      alert(validationError);
      event.target.value = "";
      return;
    }

    try {
      setLogoUploading(true);

      const uploadedImage = await uploadImage({
        file,
        folder: "serviu/logos",
      });

      setLogoUrl(uploadedImage.secure_url);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao enviar logo");
    } finally {
      setLogoUploading(false);
      event.target.value = "";
    }
  }

  async function handleBannerFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível alterar banners.");
      event.target.value = "";
      return;
    }

    if (bannerLimitReached) {
      alert("Limite de 3 banners atingido. Exclua um banner para cadastrar outro.");
      event.target.value = "";
      return;
    }

    const validationError = getImageValidationError(file);

    if (validationError) {
      alert(validationError);
      event.target.value = "";
      return;
    }

    try {
      setBannerUploading(true);

      const uploadedImage = await uploadImage({
        file,
        folder: "serviu/banners",
      });

      setBannerImageUrl(uploadedImage.secure_url);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao enviar banner");
    } finally {
      setBannerUploading(false);
      event.target.value = "";
    }
  }

  async function handleSaveRestaurantData() {
    if (!restaurant) return;

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível editar o cardápio.");
      return;
    }

    if (!name.trim()) {
      alert("Informe o nome do restaurante");
      return;
    }

    try {
      setLoadingRestaurant(true);

      const updatedRestaurant = await updateRestaurant(
        restaurant.id,
        getFullRestaurantPayload(),
      );

      saveSelectedRestaurant(updatedRestaurant);
      fillRestaurantForm(updatedRestaurant);

      openSuccessDialog(
        "Restaurante atualizado",
        "Os dados do restaurante foram salvos com sucesso.",
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao salvar dados do restaurante");
    } finally {
      setLoadingRestaurant(false);
    }
  }

  async function handleSaveContactData() {
    if (!restaurant) return;

    if (restaurantIsBlocked) {
      alert(
        "Restaurante bloqueado. Não é possível editar contato e localização.",
      );
      return;
    }

    if (!name.trim()) {
      alert("Informe o nome do restaurante");
      return;
    }

    try {
      setLoadingContact(true);

      const updatedRestaurant = await updateRestaurant(
        restaurant.id,
        getFullRestaurantPayload(),
      );

      saveSelectedRestaurant(updatedRestaurant);
      fillRestaurantForm(updatedRestaurant);

      openSuccessDialog(
        "Contato atualizado",
        "Contato e localização foram salvos com sucesso.",
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao salvar contato e localização");
    } finally {
      setLoadingContact(false);
    }
  }

  async function handleSaveBanner() {
    if (!restaurant) return;

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível editar banners.");
      return;
    }

    if (!bannerImageUrl.trim()) {
      alert("Envie uma imagem para o banner");
      return;
    }

    if (bannerLimitReached) {
      alert("Você pode cadastrar no máximo 3 banners");
      return;
    }

    try {
      setSavingBanner(true);

      if (editingBannerId) {
        await updateBanner(editingBannerId, {
          image_url: bannerImageUrl.trim(),
        });

        openSuccessDialog(
          "Banner atualizado",
          "A imagem do banner foi atualizada com sucesso.",
        );
      } else {
        await createBanner({
          restaurant_id: restaurant.id,
          image_url: bannerImageUrl.trim(),
        });

        openSuccessDialog(
          "Banner cadastrado",
          "O banner foi cadastrado com sucesso.",
        );
      }

      setBannerImageUrl("");
      setEditingBannerId(null);

      await loadBanners(restaurant.id);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao salvar banner");
    } finally {
      setSavingBanner(false);
    }
  }

  function handleEditBanner(banner: Banner) {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível editar banners.");
      return;
    }

    setEditingBannerId(banner.id);
    setBannerImageUrl(banner.image_url);
  }

  function handleCancelEditBanner() {
    setEditingBannerId(null);
    setBannerImageUrl("");
  }

  async function handleToggleBanner(banner: Banner) {
    if (!restaurant) return;

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível alterar banners.");
      return;
    }

    try {
      if (banner.is_active) {
        await disableBanner(banner.id);

        openSuccessDialog(
          "Banner desativado",
          "O banner foi desativado com sucesso.",
        );
      } else {
        await activateBanner(banner.id);

        openSuccessDialog(
          "Banner ativado",
          "O banner foi ativado com sucesso.",
        );
      }

      await loadBanners(restaurant.id);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao alterar status do banner");
    }
  }

  function handleOpenDeleteBanner(banner: Banner) {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível excluir banners.");
      return;
    }

    setSelectedBanner(banner);
    setDeleteBannerOpen(true);
  }

  async function handleDeleteBanner() {
    if (!restaurant || !selectedBanner) return;

    try {
      setDeletingBanner(true);

      await deleteBanner(selectedBanner.id);
      await loadBanners(restaurant.id);

      setDeleteBannerOpen(false);
      setSelectedBanner(null);

      openSuccessDialog(
        "Banner excluído",
        "O banner foi excluído com sucesso.",
      );
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao excluir banner");
    } finally {
      setDeletingBanner(false);
    }
  }

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-background">
        <AdminSidebar />

        <section className="ml-64 min-h-screen p-8">
          <h1 className="text-3xl font-bold text-foreground">Cardápio</h1>

          <p className="mt-2 text-muted-foreground">
            Carregando restaurante...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminSidebar />

      <section className="ml-64 min-h-screen p-8">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Configurações públicas
              </p>

              <h1 className="mt-1 text-3xl font-bold text-foreground">
                Cardápio
              </h1>

              <p className="mt-2 text-muted-foreground">
                Configure nome, descrição, logo, banners e contato que aparecem
                no cardápio público do seu restaurante.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">{restaurant.name}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                /cardapio/{restaurant.slug}
              </p>
            </div>
          </div>

          {restaurantIsBlocked && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Este restaurante está bloqueado. Você pode visualizar as
              informações, mas não pode editar dados, contato ou banners.
            </p>
          )}
        </div>

        <div className="w-full space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-2">
                <Store className="mt-0.5 h-5 w-5 text-primary" />

                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Dados do restaurante
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Informações principais exibidas no topo do cardápio.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
              <div className="space-y-5">
                <div>
                  <Label>Nome do restaurante *</Label>

                  <Input
                    value={name}
                    disabled={restaurantIsBlocked}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <Label>Descrição do restaurante</Label>

                  <Textarea
                    value={description}
                    disabled={restaurantIsBlocked}
                    onChange={(event) => setDescription(event.target.value)}
                    className="mt-2 h-[140px] resize-none border-border bg-background text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <Label>Logo do restaurante</Label>

                <div className="mt-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-card text-5xl">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo do restaurante"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "🍽️"
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <Label
                    htmlFor="restaurant-logo-upload"
                    className={`inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent ${
                      restaurantIsBlocked || logoUploading
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {logoUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando logo...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Enviar/alterar logo
                      </>
                    )}
                  </Label>

                  <Input
                    id="restaurant-logo-upload"
                    type="file"
                    accept="image/*"
                    disabled={restaurantIsBlocked || logoUploading}
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />

                  {logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={restaurantIsBlocked || logoUploading}
                      onClick={() => setLogoUrl("")}
                      className="w-full border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={16} />
                      Remover logo
                    </Button>
                  )}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  PNG, JPG, JPEG, WEBP ou GIF até 5MB.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSaveRestaurantData}
                disabled={loadingRestaurant || restaurantIsBlocked || isUploading}
                className="min-w-[240px] bg-primary px-6 text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {loadingRestaurant
                  ? "Salvando..."
                  : logoUploading
                    ? "Enviando logo..."
                    : "Salvar dados do restaurante"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-2">
                <ImagePlus className="mt-0.5 h-5 w-5 text-primary" />

                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Banners do cardápio
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Configure até 3 banners para aparecerem no topo do cardápio
                    público.
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {banners.length}/3 banners cadastrados
              </span>
            </div>

            <div className="mb-5 rounded-xl border border-border bg-background p-4">
              <div>
                <Label>
                  {editingBannerId ? "Editar banner" : "Novo banner"}
                </Label>

                <p className="mt-1 text-xs text-muted-foreground">
                  Envie uma imagem para cadastrar o banner.
                </p>

                {bannerLimitReached && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Limite de 3 banners atingido. Exclua um banner para
                    cadastrar outro.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Label
                    htmlFor="banner-image-upload"
                    className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent ${
                      restaurantIsBlocked || bannerUploading || bannerLimitReached
                        ? "pointer-events-none cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {bannerUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Escolher imagem
                      </>
                    )}
                  </Label>

                  <Input
                    id="banner-image-upload"
                    type="file"
                    accept="image/*"
                    disabled={
                      restaurantIsBlocked || bannerUploading || bannerLimitReached
                    }
                    onChange={handleBannerFileChange}
                    className="hidden"
                  />

                  {bannerImageUrl && (
                    <Button
                      onClick={handleSaveBanner}
                      disabled={savingBanner || bannerUploading || restaurantIsBlocked}
                      className="bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={16} />
                      {savingBanner
                        ? "Salvando..."
                        : editingBannerId
                          ? "Atualizar"
                          : "Cadastrar"}
                    </Button>
                  )}

                  {editingBannerId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEditBanner}
                      disabled={savingBanner || bannerUploading}
                      className="border-border bg-card text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>

              {bannerImageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                  <img
                    src={bannerImageUrl}
                    alt="Prévia do banner"
                    className="h-56 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-3 p-3">
                    <p className="truncate text-xs text-muted-foreground">
                      Imagem selecionada para o banner
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={savingBanner || bannerUploading}
                      onClick={() => setBannerImageUrl("")}
                      className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <X size={16} />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {loadingBanners && (
              <p className="text-sm text-muted-foreground">
                Carregando banners...
              </p>
            )}

            {!loadingBanners && banners.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center">
                <ImagePlus className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  Nenhum banner cadastrado.
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <div className="relative h-56 bg-card">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={`Banner ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-center">
                        <div>
                          <ImagePlus
                            size={28}
                            className="mx-auto mb-2 text-primary"
                          />

                          <p className="text-xs text-muted-foreground">
                            Sem imagem
                          </p>
                        </div>
                      </div>
                    )}

                    <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
                      Banner {index + 1}
                    </span>
                  </div>

                  <div className="space-y-4 p-4">
                    <p className="truncate text-xs text-muted-foreground">
                      {banner.image_url || "Sem URL de imagem"}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
                        <Switch
                          checked={banner.is_active}
                          disabled={restaurantIsBlocked}
                          onCheckedChange={() => handleToggleBanner(banner)}
                        />

                        <span className="text-sm text-muted-foreground">
                          {banner.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={restaurantIsBlocked}
                          onClick={() => handleEditBanner(banner)}
                          className="border-border bg-card text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Upload size={15} />
                          Alterar banner
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={restaurantIsBlocked}
                          onClick={() => handleOpenDeleteBanner(banner)}
                          className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={15} />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-start gap-2">
              <Phone className="mt-0.5 h-5 w-5 text-primary" />

              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  Contato e localização
                </h2>

                <p className="text-sm text-muted-foreground">
                  Informações usadas pelo cliente para entrar em contato com o
                  restaurante.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>WhatsApp do restaurante *</Label>

                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={whatsapp}
                    disabled={restaurantIsBlocked}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    className="border-border bg-background pl-10 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <Label>Telefone</Label>

                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={phone}
                    disabled={restaurantIsBlocked}
                    onChange={(event) => setPhone(event.target.value)}
                    className="border-border bg-background pl-10 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <Label>Endereço</Label>

                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={address}
                    disabled={restaurantIsBlocked}
                    onChange={(event) => setAddress(event.target.value)}
                    className="border-border bg-background pl-10 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <Label>Horário de funcionamento</Label>

                <div className="relative mt-2">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={openingHours}
                    disabled={restaurantIsBlocked}
                    onChange={(event) => setOpeningHours(event.target.value)}
                    className="border-border bg-background pl-10 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSaveContactData}
                disabled={loadingContact || restaurantIsBlocked || isUploading}
                className="min-w-[240px] bg-primary px-6 text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {loadingContact ? "Salvando..." : "Salvar contato e localização"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={deleteBannerOpen}
        onOpenChange={setDeleteBannerOpen}
        title="Excluir banner"
        description="Tem certeza que deseja excluir este banner? Essa ação não poderá ser desfeita."
        type="danger"
        confirmText="Excluir"
        loading={deletingBanner}
        onConfirm={handleDeleteBanner}
      />

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        type="success"
      />
    </main>
  );
}