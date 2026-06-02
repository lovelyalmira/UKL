'use client'

import { useState } from 'react'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle,  } from '@/components/ui/dialog'
import { MenuForm } from './MenuForm'
import { Plus, Edit, Trash2, Tag, Image as ImageIcon } from 'lucide-react'

const quickActions = [
  {
    icon: Plus,
    label: 'Tambah Menu',
    description: 'Buat menu baru dengan foto dan harga',
    action: 'add',
    color: 'bg-primary',
  },
  {
    icon: Edit,
    label: 'Edit Menu',
    description: 'Ubah nama, harga, atau stok menu',
    action: 'edit',
    color: 'bg-secondary',
  },
  {
    icon: Tag,
    label: 'Kelola Topping',
    description: 'Tambah atau edit topping tambahan',
    action: 'toppings',
    color: 'bg-accent',
  },
  {
    icon: ImageIcon,
    label: 'Upload Foto',
    description: 'Kelola gambar menu dan banner',
    action: 'images',
    color: 'bg-success',
  },
]

export function MenuQuickActions() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string>('add')

  const handleAction = (action: string) => {
    setSelectedAction(action)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.action}
              onClick={() => handleAction(action.action)}
              className="flex flex-col items-center p-4 bg-card border rounded-xl hover:border-primary/50 transition-all text-left card-hover"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {action.description}
              </span>
            </button>
          )
        })}
      </div>

      {/* Dialog for actions */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAction === 'add' && 'Tambah Menu Baru'}
              {selectedAction === 'edit' && 'Edit Menu'}
              {selectedAction === 'toppings' && 'Kelola Topping'}
              {selectedAction === 'images' && 'Upload Foto Menu'}
            </DialogTitle>
          </DialogHeader>
          
          <CardContent className="pt-4">
            {selectedAction === 'add' || selectedAction === 'edit' ? (
              <MenuForm 
                mode={selectedAction === 'add' ? 'create' : 'edit'}
                onSuccess={() => setDialogOpen(false)}
                onCancel={() => setDialogOpen(false)}
              />
            ) : selectedAction === 'toppings' ? (
              <ToppingsManager onClose={() => setDialogOpen(false)} />
            ) : (
              <ImageUploader onClose={() => setDialogOpen(false)} />
            )}
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Sub-component: Toppings Manager
function ToppingsManager({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Kelola topping tambahan yang bisa dipilih customer
      </p>
      <div className="space-y-2">
        {['Keju Mozzarella', 'Telur', 'Sosis', 'Jagung', 'Sambal Level'].map((topping, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm">{topping}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">+Rp 5.000</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Tambah Topping Baru
      </Button>
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={onClose}>Selesai</Button>
      </div>
    </div>
  )
}

// Sub-component: Image Uploader
function ImageUploader({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Drag & drop foto atau klik untuk upload</p>
        <p className="text-xs text-muted-foreground mt-1">Max 5MB • JPG, PNG</p>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onClose}>Batal</Button>
        <Button className="flex-1" variant="secondary">Upload</Button>
      </div>
    </div>
  )
}