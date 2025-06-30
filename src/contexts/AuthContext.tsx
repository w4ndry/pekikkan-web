import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { username: string; full_name: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { username: string; full_name: string }) => {
    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', userData.username)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            full_name: userData.full_name,
          },
        },
      });

      if (error) throw error;

      // If user was created successfully, insert profile data into users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username: userData.username,
            full_name: userData.full_name,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If profile creation fails, we should clean up the auth user
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile. Please try again.');
        }
      }
      
      toast.success('Account created successfully! Please check your email to confirm your account.');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'Failed to create account';
      
      if (authError.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists';
      } else if (authError.message?.includes('Password should be at least')) {
        errorMessage = 'Password should be at least 6 characters long';
      } else if (authError.message?.includes('Username is already taken')) {
        errorMessage = 'Username is already taken';
      } else if (authError.message) {
        errorMessage = authError.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user profile exists in our users table
      if (data.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // User profile doesn't exist, create it from auth metadata
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
              full_name: data.user.user_metadata?.full_name || '',
            });

          if (insertError) {
            console.error('Failed to create user profile:', insertError);
          }
        }
      }
      
      toast.success('Signed in successfully!');
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = 'Failed to sign in';
      
      if (authError.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (authError.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (authError.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (authError.message) {
        errorMessage = authError.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear any cached data or local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase (this invalidates the session on the server)
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear browser history to prevent back button access to protected pages
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '/');
      }
      
      // Show success message
      toast.success('Successfully logged out!');
      
      // Redirect to home page after a brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
      
    } catch (error) {
      const authError = error as AuthError;
      toast.error(authError.message || 'Failed to sign out');
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};