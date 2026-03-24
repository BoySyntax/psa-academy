import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    username?: string;
    role?: string;
  };
}

export const supabaseAuthService = {
  async signIn(email: string, password: string) {
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
      user: data.user,
    };
  },

  async signUp(email: string, password: string, metadata: { username?: string; name?: string; role?: string }) {
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
      user: data.user,
    };
  },

  async signOut() {
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
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase!.auth.getUser();
    return user;
  },

  async onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null);
      }
    );

    return subscription;
  },
};
