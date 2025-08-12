"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Grid, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product-card"
import { getProducts, getCategories } from "@/lib/products-fixed"
import type { Product, Category } from "@/lib/supabase"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  useEffect(() => {
    loadData()
  }, [selectedCategory, searchQuery, sortBy])

  useEffect(() => {
    // Update search query from URL params
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    if (search) setSearchQuery(search)
    if (category) setSelectedCategory(category)
  }, [searchParams])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
        }),
        getCategories(),
      ])

      // Apply sorting
      let sortedProducts = [...productsData]
      switch (sortBy) {
        case "price-low":
          sortedProducts.sort((a, b) => a.price - b.price)
          break
        case "price-high":
          sortedProducts.sort((a, b) => b.price - a.price)
          break
        case "name":
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "featured":
          sortedProducts.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
          break
      }

      // Apply price filter
      sortedProducts = sortedProducts.filter(
        (product) => product.price >= priceRange[0] && product.price <= priceRange[1],
      )

      setProducts(sortedProducts)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSortBy("name")
    setPriceRange([0, 1000])
  }

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    sortBy !== "name",
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">Discover our fresh collection of vegetables, fruits, and herbs</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden bg-transparent">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && <Badge className="ml-2 bg-green-600">{activeFiltersCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Filter products by category, price, and more</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="price-low">Price (Low to High)</SelectItem>
                        <SelectItem value="price-high">Price (High to Low)</SelectItem>
                        <SelectItem value="featured">Featured First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                    Clear Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}
            {selectedCategory && (
              <Badge variant="secondary">Category: {categories.find((c) => c.id === selectedCategory)?.name}</Badge>
            )}
            {sortBy !== "name" && <Badge variant="secondary">Sort: {sortBy.replace("-", " ")}</Badge>}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">{isLoading ? "Loading..." : `Showing ${products.length} products`}</p>
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-4">
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-2"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2 mb-4"></div>
                <div className="bg-gray-200 h-10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onCartUpdate={loadData} />
          ))}
        </div>
      )}
    </div>
  )
}
