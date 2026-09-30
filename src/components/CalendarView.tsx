import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onOpenNewTaskWithDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleComplete,
  onTogglePin,
  onDeleteTask,
  onEditTask,
  onToggleSubtask,
  onStartPomodoro,
  onOpenNewTaskWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      if (!tasksByDate[t.dueDate]) {
        tasksByDate[t.dueDate] = [];
      }
      tasksByDate[t.dueDate].push(t);
    }
  });

  // Selected date tasks
  const selectedDayTasks = selectedDateStr ? (tasksByDate[selectedDateStr] || []) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      
      {/* Calendar Header */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {monthNames[month]} {year}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handlePrevMonth} className="btn-icon" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleToday} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Today
            </button>
            <button onClick={handleNextMonth} className="btn-icon" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <ChevronRight size={20} />
            </button>
          </div>

        </div>

        {/* Days of Week Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 0' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ minHeight: '75px', opacity: 0.2 }} />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                style={{
                  minHeight: '85px',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected
                    ? 'rgba(99, 102, 241, 0.25)'
                    : isToday
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.2)',
                  border: isSelected
                    ? '2px solid var(--accent-primary)'
                    : isToday
                    ? '1px solid var(--accent-amber)'
                    : '1px solid var(--surface-glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isToday ? 'var(--accent-amber)' : 'var(--text-primary)',
                    }}
                  >
                    {dayNum}
                  </span>

                  {dayTasks.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: 'var(--gradient-primary)',
                        color: '#fff',
                        borderRadius: '99px',
                        padding: '1px 6px'
                      }}
                    >
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Micro task dots or titles preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', overflow: 'hidden' }}>
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        background: t.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: t.completed ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {t.completed ? '✓ ' : ''}{t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Selected Day Task Detail Drawer / Section */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Tasks for {selectedDateStr}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {selectedDayTasks.length} action item(s) scheduled for this date
            </p>
          </div>

          <button
            onClick={() => onOpenNewTaskWithDate(selectedDateStr)}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add Task for {selectedDateStr}
          </button>
        </div>

        {selectedDayTasks.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No tasks scheduled for this date.</p>
          </div>
        ) : (
          <div>
            {selectedDayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onTogglePin={onTogglePin}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onToggleSubtask={onToggleSubtask}
                onStartPomodoro={onStartPomodoro}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
