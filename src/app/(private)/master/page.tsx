import {
  CircleCheck,
  Clock3,
  CreditCard,
  Store,
  Wallet,
} from "lucide-react";

import { MasterSidebar } from "./_components/masterSidebar";
import { MasterTopbar } from "./_components/masterTopbar";
import { MasterMetricCard } from "./_components/masterMetricCard";
import { LatestRestaurantsTable } from "./_components/latestRestaurantsTable";

export default function MasterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard
            </h1>

            <p className="text-sm text-muted-foreground">
              Visão geral da plataforma MenuFlow.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MasterMetricCard
              title="Total de Restaurantes"
              value="24"
              description="+3 este mês"
              icon={<Store size={24} />}
            />

            <MasterMetricCard
              title="Assinaturas Ativas"
              value="18"
              description="75% dos restaurantes"
              icon={<CreditCard size={24} />}
            />

            <MasterMetricCard
              title="Receita Mensal"
              value="R$ 1.920,00"
              description="+12% este mês"
              icon={<Wallet size={24} />}
            />

            <MasterMetricCard
              title="Em Teste"
              value="6"
              description="Restaurantes em período trial"
              icon={<Clock3 size={24} />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <LatestRestaurantsTable />

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Resumo Rápido
                </h2>

                <p className="text-sm text-muted-foreground">
                  Situação geral da plataforma.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Restaurantes Ativos
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Operando normalmente
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <CircleCheck size={18} />
                    20
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Assinaturas Pendentes
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Aguardando regularização
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    4
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Planos Cadastrados
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Básico, Pro e Premium
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-foreground">
                    3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}