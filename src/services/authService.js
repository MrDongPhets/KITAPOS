// src/services/authService.js - Updated to use API_CONFIG
import API_CONFIG from '@/config/api'

class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.token = null
    this.user = null
    this.userType = null
    this.company = null
    this.subscription = null
    
    // Token expiration handling
    this.tokenCheckInterval = null
    this.onTokenExpired = null
    
    if (typeof window !== 'undefined') {
      console.log('🔧 AuthService initialized with API:', this.baseURL)
      this.loadFromStorage()
      this.startTokenValidation()
    }
  }

  // Set callback for token expiration
  setTokenExpirationCallback(callback) {
    this.onTokenExpired = callback
  }

  // Load saved auth data from localStorage
  loadFromStorage() {
    try {
      const savedToken = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('userData')
      const savedUserType = localStorage.getItem('userType')
      const savedCompany = localStorage.getItem('companyData')
      const savedSubscription = localStorage.getItem('subscriptionData')
      
      if (savedToken) this.token = savedToken
      if (savedUser) this.user = JSON.parse(savedUser)
      if (savedUserType) this.userType = savedUserType
      if (savedCompany) this.company = JSON.parse(savedCompany)
      if (savedSubscription) this.subscription = JSON.parse(savedSubscription)
    } catch (error) {
      console.error('Error loading auth data from storage:', error)
      this.clearSession()
    }
  }

  // Save auth data to localStorage
  saveToStorage() {
    try {
      if (this.token) {
        localStorage.setItem('authToken', this.token)
      } else {
        localStorage.removeItem('authToken')
      }
      
      if (this.user) {
        localStorage.setItem('userData', JSON.stringify(this.user))
      } else {
        localStorage.removeItem('userData')
      }

      if (this.userType) {
        localStorage.setItem('userType', this.userType)
      } else {
        localStorage.removeItem('userType')
      }

      if (this.company) {
        localStorage.setItem('companyData', JSON.stringify(this.company))
      } else {
        localStorage.removeItem('companyData')
      }

      if (this.subscription) {
        localStorage.setItem('subscriptionData', JSON.stringify(this.subscription))
      } else {
        localStorage.removeItem('subscriptionData')
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error)
    }
  }

  // Start token validation interval
  startTokenValidation() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval)
    }

    // Check token every 5 minutes
    this.tokenCheckInterval = setInterval(() => {
      if (this.token) {
        this.validateToken()
      }
    }, 5 * 60 * 1000)
  }

  // Stop token validation
  stopTokenValidation() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval)
      this.tokenCheckInterval = null
    }
  }

  // Validate current token
  async validateToken() {
    if (!this.token) return false

    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.VERIFY}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        return true
      } else {
        console.log('Token validation failed:', data.error)
        this.handleTokenExpiration()
        return false
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  // Handle token expiration
  handleTokenExpiration() {
    console.log('🚨 Token expired, clearing session and redirecting to login')
    
    this.clearSession()
    
    // Call the expiration callback if set
    if (this.onTokenExpired) {
      this.onTokenExpired()
    } else {
      // Default behavior - redirect to login
      window.location.href = '/login'
    }
  }

  // Clear session data
  clearSession() {
    this.token = null
    this.user = null
    this.userType = null
    this.company = null
    this.subscription = null
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userType')
    localStorage.removeItem('companyData')
    localStorage.removeItem('subscriptionData')
    
    this.stopTokenValidation()
  }

  // Enhanced API request method with automatic token handling
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      console.log('🌐 API Request:', url)
      
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Handle token expiration specifically
      if (response.status === 401 || response.status === 403) {
        const data = await response.json()
        if (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN') {
          console.log('🚨 Token expired during API call')
          this.handleTokenExpiration()
          throw new Error('Session expired')
        }
      }

      return response
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Business user login
  async loginClient(email, password) {
    try {
      console.log('🔐 Client login attempt for:', email)
      
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok && data.token) {
        this.token = data.token
        this.user = data.user
        this.userType = 'client'
        this.company = data.company
        this.subscription = data.subscription
        
        this.saveToStorage()
        this.startTokenValidation()
        
        console.log('✅ Client login successful')
        
        return {
          success: true,
          user: this.user,
          company: this.company,
          subscription: this.subscription,
          userType: 'client'
        }
      } else {
        throw new Error(data.error || 'Login failed')
      }
      
    } catch (error) {
      console.error('❌ Client login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  // Super admin login
  async loginSuperAdmin(email, password) {
    try {
      console.log('🔐 Super admin login attempt for:', email)
      
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok && data.token) {
        this.token = data.token
        this.user = data.user
        this.userType = 'super_admin'
        this.company = null
        this.subscription = null
        
        this.saveToStorage()
        this.startTokenValidation()
        
        console.log('✅ Super admin login successful')
        
        return {
          success: true,
          user: this.user,
          userType: 'super_admin'
        }
      } else {
        throw new Error(data.error || 'Login failed')
      }
      
    } catch (error) {
      console.error('❌ Super admin login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  // Register company
  async registerCompany(companyData, userData, subscriptionPlan = 'trial') {
    try {
      console.log('🏢 Company registration for:', companyData.name)
      
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company: companyData,
          user: userData,
          subscription: { plan: subscriptionPlan }
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log('✅ Company registration successful')
        
        return {
          success: true,
          company: data.company,
          user: data.user
        }
      } else {
        throw new Error(data.error || 'Registration failed')
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  // Logout
  async logout() {
    try {
      // Try to notify server
      if (this.token) {
        try {
          await this.apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST'
          })
        } catch (error) {
          console.log('Server logout failed, continuing with local cleanup')
        }
      }
      
      // Clear local data
      this.clearSession()
      
      console.log('✅ Logout successful')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Even if logout fails, clear local session
      this.clearSession()
      return { success: false, error: error.message }
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user)
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }

  // Get user type
  getUserType() {
    return this.userType
  }

  // Get company (for client users)
  getCompany() {
    return this.company
  }

  // Get subscription (for client users)
  getSubscription() {
    return this.subscription
  }

  // Get auth token
  getToken() {
    return this.token
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService