# Weight Input Feature

## Overview

The weight input feature allows users to select custom quantities for products using weight-based measurements (grams and kilograms) instead of just whole units. This is particularly useful for fresh produce like vegetables and fruits where customers need precise weight amounts.

## Features

### 1. Weight Input Component (`components/weight-input.tsx`)

- **Dual Unit Support**: Users can input weights in both grams (g) and kilograms (kg)
- **Decimal Support**: Handles decimal values (e.g., 250g, 1.5kg)
- **Increment/Decrement Buttons**: Easy +/- controls with configurable step sizes
- **Input Validation**: Ensures weights stay within min/max bounds
- **Real-time Conversion**: Automatically converts between units
- **User-friendly Display**: Shows formatted weight (e.g., "1.5 kg" or "500 g")

### 2. Product Detail Page Integration

- **Replaces Quantity Selector**: The traditional quantity selector is replaced with the weight input
- **Dynamic Pricing**: Total price updates in real-time based on selected weight
- **Stock Validation**: Ensures selected weight doesn't exceed available stock
- **Default Weight**: Starts with 500g as the default selection

### 3. Cart Integration

- **Weight Display**: Shows selected weight for each cart item
- **Weight Editing**: Users can modify weights directly in the cart
- **Backward Compatibility**: Still supports traditional quantity-based items
- **Price Calculation**: Calculates total based on weight × price per unit

## Database Changes

### New Column: `weight_in_grams`

Added to the `cart_items` table:
- **Type**: INTEGER
- **Default**: 0
- **Constraint**: Non-negative values only
- **Index**: Created for performance

### Migration Script

Run `scripts/add-weight-support.sql` to:
1. Add the `weight_in_grams` column
2. Update existing cart items with default values
3. Create necessary indexes and constraints

## Usage Examples

### Basic Weight Input
```tsx
<WeightInput
  value={weightInGrams}
  onChange={setWeightInGrams}
  minWeight={50}
  maxWeight={5000}
  step={50}
/>
```

### Product Detail Integration
```tsx
<WeightInput
  value={weightInGrams}
  onChange={setWeightInGrams}
  minWeight={50}
  maxWeight={product.stock_quantity * 1000}
  step={50}
  disabled={product.stock_quantity <= 0}
/>
```

## Configuration Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | - | Current weight in grams |
| `onChange` | function | - | Callback when weight changes |
| `minWeight` | number | 50 | Minimum weight in grams |
| `maxWeight` | number | 10000 | Maximum weight in grams |
| `step` | number | 50 | Increment step in grams |
| `disabled` | boolean | false | Disable the input |
| `className` | string | "" | Additional CSS classes |

## Weight Formatting

The component automatically formats weights for display:
- **< 1000g**: Shows as grams (e.g., "500 g")
- **≥ 1000g**: Shows as kilograms (e.g., "1.5 kg")

## Price Calculation

Total price is calculated as:
```
Total = (Weight in kg) × (Price per unit)
```

For example:
- Product price: ₹50 per kg
- Selected weight: 750g (0.75 kg)
- Total: ₹50 × 0.75 = ₹37.50

## Backward Compatibility

- Existing cart items without weight data still work
- Traditional quantity-based products continue to function
- Guest cart functionality remains unchanged
- Database migration handles existing data gracefully

## Future Enhancements

1. **Unit Preferences**: Save user's preferred weight unit
2. **Quick Presets**: Common weight presets (250g, 500g, 1kg)
3. **Bulk Operations**: Weight input for multiple items
4. **Weight History**: Remember previous weight selections
5. **Smart Suggestions**: Suggest weights based on typical usage

## Testing

To test the feature:

1. **Database Migration**: Run the SQL migration script
2. **Product Selection**: Go to any product detail page
3. **Weight Input**: Try different weights and units
4. **Cart Addition**: Add items to cart and verify weight display
5. **Cart Editing**: Modify weights in the cart
6. **Price Calculation**: Verify total prices are correct

## Troubleshooting

### Common Issues

1. **Weight not saving**: Ensure database migration is complete
2. **Price calculation errors**: Check that weight is in grams and price per unit is correct
3. **Unit conversion issues**: Verify the conversion logic in the component
4. **Stock validation**: Ensure stock quantities are properly set in the database

### Debug Information

- Check browser console for any JavaScript errors
- Verify database column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'weight_in_grams';`
- Test weight input component in isolation
