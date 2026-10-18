// VLY Integrations Configuration
// See /integrations.md for usage documentation

export interface VlyApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    credits: number;
    operation: string;
  };
}

export interface VlyEmailService {
  send: (payload: { to: string; subject: string; html?: string; text?: string }) => Promise<VlyApiResponse>;
  sendBatch: (emails: Array<{ to: string; subject: string; html?: string; text?: string }>) => Promise<VlyApiResponse>;
}

export interface VlyPaymentsService {
  createPaymentIntent: (params: Record<string, unknown>) => Promise<VlyApiResponse>;
  createSubscription: (params: Record<string, unknown>) => Promise<VlyApiResponse>;
  createCheckoutSession: (params: Record<string, unknown>) => Promise<VlyApiResponse>;
}

export interface VlyClient {
  email: VlyEmailService;
  payments: VlyPaymentsService;
}

export const vly: VlyClient = {
  email: {
    send: async () => ({ success: false, error: "Not configured" }),
    sendBatch: async () => ({ success: false, error: "Not configured" }),
  },
  payments: {
    createPaymentIntent: async () => ({ success: false, error: "Not configured" }),
    createSubscription: async () => ({ success: false, error: "Not configured" }),
    createCheckoutSession: async () => ({ success: false, error: "Not configured" }),
  },
};
