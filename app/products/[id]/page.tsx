"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductCard from "@/components/product-card"
import { WeightInput } from "@/components/weight-input"
import { getProduct, getProducts } from "@/lib/products-fixed"
import { addToCart } from "@/lib/cart-fixed"
import type { Product } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [weightInGrams, setWeightInGrams] = useState(500) // Default 500g
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      const productData = await getProduct(productId)
      setProduct(productData)

      // Load related products from same category
      if (productData.category_id) {
        const related = await getProducts({
          category: productData.category_id,
          limit: 4,
        })
        setRelatedProducts(related.filter((p) => p.id !== productId))
      }

      // Check if product is in wishlist
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .single()

        setIsWishlisted(!!data)
      }
    } catch (error) {
      console.error("Error loading product:", error)
      toast({
        title: "Product not found",
        description: "The product you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart.",
        variant: "destructive",
      })
      return
    }

    // Convert weight to quantity based on product unit
    const weightInKg = weightInGrams / 1000
    const quantity = weightInKg // For now, assuming 1 unit = 1kg

    // Check stock availability (assuming stock is in kg)
    if (product.stock_quantity < weightInKg) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stock_quantity} ${product.unit}s available.`,
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)
    try {
      await addToCart(user.id, product.id, quantity, weightInGrams)
      toast({
        title: "Added to cart",
        description: `${formatWeight(weightInGrams)} of ${product.name} added to cart.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Helper function to format weight
  const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`
    }
    return `${grams} g`
  }

  const handleWishlist = async () => {
    if (!product) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to wishlist.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isWishlisted) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id)

        setIsWishlisted(false)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        await supabase.from("wishlist").insert([{ user_id: user.id, product_id: product.id }])

        setIsWishlisted(true)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-32 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              <div className="bg-gray-200 h-6 rounded w-1/3"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
              <div className="bg-gray-200 h-12 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-green-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-green-600">
          Products
        </Link>
        <span>/</span>
        {product.categories && (
          <>
            <Link href={`/products?category=${product.categories.id}`} className="hover:text-green-600">
              {product.categories.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg border">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-96 lg:h-[500px] object-cover"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-green-600 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <Badge variant="destructive">Low Stock</Badge>
              )}
              {product.stock_quantity <= 0 && <Badge variant="secondary">Out of Stock</Badge>}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-gray-600">(24 reviews)</span>
              </div>
              {product.categories && <Badge variant="outline">{product.categories.name}</Badge>}
            </div>
            <p className="text-gray-600 text-lg">{product.description}</p>
          </div>

          {/* Price */}
          <div className="border-t border-b py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">₹{product.price.toFixed(2)}</span>
              <span className="text-gray-500">per {product.unit}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Stock: {product.stock_quantity} {product.unit}s available
            </p>
          </div>

          {/* Weight Selection */}
          <div className="space-y-4">
            <WeightInput
              value={weightInGrams}
              onChange={setWeightInGrams}
              minWeight={50} // 50g minimum
              maxWeight={product.stock_quantity * 1000} // Convert stock to grams
              step={50} // 50g steps
              disabled={product.stock_quantity <= 0}
            />

            {/* Total Price */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{((product.price * weightInGrams) / 1000).toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {formatWeight(weightInGrams)} × ₹{product.price.toFixed(2)} per {product.unit}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_quantity <= 0}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
            >
              {isAddingToCart ? (
                "Adding to Cart..."
              ) : product.stock_quantity <= 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>

            <Button variant="outline" onClick={handleWishlist} className="w-full h-12 bg-transparent">
              <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-4 w-4 text-green-600" />
              <span>Free delivery on ₹500+</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Quality guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw className="h-4 w-4 text-green-600" />
              <span>Easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Unit:</strong> {product.unit}
                  </p>
                  <p>
                    <strong>Category:</strong> {product.categories?.name}
                  </p>
                  <p>
                    <strong>Stock:</strong> {product.stock_quantity} {product.unit}s available
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {product.nutritional_info ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(product.nutritional_info).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 capitalize">{key.replace("_", " ")}</p>
                        <p className="font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nutritional information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">4.5</div>
                      <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">24 reviews</div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-2">{rating}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {rating === 5 ? "17" : rating === 4 ? "5" : "2"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Priya S.",
                        rating: 5,
                        date: "2 days ago",
                        comment: "Excellent quality vegetables! Always fresh and delivered on time.",
                      },
                      {
                        name: "Rajesh K.",
                        rating: 4,
                        date: "1 week ago",
                        comment: "Good quality and reasonable price. Will order again.",
                      },
                      {
                        name: "Meera D.",
                        rating: 5,
                        date: "2 weeks ago",
                        comment: "Best vegetable shop in the area. Highly recommended!",
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
