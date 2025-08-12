"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Truck, Shield, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductCard from "@/components/product-card"
import { getFeaturedProducts, getCategories } from "@/lib/products-fixed"
import type { Product, Category } from "@/lib/supabase"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [products, cats] = await Promise.all([getFeaturedProducts(8), getCategories()])
      setFeaturedProducts(products)
      setCategories(cats)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-green-600 text-white px-4 py-2">Fresh & Organic</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Vegetables
                <span className="text-green-600"> Delivered</span>
                <br />
                to Your Door
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Get the freshest vegetables and fruits from Nellai Vegetable Shop. Quality produce, competitive prices,
                and convenient home delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img
                  src="/nellai.jpg?height=400&width=400"
                  alt="Fresh vegetables basket"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-green-100 hover:border-green-300 transition-colors">
              <CardContent className="p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
                <p className="text-gray-600">Free delivery on orders above ₹500 within Chennai</p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-100 hover:border-green-300 transition-colors">
              <CardContent className="p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
                <p className="text-gray-600">Fresh produce sourced directly from local farms</p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-100 hover:border-green-300 transition-colors">
              <CardContent className="p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Same Day Delivery</h3>
                <p className="text-gray-600">Order before 2 PM for same day delivery</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of fresh vegetables, fruits, and herbs
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-300">
                    <CardContent className="p-6 text-center">
                      <img
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        className="w-24 h-24 mx-auto mb-4 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/categories">
              <Button variant="outline" size="lg">
                View All Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked fresh produce that our customers love most
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onCartUpdate={loadData} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/products">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                location: "Sembakkam",
                rating: 5,
                comment:
                  "Amazing quality vegetables! Always fresh and delivered on time. The online ordering is so convenient.",
              },
              {
                name: "Rajesh Kumar",
                location: "Gowriwakkam",
                rating: 5,
                comment:
                  "Best vegetable shop in the area. Great prices and excellent customer service. Highly recommended!",
              },
              {
                name: "Meera Devi",
                location: "Kamarajapuram",
                rating: 5,
                comment:
                  "I've been ordering from Nellai Vegetable Shop for months. Never disappointed with the quality and freshness.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Shopping?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Nellai Vegetable Shop for their daily fresh produce needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent"
              >
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
