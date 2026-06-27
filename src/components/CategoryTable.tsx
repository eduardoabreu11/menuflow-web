import { Edit, Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

import type { Category } from "@/services/categoryService";

type CategoryTableProps = {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggle: (category: Category) => void;
};

export default function CategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
  onToggle,
}: CategoryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="px-8 py-5 font-medium">Emoji</th>
            <th className="px-8 py-5 font-medium">Nome</th>
            <th className="px-8 py-5 font-medium">Ordem</th>
            <th className="px-8 py-5 font-medium">Produtos</th>
            <th className="px-8 py-5 font-medium">Status</th>
            <th className="px-8 py-5 text-right font-medium">Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={6}
                className="px-8 py-10 text-center text-sm text-muted-foreground"
              >
                Carregando categorias...
              </td>
            </tr>
          )}

          {!loading &&
            categories.map((category) => {
              const isActive = category.is_active;

              return (
                <tr
                  key={category.id}
                  className="border-b border-border text-sm last:border-b-0 hover:bg-accent"
                >
                  <td className="px-8 py-5">
                    <span className="text-3xl">
                      {category.emoji || "📂"}
                    </span>
                  </td>

                  <td className="px-8 py-5 font-medium text-card-foreground">
                    {category.name}
                  </td>

                  <td className="px-8 py-5 text-muted-foreground">
                    {category.sort_order === 0 ? "-" : category.sort_order}
                  </td>

                  <td className="px-8 py-5 text-muted-foreground">
                    0 produtos
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => onToggle(category)}
                      />

                      <span
                        className={
                          isActive
                            ? "rounded-md bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600"
                            : "rounded-md bg-red-500/15 px-3 py-1 text-xs font-medium text-red-600"
                        }
                      >
                        {isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => onDelete(category)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

          {!loading && categories.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-8 py-10 text-center text-sm text-muted-foreground"
              >
                Nenhuma categoria cadastrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}