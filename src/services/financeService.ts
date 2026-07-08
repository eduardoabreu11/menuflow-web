import { apiFetch, getApiErrorMessage } from "./api";

export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE" | "CANCELED";

export type SubscriptionStatus = "ACTIVE" | "PENDING" | "OVERDUE" | "CANCELED";

export type Payment = {
  id: string;
  restaurant_id: string;
  subscription_id: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  restaurant_name?: string;
  restaurant_slug?: string;
  subscription_status?: SubscriptionStatus;
  plan_name?: string;
};

export type Subscription = {
  id: string;
  restaurant_id: string;
  status: SubscriptionStatus;
  plan_name: string;
  monthly_price: number;
  started_at: string;
  next_billing_date: string;
  created_at: string;
  updated_at: string;
  restaurant_name?: string;
  restaurant_slug?: string;
};

export type CreatePaymentData = {
  restaurant_id: string;
  subscription_id: string;
  amount: number;
  due_date: string;
  status?: PaymentStatus;
};

export type GenerateMonthlyPaymentsData = {
  up_to_date?: string;
};

export type GenerateMonthlyPaymentSummary = {
  subscription_id: string;
  restaurant_id: string;
  restaurant_name: string;
  due_date: string;
  next_billing_date: string;
  payment: Payment | null;
  status: "GENERATED" | "SKIPPED";
  reason?: string;
};

export type GenerateMonthlyPaymentsResult = {
  up_to_date: string;
  total_subscriptions_ready: number;
  generated_count: number;
  skipped_count: number;
  summaries: GenerateMonthlyPaymentSummary[];
};

export async function getPayments(): Promise<Payment[]> {
  const response = await apiFetch("/payments");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar faturas"),
    );
  }

  return response.json();
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await apiFetch("/subscriptions");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao buscar assinaturas"),
    );
  }

  return response.json();
}

export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  const response = await apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Erro ao criar fatura"));
  }

  return response.json();
}

export async function generateMonthlyPayments(
  data: GenerateMonthlyPaymentsData = {},
): Promise<GenerateMonthlyPaymentsResult> {
  const response = await apiFetch("/payments/generate-monthly", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao gerar faturas mensais"),
    );
  }

  return response.json();
}

export async function markPaymentAsPaid(paymentId: string): Promise<Payment> {
  const response = await apiFetch(`/payments/${paymentId}/pay`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao marcar fatura como paga"),
    );
  }

  return response.json();
}

export async function cancelPayment(paymentId: string): Promise<Payment> {
  const response = await apiFetch(`/payments/${paymentId}/cancel`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao cancelar fatura"),
    );
  }

  return response.json();
}