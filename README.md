# Welcome to your Lovable project

## Project info
## info

**URL**: https://lovable.dev/projects/f1c33639-bbfd-4e03-994c-a2b4ed8f83e0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f1c33639-bbfd-4e03-994c-a2b4ed8f83e0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create environment file with admin credentials
cp .env.example .env
# Edit .env and add your Supabase credentials and admin login

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Admin Access

This application includes an admin dashboard at `/admin` with the following features:

- **Authentication**: Secure login with environment-based credentials
- **User Management**: View all user profiles with search and export capabilities
- **Order Management**: Track and manage all orders with detailed information
- **Analytics**: Platform statistics including revenue, active users, and system health
- **Data Export**: Export user and order data to CSV files

### Admin Setup

1. Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Admin Configuration
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=admin123

# Development
VITE_NODE_ENV=development
```

2. Navigate to `/admin` and login with the credentials set in your environment variables
3. Default credentials (if not set): Username: `admin`, Password: `admin123`

### Admin Features

- **Dashboard Overview**: Real-time statistics and system health monitoring
- **User Profiles**: Complete user management with profile viewing and link analytics
- **Order Tracking**: Comprehensive order management with status updates
- **Data Export**: CSV export functionality for reporting and analysis
- **Responsive Design**: Mobile-friendly admin interface
- **Authentication**: Persistent login with secure logout functionality

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f1c33639-bbfd-4e03-994c-a2b4ed8f83e0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
