"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  Users,
  Wallet,
  UtensilsCrossed,
} from "lucide-react";

import { useLogout } from "@/hooks/useLogout";

const menuItems = [
  {
    label: "Dashboard",
    href: "/master",
    icon: LayoutDashboard,
  },
  {
    label: "Restaurantes",
    href: "/master/restaurantes",
    icon: Store,
  },
  {
    label: "Usuários",
    href: "/master/usuarios",
    icon: Users,
  },
  {
    label: "Planos",
    href: "/master/planos",
    icon: CreditCard,
  },
  {
    label: "Financeiro",
    href: "/master/financeiro",
    icon: Wallet,
  },
  {
    label: "Configurações",
    href: "/master/configuracoes",
    icon: Settings,
  },
];

export function MasterSidebar() {
  const pathname = usePathname();
  const { loading: logoutLoading, handleLogout } = useLogout();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UtensilsCrossed size={20} />
        </div>

        <div>
          <h1 className="font-semibold text-foreground">MenuFlow</h1>

          <p className="text-xs text-muted-foreground">Painel Master</p>
        </div>
      </div>

      <nav className="flex h-[calc(100vh-80px)] flex-col justify-between p-4">
        <div>
          <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Menu
          </p>

          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isDashboard = item.href === "/master";

              const active = isDashboard
                ? pathname === "/master"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sistema
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />
            {logoutLoading ? "Saindo..." : "Sair"}
          </button>
        </div>
      </nav>
    </aside>
  );
}