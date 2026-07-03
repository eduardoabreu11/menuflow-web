"use client";

import Link from "next/link";

import ProductTable, {
  type ProductTableItem,
} from "@/components/ProductTable";

import type { RecentProduct } from "@/services/dashboardService";

type RecentProductsProps = {
  products: RecentProduct[];
  loading: boolean;
  onEditProduct: (product: ProductTableItem) => void;
  onDeleteProduct: (product: ProductTableItem) => void;
  onToggleProduct: (product: ProductTableItem) => void;
};

export default function RecentProducts({
  products,
  loading,
  onEditProduct,
  onDeleteProduct,
  onToggleProduct,
}: RecentProductsProps) {
  function formatPrice(price: number | string) {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-card-foreground">
          Últimos produtos cadastrados
        </h2>

        <Link
          href="/admin/produtos"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Ver todos
        </Link>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        showViewButton
        showToggle
        formatPrice={formatPrice}
        onEdit={onEditProduct}
        onDelete={onDeleteProduct}
        onToggle={onToggleProduct}
      />
    </section>
  );
}