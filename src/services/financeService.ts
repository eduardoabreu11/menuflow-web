import { apiFetch, getApiErrorMessage } from "./api";

export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE" | "CANCELED";

export type SubscriptionStatus = "ACTIVE" | "PENDING" | "OVERDUE" | "CANCELED";

export type PaymentGatewayProvider = "MANUAL" | "ASAAS";

export type AsaasBillingType = "BOLETO" | "PIX" | "CREDIT_CARD" | "UNDEFINED";

export type AsaasChargeStatus =
  | "NOT_REQUESTED"
  | "GENERATED"
  | "SKIPPED"
  | "FAILED";

export type PaymentReminderChannel = "EMAIL" | "WHATSAPP";

export type PaymentReminderType =
  | "BEFORE_DUE"
  | "DUE_TODAY"
  | "OVERDUE"
  | "BLOCKED";

export type PaymentReminderStatus = "PENDING" | "SENT" | "FAILED" | "SKIPPED";

export type Payment = {
  id: string;
  owner_user_id: string;
  restaurant_id: string | null;
  subscription_id: string;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: PaymentStatus;

  gateway_provider?: PaymentGatewayProvider;
  gateway_payment_id?: string | null;
  gateway_payment_url?: string | null;
  gateway_invoice_url?: string | null;
  gateway_status?: string | null;

  created_at: string;
  updated_at: string;

  owner_name?: string;
  owner_email?: string;
  total_restaurants?: number;

  restaurant_name?: string;
  restaurant_slug?: string;
  subscription_status?: SubscriptionStatus;
  plan_name?: string;
};

export type Subscription = {
  id: string;
  owner_user_id: string;
  restaurant_id: string | null;
  status: SubscriptionStatus;
  plan_name: string;
  monthly_price: number;
  started_at: string;
  next_billing_date: string;
  created_at: string;
  updated_at: string;

  owner_name?: string;
  owner_email?: string;
  total_restaurants?: number;

  restaurant_name?: string;
  restaurant_slug?: string;
};

export type PaymentReminder = {
  id: string;
  payment_id: string;
  owner_user_id: string;

  channel: PaymentReminderChannel;
  reminder_type: PaymentReminderType;
  reminder_date: string;

  recipient: string | null;
  subject: string | null;
  message: string;

  sent_at: string | null;
  status: PaymentReminderStatus;
  error_message: string | null;
  metadata: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;

  owner_name: string | null;
  owner_email: string | null;

  amount: number | null;
  due_date: string | null;
  payment_status: PaymentStatus | null;

  gateway_provider: PaymentGatewayProvider | null;
  gateway_status: string | null;
  gateway_invoice_url: string | null;
  gateway_payment_url: string | null;
};

export type CreatePaymentData = {
  owner_user_id?: string;
  restaurant_id?: string | null;
  subscription_id: string;
  amount: number;
  due_date: string;
  status?: "PENDING";
  create_asaas_charge?: boolean;
};

export type GenerateMonthlyPaymentsData = {
  up_to_date?: string;
  create_asaas_charges?: boolean;
};

export type GenerateMonthlyPaymentSummary = {
  subscription_id: string;
  owner_user_id: string;
  owner_name: string;
  owner_email: string;
  due_date: string;
  next_billing_date: string;
  payment: Payment | null;
  status: "GENERATED" | "SKIPPED";
  reason?: string;
  asaas_charge_status?: AsaasChargeStatus;
  asaas_charge_error?: string;
};

export type GenerateMonthlyPaymentsResult = {
  up_to_date: string;
  create_asaas_charges: boolean;
  total_subscriptions_ready: number;
  generated_count: number;
  skipped_count: number;
  asaas_generated_count: number;
  asaas_failed_count: number;
  asaas_skipped_count: number;
  summaries: GenerateMonthlyPaymentSummary[];
};

export type CreateAsaasChargeData = {
  billing_type?: AsaasBillingType;
};

export type CreateAsaasChargeResult = {
  payment: Payment;
  asaas_payment?: unknown;
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

export async function getPaymentReminders(): Promise<PaymentReminder[]> {
  const response = await apiFetch("/payment-reminders");

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        "Erro ao carregar histórico de lembretes",
      ),
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

export async function createAsaasCharge(
  paymentId: string,
  data: CreateAsaasChargeData = {},
): Promise<CreateAsaasChargeResult> {
  const response = await apiFetch(`/payments/${paymentId}/asaas-charge`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, "Erro ao gerar cobrança Asaas"),
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