// src/app/client/inventory/layout.jsx
"use client"

import { ClientProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function InventoryLayout({ children }) {
  return (
    <ClientProtectedRoute>
      {children}
    </ClientProtectedRoute>
  )
}