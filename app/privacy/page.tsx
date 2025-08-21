"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 13, 2025</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Name, email address, and contact information</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Instagram handle (for custom jersey orders)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>IP address and browser information</li>
                    <li>Pages visited and time spent on our website</li>
                    <li>Device information and operating system</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Primary Uses</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Process and fulfill your orders</li>
                    <li>Communicate about your purchases and account</li>
                    <li>Provide customer support</li>
                    <li>Customize jerseys with requested names and numbers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Secondary Uses</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Improve our website and services</li>
                    <li>Send promotional emails (with your consent)</li>
                    <li>Analyze website usage and trends</li>
                    <li>Prevent fraud and ensure security</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Information Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">We Share Information With</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Payment processors to handle transactions</li>
                    <li>Shipping companies to deliver your orders</li>
                    <li>Service providers who help operate our website</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">We Do Not</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your information for marketing purposes without consent</li>
                    <li>Use your Instagram handle for any purpose other than jersey customization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  We implement appropriate security measures to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction.
                </p>

                <div>
                  <h3 className="font-semibold mb-2">Security Measures Include</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure servers and databases</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited access to personal information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">You Have the Right To</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and personal data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request data portability</li>
                  </ul>
                </div>

                <p className="text-sm">
                  To exercise these rights, please contact us at fbpitchhelp@gmail.com. We will respond to your request
                  within 30 days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">We Use Cookies For</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Maintaining your shopping cart</li>
                    <li>Remembering your preferences</li>
                    <li>Analyzing website performance</li>
                    <li>Providing personalized experiences</li>
                  </ul>
                </div>

                <p className="text-sm">
                  You can control cookies through your browser settings. However, disabling cookies may affect website
                  functionality.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
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
