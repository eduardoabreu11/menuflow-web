import Image from "next/image";
import Link from "next/link";

import { Edit, Eye, Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

import type { RecentProduct } from "@/services/dashboardService";
import type { Product } from "@/services/productService";

export type ProductTableItem = Product | RecentProduct;

type ProductTableProps = {
  products: ProductTableItem[];
  loading: boolean;

  getCategoryName?: (categoryId: string) => string;
  formatPrice: (price: string | number) => string;

  showViewButton?: boolean;
  showToggle?: boolean;

  onEdit: (product: ProductTableItem) => void;
  onDelete: (product: ProductTableItem) => void;
  onToggle?: (product: ProductTableItem) => void;
};

export default function ProductTable({
  products,
  loading,
  getCategoryName,
  formatPrice,
  showViewButton = false,
  showToggle = true,
  onEdit,
  onDelete,
  onToggle,
}: ProductTableProps) {
  function getProductCategory(product: ProductTableItem) {
    if ("category_name" in product) {
      return `${product.category_emoji || "📂"} ${
        product.category_name || "Sem categoria"
      }`;
    }

    return getCategoryName?.(product.category_id) || "Sem categoria";
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="px-5 py-5 font-medium">Foto</th>
            <th className="px-5 py-5 font-medium">Produto</th>
            <th className="px-5 py-5 font-medium">Categoria</th>
            <th className="px-5 py-5 font-medium">Preço</th>
            <th className="px-5 py-5 font-medium">Status</th>
            <th className="px-5 py-5 text-right font-medium">Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={6}
                className="px-8 py-10 text-center text-sm text-muted-foreground"
              >
                Carregando produtos...
              </td>
            </tr>
          )}

          {!loading &&
            products.map((product) => {
              const isActive = product.is_active;

              return (
                <tr
                  key={product.id}
                  className="border-b border-border text-sm last:border-b-0 hover:bg-accent"
                >
                  <td className="px-5 py-4">
                    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl">🍽️</span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-card-foreground">
                      {product.name}
                    </p>

                    <p className="mt-1 max-w-[270px] text-xs leading-5 text-muted-foreground">
                      {product.description || "Sem descrição"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-muted-foreground">
                    {getProductCategory(product)}
                  </td>

                  <td className="px-5 py-4 text-card-foreground">
                    {formatPrice(product.price)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {showToggle && onToggle && (
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => onToggle(product)}
                        />
                      )}

                      <span
                        className={
                          isActive
                            ? "rounded-md bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600"
                            : "rounded-md bg-red-500/15 px-3 py-1 text-xs font-medium text-red-600"
                        }
                      >
                        {isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {showViewButton && (
                        <Link
                          href="/admin/produtos"
                          className="rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={16} />
                        </Link>
                      )}

                      <button
                        onClick={() => onEdit(product)}
                        className="rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(product)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

          {!loading && products.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-8 py-10 text-center text-sm text-muted-foreground"
              >
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}