import type { H3Event } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { sql } from 'drizzle-orm'
import { useDb, schema } from '../db/client'

/** Authenticated user id for an API request; 401 if not logged in. */
export async function requireUserId(event: H3Event): Promise<string> {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })

  // Lazy profile bootstrap on first authenticated request
  const db = useDb()
  await db
    .insert(schema.userProfiles)
    .values({
      userId: user.id,
      displayName: (user.user_metadata?.display_name as string) ?? null,
    })
    .onConflictDoNothing({ target: schema.userProfiles.userId })

  return user.id
}

/** Ownership guard for row-level checks in queries. */
export const ownedBy = (userId: string) => sql`user_id = ${userId}`
