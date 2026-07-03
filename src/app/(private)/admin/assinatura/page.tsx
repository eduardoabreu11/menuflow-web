import {
  Calendar,
  CreditCard,
  Download,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";

export default function AssinaturaPage() {
  const payments = [
    { date: "10/06/2026", amount: "R$ 99,90", status: "Pago" },
    { date: "10/05/2026", amount: "R$ 99,90", status: "Pago" },
    { date: "10/04/2026", amount: "R$ 99,90", status: "Pago" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />

      <main className="ml-64 min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Assinatura
          </h1>

          <p className="mt-1 text-muted-foreground">
            Gerencie seu plano, cobranças e pagamentos.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Plano Atual</p>

            <h3 className="mt-2 text-2xl font-bold text-foreground">
              Pro
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              R$ 99,90/mês
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar size={20} />
            </div>

            <p className="text-sm text-muted-foreground">
              Próxima Cobrança
            </p>

            <h3 className="mt-2 text-2xl font-bold text-foreground">
              10/07/2026
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Faltam 18 dias
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Status</p>

            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Assinatura Ativa
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Sem pendências
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt size={20} />
            </div>

            <p className="text-sm text-muted-foreground">Pagamento</p>

            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Cartão
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              **** **** **** 1234
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Histórico de Pagamentos
            </h2>

            <p className="text-sm text-muted-foreground">
              Últimas cobranças realizadas.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.date}>
                    <td className="px-4 py-4 text-foreground">
                      {payment.date}
                    </td>

                    <td className="px-4 py-4 text-foreground">
                      {payment.amount}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                        <Download size={16} />
                        Baixar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Gerenciar Assinatura
          </h2>

          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Trocar Plano
            </button>

            <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
              Atualizar Pagamento
            </button>

            <button className="rounded-lg border border-red-200 bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              Cancelar Assinatura
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}