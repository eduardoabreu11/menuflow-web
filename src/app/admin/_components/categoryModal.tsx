"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  createCategory,
  updateCategory,
  activateCategory,
  disableCategory,
  type Category,
} from "@/services/categoryService";

type CategoryModalProps = {
  open: boolean;
  mode: "create" | "edit";
  restaurantId: string;
  category?: Category | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const emojis = ["🍔", "🍕", "🍟", "🥤", "🍰", "☕", "🍪", "🍨", "🥗", "🍺"];

export default function CategoryModal({
  open,
  mode,
  restaurantId,
  category,
  onOpenChange,
  onSuccess,
}: CategoryModalProps) {
  const isCreate = mode === "create";

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍔");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      if (isCreate) {
        setName("");
        setEmoji("🍔");
        setSortOrder(0);
        setIsActive(true);
        return;
      }

      if (category) {
        setName(category.name);
        setEmoji(category.emoji || "🍔");
        setSortOrder(category.sort_order);
        setIsActive(category.is_active);
      }
    });
  }, [open, isCreate, category]);

  async function handleSubmit() {
    try {
      if (!name.trim()) {
        alert("Informe o nome da categoria");
        return;
      }

      if (sortOrder < 0) {
        alert("A ordem não pode ser negativa");
        return;
      }

      setLoading(true);

      if (isCreate) {
        const createdCategory = await createCategory({
          restaurant_id: restaurantId,
          name: name.trim(),
          emoji,
          sort_order: sortOrder,
        });

        if (!isActive) {
          await disableCategory(createdCategory.id);
        }
      } else if (category) {
        await updateCategory(category.id, {
          name: name.trim(),
          emoji,
          sort_order: sortOrder,
        });

        if (isActive !== category.is_active) {
          if (isActive) {
            await activateCategory(category.id);
          } else {
            await disableCategory(category.id);
          }
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert(isCreate ? "Erro ao criar categoria" : "Erro ao editar categoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            {isCreate ? "Nova categoria" : "Editar categoria"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            {isCreate
              ? "Crie uma nova categoria para organizar seu cardápio."
              : "Edite as informações da categoria."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da categoria <span className="text-red-500">*</span>
            </Label>

            <Input
              id="name"
              placeholder="Ex.: Lanches"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Emoji / Ícone</Label>

            <p className="text-sm text-muted-foreground">
              Escolha um emoji para representar a categoria.
            </p>

            <div className="flex flex-wrap gap-3">
              {emojis.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border text-2xl transition hover:bg-accent ${
                    emoji === item
                      ? "border-primary bg-accent"
                      : "border-border bg-background"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Ordem de exibição</Label>

            <Input
              id="sort_order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              placeholder="Ex.: 1"
            />

            <p className="text-sm text-muted-foreground">
              Categorias com número menor aparecem primeiro no cardápio.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground">
                Categorias inativas não aparecem no cardápio.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm font-medium">
                {isActive ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading
                ? "Salvando..."
                : isCreate
                  ? "Criar categoria"
                  : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}