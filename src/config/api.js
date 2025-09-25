// src/config/api.js - Fixed with proper fallback
const getApiUrl = () => {
  // Get the environment variable
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL
  
  // If environment variable exists, use it
  if (envApiUrl) {
    console.log('🔗 Using API URL from environment:', envApiUrl)
    return envApiUrl
  }
  
  // Fallback logic based on environment
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  
  // If in development or on localhost, use local API
  if (isDevelopment || isLocalhost) {
    console.log('🔗 Fallback to localhost for development')
    return 'http://localhost:3001'
  }
  
  // Production fallback
  console.log('🔗 Using production fallback URL')
  return 'https://kitapos-backend.vercel.app'
}

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SUPER_ADMIN_LOGIN: '/auth/super-admin/login',
      REGISTER: '/auth/register-company',
      VERIFY: '/auth/verify',
      LOGOUT: '/auth/logout'
    },
    ADMIN: {
      COMPANIES: '/admin/companies',
      USERS_STATS: '/admin/stats/users',
      SUBSCRIPTION_STATS: '/admin/stats/subscriptions'
    },
    HEALTH: '/health'
  }
}

// Enhanced logging for debugging
console.log('🔗 API Configuration Debug:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
  NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  COMPUTED_BASE_URL: API_CONFIG.BASE_URL,
  IS_BROWSER: typeof window !== 'undefined',
  HOSTNAME: typeof window !== 'undefined' ? window.location.hostname : 'server'
})

// Validate configuration
if (!API_CONFIG.BASE_URL) {
  console.error('❌ API_CONFIG.BASE_URL is undefined! Check your environment variables.')
} else {
  console.log('✅ API Configuration loaded successfully')
  console.log('📡 API Base URL:', API_CONFIG.BASE_URL)
}

export default API_CONFIG