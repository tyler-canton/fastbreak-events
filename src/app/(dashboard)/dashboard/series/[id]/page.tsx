import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSeriesById } from '@/lib/actions/series'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Calendar } from 'lucide-react'
import { DeleteSeriesButton } from '@/components/series/delete-series-button'
import { EventCard } from '@/components/events/event-card'

export default async function SeriesDetailPage({
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
  const { data: series, error } = await getSeriesById(id)

  if (error || !series) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/series/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeleteSeriesButton seriesId={id} seriesName={series.name} />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{series.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(series.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className="text-sm">{series.sport_type}</Badge>
          </div>

          {series.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{series.description}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Events in this Series ({series.events?.length || 0})
              </h2>
              <Button asChild>
                <Link href={`/dashboard/events/new?series=${id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Event
                </Link>
              </Button>
            </div>
            {series.events && series.events.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {series.events.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No events in this series yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
