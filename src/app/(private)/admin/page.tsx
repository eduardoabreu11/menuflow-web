"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./_components/adminSidebar";
import DashboardCard from "./_components/dashboardCard";
import SetupSteps from "./_components/setupSteps";
import RecentProducts from "./_components/recentProducts";
import ProductModal from "./_components/productModal";

import ConfirmDialog from "@/components/ConfirmDialog";
import type { ProductTableItem } from "@/components/ProductTable";

import { CircleCheck, Folder, ShoppingBag } from "lucide-react";

import { getCategories, type Category } from "@/services/categoryService";

import {
  getDashboardStats,
  getRecentProducts,
  type RecentProduct,
} from "@/services/dashboardService";

import {
  activateProduct,
  deleteProduct,
  disableProduct,
  type Product,
} from "@/services/productService";

import {
  getSelectedRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

export default function AdminPage() {
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    activeProducts: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingRecentProducts, setLoadingRecentProducts] = useState(true);

  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionType, setActionType] = useState<"success" | "danger">("success");

  async function loadDashboard(restaurantId: string) {
    try {
      setLoadingDashboard(true);

      const data = await getDashboardStats(restaurantId);

      setStats(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  }

  async function loadCategories(restaurantId: string) {
    try {
      const data = await getCategories(restaurantId);

      setCategories(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar categorias");
    }
  }

  async function loadRecentProducts(restaurantId: string) {
    try {
      setLoadingRecentProducts(true);

      const data = await getRecentProducts(restaurantId);

      setRecentProducts(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar últimos produtos");
    } finally {
      setLoadingRecentProducts(false);
    }
  }

  async function reloadDashboardData() {
    if (!restaurant) return;

    await Promise.all([
      loadDashboard(restaurant.id),
      loadRecentProducts(restaurant.id),
    ]);
  }

  async function handleToggleProduct(product: ProductTableItem) {
    if (!restaurant) return;

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

      await reloadDashboardData();

      setActionType("success");
      setOpenActionDialog(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao alterar status do produto");
    }
  }

  function handleEditProduct(product: ProductTableItem) {
    setSelectedProduct(product as unknown as Product);
    setOpenProductModal(true);
  }

  function handleOpenDeleteProduct(product: ProductTableItem) {
    setSelectedProduct(product as unknown as Product);
    setOpenDeleteModal(true);
  }

  async function confirmDeleteProduct() {
    if (!selectedProduct) return;

    try {
      setDeleteLoading(true);

      await deleteProduct(selectedProduct.id);

      await reloadDashboardData();

      setOpenDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
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
        loadDashboard(selectedRestaurant.id),
        loadCategories(selectedRestaurant.id),
        loadRecentProducts(selectedRestaurant.id),
      ]);
    }

    loadInitialData();
  }, [router]);

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-background">
        <AdminSidebar />

        <section className="ml-64 p-6">
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
        mode="edit"
        restaurantId={restaurant.id}
        product={selectedProduct}
        categories={categories}
        onOpenChange={setOpenProductModal}
        onSuccess={reloadDashboardData}
      />

      <ConfirmDialog
        open={openDeleteModal}
        type="danger"
        title="Excluir produto"
        description={`Tem certeza que deseja excluir o produto "${selectedProduct?.name}"? Essa ação não poderá ser desfeita.`}
        confirmText="Excluir"
        loading={deleteLoading}
        onOpenChange={setOpenDeleteModal}
        onConfirm={confirmDeleteProduct}
      />

      <ConfirmDialog
        open={openActionDialog}
        type={actionType}
        title={actionTitle}
        description={actionDescription}
        onOpenChange={setOpenActionDialog}
      />

      <section className="ml-64 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {restaurant.name}! 👋
          </h1>

          <p className="mt-1 text-muted-foreground">
            Aqui está um resumo do seu cardápio.
          </p>
        </div>

        {loadingDashboard && (
          <p className="mb-6 text-sm text-muted-foreground">
            Carregando dashboard...
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-6">
          <DashboardCard
            title="Categorias"
            value={stats.categories}
            description="Total de categorias"
            icon={<Folder size={24} />}
            iconBg="bg-primary"
          />

          <DashboardCard
            title="Produtos"
            value={stats.products}
            description="Total de produtos"
            icon={<ShoppingBag size={24} />}
            iconBg="bg-emerald-600"
          />

          <DashboardCard
            title="Produtos ativos"
            value={stats.activeProducts}
            description="Produtos publicados"
            icon={<CircleCheck size={24} />}
            iconBg="bg-orange-500"
          />
        </div>

        <SetupSteps />

        <RecentProducts
          products={recentProducts}
          loading={loadingRecentProducts}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleOpenDeleteProduct}
          onToggleProduct={handleToggleProduct}
        />
      </section>
    </main>
  );
}