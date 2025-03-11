
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Calendar } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background p-6 transition-colors">
      <Card className="w-full max-w-md space-y-8 p-8 animate-fade-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">TaskTide</h1>
          <p className="text-muted-foreground">Manage your tasks and stay focused</p>
        </div>

        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full" 
            onClick={login}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          
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
