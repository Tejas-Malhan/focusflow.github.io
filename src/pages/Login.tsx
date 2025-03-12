
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Calendar } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
    if (typeof window.google === 'undefined') {
      console.warn('Google API not available');
      return;
    }

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
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }, [loading]); // Only re-run when loading changes

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      // Verify the ID token here (you need a minimal backend for this)
      const idToken = response.credential;
      
      // For demo purposes only - in production, send to your backend for validation
      const userData = parseJwt(idToken);
      localStorage.setItem("user", JSON.stringify(userData));
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
