import type { Task, UserStats } from '../types';

const STORAGE_KEY_TASKS = 'taskpulse_tasks_v1';
const STORAGE_KEY_STATS = 'taskpulse_stats_v1';
const STORAGE_KEY_THEME = 'taskpulse_theme_v1';

export const getInitialTasks = (): Task[] => {
  const saved = localStorage.getItem(STORAGE_KEY_TASKS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fall through to sample data
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];

  return [
    {
      id: 'task-1',
      title: 'Design TaskPulse Pro UI Components 🎨',
      description: 'Craft glassmorphic cards, vibrant gradient accents, and responsive layout for desktop and mobile.',
      category: 'Work',
      priority: 'high',
      status: 'in_progress',
      dueDate: today,
      dueTime: '16:00',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
      tags: ['Design', 'UI/UX', 'Vite'],
      estimatedMinutes: 60,
      subtasks: [
        { id: 'st-1', title: 'Define CSS variables and color tokens', completed: true },
        { id: 'st-2', title: 'Implement Kanban drag-and-drop board', completed: false },
        { id: 'st-3', title: 'Add Confetti celebration effect', completed: true },
      ],
    },
    {
      id: 'task-2',
      title: 'Morning 5km Run & Stretching 🏃‍♂️',
      description: 'Cardio workout and mindfulness session before starting focus hours.',
      category: 'Fitness',
      priority: 'medium',
      status: 'completed',
      dueDate: today,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: ['Health', 'MorningRoutine'],
      estimatedMinutes: 45,
      subtasks: [
        { id: 'st-4', title: '5km outdoor jog', completed: true },
        { id: 'st-5', title: '10 min full body stretch', completed: true },
      ],
    },
    {
      id: 'task-3',
      title: 'Prepare Weekly Q3 Project Roadmap 📊',
      description: 'Review pending feature requests and assemble sprint deliverables for engineering review.',
      category: 'Work',
      priority: 'high',
      status: 'todo',
      dueDate: tomorrow,
      dueTime: '11:00',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
      tags: ['Strategy', 'Planning'],
      estimatedMinutes: 90,
      subtasks: [
        { id: 'st-6', title: 'Gather metric inputs from analytics', completed: false },
        { id: 'st-7', title: 'Draft key milestone timeline', completed: false },
      ],
    },
    {
      id: 'task-4',
      title: 'Groceries: Fresh Organic Vegetables & Fruit 🛒',
      description: 'Pick up avocados, sourdough bread, berries, almond milk, and green tea.',
      category: 'Shopping',
      priority: 'low',
      status: 'todo',
      dueDate: today,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: ['Errands', 'Home'],
      estimatedMinutes: 30,
      subtasks: [],
    },
    {
      id: 'task-5',
      title: 'Read Chapter 4 of "Atomic Habits" 📖',
      description: 'Highlight key takeaways regarding cue triggers and friction reduction.',
      category: 'Personal',
      priority: 'medium',
      status: 'todo',
      dueDate: tomorrow,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      tags: ['Learning', 'SelfImprovement'],
      estimatedMinutes: 30,
      subtasks: [],
    }
  ];
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
};

export const getInitialStats = (): UserStats => {
  const saved = localStorage.getItem(STORAGE_KEY_STATS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fall through
    }
  }
  return {
    completedCount: 1,
    streakDays: 3,
    lastCompletedDate: new Date().toISOString().split('T')[0],
    totalTimeSpentMinutes: 45
  };
};

export const saveStats = (stats: UserStats): void => {
  localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
};

export const getStoredTheme = (): 'dark' | 'light' => {
  const saved = localStorage.getItem(STORAGE_KEY_THEME);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
};

export const saveStoredTheme = (theme: 'dark' | 'light'): void => {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
};

export const exportDataAsJson = (tasks: Task[], stats: UserStats): void => {
  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tasks,
    stats,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `taskpulse_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

