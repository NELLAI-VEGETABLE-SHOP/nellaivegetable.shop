"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getOrder } from "@/lib/orders"
import type { Order } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface OrderPageProps {
  params: {
    id: string
  }
}

export default function OrderPage({ params }: OrderPageProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadOrder(params.id, user.id)
      } else {
        router.push("/auth/signin")
      }
    })
  }, [params.id, router])

  const loadOrder = async (orderId: string, userId: string) => {
    try {
      const orderData = await getOrder(orderId, userId)
      setOrder(orderData)
    } catch (error) {
      console.error("Error loading order:", error)
      toast({
        title: "Error loading order",
        description: "Order not found or you don't have permission to view it.",
        variant: "destructive",
      })
      router.push("/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "confirmed":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <div className="bg-gray-200 h-6 rounded mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-16 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-6">
              <div className="bg-gray-200 h-6 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-4 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const deliveryAddress = order.delivery_address

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.order_number}</h1>
            <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Items */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <Image
                    src={item.products?.image_url || "/placeholder.svg?height=60&width=60"}
                    alt={item.products?.name || "Product"}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.products?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantity} {item.products?.unit}
                      {item.quantity > 1 ? "s" : ""} × ₹{item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary & Delivery Info */}
        <div className="space-y-6">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{deliveryAddress.full_name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {deliveryAddress.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    {deliveryAddress.address_line_1}
                    {deliveryAddress.address_line_2 && <>, {deliveryAddress.address_line_2}</>}
                  </p>
                  <p className="text-sm text-gray-700">
                    {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postal_code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="capitalize">{order.payment_method.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    {order.payment_status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>+91 9884388147</span>
                </p>
                <p className="text-gray-600">Call us for any order-related queries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
