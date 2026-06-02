'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { data: user, isLoading } = useAuth()

  if (isLoading) {
    return fallback || <div className="p-4">Loading...</div>
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold">Akses Ditolak</p>
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini
        </p>
      </div>
    )
  }

  return <>{children}</>
}

// HOC version
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[],
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}

// Hook for conditional rendering
export function useRoleCheck(allowedRoles: UserRole[]) {
  const { data: user } = useAuth()
  return {
    hasAccess: user ? allowedRoles.includes(user.role) : false,
    role: user?.role,
  }
}