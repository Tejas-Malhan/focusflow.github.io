
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { db, Stats } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ focusMinutes: 0, tasksCompleted: 0, eventsCreated: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Load stats from database
    const currentStats = db.getStats();
    setStats(currentStats);
    
    // Load other data to display on overview
    setTasks(db.getTasks());
    setEvents(db.getEvents());
  }, []);

  // Calculate today's focus time, tasks, and events
  const todayFocusTime = Math.min(150, stats.focusMinutes); // Mock today's value (capped for UI)
  
  const todaysTasks = tasks.filter(task => {
    // In a real app, we would filter tasks by today's date
    return true; // Show all tasks for now
  });
  
  const todaysEvents = events.filter(event => {
    const today = new Date().toISOString().split('T')[0];
    return event.date === today;
  });

  // Format hours and minutes
  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-up">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your productivity today.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 transition-transform hover:scale-105">
            <h3 className="font-semibold">Focus Time</h3>
            <p className="mt-2 text-3xl font-bold">{formatFocusTime(todayFocusTime)}</p>
            <p className="text-sm text-muted-foreground">Today's total focus time</p>
          </Card>
          
          <Card className="p-6 transition-transform hover:scale-105">
            <h3 className="font-semibold">Tasks</h3>
            <p className="mt-2 text-3xl font-bold">
              {todaysTasks.filter(t => t.completed).length}/{todaysTasks.length}
            </p>
            <p className="text-sm text-muted-foreground">Tasks completed today</p>
          </Card>
          
          <Card className="p-6 transition-transform hover:scale-105">
            <h3 className="font-semibold">Calendar</h3>
            <p className="mt-2 text-3xl font-bold">{todaysEvents.length}</p>
            <p className="text-sm text-muted-foreground">Upcoming events today</p>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Lifetime Statistics</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total focus time:</span>
                <span className="font-medium">{formatFocusTime(stats.focusMinutes)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Tasks completed:</span>
                <span className="font-medium">{stats.tasksCompleted}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Events created:</span>
                <span className="font-medium">{stats.eventsCreated}</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            {tasks.length === 0 && events.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              <ul className="space-y-2">
                {tasks.slice(0, 3).map(task => (
                  <li key={task.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                      {task.title}
                    </span>
                  </li>
                ))}
                {events.slice(0, 3).map(event => (
                  <li key={event.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>{event.title} - {event.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
