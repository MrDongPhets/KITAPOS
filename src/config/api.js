// src/config/api.js - Fixed for Vercel production
const getApiUrl = () => {
  // IMPORTANT: In Next.js, environment variables are replaced at build time
  // Make sure NEXT_PUBLIC_API_URL is set in Vercel environment variables
  
  // First, check if we have the environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('🔗 Using API URL from environment:', process.env.NEXT_PUBLIC_API_URL)
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // For development fallback
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Using localhost for development')
    return 'http://localhost:3001'
  }
  
  // Production fallback - this should ideally never be reached if env var is set
  console.log('⚠️ No API URL env var found, using production fallback')
  return 'https://kitapos-backend.vercel.app'
}

const API_CONFIG = {
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

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Configuration:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    COMPUTED_BASE_URL: API_CONFIG.BASE_URL
  })
}

export default API_CONFIG