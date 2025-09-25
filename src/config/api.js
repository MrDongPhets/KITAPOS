// src/config/api.js - API Configuration with your setup
const getApiUrl = () => {
  // For client-side (browser)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // For server-side
  return process.env.NEXT_PUBLIC_API_URL
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

// Log configuration (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    ENVIRONMENT: process.env.NODE_ENV || 'development'
  })
}

export default API_CONFIG