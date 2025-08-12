"use client"

import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get in touch with Nellai Vegetable Shop. We're here to help with your fresh produce needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {/* Address */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Visit Our Store</h3>
                      <div className="text-gray-600">
                        <p>Old No.11, Kamarajapuram Main Rd,</p>
                        <p>Kamarajapuram, Gowriwakkam,</p>
                        <p>Sembakkam, Chennai,</p>
                        <p>Tamil Nadu 600073</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                      <div className="text-gray-600">
                        <a href="tel:+919884388147" className="hover:text-green-600 transition-colors">
                          +91 9884388147
                        </a>
                        <p className="text-sm mt-1">Available during store hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                      <div className="text-gray-600">
                        <a
                          href="mailto:nellaivegetableshop@gmail.com"
                          className="hover:text-green-600 transition-colors"
                        >
                          nellaivegetableshop@gmail.com
                        </a>
                        <p className="text-sm mt-1">We'll respond within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Store Hours</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>
                          <strong>Monday - Saturday:</strong> 6:00 AM - 9:00 PM
                        </p>
                        <p>
                          <strong>Sunday:</strong> 7:00 AM - 8:00 PM
                        </p>
                        <p className="text-sm text-green-600 mt-2">Online orders accepted 24/7</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this regarding?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us how we can help you..." rows={5} />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Find Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">
                  Old No.11, Kamarajapuram Main Rd, Kamarajapuram,
                  <br />
                  Gowriwakkam, Sembakkam, Chennai, Tamil Nadu 600073
                </p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() =>
                    window.open(
                      "https://maps.google.com/?q=Old+No.11+Kamarajapuram+Main+Rd+Kamarajapuram+Gowriwakkam+Sembakkam+Chennai+Tamil+Nadu+600073",
                      "_blank",
                    )
                  }
                >
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Quick answers to common questions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: "What are your delivery areas?",
              answer: "We deliver within Chennai and surrounding areas. Free delivery on orders above ₹500.",
            },
            {
              question: "How fresh are your vegetables?",
              answer:
                "We source directly from local farms and ensure all produce is fresh daily. We guarantee quality.",
            },
            {
              question: "Can I return items if not satisfied?",
              answer: "Yes, we offer easy returns for quality issues. Contact us within 24 hours of delivery.",
            },
            {
              question: "Do you accept online payments?",
              answer: "Currently we accept Cash on Delivery. Online payment options will be available soon.",
            },
            {
              question: "What are your delivery timings?",
              answer: "We deliver from 8 AM to 8 PM. Same day delivery available for orders placed before 2 PM.",
            },
            {
              question: "How can I track my order?",
              answer: "You can track your order status in the 'My Orders' section after signing in to your account.",
            },
          ].map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
