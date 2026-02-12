export type EventSeries = {
  id: string
  user_id: string
  name: string
  description: string | null
  sport_type: string
  created_at: string
}

export type Event = {
  id: string
  user_id: string
  series_id: string | null
  name: string
  sport_type: string
  date_time: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Venue = {
  id: string
  event_id: string
  name: string
  address: string | null
  capacity: number | null
}

// Extended types with relations
export type EventWithVenues = Event & {
  venues: Venue[]
}

export type EventWithDetails = Event & {
  venues: Venue[]
  series: EventSeries | null
}

// Form types (for creating/updating)
export type CreateEventInput = {
  name: string
  sport_type: string
  date_time: string
  description?: string
  series_id?: string
  venues: CreateVenueInput[]
}

export type UpdateEventInput = Partial<CreateEventInput> & {
  id: string
}

export type CreateVenueInput = {
  name: string
  address?: string
  capacity?: number
}

export type CreateSeriesInput = {
  name: string
  description?: string
  sport_type: string
}

export type UpdateSeriesInput = Partial<CreateSeriesInput> & {
  id: string
}
