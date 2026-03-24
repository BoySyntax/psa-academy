import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { UserType } from "@/constants/userTypes";

export interface AuthUser extends User {
  userType?: UserType;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get current user on mount
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Auth error:", error);
        setUser(null);
        setUserType(null);
      } else if (data.user) {
        setUser(data.user);
        // Fetch user profile with user_type
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", data.user.id)
          .single();
        
        if (!userError && userData) {
          setUserType(userData.user_type as UserType);
        }
      }
      setLoading(false);
    };

    checkUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Fetch user_type when auth state changes
          const { data: userData } = await supabase
            .from("users")
            .select("user_type")
            .eq("id", session.user.id)
            .single();
          
          if (userData) {
            setUserType(userData.user_type as UserType);
          }
        } else {
          setUser(null);
          setUserType(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, userType, loading };
};
