import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { loadScript } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface RazorpayPaymentProps {
  amount: number
  onSuccess: (response: Razorpay.RazorpayResponse) => void
  onError: (error: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayPayment({ amount, onSuccess, onError }: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js')
  }, [])

  const handlePayment = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      const order = await response.json()

      if (!order.id) throw new Error('Failed to create order')

      const options: Razorpay.PaymentOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: 'Text Behind Image',
        description: 'Premium Features Subscription',
        order_id: order.id,
        handler: function (response: Razorpay.RazorpayResponse) {
          onSuccess(response)
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#0A2540',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      onError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay Now'
      )}
    </Button>
  )
}
