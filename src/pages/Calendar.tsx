
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Calendar() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<{ id: number; title: string; date: string }[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [newDate, setNewDate] = useState("");

  const connectCalendar = () => {
    setIsConnected(true);
    toast.success("Connected to Google Calendar");
  };

  const addEvent = () => {
    if (newEvent.trim() && newDate.trim()) {
      setEvents([...events, { id: Date.now(), title: newEvent, date: newDate }]);
      setNewEvent("");
      setNewDate("");
      toast.success("Event added to calendar");
    } else {
      toast.error("Please enter both event title and date");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage your schedule.
          </p>
        </div>

        {!isConnected ? (
          <Card className="p-6 flex flex-col items-center justify-center space-y-4">
            <CalendarIcon className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Connect to Google Calendar</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Connect your Google Calendar to sync your events, schedule focus sessions, and manage your tasks.
            </p>
            <Button onClick={connectCalendar}>
              Connect Google Calendar
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Add New Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Event title"
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <Button onClick={addEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
              {events.length === 0 ? (
                <p className="text-muted-foreground">No events scheduled yet.</p>
              ) : (
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
