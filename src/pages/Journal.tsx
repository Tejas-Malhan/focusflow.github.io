
import { useState, useEffect } from "react";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Edit3, Save, Archive, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { db, JournalEntry } from "@/lib/db";
import { toast } from "sonner";

export default function Journal() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [journalContent, setJournalContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [archivedEntries, setArchivedEntries] = useState<Record<string, JournalEntry[]>>({});
  const [activeTab, setActiveTab] = useState("current");

  // Get all entries for the current user
  useEffect(() => {
    if (user) {
      const userEntries = db.getJournalEntries(user.id);
      setEntries(userEntries);

      const archived = db.getArchivedJournalEntries(user.id);
      setArchivedEntries(archived);
    }
  }, [user]);

  // Load entry content when selected date changes
  useEffect(() => {
    if (user && selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const entry = db.getJournalEntry(dateStr, user.id);
      
      if (entry) {
        setJournalContent(entry.content);
      } else {
        setJournalContent("");
      }
      
      // Auto-enable editing for today and empty entries
      const isToday = isSameDay(selectedDate, new Date());
      setIsEditing(isToday && !entry);
    }
  }, [selectedDate, user]);

  const saveJournalEntry = () => {
    if (!user) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const now = new Date().toISOString();
    
    const existingEntry = db.getJournalEntry(dateStr, user.id);
    const entry: JournalEntry = {
      id: existingEntry?.id || `journal_${user.id}_${dateStr}`,
      date: dateStr,
      content: journalContent,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now
    };
    
    db.saveJournalEntry(entry, user.id);
    setIsEditing(false);
    
    // Refresh entries
    const userEntries = db.getJournalEntries(user.id);
    setEntries(userEntries);
    
    const archived = db.getArchivedJournalEntries(user.id);
    setArchivedEntries(archived);
    
    toast.success("Journal entry saved");
  };

  const currentMonthDays = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  });

  const hasEntryForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.some(entry => entry.date === dateStr);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-up">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Daily Journal</h1>
          <p className="text-muted-foreground">
            Record your thoughts, ideas, and reflections for each day.
          </p>
        </div>

        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Month</TabsTrigger>
            <TabsTrigger value="archive">Archives</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar Column */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>
                    {format(selectedDate, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription>
                    Select a day to view or edit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      hasEntry: (date) => hasEntryForDate(date)
                    }}
                    modifiersClassNames={{
                      hasEntry: "bg-primary/20 font-bold"
                    }}
                  />
                </CardContent>
              </Card>

              {/* Journal Entry Column */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription>
                      {isEditing ? "Editing entry" : "Journal entry"}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={saveJournalEntry}
                        disabled={!journalContent.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      placeholder="Write your thoughts for today..."
                      value={journalContent}
                      onChange={(e) => setJournalContent(e.target.value)}
                      className="min-h-[300px] resize-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <div className="min-h-[300px] p-3 border rounded-md bg-background">
                      {journalContent ? (
                        <div className="whitespace-pre-wrap">{journalContent}</div>
                      ) : (
                        <p className="text-muted-foreground text-center mt-20">
                          No entry for this date. Click edit to create one.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Month Entries List */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                  <CardDescription>
                    All entries for {format(selectedDate, 'MMMM yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {currentMonthDays.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const entry = entries.find(e => e.date === dateStr);
                        
                        return (
                          <div 
                            key={dateStr} 
                            className={cn(
                              "p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer",
                              isSameDay(day, selectedDate) && "border-primary bg-primary/10",
                              !entry && "opacity-60"
                            )}
                            onClick={() => setSelectedDate(day)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{format(day, 'EEEE, MMMM d')}</span>
                              {entry && (
                                <span className="text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  Updated {format(new Date(entry.updatedAt), 'h:mm a')}
                                </span>
                              )}
                            </div>
                            {entry ? (
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1 italic">
                                No entry yet
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="archive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Journal Archives</CardTitle>
                <CardDescription>
                  Access all your past journal entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(archivedEntries).length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No archived entries yet. Past months will be automatically archived here.
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(archivedEntries)
                      .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date descending
                      .map(([monthKey, monthEntries]) => {
                        const [year, month] = monthKey.split('-');
                        const monthDate = parse(`${year}-${month}-01`, 'yyyy-MM-dd', new Date());
                        
                        return (
                          <AccordionItem value={monthKey} key={monthKey}>
                            <AccordionTrigger>
                              <div className="flex items-center">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(monthDate, 'MMMM yyyy')} ({monthEntries.length} entries)
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ScrollArea className="h-[300px] mt-2">
                                <div className="space-y-4">
                                  {monthEntries
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(entry => {
                                      const entryDate = new Date(entry.date);
                                      
                                      return (
                                        <div 
                                          key={entry.id} 
                                          className="p-3 border rounded-md hover:bg-accent/50 transition-colors"
                                          onClick={() => {
                                            setSelectedDate(entryDate);
                                            setActiveTab("current");
                                          }}
                                        >
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">{format(entryDate, 'EEEE, MMMM d, yyyy')}</span>
                                          </div>
                                          <p className="text-sm text-muted-foreground mt-1 truncate">
                                            {entry.content.slice(0, 100)}{entry.content.length > 100 ? '...' : ''}
                                          </p>
                                          <div className="text-xs text-muted-foreground mt-2">
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            Last updated {format(new Date(entry.updatedAt), 'MMM d, yyyy h:mm a')}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </ScrollArea>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
