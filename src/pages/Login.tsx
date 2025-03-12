
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Calendar, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleApiAvailable, setGoogleApiAvailable] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if the Google API is loaded
    const checkGoogleApi = () => {
      if (typeof window.google !== 'undefined') {
        setGoogleApiAvailable(true);
        initGoogleSignIn();
      } else {
        setGoogleApiAvailable(false);
        console.warn('Google API not available');
      }
    };
    
    // Don't attempt to render Google button if loading or no ref
    if (loading || !googleButtonRef.current) return;
    
    // Check for Google API
    checkGoogleApi();
    
    // Add script only if it doesn't exist
    const existingScript = document.getElementById('google-signin');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-signin';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = checkGoogleApi;
      document.body.appendChild(script);
    }
  }, [loading]);

  const initGoogleSignIn = () => {
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
      setGoogleApiAvailable(false);
    }
  };

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      // Verify the ID token here (you need a minimal backend for this)
      const idToken = response.credential;
      
      // For demo purposes only - in production, send to your backend for validation
      const userData = parseJwt(idToken);
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

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login for demonstration
    setTimeout(() => {
      const demoUser = {
        name: email.split('@')[0] || 'Demo User',
        email: email || 'demo@example.com',
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'Demo User')}&background=random`,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'Demo User')}&background=random`,
      };
      
      login(demoUser);
      toast.success("Successfully logged in with demo account!");
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">TaskTide</h1>
          <p className="text-muted-foreground">Manage your tasks and stay focused</p>
        </div>

        <div className="space-y-6">
          {googleApiAvailable ? (
            <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          ) : (
            <p className="text-amber-500 text-center text-sm">
              Google Sign-In is not available. Please use the demo login below.
            </p>
          )}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {googleApiAvailable ? 'Or' : 'Demo Login'}
              </span>
            </div>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password (any value)"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login with Demo Account"}
            </Button>
          </form>
          
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
