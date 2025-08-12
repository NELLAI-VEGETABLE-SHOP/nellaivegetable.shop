-- =====================================================
-- ADD WEIGHT SUPPORT TO CART ITEMS
-- =====================================================
-- This migration adds weight_in_grams column to cart_items table
-- to support custom weight-based quantities

-- Add weight_in_grams column to cart_items table
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS weight_in_grams INTEGER DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN cart_items.weight_in_grams IS 'Weight in grams for weight-based products (e.g., vegetables, fruits)';

-- Update existing cart items to have default weight values
-- Assuming existing quantities are in kg, convert to grams
UPDATE cart_items 
SET weight_in_grams = quantity * 1000 
WHERE weight_in_grams = 0 AND quantity > 0;

-- Create index for better performance on weight queries
CREATE INDEX IF NOT EXISTS idx_cart_items_weight ON cart_items(weight_in_grams);

-- Add check constraint to ensure weight is non-negative
ALTER TABLE cart_items 
ADD CONSTRAINT check_weight_positive 
CHECK (weight_in_grams >= 0);
