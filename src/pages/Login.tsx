
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Calendar, AlertCircle, User } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const { user, loading, login, loginAsGuest, googleApiLoaded } = useAuth();
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
      
      // Use the login function from AuthContext with google token
      login({
        ...userData,
        googleToken: idToken // Store the token for Google Calendar access
      });
      
      toast.success("Successfully logged in with Google!");
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

  // Guest login handler
  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsGuest();
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
                Google Sign-In couldn't be loaded. You can still use guest login below.
              </p>
            </div>
          )}
          
          <Separator className="my-4">
            <span className="px-2 text-xs text-muted-foreground">OR</span>
          </Separator>
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleGuestLogin} 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : (
              <>
                <User className="mr-2 h-4 w-4" />
                Continue as Guest
              </>
            )}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            <strong>Note:</strong> Guest accounts have limited functionality.
            Sign in with Google to sync with Google Calendar.
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
