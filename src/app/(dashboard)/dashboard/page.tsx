import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { getEvents } from '@/lib/actions/events'
import { getSeries } from '@/lib/actions/series'
import { Button } from '@/components/ui/button'
import { EventList } from '@/components/events/event-list'
import { EventFilters } from '@/components/events/event-filters'
import { Plus } from 'lucide-react'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sport?: string; series?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  const [eventsResult, seriesResult] = await Promise.all([
    getEvents({
      search: params.search,
      sportType: params.sport,
      seriesId: params.series,
    }),
    getSeries(),
  ])

  const events = eventsResult.data || []
  const series = seriesResult.data || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Fastbreak Events</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/series/new">
                <Plus className="h-4 w-4 mr-2" />
                New Series
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/events/new">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Link>
            </Button>
          </div>
        </div>
        <EventFilters series={series} />
        <EventList events={events} />
      </main>
    </div>
  )
}
