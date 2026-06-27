"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Folder,
  ShoppingBag,
  LinkIcon,
  Settings,
  LogOut,
  Utensils,
  BookOpen,
  CreditCard,
  ExternalLink,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Cardápio",
    href: "/admin/cardapio",
    icon: BookOpen,
  },
  {
    label: "Categorias",
    href: "/admin/categorias",
    icon: Folder,
  },
  {
    label: "Produtos",
    href: "/admin/produtos",
    icon: ShoppingBag,
  },
  {
    label: "Link & QR Code",
    href: "/admin/link",
    icon: LinkIcon,
  },
  {
    label: "Assinatura",
    href: "/admin/assinatura",
    icon: CreditCard,
  },
  {
    label: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Utensils size={22} />
        </div>

        <div>
          <strong className="block text-lg font-bold text-sidebar-foreground">
            MenuFlow
          </strong>

          <span className="text-xs text-muted-foreground">
            Cardápio Digital
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-4">
          <div className="mb-2 flex items-center gap-2">
            <ExternalLink
              size={14}
              className="text-muted-foreground"
            />

            <span className="text-xs font-medium text-sidebar-foreground">
              Seu cardápio online
            </span>
          </div>

          <a
            href="https://menuflow.com/cardapio/pizzaria-do-joao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 text-xs text-primary hover:underline"
          >
            <span className="truncate">
              menuflow.com/pizzaria-do-joao
            </span>

            <ExternalLink size={14} />
          </a>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut size={18} />
          Sair
        </Link>
      </div>
    </aside>
  );
}