
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { toast } from "sonner";

type User = {
  name: string;
  email: string;
  picture: string;
  image?: string;
  id: string; // Add unique ID for user identification
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  login: (userData: Omit<User, "image">) => void;
  isAuthenticated: boolean;
  syncWithGoogleCalendar: () => Promise<boolean>;
  googleApiLoaded: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  login: () => {},
  isAuthenticated: false,
  syncWithGoogleCalendar: async () => false,
  googleApiLoaded: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);

  // Check if Google API is loaded
  useEffect(() => {
    const checkGoogleApiLoaded = () => {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        setGoogleApiLoaded(true);
      }
    };

    // Check immediately
    checkGoogleApiLoaded();
    
    // Also set up an interval to check periodically in case it loads later
    const intervalId = setInterval(checkGoogleApiLoaded, 1000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);

  // Load user data on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        ...parsedUser,
        image: parsedUser.picture || parsedUser.image // Ensure image is set
      });
      
      // Initialize user stats if they don't exist
      const statsKey = `user_stats_${parsedUser.id}`;
      if (!localStorage.getItem(statsKey)) {
        localStorage.setItem(statsKey, JSON.stringify({ 
          focusMinutes: 0, 
          tasksCompleted: 0, 
          eventsCreated: 0 
        }));
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: Omit<User, "image">) => {
    const enhancedUser = {
      ...userData,
      image: userData.picture, // Ensure image is set from picture
      id: userData.email.replace(/[^a-zA-Z0-9]/g, '_') // Create ID from email
    };
    
    localStorage.setItem("user", JSON.stringify(enhancedUser));
    setUser(enhancedUser);
    
    // Initialize user stats if they don't exist
    const statsKey = `user_stats_${enhancedUser.id}`;
    if (!localStorage.getItem(statsKey)) {
      localStorage.setItem(statsKey, JSON.stringify({ 
        focusMinutes: 0, 
        tasksCompleted: 0, 
        eventsCreated: 0 
      }));
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Function to sync with Google Calendar
  const syncWithGoogleCalendar = async (): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to sync with Google Calendar");
      return false;
    }
    
    try {
      // In a real app, this would call Google Calendar API
      // For now, we'll simulate a successful sync
      const events = db.getEvents(user.id);
      
      // Mark all events as synced
      const syncedEvents = events.map(event => ({
        ...event,
        synced: true
      }));
      
      // Save the synced events
      db.saveEvents(syncedEvents, user.id);
      
      return true;
    } catch (error) {
      console.error("Error syncing with Google Calendar:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout, 
      login,
      isAuthenticated: !!user,
      syncWithGoogleCalendar,
      googleApiLoaded
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
