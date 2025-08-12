"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCartItems, getCartTotal, getCartItemCount } from "@/lib/cart-fixed"
import { createOrder } from "@/lib/orders"
import { createRazorpayOrder, verifyRazorpayPayment, loadRazorpayScript } from "@/lib/razorpay"
import type { CartItem, Address } from "@/lib/supabase"
import { supabase, testConnection } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string>("")

  // Form states
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "Chennai",
    state: "Tamil Nadu",
    postal_code: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    // Test database connection first
    testConnection().then((connected) => {
      if (!connected) {
        toast({
          title: "Database Connection Error",
          description: "Unable to connect to database. Please try again later.",
          variant: "destructive",
        })
        return
      }
    })

    // Load Razorpay script
    loadRazorpayScript()

    // Get user and load cart
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Auth error:", error)
        toast({
          title: "Authentication Error",
          description: "Please sign in again.",
          variant: "destructive",
        })
        router.push("/auth/signin")
        return
      }

      setUser(user)
      if (user) {
        loadCart(user.id)
        loadUserProfile(user.id)
      } else {
        router.push("/auth/signin")
      }
    })
  }, [router])

  const loadCart = async (userId: string) => {
    try {
      const items = await getCartItems(userId)
      if (items.length === 0) {
        toast({
          title: "Empty Cart",
          description: "Your cart is empty. Add some items first.",
          variant: "destructive",
        })
        router.push("/cart")
        return
      }
      setCartItems(items)
    } catch (error) {
      console.error("Error loading cart:", error)
      toast({
        title: "Error loading cart",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
      }

      if (profile) {
        setDeliveryAddress((prev) => ({
          ...prev,
          full_name: profile.full_name || "",
          phone: profile.phone || "",
        }))
      }

      // Load default address if exists
      const { data: defaultAddress, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .eq("is_default", true)
        .single()

      if (addressError && addressError.code !== "PGRST116") {
        console.error("Error loading address:", addressError)
      }

      if (defaultAddress) {
        setDeliveryAddress(defaultAddress)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleCODOrder = async () => {
    try {
      console.log("Processing COD order...")

      const order = await createOrder(user.id, cartItems, deliveryAddress, "cod", notes?.trim() || undefined)

      console.log("COD Order created successfully:", order)

      setPlacedOrderId(order.id)
      setOrderPlaced(true)

      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.order_number} has been placed.`,
      })
    } catch (error: any) {
      console.error("Error placing COD order:", error)
      throw error
    }
  }

  const handleOnlinePayment = async () => {
    try {
      console.log("Processing online payment...")

      const total = getCartTotal(cartItems)
      const deliveryFee = total >= 500 ? 0 : 50
      const finalTotal = total + deliveryFee

      // Create Razorpay order (server provides key_id)
      const razorpayOrder = await createRazorpayOrder(finalTotal, `order_${Date.now()}`)
      console.log("Razorpay order created:", razorpayOrder)

      const options = {
        key: razorpayOrder.key_id, // Use key_id from server response
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Nellai Vegetable Shop",
        description: "Fresh vegetables and fruits",
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            console.log("Payment response:", response)

            // Verify payment
            const verified = await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            )

            if (verified) {
              console.log("Payment verified successfully")

              // Create order with payment details
              const order = await createOrder(
                user.id,
                cartItems,
                deliveryAddress,
                "online",
                notes?.trim() || undefined,
                response.razorpay_payment_id,
                response.razorpay_order_id,
              )

              console.log("Online order created successfully:", order)

              setPlacedOrderId(order.id)
              setOrderPlaced(true)

              toast({
                title: "Payment successful!",
                description: `Your order #${order.order_number} has been placed and paid.`,
              })
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Error processing payment:", error)
            toast({
              title: "Payment processing failed",
              description: "Please try again or contact support.",
              variant: "destructive",
            })
          } finally {
            setIsPlacingOrder(false)
          }
        },
        prefill: {
          name: deliveryAddress.full_name,
          email: user.email,
          contact: deliveryAddress.phone,
        },
        notes: {
          address: `${deliveryAddress.address_line_1}, ${deliveryAddress.city}`,
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false)
            console.log("Payment modal dismissed")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("Error initiating online payment:", error)
      throw error
    }
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || cartItems.length === 0) {
      toast({
        title: "Invalid Order",
        description: "Please ensure you're logged in and have items in your cart.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (
      !deliveryAddress.full_name?.trim() ||
      !deliveryAddress.phone?.trim() ||
      !deliveryAddress.address_line_1?.trim() ||
      !deliveryAddress.postal_code?.trim()
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required delivery information.",
        variant: "destructive",
      })
      return
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(deliveryAddress.phone.replace(/\D/g, ""))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      })
      return
    }

    // Validate postal code
    const postalRegex = /^\d{6}$/
    if (!postalRegex.test(deliveryAddress.postal_code)) {
      toast({
        title: "Invalid postal code",
        description: "Please enter a valid 6-digit postal code.",
        variant: "destructive",
      })
      return
    }

    setIsPlacingOrder(true)

    try {
      if (paymentMethod === "cod") {
        await handleCODOrder()
      } else if (paymentMethod === "online") {
        await handleOnlinePayment()
      }
    } catch (error: any) {
      console.error("Error placing order:", error)

      let errorMessage = "Please try again."
      if (error.message) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      toast({
        title: "Error placing order",
        description: errorMessage,
        variant: "destructive",
      })
      setIsPlacingOrder(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully. Please check your order details in "My Orders" section.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push(`/orders/${placedOrderId}`)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                View Order Details
              </Button>
              <Button variant="outline" onClick={() => router.push("/orders")} className="w-full">
                Go to My Orders
              </Button>
              <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
                Continue Shopping
              </Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <div className="bg-gray-200 h-6 rounded mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 h-10 rounded"></div>
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

  const total = getCartTotal(cartItems)
  const itemCount = getCartItemCount(cartItems)
  const deliveryFee = total >= 500 ? 0 : 50
  const finalTotal = total + deliveryFee

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">
          Complete your order for {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter full name"
                        value={deliveryAddress.full_name || ""}
                        onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, full_name: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={deliveryAddress.phone || ""}
                        onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="address1"
                      type="text"
                      placeholder="Street address, building name"
                      value={deliveryAddress.address_line_1 || ""}
                      onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, address_line_1: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    type="text"
                    placeholder="Apartment, suite, unit (optional)"
                    value={deliveryAddress.address_line_2 || ""}
                    onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, address_line_2: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={deliveryAddress.city || "Chennai"}
                      onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      type="text"
                      value={deliveryAddress.state || "Tamil Nadu"}
                      onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">
                      Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="600073"
                      value={deliveryAddress.postal_code || ""}
                      onChange={(e) => setDeliveryAddress((prev) => ({ ...prev, postal_code: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Pay when your order arrives</p>
                        </div>
                        <Badge variant="secondary">Recommended</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Online Payment</p>
                          <p className="text-sm text-gray-600">Pay securely with UPI, Cards, Net Banking</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Secure
                        </Badge>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for delivery..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Image
                        src={item.products?.image_url || "/placeholder.svg?height=50&width=50"}
                        alt={item.products?.name || "Product"}
                        width={50}
                        height={50}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.products?.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} {item.products?.unit}
                          {item.quantity > 1 ? "s" : ""} × ₹{item.products?.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{((item.products?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
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
                    <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                      Add ₹{(500 - total).toFixed(2)} more for free delivery!
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>

                {paymentMethod === "online" && (
                  <Alert>
                    <AlertDescription>
                      You will be redirected to Razorpay for secure payment processing.
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12" disabled={isPlacingOrder}>
                  {isPlacingOrder
                    ? paymentMethod === "online"
                      ? "Processing Payment..."
                      : "Placing Order..."
                    : paymentMethod === "online"
                      ? "Pay Now"
                      : "Place Order"}
                </Button>

                <div className="text-xs text-gray-600 text-center">
                  By placing this order, you agree to our terms and conditions.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
