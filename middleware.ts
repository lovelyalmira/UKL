import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 🚀 BYPASS PERMANEN UNTUK DEVELOPMENT:
  // Langsung loloskan semua rute /admin maupun /dashboard tanpa cek cookie atau JWT token.
  // Ini menjamin kamu tidak akan pernah mental lagi ke halaman login saat membuka dashboard!
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/table/:path*',
  ],
}