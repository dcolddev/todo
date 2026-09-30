import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Timer, CheckCircle } from 'lucide-react';
import type { Task } from '../types';
import { soundFx } from '../utils/sound';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask: Task | null;
  tasks: Task[];
  onAddFocusTime: (minutes: number) => void;
  onToggleCompleteTask?: (id: string) => void;
}

type Mode = 'work' | 'short_break' | 'long_break';

const MODE_TIMES: Record<Mode, number> = {
  work: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  activeTask,
  tasks,
  onAddFocusTime,
  onToggleCompleteTask,
}) => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.work);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(activeTask);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSelectedTask(activeTask);
  }, [activeTask]);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Audio chime sound
            soundFx.playTimerFinishSound();

            // Record focus minutes if in work mode
            if (mode === 'work') {
              onAddFocusTime(25);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, onAddFocusTime]);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalModeSecs = MODE_TIMES[mode];
  const progressPercent = Math.round(((totalModeSecs - timeLeft) / totalModeSecs) * 100);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          textAlign: 'center'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Timer size={22} color="var(--accent-pink)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Focus Pomodoro</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <button
            onClick={() => handleSwitchMode('work')}
            className={`btn ${mode === 'work' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
          >
            🎯 Focus (25m)
          </button>
          <button
            onClick={() => handleSwitchMode('short_break')}
            className={`btn ${mode === 'short_break' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
          >
            ☕ Break (5m)
          </button>
          <button
            onClick={() => handleSwitchMode('long_break')}
            className={`btn ${mode === 'long_break' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
          >
            🧘 Rest (15m)
          </button>
        </div>

        {/* Circular Progress & Clock Display */}
        <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px auto' }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle
              cx="110"
              cy="110"
              r="95"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
            />
            <circle
              cx="110"
              cy="110"
              r="95"
              fill="none"
              stroke={mode === 'work' ? 'var(--accent-pink)' : mode === 'short_break' ? 'var(--accent-emerald)' : 'var(--accent-primary)'}
              strokeWidth="10"
              strokeDasharray={597}
              strokeDashoffset={597 - (597 * progressPercent) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontSize: '3.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
              {formatTime(timeLeft)}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {mode === 'work' ? 'Deep Work Session' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Active Task Selector */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Current Focus Target:
          </label>
          <select
            value={selectedTask?.id || ''}
            onChange={(e) => {
              const found = tasks.find(t => t.id === e.target.value);
              setSelectedTask(found || null);
            }}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="">-- General Productivity (No specific task) --</option>
            {tasks.filter(t => !t.completed).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Timer Control Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: '30px' }}
          >
            {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start Session</>}
          </button>

          <button
            onClick={handleReset}
            className="btn-icon"
            style={{ background: 'rgba(255, 255, 255, 0.08)', width: '44px', height: '44px', borderRadius: '50%' }}
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>

          {selectedTask && onToggleCompleteTask && (
            <button
              onClick={() => onToggleCompleteTask(selectedTask.id)}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', fontSize: '0.82rem', borderRadius: '20px' }}
              title="Mark active task as complete"
            >
              <CheckCircle size={16} color="var(--accent-emerald)" /> Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
