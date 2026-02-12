import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EventWithVenues } from '@/lib/types/database'
import { MapPin, Calendar, Users } from 'lucide-react'

interface EventCardProps {
  event: EventWithVenues
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date_time)
  const isPast = eventDate < new Date()

  return (
    <Card className={isPast ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
          <Badge variant={isPast ? 'secondary' : 'default'}>
            {event.sport_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {eventDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            at{' '}
            {eventDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
        {event.venues.length > 0 && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {event.venues[0].name}
              {event.venues.length > 1 && ` +${event.venues.length - 1} more`}
            </span>
          </div>
        )}
        {event.venues[0]?.capacity && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Capacity: {event.venues[0].capacity}</span>
          </div>
        )}
        {event.description && (
          <p className="line-clamp-2 pt-1">{event.description}</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
