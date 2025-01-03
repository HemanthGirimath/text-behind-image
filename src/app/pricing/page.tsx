"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { RazorpayPayment } from '@/components/payment/razorpay-payment'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: 0,
    displayPrice: '$0',
    description: 'Perfect for getting started',
    features: [
      'Basic text editing',
      'Single text layer',
      'Font family selection',
      'Font size adjustment',
      'Font color customization',
      'Basic text positioning',
      'Export as PNG',
    ],
  },
  {
    name: 'Basic',
    price: 9,
    displayPrice: '$9',
    description: 'For creative professionals',
    features: [
      'Everything in Free, plus:',
      'Up to 3 text layers',
      'Text shadow effects',
      'Gradient text effects',
      'Text rotation controls',
      'Basic text scaling',
      'Text outline options',
      'Multiple export formats',
    ],
  },
  {
    name: 'Premium',
    price: 29,
    displayPrice: '$29',
    description: 'For power users and teams',
    features: [
      'Everything in Basic, plus:',
      'Unlimited text layers',
      'Advanced text effects',
      'Blur and opacity controls',
      'Advanced text positioning',
      'Custom text transformations',
      'Priority support',
      'Background removal API access',
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePaymentSuccess = async (response: any, planName: string) => {
    try {
      setIsUpdating(true)

      // Update the user's plan in the database
      const updateResponse = await fetch('/api/update-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          payment_id: response.razorpay_payment_id,
        }),
      })

      const data = await updateResponse.json()

      if (!updateResponse.ok) {
        throw new Error(data.error || 'Failed to update plan')
      }

      toast.success('Payment successful! Your plan has been upgraded.')
      router.push('/profile')
    } catch (error: any) {
      console.error('Error updating plan:', error)
      toast.error(error.message || 'Payment successful but failed to update plan. Please contact support.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePaymentError = (error: any) => {
    toast.error('Payment failed. Please try again.')
    console.error('Payment error:', error)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-6">
                {plan.displayPrice}
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.price === 0 ? (
                <Button className="w-full" onClick={() => router.push('/editor')}>
                  Get Started
                </Button>
              ) : (
                <RazorpayPayment
                  amount={plan.price}
                  onSuccess={(response) => handlePaymentSuccess(response, plan.name)}
                  onError={handlePaymentError}
                />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
