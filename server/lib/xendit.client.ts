export interface CreateXenditInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  customerName?: string;
  gameTitle: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  currency?: "USD" | "PHP" | "IDR";
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  user_id?: string;
  status: "PENDING" | "PAID" | "SETTLED" | "EXPIRED";
  merchant_name: string;
  amount: number;
  payer_email: string;
  description: string;
  invoice_url: string;
  expiry_date: string;
  currency: string;
}

export class XenditService {
  private secretKey: string;
  private baseUrl = "https://api.xendit.co";

  constructor() {
    this.secretKey = process.env.XENDIT_SECRET_KEY || "";
  }

  private getAuthHeader() {
    if (!this.secretKey) {
      throw new Error(
        "Payment gateway secret key is not configured in environment variables.",
      );
    }
    const token = Buffer.from(`${this.secretKey}:`).toString("base64");
    return {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    };
  }

  async createInvoice(
    params: CreateXenditInvoiceParams,
  ): Promise<XenditInvoiceResponse> {
    const currency =
      params.currency ||
      ((process.env.NEXT_PUBLIC_CURRENCY as "PHP" | "USD") || "PHP");
    // Ensure amount is at least 1 for valid currency checkout
    const finalAmount = Math.max(Number(params.amount.toFixed(2)), 1);

    const body = {
      external_id: params.externalId,
      amount: finalAmount,
      payer_email: params.payerEmail,
      description: params.description,
      customer: {
        email: params.payerEmail,
        given_names: params.customerName || "Operator",
      },
      customer_notification_preference: {
        invoice_created: ["email"],
        invoice_reminder: ["email"],
        invoice_paid: ["email"],
      },
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: currency,
      items: [
        {
          name: params.gameTitle,
          quantity: 1,
          price: finalAmount,
          category: "Digital Games",
        },
      ],
      fees: [],
    };

    const response = await fetch(`${this.baseUrl}/v2/invoices`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error_code || "Failed to initialize payment session",
      );
    }

    return data as XenditInvoiceResponse;
  }

  async getInvoice(invoiceId: string): Promise<XenditInvoiceResponse> {
    const response = await fetch(`${this.baseUrl}/v2/invoices/${invoiceId}`, {
      method: "GET",
      headers: this.getAuthHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch transaction status",
      );
    }

    return data as XenditInvoiceResponse;
  }
}

export const xenditClient = new XenditService();
