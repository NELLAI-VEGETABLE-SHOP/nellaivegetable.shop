# Nellai Vegetable Shop

A modern e-commerce platform for fresh vegetables and fruits with enhanced user authentication.

## Features

### Enhanced Authentication System
- **Google OAuth Integration**: One-click sign-in with Google
- **Guest Mode**: Shop without creating an account
- **Seamless Cart Migration**: Guest cart items are automatically transferred when you sign in
- **Multiple Sign-in Options**: Email/password, Google OAuth, or continue as guest

### User Experience Improvements
- **Frictionless Shopping**: Start shopping immediately with guest mode
- **Persistent Cart**: Cart items are saved locally for guest users
- **Easy Account Creation**: Multiple ways to create an account
- **Responsive Design**: Works perfectly on all devices

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Google OAuth Setup
To enable Google OAuth:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
5. Add your redirect URL: `https://your-domain.com/auth/callback`

### 3. Database Setup
Run the database migration script:

```bash
npm run db:setup
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Development Server
```bash
npm run dev
```

## Authentication Flow

### Guest Mode
- Users can start shopping immediately without creating an account
- Cart items are stored in localStorage
- When they sign in, their cart is automatically migrated to their account

### Google OAuth
- One-click sign-in with Google account
- Automatically creates user profile
- Seamless integration with existing cart system

### Email/Password
- Traditional email and password authentication
- Email verification required for new accounts
- Secure password requirements

## File Structure

```
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx          # Enhanced sign-in with multiple options
│   │   ├── signup/page.tsx          # Enhanced sign-up with multiple options
│   │   └── callback/page.tsx        # OAuth callback handler
│   └── cart/page.tsx                # Updated to support guest users
├── components/
│   ├── auth-context.tsx             # Authentication context provider
│   ├── header.tsx                   # Updated header with user state
│   └── product-card.tsx             # Updated to support guest cart
└── lib/
    ├── auth-fixed.ts                # Enhanced auth functions
    └── cart-fixed.ts                # Guest cart functionality
```

## Usage

### For Users
1. **Quick Start**: Click "Continue as Guest" to start shopping immediately
2. **Google Sign-in**: Click "Continue with Google" for one-click authentication
3. **Traditional Sign-up**: Use email and password for traditional account creation
4. **Cart Management**: Add items to cart in any mode, they'll be preserved when you sign in

### For Developers
- The `useAuth()` hook provides access to user state and authentication functions
- Guest cart functions are prefixed with `guest` (e.g., `addToGuestCart`)
- Cart migration happens automatically when users sign in

## Security Features
- Secure OAuth implementation
- Local storage encryption for guest data
- Automatic cart migration with validation
- Session management with Supabase

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - see LICENSE file for details 