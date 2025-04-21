# Solar Platform Application Flow & Features Specification

## Overview

The Solar Platform is a comprehensive solution with two primary user roles integrated into a single React Native application built using Expo, TypeScript, and Expo Router. The interface and access are dynamically determined by the login role.

### Key Integrations
- ERP System
- CRM System
- Admin Dashboard
- Call Center

## User Authentication

### Login Options
- Email
- Phone number
- Social login (Google, Apple)

### Role-based Routing
- Direct users to the correct interface (Customer or Agent) post-login

### Authentication Backend
- Powered by Supabase Auth

## Customer App Flow & Features

### 1. Dashboard
- **Instant Quote**
  - Input electricity bill amount to generate solar quote (Physical or Digital Solar)
- **Reserved Units**
  - View solar units reserved or purchased with status tracking
- **Consumption Metrics**
  - Real-time consumption tracking
  - Daily comparisons
  - Historical analysis
- **Historical Trends**
  - Weekly, monthly, and yearly stats for energy consumption

### 2. Booking Process
1. Instant Quote Based On Energy Bill (Choose between Physical or Digital Solar)
2. Sales Expert Call & Quotation Finalization
3. Track Project Progress (Order → Installation → Activation)
4. Monitor System 24/7 after installation

### 3. Service Requests & Issue Reporting
- Submit service requests with issue type and description
- Upload evidence (images/videos)
- Track issue status with real-time updates

### 4. AI Chatbot
- FAQs, navigation help, and basic troubleshooting
- Option to connect to human agent for complex queries

### 5. Support & Contact
- Multiple contact methods (phone, email, live chat)
- Nearest office locator

### 6. Notifications
- Consumption threshold alerts
- Service updates
- Promotional offers

### 7. Profile Management
- Update personal information
- View KYC status
- Manage payment details

### 8. Payments
- Razorpay integration for secure payments
- Payouts via Razorpay Payout for referral earnings and cashback

### 9. Digital Solar Wallet
- Earn credits based on energy generated (1 unit = ₹1 credit)
- Credit offset for electricity bills
- Portable credits within supported regions
- Wallet history tracking
- Power Provider Integration via Bharat Connect BBPS API

### 10. Marketing Tools
- Email & SMS automation for reminders and offers

### 11. CRM & ERP Sync
- Automatic sync of leads, project statuses, and issue updates

### 12. Inverter API Integration
- Quick plant setup with big data
- Real-time monitoring of production, consumption, and battery levels
- Energy flow visualization
- Device management
- Alert notifications for system anomalies

### 13. SundayGrids Integration
- Reserve community solar capacity
- Earn ₹1 per unit of generated energy
- Flexible participation options
- Environmental impact tracking

### 14. Referral Program
- Share referral code/link via multiple channels
- Track referred leads
- Earn rewards for successful referrals
- Integrated payouts via Razorpay
- Special promotional campaigns

## Agent App Flow & Features

### 1. Admin Login
- Role-based access control for admin and field agents

### 2. Dashboard
- Installation status overview
- Service request tracking
- Performance KPIs

### 3. Customer Management
- Access customer profiles
- Manage requests
- Assign jobs to other agents

### 4. Reporting & Analytics
- Generate installation and energy reports
- Export data in PDF/Excel format

### 5. Notifications
- New installation alerts
- Urgent maintenance notifications
- Customer escalation alerts

### 6. AI Integration
- AI-powered troubleshooting assistant
- Customer pattern insights

### 7. CRM & ERP Integration
- Lead progress tracking
- Customer and installation data sync

### 8. Agent Wallet Feature
- Commission earnings from installations
- Referral rewards
- Wallet monitoring
- Bank transfers via Razorpay
- Transaction history

## Integration Points

### ERP
- Inventory & Order Fulfillment
- Billing & Payments
- Service Lifecycle Management

### CRM
- Lead Management
- Customer Profiles
- Campaign Management

### Admin Dashboard
- User & Access Management
- Reporting & Analytics
- System Configuration

### Call Center
- Ticket Management
- Communication Logs
- Real-time Data Sync

## Technical Stack

- **Frontend**: React Native with TypeScript, Expo, and Expo Router
- **UI Framework**: React Native Paper
- **Backend/Database**: Supabase
- **Payments**: Razorpay API
- **BBPS Integration**: Bharat Connect API
- **Maps & Location**: Google Maps SDK
- **CRM/ERP**: Zoho, Salesforce, or custom REST integrations
- **Inverter APIs**: Growatt, SOLARMAN Smart

## UI Flow Summary

### Login Page
- Role detection and interface routing

