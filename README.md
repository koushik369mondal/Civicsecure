# 🏛️ CivicSecure - Digital Civic Complaint Management System

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

> **Smart Governance | Digital India Initiative**  
> A comprehensive civic complaint management platform for seamless citizen-government interaction

---

## 🌟 Project Overview

**CivicSecure** is an advanced digital platform designed to revolutionize civic governance by enabling citizens to report, track, and resolve civic issues efficiently. Built as part of the **Smart India Hackathon (SIH)**, this system bridges the gap between citizens and government authorities through technology.

### 🎯 **Key Objectives**
- **Transparent Governance**: Real-time complaint tracking and status updates
- **Digital Integration**: Paperless complaint submission with Aadhaar verification
- **Geographic Intelligence**: Interactive mapping with Mapbox integration
- **Data-Driven Insights**: Analytics dashboard for administrative decisions
- **Citizen Empowerment**: Easy access to government schemes and policies

---

## ✨ Features

### 🔐 **Authentication & Security**
- **OTP-based Authentication** via phone numbers
- **Aadhaar Integration** for identity verification
- **Multi-level Reporter Types**: Anonymous, Pseudonymous, Verified
- **JWT Token Security** with secure session management

### 📋 **Complaint Management**
- **Interactive Map Integration** with Mapbox for precise location marking
- **Location Search** functionality for any address in India
- **Category-based Classification** (Roads, Water, Electricity, Waste, etc.)
- **File Attachments** support (Images, Documents, Videos)
- **Real-time Status Tracking** with unique complaint IDs

### 🗺️ **Smart Location Services**
- **Current Location Detection** with GPS integration
- **Address Search** using Mapbox Geocoding API
- **Interactive Map Interface** for precise location selection
- **Location Validation** and formatting

### 📊 **Dashboard & Analytics**
- **Real-time Statistics** (Total, Pending, Resolved, In Progress)
- **Recent Complaints** overview with status indicators
- **Complaint Category Distribution** analytics
- **Administrative Dashboard** for officials

### 🏛️ **Government Information Hub**
- **Live RSS Feed Integration** from official government sources
- **Dynamic Scheme Updates** from PIB, MyGov, India.gov.in
- **Categorized Information** (Healthcare, Housing, Education, etc.)
- **Auto-refresh** system with 30-minute cache intervals

### 🔄 **Additional Features**
- **Responsive Design** for all device types
- **Error Boundaries** for graceful error handling
- **Rate Limiting** for API security
- **CORS Configuration** for secure cross-origin requests
- **Database Indexing** for optimal performance

---

## 🏗️ Architecture

### **Frontend Architecture**
```
React 19.1.1 + Vite
├── 🎨 UI Framework: Tailwind CSS + DaisyUI
├── 🗺️ Maps: Mapbox GL JS + React Map GL
├── 📡 HTTP Client: Axios
├── 🔒 State Management: React Hooks
├── 📱 Icons: React Icons
└── 🛡️ Error Handling: Error Boundaries
```

### **Backend Architecture**
```
Node.js + Express.js
├── 🗄️ Database: PostgreSQL
├── 🔐 Authentication: JWT + bcryptjs
├── 🛡️ Security: Helmet + CORS + Rate Limiting
├── 📁 File Handling: Multer
├── 📊 CSV Processing: csv-parser
└── 🌐 Environment: dotenv
```

### **Database Schema**
```sql
🏛️ CivicSecure Database
├── 👥 users (User authentication & profiles)
├── 📱 otp_codes (OTP verification)
├── 🆔 aadhaar_dataset (Identity verification data)
└── 📋 complaints (Complaint management system)
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- **Node.js** (v16+ recommended)
- **PostgreSQL** (v13+ recommended)
- **Mapbox Account** (for map services)

### **1. Clone Repository**
```bash
git clone https://github.com/koushik369mondal/Civicsecure.git
cd Civicsecure
```

### **2. Database Setup**
```sql
-- Create database
CREATE DATABASE civicsecure_db;

-- Run setup script
psql -U postgres -d civicsecure_db -f Backend/db/setup.sql
```

### **3. Backend Configuration**
```bash
cd Backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file with your configurations
```

**Backend Environment Variables:**
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=civicsecure_db
DB_PASSWORD=your_password
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5174
```

