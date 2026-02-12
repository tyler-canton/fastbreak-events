'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteSeries } from '@/lib/actions/series'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteSeriesButtonProps {
  seriesId: string
  seriesName: string
}

export function DeleteSeriesButton({ seriesId, seriesName }: DeleteSeriesButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteSeries(seriesId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Series deleted successfully')
      router.push('/dashboard')
    }
    setIsDeleting(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Series</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{seriesName}&quot;? This action cannot be
            undone. Events in this series will not be deleted but will no longer be
            associated with this series.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