### Customer Flow
1. Dashboard
2. Instant Quote
3. Solar Type Selection
4. Project Tracking
5. Consumption Monitoring
6. Issue Management
7. Plant Status
8. Wallet Management
9. SundayGrids Participation
10. Referral System

### Agent Flow
1. Dashboard
2. Task Management
3. Customer Profiles
4. Report Submission
5. Wallet & Earnings Tracking

## Database Schema

### Users Table
```sql
users (
  id: uuid PRIMARY KEY,
  email: string UNIQUE,
  phone: string UNIQUE,
  role: enum('customer', 'agent', 'admin'),
  full_name: string,
  created_at: timestamp,
  updated_at: timestamp,
  kyc_status: enum('pending', 'verified', 'rejected'),
  profile_image: string,
  is_active: boolean
)
```

### Customer Profiles Table
```sql
customer_profiles (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  address: string,
  city: string,
  state: string,
  pincode: string,
  electricity_provider: string,
  average_bill: decimal,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Solar Projects Table
```sql
solar_projects (
  id: uuid PRIMARY KEY,
  customer_id: uuid REFERENCES users(id),
  project_type: enum('physical', 'digital'),
  status: enum('quote', 'confirmed', 'installation', 'active'),
  capacity_kw: decimal,
  estimated_cost: decimal,
  actual_cost: decimal,
  installation_date: timestamp,
  completion_date: timestamp,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Energy Consumption Table
```sql
energy_consumption (
  id: uuid PRIMARY KEY,
  project_id: uuid REFERENCES solar_projects(id),
  date: date,
  consumption_kwh: decimal,
  generation_kwh: decimal,
  battery_level: integer,
  created_at: timestamp
)
```

### Service Requests Table
```sql
service_requests (
  id: uuid PRIMARY KEY,
  customer_id: uuid REFERENCES users(id),
  project_id: uuid REFERENCES solar_projects(id),
  type: enum('maintenance', 'repair', 'inspection'),
  status: enum('open', 'assigned', 'in_progress', 'resolved'),
  description: text,
  assigned_to: uuid REFERENCES users(id),
  created_at: timestamp,
  updated_at: timestamp
)
```

### Digital Wallet Table
```sql
digital_wallet (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  balance: decimal,
  last_updated: timestamp,
  created_at: timestamp
)
```

### Wallet Transactions Table
```sql
wallet_transactions (
  id: uuid PRIMARY KEY,
  wallet_id: uuid REFERENCES digital_wallet(id),
  type: enum('credit', 'debit'),
  amount: decimal,
  description: string,
  reference_id: string,
  created_at: timestamp
)
```

### Referrals Table
```sql
referrals (
  id: uuid PRIMARY KEY,
  referrer_id: uuid REFERENCES users(id),
  referred_id: uuid REFERENCES users(id),
  status: enum('pending', 'completed', 'failed'),
  reward_amount: decimal,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Agent Profiles Table
```sql
agent_profiles (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  commission_rate: decimal,
  total_earnings: decimal,
  performance_rating: decimal,
  created_at: timestamp,
  updated_at: timestamp
)
```

### Notifications Table
```sql
notifications (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  type: enum('alert', 'update', 'promotion'),
  title: string,
  message: text,
  is_read: boolean,
  created_at: timestamp
)
```

## Application Folder Structure

```
go2solar/
├── app/                      # Expo Router app directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (customer)/          # Customer routes
│   │   ├── dashboard.tsx
│   │   ├── quote/
│   │   ├── projects/
│   │   ├── wallet/
│   │   └── profile/
│   ├── (agent)/             # Agent routes
│   │   ├── dashboard.tsx
│   │   ├── customers/
│   │   ├── tasks/
│   │   └── reports/
│   └── _layout.tsx          # Root layout
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/          # Shared components
│   │   ├── customer/        # Customer-specific components
│   │   └── agent/          # Agent-specific components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external service integrations
│   │   ├── api/           # API clients
│   │   ├── supabase/      # Supabase client
│   │   └── razorpay/      # Razorpay integration
│   ├── store/             # State management
│   │   ├── slices/        # Redux slices
│   │   └── index.ts       # Store configuration
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   ├── types/             # TypeScript type definitions
│   └── theme/             # Theme configuration
├── assets/                # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── docs/                  # Documentation
├── tests/                 # Test files
├── .env.example          # Environment variables example
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

This folder structure follows React Native and Expo best practices, with a clear separation of concerns and modular organization. The `app` directory uses Expo Router for file-based routing, while the `src` directory contains all the application logic, components, and services.
