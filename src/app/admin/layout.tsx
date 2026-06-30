import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserRole } from '@/lib/auth/getRole'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentUserRole()

  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <nav style={{
        width: 220,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        padding: 'var(--space-8) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
      }}>
        <p style={{
          fontSize: 'var(--text-small)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-gold)',
          letterSpacing: 'var(--tracking-wider)',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-4)',
        }}>
          Admin
        </p>

        {[
          { href: '/admin', label: 'Overview' },
          { href: '/admin/review', label: 'Review Queue' },
          { href: '/admin/feedback', label: 'Feedback' },
          { href: '/admin/audit', label: 'Audit Log' },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            display: 'block',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 6,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-small)',
          }}>
            {label}
          </Link>
        ))}

        {role === 'super_admin' && (
          <Link href="/admin/users" style={{
            display: 'block',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 6,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontSize: 'var(--text-small)',
          }}>
            User Lookup
          </Link>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            Role: {role}
          </p>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, padding: 'var(--space-10) var(--space-8)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
