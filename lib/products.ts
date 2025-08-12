import { supabase, type Product, type Category } from "./supabase"

export const getProducts = async (filters?: {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
}) => {
  let query = supabase
    .from("products")
    .select(`
      *,
      categories!products_category_id_fkey (
        id,
        name,
        description
      )
    `)
    .eq("is_active", true)

  if (filters?.category) {
    query = query.eq("category_id", filters.category)
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  if (filters?.featured) {
    query = query.eq("is_featured", true)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data as Product[]
}

export const getProduct = async (id: string) => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!products_category_id_fkey (
        id,
        name,
        description
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) throw error
  return data as Product
}

export const getCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) throw error
  return data as Category[]
}

export const getFeaturedProducts = async (limit = 8) => {
  return getProducts({ featured: true, limit })
}

export const searchProducts = async (query: string) => {
  return getProducts({ search: query })
}
