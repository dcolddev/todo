export type Priority = 'low' | 'medium' | 'high';

export type Status = 'todo' | 'in_progress' | 'completed';

export type Category = 'Work' | 'Personal' | 'Shopping' | 'Fitness' | 'Ideas' | 'Finance' | 'Health' | 'Other';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  status: Status;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks: SubTask[];
  isPinned?: boolean;
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
}

export type ViewMode = 'list' | 'kanban' | 'calendar' | 'analytics';

export type FilterPriority = 'all' | Priority;
export type FilterStatus = 'all' | 'active' | 'completed' | 'pinned' | 'today' | 'overdue';

export interface FilterState {
  searchQuery: string;
  category: string;
  priority: FilterPriority;
  status: FilterStatus;
  selectedTag: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface UserStats {
  completedCount: number;
  streakDays: number;
  lastCompletedDate: string | null;
  totalTimeSpentMinutes: number;
}
