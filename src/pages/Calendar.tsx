
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, Trash2, Clock, RefreshCw, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  description?: string;
  synced?: boolean;
  googleId?: string;
}

export default function Calendar() {
  const { user, syncWithGoogleCalendar, googleApiLoaded } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [syncStatus, setSyncStatus] = useState("not_synced"); // "not_synced", "syncing", "synced"
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load events from database on component mount
  useEffect(() => {
    if (user) {
      const savedEvents = db.getEvents(user.id);
      if (savedEvents.length) {
        setEvents(savedEvents);
        
        // Check if any events are synced to determine initial sync status
        const hasSyncedEvents = savedEvents.some(event => event.synced);
        if (hasSyncedEvents) {
          setSyncStatus("synced");
          
          // Set a fake last sync time
          const now = new Date();
          now.setMinutes(now.getMinutes() - 30); // 30 minutes ago
          setLastSyncTime(now.toISOString());
        }
      }
    }
  }, [user]);

  // Save events to database whenever events change
  useEffect(() => {
    if (user && events.length > 0) {
      db.saveEvents(events, user.id);
    }
  }, [events, user]);

  const addEvent = () => {
    if (newEvent.trim() && newDate.trim()) {
      const event: CalendarEvent = { 
        id: Date.now(), 
        title: newEvent, 
        date: newDate,
        time: newTime || undefined,
        description: newDescription || undefined,
        synced: false
      };
      
      const updatedEvents = [...events, event];
      setEvents(updatedEvents);
      
      // Update stats
      if (user) {
        const stats = db.getStats(user.id);
        db.updateStats({ eventsCreated: stats.eventsCreated + 1 }, user.id);
      }
      
      setNewEvent("");
      setNewDate("");
      setNewTime("");
      setNewDescription("");
      
      // If we were previously synced, we're now "out of sync"
      if (syncStatus === "synced") {
        setSyncStatus("not_synced");
      }
      
      toast.success("Event added to calendar");
    } else {
      toast.error("Please enter both event title and date");
    }
  };

  const removeEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    
    // If we were previously synced, we're now "out of sync"
    if (syncStatus === "synced") {
      setSyncStatus("not_synced");
    }
    
    toast.success("Event removed from calendar");
  };

  const clearAllEvents = () => {
    if (events.length === 0) {
      toast.info("No events to clear");
      return;
    }
    setEvents([]);
    
    // Reset sync status
    setSyncStatus("not_synced");
    setLastSyncTime(null);
    
    toast.success("All events cleared");
  };

  const handleGoogleSync = async () => {
    setSyncStatus("syncing");
    
    try {
      // Call the syncWithGoogleCalendar function from AuthContext
      const success = await syncWithGoogleCalendar();
      
      if (success) {
        // Refresh events to show synced status
        if (user) {
          const updatedEvents = db.getEvents(user.id);
          setEvents(updatedEvents);
          setSyncStatus("synced");
          
          // Set last sync time to now
          setLastSyncTime(new Date().toISOString());
        }
      } else {
        setSyncStatus("not_synced");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      setSyncStatus("not_synced");
      toast.error("An error occurred while syncing");
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-up">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Add New Event</h2>
                <div className="flex items-center gap-2">
                  {lastSyncTime && (
                    <span className="text-xs text-muted-foreground hidden md:inline-block">
                      Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
                    </span>
                  )}
                  <Button 
                    variant={syncStatus === "synced" ? "outline" : "default"}
                    onClick={handleGoogleSync}
                    disabled={syncStatus === "syncing" || (user?.isGuest ?? false)}
                    className="transition-all flex items-center gap-2"
                  >
                    {syncStatus === "syncing" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : syncStatus === "synced" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    
                    {syncStatus === "syncing" 
                      ? "Syncing..." 
                      : syncStatus === "synced" 
                        ? "Synced with Google" 
                        : "Sync with Google"}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Event title"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/50"
                />
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/50"
                />
                <Input
                  type="time"
                  placeholder="Time (optional)"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/50"
                />
                <Input
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button 
                onClick={addEvent}
                className="transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              {events.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={clearAllEvents}
                  className="transition-transform hover:scale-105"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
            
            {events.length === 0 ? (
              <p className="text-muted-foreground">No events scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <div 
                    key={event.id} 
                    className="flex justify-between items-center p-4 border rounded-md group hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        {event.synced && (
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-100">
                            Synced with Google
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{event.date}</span>
                        {event.time && (
                          <>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm mt-1">{event.description}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {user?.isGuest && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Google Calendar Sync Not Available</h3>
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Google Calendar sync is only available for users logged in with a Google account.
                Please sign out and log in with Google to access this feature.
              </p>
            </div>
          )}

          {!user?.isGuest && !googleApiLoaded && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Google Calendar API Not Available</h3>
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                The Google Calendar API couldn't be loaded. The "Sync with Google" button currently simulates this functionality for demonstration purposes.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
