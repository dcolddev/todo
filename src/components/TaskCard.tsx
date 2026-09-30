import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square, 
  Tag, 
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import type { Task, SubTask } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  isSelected?: boolean;
  onSelectToggle?: (id: string) => void;
  showSelectCheckbox?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onTogglePin,
  onDeleteTask,
  onEditTask,
  onToggleSubtask,
  onStartPomodoro,
  isSelected = false,
  onSelectToggle,
  showSelectCheckbox = false,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Check if task is overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && !task.completed && task.dueDate < todayStr;

  const categoryIcons: Record<string, string> = {
    Work: '💼',
    Personal: '👤',
    Shopping: '🛒',
    Fitness: '🏋️‍♂️',
    Ideas: '💡',
    Finance: '💰',
    Health: '🩺',
    Other: '📌',
  };

  return (
    <div
      className={`glass-panel animate-fade-in ${task.completed ? 'completed-card' : ''}`}
      style={{
        padding: '18px 20px',
        marginBottom: '12px',
        borderLeft: `4px solid ${
          task.priority === 'high' ? 'var(--accent-rose)' : task.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)'
        }`,
        opacity: task.completed ? 0.75 : 1,
        background: task.isPinned ? 'rgba(99, 102, 241, 0.08)' : undefined,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        
        {/* Batch selection checkbox */}
        {showSelectCheckbox && onSelectToggle && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectToggle(task.id)}
            className="custom-checkbox"
            style={{ marginTop: '3px' }}
          />
        )}

        {/* Task Completion Toggle */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="custom-checkbox"
          style={{ marginTop: '3px' }}
          id={`checkbox-${task.id}`}
        />

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Header Row: Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
              <span style={{ fontSize: '1.1rem' }}>{categoryIcons[task.category] || '📌'}</span>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  wordBreak: 'break-word',
                }}
              >
                {task.title}
              </h3>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Category Pill */}
              <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                {task.category}
              </span>

              {/* Priority Badge */}
              <span className={`badge badge-${task.priority}`}>
                {task.priority === 'high' ? '🔥 High' : task.priority === 'medium' ? '⚡ Med' : '🍃 Low'}
              </span>

              {/* Pin Button */}
              <button
                onClick={() => onTogglePin(task.id)}
                className="btn-icon"
                title={task.isPinned ? 'Unpin task' : 'Pin task to top'}
                style={{ color: task.isPinned ? '#fbbf24' : 'var(--text-muted)' }}
              >
                <Star size={18} fill={task.isPinned ? '#fbbf24' : 'none'} />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line' }}>
              {task.description}
            </p>
          )}

          {/* Metadata Row: Due Date, Estimated Time, Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            
            {/* Due Date */}
            {task.dueDate && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: isOverdue ? 'var(--accent-rose)' : 'var(--text-secondary)',
                fontWeight: isOverdue ? 700 : 500
              }}>
                {isOverdue ? <AlertTriangle size={14} color="var(--accent-rose)" /> : <Calendar size={14} />}
                {task.dueDate} {task.dueTime && `@ ${task.dueTime}`}
                {isOverdue && ' (Overdue)'}
              </span>
            )}

            {/* Estimated Minutes */}
            {task.estimatedMinutes && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} /> {task.estimatedMinutes}m est.
              </span>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} />
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--accent-primary)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks Summary Trigger */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                Subtasks ({completedSubtasks}/{totalSubtasks})
                {showSubtasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Expandable Subtask List */}
          {showSubtasks && totalSubtasks > 0 && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-md)' }}>
              
              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', marginBottom: '10px' }}>
                <div style={{ width: `${subtaskProgress}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '99px', transition: 'width 0.3s ease' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {task.subtasks.map((st: SubTask) => (
                  <div
                    key={st.id}
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: st.completed ? 'line-through' : 'none'
                    }}
                  >
                    {st.completed ? (
                      <CheckSquare size={16} color="var(--accent-emerald)" />
                    ) : (
                      <Square size={16} color="var(--text-muted)" />
                    )}
                    <span>{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onStartPomodoro && !task.completed && (
            <button
              onClick={() => onStartPomodoro(task)}
              className="btn-icon"
              title="Start Pomodoro focus for this task"
            >
              <PlayCircle size={18} color="var(--accent-pink)" />
            </button>
          )}

          <button
            onClick={() => onEditTask(task)}
            className="btn-icon"
            title="Edit task"
          >
            <Edit3 size={18} />
          </button>

          <button
            onClick={() => onDeleteTask(task.id)}
            className="btn-icon"
            title="Delete task"
            style={{ color: 'var(--accent-rose)' }}
          >
            <Trash2 size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};
