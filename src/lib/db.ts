
// This simulates a database service using localStorage as storage
// In a real app, this would connect to PostgreSQL or another database

export interface Stats {
  focusMinutes: number;
  tasksCompleted: number;
  eventsCreated: number;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO format date string
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const db = {
  // User stats
  getStats: (userId?: string): Stats => {
    const statsKey = userId ? `user_stats_${userId}` : 'user_stats';
    const stats = localStorage.getItem(statsKey);
    return stats ? JSON.parse(stats) : { focusMinutes: 0, tasksCompleted: 0, eventsCreated: 0 };
  },

  updateStats: (updates: Partial<Stats>, userId?: string) => {
    const statsKey = userId ? `user_stats_${userId}` : 'user_stats';
    const currentStats = db.getStats(userId);
    const newStats = { ...currentStats, ...updates };
    localStorage.setItem(statsKey, JSON.stringify(newStats));
    return newStats;
  },

  // Task methods
  saveTasks: (tasks: any[], userId?: string) => {
    const tasksKey = userId ? `tasks_${userId}` : 'tasks';
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  },

  getTasks: (userId?: string) => {
    const tasksKey = userId ? `tasks_${userId}` : 'tasks';
    const tasks = localStorage.getItem(tasksKey);
    return tasks ? JSON.parse(tasks) : [];
  },

  // Calendar events
  saveEvents: (events: any[], userId?: string) => {
    const eventsKey = userId ? `calendar_events_${userId}` : 'calendar_events';
    localStorage.setItem(eventsKey, JSON.stringify(events));
  },

  getEvents: (userId?: string) => {
    const eventsKey = userId ? `calendar_events_${userId}` : 'calendar_events';
    const events = localStorage.getItem(eventsKey);
    return events ? JSON.parse(events) : [];
  },

  // Focus sessions
  saveFocusSessions: (sessions: any[], userId?: string) => {
    const sessionsKey = userId ? `focus_sessions_${userId}` : 'focus_sessions';
    localStorage.setItem(sessionsKey, JSON.stringify(sessions));
  },

  getFocusSessions: (userId?: string) => {
    const sessionsKey = userId ? `focus_sessions_${userId}` : 'focus_sessions';
    const sessions = localStorage.getItem(sessionsKey);
    return sessions ? JSON.parse(sessions) : [];
  },

  // Journal entries
  saveJournalEntry: (entry: JournalEntry, userId?: string) => {
    const entries = db.getJournalEntries(userId);
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    const journalKey = userId ? `journal_entries_${userId}` : 'journal_entries';
    localStorage.setItem(journalKey, JSON.stringify(entries));
    return entry;
  },

  getJournalEntries: (userId?: string): JournalEntry[] => {
    const journalKey = userId ? `journal_entries_${userId}` : 'journal_entries';
    const entries = localStorage.getItem(journalKey);
    return entries ? JSON.parse(entries) : [];
  },

  getJournalEntry: (date: string, userId?: string): JournalEntry | undefined => {
    const entries = db.getJournalEntries(userId);
    return entries.find(entry => entry.date === date);
  },

  // Get archived journal entries (entries from previous months)
  getArchivedJournalEntries: (userId?: string): Record<string, JournalEntry[]> => {
    const allEntries = db.getJournalEntries(userId);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const archived: Record<string, JournalEntry[]> = {};
    
    allEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth();
      
      // Skip current month entries
      if (entryYear === currentYear && entryMonth === currentMonth) {
        return;
      }
      
      const key = `${entryYear}-${String(entryMonth + 1).padStart(2, '0')}`;
      if (!archived[key]) {
        archived[key] = [];
      }
      
      archived[key].push(entry);
    });
    
    return archived;
  }
};
