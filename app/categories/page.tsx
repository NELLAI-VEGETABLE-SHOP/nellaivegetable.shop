"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getCategories } from "@/lib/products-fixed"
import type { Category } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (error) {
        console.error("Error loading categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
        <p className="text-gray-600">
          Explore our wide range of fresh vegetables, fruits, and herbs.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-300 h-full">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center">
                  <img
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    className="w-24 h-24 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
