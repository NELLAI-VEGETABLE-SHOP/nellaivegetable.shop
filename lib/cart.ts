import { supabase, type CartItem } from "./supabase"

export const getCartItems = async (userId: string) => {
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      products (
        id,
        name,
        price,
        image_url,
        stock_quantity,
        unit
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as CartItem[]
}

export const addToCart = async (userId: string, productId: string, quantity = 1) => {
  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  if (existingItem) {
    // Update quantity
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingItem.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Add new item
    const { data, error } = await supabase
      .from("cart_items")
      .insert([
        {
          user_id: userId,
          product_id: productId,
          quantity,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const updateCartItem = async (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    return removeFromCart(itemId)
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeFromCart = async (itemId: string) => {
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

  if (error) throw error
}

export const clearCart = async (userId: string) => {
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error) throw error
}

export const getCartTotal = (cartItems: CartItem[]) => {
  return cartItems.reduce((total, item) => {
    return total + (item.products?.price || 0) * item.quantity
  }, 0)
}

export const getCartItemCount = (cartItems: CartItem[]) => {
  return cartItems.reduce((count, item) => count + item.quantity, 0)
}
