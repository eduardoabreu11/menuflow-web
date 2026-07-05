"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";
import CategoryModal from "../_components/categoryModal";

import ActionDialog from "@/components/ConfirmDialog";
import CategoryTable from "@/components/CategoryTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedSearch),
    );
  }, [categories, search]);

  const restaurantIsBlocked = restaurant?.status === "BLOCKED";

  async function loadCategories(restaurantId: string) {
    try {
      setLoading(true);

      const data = await getCategories(restaurantId);

      setCategories(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

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

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível alterar categorias.");
      return;
    }

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

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao alterar status da categoria");
    }
  }

  function handleOpenCreateModal() {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível criar categorias.");
      return;
    }

    setModalMode("create");
    setSelectedCategory(null);
    setOpenCategoryModal(true);
  }

  function handleOpenEditModal(category: Category) {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível editar categorias.");
      return;
    }

    setModalMode("edit");
    setSelectedCategory(category);
    setOpenCategoryModal(true);
  }

  function handleOpenDeleteModal(category: Category) {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível excluir categorias.");
      return;
    }

    setSelectedCategory(category);
    setOpenDeleteModal(true);
  }

  async function confirmDeleteCategory() {
    if (!selectedCategory || !restaurant) return;

    try {
      setDeleteLoading(true);

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

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao excluir categoria");
    } finally {
      setDeleteLoading(false);
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
        confirmText="Excluir"
        loading={deleteLoading}
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

            {restaurantIsBlocked && (
              <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                Este restaurante está bloqueado. Você pode visualizar as
                categorias, mas não pode criar, editar, ativar, desativar ou
                excluir.
              </p>
            )}
          </div>

          <Button
            onClick={handleOpenCreateModal}
            disabled={restaurantIsBlocked}
            className="h-11 rounded-xl bg-primary px-5 text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar categoria..."
              className="h-11 rounded-xl border-border bg-card pr-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <CategoryTable
          categories={filteredCategories}
          loading={loading}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onToggle={handleToggleCategory}
        />

        <footer className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredCategories.length} de {categories.length}{" "}
            categorias
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