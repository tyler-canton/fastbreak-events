'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { seriesSchema, type SeriesFormData } from '@/lib/validations/event'
import type { EventSeries } from '@/lib/types/database'

export async function getSeries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('event_series')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as EventSeries[] }
}

export async function getSeriesById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('event_series')
    .select('*, events(*, venues(*))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createSeries(formData: SeriesFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validated = seriesSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from('event_series')
    .insert({
      ...validated.data,
      user_id: user.id,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateSeries(id: string, formData: SeriesFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validated = seriesSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { error } = await supabase
    .from('event_series')
    .update(validated.data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/series/${id}`)
  redirect('/dashboard')
}

export async function deleteSeries(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('event_series')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}
