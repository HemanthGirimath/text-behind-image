import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Initialize Razorpay only if keys are available
const initRazorpay = () => {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys not configured')
  }

  return new Razorpay({
    key_id,
    key_secret,
  })
}

export async function POST(request: Request) {
  try {
    const razorpay = initRazorpay()
    const { amount, currency = 'INR' } = await request.json()

    const options = {
      amount: Number(amount) * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Error creating order' },
      { status: 500 }
    )
  }
}
