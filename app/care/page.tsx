"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Droplets, Wind, Sun, AlertTriangle } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CarePage() {
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
            <h1 className="text-3xl font-bold mb-2">Care Instructions</h1>
            <p className="text-muted-foreground">Keep your FbPitch jerseys looking fresh and lasting longer</p>
          </div>

          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Following these care instructions will help maintain the quality and appearance of your jersey while
              preserving any custom printing or embroidery.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  Washing Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Before First Wear</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Turn the jersey inside out to protect prints and logos</li>
                    <li>Wash separately or with similar colors for the first wash</li>
                    <li>Use cold water (30°C or below) to prevent color bleeding</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Regular Washing</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Machine wash in cold water (30°C or below)</li>
                    <li>Use mild detergent - avoid bleach or fabric softeners</li>
                    <li>Wash with similar colors to prevent color transfer</li>
                    <li>Turn inside out to protect printed names and numbers</li>
                    <li>Use gentle or delicate cycle for best results</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What to Avoid</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    <li>Hot water (can cause shrinking and color fading)</li>
                    <li>Bleach or harsh chemicals</li>
                    <li>Fabric softeners (can affect moisture-wicking properties)</li>
                    <li>Washing with rough fabrics like denim</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-green-500" />
                  Drying Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Air dry whenever possible - hang or lay flat</li>
                    <li>Keep away from direct sunlight to prevent fading</li>
                    <li>Ensure good ventilation for faster drying</li>
                    <li>Reshape while damp to maintain fit</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Machine Drying</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use low heat setting only if necessary</li>
                    <li>Remove while slightly damp to prevent over-drying</li>
                    <li>Turn inside out to protect prints</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Avoid</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    <li>High heat settings (can damage fabric and prints)</li>
                    <li>Direct sunlight for extended periods</li>
                    <li>Hanging by the shoulders (can cause stretching)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Ironing & Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Ironing Guidelines</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Iron inside out to protect prints and logos</li>
                    <li>Use low to medium heat setting</li>
                    <li>Avoid ironing directly over printed areas</li>
                    <li>Use a pressing cloth if needed</li>
                    <li>Steam setting can help remove wrinkles gently</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Storage Tips</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Store in a cool, dry place</li>
                    <li>Hang on padded hangers to maintain shape</li>
                    <li>Fold carefully if hanging isn't possible</li>
                    <li>Keep away from direct sunlight</li>
                    <li>Ensure jerseys are completely dry before storing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Care for Custom Jerseys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Names & Numbers</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Always wash inside out to protect custom printing</li>
                    <li>Avoid ironing directly over printed names and numbers</li>
                    <li>Allow extra drying time for thick printed areas</li>
                    <li>Be gentle when folding around printed sections</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Patches & Badges</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Check that all patches are securely attached before washing</li>
                    <li>Use gentle cycle to prevent patch edges from lifting</li>
                    <li>Air dry to prevent heat damage to adhesive</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Common Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Stain Removal</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Treat stains immediately with cold water</li>
                    <li>Use mild stain remover suitable for synthetic fabrics</li>
                    <li>Test on a hidden area first</li>
                    <li>Avoid rubbing - blot gently instead</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Odor Prevention</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Wash jerseys promptly after wearing</li>
                    <li>Don't leave damp jerseys in bags</li>
                    <li>Add white vinegar to rinse cycle occasionally</li>
                    <li>Ensure complete drying before storage</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Maintaining Fit</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Avoid hot water and high heat drying</li>
                    <li>Reshape while damp</li>
                    <li>Store properly to prevent stretching</li>
                    <li>Follow size chart recommendations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  If you have specific questions about caring for your FbPitch jersey or encounter any issues, we're
                  here to help!
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> care@fbpitch.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +965 1234 5678
                  </p>
                  <p>
                    <strong>Live Chat:</strong> Available on our website during business hours
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
