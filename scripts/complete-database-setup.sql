-- =====================================================
-- COMPLETE DATABASE SETUP FOR NELLAI VEGETABLE SHOP
-- =====================================================
-- This file contains all the SQL scripts needed to set up the complete database
-- Run this entire file in your Supabase SQL Editor to create all tables, data, and policies

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE ALL TABLES
-- =====================================================

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table with explicit foreign key name
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  nutritional_info JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table with all required columns
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =====================================================
-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on profiles" ON profiles;

CREATE POLICY "Enable all operations for authenticated users on profiles" ON profiles
FOR ALL USING (auth.uid() = id);

-- Addresses policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on addresses" ON addresses;

CREATE POLICY "Enable all operations for authenticated users on addresses" ON addresses
FOR ALL USING (auth.uid() = user_id);

-- Cart items policies
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on cart" ON cart_items;

CREATE POLICY "Enable all operations for authenticated users on cart" ON cart_items
FOR ALL USING (auth.uid() = user_id);

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on orders" ON orders;

CREATE POLICY "Enable all operations for authenticated users on orders" ON orders
FOR ALL USING (auth.uid() = user_id);

-- Order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Enable read access for order items" ON order_items;
DROP POLICY IF EXISTS "Enable insert for order items" ON order_items;

CREATE POLICY "Enable read access for order items" ON order_items
FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "Enable insert for order items" ON order_items
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Wishlist policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on wishlist" ON wishlist;

CREATE POLICY "Enable all operations for authenticated users on wishlist" ON wishlist
FOR ALL USING (auth.uid() = user_id);

-- Public read access for categories and products
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);

-- =====================================================
-- 6. INSERT SEED DATA
-- =====================================================

-- Insert categories
INSERT INTO categories (name, description, image_url) VALUES
('Leafy Greens', 'Fresh leafy vegetables rich in nutrients', '/placeholder.svg?height=200&width=200'),
('Root Vegetables', 'Underground vegetables packed with vitamins', '/placeholder.svg?height=200&width=200'),
('Seasonal Fruits', 'Fresh seasonal fruits for healthy living', '/placeholder.svg?height=200&width=200'),
('Herbs & Spices', 'Aromatic herbs and spices for cooking', '/placeholder.svg?height=200&width=200');

-- Insert products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, unit, nutritional_info, is_featured, is_active) VALUES
-- Leafy Greens
('Fresh Spinach', 'Organic spinach leaves, rich in iron and vitamins', 45.00, (SELECT id FROM categories WHERE name = 'Leafy Greens'), '/placeholder.svg?height=300&width=300', 50, 'bunch', '{"calories": 23, "protein": "2.9g", "fiber": "2.2g", "iron": "2.7mg"}', TRUE, TRUE),
('Lettuce', 'Crisp iceberg lettuce perfect for salads', 35.00, (SELECT id FROM categories WHERE name = 'Leafy Greens'), '/placeholder.svg?height=300&width=300', 30, 'head', '{"calories": 14, "protein": "0.9g", "fiber": "1.2g", "vitamin_c": "2.8mg"}', FALSE, TRUE),
('Kale', 'Nutrient-dense kale leaves, superfood for health', 55.00, (SELECT id FROM categories WHERE name = 'Leafy Greens'), '/placeholder.svg?height=300&width=300', 25, 'bunch', '{"calories": 35, "protein": "2.2g", "fiber": "4.1g", "vitamin_k": "547mcg"}', TRUE, TRUE),
('Methi Leaves', 'Fresh fenugreek leaves with unique flavor', 40.00, (SELECT id FROM categories WHERE name = 'Leafy Greens'), '/placeholder.svg?height=300&width=300', 35, 'bunch', '{"calories": 49, "protein": "4.4g", "fiber": "24.6g", "iron": "1.9mg"}', FALSE, TRUE),

