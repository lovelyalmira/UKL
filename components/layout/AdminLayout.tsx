'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth, useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Tag,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart, roles: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Menu', href: '/admin/menus', icon: Utensils, roles: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Promo', href: '/admin/promos', icon: Tag, roles: ['STAFF', 'ADMIN'] },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Cabang', href: '/admin/branches', icon: Building2, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN', 'SUPER_ADMIN'] },
]

// ✅ Dipindah keluar dari AdminLayout agar tidak dibuat ulang setiap render
interface NavItemsProps {
  mobile?: boolean
  sidebarOpen: boolean
  pathname: string
  userRole: string
  onMobileClose?: () => void
}

function NavItems({ mobile = false, sidebarOpen, pathname, userRole, onMobileClose }: NavItemsProps) {
  return (
    <nav className="space-y-1">
      {navigation
        .filter((item) => item.roles.includes(userRole))
        .map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && onMobileClose?.()}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                !sidebarOpen && !mobile && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {(sidebarOpen || mobile) && <span>{item.name}</span>}
            </Link>
          )
        })}
    </nav>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: user } = useAuth()
  const logout = useLogout()

  const userRole = user?.role || 'STAFF'

  const handleLogout = async () => {
    await logout.mutateAsync()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {sidebarOpen && (
            <span className="text-xl font-bold text-primary">Toast</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <NavItems
            sidebarOpen={sidebarOpen}
            pathname={pathname}
            userRole={userRole}
          />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as { avatar?: string })?.avatar} />
                  <AvatarFallback>{(user as { name?: string })?.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b z-40 flex items-center justify-between px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="h-16 px-4 border-b flex items-center">
                <span className="text-xl font-bold text-primary">Toast Admin</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <NavItems
                  mobile
                  sidebarOpen={sidebarOpen}
                  pathname={pathname}
                  userRole={userRole}
                  onMobileClose={() => setMobileOpen(false)}
                />
              </div>
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold">Toast Admin</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}