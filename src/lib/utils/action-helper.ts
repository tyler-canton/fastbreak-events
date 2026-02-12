import { createClient } from '@/lib/supabase/server'

export type ActionResult<T = void> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string }

export async function withAuth<T>(
  action: (userId: string) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, data: null, error: 'Unauthorized' }
    }

    return await action(user.id)
  } catch (error) {
    console.error('Action error:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export function createActionResult<T>(data: T): ActionResult<T> {
  return { success: true, data, error: null }
}

export function createErrorResult(error: string): ActionResult<never> {
  return { success: false, data: null, error }
}
