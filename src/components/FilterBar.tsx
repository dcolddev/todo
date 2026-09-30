import React from 'react';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  CheckSquare, 
  Trash2, 
  Download, 
  Upload, 
  Tag as TagIcon,
  X
} from 'lucide-react';
import type { Category, FilterPriority, FilterState, FilterStatus } from '../types';

interface FilterBarProps {
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  allTags: string[];
  batchMode: boolean;
  setBatchMode: (val: boolean) => void;
  selectedTaskIds: string[];
  onSelectAll: () => void;
  onBatchComplete: () => void;
  onBatchDelete: () => void;
  onExportData: () => void;
  onOpenImportModal: () => void;
}

const CATEGORIES: ('all' | Category)[] = [
  'all',
  'Work',
  'Personal',
  'Shopping',
  'Fitness',
  'Ideas',
  'Finance',
  'Health',
  'Other'
];

const STATUS_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pinned', value: 'pinned' },
  { label: 'Due Today', value: 'today' },
  { label: 'Overdue', value: 'overdue' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  setFilterState,
  allTags,
  batchMode,
  setBatchMode,
  selectedTaskIds,
  onSelectAll,
  onBatchComplete,
  onBatchDelete,
  onExportData,
  onOpenImportModal,
}) => {
  const toggleSortOrder = () => {
    setFilterState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
      
      {/* Top Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
        
        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterState(prev => ({ ...prev, status: opt.value }))}
              className={`btn ${filterState.status === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Action Controls: Priority, Sort, Batch Mode & Backup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Priority Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={filterState.priority}
              onChange={(e) => setFilterState(prev => ({ ...prev, priority: e.target.value as FilterPriority }))}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', height: '36px' }}
            >
              <option value="all">Priority: All</option>
              <option value="high">Priority: 🔥 High</option>
              <option value="medium">Priority: ⚡ Medium</option>
              <option value="low">Priority: 🍃 Low</option>
            </select>
          </div>

          {/* Sort By Select */}
          <select
            value={filterState.sortBy}
            onChange={(e) => setFilterState(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', height: '36px' }}
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="createdAt">Sort: Created Date</option>
            <option value="title">Sort: Title</option>
          </select>

          {/* Sort Asc/Desc Button */}
          <button
            onClick={toggleSortOrder}
            className="btn-icon"
            title={`Sort ${filterState.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            style={{ background: 'rgba(255, 255, 255, 0.06)', height: '36px', width: '36px' }}
          >
            {filterState.sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
          </button>

          {/* Batch Mode Toggle */}
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`btn ${batchMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.8rem', height: '36px' }}
          >
            {batchMode ? 'Cancel Batch' : 'Batch Select'}
          </button>

          {/* Backup & Restore Dropdown/Buttons */}
          <button
            onClick={onExportData}
            className="btn-icon"
            title="Export JSON Backup"
            style={{ background: 'rgba(255, 255, 255, 0.06)', height: '36px', width: '36px' }}
          >
            <Download size={18} />
          </button>

          <button
            onClick={onOpenImportModal}
            className="btn-icon"
            title="Import Backup File"
            style={{ background: 'rgba(255, 255, 255, 0.06)', height: '36px', width: '36px' }}
          >
            <Upload size={18} />
          </button>

        </div>

      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--surface-glass-border)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Categories:</span>
        {CATEGORIES.map((cat) => {
          const isActive = filterState.category === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterState(prev => ({ ...prev, category: cat }))}
              style={{
                background: isActive ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid var(--surface-glass-border)',
                padding: '4px 12px',
                borderRadius: '14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          );
        })}
      </div>

      {/* Tag Filters (if tags exist) */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
          <TagIcon size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tags:</span>
          {allTags.map((tag) => {
            const isSelected = filterState.selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setFilterState(prev => ({ ...prev, selectedTag: isSelected ? '' : tag }))}
                style={{
                  background: isSelected ? 'var(--accent-primary)' : 'rgba(99, 102, 241, 0.1)',
                  color: isSelected ? '#fff' : 'var(--accent-primary)',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                #{tag}
                {isSelected && <X size={12} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Batch Operations Floating/Sub Bar */}
      {batchMode && (
        <div
          className="animate-pop-in"
          style={{
            marginTop: '14px',
            padding: '10px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {selectedTaskIds.length} task(s) selected
            </span>
            <button
              onClick={onSelectAll}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              Select All
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onBatchComplete}
              disabled={selectedTaskIds.length === 0}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: selectedTaskIds.length === 0 ? 0.5 : 1 }}
            >
              <CheckSquare size={16} /> Mark Completed
            </button>

            <button
              onClick={onBatchDelete}
              disabled={selectedTaskIds.length === 0}
              className="btn btn-danger"
              style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: selectedTaskIds.length === 0 ? 0.5 : 1 }}
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
