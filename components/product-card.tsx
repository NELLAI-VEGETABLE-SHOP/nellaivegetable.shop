"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/lib/supabase"
import { addToCart, addToGuestCart } from "@/lib/cart-fixed"
import { useAuth } from "@/components/auth-context"
import { toast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  onCartUpdate?: () => void
}

export default function ProductCard({ product, onCartUpdate }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { user } = useAuth()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart.",
        variant: "destructive",
      })
      return
    }

    if (product.stock_quantity <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (user.type === 'guest') {
        await addToGuestCart(product.id, 1)
      } else if (user.type === 'authenticated') {
        await addToCart(user.id, product.id, 1)
      }
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
      onCartUpdate?.()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || user.type !== 'authenticated') {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to wishlist.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist logic here
        setIsWishlisted(false)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        // Add to wishlist logic here
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

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-green-300">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
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

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-green-600">₹{product.price.toFixed(2)}</span>
                <span className="text-xs text-gray-500">per {product.unit}</span>
              </div>

              {product.categories && (
                <Badge variant="outline" className="text-xs">
                  {product.categories.name}
                </Badge>
              )}
            </div>

            {/* Stock Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>
                Stock: {product.stock_quantity} {product.unit}s
              </span>
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                <span>4.5 (24 reviews)</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock_quantity <= 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
          >
            {isLoading ? (
              "Adding..."
            ) : product.stock_quantity <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
