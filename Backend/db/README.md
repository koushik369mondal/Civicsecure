# Database Directory

This directory contains the essential database files for the NaiyakSetu project.

## Files

### `index.js`
- **Purpose**: Main database connection pool using PostgreSQL
- **Usage**: Required by all controllers (`const pool = require('../db')`)
- **Features**: 
  - Connection pooling with proper configuration
  - Automatic cleanup of expired OTPs
  - Graceful shutdown handling
  - Environment variable support

### `schema.sql`
- **Purpose**: Complete database schema definition for the entire application
- **Usage**: Run this file to create all tables and initial data
- **Contents**:
  - All table definitions (users, complaints, departments, etc.)
  - Foreign key relationships
  - Indexes for performance
  - Initial department data with proper INSERT statements
  - Database comments and documentation

## Setup Instructions

1. **Database Connection**: Ensure your `.env` file has the correct database credentials
2. **Schema Creation**: Execute `schema.sql` against your PostgreSQL database to create all tables
3. **Verification**: The application will automatically connect using `index.js`

## Notes

- The schema supports both local PostgreSQL and Supabase
- All database queries use the connection pool from `index.js`
- The schema includes proper UUID generation and timestamps
- Department data is automatically inserted if not exists