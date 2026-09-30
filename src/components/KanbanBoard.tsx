import React, { useState } from 'react';
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Task, Status } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onUpdateStatus: (taskId: string, newStatus: Status) => void;
  onOpenNewTaskWithStatus: (status: Status) => void;
}

const COLUMNS: { id: Status; title: string; icon: string; accentColor: string }[] = [
  { id: 'todo', title: 'To Do', icon: '📋', accentColor: 'var(--accent-primary)' },
  { id: 'in_progress', title: 'In Progress', icon: '⏳', accentColor: 'var(--accent-amber)' },
  { id: 'completed', title: 'Completed', icon: '✅', accentColor: 'var(--accent-emerald)' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onToggleComplete,
  onTogglePin,
  onDeleteTask,
  onEditTask,
  onToggleSubtask,
  onStartPomodoro,
  onUpdateStatus,
  onOpenNewTaskWithStatus,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        alignItems: 'start',
        marginBottom: '32px'
      }}
    >
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="glass-panel"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{
              padding: '20px',
              minHeight: '480px',
              display: 'flex',
              flexDirection: 'column',
              borderTop: `4px solid ${col.accentColor}`,
              background: 'rgba(15, 23, 42, 0.4)'
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--surface-glass-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{col.icon}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{col.title}</h3>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)'
                  }}
                >
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenNewTaskWithStatus(col.id)}
                className="btn-icon"
                title={`Add task to ${col.title}`}
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Task List Container */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {columnTasks.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 16px',
                    border: '2px dashed var(--surface-glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    fontSize: '0.88rem'
                  }}
                >
                  <p>Drop tasks here or click '+' above</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    style={{ cursor: 'grab' }}
                  >
                    <TaskCard
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onTogglePin={onTogglePin}
                      onDeleteTask={onDeleteTask}
                      onEditTask={onEditTask}
                      onToggleSubtask={onToggleSubtask}
                      onStartPomodoro={onStartPomodoro}
                    />
                    
                    {/* Quick Move Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '-8px', marginBottom: '8px', paddingRight: '8px' }}>
                      {col.id !== 'todo' && (
                        <button
                          onClick={() => onUpdateStatus(task.id, col.id === 'completed' ? 'in_progress' : 'todo')}
                          className="btn-icon"
                          style={{ fontSize: '0.72rem', padding: '2px 8px', height: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}
                          title="Move Left"
                        >
                          <ArrowLeft size={12} /> Prev State
                        </button>
                      )}
                      {col.id !== 'completed' && (
                        <button
                          onClick={() => onUpdateStatus(task.id, col.id === 'todo' ? 'in_progress' : 'completed')}
                          className="btn-icon"
                          style={{ fontSize: '0.72rem', padding: '2px 8px', height: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}
                          title="Move Right"
                        >
                          Next State <ArrowRight size={12} />
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
