'use client'

import { Suspense } from 'react'
import LoginPage from './admin/login/page' // atau arahkan ke komponen utamamu

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Memuat halaman...</div>}>
      <LoginPage />
    </Suspense>
  )
}