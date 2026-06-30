// User role — matches the check constraint in public.user_roles
export type UserRole = "user" | "admin" | "super_admin"

export interface UserRoleRow {
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}
