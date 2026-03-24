import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    username?: string;
    role?: string;
  };
}

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
          user: null,
        };
      }

      return {
        success: true,
        message: 'Login successful!',
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          user_metadata: data.user?.user_metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed',
        user: null,
      };
    }
  },

  async signUp(email: string, password: string, metadata: { username?: string; name?: string; role?: string }) {
    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message,
          user: null,
        };
      }

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify.',
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        } : null,
      };
    } catch (error) {
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
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      
      if (!user) return null;
      
      return {
        id: user.id,
        email: user.email || '',
        user_metadata: user.user_metadata,
      };
    } catch {
      return null;
    }
  },
};
