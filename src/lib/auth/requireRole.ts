import { getCurrentUserRole } from './getRole'
import type { UserRole } from '@/types/user'

export class UnauthorizedError extends Error {
  constructor(required: UserRole) {
    super(`Requires ${required} role`)
    this.name = 'UnauthorizedError'
  }
}

// Guards for server actions — call at the top of every admin action before touching data.
export async function requireAdminRole(): Promise<void> {
  const role = await getCurrentUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    throw new UnauthorizedError('admin')
  }
}

export async function requireSuperAdminRole(): Promise<void> {
  const role = await getCurrentUserRole()
  if (role !== 'super_admin') {
    throw new UnauthorizedError('super_admin')
  }
}
