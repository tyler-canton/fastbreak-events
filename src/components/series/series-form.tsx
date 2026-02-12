'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { seriesSchema, type SeriesFormData, SPORT_TYPES } from '@/lib/validations/event'
import { createSeries, updateSeries } from '@/lib/actions/series'
import type { EventSeries } from '@/lib/types/database'
import { useState } from 'react'
import { toast } from 'sonner'

interface SeriesFormProps {
  series?: EventSeries
}

export function SeriesForm({ series }: SeriesFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: series
      ? {
          name: series.name,
          sport_type: series.sport_type,
          description: series.description || '',
        }
      : {
          name: '',
          sport_type: '',
          description: '',
        },
  })

  async function onSubmit(data: SeriesFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = series
        ? await updateSeries(series.id, data)
        : await createSeries(data)

      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(series ? 'Series updated successfully' : 'Series created successfully')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Series Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter series name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sport_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPORT_TYPES.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter series description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : series ? 'Update Series' : 'Create Series'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
