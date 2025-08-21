"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
            <p className="text-muted-foreground">Last updated: January 13, 2025</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agreement to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  By accessing and using FbPitch's website and services, you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Permission is granted to:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Browse and purchase products from our website</li>
                    <li>Create an account for personal use</li>
                    <li>Download and print product information for personal reference</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">This license shall not allow you to:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for commercial purposes or public display</li>
                    <li>Attempt to reverse engineer any software on our website</li>
                    <li>Remove any copyright or proprietary notations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant
                  that product descriptions or other content is accurate, complete, reliable, current, or error-free.
                </p>
                <p className="text-sm">
                  All products are subject to availability. We reserve the right to discontinue any product at any time
                  without notice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing and Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All prices are listed in Kuwaiti Dinars (KWD)</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Custom name and number additions incur an additional KWD 1.000 charge</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Payment</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Payment is required at the time of purchase</li>
                    <li>We accept major credit cards and online payment methods</li>
                    <li>All transactions are processed securely</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping and Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  We offer shipping within Kuwait and internationally. Delivery times and costs vary by location and
                  shipping method selected.
                </p>
                <p className="text-sm">
                  Risk of loss and title for items purchased pass to you upon delivery to the carrier. We are not
                  responsible for lost or stolen packages.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Responsibility</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>You are responsible for maintaining the confidentiality of your account</li>
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must notify us immediately of any unauthorized use</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Account Termination</h3>
                  <p className="text-sm">
                    We reserve the right to terminate accounts that violate these terms or engage in fraudulent
                    activity.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  In no event shall FbPitch or its suppliers be liable for any damages (including, without limitation,
                  damages for loss of data or profit, or due to business interruption) arising out of the use or
                  inability to use the materials on FbPitch's website, even if FbPitch or an authorized representative
                  has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  If you have any questions about these Terms & Conditions, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> fbpitchhelp@gmail.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +965 6674 3690
                  </p>
                  <p>
                    <strong>Address:</strong> Kuwait City, Kuwait
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
