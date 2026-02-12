'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SPORT_TYPES } from '@/lib/validations/event'
import type { EventSeries } from '@/lib/types/database'
import { Search, X } from 'lucide-react'
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

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search events..."
          className="pl-9"
          defaultValue={currentSearch}
          onChange={(e) => {
            const value = e.target.value
            // Debounce search
            const timeout = setTimeout(() => {
              updateFilters('search', value)
            }, 300)
            return () => clearTimeout(timeout)
          }}
        />
      </div>
      <Select
        value={currentSport}
        onValueChange={(value) => updateFilters('sport', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
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
            {series.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters} disabled={isPending}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
