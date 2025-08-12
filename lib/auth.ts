import { supabase } from "./supabase"

// Guest user type
export interface GuestUser {
  id: string
  type: 'guest'
  email?: string
  full_name?: string
}

// Authenticated user type
export interface AuthenticatedUser {
  id: string
  type: 'authenticated'
  email: string
  full_name?: string
}

export type User = GuestUser | AuthenticatedUser

// Generate a unique guest ID
const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Guest mode functions
export const createGuestUser = (): GuestUser => {
  const guestId = generateGuestId()
  const guestUser: GuestUser = {
    id: guestId,
    type: 'guest'
  }

  // Store guest user in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('guestUser', JSON.stringify(guestUser))
  }

  return guestUser
}

export const getGuestUser = (): GuestUser | null => {
  if (typeof window === 'undefined') return null

  const guestUserStr = localStorage.getItem('guestUser')
  if (!guestUserStr) return null

  try {
    const guestUser = JSON.parse(guestUserStr) as GuestUser
    return guestUser.type === 'guest' ? guestUser : null
  } catch {
    return null
  }
}

export const clearGuestUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guestUser')
  }
}

// Google OAuth
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Google sign in error:", error)
    throw error
  }
}

// Handle OAuth callback
export const handleAuthCallback = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    if (data.session?.user) {
      // Ensure profile exists for OAuth users
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.session.user.id)
        .single()

      if (!existingProfile) {
        await supabase.from("profiles").insert([
          {
            id: data.session.user.id,
            email: data.session.user.email!,
            full_name: data.session.user.user_metadata?.full_name || "",
          },
        ])
      }
    }

    return data
  } catch (error) {
    console.error("Auth callback error:", error)
    throw error
  }
}

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Create profile after successful signup
    if (data.user && !data.user.email_confirmed_at) {
      // For development, we'll create the profile immediately
      // In production, this should be done after email confirmation
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        },
      ])

      // Don't throw error if profile already exists
      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("Profile creation error:", profileError)
      }
    }

    return data
  } catch (error) {
    console.error("SignUp error:", error)
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Ensure profile exists
    if (data.user) {
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

      if (!existingProfile) {
        // Create profile if it doesn't exist
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || "",
          },
        ])
      }
    }

    return data
  } catch (error) {
    console.error("SignIn error:", error)
    throw error
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}
