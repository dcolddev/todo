import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Flame, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Tag as TagIcon 
} from 'lucide-react';
import type { Task, UserStats, Category } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
  stats: UserStats;
}

const CATEGORY_COLORS: Record<Category, string> = {
  Work: '#6366f1',
  Personal: '#ec4899',
  Shopping: '#f59e0b',
  Fitness: '#10b981',
  Ideas: '#8b5cf6',
  Finance: '#06b6d4',
  Health: '#14b8a6',
  Other: '#64748b'
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, stats }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority counts
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const medPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // Tag counts
  const tagCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    t.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Calculate estimated total time vs completed focus time
  const totalEstimatedMins = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      
      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Velocity</span>
            <TrendingUp size={20} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{completedTasks}</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tasks finished all time</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fire Streak</span>
            <Flame size={20} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
            {stats.streakDays} <span style={{ fontSize: '1.1rem' }}>Days</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Consecutive daily flow</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Focus Time</span>
            <Clock size={20} color="var(--accent-pink)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-pink)' }}>
            {Math.round(stats.totalTimeSpentMinutes)} <span style={{ fontSize: '1.1rem' }}>Mins</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Pomodoro focus logged</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completion Rate</span>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {completionRate}%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{activeTasks} tasks remaining</p>
        </div>

      </div>

      {/* Main Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Category Distribution Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PieChart size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.keys(CATEGORY_COLORS).map((cat) => {
              const count = categoryCounts[cat] || 0;
              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              const color = CATEGORY_COLORS[cat as Category];

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} tasks ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '99px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Workload Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 size={20} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Priority & Workload</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Priority Bars */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#ff6b81' }}>🔥 High Priority</span>
                <span>{highPriority} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${totalTasks > 0 ? (highPriority / totalTasks) * 100 : 0}%`, height: '100%', background: 'var(--gradient-rose)', borderRadius: '99px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>⚡ Medium Priority</span>
                <span>{medPriority} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${totalTasks > 0 ? (medPriority / totalTasks) * 100 : 0}%`, height: '100%', background: 'var(--gradient-amber)', borderRadius: '99px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#34d399' }}>🍃 Low Priority</span>
                <span>{lowPriority} tasks</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${totalTasks > 0 ? (lowPriority / totalTasks) * 100 : 0}%`, height: '100%', background: 'var(--gradient-emerald)', borderRadius: '99px' }} />
              </div>
            </div>

            {/* Time Estimation Summary */}
            <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Estimated Workload:</span>
                <span style={{ fontWeight: 700 }}>{totalEstimatedMins} Mins (~{(totalEstimatedMins / 60).toFixed(1)} hrs)</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tag Cloud Overview */}
      {Object.keys(tagCounts).length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TagIcon size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tag Cloud & Topics</h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(tagCounts).map(([tag, count]) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                #{tag}
                <span style={{ background: 'var(--accent-primary)', color: '#fff', padding: '1px 6px', borderRadius: '99px', fontSize: '0.72rem' }}>
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
