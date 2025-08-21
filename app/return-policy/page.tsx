"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReturnPolicyPage() {
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    const savedCartCount = localStorage.getItem("cartItemCount")
    if (savedCartCount) {
      setCartItemCount(Number.parseInt(savedCartCount))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Return Policy</h1>
            <p className="text-muted-foreground">Last updated: January 13, 2025</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>30-Day Return Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  At FbPitch, we want you to be completely satisfied with your purchase. We offer a 30-day return policy
                  for all items purchased from our store.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Eligible Items</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Items must be returned within 30 days of purchase</li>
                    <li>Items must be in original condition with tags attached</li>
                    <li>Items must be unworn and unwashed</li>
                    <li>Original packaging must be included</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Non-Returnable Items</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Customized jerseys with names and numbers</li>
                    <li>Items damaged by misuse or normal wear</li>
                    <li>Items purchased with special promotions or discounts over 50%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      1
                    </div>
                    <h4 className="font-semibold mb-1">Contact Us</h4>
                    <p className="text-sm text-muted-foreground">
                      Email us at fbpitchhelp@gmail.com with your order number
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      2
                    </div>
                    <h4 className="font-semibold mb-1">Get Authorization</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll provide you with a return authorization number
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      3
                    </div>
                    <h4 className="font-semibold mb-1">Ship Items</h4>
                    <p className="text-sm text-muted-foreground">
                      Package items securely and ship to our return address
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refund Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Processing Time</h3>
                  <p className="text-sm">
                    Refunds will be processed within 5-7 business days after we receive your returned items. You will
                    receive an email confirmation once your refund has been processed.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Refund Method</h3>
                  <p className="text-sm">
                    Refunds will be issued to the original payment method used for the purchase. Please allow 3-5
                    business days for the refund to appear in your account.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Return Shipping</h3>
                  <p className="text-sm">
                    Customers are responsible for return shipping costs unless the item was defective or we made an
                    error. We recommend using a trackable shipping service.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">If you have any questions about our return policy, please contact us:</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> fbpitchhelp@gmail.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +965 6674 3690
                  </p>
                  <p>
                    <strong>Business Hours:</strong> 24/7 Open
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
