declare namespace Razorpay {
  interface PaymentOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: RazorpayResponse) => void
    prefill?: {
      name?: string
      email?: string
      contact?: string
    }
    theme?: {
      color?: string
    }
  }

  interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }

  interface Orders {
    RazorpayOrderCreateRequestBody: {
      amount: number
      currency: string
      receipt: string
      notes?: Record<string, string>
    }
  }
}
