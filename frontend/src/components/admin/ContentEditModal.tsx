import React, { useState } from 'react';
import type { AdminNodeContentDetail } from '../../api/types';

interface ContentEditModalProps {
  node: AdminNodeContentDetail;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    general_description: string;
    physiological_role: string;
    key_takeaway: string;
    micro_environment_ph?: number;
  }) => Promise<void>;
}

export const ContentEditModal: React.FC<ContentEditModalProps> = ({
  node,
  isOpen,
  onClose,
  onSave
}) => {
  const [description, setDescription] = useState(node.general_description);
  const [role, setRole] = useState(node.physiological_role);
  const [takeaway, setTakeaway] = useState(node.key_takeaway);
  const [ph, setPh] = useState<string>(node.micro_environment_ph !== null ? String(node.micro_environment_ph) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const parsedPh = ph.trim() ? parseFloat(ph) : undefined;
      if (parsedPh !== undefined && (isNaN(parsedPh) || parsedPh < 0 || parsedPh > 14)) {
        throw new Error('Microenvironment pH must be a number between 0 and 14');
      }

      await onSave({
        general_description: description,
        physiological_role: role,
        key_takeaway: takeaway,
        micro_environment_ph: parsedPh
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary-container)' }}>
              edit_note
            </span>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
              Edit Station Content: {node.node_name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="admin-close-btn" aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {error && <div className="admin-error-box">{error}</div>}

          <div className="admin-field-group">
            <label>General Description (Plain Language)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
            />
          </div>

          <div className="admin-field-group">
            <label>Physiological Role & Mechanisms</label>
            <textarea
              rows={4}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              minLength={10}
            />
          </div>

          <div className="admin-field-group">
            <label>Student Key Takeaway</label>
            <textarea
              rows={2}
              value={takeaway}
              onChange={(e) => setTakeaway(e.target.value)}
              required
              minLength={5}
            />
          </div>

          <div className="admin-field-group">
            <label>Microenvironment pH (0.0 to 14.0, Optional)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
            />
          </div>

          <div className="admin-scientific-notice">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f59e0b' }}>
              warning
            </span>
            <span>
              <strong>Editorial Notice:</strong> Edits modify student explanations and visual text. Review status remains <code>FLAGGED_FOR_SCIENTIFIC_REVIEW</code> until formal clinical sign-off.
            </span>
          </div>

          <div className="admin-modal-actions">
            <button type="button" onClick={onClose} className="admin-btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
