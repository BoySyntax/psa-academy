# Database Setup Instructions

Follow these steps to set up your Supabase database for the registration form.

## Step 1: Go to Supabase Dashboard

1. Open your browser and go to [https://supabase.com](https://supabase.com)
2. Sign in with your account
3. Click on your project: **charming-logins** (or the name of your project)

## Step 2: Access SQL Editor

1. In the left sidebar, click **SQL Editor**
2. Click **New Query** button
3. You should see a blank SQL editor

## Step 3: Copy and Run the Schema

Copy the entire SQL code below and paste it into the SQL editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  suffix TEXT,
  date_of_birth DATE,
  sex TEXT,
  blood_type TEXT,
  civil_status TEXT,
  type_of_disability TEXT,
  religion TEXT,
  educational_attainment TEXT,
  
  -- Address
  house_no_and_street TEXT,
  barangay TEXT,
  municipality TEXT,
  province TEXT,
  region TEXT,
  
  -- Contact Information
  cellphone_number TEXT,
  
  -- Employment Details
  type_of_employment TEXT,
  civil_service_eligibility_level TEXT,
  salary_grade TEXT,
  present_position TEXT,
  office TEXT,
  service TEXT,
  division_province TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_address TEXT,
  emergency_contact_number TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow inserting new user records during signup
-- This policy allows users to insert if the id column matches their auth uid
CREATE POLICY users_insert_new ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Alternative: Allow public inserts during signup (more permissive)
-- Uncomment the line below if the above policy doesn't work
-- CREATE POLICY users_insert_public ON users FOR INSERT WITH CHECK (true);

-- Create RLS policy to allow users to read their own records
CREATE POLICY users_read_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create RLS policy to allow users to update their own records
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Step 4: Execute the Query

1. Click the **Run** button (or press Ctrl+Enter)
2. You should see a success message at the bottom

## Step 5: Verify the Table

1. In the left sidebar, click **Table Editor**
2. You should see the new **users** table listed
3. If you click on it, you should see all the columns we created

## Step 6: Test the Application

1. Go back to your application at http://localhost:8081
2. Click the "Sign Up" tab
3. Fill in a test registration form
4. Click "Create Account"
5. You should see a success message
6. Check your Supabase Table Editor to see the new user record

## Troubleshooting

**If you get a "429 Too Many Requests" error:**
- This means you've hit Supabase's rate limit on signup (usually after 5+ attempts in a short time)
- **Wait 5-10 minutes** before attempting to register again
- *This is a Supabase limitation to prevent abuse - the rate limit will automatically reset*
- Use this time to set up the database first!

**If you get a "401 Unauthorized" error:**
- Make sure the `users` table was created successfully
- Check that RLS policies are enabled

**If you get a "403 Forbidden" error:**
- This is normal during cleanup - it means authentication succeeded but cleanup failed
- Your user should still be created; refresh the page and try logging in

**If nothing happens when you click "Create Account":**
- Check the browser console (F12) for error messages
- Make sure your `.env.local` file exists with the correct Supabase credentials

## Next Steps

Once the table is created:
1. Test registration by filling out the form and clicking "Create Account"
2. You should receive a confirmation email from Supabase
3. Verify the user data in the Supabase Table Editor
