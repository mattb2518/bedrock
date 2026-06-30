import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/user"

// Returns the role for the currently authenticated user, defaulting to 'user'.
// Safe to call from Server Components and Route Handlers.
export async function getCurrentUserRole(): Promise<UserRole> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "user"

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  return (data?.role as UserRole) ?? "user"
}
