import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nellai Vegetable Shop - Fresh Vegetables & Fruits Online",
  description:
    "Order fresh vegetables and fruits online from Nellai Vegetable Shop. Quality produce delivered to your doorstep in Chennai. Free delivery on orders above ₹500.",
  keywords: "vegetables, fruits, online grocery, Chennai, fresh produce, home delivery, organic vegetables",
  authors: [{ name: "Nellai Vegetable Shop" }],
  openGraph: {
    title: "Nellai Vegetable Shop - Fresh Vegetables & Fruits Online",
    description: "Order fresh vegetables and fruits online with free delivery in Chennai",
    type: "website",
    locale: "en_IN",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
