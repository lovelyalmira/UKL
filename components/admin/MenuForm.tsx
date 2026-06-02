'use client'

import { useState } from 'react'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateMenu, useUpdateMenu } from '@/lib/hooks/useMenus'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, X, Upload } from 'lucide-react'
import type { Menu } from '@/types'

const menuSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Harga tidak valid'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  image: z.string().url('URL gambar tidak valid').or(z.literal('')).optional(),
  isAvailable: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  toppingIds: z.array(z.string()).default([]),
})

type MenuFormValues = z.infer<typeof menuSchema>

interface MenuFormProps {
  mode: 'create' | 'edit'
  initialData?: Menu
  onSuccess?: () => void
  onCancel?: () => void
}

// Tipe eksplisit untuk setiap field
type StringField = ControllerRenderProps<MenuFormValues, 'name' | 'description' | 'price' | 'category' | 'image'>
type BooleanField = ControllerRenderProps<MenuFormValues, 'isAvailable' | 'isBestSeller'>

const CATEGORIES = ['Makanan', 'Minuman', 'Snack', 'Dessert', 'Paket']
const TOPPINGS = [
  { id: 't1', name: 'Keju Mozzarella', price: 5000 },
  { id: 't2', name: 'Telur', price: 3000 },
  { id: 't3', name: 'Sosis', price: 4000 },
  { id: 't4', name: 'Jagung', price: 2000 },
  { id: 't5', name: 'Sambal Level', price: 0 },
]

export function MenuForm({ mode, initialData, onSuccess, onCancel }: MenuFormProps) {
  const [selectedToppings, setSelectedToppings] = useState<string[]>(
    initialData?.toppings?.map(t => t.id) || []
  )

  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const isPending = createMenu.isPending || updateMenu.isPending

  const form = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '',
      category: initialData?.category || CATEGORIES[0],
      image: initialData?.image || '',
      isAvailable: initialData?.isAvailable ?? true,
      isBestSeller: initialData?.isBestSeller ?? false,
      toppingIds: selectedToppings,
    },
  })

  const toggleTopping = (toppingId: string) => {
    setSelectedToppings(prev => {
      const nextToppings = prev.includes(toppingId)
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId]

      form.setValue('toppingIds', nextToppings, { shouldValidate: true })
      return nextToppings
    })
  }

  const onSubmit = async (data: MenuFormValues) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        image: data.image || undefined,
      }

      if (mode === 'create') {
        await createMenu.mutateAsync({
          ...payload,
          branchId: 'current-branch-id',
        })
        toast.success('Menu berhasil ditambahkan')
      } else {
        await updateMenu.mutateAsync({
          id: initialData!.id,
          data: payload,
        })
        toast.success('Menu berhasil diperbarui')
      }
      onSuccess?.()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }: { field: StringField }) => (
            <FormItem>
              <FormLabel>Foto Menu</FormLabel>
              <FormControl>
                <div className="flex gap-3">
                  <Input placeholder="https://..." {...field} className="flex-1" />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name & Category */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: StringField }) => (
              <FormItem>
                <FormLabel>Nama Menu</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Mie Gacoan Level 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }: { field: StringField }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <FormControl>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    {...field}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: StringField }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsikan menu ini..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }: { field: StringField }) => (
            <FormItem>
              <FormLabel>Harga (Rp)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Toppings */}
        <div className="space-y-2">
          <FormLabel>Topping Tersedia</FormLabel>
          <div className="flex flex-wrap gap-2">
            {TOPPINGS.map(topping => (
              <Badge
                key={topping.id}
                variant={selectedToppings.includes(topping.id) ? 'default' : 'outline'}
                className="cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1"
                onClick={() => toggleTopping(topping.id)}
              >
                {topping.name}
                {topping.price > 0 && (
                  <span className="text-xs opacity-70">+{topping.price}</span>
                )}
                {selectedToppings.includes(topping.id) && (
                  <X
                    className="h-3 w-3"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      toggleTopping(topping.id)
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-6 pt-2">
          <FormField
            control={form.control}
            name="isAvailable"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!m-0 text-sm">Tersedia</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isBestSeller"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!m-0 text-sm">Best Seller</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="flex-1 btn-primary"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : mode === 'create' ? 'Tambah Menu' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}