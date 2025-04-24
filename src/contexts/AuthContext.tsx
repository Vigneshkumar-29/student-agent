import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Helper function to handle network retries
const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      if (error.message.includes('Failed to fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await retryOperation(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        })
      );

      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }

      if (!data.user || !data.user.id) {
        throw new Error("Failed to create user account");
      }

      return data;
    } catch (error) {
      console.error("Error during signup:", error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error("Network error: Please check your internet connection and try again");
        }
        throw error;
      }
      throw new Error("An unexpected error occurred during sign up");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with Supabase...');
      
      const { data, error } = await retryOperation(() => {
        console.log('Making auth request to:', import.meta.env.VITE_SUPABASE_URL);
        return supabase.auth.signInWithPassword({
          email,
          password,
        });
      });

      if (error) {
        console.error("Supabase auth error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        
        if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
          throw new Error(
            "Network error: Unable to connect to authentication service. Please check your internet connection and try again. If the problem persists, the service might be temporarily unavailable."
          );
        } else if (error.message.includes("Invalid login credentials")) {
          throw new Error(
            "Invalid credentials. Please check your email and password."
          );
        } else {
          throw error;
        }
      }

      if (!data?.user) {
        console.error("No user data received from Supabase");
        throw new Error("Authentication failed: No user data received");
      }

      console.log('Successfully signed in, navigating to home...');
      navigate("/");
    } catch (error) {
      console.error("Detailed sign in error:", {
        error,
        type: error instanceof Error ? 'Error' : typeof error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred during sign in");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await retryOperation(() => 
        supabase.auth.signOut()
      );
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error during sign out:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred during sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
