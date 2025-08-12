// Razorpay client-side configuration and utilities
export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  notes: {
    address: string
  }
  theme: {
    color: string
  }
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface RazorpayOrderResponse {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  status: string
  created_at: number
  key_id: string // Server will provide this
}

// Create Razorpay order
export const createRazorpayOrder = async (amount: number, receipt: string): Promise<RazorpayOrderResponse> => {
  try {
    const response = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order")
    }

    const order = await response.json()
    return order
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw error
  }
}

// Verify payment
export const verifyRazorpayPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
): Promise<boolean> => {
  try {
    const response = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to verify payment")
    }

    const result = await response.json()
    return result.verified
  } catch (error) {
    console.error("Error verifying payment:", error)
    return false
  }
}

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
