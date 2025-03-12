
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { toast } from "sonner";

type User = {
  name: string;
  email: string;
  picture: string;
  image?: string;
  id: string;
  isGuest?: boolean; // Flag to identify guest users
  googleToken?: string; // For Google Calendar API access
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  login: (userData: Omit<User, "image">) => void;
  loginAsGuest: () => void;
  isAuthenticated: boolean;
  syncWithGoogleCalendar: () => Promise<boolean>;
  googleApiLoaded: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  login: () => {},
  loginAsGuest: () => {},
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
    // For non-guest users (Google login), use the special image
    const useSpecialImage = !userData.isGuest;
    
    const enhancedUser = {
      ...userData,
      image: useSpecialImage 
        ? "/lovable-uploads/5529380f-0de4-4a5f-9e76-aa5f5f0933f6.png" 
        : (userData.picture || "https://ui-avatars.com/api/?name=Guest+User&background=random"),
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

  // Function for guest login
  const loginAsGuest = () => {
    const guestId = `guest_${Date.now()}`;
    const guestUser = {
      name: "Guest User",
      email: `guest_${Date.now()}@example.com`,
      picture: "https://ui-avatars.com/api/?name=Guest+User&background=random",
      id: guestId,
      isGuest: true
    };
    
    localStorage.setItem("user", JSON.stringify(guestUser));
    setUser(guestUser);
    
    // Initialize user stats for guest
    const statsKey = `user_stats_${guestId}`;
    localStorage.setItem(statsKey, JSON.stringify({ 
      focusMinutes: 0, 
      tasksCompleted: 0, 
      eventsCreated: 0 
    }));

    toast.success("Logged in as Guest");
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Logged out successfully");
  };

  // Function to sync with Google Calendar
  const syncWithGoogleCalendar = async (): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to sync with Google Calendar");
      return false;
    }
    
    if (user.isGuest) {
      toast.error("Guest users cannot sync with Google Calendar. Please sign in with Google.");
      return false;
    }
    
    try {
      toast.loading("Syncing with Google Calendar...");
      
      // In a real app, this would call Google Calendar API
      // Let's simulate a more realistic sync process
      
      // 1. Get current events
      const events = db.getEvents(user.id);
      
      // 2. Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Simulate finding new events from Google
      const googleEvents = events.map(event => ({
        ...event,
        synced: true,
        googleId: `google_${event.id}` // Simulate Google Calendar IDs
      }));
      
      // 4. Simulate some new events from Google (if less than 5 events)
      if (events.length < 5) {
        const newCount = 5 - events.length;
        for (let i = 0; i < newCount; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1);
          
          googleEvents.push({
            id: Date.now() + i,
            title: `Synced Event ${i + 1}`,
            date: futureDate.toISOString().split('T')[0],
            time: `${10 + Math.floor(Math.random() * 8)}:00`,
            description: "This event was synced from Google Calendar",
            synced: true,
            googleId: `google_auto_${Date.now() + i}`
          });
        }
      }
      
      // 5. Save the synced events
      db.saveEvents(googleEvents, user.id);
      
      // 6. Update stats for new events
      const newEventCount = googleEvents.length - events.length;
      if (newEventCount > 0) {
        const stats = db.getStats(user.id);
        db.updateStats({ eventsCreated: stats.eventsCreated + newEventCount }, user.id);
      }
      
      // Simulate final network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.dismiss();
      toast.success(`Successfully synced with Google Calendar. ${newEventCount > 0 ? `Added ${newEventCount} new events.` : ''}`);
      return true;
    } catch (error) {
      console.error("Error syncing with Google Calendar:", error);
      toast.dismiss();
      toast.error("Failed to sync with Google Calendar");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout, 
      login,
      loginAsGuest,
      isAuthenticated: !!user,
      syncWithGoogleCalendar,
      googleApiLoaded
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
