import { supabase } from "./supabase"
import type { CartItem, Address, Order } from "./supabase"

export const createOrder = async (
  userId: string,
  cartItems: CartItem[],
  address: Address,
  paymentMethod: string,
  notes?: string,
  razorpayPaymentId?: string,
  razorpayOrderId?: string,
): Promise<Order> => {
  try {
    // Save address to addresses table
    try {
      const { error: addressError } = await supabase.from("addresses").insert({
        ...address,
        user_id: userId,
      })
      if (addressError) {
        console.error("Error saving address:", addressError)
        // Do not block order creation if address saving fails
      }
    } catch (error) {
      console.error("Error in address saving block:", error)
    }

    console.log("Creating order for user:", userId)
    console.log("Cart items:", cartItems)
    console.log("Address:", address)
    console.log("Payment method:", paymentMethod)

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
    const deliveryFee = subtotal >= 500 ? 0 : 50
    const total = subtotal + deliveryFee

    // Generate order number
    const orderNumber = `NVS${Date.now()}`

    // Determine payment status
    const paymentStatus = paymentMethod === "online" && razorpayPaymentId ? "paid" : "pending"

    // Create order
    const orderData = {
      user_id: userId,
      order_number: orderNumber,
      status: "confirmed",
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      delivery_address: {
        full_name: address.full_name,
        phone: address.phone,
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
      },
      notes: notes || null,
      razorpay_payment_id: razorpayPaymentId || null,
      razorpay_order_id: razorpayOrderId || null,
    }

    console.log("Order data:", orderData)

    const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    console.log("Order created:", order)

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.products?.price || 0,
      total_price: (item.products?.price || 0) * item.quantity,
    }))

    console.log("Creating order items:", orderItems)

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Rollback order creation
      await supabase.from("orders").delete().eq("id", order.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    console.log("Order items created successfully")

    // Clear cart
    const { error: cartError } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (cartError) {
      console.error("Error clearing cart:", cartError)
      // Don't fail the order for cart clearing issues
    } else {
      console.log("Cart cleared successfully")
    }

    return order
  } catch (error) {
    console.error("Error in createOrder:", error)
    throw error
  }
}

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw error
    }

    return orders || []
  } catch (error) {
    console.error("Error in getUserOrders:", error)
    throw error
  }
}

export const getOrder = async (orderId: string, userId: string): Promise<Order | null> => {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq("id", orderId)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Order not found
      }
      console.error("Error fetching order:", error)
      throw error
    }

    return order
  } catch (error) {
    console.error("Error in getOrder:", error)
    throw error
  }
}
