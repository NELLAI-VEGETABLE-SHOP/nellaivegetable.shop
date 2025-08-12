"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nellai</h1>
              <p className="text-xs text-green-600 -mt-1">Vegetable Shop</p>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Forgot Your Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            No problem. Enter your email address below and we'll send you a link to reset it.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>

          <div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Send Reset Link
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/auth/signin" className="text-sm text-green-600 hover:text-green-700">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
