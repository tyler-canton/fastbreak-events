'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SPORT_TYPES } from '@/lib/validations/event'
import type { EventSeries } from '@/lib/types/database'
import { Search, X, Filter } from 'lucide-react'
import { useTransition } from 'react'

interface EventFiltersProps {
  series: EventSeries[]
}

export function EventFilters({ series }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') || ''
  const currentSport = searchParams.get('sport') || ''
  const currentSeries = searchParams.get('series') || ''

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`)
    })
  }

  function clearFilters() {
    startTransition(() => {
      router.push('/dashboard')
    })
  }

  const hasFilters = currentSearch || currentSport || currentSeries
  const activeFilterCount = [currentSearch, currentSport, currentSeries].filter(Boolean).length

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events by name..."
              className="pl-10 h-11"
              defaultValue={currentSearch}
              onChange={(e) => {
                const value = e.target.value
                const timeout = setTimeout(() => {
                  updateFilters('search', value)
                }, 300)
                return () => clearTimeout(timeout)
              }}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>
            <div className="flex flex-wrap gap-3 flex-1">
              <Select
                value={currentSport}
                onValueChange={(value) => updateFilters('sport', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {SPORT_TYPES.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {series.length > 0 && (
                <Select
                  value={currentSeries}
                  onValueChange={(value) => updateFilters('series', value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Series</SelectItem>
                    <SelectItem value="none">Standalone Events</SelectItem>
                    {series.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={isPending}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ''}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
