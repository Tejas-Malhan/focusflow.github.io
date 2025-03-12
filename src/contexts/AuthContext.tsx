
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  picture: string;
  image?: string; // Add image as an optional property for compatibility
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
  login: (userData: User) => void; // Added login function
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  isAuthenticated: false,
  login: () => {} // Default empty function
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Ensure compatibility by copying picture to image if needed
          if (parsedUser.picture && !parsedUser.image) {
            parsedUser.image = parsedUser.picture;
          }
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = (userData: User) => {
    // Ensure we have an image property for compatibility
    if (userData.picture && !userData.image) {
      userData.image = userData.picture;
    }
    
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
