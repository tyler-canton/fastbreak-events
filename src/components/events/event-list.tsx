import { EventCard } from './event-card'
import type { EventWithVenues } from '@/lib/types/database'

interface EventListProps {
  events: EventWithVenues[]
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p className="text-lg font-medium">No events found</p>
        <p className="text-sm mt-1">Create your first event to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
