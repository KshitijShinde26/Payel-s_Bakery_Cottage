-- Add inventory stock_quantity tracking to products table
ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 20 NOT NULL;
