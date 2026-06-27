import Link from "next/link";


import {
  
  Ban,
  Calendar,
  CreditCard,
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
  Store,
  Tag,
  User,
  Users,
} from "lucide-react";

import { MasterSidebar } from "../../_components/masterSidebar";
import { MasterTopbar } from "../../_components/masterTopbar";

const restaurant = {
  id: 1,
  name: "Pizzaria do João",
  slug: "pizzaria-do-joao",
  description: "Pizzaria especializada em massas artesanais.",
  status: "Ativo",
  plan: "Premium",
  owner: "João Silva",
  email: "joao@email.com",
  phone: "(99) 99999-9999",
  whatsapp: "(99) 99999-9999",
  address: "Rua das Flores, 123 - Centro",
  createdAt: "02/05/2025",
  publicUrl: "https://menuflow.com/cardapio/pizzaria-do-joao",
  openingHours: "Segunda a sábado, 18h às 23h",
  categories: 8,
  products: 72,
  activeProducts: 68,
  banners: 3,
  subscription: {
    status: "Ativa",
    nextBilling: "10/07/2026",
    value: "R$ 99,90",
  },
  users: [
    {
      name: "João Silva",
      email: "joao@email.com",
      role: "Dono",
      status: "Ativo",
    },
    {
      name: "Maria Souza",
      email: "maria@email.com",
      role: "Gerente",
      status: "Ativo",
    },
  ],
};

export default function RestaurantDetailsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
             

              <h1 className="text-3xl font-bold text-foreground">
                {restaurant.name}
              </h1>

              <p className="mt-1 text-muted-foreground">
                Informações completas do restaurante.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={restaurant.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <ExternalLink size={17} />
                Ver cardápio
              </a>

              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                <Pencil size={17} />
                Editar
              </button>

              <button className="flex items-center gap-2 rounded-lg border border-red-200 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                <Ban size={17} />
                Bloquear
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store size={20} />
              </div>

              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <h3 className="mt-2 text-xl font-bold text-green-600">
                {restaurant.status}
              </h3>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard size={20} />
              </div>

              <p className="text-sm text-muted-foreground">
                Plano
              </p>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                {restaurant.plan}
              </h3>
            </div>

          

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar size={20} />
              </div>

              <p className="text-sm text-muted-foreground">
                Cadastro
              </p>

              <h3 className="mt-2 text-xl font-bold text-foreground">
                {restaurant.createdAt}
              </h3>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Dados do Restaurante
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem label="Nome" value={restaurant.name} />
                  <InfoItem label="Slug" value={restaurant.slug} />
                  <InfoItem label="Descrição" value={restaurant.description} />
                  <InfoItem label="Dono" value={restaurant.owner} />
                  <InfoItem label="E-mail" value={restaurant.email} />
                  <InfoItem label="Telefone" value={restaurant.phone} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Informações do Cardápio
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem label="WhatsApp" value={restaurant.whatsapp} />
                  <InfoItem label="Endereço" value={restaurant.address} />
                  <InfoItem
                    label="Horário de funcionamento"
                    value={restaurant.openingHours}
                  />
                  <InfoItem label="Categorias" value={`${restaurant.categories}`} />
                  <InfoItem label="Produtos" value={`${restaurant.products}`} />
                  <InfoItem label="Banners ativos" value={`${restaurant.banners}`} />
                </div>

                <div className="mt-5 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">
                    Link público do cardápio
                  </p>

                  <a
                    href={restaurant.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    {restaurant.publicUrl}
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Usuários Vinculados
                </h2>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">
                          Nome
                        </th>
                        <th className="px-4 py-3 font-medium">
                          E-mail
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Função
                        </th>
                        <th className="px-4 py-3 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {restaurant.users.map((user) => (
                        <tr key={user.email}>
                          <td className="px-4 py-4 font-medium text-foreground">
                            {user.name}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {user.role}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Assinatura
                </h2>

                <div className="space-y-4">
                  <InfoItem label="Status" value={restaurant.subscription.status} />
                  <InfoItem label="Valor" value={restaurant.subscription.value} />
                  <InfoItem
                    label="Próxima cobrança"
                    value={restaurant.subscription.nextBilling}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Resumo do Cardápio
                </h2>

                <div className="space-y-4">
                  <SummaryItem label="Categorias" value={restaurant.categories} />
                  <SummaryItem label="Produtos" value={restaurant.products} />
                  <SummaryItem
                    label="Produtos ativos"
                    value={restaurant.activeProducts}
                  />
                  <SummaryItem label="Banners" value={restaurant.banners} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">
                  Contato
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <User size={17} className="text-primary" />
                    {restaurant.owner}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone size={17} className="text-primary" />
                    {restaurant.phone}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin size={17} className="text-primary" />
                    {restaurant.address}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users size={17} className="text-primary" />
                    {restaurant.users.length} usuários
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}