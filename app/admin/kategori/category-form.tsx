'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { createCategory, updateCategory } from './actions'
import { toast } from 'sonner'

type Category = {
  id: number
  name: string
  slug: string
  description?: string | null
  article_count?: number
}

type Props = {
  mode: 'create' | 'edit'
  category?: Category
  children: React.ReactNode
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function CategoryForm({ mode, category, children }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [isPending, startTransition] = useTransition()

  const slug = generateSlug(name)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    
    if (mode === 'edit' && category) {
      formData.append('id', category.id.toString())
    }

    startTransition(async () => {
      const result = mode === 'create' 
        ? await createCategory(formData)
        : await updateCategory(formData)

      if (result.success) {
        toast.success(
          mode === 'create' 
            ? `Kategori "${name}" berhasil ditambahkan`
            : `Kategori "${name}" berhasil diupdate`
        )
        setOpen(false)
        setName('')
        setDescription('')
      } else {
        toast.error(result.error || 'Terjadi kesalahan')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Buat kategori baru untuk mengelompokkan berita'
                : 'Update informasi kategori'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budaya & Pariwisata"
                required
                disabled={isPending}
              />
              {slug && (
                <p className="text-xs text-gray-500 mt-1">
                  Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded">/{slug}</code>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat kategori"
                disabled={isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Tambah' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}