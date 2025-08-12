"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  getCurrentUser, 
  getGuestUser, 
  createGuestUser, 
  clearGuestUser,
  type User,
  type GuestUser,
  type AuthenticatedUser,
  handleAuthCallback
} from '@/lib/auth'
import { migrateGuestCart } from '@/lib/cart-fixed'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInAsGuest: () => void
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      // Check for authenticated user first
      const authenticatedUser = await getCurrentUser()
      
      if (authenticatedUser) {
        const userData: AuthenticatedUser = {
          id: authenticatedUser.id,
          type: 'authenticated',
          email: authenticatedUser.email!,
          full_name: authenticatedUser.user_metadata?.full_name
        }
        setUser(userData)
        
        // Migrate guest cart if user was previously a guest
        const guestUser = getGuestUser()
        if (guestUser) {
          await migrateGuestCart(authenticatedUser.id)
          clearGuestUser()
        }
      } else {
        // Check for guest user
        const guestUser = getGuestUser()
        setUser(guestUser)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      // Check for guest user as fallback
      const guestUser = getGuestUser()
      setUser(guestUser)
    } finally {
      setLoading(false)
    }
  }

  const signInAsGuest = () => {
    const guestUser = createGuestUser()
    setUser(guestUser)
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      clearGuestUser()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (code) {
        try {
          await handleAuthCallback()
          await refreshUser()
          // Redirect to home page
          window.location.href = '/'
        } catch (error) {
          console.error('OAuth callback error:', error)
        }
      }
    }

    handleOAuthCallback()
    refreshUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: AuthenticatedUser = {
            id: session.user.id,
            type: 'authenticated',
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name
          }
          setUser(userData)
          
          // Migrate guest cart
          const guestUser = getGuestUser()
          if (guestUser) {
            await migrateGuestCart(session.user.id)
            clearGuestUser()
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signInAsGuest,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 