// src/app/register/page.jsx - Fixed hardcoded localhost
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, Building2, ArrowLeft, Check, X, Star, Zap, Crown, ChevronRight } from "lucide-react"
import API_CONFIG from "@/config/api" // Import API config

const subscriptionPlans = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    duration: '14 days',
    features: ['1 Store', '5 Users', '100 Products', 'Basic Support'],
    icon: <Star className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800',
    recommended: true
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 29,
    duration: 'per month',
    features: ['3 Stores', '10 Users', '1000 Products', 'Email Support', 'Reports'],
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 79,
    duration: 'per month',
    features: ['Unlimited Stores', 'Unlimited Users', 'Unlimited Products', 'Priority Support', 'Advanced Analytics'],
    icon: <Crown className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800',
    recommended: false
  }
]

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Company Information
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: ""
  })

  // User Information
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  })

  // Selected subscription plan
  const [selectedPlan, setSelectedPlan] = useState('trial')

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  })

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userType = localStorage.getItem('userType')
    
    if (token && userType === 'client') {
      router.push('/client/dashboard')
    }
  }, [router])

  // Check password strength
  useEffect(() => {
    const password = userData.password
    setPasswordStrength({
      hasMinLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password)
    })
  }, [userData.password])

  const handleCompanyInputChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleUserInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateStep1 = () => {
    if (!companyData.name || !companyData.email) {
      setError("Company name and email are required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(companyData.email)) {
      setError("Please enter a valid company email address")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!userData.name || !userData.email || !userData.password) {
      setError("Name, email, and password are required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError("")
    }
  }

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return

    setError("")
    setLoading(true)

    try {
      // FIXED: Use correct API URL
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyData,
          user: userData,
          subscription: {
            plan: selectedPlan,
            planDetails: subscriptionPlans.find(p => p.id === selectedPlan)
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    const score = Object.values(passwordStrength).filter(Boolean).length
    if (score <= 1) return "text-red-500"
    if (score <= 2) return "text-orange-500"
    if (score <= 3) return "text-yellow-500"
    return "text-green-500"
  }

  const getPasswordStrengthText = () => {
    const score = Object.values(passwordStrength).filter(Boolean).length
    if (score === 0) return ""
    if (score <= 1) return "Weak"
    if (score <= 2) return "Fair" 
    if (score <= 3) return "Good"
    return "Strong"
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your business account has been created successfully. You can now sign in to access your dashboard.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to login page...
            </div>
            <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-gray-400" />
            <p className="text-xs text-gray-400 mt-2">API: {API_CONFIG.BASE_URL}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Back Link */}
      <div className="w-full max-w-4xl mb-4">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Start Your Business Account</h1>
        <p className="text-gray-600">Get your POS system up and running in minutes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 ml-4 ${
                currentStep > step ? 'bg-red-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Company Information</h2>
                <p className="text-gray-600">Tell us about your business</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    placeholder="Your Business Name"
                    value={companyData.name}
                    onChange={(e) => handleCompanyInputChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Email *</label>
                  <Input
                    type="email"
                    placeholder="contact@yourbusiness.com"
                    value={companyData.email}
                    onChange={(e) => handleCompanyInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={companyData.phone}
                    onChange={(e) => handleCompanyInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    type="url"
                    placeholder="https://www.yourbusiness.com"
                    value={companyData.website}
                    onChange={(e) => handleCompanyInputChange('website', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Business Address</label>
                  <Input
                    placeholder="123 Main St, City, State, ZIP"
                    value={companyData.address}
                    onChange={(e) => handleCompanyInputChange('address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Administrator Account</h2>
                <p className="text-gray-600">Create your business manager account</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    placeholder="John Doe"
                    value={userData.name}
                    onChange={(e) => handleUserInputChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="you@yourbusiness.com"
                    value={userData.email}
                    onChange={(e) => handleUserInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={userData.phone}
                    onChange={(e) => handleUserInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password *</label>
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    value={userData.password}
                    onChange={(e) => handleUserInputChange('password', e.target.value)}
                  />
                  
                  {/* Password Strength Indicator */}
                  {userData.password && (
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

                <div className="space-y-2 md:col-start-2">
                  <label className="text-sm font-medium">Confirm Password *</label>
                  <Input
                    type="password"
                    placeholder="Re-enter your password"
                    value={userData.confirmPassword}
                    onChange={(e) => handleUserInputChange('confirmPassword', e.target.value)}
                  />
                  {userData.confirmPassword && userData.password !== userData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Choose Your Plan</h2>
                <p className="text-gray-600">Select a subscription plan that fits your business</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-6 border rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.recommended && (
                      <Badge className="absolute -top-2 left-4 bg-red-500 text-white">
                        Recommended
                      </Badge>
                    )}
                    
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${plan.color}`}>
                        {plan.icon}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-gray-500 ml-1">/{plan.duration}</span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {selectedPlan === plan.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-50 border-red-200 mt-6">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-red-500 hover:bg-red-600"
                disabled={loading}
              >
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-red-500 hover:bg-red-600"
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
                    Create Business Account
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
        <p className="text-xs text-gray-400 mt-2">
          POS System v2.0.0 | © 2025 TechCorp | API: {API_CONFIG.BASE_URL}
        </p>
      </div>
    </div>
  )
}