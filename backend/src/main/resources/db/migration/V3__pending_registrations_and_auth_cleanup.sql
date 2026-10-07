CREATE TABLE IF NOT EXISTS pending_registrations (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0 NOT NULL,
    last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_pending_email (email),
    INDEX idx_pending_email_otp (email, otp_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
