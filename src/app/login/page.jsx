// src/app/login/page.jsx - Add session protection
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, Building2, Wifi, WifiOff, AlertTriangle, User, LogOut } from "lucide-react"
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider"

function LoginForm() {
  const { login, loading: authLoading, isAuthenticated, user, userType, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  
  // Client login state
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  })

  // Check for success message from registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccessMessage(message)
      // Clear the URL parameter
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  // Monitor connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/health')
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async () => {
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (!credentials.email || !credentials.password) {
        setError("Please enter both email and password")
        return
      }

      const result = await login(credentials, 'client')

      if (!result.success) {
        setError(result.error || "Login failed. Please try again.")
      }
      // Success handling is done by AuthProvider (automatic redirect)

    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = () => {
    setCredentials({
      email: "manager@demobakery.com",
      password: "password123"
    })
    setError("")
    setSuccessMessage("")
  }

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Initializing application</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show session warning if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {/* Connection Status */}
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
          <p className="text-gray-600">Welcome back to your business management platform</p>
        </div>

        {/* Session Warning Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Already Logged In</CardTitle>
            <CardDescription>
              You are currently logged in as a {userType === 'super_admin' ? 'System Administrator' : 'Business User'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="bg-orange-50 border-orange-200 mb-6">
              <User className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Current Session:</strong> {user?.name} ({user?.email})
                <br />
                <span className="text-sm">User Type: {userType === 'super_admin' ? 'System Administrator' : 'Business User'}</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button 
                onClick={() => {
                  if (userType === 'super_admin') {
                    window.location.href = '/admin/dashboard'
                  } else {
                    window.location.href = '/client/dashboard'
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <User className="mr-2 h-4 w-4" />
                Go to My Dashboard
              </Button>

              <Button 
                onClick={logout}
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout and Switch Account
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
              <p>To login with a different account, please logout first.</p>
              <p>This prevents unauthorized access to other accounts.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            POS System v2.0.0 | © 2025 TechCorp
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure session active
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
        <p className="text-gray-600">Welcome back to your business management platform</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your business account credentials
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center p-3 bg-blue-50 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Business Account</span>
            </div>
            <p className="text-sm text-blue-700">
              For company owners, managers, and staff members
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Business Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="manager@yourcompany.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !isOnline}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In to Business
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={fillDemoAccount}
                className="text-sm text-blue-600"
                disabled={loading}
              >
                Try Demo Account
              </Button>
            </div>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200 mt-4">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-50 border-red-200 mt-4">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Register Link */}
          <div className="text-center text-sm mt-6 pt-4 border-t">
            <span className="text-gray-600">Don't have a business account? </span>
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Start Free Trial
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          POS System v2.0.0 | © 2025 TechCorp
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isOnline ? 'Connected to server' : 'Offline mode'}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}