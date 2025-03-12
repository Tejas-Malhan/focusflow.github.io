
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const { user, loading, login, googleApiLoaded } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleErrorShown, setGoogleErrorShown] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Don't attempt to render Google button if loading or no ref
    if (loading || !googleButtonRef.current) return;
    
    // Check if the Google API is loaded
    if (googleApiLoaded) {
      try {
        window.google.accounts.id.initialize({
          client_id: "1022190958510-l4m2ikl300j7otqgc00nb89fr4hq6p0d.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { 
            type: "standard",
            theme: "outline",
            size: "large",
            width: "400",
            text: "signin_with",
          }
        );
        
        // Reset error state if Google API loads
        setGoogleErrorShown(false);
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        if (!googleErrorShown) {
          setGoogleErrorShown(true);
        }
      }
    } else if (!googleErrorShown) {
      // Show error message if Google API isn't available after 3 seconds
      setTimeout(() => {
        if (!googleApiLoaded && !googleErrorShown) {
          setGoogleErrorShown(true);
        }
      }, 3000);
    }
  }, [loading, googleApiLoaded, googleErrorShown]); 

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      // In a real app, verify the ID token on your backend
      const idToken = response.credential;
      const userData = parseJwt(idToken);
      
      // Use the login function from AuthContext
      login(userData);
      
      toast.success("Successfully logged in!");
      navigate('/');
    } catch (error) {
      toast.error("Authentication failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Demo login for testing (when Google API is not available)
  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser = {
        name: "Demo User",
        email: "demo@example.com",
        picture: "https://ui-avatars.com/api/?name=Demo+User&background=random",
        id: "demo_user_123"
      };
      
      login(demoUser);
      toast.success("Logged in as Demo User");
      navigate('/');
      setIsLoading(false);
    }, 1000);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-6 transition-colors">
      <Card className="w-full max-w-md space-y-8 p-8 animate-fade-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">FocusFlow</h1>
          <p className="text-muted-foreground">Manage your tasks and stay focused</p>
        </div>

        <div className="space-y-4">
          <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          
          {googleErrorShown && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800 text-sm">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Google Sign-In not available</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Google Sign-In couldn't be loaded. You can try refreshing the page or use the demo login below.
              </p>
            </div>
          )}
          
          {googleErrorShown && (
            <Button 
              className="w-full" 
              onClick={handleDemoLogin} 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Demo Login"}
            </Button>
          )}
          
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you'll be able to sync with Google Calendar
            and save your progress across devices.
          </p>
        </div>

        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Connect once, access everywhere</span>
        </div>
      </Card>
    </div>
  );
}
