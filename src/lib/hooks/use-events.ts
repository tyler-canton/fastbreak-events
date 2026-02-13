'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/actions/events'
import { getSeries, createSeries, updateSeries, deleteSeries } from '@/lib/actions/series'
import type { EventFormData, SeriesFormData } from '@/lib/validations/event'
import { toast } from 'sonner'

interface EventFilters {
  search?: string
  sportType?: string
  seriesId?: string
}

// Query keys for cache management
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), filters] as const,
}

export const seriesKeys = {
  all: ['series'] as const,
  list: () => [...seriesKeys.all, 'list'] as const,
}

// Fetch events with caching
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async () => {
      const result = await getEvents(filters)
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
  })
}

// Fetch series with caching
export function useSeries() {
  return useQuery({
    queryKey: seriesKeys.list(),
    queryFn: async () => {
      const result = await getSeries()
      if (result.error) throw new Error(result.error)
      return result.data ?? []
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - series change less often
  })
}

// Create event mutation with cache invalidation
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EventFormData) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
      toast.success('Event created', {
        description: 'Your event has been created successfully',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create event', {
        description: error.message,
      })
    },
  })
}

// Update event mutation with cache invalidation
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventFormData }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
      toast.success('Event updated', {
        description: 'Your changes have been saved',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update event', {
        description: error.message,
      })
    },
  })
}

// Delete event mutation with cache invalidation
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
      toast.success('Event deleted', {
        description: 'The event has been removed',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete event', {
        description: error.message,
      })
    },
  })
}

// Create series mutation with cache invalidation
export function useCreateSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SeriesFormData) => createSeries(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.all })
      toast.success('Series created', {
        description: 'Your event series has been created successfully',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create series', {
        description: error.message,
      })
    },
  })
}

// Update series mutation with cache invalidation
export function useUpdateSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SeriesFormData }) =>
      updateSeries(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.all })
      toast.success('Series updated', {
        description: 'Your changes have been saved',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to update series', {
        description: error.message,
      })
    },
  })
}

// Delete series mutation with cache invalidation
export function useDeleteSeries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.all })
      toast.success('Series deleted', {
        description: 'The series has been removed',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete series', {
        description: error.message,
      })
    },
  })
}
