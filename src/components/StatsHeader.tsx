import React from 'react';
import { Flame, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import type { Task, UserStats } from '../types';

interface StatsHeaderProps {
  tasks: Task[];
  stats: UserStats;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ tasks, stats }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityPending = tasks.filter((t) => !t.completed && t.priority === 'high').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Progress & Completion Card */}
      <div className="glass-panel" style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Task Completion</span>
          <CheckCircle2 size={20} color="var(--accent-emerald)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{completedTasks}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {totalTasks} ({completionRate}%)</span>
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            width: `${completionRate}%`,
            height: '100%',
            background: 'var(--gradient-emerald)',
            borderRadius: '99px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>

      {/* Daily Streak Card */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Productivity Streak</span>
          <Flame size={20} color="var(--accent-amber)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{stats.streakDays}</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Days Fire Streak 🔥</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Keep completing tasks daily to grow your streak!</p>
      </div>

      {/* Due Today Card */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Due Today</span>
          <Calendar size={20} color="var(--accent-primary)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{dueTodayCount}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>action items scheduled</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {dueTodayCount === 0 ? '🎉 All caught up for today!' : 'Action required today'}
        </p>
      </div>

      {/* High Priority Urgent */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>High Priority</span>
          <AlertCircle size={20} color="var(--accent-rose)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: highPriorityPending > 0 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
            {highPriorityPending}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>pending urgent</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {highPriorityPending > 0 ? '⚡ Focus on these top priority items first' : 'No critical blockers!'}
        </p>
      </div>
    </div>
  );
};
