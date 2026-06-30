'use client'

import { useState, useTransition } from 'react'
import { approveEntry, rejectEntry, editEntry, reclassifyEntry } from '@/app/admin/actions'

type EntryType = 'candidate' | 'source'

interface Props {
  type: EntryType
  id: string
  currentStatus: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editableFields: Record<string, any>
}

type Mode = 'idle' | 'rejecting' | 'editing'

export default function EntryActions({ type, id, currentStatus, editableFields }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [rejectReason, setRejectReason] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editState, setEditState] = useState<Record<string, any>>(editableFields)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const isClassified = editableFields.axis_placement != null &&
    Object.keys(editableFields.axis_placement as object).length > 0
  const classifyLabel = isClassified ? 'Re-classify' : 'Classify with Claude'

  function withFeedback(fn: () => Promise<void>) {
    setFeedback(null)
    startTransition(async () => {
      try {
        await fn()
        setFeedback({ ok: true, msg: 'Done.' })
        setMode('idle')
      } catch (e) {
        setFeedback({ ok: false, msg: e instanceof Error ? e.message : 'Something went wrong.' })
      }
    })
  }

  const btnBase: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: 6,
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--weight-semibold)',
    cursor: isPending ? 'not-allowed' : 'pointer',
    border: 'none',
    opacity: isPending ? 0.6 : 1,
  }

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
      <h2 style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>
        Actions
      </h2>

      {feedback && (
        <p style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-small)', color: feedback.ok ? '#22c55e' : '#ef4444' }}>
          {feedback.msg}
        </p>
      )}

      {/* ── Idle mode — action buttons ── */}
      {mode === 'idle' && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {currentStatus === 'pending_review' && (
            <>
              <button
                disabled={isPending}
                onClick={() => withFeedback(() => approveEntry(type, id))}
                style={{ ...btnBase, background: '#22c55e', color: '#000' }}
              >
                Approve
              </button>
              <button
                disabled={isPending}
                onClick={() => setMode('editing')}
                style={{ ...btnBase, background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)' }}
              >
                Edit
              </button>
              <button
                disabled={isPending}
                onClick={() => setMode('rejecting')}
                style={{ ...btnBase, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                Reject
              </button>
              <button
                disabled={isPending}
                onClick={() => withFeedback(() => reclassifyEntry(type, id))}
                style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }}
              >
                {classifyLabel}
              </button>
            </>
          )}
          {currentStatus !== 'pending_review' && (
            <>
              <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', alignSelf: 'center' }}>
                Status: {currentStatus}
              </span>
              <button
                disabled={isPending}
                onClick={() => withFeedback(() => reclassifyEntry(type, id))}
                style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }}
              >
                {classifyLabel}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Reject mode — reason textarea ── */}
      {mode === 'rejecting' && (
        <div style={{ maxWidth: 480 }}>
          <label style={{ display: 'block', fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            Rejection reason (required)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Why is this entry being rejected?"
            style={{ width: '100%', padding: 'var(--space-3)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 'var(--text-small)', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
            <button
              disabled={isPending || !rejectReason.trim()}
              onClick={() => withFeedback(() => rejectEntry(type, id, rejectReason))}
              style={{ ...btnBase, background: '#ef4444', color: '#fff' }}
            >
              Confirm Reject
            </button>
            <button
              disabled={isPending}
              onClick={() => { setMode('idle'); setRejectReason('') }}
              style={{ ...btnBase, background: 'transparent', color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Edit mode ── */}
      {mode === 'editing' && (
        <EditForm
          type={type}
          editState={editState}
          setEditState={setEditState}
          onSave={() => withFeedback(() => editEntry(type, id, editState))}
          onCancel={() => { setMode('idle'); setEditState(editableFields) }}
          isPending={isPending}
        />
      )}
    </div>
  )
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

function EditForm({ type, editState, setEditState, onSave, onCancel, isPending }: {
  type: EntryType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editState: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEditState: (s: Record<string, any>) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setField(key: string, value: any) {
    setEditState({ ...editState, [key]: value })
  }

  function setAxisField(axis: string, field: string, value: string | number) {
    const prev = editState.axis_placement ?? {}
    setEditState({
      ...editState,
      axis_placement: {
        ...prev,
        [axis]: { ...prev[axis], [field]: field === 'score' ? Number(value) : field === 'confidence' ? Number(value) : value },
      },
    })
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 4,
    color: 'var(--color-text-primary)',
    fontSize: 'var(--text-small)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Axis placements */}
      {editState.axis_placement && Object.keys(editState.axis_placement).length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
            Axis Placements
          </p>
          {Object.entries(editState.axis_placement as Record<string, { score: number; confidence: number; rationale: string }>).map(([axis, placement]) => (
            <div key={axis} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}>
              <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 'var(--space-3)' }}>
                {axis.replace(/_/g, ' ')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <div>
                  <label style={labelStyle}>Score (0–100)</label>
                  <input type="number" min={0} max={100} value={placement.score}
                    onChange={(e) => setAxisField(axis, 'score', e.target.value)}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={labelStyle}>Confidence (0–1)</label>
                  <input type="number" min={0} max={1} step={0.05} value={placement.confidence}
                    onChange={(e) => setAxisField(axis, 'confidence', e.target.value)}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Rationale</label>
                <textarea rows={2} value={placement.rationale ?? ''}
                  onChange={(e) => setAxisField(axis, 'rationale', e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source-specific fields */}
      {type === 'source' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <div>
            <label style={labelStyle}>Reliability (0–100)</label>
            <input type="number" min={0} max={100} value={editState.reliability ?? ''}
              onChange={(e) => setField('reliability', Number(e.target.value))}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={labelStyle}>Independence (0–100)</label>
            <input type="number" min={0} max={100} value={editState.independence ?? ''}
              onChange={(e) => setField('independence', Number(e.target.value))}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={labelStyle}>Good Faith</label>
            <select value={editState.good_faith ?? ''} onChange={(e) => setField('good_faith', e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
              <option value="">—</option>
              <option value="high">High</option>
              <option value="mixed">Mixed</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Coarse Lean</label>
            <select value={editState.coarse_lean ?? ''} onChange={(e) => setField('coarse_lean', e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
              <option value="">—</option>
              {['left','lean-left','center','lean-right','right','heterodox'].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Active Status</label>
            <select value={editState.active ?? 'active'} onChange={(e) => setField('active', e.target.value)}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
              <option value="active">Active</option>
              <option value="dormant">Dormant</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
      )}

      {/* Candidate-specific fields */}
      {type === 'candidate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <div>
            <label style={labelStyle}>Independent-Minded Score</label>
            <input type="number" min={0} max={5} value={editState.independent_minded_score ?? ''}
              onChange={(e) => setField('independent_minded_score', Number(e.target.value))}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingTop: 'var(--space-5)' }}>
            <input type="checkbox" id="rhetorical_only" checked={!!editState.rhetorical_only}
              onChange={(e) => setField('rhetorical_only', e.target.checked)} />
            <label htmlFor="rhetorical_only" style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-primary)' }}>
              Rhetoric-only (no voting record)
            </label>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          disabled={isPending}
          onClick={onSave}
          style={{ padding: '8px 18px', borderRadius: 6, fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', cursor: isPending ? 'not-allowed' : 'pointer', border: 'none', opacity: isPending ? 0.6 : 1, background: 'var(--color-gold)', color: '#000' }}
        >
          Save Changes
        </button>
        <button
          disabled={isPending}
          onClick={onCancel}
          style={{ padding: '8px 18px', borderRadius: 6, fontSize: 'var(--text-small)', cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--color-text-secondary)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
