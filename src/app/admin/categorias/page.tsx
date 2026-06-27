"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";
import CategoryModal from "../_components/categoryModal";

import ActionDialog from "@/components/ConfirmDialog";
import CategoryTable from "@/components/CategoryTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
  activateCategory,
  deleteCategory,
  disableCategory,
  getCategories,
  type Category,
} from "@/services/categoryService";

import {
  getSelectedRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

export default function CategoriesPage() {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionType, setActionType] = useState<"success" | "danger">("success");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCategories(restaurantId: string) {
    try {
      setLoading(true);

      const data = await getCategories(restaurantId);

      setCategories(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  async function reloadCategories() {
    if (!restaurant) return;

    await loadCategories(restaurant.id);
  }

  async function handleCategorySuccess() {
    await reloadCategories();

    if (modalMode === "create") {
      setActionTitle("Categoria cadastrada");
      setActionDescription("A categoria foi cadastrada com sucesso.");
    } else {
      setActionTitle("Categoria atualizada");
      setActionDescription("A categoria foi editada com sucesso.");
    }

    setActionType("success");
    setOpenActionDialog(true);
  }

  async function handleToggleCategory(category: Category) {
    if (!restaurant) return;

    try {
      if (category.is_active) {
        await disableCategory(category.id);

        setActionTitle("Categoria inativada");
        setActionDescription("A categoria foi inativada com sucesso.");
      } else {
        await activateCategory(category.id);

        setActionTitle("Categoria ativada");
        setActionDescription("A categoria foi ativada com sucesso.");
      }

      await loadCategories(restaurant.id);

      setActionType("success");
      setOpenActionDialog(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar status da categoria");
    }
  }

  function handleOpenDeleteModal(category: Category) {
    setSelectedCategory(category);
    setOpenDeleteModal(true);
  }

  async function confirmDeleteCategory() {
    if (!selectedCategory || !restaurant) return;

    try {
      await deleteCategory(selectedCategory.id);
      await loadCategories(restaurant.id);

      setOpenDeleteModal(false);

      setActionTitle("Categoria excluída");
      setActionDescription("A categoria foi excluída com sucesso.");
      setActionType("success");
      setOpenActionDialog(true);

      setSelectedCategory(null);
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir categoria");
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      const selectedRestaurant = getSelectedRestaurant();

      if (!selectedRestaurant) {
        router.push("/admin/restaurantes/selecionar");
        return;
      }

      setRestaurant(selectedRestaurant);

      await loadCategories(selectedRestaurant.id);
    }

    loadInitialData();
  }, [router]);

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-background">
        <AdminSidebar />

        <section className="ml-64 min-h-screen p-8">
          <p className="text-sm text-muted-foreground">
            Carregando restaurante...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminSidebar />

      <CategoryModal
        open={openCategoryModal}
        mode={modalMode}
        restaurantId={restaurant.id}
        category={selectedCategory}
        onOpenChange={setOpenCategoryModal}
        onSuccess={handleCategorySuccess}
      />

      <ActionDialog
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir a categoria "${selectedCategory?.name}"? Essa ação não poderá ser desfeita.`}
        type="danger"
        onConfirm={confirmDeleteCategory}
      />

      <ActionDialog
        open={openActionDialog}
        onOpenChange={setOpenActionDialog}
        title={actionTitle}
        description={actionDescription}
        type={actionType}
      />

      <section className="ml-64 min-h-screen p-8">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorias</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Organize o cardápio de {restaurant.name}.
            </p>
          </div>

          <Button
            onClick={() => {
              setModalMode("create");
              setSelectedCategory(null);
              setOpenCategoryModal(true);
            }}
            className="h-11 rounded-xl bg-primary px-5 text-primary-foreground hover:opacity-90"
          >
            <Plus size={18} />
            Nova categoria
          </Button>
        </header>

        <div className="mb-6 w-full max-w-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              placeholder="Buscar categoria..."
              className="h-11 rounded-xl border-border bg-card pr-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <CategoryTable
          categories={categories}
          loading={loading}
          onEdit={(category) => {
            setModalMode("edit");
            setSelectedCategory(category);
            setOpenCategoryModal(true);
          }}
          onDelete={handleOpenDeleteModal}
          onToggle={handleToggleCategory}
        />
        <footer className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {categories.length} de {categories.length} categorias
          </p>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-border bg-card p-3 text-muted-foreground hover:bg-accent">
              <ChevronLeft size={18} />
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary bg-primary/10 text-primary">
              1
            </button>

            <button className="rounded-xl border border-border bg-card p-3 text-muted-foreground hover:bg-accent">
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
