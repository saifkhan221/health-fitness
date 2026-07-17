import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db: ReturnType<typeof createDb> | null = null

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set — add it to .env')
  // prepare:false required for Supabase transaction pooler (port 6543)
  const client = postgres(url, { prepare: false })
  return drizzle(client, { schema })
}

export function useDb() {
  if (!_db) _db = createDb()
  return _db
}

export { schema }
