"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus } from "lucide-react"

interface WeightInputProps {
  value: number // Value in grams
  onChange: (value: number) => void
  minWeight?: number // Minimum weight in grams
  maxWeight?: number // Maximum weight in grams
  step?: number // Step increment in grams
  disabled?: boolean
  className?: string
}

export function WeightInput({
  value,
  onChange,
  minWeight = 50, // 50g minimum
  maxWeight = 10000, // 10kg maximum
  step = 50, // 50g steps
  disabled = false,
  className = ""
}: WeightInputProps) {
  const [displayValue, setDisplayValue] = useState("")
  const [unit, setUnit] = useState<"g" | "kg">("g")

  // Convert grams to display value based on unit
  const gramsToDisplay = (grams: number, targetUnit: "g" | "kg"): string => {
    if (targetUnit === "kg") {
      return (grams / 1000).toFixed(3).replace(/\.?0+$/, "") // Remove trailing zeros
    }
    return grams.toString()
  }

  // Convert display value to grams
  const displayToGrams = (displayVal: string, targetUnit: "g" | "kg"): number => {
    const numValue = parseFloat(displayVal) || 0
    return targetUnit === "kg" ? numValue * 1000 : numValue
  }

  // Initialize display value
  useEffect(() => {
    setDisplayValue(gramsToDisplay(value, unit))
  }, [value, unit])

  // Handle unit change
  const handleUnitChange = (newUnit: "g" | "kg") => {
    setUnit(newUnit)
    setDisplayValue(gramsToDisplay(value, newUnit))
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value
    setDisplayValue(newDisplayValue)
    
    const newGrams = displayToGrams(newDisplayValue, unit)
    if (newGrams >= minWeight && newGrams <= maxWeight) {
      onChange(newGrams)
    }
  }

  // Handle increment/decrement
  const handleIncrement = () => {
    const newGrams = Math.min(value + step, maxWeight)
    onChange(newGrams)
  }

  const handleDecrement = () => {
    const newGrams = Math.max(value - step, minWeight)
    onChange(newGrams)
  }

  // Handle blur to validate and format
  const handleBlur = () => {
    const newGrams = displayToGrams(displayValue, unit)
    const clampedGrams = Math.max(minWeight, Math.min(newGrams, maxWeight))
    onChange(clampedGrams)
    setDisplayValue(gramsToDisplay(clampedGrams, unit))
  }

  // Format weight for display
  const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`
    }
    return `${grams} g`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        Weight Selection
      </Label>
      
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={disabled || value <= minWeight}
          className="h-10 w-10 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 flex items-center gap-2">
          <Input
            type="number"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="text-center"
            min={unit === "kg" ? minWeight / 1000 : minWeight}
            max={unit === "kg" ? maxWeight / 1000 : maxWeight}
            step={unit === "kg" ? step / 1000 : step}
            placeholder={unit === "kg" ? "0.5" : "500"}
          />
          
          <Select value={unit} onValueChange={(value: "g" | "kg") => handleUnitChange(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={disabled || value >= maxWeight}
          className="h-10 w-10 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        {formatWeight(value)} selected
        {minWeight > 0 && (
          <span className="block">
            Min: {formatWeight(minWeight)} | Max: {formatWeight(maxWeight)}
          </span>
        )}
      </div>
    </div>
  )
}
