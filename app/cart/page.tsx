"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { WeightInput } from "@/components/weight-input"
import { 
  getCartItems, 
  updateCartItem, 
  removeFromCart, 
  getCartTotal, 
  getCartItemCount,
  getGuestCartItems,
  updateGuestCartItem,
  removeFromGuestCart,
  getGuestCartTotal,
  getGuestCartItemCount
} from "@/lib/cart-fixed"
import type { CartItem } from "@/lib/supabase"
import type { GuestCartItem } from "@/lib/cart-fixed"
import { useAuth } from "@/components/auth-context"
import { toast } from "@/hooks/use-toast"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[] | GuestCartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadCart = async () => {
    try {
      if (user?.type === 'guest') {
        const items = getGuestCartItems()
        setCartItems(items)
      } else if (user?.type === 'authenticated') {
        const items = await getCartItems(user.id)
        setCartItems(items)
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      toast({
        title: "Error loading cart",
        description: "Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number, weightInGrams?: number) => {
    try {
      if (user?.type === 'guest') {
        await updateGuestCartItem(itemId, newQuantity)
      } else if (user?.type === 'authenticated') {
        await updateCartItem(itemId, newQuantity, weightInGrams)
      }
      
      await loadCart()
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      })
    } catch (error) {
      console.error("Error updating cart:", error)
      toast({
        title: "Error updating cart",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateWeight = async (itemId: string, weightInGrams: number) => {
    try {
      if (user?.type === 'authenticated') {
        const weightInKg = weightInGrams / 1000
        await updateCartItem(itemId, weightInKg, weightInGrams)
      }
      
      await loadCart()
      toast({
        title: "Cart updated",
        description: "Item weight has been updated.",
      })
    } catch (error) {
      console.error("Error updating cart:", error)
      toast({
        title: "Error updating cart",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      if (user?.type === 'guest') {
        await removeFromGuestCart(itemId)
      } else if (user?.type === 'authenticated') {
        await removeFromCart(itemId)
      }
      
      await loadCart()
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      console.error("Error removing item:", error)
      toast({
        title: "Error removing item",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const getTotal = () => {
    if (user?.type === 'guest') {
      return getGuestCartTotal(cartItems as GuestCartItem[])
    } else {
      return getCartTotal(cartItems as CartItem[])
    }
  }

  const getItemCount = () => {
    if (user?.type === 'guest') {
      return getGuestCartItemCount(cartItems as GuestCartItem[])
    } else {
      return getCartItemCount(cartItems as CartItem[])
    }
  }

  // Helper function to format weight
  const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`
    }
    return `${grams} g`
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to sign in to view your shopping cart.</p>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full bg-green-600 hover:bg-green-700">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full bg-transparent">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="bg-gray-200 h-20 w-20 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      <div className="bg-gray-200 h-6 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border rounded-lg p-6 h-fit">
              <div className="bg-gray-200 h-6 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-8 rounded mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const total = getTotal()
  const itemCount = getItemCount()
  const deliveryFee = total >= 500 ? 0 : 50
  const finalTotal = total + deliveryFee

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some fresh vegetables and fruits to get started!</p>
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
          {user.type === 'guest' && (
            <span className="ml-2 text-sm text-orange-600">
              (Guest Mode - Sign in to save your cart)
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={item.products?.image_url || "/placeholder.svg"}
                        alt={item.products?.name || "Product"}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{item.products?.name}</h3>
                          <p className="text-sm text-gray-600">
                            ₹{item.products?.price.toFixed(2)} per {item.products?.unit}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Stock Status */}
                      {item.products && item.products.stock_quantity <= 5 && (
                        <Badge variant="destructive" className="mb-2">
                          {item.products.stock_quantity <= 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      )}

                      {/* Weight/Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {user?.type === 'authenticated' && (item as any).weight_in_grams ? (
                            <WeightInput
                              value={(item as any).weight_in_grams || 0}
                              onChange={(weightInGrams) => handleUpdateWeight(item.id, weightInGrams)}
                              minWeight={50}
                              maxWeight={(item.products?.stock_quantity || 0) * 1000}
                              step={50}
                              className="max-w-xs"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.products?.stock_quantity || 0)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm text-gray-500 ml-2">
                                {item.products?.unit}
                                {item.quantity > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{((item.products?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                          {user?.type === 'authenticated' && (item as any).weight_in_grams && (
                            <p className="text-sm text-gray-500">
                              {formatWeight((item as any).weight_in_grams)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              {total < 500 && (
                <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  Add ₹{(500 - total).toFixed(2)} more for free delivery!
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-12">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
