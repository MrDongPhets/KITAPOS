// src/middleware.js - Updated for better route protection
import { NextResponse } from 'next/server'

export function middleware(request) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/system-admin', '/api']
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath)
  )

  // Protected client paths
  const clientPaths = ['/client']
  const isClientPath = clientPaths.some(clientPath => 
    path.startsWith(clientPath)
  )

  // Protected admin paths
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some(adminPath => 
    path.startsWith(adminPath)
  )

  // Check if any protected path is being accessed
  const isProtectedPath = isClientPath || isAdminPath

  // Handle root path redirect
  if (path === '/') {
    // Let the AuthProvider handle the redirect based on authentication state
    return NextResponse.next()
  }

  // Let AuthProvider handle authentication checks for protected paths
  // Middleware should focus on basic routing only
  if (isProtectedPath || isPublicPath) {
    return NextResponse.next()
  }

  // For any other paths, continue normally
  return NextResponse.next()
}