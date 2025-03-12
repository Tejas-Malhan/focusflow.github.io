
// This simulates a database service using localStorage as storage
// In a real app, this would connect to PostgreSQL or another database

export interface Stats {
  focusMinutes: number;
  tasksCompleted: number;
  eventsCreated: number;
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
  }
};
