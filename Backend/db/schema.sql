-- NaiyakSetu Database Schema for Supabase
-- This script creates all necessary tables for the complaint management system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified, can work with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table (main table first)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'submitted',
    reporter_type VARCHAR(20) DEFAULT 'anonymous',
    contact_method VARCHAR(20) DEFAULT 'email',
    phone VARCHAR(20),
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_formatted TEXT,
    user_id UUID,
    assigned_to UUID,
    department VARCHAR(100),
    estimated_resolution_date DATE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint Aadhaar data (for verified complaints)
CREATE TABLE IF NOT EXISTS complaint_aadhaar_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID,
    aadhaar_number VARCHAR(12) NOT NULL,
    name VARCHAR(255),
    gender VARCHAR(10),
    state VARCHAR(100),
    district VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint attachments
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaint status history
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP codes table (for verification)
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'verification',
    otp_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments/Updates table
CREATE TABLE IF NOT EXISTS complaint_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID,
    user_id UUID,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    head_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints(location_latitude, location_longitude);
CREATE INDEX IF NOT EXISTS idx_complaint_id ON complaints(complaint_id);

CREATE INDEX IF NOT EXISTS idx_attachments_complaint_id ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON complaint_status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expiry ON otp_codes(otp_expiry);

-- Insert default departments (ignore if they already exist)
INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Roads & Infrastructure', 'Handles road maintenance, potholes, and infrastructure issues', 'roads@NaiyakSetu.gov', '+91-1234567801'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Roads & Infrastructure');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Water Supply', 'Manages water supply, quality, and distribution issues', 'water@NaiyakSetu.gov', '+91-1234567802'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Water Supply');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Electricity', 'Handles power outages, electrical faults, and billing issues', 'electricity@NaiyakSetu.gov', '+91-1234567803'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Electricity');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Sanitation & Waste', 'Manages garbage collection, waste disposal, and cleanliness', 'sanitation@NaiyakSetu.gov', '+91-1234567804'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Sanitation & Waste');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Public Safety', 'Handles safety concerns, security, and emergency services', 'safety@NaiyakSetu.gov', '+91-1234567805'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Public Safety');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Traffic & Transportation', 'Manages traffic issues, public transport, and parking', 'traffic@NaiyakSetu.gov', '+91-1234567806'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Traffic & Transportation');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Environment', 'Handles pollution, environmental concerns, and green initiatives', 'environment@NaiyakSetu.gov', '+91-1234567807'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Environment');

INSERT INTO departments (name, description, contact_email, contact_phone) 
SELECT 'Health Services', 'Manages public health facilities and medical services', 'health@NaiyakSetu.gov', '+91-1234567808'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Health Services');

-- Add comments
COMMENT ON TABLE complaints IS 'Main complaints table storing citizen grievances';
COMMENT ON TABLE complaint_aadhaar_data IS 'Stores Aadhaar verification data for verified complaints';
COMMENT ON TABLE complaint_attachments IS 'Stores file attachments for complaints';
COMMENT ON TABLE complaint_status_history IS 'Tracks status changes and updates for complaints';
COMMENT ON TABLE departments IS 'Government departments handling different complaint categories';
COMMENT ON TABLE otp_codes IS 'Stores OTP codes for phone verification';
COMMENT ON TABLE complaint_comments IS 'Stores comments and updates on complaints';