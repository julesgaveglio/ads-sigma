import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key)
}

/**
 * Paginate through Supabase results (1000 row limit per request).
 */
export async function fetchAllRows<T>(
  query: () => ReturnType<ReturnType<typeof createClient>['from']>['select'],
  pageSize = 1000
): Promise<T[]> {
  const results: T[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const q = query()
    const { data, error } = await (q as unknown as { range: (from: number, to: number) => Promise<{ data: T[] | null; error: unknown }> }).range(offset, offset + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) {
      hasMore = false
    } else {
      results.push(...data)
      if (data.length < pageSize) hasMore = false
      offset += pageSize
    }
  }

  return results
}
