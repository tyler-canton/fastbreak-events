import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEventById, deleteEvent } from '@/lib/actions/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Users, Edit } from 'lucide-react'
import { DeleteEventButton } from '@/components/events/delete-event-button'
import type { Venue } from '@/lib/types/database'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const { data: event, error } = await getEventById(id)

  if (error || !event) {
    notFound()
  }

  const eventDate = new Date(event.date_time)
  const isPast = eventDate < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/events/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteEventButton eventId={id} eventName={event.name} />
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
              {event.event_series && (
                <p className="text-sm text-gray-500 mt-1">
                  Part of: {event.event_series.name}
                </p>
              )}
            </div>
            <Badge variant={isPast ? 'secondary' : 'default'} className="text-sm">
              {event.sport_type}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="font-medium">
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm">
                    {eventDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {event.description && (
                <div className="pt-2">
                  <p className="text-gray-600">{event.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Venues ({event.venues.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.venues.map((venue: Venue) => (
                <div key={venue.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4" />
                    {venue.name}
                  </div>
                  {venue.address && (
                    <p className="text-sm text-gray-600 mt-1 ml-6">{venue.address}</p>
                  )}
                  {venue.capacity && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2 ml-6">
                      <Users className="h-4 w-4" />
                      Capacity: {venue.capacity}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
