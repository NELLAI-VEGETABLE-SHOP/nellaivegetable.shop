"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // The actual OAuth handling is done in the AuthProvider
    // This page just shows a loading state
    const timer = setTimeout(() => {
      router.push('/')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Completing Sign In</CardTitle>
          <CardDescription>Please wait while we complete your authentication...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            You will be redirected to the home page shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 