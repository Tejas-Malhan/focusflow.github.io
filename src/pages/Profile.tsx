
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Clock, CheckSquare, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";

export default function Profile() {
  const { user, logout } = useAuth();
  const stats = db.getStats();
  
  // Helper function to get profile image
  const getProfileImage = () => {
    if (user?.image) return user.image;
    if (user?.picture) return user.picture;
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and view your stats.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt={user?.name} 
                    className="h-16 w-16 rounded-full border-2 border-border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xl font-semibold">{user?.name?.charAt(0)}</span>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Connected with Google
                </p>
                <Button variant="destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100">
            <CardHeader>
              <CardTitle>Lifetime Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">{stats.focusMinutes} minutes</h3>
                  <p className="text-sm text-muted-foreground">Total focus time</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckSquare className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">{stats.tasksCompleted} tasks</h3>
                  <p className="text-sm text-muted-foreground">Completed tasks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">{stats.eventsCreated} events</h3>
                  <p className="text-sm text-muted-foreground">Calendar events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
