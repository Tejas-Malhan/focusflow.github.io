
import { Home, Clock, ListTodo, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Focus", href: "/focus", icon: Clock },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen fixed w-64 flex-col gap-y-5 border-r bg-white px-6">
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
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6"
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
        </ul>
      </nav>
    </div>
  );
}
