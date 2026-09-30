import React from 'react';
import { 
  Zap, 
  Search, 
  Plus, 
  List, 
  Kanban, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Timer, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX,
  X
} from 'lucide-react';
import type { ViewMode } from '../types';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onOpenNewTask: () => void;
  onOpenPomodoro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  onOpenNewTask,
  onOpenPomodoro
}) => {
  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', padding: '14px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              TaskPulse <span className="gradient-text" style={{ fontSize: '0.85rem', fontWeight: 700, background: 'var(--gradient-primary)', padding: '2px 8px', borderRadius: '6px', color: '#fff', WebkitTextFillColor: 'initial' }}>PRO</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Focus, flow & productivity</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ flex: '1 1 240px', maxWidth: '420px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks, tags, description... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', paddingRight: searchQuery ? '36px' : '14px', height: '42px' }}
            id="task-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn-icon"
              style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--surface-glass-border)'
        }}>
          <button
            onClick={() => setViewMode('list')}
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <Kanban size={16} /> Board
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`btn ${viewMode === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <BarChart2 size={16} /> Stats
          </button>
        </div>

        {/* Quick Tools & CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenPomodoro}
            className="btn btn-secondary"
            title="Pomodoro Focus Timer"
            style={{ padding: '8px 12px' }}
          >
            <Timer size={18} color="var(--accent-pink)" />
            <span style={{ fontSize: '0.85rem' }}>Focus</span>
          </button>

          <button
            onClick={toggleSound}
            className="btn-icon"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}
          >
            {soundEnabled ? <Volume2 size={20} color="var(--accent-emerald)" /> : <VolumeX size={20} color="var(--text-muted)" />}
          </button>

          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}
          >
            {theme === 'dark' ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#8b5cf6" />}
          </button>

          <button
            onClick={onOpenNewTask}
            className="btn btn-primary"
            style={{ padding: '10px 18px', gap: '8px' }}
          >
            <Plus size={18} /> New Task
          </button>
        </div>

      </div>
    </header>
  );
};