-- Root Vegetables
('Carrots', 'Sweet and crunchy carrots, rich in beta-carotene', 60.00, (SELECT id FROM categories WHERE name = 'Root Vegetables'), '/placeholder.svg?height=300&width=300', 100, 'kg', '{"calories": 41, "protein": "0.9g", "fiber": "2.8g", "vitamin_a": "835mcg"}', TRUE, TRUE),
('Potatoes', 'Fresh potatoes perfect for all cooking methods', 30.00, (SELECT id FROM categories WHERE name = 'Root Vegetables'), '/placeholder.svg?height=300&width=300', 200, 'kg', '{"calories": 77, "protein": "2.0g", "fiber": "2.2g", "potassium": "421mg"}', FALSE, TRUE),
('Red Onions', 'Flavorful red onions for cooking and salads', 40.00, (SELECT id FROM categories WHERE name = 'Root Vegetables'), '/placeholder.svg?height=300&width=300', 80, 'kg', '{"calories": 40, "protein": "1.1g", "fiber": "1.7g", "vitamin_c": "7.4mg"}', FALSE, TRUE),
('Sweet Potatoes', 'Nutritious sweet potatoes with natural sweetness', 70.00, (SELECT id FROM categories WHERE name = 'Root Vegetables'), '/placeholder.svg?height=300&width=300', 60, 'kg', '{"calories": 86, "protein": "1.6g", "fiber": "3.0g", "vitamin_a": "709mcg"}', TRUE, TRUE),

-- Seasonal Fruits
('Red Apples', 'Crisp and sweet red apples, perfect for snacking', 120.00, (SELECT id FROM categories WHERE name = 'Seasonal Fruits'), '/placeholder.svg?height=300&width=300', 150, 'kg', '{"calories": 52, "protein": "0.3g", "fiber": "2.4g", "vitamin_c": "4.6mg"}', TRUE, TRUE),
('Bananas', 'Ripe yellow bananas, great source of potassium', 50.00, (SELECT id FROM categories WHERE name = 'Seasonal Fruits'), '/placeholder.svg?height=300&width=300', 100, 'dozen', '{"calories": 89, "protein": "1.1g", "fiber": "2.6g", "potassium": "358mg"}', FALSE, TRUE),
('Oranges', 'Juicy oranges packed with vitamin C', 80.00, (SELECT id FROM categories WHERE name = 'Seasonal Fruits'), '/placeholder.svg?height=300&width=300', 120, 'kg', '{"calories": 47, "protein": "0.9g", "fiber": "2.4g", "vitamin_c": "53.2mg"}', TRUE, TRUE),
('Pomegranates', 'Antioxidant-rich pomegranates for health', 200.00, (SELECT id FROM categories WHERE name = 'Seasonal Fruits'), '/placeholder.svg?height=300&width=300', 40, 'kg', '{"calories": 83, "protein": "1.7g", "fiber": "4.0g", "vitamin_c": "10.2mg"}', FALSE, TRUE),

-- Herbs & Spices
('Fresh Coriander', 'Aromatic coriander leaves for garnishing', 25.00, (SELECT id FROM categories WHERE name = 'Herbs & Spices'), '/placeholder.svg?height=300&width=300', 60, 'bunch', '{"calories": 23, "protein": "2.1g", "fiber": "2.8g", "vitamin_k": "310mcg"}', FALSE, TRUE),
('Mint Leaves', 'Fresh mint leaves for drinks and cooking', 30.00, (SELECT id FROM categories WHERE name = 'Herbs & Spices'), '/placeholder.svg?height=300&width=300', 45, 'bunch', '{"calories": 70, "protein": "3.8g", "fiber": "8.0g", "vitamin_a": "212mcg"}', FALSE, TRUE),
('Fresh Ginger', 'Organic ginger root for cooking and health', 150.00, (SELECT id FROM categories WHERE name = 'Herbs & Spices'), '/placeholder.svg?height=300&width=300', 30, 'kg', '{"calories": 80, "protein": "1.8g", "fiber": "2.0g", "vitamin_c": "5.0mg"}', TRUE, TRUE);

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Verify all tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'categories', 'products', 'addresses', 'cart_items', 'orders', 'order_items', 'wishlist')
ORDER BY table_name;

-- Verify orders table has all required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('subtotal', 'delivery_fee', 'total', 'total_amount', 'razorpay_payment_id', 'razorpay_order_id')
ORDER BY column_name;

-- Verify seed data was inserted
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products' as table_name, COUNT(*) as count FROM products;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now fully set up with:
-- ✅ All tables created with proper relationships
-- ✅ Row Level Security enabled
-- ✅ All policies configured
-- ✅ Sample data inserted
-- ✅ All required columns for order processing
-- ✅ Indexes for optimal performance 