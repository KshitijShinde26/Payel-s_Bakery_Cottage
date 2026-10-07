-- V7: Secure Delivery Handover OTP with expiration, attempt tracking, and single-use flags

ALTER TABLE orders ADD COLUMN delivery_otp_expires_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN delivery_otp_used BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE orders ADD COLUMN delivery_otp_attempts INT DEFAULT 0 NOT NULL;
