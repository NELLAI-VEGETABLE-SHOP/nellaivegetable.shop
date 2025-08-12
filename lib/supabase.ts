import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("categories").select("count").limit(1)
    if (error) {
      console.error("Database connection test failed:", error)
      return false
    }
    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection test error:", error)
    return false
  }
}

// Types
export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  category_id: string
  image_url?: string
  is_featured?: boolean
  is_active?: boolean
  stock_quantity?: number
  nutritional_info?: any
  created_at: string
  categories?: Category
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  weight_in_grams?: number
  created_at: string
  products?: Product
}

export interface Address {
  id?: string
  user_id?: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  is_default?: boolean
  created_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  products?: Product
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: string
  total_amount: number
  payment_method: string
  payment_status: string
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address: any
  notes?: string
  razorpay_payment_id?: string
  razorpay_order_id?: string
  created_at: string
  order_items?: OrderItem[]
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  created_at: string
}
