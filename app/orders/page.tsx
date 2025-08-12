"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Calendar, MapPin, Phone, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUserOrders } from "@/lib/orders"
import type { Order } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadOrders(user.id)
      } else {
        setIsLoading(false)
      }
    })
  }, [])

  const loadOrders = async (userId: string) => {
    try {
      const ordersData = await getUserOrders(userId)
      setOrders(ordersData)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Error loading orders",
        description: "Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to sign in to view your orders.</p>
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
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="bg-gray-200 h-3 w-24 rounded"></div>
                  </div>
                  <div className="bg-gray-200 h-6 w-20 rounded"></div>
                </div>
                <div className="bg-gray-200 h-16 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700">Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {order.order_items?.length || 0} items
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Order Items Preview */}
              <div className="space-y-3 mb-4">
                {order.order_items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      src={item.products?.image_url || "/placeholder.svg"}
                      alt={item.products?.name || "Product"}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.products?.name}</p>
                      <p className="text-xs text-gray-600">
                        Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium">₹{item.total_price.toFixed(2)}</div>
                  </div>
                ))}
                {(order.order_items?.length || 0) > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{(order.order_items?.length || 0) - 3} more items
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* Delivery Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{order.delivery_address.full_name}</p>
                    <p>{order.delivery_address.address_line_1}</p>
                    {order.delivery_address.address_line_2 && <p>{order.delivery_address.address_line_2}</p>}
                    <p>
                      {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Contact
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>{order.delivery_address.phone}</p>
                    <p className="capitalize">Payment: {order.payment_method.replace("_", " ")}</p>
                    <p className="capitalize">Status: {order.payment_status}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Order Total */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {order.notes && (
                    <p>
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">Total: ₹{order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
