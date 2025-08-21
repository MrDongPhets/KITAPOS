// src/app/register/page.jsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UserPlus, Building2, ArrowLeft, Check, X } from "lucide-react"
import authService from "@/services/authService"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "cashier"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  // Check password strength
  useEffect(() => {
    const password = formData.password
    setPasswordStrength({
      hasMinLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [formData.password])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError("")
  }

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  const validateForm = () => {
    // Check required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    // Validate phone number if provided
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      setError("Please enter a valid phone number")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${authService.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          name: formData.name.trim(),
          role: formData.role,
          phone: formData.phone.trim() || undefined
        })
      })

      const data = await response.json()

      if (response.ok && data.token) {
        // Registration successful
        authService.token = data.token
        authService.user = data.user
        authService.saveToStorage()
        
        setSuccess(true)
        
        // Show success message briefly then redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        // Handle error response
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Unable to connect to server. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    const score = Object.values(passwordStrength).filter(Boolean).length
    if (score <= 2) return "text-red-500"
    if (score <= 3) return "text-orange-500"
    if (score <= 4) return "text-yellow-500"
    return "text-green-500"
  }

  const getPasswordStrengthText = () => {
    const score = Object.values(passwordStrength).filter(Boolean).length
    if (score === 0) return ""
    if (score <= 2) return "Weak"
    if (score <= 3) return "Fair"
    if (score <= 4) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Back to Login Link */}
      <div className="w-full max-w-md mb-4">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Register for a new POS System account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Registration successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-gray-400">(Optional)</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full"
                  autoComplete="tel"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Account Role
                </label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full"
                  autoComplete="new-password"
                  required
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Password Strength:</span>
                      <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasMinLength ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-gray-300" />
                        }
                        <span className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasUpperCase ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-gray-300" />
                        }
                        <span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                          Contains uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasNumber ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-gray-300" />
                        }
                        <span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                          Contains number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full"
                  autoComplete="new-password"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
        <p className="text-xs text-gray-400 mt-2">
          POS System v1.0.0 | © 2025 TechCorp
        </p>
      </div>
    </div>
  )
}