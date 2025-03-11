
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const newUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name: 'John Doe',
        email: 'johndoe@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
      };
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success('Successfully logged in');
    } catch (error) {
      toast.error('Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Successfully logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
