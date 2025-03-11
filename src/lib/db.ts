
// This simulates a database service using localStorage as storage
// In a real app, this would connect to PostgreSQL or another database

export interface Stats {
  focusMinutes: number;
  tasksCompleted: number;
  eventsCreated: number;
}

export const db = {
  // User stats
  getStats: (): Stats => {
    const stats = localStorage.getItem('user_stats');
    return stats ? JSON.parse(stats) : { focusMinutes: 0, tasksCompleted: 0, eventsCreated: 0 };
  },

  updateStats: (updates: Partial<Stats>) => {
    const currentStats = db.getStats();
    const newStats = { ...currentStats, ...updates };
    localStorage.setItem('user_stats', JSON.stringify(newStats));
    return newStats;
  },

  // Task methods
  saveTasks: (tasks: any[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },

  getTasks: () => {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  },

  // Calendar events
  saveEvents: (events: any[]) => {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  },

  getEvents: () => {
    const events = localStorage.getItem('calendar_events');
    return events ? JSON.parse(events) : [];
  },

  // Focus sessions
  saveFocusSessions: (sessions: any[]) => {
    localStorage.setItem('focus_sessions', JSON.stringify(sessions));
  },

  getFocusSessions: () => {
    const sessions = localStorage.getItem('focus_sessions');
    return sessions ? JSON.parse(sessions) : [];
  }
};
