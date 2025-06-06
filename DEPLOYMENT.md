# Tap Verse Digital ID - Deployment Guide

## Overview
Tap Verse Digital ID is a comprehensive digital business card platform with QR code generation, order management, and payment processing via Paystack.

## Features Implemented
✅ **Authentication & Authorization**
- User authentication with Supabase Auth
- Authentication guards for dashboard pages
- Admin panel with role-based access

✅ **Profile Management**
- Complete profile creation and editing
- Avatar upload with Supabase Storage
- Social links management
- Username/slug system

✅ **QR Code System**
- Dynamic QR code generation
- Customizable QR code styles
- Download and sharing functionality

✅ **Order Management**
- 3 card designs (Classic, Premium, Metal)
- Material selection and color schemes
- Quantity-based pricing with bulk discounts
- Complete order form with validation

✅ **Payment Integration**
- Paystack payment processing (Ghana Cedi - GHS)
- Secure payment verification
- Order status tracking

✅ **Admin Dashboard**
- User management and analytics
- Order tracking and status updates
- Revenue and performance metrics
- Data export functionality

## Environment Variables Required

### Frontend (.env)
```bash
# Supabase Configuration
VITE_PUBLIC_SUPABASE_URL=your_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Admin Credentials
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

### Backend (.env)
```bash
# Paystack Configuration
VITE_PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Server Configuration
PORT=3001
```

## Database Setup

### 1. Supabase Project Setup
1. Create a new Supabase project
2. Get your project URL and anon key
3. Run the following migrations in order:

### 2. Database Migrations
Execute these SQL files in your Supabase SQL Editor:

1. **001_create_profiles_table.sql** - User profiles with RLS
2. **002_create_orders_table.sql** - Order management system
3. **004_user_settings.sql** - User preferences

### 3. Storage Setup
The profiles migration automatically creates the avatars bucket with proper policies.

## Paystack Setup

### 1. Create Paystack Account
1. Sign up at [paystack.com](https://paystack.com)
2. Get your public and secret keys from the dashboard
3. Configure webhook endpoints (optional for advanced features)

### 2. Test vs Live Keys
- Use test keys for development
- Switch to live keys for production
- Ensure proper environment variable configuration

## Deployment Steps

### 1. Frontend Deployment (Vercel/Netlify)
```bash
# Build the application
npm run build

# Deploy to your preferred platform
# Make sure to set environment variables in your deployment platform
```

### 2. Backend Deployment (Railway/Heroku/VPS)
```bash
# The backend server handles payment verification
# Deploy the server/ directory to your preferred platform
# Set the PAYSTACK_SECRET_KEY environment variable
```

### 3. Environment Configuration
- Set all required environment variables in your deployment platform
- Ensure CORS is properly configured for your domain
- Update any hardcoded URLs to match your production domain

## Post-Deployment Checklist

### 1. Test Core Functionality
- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] QR code generation and download
- [ ] Order placement flow
- [ ] Payment processing (use test cards)
- [ ] Admin dashboard access

### 2. Payment Testing
Use Paystack test cards for Ghana:
- **Successful payment**: 4084084084084081
- **Declined payment**: 4084084084084081 (with CVV 408)
- **Currency**: Ghana Cedi (GHS) - amounts are in pesewas (smallest unit)

### 3. Admin Access
- Login with configured admin credentials
- Verify order management functionality
- Test status updates and data export

### 4. Security Verification
- [ ] RLS policies are active in Supabase
- [ ] Admin credentials are secure
- [ ] API keys are properly configured
- [ ] HTTPS is enabled

## Monitoring & Maintenance

### 1. Database Monitoring
- Monitor Supabase usage and performance
- Set up alerts for high usage
- Regular backup verification

### 2. Payment Monitoring
- Monitor Paystack dashboard for transactions
- Set up webhook notifications
- Regular reconciliation of orders vs payments

### 3. Error Tracking
- Implement error tracking (Sentry recommended)
- Monitor application logs
- Set up uptime monitoring

## Support & Documentation

### 1. User Documentation
- Create user guides for profile setup
- QR code usage instructions
- Order tracking help

### 2. Admin Documentation
- Order management procedures
- Status update workflows
- Data export and analysis

## Scaling Considerations

### 1. Performance Optimization
- Implement image optimization for avatars
- Add CDN for static assets
- Consider database indexing optimization

### 2. Feature Enhancements
- Email notifications for orders
- SMS notifications via Paystack
- Advanced analytics dashboard
- Bulk order management

## Troubleshooting

### Common Issues
1. **Payment failures**: Check Paystack keys and webhook configuration
2. **Authentication issues**: Verify Supabase configuration and RLS policies
3. **Image upload failures**: Check Supabase storage policies and bucket configuration
4. **Admin access issues**: Verify admin credentials in environment variables

### Support Contacts
- Supabase: [supabase.com/support](https://supabase.com/support)
- Paystack: [paystack.com/support](https://paystack.com/support)

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server with backend
npm run dev:full

# Build for production
npm run build

# Run backend only
npm run server
```

The application is now ready for production deployment! 🚀 