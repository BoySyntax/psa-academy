# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Project Name**: Give it a name (e.g., "Charming Logins")
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to you
5. Click "Create new project" and wait for it to initialize (2-3 minutes)

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (your `VITE_SUPABASE_URL`)
   - **anon public key** (your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Set Up Environment Variables

1. Create or edit the `.env.local` file in your project root (copy from `.env.local.example`)
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Save the file

## Step 4: Create the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `DATABASE_SCHEMA.sql` from the project root
4. Click **Run** to execute the SQL

This will create:
- `users` table with all registration fields
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update timestamp trigger

## Step 5: Configure Authentication Settings (Optional but Recommended)

1. Go to **Authentication** > **Providers**
2. Enable **Email** by default (already enabled)
3. Configure email settings in **Authentication** > **Email Templates** if needed

## Step 6: Test the Integration

The registration form will now:
1. Sign up users with email/password
2. Create their user profile with all registration data
3. Automatically send confirmation emails

## Usage in Your App

The `registrationService` object (in `src/services/registration.ts`) provides:

- `registerUser(data)` - Register a new user with all form data
- `loginUser(email, password)` - Log in an existing user
- `logoutUser()` - Log out the current user
- `getCurrentUser()` - Get the currently authenticated user
- `getUserProfile(userId)` - Fetch a user's profile data

## Example: Integrating with the Form

Update your `AuthPage.tsx` to use the registration service:

```typescript
import { registrationService } from "@/services/registration";
import { RegistrationFormData } from "@/types/registration";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const formData: RegistrationFormData = {
    username: username,
    email: email,
    password: password,
    firstName: firstName,
    // ... add all other fields
  };
  
  const result = await registrationService.registerUser(formData);
  
  if (result.success) {
    alert(result.message);
    // Redirect to success page
  } else {
    alert(result.message);
  }
};
```

## Troubleshooting

**Issue**: "Cannot find module '@supabase/supabase-js'"
- **Solution**: Run `npm install @supabase/supabase-js`

**Issue**: "VITE_SUPABASE_URL is undefined"
- **Solution**: Make sure your `.env.local` file exists and has the correct keys

**Issue**: "Error: Row level security violation"
- **Solution**: Check that you're properly authenticated before querying user data

**Issue**: "Email already registered"
- **Solution**: The email is already in use; users should use a different email

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- The anon key is public but is restricted by RLS policies
- Users can only access their own data
- Passwords are handled securely by Supabase Auth
