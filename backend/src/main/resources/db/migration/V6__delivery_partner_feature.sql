-- V6: Delivery Partner Role & Delivery Operations Schema

CREATE TABLE IF NOT EXISTS delivery_partner_profiles (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    service_area VARCHAR(150) NOT NULL,
    vehicle_type VARCHAR(50) NULL,
    vehicle_number VARCHAR(50) NULL,
    emergency_contact VARCHAR(20) NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_delivery_partner_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add delivery tracking fields to orders table
ALTER TABLE orders ADD COLUMN delivery_partner_id VARCHAR(36) NULL;
ALTER TABLE orders ADD COLUMN assigned_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN out_for_delivery_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN delivery_otp VARCHAR(6) NULL;
ALTER TABLE orders ADD COLUMN delivery_failure_reason VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN delivery_notes TEXT NULL;

-- Add index for delivery partner on orders and status
CREATE INDEX idx_orders_delivery_partner_id ON orders (delivery_partner_id);
CREATE INDEX idx_orders_order_status ON orders (order_status);
CREATE INDEX idx_delivery_partner_status ON delivery_partner_profiles (status);
