import { supabase } from '@/lib/supabase';

export interface SimpleUser {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    role?: string;
    name?: string;
  };
}

export const simpleAuthService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return {
          success: false,
          message: error.message,
          user: null,
        };
      }

      console.log('Sign in success:', data.user);
      return {
        success: true,
        message: 'Login successful!',
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        } : null,
      };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return {
        success: false,
        message: 'Login failed',
        user: null,
      };
    }
  },

  async signUp(email: string, password: string, metadata: { username?: string; role?: string; name?: string }) {
    try {
      console.log('Attempting sign up with:', { email, metadata });
      
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return {
          success: false,
          message: error.message,
          user: null,
        };
      }

      console.log('Sign up success:', data);
      return {
        success: true,
        message: 'Registration successful! You can now sign in.',
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        } : null,
      };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return {
        success: false,
        message: 'Registration failed',
        user: null,
      };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase!.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  },

  async getCurrentUser(): Promise<SimpleUser | null> {
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
};
