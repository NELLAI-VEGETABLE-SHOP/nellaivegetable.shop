import Link from "next/link"
import { Leaf, Phone, Mail, MapPin, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Nellai</h3>
                <p className="text-sm text-green-400 -mt-1">Vegetable Shop</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Fresh vegetables and fruits delivered to your doorstep. Quality produce for healthy living.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="space-y-2">
              <Link href="/products" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                All Products
              </Link>
              <Link href="/categories" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Categories
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Customer Service</h4>
            <nav className="space-y-2">
              <Link href="/profile" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                My Account
              </Link>
              <Link href="/orders" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Order History
              </Link>
              <Link href="/cart" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Shopping Cart
              </Link>
              <Link href="/help" className="block text-gray-300 hover:text-green-400 transition-colors text-sm">
                Help & FAQ
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p>Old No.11, Kamarajapuram Main Rd,</p>
                  <p>Kamarajapuram, Gowriwakkam,</p>
                  <p>Sembakkam, Chennai,</p>
                  <p>Tamil Nadu 600073</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-400" />
                <a href="tel:+919884388147" className="text-sm text-gray-300 hover:text-green-400 transition-colors">
                  +91 9884388147
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-green-400" />
                <a
                  href="mailto:nellaivegetableshop@gmail.com"
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors"
                >
                  nellaivegetableshop@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-green-400" />
                <div className="text-sm text-gray-300">
                  <p>Mon - Sat: 6:00 AM - 9:00 PM</p>
                  <p>Sunday: 7:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">© 2024 Nellai Vegetable Shop. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
