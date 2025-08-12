"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeightInput } from "@/components/weight-input"

export function WeightInputDemo() {
  const [weightInGrams, setWeightInGrams] = useState(500)
  const [pricePerKg, setPricePerKg] = useState(50)

  const totalPrice = (weightInGrams / 1000) * pricePerKg

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Weight Input Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Price per kg
            </label>
            <input
              type="number"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
            />
          </div>

          <WeightInput
            value={weightInGrams}
            onChange={setWeightInGrams}
            minWeight={50}
            maxWeight={5000}
            step={50}
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Price:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {weightInGrams >= 1000 
                ? `${(weightInGrams / 1000).toFixed(2)} kg` 
                : `${weightInGrams} g`
              } × ₹{pricePerKg.toFixed(2)} per kg
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Features demonstrated:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Dual unit support (g/kg)</li>
              <li>Decimal value handling</li>
              <li>Real-time price calculation</li>
              <li>Increment/decrement controls</li>
              <li>Input validation</li>
              <li>User-friendly formatting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