### **4. Frontend Configuration**
```bash
cd Frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env file with your Mapbox token
```

**Frontend Environment Variables:**
```env
# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Backend API Configuration
VITE_API_URL=http://localhost:5000/api

# Development Configuration
NODE_ENV=development
```

### **5. Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev    # Starts on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev    # Starts on http://localhost:5174
```

---

## 📋 API Endpoints

### **Authentication**
- `POST /api/send-otp` - Send OTP to phone number
- `POST /api/verify-otp` - Verify OTP and authenticate
- `GET /api/user/profile` - Get user profile

### **Complaints**
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get specific complaint
- `PUT /api/complaints/:id/status` - Update complaint status
- `GET /api/complaints/stats` - Get complaint statistics

### **Verification**
- `POST /api/validate-aadhaar` - Validate Aadhaar number
- `GET /api/aadhaar/stats` - Get Aadhaar database statistics

---

## 🗺️ Project Structure

```
CivicSecure/
│
├── 📁 Backend/                 # Node.js + Express API
│   ├── 🎮 controllers/         # Route controllers
│   ├── 🗄️ db/                 # Database configuration
│   ├── 🛡️ middleware/         # Authentication & validation
│   ├── 🛣️ routes/             # API routes
│   ├── 📋 scripts/            # Database scripts
│   ├── 🔧 utils/              # Utility functions
│   ├── 📄 .env                # Environment variables
│   ├── 🚀 app.js              # Express application
│   └── 📦 package.json        # Dependencies
│
├── 📁 Frontend/               # React + Vite Application
│   ├── 📁 public/             # Static assets
│   ├── 📁 src/
│   │   ├── 🎨 assets/         # Images & media files
│   │   ├── 🧩 components/     # React components
│   │   ├── 📡 services/       # API service functions
│   │   ├── 🔧 utils/          # Utility functions
│   │   ├── 🎯 App.jsx         # Main application component
│   │   ├── 🎨 index.css       # Global styles
│   │   └── 🚀 main.jsx        # Application entry point
│   ├── 📄 .env                # Environment variables
│   ├── 📦 package.json        # Dependencies
│   └── ⚡ vite.config.js      # Vite configuration
│
└── 📖 README.md               # Project documentation
```

---

## 🎨 UI Components

### **Core Components**
- **🏠 Dashboard** - Analytics and statistics overview
- **📝 ComplaintForm** - Interactive complaint submission
- **🗺️ LocationPicker** - Map-based location selection
- **👤 Profile** - User profile management
- **📱 Login** - Authentication interface
- **📊 Tracking** - Complaint status tracking

### **Feature Components**
- **🆔 AadhaarVerification** - Identity verification
- **🌐 InfoHub** - Government schemes display
- **💬 Community** - Community features
- **🗂️ Sidebar** - Navigation interface

---

## 🔧 Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend framework | 19.1.1 |
| **Node.js** | Backend runtime | Latest |
| **Express.js** | Web framework | 5.1.0 |
| **PostgreSQL** | Database | 8.16.3 |
| **Tailwind CSS** | UI styling | 4.1.13 |
| **Mapbox GL** | Interactive maps | 2.15.0 |
| **JWT** | Authentication | 9.0.2 |
| **Axios** | HTTP client | 1.12.2 |

---

## 🚦 Usage Guide

### **For Citizens**
1. **📱 Register** with phone number and OTP verification
2. **📋 Submit Complaint** using the interactive form
3. **🗺️ Mark Location** on map or search for address
4. **📎 Attach Files** (optional) for better documentation
5. **🔍 Track Status** using complaint ID
6. **📊 View Dashboard** for personal complaint statistics

### **For Government Officials**
1. **📊 Access Dashboard** for complaint analytics
2. **📋 Review Complaints** by category and priority
3. **🔄 Update Status** (Pending → In Progress → Resolved)
4. **📈 Generate Reports** for administrative decisions
5. **🗺️ Geographic Analysis** of complaint distribution

---

## 🔒 Security Features

- **🔐 JWT Authentication** with secure token management
- **🛡️ Input Validation** and sanitization
- **⚡ Rate Limiting** to prevent API abuse
- **🔒 CORS Configuration** for secure cross-origin requests
- **🗄️ SQL Injection Protection** with parameterized queries
- **🔑 Environment Variables** for sensitive data
- **🛡️ Helmet.js** for security headers

---

## 📊 Database Design

### **Tables Overview**
```sql
👥 users
├── id (Primary Key)
├── phone (Unique)
├── name, email
├── created_at, updated_at
└── is_verified

