import { supabase, type Product, type Category } from "./supabase"

export const getProducts = async (filters?: {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
}) => {
  let query = supabase.from("products").select("*").eq("is_active", true)

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

  const { data: products, error } = await query

  if (error) throw error

  // Manually fetch categories for each product
  if (products && products.length > 0) {
    const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))]

    if (categoryIds.length > 0) {
      const { data: categories } = await supabase.from("categories").select("*").in("id", categoryIds)

      // Attach category data to products
      const productsWithCategories = products.map((product) => ({
        ...product,
        categories: categories?.find((cat) => cat.id === product.category_id) || null,
      }))

      return productsWithCategories as Product[]
    }
  }

  return (products || []).map((product) => ({ ...product, categories: null })) as Product[]
}

export const getProduct = async (id: string) => {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error) throw error

  // Fetch category separately
  if (product.category_id) {
    const { data: category } = await supabase.from("categories").select("*").eq("id", product.category_id).single()

    return { ...product, categories: category } as Product
  }

  return { ...product, categories: null } as Product
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
