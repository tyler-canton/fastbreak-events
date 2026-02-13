'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEvents, useSeries } from '@/lib/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { EventFilters } from '@/components/events/event-filters'
import { Plus, FolderOpen, Calendar, Loader2, MapPin, Zap, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

export function DashboardContent() {
  const searchParams = useSearchParams()
  const hasShownToast = useRef(false)
  const didFetch = useRef(false)

  const filters = {
    search: searchParams.get('search') || undefined,
    sportType: searchParams.get('sport') || undefined,
    seriesId: searchParams.get('series') || undefined,
  }

  const {
    data: events = [],
    isLoading: eventsLoading,
    isFetching: eventsFetching,
  } = useEvents(filters)

  const {
    data: series = [],
    isLoading: seriesLoading,
    isFetching: seriesFetching,
  } = useSeries()

  const isLoading = eventsLoading || seriesLoading
  const isFetching = eventsFetching || seriesFetching

  // Track if a fetch happened during this page visit
  useEffect(() => {
    if (isFetching) {
      didFetch.current = true
    }
  }, [isFetching])

  // Reset tracking when filters change (new query = new cache check)
  useEffect(() => {
    hasShownToast.current = false
    didFetch.current = false
  }, [filters.search, filters.sportType, filters.seriesId])

  // Show toast when data loaded from cache (no fetch happened)
  useEffect(() => {
    // Only show if: not loading, not fetching, never fetched, has data, haven't shown toast yet
    if (!isLoading && !isFetching && !didFetch.current && events.length > 0 && !hasShownToast.current) {
      toast.success('Loaded from cache', {
        description: 'Data served instantly from React Query memory',
        icon: <Zap className="h-4 w-4 text-yellow-500" />,
        duration: 2000,
      })
      hasShownToast.current = true
    }
  }, [isLoading, isFetching, events.length])

  // Determine cache status for visual indicator
  const isFromCache = !isLoading && !isFetching && !didFetch.current

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cache Status Indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {isFetching ? (
          <div className="flex items-center gap-1 text-blue-600">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Refreshing...</span>
          </div>
        ) : isFromCache ? (
          <div className="flex items-center gap-1 text-green-600">
            <Zap className="h-3 w-3" />
            <span>From cache</span>
          </div>
        ) : null}
      </div>

      <Accordion type="multiple" defaultValue={['series', 'events']} className="space-y-4">
        {/* Event Series Section */}
        <AccordionItem value="series" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Event Series</h2>
                  <p className="text-sm text-muted-foreground">{series.length} series</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link href="/dashboard/series/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Series
                </Link>
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {series.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="py-8 text-center text-gray-500">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No series yet. Create a series to group related events.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {series.map((s) => {
                  const eventCount = events.filter(e => e.series_id === s.id).length
                  return (
                    <Link key={s.id} href={`/dashboard/series/${s.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-purple-500">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-medium">{s.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">{s.sport_type}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {s.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{s.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {eventCount} {eventCount === 1 ? 'event' : 'events'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Events Section */}
        <AccordionItem value="events" className="border rounded-lg bg-white shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold">Events</h2>
                  <p className="text-sm text-muted-foreground">{events.length} events</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link href="/dashboard/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Link>
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="mb-4">
              <EventFilters series={series} />
            </div>
            {events.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="py-8 text-center text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No events yet. Create your first event to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base font-medium">{event.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">{event.sport_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(event.date_time), 'MMM d, yyyy h:mm a')}
                        </div>
                        {event.venues && event.venues.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {event.venues[0].name}
                            {event.venues.length > 1 && ` +${event.venues.length - 1} more`}
                          </div>
                        )}
                        {event.series_id && (
                          <Badge variant="outline" className="text-xs">
                            In Series
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
