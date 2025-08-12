import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    const key_secret = process.env.RAZORPAY_KEY_SECRET

    // Create expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", key_secret).update(body.toString()).digest("hex")

    // Verify signature
    const verified = expectedSignature === razorpay_signature

    return NextResponse.json({ verified })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ verified: false }, { status: 500 })
  }
}
