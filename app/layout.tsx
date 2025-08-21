import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { SheetProvider } from "@/contexts/sheet-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "FbPitch - Premium Football Jerseys",
  description: "Your premier destination for authentic football jerseys and sports apparel",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/images/fbpitch-logo.png", sizes: "any" },
      { url: "/images/fbpitch-logo.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/images/fbpitch-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <SheetProvider>
          <main>{children}</main>
        </SheetProvider>
      </body>
    </html>
  )
}
