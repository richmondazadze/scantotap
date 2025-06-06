# SCAN2TAP - Digital Business Card Platform

## Overview
SCAN2TAP is a comprehensive digital business card platform that combines physical elegance with digital convenience. Create, manage, and share your professional identity with a modern, interactive digital business card.

## Features

### Core Features
- **Digital Business Cards**: Create and customize your digital identity
- **QR Code Generation**: Generate unique QR codes for instant sharing
- **Profile Management**: Complete profile creation and editing
- **Social Media Integration**: Connect all your social media profiles
- **Contact Management**: Share contact information via vCard
- **Analytics**: Track profile views and engagement

### User Features
- **Profile Customization**
  - Custom avatars with Supabase Storage
  - Professional titles and bios
  - Social media links
  - Contact information
  - Custom themes and colors

- **QR Code System**
  - Dynamic QR code generation
  - Customizable QR code styles
  - Download and sharing functionality
  - Analytics tracking

- **Contact Management**
  - WhatsApp integration
  - Email contact
  - Phone number sharing
  - vCard export
  - One-tap contact saving

### Admin Features
- **Dashboard Overview**
  - Real-time statistics
  - System health monitoring
  - User analytics
  - Revenue tracking

- **User Management**
  - Complete user profiles
  - Link analytics
  - Search functionality
  - Data export

- **Order Management**
  - Order tracking
  - Status updates
  - Payment verification
  - Shipping management

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Router
- React Icons

### Backend
- Supabase
  - Authentication
  - Database
  - Storage
  - Real-time subscriptions

### Payment Processing
- Paystack Integration
  - Ghana Cedi (GHS) support
  - Secure payment verification
  - Order status tracking

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Paystack account (for payments)

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd tap-verse-digital-id
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
```sh
cp .env.example .env
```

4. Configure your `.env` file:
```env
# Supabase Configuration
VITE_PUBLIC_SUPABASE_URL=your_supabase_url
VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Admin Configuration
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_secure_admin_password
```

5. Start the development server:
```sh
npm run dev
```

## Database Setup

1. Create a new Supabase project
2. Run the following migrations in order:
   - `001_create_profiles_table.sql`
   - `002_create_orders_table.sql`
   - `004_user_settings.sql`
   - `005_add_email_to_profiles.sql`
   - `006_add_email_trigger.sql`

## Deployment

### Frontend Deployment
1. Build the application:
```sh
npm run build
```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

### Backend Configuration
1. Set up Supabase project
2. Configure storage buckets
3. Set up RLS policies
4. Configure authentication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@scan2tap.com or join our Discord community.
