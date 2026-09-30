import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { Task, UserStats, ViewMode, FilterState, Status } from './types';
import { 
  getInitialTasks, 
  saveTasks, 
  getInitialStats, 
  saveStats, 
  getStoredTheme, 
  saveStoredTheme,
  exportDataAsJson
} from './utils/storage';
import { soundFx } from './utils/sound';

import { Navbar } from './components/Navbar';
import { StatsHeader } from './components/StatsHeader';
import { FilterBar } from './components/FilterBar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { PomodoroModal } from './components/PomodoroModal';
import { DataBackupModal } from './components/DataBackupModal';
import { Inbox } from 'lucide-react';

function App() {
  // --- Persisted App State ---
  const [tasks, setTasks] = useState<Task[]>(() => getInitialTasks());
  const [stats, setStats] = useState<UserStats>(() => getInitialStats());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // --- UI Navigation State ---
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // --- Filter State ---
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    priority: 'all',
    status: 'all',
    selectedTag: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // --- Batch Operations State ---
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // --- Modal States ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialModalDueDate, setInitialModalDueDate] = useState<string | undefined>();
  const [initialModalStatus, setInitialModalStatus] = useState<Status | undefined>();

  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState<Task | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // --- Persist Tasks ---
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // --- Persist Stats ---
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // --- Apply Theme ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveStoredTheme(theme);
  }, [theme]);

  // --- Sync Sound Manager ---
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  // --- Global Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' key to focus search bar if not typing in input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('task-search-input');
        if (searchInput) searchInput.focus();
      }
      // Esc key closes modals
      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsPomodoroOpen(false);
        setIsImportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Confetti helper ---
  const triggerConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // --- Task Operations ---
  const handleToggleComplete = useCallback((id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          if (newCompleted) {
            soundFx.playCompleteSound();
            triggerConfetti();

            // Update user stats
            const todayStr = new Date().toISOString().split('T')[0];
            setStats((prev) => {
              let streak = prev.streakDays;
              if (prev.lastCompletedDate !== todayStr) {
                // If last completion was yesterday or null, increment
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yestStr = yesterday.toISOString().split('T')[0];
                if (prev.lastCompletedDate === yestStr || !prev.lastCompletedDate) {
                  streak += 1;
                } else {
                  streak = 1; // reset streak if gap
                }
              }
              return {
                ...prev,
                completedCount: prev.completedCount + 1,
                streakDays: streak,
                lastCompletedDate: todayStr,
              };
            });
          }
          return {
            ...t,
            completed: newCompleted,
            status: newCompleted ? 'completed' : 'todo',
            completedAt: newCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  }, []);

  const handleTogglePin = (id: string) => {
    soundFx.playClickSound();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned, updatedAt: new Date().toISOString() } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    soundFx.playDeleteSound();
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskIds((prev) => prev.filter((taskId) => taskId !== id));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    soundFx.playClickSound();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          // Auto complete parent task if all subtasks completed
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          return {
            ...t,
            subtasks: updatedSubtasks,
            completed: allCompleted ? true : t.completed,
            status: allCompleted ? 'completed' : t.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleUpdateStatus = (taskId: string, newStatus: Status) => {
    soundFx.playClickSound();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isComp = newStatus === 'completed';
          if (isComp && !t.completed) {
            soundFx.playCompleteSound();
            triggerConfetti();
          }
          return {
            ...t,
            status: newStatus,
            completed: isComp,
            completedAt: isComp ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    soundFx.playClickSound();
    const now = new Date().toISOString();

    if (editId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editId
            ? {
                ...t,
                ...taskData,
                updatedAt: now,
              }
            : t
        )
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: 'task-' + Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // --- Modal Open Helpers ---
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setInitialModalDueDate(undefined);
    setInitialModalStatus(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskWithDate = (dateStr: string) => {
    setTaskToEdit(null);
    setInitialModalDueDate(dateStr);
    setInitialModalStatus(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTaskWithStatus = (status: Status) => {
    setTaskToEdit(null);
    setInitialModalDueDate(undefined);
    setInitialModalStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenPomodoro = (task?: Task) => {
    if (task) setPomodoroTask(task);
    setIsPomodoroOpen(true);
  };

  const handleAddFocusTime = useCallback((minutes: number) => {
    setStats((prev) => ({
      ...prev,
      totalTimeSpentMinutes: prev.totalTimeSpentMinutes + minutes,
    }));
  }, []);

  // --- Batch Select Helpers ---
  const handleSelectToggle = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleBatchComplete = () => {
    soundFx.playCompleteSound();
    triggerConfetti();
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.includes(t.id)
          ? { ...t, completed: true, status: 'completed', completedAt: new Date().toISOString() }
          : t
      )
    );
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    soundFx.playDeleteSound();
    setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id)));
    setSelectedTaskIds([]);
  };

  // --- Collect All Unique Tags ---
  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  // --- Filter and Sort Engine ---
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter((t) => {
      // Search Query
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query);
        const matchCategory = t.category.toLowerCase().includes(query);
        const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchTitle && !matchDesc && !matchCategory && !matchTag) return false;
      }

      // Category Filter
      if (filterState.category !== 'all' && t.category !== filterState.category) {
        return false;
      }

      // Priority Filter
      if (filterState.priority !== 'all' && t.priority !== filterState.priority) {
        return false;
      }

      // Tag Filter
      if (filterState.selectedTag && !t.tags?.includes(filterState.selectedTag)) {
        return false;
      }

      // Status Filter
      if (filterState.status === 'active' && t.completed) return false;
      if (filterState.status === 'completed' && !t.completed) return false;
      if (filterState.status === 'pinned' && !t.isPinned) return false;
      if (filterState.status === 'today' && (t.completed || t.dueDate !== todayStr)) return false;
      if (filterState.status === 'overdue' && (t.completed || !t.dueDate || t.dueDate >= todayStr)) return false;

      return true;
    }).sort((a, b) => {
      // Pinned items always float to top unless sorting specifically
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      let comparison = 0;

      if (filterState.sortBy === 'dueDate') {
        const dateA = a.dueDate || '9999-99-99';
        const dateB = b.dueDate || '9999-99-99';
        comparison = dateA.localeCompare(dateB);
      } else if (filterState.sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (filterState.sortBy === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filterState.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return filterState.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filterState]);

  // Separate Pinned and Other tasks for List View
  const pinnedTasks = useMemo(() => filteredTasks.filter((t) => t.isPinned), [filteredTasks]);
  const otherTasks = useMemo(() => filteredTasks.filter((t) => !t.isPinned), [filteredTasks]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      
      {/* Top Navbar */}
      <Navbar
        searchQuery={filterState.searchQuery}
        setSearchQuery={(query) => setFilterState((prev) => ({ ...prev, searchQuery: query }))}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        soundEnabled={soundEnabled}
        toggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenNewTask={handleOpenNewTask}
        onOpenPomodoro={() => handleOpenPomodoro()}
      />

      {/* Stats Quick Bar */}
      <StatsHeader tasks={tasks} stats={stats} />

      {/* Main Content Views */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onToggleComplete={handleToggleComplete}
          onTogglePin={handleTogglePin}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenEditTask}
          onToggleSubtask={handleToggleSubtask}
          onStartPomodoro={handleOpenPomodoro}
          onUpdateStatus={handleUpdateStatus}
          onOpenNewTaskWithStatus={handleOpenNewTaskWithStatus}
        />
      ) : viewMode === 'calendar' ? (
        <CalendarView
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onTogglePin={handleTogglePin}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenEditTask}
          onToggleSubtask={handleToggleSubtask}
          onStartPomodoro={handleOpenPomodoro}
          onOpenNewTaskWithDate={handleOpenNewTaskWithDate}
        />
      ) : viewMode === 'analytics' ? (
        <AnalyticsView tasks={tasks} stats={stats} />
      ) : (
        /* Default List View */
        <>
          <FilterBar
            filterState={filterState}
            setFilterState={setFilterState}
            allTags={allTags}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            selectedTaskIds={selectedTaskIds}
            onSelectAll={handleSelectAll}
            onBatchComplete={handleBatchComplete}
            onBatchDelete={handleBatchDelete}
            onExportData={() => exportDataAsJson(tasks, stats)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />

          {filteredTasks.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginBottom: '32px'
              }}
            >
              <Inbox size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No tasks match your criteria
              </h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                Try adjusting your search filters or create a new task to boost your flow!
              </p>
              <button onClick={handleOpenNewTask} className="btn btn-primary">
                + Create New Task
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '32px' }}>
              
              {/* Pinned Tasks Section */}
              {pinnedTasks.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⭐ Pinned Focus Tasks ({pinnedTasks.length})
                  </h3>
                  {pinnedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onTogglePin={handleTogglePin}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={handleOpenEditTask}
                      onToggleSubtask={handleToggleSubtask}
                      onStartPomodoro={handleOpenPomodoro}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onSelectToggle={handleSelectToggle}
                      showSelectCheckbox={batchMode}
                    />
                  ))}
                </div>
              )}

              {/* Other Tasks Section */}
              {otherTasks.length > 0 && (
                <div>
                  {pinnedTasks.length > 0 && (
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                      All Tasks ({otherTasks.length})
                    </h3>
                  )}
                  {otherTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onTogglePin={handleTogglePin}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={handleOpenEditTask}
                      onToggleSubtask={handleToggleSubtask}
                      onStartPomodoro={handleOpenPomodoro}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onSelectToggle={handleSelectToggle}
                      showSelectCheckbox={batchMode}
                    />
                  ))}
                </div>
              )}

            </div>
          )}
        </>
      )}

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialDueDate={initialModalDueDate}
        initialStatus={initialModalStatus}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        activeTask={pomodoroTask}
        tasks={tasks}
        onAddFocusTime={handleAddFocusTime}
        onToggleCompleteTask={handleToggleComplete}
      />

      {/* Import / Export Backup Modal */}
      <DataBackupModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        tasks={tasks}
        stats={stats}
        onImportSuccess={(importedTasks, importedStats) => {
          setTasks(importedTasks);
          if (importedStats) setStats(importedStats);
        }}
      />

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--surface-glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>TaskPulse Pro — Built with React, TypeScript & Vite</p>
      </footer>

    </div>
  );
}

export default App;
