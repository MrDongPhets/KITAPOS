"use client"

import { useAuth } from '@/components/auth/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { isAuthenticated, userType, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (userType === 'super_admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/client/dashboard')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, userType, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>
}