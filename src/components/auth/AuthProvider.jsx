// src/components/auth/AuthProvider.jsx - Updated with Staff support
"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import API_CONFIG from '@/config/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth state only once
  useEffect(() => {
    if (!initialized) {
      console.log('🚀 Initializing auth with API:', API_CONFIG.BASE_URL)
      initializeAuth()
    }
  }, [initialized])

  // Route protection effect - runs after initialization
  useEffect(() => {
    if (initialized && !loading) {
      handleRouteProtection()
    }
  }, [initialized, loading, isAuthenticated, userType, pathname])

  const validateToken = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return false

    try {
      const userTypeData = localStorage.getItem('userType')
      
      // Different verification endpoints for different user types
      let endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`
      if (userTypeData === 'staff') {
        endpoint = `${API_CONFIG.BASE_URL}/staff/auth/verify`
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        return true;
      } else {
        console.log('Token validation failed:', data.error);
        handleTokenExpiration();
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  const handleTokenExpiration = useCallback(() => {
    console.log('🚨 Handling token expiration...')
    
    // Clear local state
    setUser(null)
    setUserType(null)
    setIsAuthenticated(false)
    
    // Clear localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userType')
    localStorage.removeItem('companyData')
    localStorage.removeItem('subscriptionData')
    localStorage.removeItem('staffData')
    
    // Show notification
    if (typeof window !== 'undefined') {
      alert('Your session has expired. Please log in again.')
    }
    
    // Redirect to appropriate login page
    const currentPath = window.location.pathname
    if (currentPath.startsWith('/admin')) {
      window.location.href = '/system-admin'
    } else if (currentPath.startsWith('/pos')) {
      window.location.href = '/staff/login'
    } else {
      window.location.href = '/login'
    }
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      console.log('📱 Loading from localStorage...')
      
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      const staffData = localStorage.getItem('staffData')
      const userTypeData = localStorage.getItem('userType')
      
      console.log('Token exists:', !!token)
      console.log('User type:', userTypeData)
      console.log('Current pathname:', pathname)
      
      if (token && userTypeData) {
        // Handle staff authentication
        if (userTypeData === 'staff' && staffData) {
          const parsedStaff = JSON.parse(staffData)
          
          console.log('🔍 Validating staff token...')
          const isValid = await validateToken()
          
          if (isValid) {
            setUser(parsedStaff)
            setUserType('staff')
            setIsAuthenticated(true)
            console.log('✅ Staff auth restored:', parsedStaff.staff_id)
          } else {
            console.log('❌ Staff token validation failed')
            localStorage.removeItem('authToken')
            localStorage.removeItem('staffData')
            localStorage.removeItem('userType')
            setUser(null)
            setUserType(null)
            setIsAuthenticated(false)
          }
        } 
        // Handle client/admin authentication
        else if (userData) {
          const parsedUser = JSON.parse(userData)
          
          console.log('🔍 Validating token with server...')
          const isValid = await validateToken()
          
          if (isValid) {
            setUser(parsedUser)
            setUserType(userTypeData)
            setIsAuthenticated(true)
            console.log('✅ Auth restored:', parsedUser.email, userTypeData)
          } else {
            console.log('❌ Token validation failed, clearing session')
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
            localStorage.removeItem('userType')
            localStorage.removeItem('companyData')
            localStorage.removeItem('subscriptionData')
            setUser(null)
            setUserType(null)
            setIsAuthenticated(false)
          }
        }
      } else {
        console.log('❌ No valid auth data found')
        setUser(null)
        setUserType(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      setUser(null)
      setUserType(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
      setInitialized(true)
      console.log('✅ Auth initialization complete')
    }
  }, [pathname])

  const handleRouteProtection = useCallback(() => {
    console.log('🛡️ Route protection check:', {
      pathname,
      isAuthenticated,
      userType,
      user: user?.email || user?.name
    })

    // Define route types
    const publicRoutes = ['/', '/register']
    const loginRoutes = ['/login', '/system-admin', '/staff/login']
    const adminRoutes = ['/admin']
    const clientRoutes = ['/client']
    const posRoutes = ['/pos']

    const isPublicRoute = publicRoutes.includes(pathname)
    const isLoginRoute = loginRoutes.includes(pathname)
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    const isClientRoute = clientRoutes.some(route => pathname.startsWith(route))
    const isPOSRoute = posRoutes.some(route => pathname.startsWith(route))

    console.log('Route analysis:', { isPublicRoute, isLoginRoute, isAdminRoute, isClientRoute, isPOSRoute })

    // PREVENT ALREADY AUTHENTICATED USERS FROM ACCESSING LOGIN PAGES
    if (isAuthenticated && isLoginRoute) {
      console.log('🔒 Already authenticated user trying to access login page')
      
      if (userType === 'super_admin') {
        window.location.href = '/admin/dashboard'
      } else if (userType === 'client') {
        window.location.href = '/client/dashboard'
      } else if (userType === 'staff') {
        window.location.href = '/pos'
      }
      return
    }

    // If not authenticated and trying to access protected routes
    if (!isAuthenticated && (isAdminRoute || isClientRoute || isPOSRoute)) {
      console.log('❌ Not authenticated, redirecting to appropriate login')
      if (isAdminRoute) {
        window.location.href = '/system-admin'
      } else if (isPOSRoute) {
        window.location.href = '/staff/login'
      } else {
        window.location.href = '/login'
      }
      return
    }

    // If authenticated, check user type matches route type
    if (isAuthenticated && userType) {
      console.log('✅ Authenticated user, checking route permissions')

      // Staff can only access POS
      if (userType === 'staff' && !isPOSRoute && !isPublicRoute) {
        console.log('📄 Staff accessing non-POS route, redirecting to POS')
        window.location.href = '/pos'
        return
      }

      // Super admin trying to access client/POS routes
      if (userType === 'super_admin' && (isClientRoute || isPOSRoute)) {
        console.log('📄 Super admin redirecting to admin dashboard')
        window.location.href = '/admin/dashboard'
        return
      }

      // Client trying to access admin/POS routes
      if (userType === 'client' && (isAdminRoute || isPOSRoute)) {
        console.log('📄 Client redirecting to client dashboard')
        window.location.href = '/client/dashboard'
        return
      }

      // Root path redirect
      if (pathname === '/') {
        console.log('📄 Root path, redirecting based on user type')
        if (userType === 'super_admin') {
          window.location.href = '/admin/dashboard'
        } else if (userType === 'client') {
          window.location.href = '/client/dashboard'
        } else if (userType === 'staff') {
          window.location.href = '/pos'
        }
        return
      }
    }

    console.log('✅ Route protection passed - no redirect needed')
  }, [isAuthenticated, userType, pathname, user])

  const login = useCallback(async (credentials, loginType = 'client') => {
    console.log('🔑 Login attempt:', credentials.email || credentials.staff_id, loginType)
    
    // PREVENT LOGIN IF ALREADY AUTHENTICATED
    if (isAuthenticated) {
      console.log('🔑 User already authenticated, preventing new login')
      return { 
        success: false, 
        error: 'You are already logged in. Please logout first to switch accounts.' 
      }
    }
    
    setLoading(true)
    
    try {
      const endpoint = loginType === 'super_admin' 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN}`
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`

      console.log('📡 Calling:', endpoint)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()
      console.log('📦 Server response:', data)

      if (response.ok && data.token) {
        // Clear any existing session first
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('userType')
        localStorage.removeItem('companyData')
        localStorage.removeItem('subscriptionData')
        localStorage.removeItem('staffData')

        // Determine the correct user type
        const finalUserType = data.userType || loginType

        console.log('💾 Storing auth data:', {
          userType: finalUserType,
          email: data.user.email
        })

        // Store data in localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        localStorage.setItem('userType', finalUserType)

        if (data.company) {
          localStorage.setItem('companyData', JSON.stringify(data.company))
        }

        // Update state immediately
        setUser(data.user)
        setUserType(finalUserType)
        setIsAuthenticated(true)

        console.log('✅ Login successful, redirecting...')

        // Immediate redirect based on user type
        setTimeout(() => {
          if (finalUserType === 'super_admin') {
            window.location.href = '/admin/dashboard'
          } else {
            window.location.href = '/client/dashboard'
          }
        }, 100)

        return { success: true }
      } else {
        console.log('❌ Login failed:', data.error)
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      return { success: false, error: 'Connection failed. Please check if the server is running.' }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const logout = useCallback(async () => {
    console.log('🚪 Logging out...')
    
    try {
      const token = localStorage.getItem('authToken')
      const currentUserType = localStorage.getItem('userType')
      
      if (token) {
        try {
          const endpoint = currentUserType === 'staff'
            ? `${API_CONFIG.BASE_URL}/staff/auth/logout`
            : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`
            
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Server logout failed, continuing with local cleanup');
        }
      }
      
      // Clear local data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userType')
      localStorage.removeItem('companyData')
      localStorage.removeItem('subscriptionData')
      localStorage.removeItem('staffData')
      
      setUser(null)
      setUserType(null)
      setIsAuthenticated(false)
      
      // Redirect based on previous user type
      if (currentUserType === 'staff') {
        window.location.href = '/staff/login'
      } else if (currentUserType === 'super_admin') {
        window.location.href = '/system-admin'
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userType')
      localStorage.removeItem('companyData')
      localStorage.removeItem('subscriptionData')
      localStorage.removeItem('staffData')
      
      setUser(null)
      setUserType(null)
      setIsAuthenticated(false)
      window.location.href = '/login'
    }
  }, [])

  const forceLogout = useCallback(async () => {
    console.log('📄 Force logout for account switching...')
    
    try {
      const token = localStorage.getItem('authToken')
      
      if (token) {
        try {
          await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Server logout failed, continuing with local cleanup');
        }
      }
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userType')
      localStorage.removeItem('companyData')
      localStorage.removeItem('subscriptionData')
      localStorage.removeItem('staffData')
      
      setUser(null)
      setUserType(null)
      setIsAuthenticated(false)
      setInitialized(false)
    } catch (error) {
      console.error('Force logout error:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      localStorage.removeItem('userType')
      localStorage.removeItem('companyData')
      localStorage.removeItem('subscriptionData')
      localStorage.removeItem('staffData')
      
      setUser(null)
      setUserType(null)
      setIsAuthenticated(false)
      setInitialized(false)
    }
  }, [])

  const value = {
    user,
    userType,
    loading,
    isAuthenticated,
    initialized,
    login,
    logout,
    forceLogout,
    isClient: userType === 'client',
    isSuperAdmin: userType === 'super_admin',
    isStaff: userType === 'staff',
  }

  // Don't render children until initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">API: {API_CONFIG.BASE_URL}</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}