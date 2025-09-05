
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const isAdminById = session.user.id === '0f88f728-e124-4c7f-afc9-12913dbcc902';
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.full_name || 'Marketing Pro',
          role: isAdminById ? 'admin' : (session.user.user_metadata.role || 'user'),
          subscription_status: session.user.user_metadata.subscription_status || 'inactive',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error);
    }
    // The onAuthStateChange listener will handle setting user to null
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};