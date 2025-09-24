-- CivicSecure Database Setup Script
-- Run this script to create all necessary tables

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create OTP codes table
CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Aadhaar dataset table
CREATE TABLE IF NOT EXISTS aadhaar_dataset (
    id SERIAL PRIMARY KEY,
    aadhaar_number VARCHAR(12) UNIQUE NOT NULL,
    name VARCHAR(100),
    gender VARCHAR(10),
    age INTEGER,
    state VARCHAR(50),
    district VARCHAR(50),
    pincode VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    reporter_type VARCHAR(20) NOT NULL DEFAULT 'anonymous',
    reporter_phone VARCHAR(15),
    reporter_name VARCHAR(100),
    aadhaar_number VARCHAR(12),
    aadhaar_verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'medium',
    assigned_to VARCHAR(100),
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_aadhaar_number ON aadhaar_dataset(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_reporter_phone ON complaints(reporter_phone);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);

-- Insert some sample data for testing (optional)
-- You can comment this out if you don't want sample data
INSERT INTO users (phone, name, is_verified) 
VALUES ('+919876543210', 'Test User', true)
ON CONFLICT (phone) DO NOTHING;

-- Add some sample Aadhaar data for testing
INSERT INTO aadhaar_dataset (aadhaar_number, name, gender, age, state, district, pincode)
VALUES 
    ('123456789012', 'John Doe', 'Male', 25, 'Karnataka', 'Bangalore', '560001'),
    ('234567890123', 'Jane Smith', 'Female', 30, 'Maharashtra', 'Mumbai', '400001'),
    ('345678901234', 'Raj Kumar', 'Male', 35, 'Tamil Nadu', 'Chennai', '600001')
ON CONFLICT (aadhaar_number) DO NOTHING;

PRINT 'Database tables created successfully!';