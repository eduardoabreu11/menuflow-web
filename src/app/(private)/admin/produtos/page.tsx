"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";
import ProductModal from "../_components/productModal";

import ActionDialog from "@/components/ConfirmDialog";
import ProductTable, {
  type ProductTableItem,
} from "@/components/ProductTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getCategories, type Category } from "@/services/categoryService";

import {
  activateProduct,
  deleteProduct,
  disableProduct,
  getProducts,
  type Product,
} from "@/services/productService";

import {
  getSelectedRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

export default function ProductsPage() {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [openProductModal, setOpenProductModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionType, setActionType] = useState<"success" | "danger">(
    "success",
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const restaurantIsBlocked = restaurant?.status === "BLOCKED";

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "ALL" || product.category_id === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && product.is_active) ||
        (statusFilter === "INACTIVE" && !product.is_active);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  async function loadProducts(restaurantId: string) {
    try {
      setLoading(true);

      const data = await getProducts(restaurantId);

      setProducts(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories(restaurantId: string) {
    try {
      const data = await getCategories(restaurantId);

      setCategories(data);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao carregar categorias");
    }
  }

  async function reloadProducts() {
    if (!restaurant) return;

    await loadProducts(restaurant.id);
  }

  async function handleProductSuccess() {
    await reloadProducts();

    if (modalMode === "create") {
      setActionTitle("Produto cadastrado");
      setActionDescription("O produto foi cadastrado com sucesso.");
    } else {
      setActionTitle("Produto atualizado");
      setActionDescription("O produto foi atualizado com sucesso.");
    }

    setActionType("success");
    setOpenActionDialog(true);
  }

  function getCategoryName(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) return "Sem categoria";

    return `${category.emoji || "📂"} ${category.name}`;
  }

  function formatPrice(price: string | number) {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleCreateProduct() {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível criar produtos.");
      return;
    }

    setModalMode("create");
    setSelectedProduct(null);
    setOpenProductModal(true);
  }

  function handleEditProduct(product: ProductTableItem) {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível editar produtos.");
      return;
    }

    setModalMode("edit");
    setSelectedProduct(product as unknown as Product);
    setOpenProductModal(true);
  }

  async function handleToggleProduct(product: ProductTableItem) {
    if (!restaurant) return;

    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível alterar produtos.");
      return;
    }

    try {
      if (product.is_active) {
        await disableProduct(product.id);

        setActionTitle("Produto inativado");
        setActionDescription("O produto foi inativado com sucesso.");
      } else {
        await activateProduct(product.id);

        setActionTitle("Produto ativado");
        setActionDescription("O produto foi ativado com sucesso.");
      }

      await loadProducts(restaurant.id);

      setActionType("success");
      setOpenActionDialog(true);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao alterar status do produto");
    }
  }

  function handleOpenDeleteModal(product: ProductTableItem) {
    if (restaurantIsBlocked) {
      alert("Restaurante bloqueado. Não é possível excluir produtos.");
      return;
    }

    setSelectedProduct(product as unknown as Product);
    setOpenDeleteModal(true);
  }

  async function confirmDeleteProduct() {
    if (!selectedProduct || !restaurant) return;

    try {
      setDeleteLoading(true);

      await deleteProduct(selectedProduct.id);
      await loadProducts(restaurant.id);

      setOpenDeleteModal(false);

      setActionTitle("Produto excluído");
      setActionDescription("O produto foi excluído com sucesso.");
      setActionType("success");
      setOpenActionDialog(true);

      setSelectedProduct(null);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      alert("Erro ao excluir produto");
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

      await Promise.all([
        loadProducts(selectedRestaurant.id),
        loadCategories(selectedRestaurant.id),
      ]);
    }

    loadInitialData();
  }, [router]);

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-background">
        <AdminSidebar />

        <section className="ml-64 p-8">
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

      <ProductModal
        open={openProductModal}
        mode={modalMode}
        restaurantId={restaurant.id}
        product={selectedProduct}
        categories={categories}
        onOpenChange={setOpenProductModal}
        onSuccess={handleProductSuccess}
      />

      <ActionDialog
        open={openDeleteModal}
        onOpenChange={setOpenDeleteModal}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir o produto "${selectedProduct?.name}"? Essa ação não poderá ser desfeita.`}
        type="danger"
        confirmText="Excluir"
        loading={deleteLoading}
        onConfirm={confirmDeleteProduct}
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
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Gerencie os produtos de {restaurant.name}.
            </p>

            {restaurantIsBlocked && (
              <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                Este restaurante está bloqueado. Você pode visualizar os
                produtos, mas não pode criar, editar, ativar, desativar ou
                excluir.
              </p>
            )}
          </div>

          <Button
            onClick={handleCreateProduct}
            disabled={restaurantIsBlocked}
            className="h-11 rounded-xl bg-primary px-5 text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Novo produto
          </Button>
        </header>

        <div className="mb-6 grid grid-cols-[1fr_240px_190px] gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto..."
              className="h-11 rounded-xl border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-card text-muted-foreground">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">Todas as categorias</SelectItem>

              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.emoji || "📂"} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 rounded-xl border-border bg-card text-muted-foreground">
              <SelectValue placeholder="Status: Todos" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">Status: Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativos</SelectItem>
              <SelectItem value="INACTIVE">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ProductTable
          products={filteredProducts}
          loading={loading}
          getCategoryName={getCategoryName}
          formatPrice={formatPrice}
          onEdit={handleEditProduct}
          onDelete={handleOpenDeleteModal}
          onToggle={handleToggleProduct}
        />

        <footer className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredProducts.length} de {products.length} produtos
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