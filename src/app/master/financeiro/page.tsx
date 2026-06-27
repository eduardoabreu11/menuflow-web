import {
  CheckCircle,
  DollarSign,
  Eye,
  FileText,
  Wallet,
  XCircle,
} from "lucide-react";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";
import { MasterMetricCard } from "../_components/masterMetricCard";

const payments = [
  {
    id: 1,
    restaurant: "Pizzaria do João",
    plan: "Premium",
    amount: "R$ 99,90",
    dueDate: "10/07/2026",
    status: "Pago",
  },
  {
    id: 2,
    restaurant: "Hamburgueria Prime",
    plan: "Premium",
    amount: "R$ 99,90",
    dueDate: "08/07/2026",
    status: "Pendente",
  },
  {
    id: 3,
    restaurant: "Sushi House",
    plan: "Premium",
    amount: "R$ 99,90",
    dueDate: "05/07/2026",
    status: "Atrasado",
  },
];

const statusStyles = {
  Pago: "bg-green-100 text-green-700",
  Pendente: "bg-yellow-100 text-yellow-700",
  Atrasado: "bg-red-100 text-red-700",
};

export default function MasterFinanceiroPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Financeiro
            </h1>

            <p className="text-muted-foreground">
              Gerencie receitas, cobranças e pagamentos da plataforma.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MasterMetricCard
              title="Receita Mensal"
              value="R$ 2.970"
              description="Receita prevista"
              icon={<DollarSign size={24} />}
            />

            <MasterMetricCard
              title="Recebido"
              value="R$ 2.400"
              description="Pagamentos confirmados"
              icon={<CheckCircle size={24} />}
            />

            <MasterMetricCard
              title="Pendente"
              value="R$ 300"
              description="Aguardando pagamento"
              icon={<Wallet size={24} />}
            />

            <MasterMetricCard
              title="Atrasado"
              value="R$ 270"
              description="Cobranças vencidas"
              icon={<XCircle size={24} />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-6">
                <h2 className="text-lg font-semibold">
                  Cobranças
                </h2>

                <p className="text-sm text-muted-foreground">
                  Últimos pagamentos e vencimentos.
                </p>
              </div>

              <div className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-5 py-4 font-medium">
                        Restaurante
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Plano
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Valor
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Vencimento
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-accent/50"
                      >
                        <td className="px-5 py-4 font-medium">
                          {payment.restaurant}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {payment.plan}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {payment.amount}
                        </td>

                        <td className="px-5 py-4 text-muted-foreground">
                          {payment.dueDate}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              statusStyles[
                                payment.status as keyof typeof statusStyles
                              ]
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button className="rounded-lg border border-border p-2 hover:bg-accent">
                              <Eye size={16} />
                            </button>

                            <button className="rounded-lg border border-border p-2 hover:bg-accent">
                              <FileText size={16} />
                            </button>

                            <button className="rounded-lg border border-border p-2 hover:bg-accent">
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-5 text-lg font-semibold">
                Resumo do Mês
              </h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Receita Prevista
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    R$ 2.970
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Recebido
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-600">
                    R$ 2.400
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Pendente
                  </p>

                  <p className="mt-1 text-2xl font-bold text-yellow-600">
                    R$ 300
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    Atrasado
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-600">
                    R$ 270
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}