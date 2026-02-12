'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eventSchema, type EventFormData } from '@/lib/validations/event'
import type { Event, EventWithVenues, Venue } from '@/lib/types/database'

export async function getEvents(options?: {
  search?: string
  sportType?: string
  seriesId?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  let query = supabase
    .from('events')
    .select('*, venues(*)')
    .eq('user_id', user.id)
    .order('date_time', { ascending: true })

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  if (options?.sportType) {
    query = query.eq('sport_type', options.sportType)
  }

  if (options?.seriesId) {
    query = query.eq('series_id', options.seriesId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as EventWithVenues[] }
}

export async function getEventById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('events')
    .select('*, venues(*), event_series(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createEvent(formData: EventFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validated = eventSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { venues, ...eventData } = validated.data

  // Create the event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      ...eventData,
      user_id: user.id,
      series_id: eventData.series_id || null,
    })
    .select()
    .single()

  if (eventError) {
    return { error: eventError.message }
  }

  // Create venues
  const venuesWithEventId = venues.map((venue) => ({
    ...venue,
    event_id: event.id,
  }))

  const { error: venuesError } = await supabase
    .from('venues')
    .insert(venuesWithEventId)

  if (venuesError) {
    // Rollback event creation
    await supabase.from('events').delete().eq('id', event.id)
    return { error: venuesError.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateEvent(id: string, formData: EventFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const validated = eventSchema.safeParse(formData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { venues, ...eventData } = validated.data

  // Update the event
  const { error: eventError } = await supabase
    .from('events')
    .update({
      ...eventData,
      series_id: eventData.series_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (eventError) {
    return { error: eventError.message }
  }

  // Delete existing venues and recreate
  await supabase.from('venues').delete().eq('event_id', id)

  const venuesWithEventId = venues.map((venue) => ({
    name: venue.name,
    address: venue.address,
    capacity: venue.capacity,
    event_id: id,
  }))

  const { error: venuesError } = await supabase
    .from('venues')
    .insert(venuesWithEventId)

  if (venuesError) {
    return { error: venuesError.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/events/${id}`)
  redirect('/dashboard')
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}
