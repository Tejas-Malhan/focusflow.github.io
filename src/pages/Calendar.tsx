
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

export default function Calendar() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Load events from database on component mount
  useEffect(() => {
    const savedEvents = db.getEvents();
    if (savedEvents.length) {
      setEvents(savedEvents);
    }
  }, []);

  // Save events to database whenever events change
  useEffect(() => {
    db.saveEvents(events);
  }, [events]);

  const addEvent = () => {
    if (newEvent.trim() && newDate.trim()) {
      const event: CalendarEvent = { 
        id: Date.now(), 
        title: newEvent, 
        date: newDate,
        time: newTime || undefined,
        description: newDescription || undefined
      };
      
      const updatedEvents = [...events, event];
      setEvents(updatedEvents);
      
      // Update stats
      const stats = db.getStats();
      db.updateStats({ eventsCreated: stats.eventsCreated + 1 });
      
      setNewEvent("");
      setNewDate("");
      setNewTime("");
      setNewDescription("");
      toast.success("Event added to calendar");
    } else {
      toast.error("Please enter both event title and date");
    }
  };

  const removeEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    toast.success("Event removed from calendar");
  };

  const clearAllEvents = () => {
    if (events.length === 0) {
      toast.info("No events to clear");
      return;
    }
    setEvents([]);
    toast.success("All events cleared");
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
              <h2 className="text-xl font-semibold">Add New Event</h2>
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
                      <p className="font-medium">{event.title}</p>
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
        </div>
      </div>
    </Layout>
  );
}
