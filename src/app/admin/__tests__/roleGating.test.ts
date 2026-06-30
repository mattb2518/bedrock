import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UnauthorizedError, requireAdminRole, requireSuperAdminRole } from '@/lib/auth/requireRole'

// Mock getRole so we can control what role is returned per test
vi.mock('@/lib/auth/getRole', () => ({
  getCurrentUserRole: vi.fn(),
}))

import { getCurrentUserRole } from '@/lib/auth/getRole'
const mockGetRole = vi.mocked(getCurrentUserRole)

beforeEach(() => {
  vi.clearAllMocks()
})

// ── requireAdminRole ──────────────────────────────────────────────────────────

describe('requireAdminRole', () => {
  it('throws UnauthorizedError for "user" role', async () => {
    mockGetRole.mockResolvedValue('user')
    await expect(requireAdminRole()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('throws UnauthorizedError with correct message for "user" role', async () => {
    mockGetRole.mockResolvedValue('user')
    await expect(requireAdminRole()).rejects.toThrow('Requires admin role')
  })

  it('resolves (does not throw) for "admin" role', async () => {
    mockGetRole.mockResolvedValue('admin')
    await expect(requireAdminRole()).resolves.toBeUndefined()
  })

  it('resolves (does not throw) for "super_admin" role', async () => {
    mockGetRole.mockResolvedValue('super_admin')
    await expect(requireAdminRole()).resolves.toBeUndefined()
  })
})

// ── requireSuperAdminRole ─────────────────────────────────────────────────────

describe('requireSuperAdminRole', () => {
  it('throws UnauthorizedError for "user" role', async () => {
    mockGetRole.mockResolvedValue('user')
    await expect(requireSuperAdminRole()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('throws UnauthorizedError for "admin" role — admin cannot reach super_admin routes', async () => {
    mockGetRole.mockResolvedValue('admin')
    await expect(requireSuperAdminRole()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('throws with correct message for "admin" role', async () => {
    mockGetRole.mockResolvedValue('admin')
    await expect(requireSuperAdminRole()).rejects.toThrow('Requires super_admin role')
  })

  it('resolves (does not throw) for "super_admin" role', async () => {
    mockGetRole.mockResolvedValue('super_admin')
    await expect(requireSuperAdminRole()).resolves.toBeUndefined()
  })
})

// ── UnauthorizedError identity ────────────────────────────────────────────────

describe('UnauthorizedError', () => {
  it('is an instance of Error', () => {
    const err = new UnauthorizedError('admin')
    expect(err).toBeInstanceOf(Error)
  })

  it('carries the required role in its message', () => {
    expect(new UnauthorizedError('admin').message).toBe('Requires admin role')
    expect(new UnauthorizedError('super_admin').message).toBe('Requires super_admin role')
  })

  it('has name UnauthorizedError', () => {
    expect(new UnauthorizedError('admin').name).toBe('UnauthorizedError')
  })
})

// ── User role cannot call server actions ──────────────────────────────────────
// These tests verify that each server action guard function RAISES before any
// data operation — by calling the guard and confirming it throws for a 'user'.
// (Server actions themselves use 'use server' and require a Next.js runtime to
// fully invoke, so we test the guard layer, which is where the security sits.)

describe('server action guard: user role blocked from admin actions', () => {
  it('requireAdminRole blocks user before any data can be touched', async () => {
    mockGetRole.mockResolvedValue('user')
    // Calling the guard (same guard all admin actions call at the top) throws
    await expect(requireAdminRole()).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('requireSuperAdminRole blocks both user and admin from super_admin operations', async () => {
    for (const role of ['user', 'admin'] as const) {
      mockGetRole.mockResolvedValue(role)
      await expect(requireSuperAdminRole()).rejects.toBeInstanceOf(UnauthorizedError)
    }
  })

  it('only super_admin passes the super_admin guard — no other role can reach user management', async () => {
    const results = await Promise.allSettled([
      (mockGetRole.mockResolvedValue('user'), requireSuperAdminRole()),
      (mockGetRole.mockResolvedValue('admin'), requireSuperAdminRole()),
    ])
    expect(results.every((r) => r.status === 'rejected')).toBe(true)

    mockGetRole.mockResolvedValue('super_admin')
    await expect(requireSuperAdminRole()).resolves.toBeUndefined()
  })
})
