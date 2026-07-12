"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Upload, Video, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Category } from "@/services/categoryService";

import {
  activateProduct,
  createProduct,
  disableProduct,
  updateProduct,
  type Product,
} from "@/services/productService";

import { uploadImage, uploadVideo } from "@/services/uploadService";

type ProductModalProps = {
  open: boolean;
  mode: "create" | "edit";
  restaurantId: string;
  product?: Product | null;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type ProductModalContentProps = Omit<ProductModalProps, "open">;

function ProductModalContent({
  mode,
  restaurantId,
  product,
  categories,
  onOpenChange,
  onSuccess,
}: ProductModalContentProps) {
  const isCreate = mode === "create";

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(product?.video_url ?? "");

  const [active, setActive] = useState(product?.is_active ?? true);
  const [isPromotion, setIsPromotion] = useState(
    product?.is_promotion ?? false,
  );
  const [isNew, setIsNew] = useState(product?.is_new ?? false);

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const isUploading = imageUploading || videoUploading;

  function getNormalizedPrice() {
    const normalizedPrice = price
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    return Number(normalizedPrice);
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Envie apenas arquivos de imagem.");
      event.target.value = "";
      return;
    }

    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      alert(`A imagem deve ter no máximo ${maxSizeInMB}MB.`);
      event.target.value = "";
      return;
    }

    try {
      setImageUploading(true);

      const uploadedImage = await uploadImage({
        file,
        folder: "serviu/produtos",
      });

      setImageUrl(uploadedImage.secure_url);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao fazer upload da imagem");
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  }

  async function handleVideoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Envie apenas arquivos de vídeo.");
      event.target.value = "";
      return;
    }

    const maxSizeInMB = 50;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      alert(`O vídeo deve ter no máximo ${maxSizeInMB}MB.`);
      event.target.value = "";
      return;
    }

    try {
      setVideoUploading(true);

      const uploadedVideo = await uploadVideo({
        file,
        folder: "serviu/videos",
      });

      setVideoUrl(uploadedVideo.secure_url);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao fazer upload do vídeo");
    } finally {
      setVideoUploading(false);
      event.target.value = "";
    }
  }

  function handleRemoveImage() {
    setImageUrl("");
  }

  function handleRemoveVideo() {
    setVideoUrl("");
  }

  async function handleSubmit() {
    try {
      if (!name.trim()) {
        alert("Informe o nome do produto");
        return;
      }

      if (!categoryId) {
        alert("Selecione uma categoria");
        return;
      }

      const numericPrice = getNormalizedPrice();

      if (!numericPrice || numericPrice <= 0) {
        alert("Informe um preço válido maior que zero");
        return;
      }

      setLoading(true);

      const productPayload = {
        category_id: categoryId,
        name: name.trim(),
        description: description.trim() || undefined,
        price: numericPrice,
        image_url: imageUrl.trim() || undefined,
        video_url: videoUrl.trim() || undefined,
        is_promotion: isPromotion,
        is_new: isNew,
      };

      if (isCreate) {
        const createdProduct = await createProduct({
          restaurant_id: restaurantId,
          ...productPayload,
        });

        if (!active) {
          await disableProduct(createdProduct.id);
        }
      } else if (product) {
        await updateProduct(product.id, productPayload);

        if (active !== product.is_active) {
          if (active) {
            await activateProduct(product.id);
          } else {
            await disableProduct(product.id);
          }
        }
      }

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert(isCreate ? "Erro ao criar produto" : "Erro ao editar produto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="!max-w-none max-h-[90vh] w-[760px] overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-card-foreground">
          {isCreate ? "Novo produto" : "Editar produto"}
        </DialogTitle>

        <DialogDescription className="text-muted-foreground">
          {isCreate
            ? "Adicione um novo item ao seu cardápio."
            : "Edite as informações do seu produto."}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 border-b border-border">
        <div className="flex gap-8">
          <span className="border-b-2 border-primary pb-3 text-sm font-medium text-primary">
            Informações gerais
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nome do produto *</Label>

            <Input
              placeholder="Ex.: X-Burger Artesanal"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>

            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={categories.length === 0}
            >
              <SelectTrigger className="border-border bg-background text-foreground">
                <SelectValue
                  placeholder={
                    categories.length === 0
                      ? "Cadastre uma categoria primeiro"
                      : "Selecione uma categoria"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.emoji || "📂"} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categories.length === 0 && (
              <p className="text-xs text-red-600">
                Você precisa cadastrar uma categoria antes de criar produtos.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preço *</Label>

            <Input
              placeholder="Ex.: 49.90"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>

            <div className="flex h-10 items-center gap-3">
              <Switch checked={active} onCheckedChange={setActive} />

              <span className="text-sm text-muted-foreground">
                {active ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Promoção</Label>

            <div className="flex h-10 items-center gap-3">
              <Switch
                checked={isPromotion}
                onCheckedChange={setIsPromotion}
              />

              <span className="text-sm text-muted-foreground">
                {isPromotion ? "Em promoção" : "Produto normal"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lançamento</Label>

            <div className="flex h-10 items-center gap-3">
              <Switch checked={isNew} onCheckedChange={setIsNew} />

              <span className="text-sm text-muted-foreground">
                {isNew ? "Marcado como novo" : "Produto comum"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2">Descrição</Label>

          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-[140px] w-full resize-none border-border bg-background text-foreground placeholder:text-muted-foreground"
            placeholder="Descreva os ingredientes, preparo e detalhes do produto..."
          />
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-card-foreground">
            Imagem do produto
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Envie uma imagem do produto. Ela será salva no Cloudinary e a URL
            será gravada no produto.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>URL da imagem</Label>

              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />

              <p className="text-xs text-muted-foreground">
                Você pode colar uma URL manualmente ou enviar uma imagem pelo
                botão abaixo.
              </p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-primary/50 bg-background p-4">
              {imageUrl ? (
                <div className="space-y-4">
                  <div
                    className="h-48 w-full rounded-xl border border-border bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                    }}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-[470px] truncate text-xs text-muted-foreground">
                      {imageUrl}
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveImage}
                      disabled={loading || isUploading}
                      className="border-red-200 bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X size={16} />
                      Remover imagem
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-36 flex-col items-center justify-center text-center">
                  <ImagePlus className="mb-3 text-primary" size={34} />

                  <strong className="text-sm text-primary">
                    Nenhuma imagem selecionada
                  </strong>

                  <span className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, JPEG ou WEBP até 5MB
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center">
                <Label
                  htmlFor="product-image-upload"
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  {imageUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando imagem...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Enviar imagem
                    </>
                  )}
                </Label>

                <Input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={loading || isUploading}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-card-foreground">
            Vídeo do produto
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Envie um vídeo curto do produto. Ele será salvo no Cloudinary e a
            URL será gravada no produto.
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>URL do vídeo</Label>

              <Input
                placeholder="https://exemplo.com/video.mp4"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />

              <p className="text-xs text-muted-foreground">
                Você pode colar uma URL manualmente ou enviar um vídeo pelo
                botão abaixo.
              </p>
            </div>

            <div className="rounded-xl border-2 border-dashed border-primary/50 bg-background p-4">
              {videoUrl ? (
                <div className="space-y-4">
                  <video
                    src={videoUrl}
                    controls
                    className="h-56 w-full rounded-xl border border-border bg-black object-contain"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-[470px] truncate text-xs text-muted-foreground">
                      {videoUrl}
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveVideo}
                      disabled={loading || isUploading}
                      className="border-red-200 bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <X size={16} />
                      Remover vídeo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-36 flex-col items-center justify-center text-center">
                  <Video className="mb-3 text-primary" size={34} />

                  <strong className="text-sm text-primary">
                    Nenhum vídeo selecionado
                  </strong>

                  <span className="mt-1 text-xs text-muted-foreground">
                    MP4, WEBM ou MOV até 50MB
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center">
                <Label
                  htmlFor="product-video-upload"
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  {videoUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando vídeo...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Enviar vídeo
                    </>
                  )}
                </Label>

                <Input
                  id="product-video-upload"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleVideoFileChange}
                  disabled={loading || isUploading}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || isUploading}
            className="border-border bg-transparent text-foreground hover:bg-accent hover:text-foreground"
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || isUploading || categories.length === 0}
            className="bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Salvando..."
              : imageUploading
                ? "Enviando imagem..."
                : videoUploading
                  ? "Enviando vídeo..."
                  : isCreate
                    ? "Salvar produto"
                    : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function ProductModal({
  open,
  mode,
  restaurantId,
  product,
  categories,
  onOpenChange,
  onSuccess,
}: ProductModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ProductModalContent
          key={`${mode}-${product?.id ?? "new"}`}
          mode={mode}
          restaurantId={restaurantId}
          product={product}
          categories={categories}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}