"use client"

import { ClientProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ClientLayout({ children }) {
  return (
    <ClientProtectedRoute>
      {children}
    </ClientProtectedRoute>
  )
}