📱 otp_codes
├── id (Primary Key)
├── phone (Foreign Key)
├── otp_code, expires_at
└── created_at

🆔 aadhaar_dataset
├── id (Primary Key)
├── aadhaar_number (Unique)
├── name, date_of_birth
└── created_at

📋 complaints
├── complaint_id (Primary Key)
├── category, description
├── location (JSON)
├── reporter_type, status
├── aadhaar_data (JSON)
├── attachments (JSON)
└── timestamps
```

---

## 🌐 RSS Feed Integration

**Live Government Data Sources:**
- **📢 PIB (Press Information Bureau)** - `pib.gov.in/rss/latestnews.xml`
- **🏛️ MyGov Portal** - `mygov.in/rss.xml`
- **🇮🇳 India.gov.in** - `india.gov.in/rss.xml`
- **📚 Vikaspedia** - `vikaspedia.in/rss.xml`

**Features:**
- **🔄 Auto-refresh** every 30 minutes
- **💾 Smart Caching** with localStorage
- **🏷️ Auto-categorization** of schemes
- **📱 Responsive Display** with carousel

---

## 🚀 Deployment Guide

### **Production Environment**

**Backend Deployment:**
```bash
# Build and deploy backend
cd Backend
npm install --production
pm2 start app.js --name civicsecure-api
```

**Frontend Deployment:**
```bash
# Build React app
cd Frontend
npm run build

# Deploy to web server
cp -r dist/* /var/www/html/
```

**Database Setup:**
```sql
-- Production database setup
CREATE DATABASE civicsecure_production;
psql -U postgres -d civicsecure_production -f Backend/db/setup.sql
```

**Environment Configuration:**
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure SSL certificates
- Set up database backups
- Enable logging and monitoring

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **Development Workflow**
1. **🍴 Fork** the repository
2. **🌿 Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **💾 Commit** changes (`git commit -m 'Add some AmazingFeature'`)
4. **📤 Push** to branch (`git push origin feature/AmazingFeature`)
5. **📥 Open** a Pull Request

### **Code Standards**
- **JavaScript**: ES6+ with proper error handling
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes
- **Database**: Parameterized queries only
- **API**: RESTful conventions

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Smart India Hackathon 2025**
- **Project Category**: Smart Governance
- **Team**: [Your Team Name]
- **Institution**: [Your Institution]

---

## 📞 Support

For support and queries:
- **📧 Email**: [your-email@example.com]
- **🐛 Issues**: [GitHub Issues](https://github.com/koushik369mondal/Civicsecure/issues)
- **📖 Documentation**: This README

---

## 🏆 Achievements

- ✅ **Complete Authentication System** with OTP verification
- ✅ **Interactive Mapping** with Mapbox integration  
- ✅ **Real-time Complaint Tracking** system
- ✅ **Government RSS Integration** for live updates
- ✅ **Responsive Design** for all devices
- ✅ **Secure API** with rate limiting and validation
- ✅ **Database Optimization** with proper indexing

---

## 📈 Future Roadmap

### **Phase 1 - Enhancement**
- [ ] **Push Notifications** for status updates
- [ ] **Multi-language Support** (Hindi, Regional languages)
- [ ] **Advanced Analytics** Dashboard
- [ ] **Mobile App** (React Native)

### **Phase 2 - Integration**
- [ ] **Government API Integration** for direct updates
- [ ] **AI-powered Categorization** of complaints
- [ ] **Chatbot Support** for user assistance
- [ ] **Blockchain** for transparency

### **Phase 3 - Scaling**
- [ ] **Microservices Architecture**
- [ ] **Cloud Deployment** (AWS/Azure)
- [ ] **Load Balancing** and clustering
- [ ] **Advanced Security** features

---

<div align="center">

**🏛️ Built for Digital India Initiative 🇮🇳**

*Empowering Citizens | Enabling Governance | Ensuring Transparency*

---

**⭐ Star this repo if you find it helpful! ⭐**

</div>