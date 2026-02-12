'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { eventSchema, type EventFormData, SPORT_TYPES } from '@/lib/validations/event'
import { createEvent, updateEvent } from '@/lib/actions/events'
import type { EventSeries, EventWithVenues } from '@/lib/types/database'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EventFormProps {
  series: EventSeries[]
  event?: EventWithVenues
}

export function EventForm({ series, event }: EventFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EventFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventSchema) as any,
    defaultValues: event
      ? {
          name: event.name,
          sport_type: event.sport_type,
          date_time: event.date_time.slice(0, 16), // Format for datetime-local
          description: event.description || '',
          series_id: event.series_id || undefined,
          venues: event.venues.map((v) => ({
            id: v.id,
            name: v.name,
            address: v.address || '',
            capacity: v.capacity || undefined,
          })),
        }
      : {
          name: '',
          sport_type: '',
          date_time: '',
          description: '',
          series_id: undefined,
          venues: [{ name: '', address: '', capacity: undefined }],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'venues',
  })

  async function onSubmit(data: EventFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = event
        ? await updateEvent(event.id, data)
        : await createEvent(data)

      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(event ? 'Event updated successfully' : 'Event created successfully')
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
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
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
                name="date_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {series.length > 0 && (
              <FormField
                control={form.control}
                name="series_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a series" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Series</SelectItem>
                        {series.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Venues</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', address: '', capacity: undefined })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-4 relative"
              >
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}

                <FormField
                  control={form.control}
                  name={`venues.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter venue name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`venues.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`venues.${index}.capacity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter capacity"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            {form.formState.errors.venues?.root && (
              <p className="text-sm text-red-500">
                {form.formState.errors.venues.root.message}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
