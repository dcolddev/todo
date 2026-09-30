import React, { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Task, UserStats } from '../types';
import { exportDataAsJson } from '../utils/storage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  stats: UserStats;
  onImportSuccess: (importedTasks: Task[], importedStats?: UserStats) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  tasks,
  stats,
  onImportSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        if (Array.isArray(jsonContent)) {
          // Plain array of tasks
          onImportSuccess(jsonContent);
          setSuccessMsg(`Successfully imported ${jsonContent.length} tasks!`);
        } else if (jsonContent && Array.isArray(jsonContent.tasks)) {
          // Standard backup object
          onImportSuccess(jsonContent.tasks, jsonContent.stats);
          setSuccessMsg(`Successfully imported ${jsonContent.tasks.length} tasks!`);
        } else {
          setErrorMsg('Invalid backup file format. Expected a JSON with a tasks array.');
        }
      } catch (err) {
        setErrorMsg('Failed to parse JSON file. Please verify file integrity.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '28px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Backup & Sync Data</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Export Section */}
        <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} color="var(--accent-primary)" /> Export Data
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Download a local JSON backup containing all your {tasks.length} tasks and productivity stats.
          </p>
          <button
            onClick={() => exportDataAsJson(tasks, stats)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px' }}
          >
            Download Backup (.json)
          </button>
        </div>

        {/* Import Section */}
        <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px dashed var(--surface-glass-border)', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} color="var(--accent-amber)" /> Import Data
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Restore tasks from a previously saved TaskPulse JSON file.
          </p>

          <label
            className="btn btn-secondary"
            style={{ width: '100%', padding: '10px', cursor: 'pointer', textAlign: 'center', display: 'block' }}
          >
            Choose JSON File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(244, 63, 94, 0.15)', color: '#ff6b81', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

      </div>
    </div>
  );
};
