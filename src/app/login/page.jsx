// src/app/login/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn, Building2, Wifi, WifiOff } from "lucide-react"
import authService from "@/services/authService"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [showDemoHint, setShowDemoHint] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  // Monitor online/offline status
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await authService.checkConnection()
      setIsOnline(connected)
    }

    // Initial check
    checkConnection()

    // Set up listeners
    const handleOnline = () => {
      setIsOnline(true)
      checkConnection()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate inputs
      if (!email || !password) {
        setError("Please enter both email and password")
        setLoading(false)
        return
      }

      // Attempt login
      const result = await authService.login(email, password)

      if (result.success) {
        // Show success message if offline
        if (result.offline) {
          console.log("📴 Logged in offline mode")
        }

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        // Show error message
        setError(result.error || "Login failed. Please try again.")
        
        // Show demo hint if login fails
        if (!showDemoHint && result.code === 'INVALID_CREDENTIALS') {
          setShowDemoHint(true)
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Quick fill for demo accounts
  const fillDemoAccount = (role) => {
    const accounts = {
      admin: { email: "admin@techcorp.com", password: "password123" },
      manager: { email: "manager@techcorp.com", password: "password123" },
      cashier: { email: "cashier@techcorp.com", password: "password123" }
    }
    
    const account = accounts[role]
    if (account) {
      setEmail(account.email)
      setPassword(account.password)
      setError("")
      setShowDemoHint(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your POS System account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full"
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full"
                autoComplete="current-password"
                required
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Offline Mode Notice */}
            {!isOnline && (
              <Alert className="bg-orange-50 border-orange-200">
                <AlertDescription className="text-orange-800">
                  You're currently offline. You can still login if you've signed in before on this device.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gray-900 hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>

            {/* Demo Accounts Hint */}
            {showDemoHint && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Try a demo account:
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin')}
                    className="text-xs text-blue-700 hover:text-blue-900 hover:underline block"
                  >
                    Admin: admin@techcorp.com
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('manager')}
                    className="text-xs text-blue-700 hover:text-blue-900 hover:underline block"
                  >
                    Manager: manager@techcorp.com
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('cashier')}
                    className="text-xs text-blue-700 hover:text-blue-900 hover:underline block"
                  >
                    Cashier: cashier@techcorp.com
                  </button>
                  <p className="text-xs text-blue-600 mt-1">
                    Password for all: password123
                  </p>
                </div>
              </div>
            )}
                        {/* Register Link */}
              <div className="text-center text-sm mt-4">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create account
                </Link>
              </div>

          {/* Quick Access for Development */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center mb-3">
              Quick access for testing:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoAccount('admin')}
                disabled={loading}
                className="text-xs"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoAccount('manager')}
                disabled={loading}
                className="text-xs"
              >
                Manager
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoAccount('cashier')}
                disabled={loading}
                className="text-xs"
              >
                Cashier
              </Button>
            </div>
          </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          POS System v1.0.0 | © 2025 TechCorp
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {isOnline ? 'Connected to cloud' : 'Working offline'}
        </p>
      </div>
    </div>
  )
}
