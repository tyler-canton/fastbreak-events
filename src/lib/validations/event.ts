import { z } from 'zod'

export const venueSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  capacity: z.number().int().positive().optional(),
})

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sport_type: z.string().min(1, 'Sport type is required'),
  date_time: z.string().min(1, 'Date and time is required'),
  description: z.string().optional(),
  series_id: z.string().uuid().optional().nullable(),
  venues: z.array(venueSchema).min(1, 'At least one venue is required'),
})

export const seriesSchema = z.object({
  name: z.string().min(1, 'Series name is required'),
  description: z.string().optional(),
  sport_type: z.string().min(1, 'Sport type is required'),
})

export type VenueFormData = z.infer<typeof venueSchema>
export type EventFormData = z.infer<typeof eventSchema>
export type SeriesFormData = z.infer<typeof seriesSchema>

export const SPORT_TYPES = [
  'Basketball',
  'Football',
  'Soccer',
  'Baseball',
  'Hockey',
  'Tennis',
  'Golf',
  'Volleyball',
  'Swimming',
  'Track & Field',
  'Other',
] as const
