'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/lib/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Lock, Mail } from 'lucide-react'
import Cookies from 'js-cookie'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin/dashboard'
  
  const [isLoading, setIsLoading] = useState(false)
  const login = useLogin()
  
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await login.mutateAsync(data)
      
      let token = ''
      if (response && typeof response === 'object') {
        const record = response as Record<string, unknown>
        
        if ('data' in record && record.data && typeof record.data === 'object') {
          const nestedData = record.data as Record<string, unknown>
          if (typeof nestedData.access_token === 'string') {
            token = nestedData.access_token
          }
        }
        
        if (!token && typeof record.access_token === 'string') {
          token = record.access_token
        }
      }
      
      if (token) {
        Cookies.set('token', token, { expires: 7, path: '/' })
        localStorage.setItem('token', token)
        sessionStorage.setItem('token', token)
        Cookies.set('accessToken', token, { expires: 7, path: '/' })
        localStorage.setItem('accessToken', token)
        toast.success('Login berhasil!')
      } else {
        toast.error('Token tidak ditemukan')
      }
      
      setTimeout(() => {
        router.push(from)
        router.refresh()
      }, 500)
      
    } catch (error: unknown) {
      toast.error('Login gagal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<LoginForm, 'email'> }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="gacoan@resto.com" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }: { field: ControllerRenderProps<LoginForm, 'password'> }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading || login.isPending}>
          {isLoading || login.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Masuk'}
        </Button>
      </form>
    </Form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🍽️</div>
          <CardTitle className="text-2xl">Toast Admin</CardTitle>
          <CardDescription>Masuk untuk mengelola restoran Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pembungkus Suspense Krusial Agar Vercel Build Sukses */}
          <Suspense fallback={<div className="text-center py-4">Memuat halaman...</div>}>
            <LoginFormContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}