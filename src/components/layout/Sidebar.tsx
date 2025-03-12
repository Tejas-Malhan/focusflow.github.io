
import { Home, Clock, ListTodo, Calendar, Sun, Moon, User, Book } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Focus", href: "/focus", icon: Clock },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Journal", href: "/journal", icon: Book },
];

export function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  // Helper function to get profile image
  const getProfileImage = () => {
    if (user?.image) return user.image;
    if (user?.picture) return user.picture;
    return null;
  }

  return (
    <div className="flex h-screen fixed w-64 flex-col gap-y-5 border-r bg-card px-6 transition-colors">
      <div className="flex h-16 shrink-0 items-center">
        <span className="text-xl font-semibold">TaskTide</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      location.pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors"
                    )}
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          
          <li className="mt-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mb-2 w-full justify-start px-2"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-6 w-6 mr-3" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-6 w-6 mr-3" />
                  <span>Light Mode</span>
                </>
              )}
            </Button>
            
            <Link
              to="/profile"
              className={cn(
                location.pathname === "/profile"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                "group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors"
              )}
            >
              {getProfileImage() ? (
                <img
                  src={getProfileImage()}
                  alt={user?.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User className="h-6 w-6 shrink-0" />
              )}
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
