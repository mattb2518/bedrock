import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/auth/getRole'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import UserSearch from './UserSearch'

// ── Privacy wall: this file is the ONLY server-side data path for user lookup.
// Query selects ONLY: id, email, created_at from auth.users
//                 and ONLY: completion_percent from quiz_profiles.
// answers / result / demographics / dealbreakers are NEVER fetched here.

export default async function UsersPage() {
  const role = await getCurrentUserRole()
  if (role !== 'super_admin') {
    redirect('/admin')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? ''

  const admin = createAdminClient()

  // Fetch up to 1000 users (sufficient for early scale; paginate when needed)
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })

  // For each user, fetch ONLY completion_percent — nothing else from quiz_profiles
  const userIds = users.map((u) => u.id)

  // Single query: select ONLY completion_percent. Never select answers/result/demographics.
  const { data: profiles } = await admin
    .from('quiz_profiles')
    .select('user_id, completion_percent')   // ← ONLY these two columns, no profile content
    .in('user_id', userIds)

  const { data: roles } = await admin
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.completion_percent]))
  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]))

  const userList = users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    createdAt: u.created_at,
    completionPercent: profileMap.get(u.id) ?? 0,
    role: roleMap.get(u.id) ?? 'user',
  }))

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
        User Lookup
      </h1>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
        Super Admin only. Shows account creation date, quiz completion %, and role. No profile content is accessible here.
      </p>

      <UserSearch users={userList} currentUserId={currentUserId} />
    </div>
  )
}
