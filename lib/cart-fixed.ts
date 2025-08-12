import { supabase } from "./supabase"
import type { CartItem } from "./supabase"
import { getGuestUser } from "./auth-fixed"

// Guest cart item type
export interface GuestCartItem {
  id: string
  product_id: string
  quantity: number
  products?: any
}

// Guest cart functions
export const getGuestCartItems = (): GuestCartItem[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const cartItemsStr = localStorage.getItem('guestCart')
    if (!cartItemsStr) return []
    
    return JSON.parse(cartItemsStr) as GuestCartItem[]
  } catch {
    return []
  }
}

export const addToGuestCart = async (productId: string, quantity = 1): Promise<void> => {
  if (typeof window === 'undefined') return
  
  try {
    const cartItems = getGuestCartItems()
    const existingItemIndex = cartItems.findIndex(item => item.product_id === productId)
    
    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += quantity
    } else {
      // Fetch product details
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()
      
      if (product) {
        cartItems.push({
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          product_id: productId,
          quantity,
          products: product
        })
      }
    }
    
    localStorage.setItem('guestCart', JSON.stringify(cartItems))
  } catch (error) {
    console.error("Error adding to guest cart:", error)
    throw error
  }
}

export const updateGuestCartItem = async (cartItemId: string, quantity: number): Promise<void> => {
  if (typeof window === 'undefined') return
  
  try {
    const cartItems = getGuestCartItems()
    const itemIndex = cartItems.findIndex(item => item.id === cartItemId)
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cartItems.splice(itemIndex, 1)
      } else {
        cartItems[itemIndex].quantity = quantity
      }
      
      localStorage.setItem('guestCart', JSON.stringify(cartItems))
    }
  } catch (error) {
    console.error("Error updating guest cart item:", error)
    throw error
  }
}

export const removeFromGuestCart = async (cartItemId: string): Promise<void> => {
  if (typeof window === 'undefined') return
  
  try {
    const cartItems = getGuestCartItems()
    const filteredItems = cartItems.filter(item => item.id !== cartItemId)
    localStorage.setItem('guestCart', JSON.stringify(filteredItems))
  } catch (error) {
    console.error("Error removing from guest cart:", error)
    throw error
  }
}

export const clearGuestCart = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('guestCart')
  }
}

export const getGuestCartTotal = (cartItems: GuestCartItem[]): number => {
  return cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)
}

export const getGuestCartItemCount = (cartItems: GuestCartItem[]): number => {
  return cartItems.reduce((count, item) => count + item.quantity, 0)
}

// Migrate guest cart to authenticated user
export const migrateGuestCart = async (userId: string): Promise<void> => {
  try {
    const guestCartItems = getGuestCartItems()
    
    for (const guestItem of guestCartItems) {
      await addToCart(userId, guestItem.product_id, guestItem.quantity)
    }
    
    // Clear guest cart after migration
    clearGuestCart()
  } catch (error) {
    console.error("Error migrating guest cart:", error)
    throw error
  }
}

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching cart items:", error)
      throw error
    }

    return cartItems || []
  } catch (error) {
    console.error("Error in getCartItems:", error)
    throw error
  }
}

export const addToCart = async (userId: string, productId: string, quantity = 1, weightInGrams?: number): Promise<void> => {
  try {
    // Check if item already exists in cart
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing cart item:", fetchError)
      throw fetchError
    }

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity
      const newWeightInGrams = (existingItem.weight_in_grams || 0) + (weightInGrams || 0)
      
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ 
          quantity: newQuantity,
          weight_in_grams: newWeightInGrams
        })
        .eq("id", existingItem.id)

      if (updateError) {
        console.error("Error updating cart item:", updateError)
        throw updateError
      }
    } else {
      // Add new item
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity,
        weight_in_grams: weightInGrams || 0,
      })

      if (insertError) {
        console.error("Error adding cart item:", insertError)
        throw insertError
      }
    }
  } catch (error) {
    console.error("Error in addToCart:", error)
    throw error
  }
}

export const updateCartItem = async (cartItemId: string, quantity: number, weightInGrams?: number): Promise<void> => {
  try {
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    const updateData: any = { quantity }
    if (weightInGrams !== undefined) {
      updateData.weight_in_grams = weightInGrams
    }

    const { error } = await supabase.from("cart_items").update(updateData).eq("id", cartItemId)

    if (error) {
      console.error("Error updating cart item:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in updateCartItem:", error)
    throw error
  }
}

export const removeFromCart = async (cartItemId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

    if (error) {
      console.error("Error removing cart item:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in removeFromCart:", error)
    throw error
  }
}

export const clearCart = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in clearCart:", error)
    throw error
  }
}

export const getCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)
}

export const getCartItemCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((count, item) => count + item.quantity, 0)
}
