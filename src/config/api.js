
// src/config/api.js - Simple fix
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  console.log('🔗 Environment variables:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
  })
  
  if (apiUrl) {
    console.log('✅ Using API URL from environment:', apiUrl)
    return apiUrl
  }
  
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set, falling back to localhost')
  return 'http://localhost:3001'
}

// // src/config/api.js - Enhanced for debugging
// const getApiUrl = () => {
//   // For client-side (browser)
//   if (typeof window !== 'undefined') {
//     return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
//   }
  
//   // For server-side
//   return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
// }

// export const API_CONFIG = {
//   BASE_URL: getApiUrl(),
//   ENDPOINTS: {
//     AUTH: {
//       LOGIN: '/auth/login',
//       SUPER_ADMIN_LOGIN: '/auth/super-admin/login',
//       REGISTER: '/auth/register-company',
//       VERIFY: '/auth/verify',
//       LOGOUT: '/auth/logout'
//     },
//     ADMIN: {
//       COMPANIES: '/admin/companies',
//       USERS_STATS: '/admin/stats/users',
//       SUBSCRIPTION_STATS: '/admin/stats/subscriptions'
//     },
//     HEALTH: '/health'
//   }
// }

// // Enhanced logging for debugging
// console.log('🔗 API Configuration:', {
//   BASE_URL: API_CONFIG.BASE_URL,
//   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
//   NODE_ENV: process.env.NODE_ENV
// })

// export default API_CONFIG