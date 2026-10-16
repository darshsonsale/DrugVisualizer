import React, { useState, useEffect } from 'react';
import { AdminContentService } from '../../services/adminContentService';
import { ContentEditModal } from '../../components/admin/ContentEditModal';
import type {
  AdminContentSummary,
  AdminNodeContentDetail,
  AdminEdgeDetail,
  AdminQuizDetail
} from '../../api/types';
import '../../styles/admin.css';

const DRUGS = [
  { id: 'drug-ibuprofen-001', name: 'Ibuprofen Tablet' },
  { id: 'drug-amoxicillin-002', name: 'Amoxicillin Capsule' },
  { id: 'drug-ambroxol-003', name: 'Ambroxol Syrup' },
  { id: 'drug-insulin-004', name: 'Regular Human Insulin' }
];

export const AdminContentPage: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState<string>('drug-ibuprofen-001');
  const [activeTab, setActiveTab] = useState<'content' | 'transitions' | 'quiz'>('content');
  const [summary, setSummary] = useState<AdminContentSummary | null>(null);
  const [nodes, setNodes] = useState<AdminNodeContentDetail[]>([]);
  const [edges, setEdges] = useState<AdminEdgeDetail[]>([]);
  const [quiz, setQuiz] = useState<AdminQuizDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<AdminNodeContentDetail | null>(null);

  // Transitions editing states
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeDurationMinutesDraft, setEdgeDurationMinutesDraft] = useState<number>(10);
  const [edgeDescriptionDraft, setEdgeDescriptionDraft] = useState<string>('');
  const [edgeSaving, setEdgeSaving] = useState<boolean>(false);
  const [edgeError, setEdgeError] = useState<string | null>(null);

  // Quiz editing states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionTextDraft, setQuestionTextDraft] = useState<string>('');
  const [passPercentageDraft, setPassPercentageDraft] = useState<number>(70);
  const [quizSaving, setQuizSaving] = useState<boolean>(false);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadDrugData(selectedDrug);
  }, [selectedDrug]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const loadSummary = async () => {
    try {
      const data = await AdminContentService.getContentSummary();
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load admin summary:', err);
    }
  };

  const loadDrugData = async (drugId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [nodesData, edgesData, quizData] = await Promise.all([
        AdminContentService.getDrugNodesContent(drugId),
        AdminContentService.getDrugEdges(drugId),
        AdminContentService.getDrugQuiz(drugId)
      ]);
      setNodes(nodesData);
      setEdges(edgesData);
      setQuiz(quizData);
      setPassPercentageDraft(quizData.pass_percentage);
    } catch (err: any) {
      setError(err.message || 'Failed to load medicine content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNodeContent = async (payload: {
    general_description: string;
    physiological_role: string;
    key_takeaway: string;
    micro_environment_ph?: number;
  }) => {
    if (!editingNode) return;
    try {
      const updated = await AdminContentService.updateNodeContent(editingNode.node_id, payload);
      setNodes((prev) => prev.map((n) => (n.node_id === updated.node_id ? updated : n)));
      loadSummary();
      showNotification(`Successfully saved content for ${editingNode.node_name}. Review status preserved as FLAGGED_FOR_SCIENTIFIC_REVIEW.`);
    } catch (err: any) {
      alert(`Error saving station content: ${err.message}`);
    }
  };

  const handleSaveEdge = async (edge: AdminEdgeDetail) => {
    setEdgeSaving(true);
    setEdgeError(null);
    try {
      const updated = await AdminContentService.updatePathwayEdge(edge.id, {
        from_node_id: edge.from_node_id,
        to_node_id: edge.to_node_id,
        transition_duration_minutes: edgeDurationMinutesDraft,
        transition_description: edgeDescriptionDraft
      });
      setEdges((prev) => prev.map((e) => (e.id === edge.id ? { ...e, ...updated } : e)));
      setEditingEdgeId(null);
      loadSummary();
      showNotification(`Transition timing updated successfully (${updated.transition_duration_minutes} min). Concurrency lock released.`);
    } catch (err: any) {
      setEdgeError(err.message || 'Failed to update edge');
    } finally {
      setEdgeSaving(false);
    }
  };

  const handleSaveQuizPassPercentage = async () => {
    if (!quiz) return;
    setQuizSaving(true);
    try {
      const updated = await AdminContentService.updateQuizSettings(quiz.id, {
        pass_percentage: passPercentageDraft
      });
      setQuiz((prev) => (prev ? { ...prev, pass_percentage: updated.pass_percentage } : null));
      showNotification(`Quiz passing threshold updated to ${updated.pass_percentage}%.`);
    } catch (err: any) {
      alert(`Error updating quiz: ${err.message}`);
    } finally {
      setQuizSaving(false);
    }
  };

  const handleSaveQuestionText = async (questionId: string) => {
    try {
      const updated = await AdminContentService.updateQuizQuestion(questionId, questionTextDraft);
      setQuiz((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === questionId ? { ...q, question_text: updated.question_text } : q
          )
        };
      });
      setEditingQuestionId(null);
      showNotification('Question stem text updated successfully in database.');
    } catch (err: any) {
      alert(`Error updating question: ${err.message}`);
    }
  };

  const handleToggleOptionReview = async (optionId: string, currentStatus: boolean) => {
    try {
      const updated = await AdminContentService.updateQuizOptionReview(optionId, {
        needs_scientific_review: !currentStatus
      });
      setQuiz((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.map((q) => ({
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, needs_scientific_review: updated.needs_scientific_review } : opt
            )
          }))
        };
      });
      loadSummary();
      showNotification(`Option ${optionId} review flag changed to ${updated.needs_scientific_review ? 'NEEDS REVIEW' : 'REVIEWED'}.`);
    } catch (err: any) {
      alert(`Error toggling review flag: ${err.message}`);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Admin Header */}
      <div className="admin-header">
        <div>
          <span className="admin-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              admin_panel_settings
            </span>
            BioLumen Administrative Portal
          </span>
          <h1 className="admin-title">Content &amp; Assessment Management</h1>
          <p className="admin-subtitle">
            Maintain educational pathway descriptions, transit milestones, and question bank clarity with strict server-side validation and concurrency protection.
          </p>
        </div>

        {summary && (
          <div className="admin-metrics-pill">
            <div className="metric-item">
              <span className="metric-val">{summary.total_nodes}</span>
              <span className="metric-lbl">Stations</span>
            </div>
            <div className="metric-item">
              <span className="metric-val">{summary.total_edges}</span>
              <span className="metric-lbl">Transitions</span>
            </div>
            <div className="metric-item">
              <span className="metric-val" style={{ color: '#f59e0b' }}>
                {summary.options_needing_review}
              </span>
              <span className="metric-lbl">Review Flags</span>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: 'rgba(78, 222, 163, 0.15)',
          border: '1px solid rgba(78, 222, 163, 0.35)',
          color: '#4edea3',
          fontSize: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            check_circle
          </span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drug Selection Pills */}
      <div className="admin-pill-group">
        {DRUGS.map((drug) => (
          <button
            key={drug.id}
            type="button"
            className={`admin-drug-pill ${selectedDrug === drug.id ? 'active' : ''}`}
            onClick={() => setSelectedDrug(drug.id)}
          >
            {drug.name}
          </button>
        ))}
      </div>

      {/* Module Tabs */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            auto_stories
          </span>
          <span>Pathway Stations ({nodes.length})</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'transitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transitions')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            timeline
          </span>
          <span>Pathway Transitions ({edges.length})</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            quiz
          </span>
          <span>Assessment Engine ({quiz?.questions_count || 5} Questions)</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading administrative content...
        </div>
      ) : error ? (
        <div className="admin-error-box">{error}</div>
      ) : activeTab === 'content' ? (
        /* Stations View */
        <div className="admin-stations-grid">
          {nodes.map((node) => (
            <div key={node.node_id} className="admin-station-card">
              <div className="station-card-header">
                <div>
                  <span className="station-order-badge">Station #{node.node_order}</span>
                  <h3 className="station-name">{node.node_name}</h3>
                  <span className="station-location">{node.anatomical_location} ({node.organ_system})</span>
                </div>
                <button
                  type="button"
                  className="admin-edit-action-btn"
                  onClick={() => setEditingNode(node)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    edit
                  </span>
                  <span>Edit Content</span>
                </button>
              </div>

              <div className="station-card-body">
                <div className="content-preview-block">
                  <span className="block-label">Student Takeaway</span>
                  <p className="block-text">{node.key_takeaway || 'No key takeaway recorded.'}</p>
                </div>

                <div className="content-preview-block">
                  <span className="block-label">General Description</span>
                  <p className="block-text snippet">{node.general_description}</p>
                </div>

                <div className="station-meta-footer">
                  <span className="review-badge flagged" title="All educational content retains FLAGGED_FOR_SCIENTIFIC_REVIEW provenance">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      science
                    </span>
                    {node.review_status}
                  </span>
                  {node.micro_environment_ph !== null && (
                    <span className="ph-pill">pH {node.micro_environment_ph}</span>
                  )}
                  <span className="updated-timestamp">
                    Updated: {new Date(node.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'transitions' ? (
        /* Pathway Transitions / Edges View */
        <div className="admin-transitions-list">
          <div className="admin-integrity-notice">
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container, #00e5ff)' }}>
              shield
            </span>
            <span>
              <strong>Topological DAG Protection:</strong> Transitions are guarded by transactional pathway-level concurrency locks. Edges are validated against self-loops, cross-pathway references, and cyclic dependencies before saving.
            </span>
          </div>

          {edgeError && <div className="admin-error-box">{edgeError}</div>}

          {edges.map((edge) => (
            <div key={edge.id} className="admin-transition-card">
              <div className="transition-flow">
                <span className="transition-order-badge">Transition</span>
                <span>{edge.from_node_name || edge.from_node_id}</span>
                <span className="material-symbols-outlined transition-arrow">
                  arrow_forward
                </span>
                <span>{edge.to_node_name || edge.to_node_id}</span>
              </div>

              {editingEdgeId === edge.id ? (
                <div className="admin-inline-editor-form">
                  <label>
                    Duration (min):
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={edgeDurationMinutesDraft}
                      onChange={(e) => setEdgeDurationMinutesDraft(parseFloat(e.target.value) || 0)}
                      style={{ width: '80px' }}
                    />
                  </label>
                  <label>
                    Transit Note:
                    <input
                      type="text"
                      value={edgeDescriptionDraft}
                      onChange={(e) => setEdgeDescriptionDraft(e.target.value)}
                      placeholder="e.g. Gastric emptying into duodenum"
                      style={{ minWidth: '220px' }}
                    />
                  </label>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => {
                      setEditingEdgeId(null);
                      setEdgeError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    disabled={edgeSaving}
                    onClick={() => handleSaveEdge(edge)}
                  >
                    {edgeSaving ? 'Saving...' : 'Save Timing'}
                  </button>
                </div>
              ) : (
                <div className="transition-duration-controls">
                  <span className="duration-tag">
                    {edge.transition_duration_minutes !== null ? `${edge.transition_duration_minutes} min` : 'Continuous flow'}
                    {edge.transition_description ? ` • ${edge.transition_description}` : ''}
                  </span>
                  <button
                    type="button"
                    className="admin-edit-action-btn"
                    onClick={() => {
                      setEditingEdgeId(edge.id);
                      setEdgeDurationMinutesDraft(edge.transition_duration_minutes ?? 10);
                      setEdgeDescriptionDraft(edge.transition_description || '');
                      setEdgeError(null);
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      edit
                    </span>
                    <span>Edit Transit</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Quiz Management View */
        quiz && (
          <div className="admin-quiz-workspace">
            <div className="admin-quiz-settings-card">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{quiz.title}</h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>
                  {quiz.description || 'Assessment engine evaluating pathway understanding.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '14px', color: '#cbd5e1' }}>Pass Threshold (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passPercentageDraft}
                  onChange={(e) => setPassPercentageDraft(parseFloat(e.target.value) || 0)}
                  className="admin-number-input"
                  style={{
                    width: '84px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#080f1d',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                />
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleSaveQuizPassPercentage}
                  disabled={quizSaving}
                >
                  {quizSaving ? 'Saving...' : 'Save Threshold'}
                </button>
              </div>
            </div>

            <div className="admin-questions-list">
              {quiz.questions.map((q) => (
                <div key={q.id} className="admin-question-card">
                  <div className="question-header">
                    <span className="question-num-badge">Question #{q.question_order}</span>
                    {editingQuestionId === q.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          onClick={() => setEditingQuestionId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="admin-btn-primary"
                          onClick={() => handleSaveQuestionText(q.id)}
                        >
                          Save Text
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="admin-edit-action-btn"
                        onClick={() => {
                          setEditingQuestionId(q.id);
                          setQuestionTextDraft(q.question_text);
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          edit
                        </span>
                        <span>Edit Question</span>
                      </button>
                    )}
                  </div>

                  {editingQuestionId === q.id ? (
                    <textarea
                      rows={3}
                      value={questionTextDraft}
                      onChange={(e) => setQuestionTextDraft(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: '#080f1d',
                        color: '#f8fafc',
                        border: '1px solid #00e5ff',
                        boxShadow: '0 0 0 3px rgba(0, 229, 255, 0.15)',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        resize: 'vertical',
                        margin: '8px 0'
                      }}
                    />
                  ) : (
                    <p style={{ margin: '8px 0', fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                      {q.question_text}
                    </p>
                  )}

                  <div className="admin-options-container">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="admin-option-row">
                        <div>
                          <span className="opt-key">({opt.id})</span>
                          <span style={{ marginLeft: '8px', color: '#e2e8f0' }}>{opt.option_text}</span>
                        </div>
                        <button
                          type="button"
                          className={`review-toggle-btn ${opt.needs_scientific_review ? 'pending' : 'verified'}`}
                          onClick={() => handleToggleOptionReview(opt.id, opt.needs_scientific_review)}
                          title="Toggle scientific review audit flag"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            {opt.needs_scientific_review ? 'flag' : 'check_circle'}
                          </span>
                          <span>{opt.needs_scientific_review ? 'Needs Review' : 'Reviewed'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Content Edit Modal */}
      {editingNode && (
        <ContentEditModal
          node={editingNode}
          isOpen={true}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveNodeContent}
        />
      )}
    </div>
  );
};

export default AdminContentPage;
