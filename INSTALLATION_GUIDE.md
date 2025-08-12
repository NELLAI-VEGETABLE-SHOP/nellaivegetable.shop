# Weight Input Feature Installation Guide

## Prerequisites

- Next.js application with Supabase integration
- Existing cart functionality
- TypeScript support

## Installation Steps

### 1. Database Migration

Run the database migration script to add weight support:

```sql
-- Execute this in your Supabase SQL Editor
-- File: scripts/add-weight-support.sql

ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS weight_in_grams INTEGER DEFAULT 0;

COMMENT ON COLUMN cart_items.weight_in_grams IS 'Weight in grams for weight-based products (e.g., vegetables, fruits)';

UPDATE cart_items 
SET weight_in_grams = quantity * 1000 
WHERE weight_in_grams = 0 AND quantity > 0;

CREATE INDEX IF NOT EXISTS idx_cart_items_weight ON cart_items(weight_in_grams);

ALTER TABLE cart_items 
ADD CONSTRAINT check_weight_positive 
CHECK (weight_in_grams >= 0);
```

### 2. Component Installation

The weight input component is already created at `components/weight-input.tsx`. No additional installation needed.

### 3. Type Updates

The `CartItem` interface in `lib/supabase.ts` has been updated to include:

```typescript
export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  weight_in_grams?: number  // New field
  created_at: string
  products?: Product
}
```

### 4. Cart Function Updates

The cart functions in `lib/cart-fixed.ts` have been updated to support weight:

- `addToCart()` now accepts an optional `weightInGrams` parameter
- `updateCartItem()` now accepts an optional `weightInGrams` parameter

### 5. Page Updates

The following pages have been updated:

- **Product Detail Page** (`app/products/[id]/page.tsx`): Replaced quantity selector with weight input
- **Cart Page** (`app/cart/page.tsx`): Added weight display and editing capabilities

## Testing the Installation

### 1. Database Verification

Check that the migration was successful:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cart_items' AND column_name = 'weight_in_grams';
```

### 2. Component Testing

Test the weight input component:

```tsx
import { WeightInput } from "@/components/weight-input"

function TestComponent() {
  const [weight, setWeight] = useState(500)
  
  return (
    <WeightInput
      value={weight}
      onChange={setWeight}
      minWeight={50}
      maxWeight={5000}
      step={50}
    />
  )
}
```

### 3. Product Page Testing

1. Navigate to any product detail page
2. Verify the weight input appears instead of quantity selector
3. Test different weight values and units
4. Verify price calculation updates correctly

### 4. Cart Testing

1. Add a product to cart with custom weight
2. Verify weight is displayed in cart
3. Test editing weight directly in cart
4. Verify total price calculations

## Configuration Options

### Default Values

- **Minimum Weight**: 50g
- **Maximum Weight**: 10kg (10000g)
- **Step Size**: 50g
- **Default Weight**: 500g

### Customization

You can customize these values in the component props:

```tsx
<WeightInput
  value={weightInGrams}
  onChange={setWeightInGrams}
  minWeight={100}    // Custom minimum
  maxWeight={2000}   // Custom maximum
  step={25}          // Custom step size
  disabled={false}   // Disable if needed
/>
```

## Troubleshooting

### Common Issues

1. **Weight not saving to database**
   - Ensure migration script was executed
   - Check database permissions
   - Verify cart functions are updated

2. **Price calculation errors**
   - Verify weight is in grams
   - Check product price per unit
   - Ensure conversion logic is correct

3. **Component not rendering**
   - Check import paths
   - Verify TypeScript compilation
   - Check for missing dependencies

4. **Unit conversion issues**
   - Test with known values
   - Verify conversion logic in component
   - Check for rounding errors

### Debug Commands

```sql
-- Check if weight column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'cart_items' AND column_name = 'weight_in_grams';

-- Check existing cart items
SELECT id, quantity, weight_in_grams FROM cart_items LIMIT 5;

-- Test weight constraint
INSERT INTO cart_items (user_id, product_id, quantity, weight_in_grams) 
VALUES ('test', 'test', 1, -100); -- Should fail
```

## Rollback Plan

If you need to rollback the changes:

1. **Remove weight column**:
```sql
ALTER TABLE cart_items DROP COLUMN IF EXISTS weight_in_grams;
DROP INDEX IF EXISTS idx_cart_items_weight;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS check_weight_positive;
```

2. **Revert component changes**: Restore original quantity selector in product pages

3. **Revert cart functions**: Remove weight parameters from cart functions

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the `WEIGHT_INPUT_FEATURE.md` documentation
3. Test with the demo component in `components/weight-input-demo.tsx`
4. Verify database schema matches expected structure
