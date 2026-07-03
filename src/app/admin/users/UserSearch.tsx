'use client'

import { useState, useTransition } from 'react'
import { promoteToAdmin, demoteToUser, deleteUser, updateUserEmail } from '@/app/admin/actions'

interface UserRow  {
  id: string
  email: string
  createdAt: string
  completionPercent: number
  role: string
}

export default function UserSearch({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<{ userId: string; msg: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [emailDraft, setEmailDraft] = useState('')

  const filtered = query.trim()
    ? users.filter((u) => u.email.toLowerCase().includes(query.toLowerCase()))
    : users

  function act(fn: () => Promise<void>, userId: string, successMsg = 'Role updated.') {
    setFeedback(null)
    startTransition(async () => {
      try {
        await fn()
        setFeedback({ userId, msg: successMsg, ok: true })
      } catch (e) {
        setFeedback({ userId, msg: e instanceof Error ? e.message : 'Error', ok: false })
      }
    })
  }

  function handleEditEmailClick(userId: string, currentEmail: string) {
    setEditingEmail(userId)
    setEmailDraft(currentEmail)
    setFeedback(null)
    setDeleteConfirm(null)
  }

  function handleEmailSave(userId: string) {
    act(() => updateUserEmail(userId, emailDraft), userId, 'Email updated — confirmation sent to new address.')
    setEditingEmail(null)
  }

  function handleDeleteClick(userId: string) {
    if (deleteConfirm === userId) {
      setDeleteConfirm(null)
      act(() => deleteUser(userId), userId, 'User deleted.')
    } else {
      setDeleteConfirm(userId)
    }
  }

  const btnStyle = (variant: 'promote' | 'demote'): React.CSSProperties => ({
    padding: '4px 12px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    cursor: isPending ? 'not-allowed' : 'pointer',
    border: 'none',
    opacity: isPending ? 0.6 : 1,
    background: variant === 'promote' ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.08)',
    color: variant === 'promote' ? '#eab308' : 'var(--color-text-secondary)',
  })

  return (
    <div>
      <input
        type="search"
        placeholder="Search by email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6,
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-small)',
          marginBottom: 'var(--space-5)',
          boxSizing: 'border-box',
        }}
      />

      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }}>
        {filtered.length} of {users.length} accounts
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filtered.map((u) => (
          <div key={u.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 2 }}>
                {u.email}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                Joined {new Date(u.createdAt).toLocaleDateString()} · Quiz {u.completionPercent}% complete · Role: {u.role}
              </p>
              {editingEmail === u.id && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={e => setEmailDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEmailSave(u.id); if (e.key === 'Escape') setEditingEmail(null) }}
                    autoFocus
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)', fontSize: 12, width: 240 }}
                  />
                  <button
                    disabled={isPending || !emailDraft.trim()}
                    onClick={() => handleEmailSave(u.id)}
                    style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, border: 'none', background: 'rgba(34,197,94,0.2)', color: '#22c55e', cursor: 'pointer' }}
                  >
                    Save &amp; send confirmation
                  </button>
                  <button
                    onClick={() => setEditingEmail(null)}
                    style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, border: 'none', background: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {feedback?.userId === u.id && (
                <p style={{ fontSize: 11, color: feedback.ok ? '#22c55e' : '#ef4444', marginTop: 4 }}>
                  {feedback.msg}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                disabled={isPending}
                onClick={() => handleEditEmailClick(u.id, u.email)}
                style={{ padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', border: 'none', opacity: isPending ? 0.6 : 1, background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}
              >
                Edit email
              </button>
              {u.role !== 'admin' && u.role !== 'super_admin' && (
                <button disabled={isPending} onClick={() => act(() => promoteToAdmin(u.id), u.id)} style={btnStyle('promote')}>
                  Promote to Admin
                </button>
              )}
              {u.role === 'admin' && (
                <button disabled={isPending} onClick={() => act(() => demoteToUser(u.id), u.id)} style={btnStyle('demote')}>
                  Demote to User
                </button>
              )}
              {u.role === 'super_admin' && (
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '4px 12px' }}>Super Admin</span>
              )}
              {u.id !== currentUserId && (
                <button
                  disabled={isPending}
                  onClick={() => handleDeleteClick(u.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    border: 'none',
                    opacity: isPending ? 0.6 : 1,
                    background: deleteConfirm === u.id ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                  }}
                >
                  {deleteConfirm === u.id ? 'Confirm — permanent' : 'Delete user'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
