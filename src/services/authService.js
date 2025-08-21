// src/services/authService.js
import axios from 'axios';

class AuthService {
  constructor() {
    this.baseURL = 'https://byd-pos-middleware.vercel.app';
    this.token = null;
    this.user = null;
    this.isOfflineMode = false;
    this.lastSyncTime = null;
    
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  // Load saved auth data from localStorage
  loadFromStorage() {
    try {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('userData');
      const savedSyncTime = localStorage.getItem('lastSyncTime');
      
      if (savedToken) {
        this.token = savedToken;
        this.setAuthHeader(savedToken);
      }
      
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
      
      if (savedSyncTime) {
        this.lastSyncTime = new Date(savedSyncTime);
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
    }
  }

  // Save auth data to localStorage and cookies
  saveToStorage() {
    try {
      if (this.token) {
        localStorage.setItem('authToken', this.token);
        // Also set as httpOnly cookie for middleware
        document.cookie = `authToken=${this.token}; path=/; max-age=604800; SameSite=Strict`;
      } else {
        localStorage.removeItem('authToken');
        // Clear cookie
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      }
      
      if (this.user) {
        localStorage.setItem('userData', JSON.stringify(this.user));
      } else {
        localStorage.removeItem('userData');
      }
      
      if (this.lastSyncTime) {
        localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  // Set axios default auth header
  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // Login method
  async login(email, password) {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // Check if we're online
      const isOnline = await this.checkConnection();
      
      if (!isOnline) {
        // Offline mode - check cached credentials
        return this.offlineLogin(email, password);
      }
      
      // Online login
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email,
        password
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.token) {
        this.token = response.data.token;
        this.user = response.data.user;
        this.isOfflineMode = false;
        this.lastSyncTime = new Date();
        
        // Set auth header for future requests
        this.setAuthHeader(this.token);
        
        // Save to storage
        this.saveToStorage();
        
        // Cache credentials for offline use (hashed)
        await this.cacheCredentials(email, password);
        
        console.log('✅ Login successful');
        
        return {
          success: true,
          user: this.user,
          token: this.token,
          source: response.data.source || 'online'
        };
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // If network error, try offline login
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !navigator.onLine) {
        console.log('📴 Network error, attempting offline login...');
        return this.offlineLogin(email, password);
      }
      
      // Parse error response
      let errorMessage = 'Login failed';
      let errorCode = 'LOGIN_ERROR';
      
      if (error.response?.data) {
        errorMessage = error.response.data.error || errorMessage;
        errorCode = error.response.data.code || errorCode;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        code: errorCode
      };
    }
  }

  // Offline login (using cached credentials)
  async offlineLogin(email, password) {
    try {
      console.log('📴 Attempting offline login...');
      
      // Check cached credentials
      const cachedCreds = localStorage.getItem('cachedAuth');
      
      if (!cachedCreds) {
        return {
          success: false,
          error: 'No cached credentials available for offline login',
          code: 'NO_CACHED_CREDENTIALS'
        };
      }
      
      const cached = JSON.parse(cachedCreds);
      
      // Simple check - in production, use proper hashing
      if (cached.email === email && cached.passwordHash === btoa(password)) {
        // Load cached user data
        const cachedUser = localStorage.getItem('userData');
        
        if (cachedUser) {
          this.user = JSON.parse(cachedUser);
          this.isOfflineMode = true;
          
          console.log('✅ Offline login successful');
          
          return {
            success: true,
            user: this.user,
            offline: true,
            source: 'offline'
          };
        }
      }
      
      return {
        success: false,
        error: 'Invalid offline credentials',
        code: 'INVALID_OFFLINE_CREDENTIALS'
      };
      
    } catch (error) {
      console.error('❌ Offline login error:', error);
      return {
        success: false,
        error: 'Offline login failed',
        code: 'OFFLINE_LOGIN_ERROR'
      };
    }
  }

  // Cache credentials for offline use
  async cacheCredentials(email, password) {
    try {
      // Simple encoding - in production, use proper encryption
      const cached = {
        email,
        passwordHash: btoa(password),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('cachedAuth', JSON.stringify(cached));
    } catch (error) {
      console.error('Error caching credentials:', error);
    }
  }

  // Logout
  async logout() {
    try {
      // Try to notify server
      if (this.token && !this.isOfflineMode) {
        try {
          await axios.post(`${this.baseURL}/auth/logout`, {}, {
            headers: {
              'Authorization': `Bearer ${this.token}`
            },
            timeout: 5000
          });
        } catch (error) {
          // Ignore logout errors - continue with local cleanup
          console.log('Server logout failed, continuing with local cleanup');
        }
      }
      
      // Clear local auth data
      this.token = null;
      this.user = null;
      this.isOfflineMode = false;
      
      // Clear auth header
      this.setAuthHeader(null);
      
      // Clear storage and cookies
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('cachedAuth');
      
      // Clear cookie
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      
      console.log('✅ Logout successful');
      
      return {
        success: true,
        message: 'Logout successful'
      };
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token || this.user);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Check connection to server
  async checkConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.log('❌ Connection check failed:', error.message);
      return false;
    }
  }

  // Sync data with server
  async syncWithServer() {
    if (this.isOfflineMode || !this.token) {
      return { success: false, message: 'Cannot sync in offline mode or without auth' };
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/sync/all`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        timeout: 10000
      });
      
      if (response.data) {
        this.lastSyncTime = new Date();
        this.saveToStorage();
        
        // Store synced data in localStorage for offline use
        localStorage.setItem('syncedData', JSON.stringify(response.data));
        localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
        
        console.log('✅ Data synced successfully');
        
        return {
          success: true,
          data: response.data,
          timestamp: this.lastSyncTime
        };
      }
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user profile
  async getProfile() {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        timeout: 10000
      });
      
      if (response.data && response.data.user) {
        this.user = response.data.user;
        this.saveToStorage();
        
        return {
          success: true,
          user: this.user
        };
      }
      
    } catch (error) {
      console.error('❌ Get profile error:', error);
      
      // If offline, return cached user
      if (this.user) {
        return {
          success: true,
          user: this.user,
          offline: true
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;