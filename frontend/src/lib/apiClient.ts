import axios, { type InternalAxiosRequestConfig } from 'axios'

// Create primary axios instance for API communication
export const apiClient = axios.create({
  baseURL: (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Necessary for HttpOnly cookies (refresh token)
})

// In-memory access token storage (best practice for SPA security)
let inMemoryAccessToken: string | null = null

export const setClientAccessToken = (token: string | null) => {
  inMemoryAccessToken = token
}

export const getClientAccessToken = () => inMemoryAccessToken

// Queue and lock state for single-flight token refresh
let isRefreshing = false
let refreshSubscribers: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

// Check if request is to a public auth endpoint that shouldn't trigger token refresh on 401
const isAuthEndpoint = (url?: string) => {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/verify-otp') ||
    url.includes('/auth/verify-email') ||
    url.includes('/auth/resend-otp') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  )
}

// Request Interceptor: Attach access token as Bearer token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Single-flight refresh token queue with strict loop prevention
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Do NOT trigger refresh interceptor if the endpoint was an auth action (login, register, refresh itself)
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized errors (expired access token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in flight, queue this request to wait for the same refresh result
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(apiClient(originalRequest))
            },
            reject: (err: unknown) => {
              reject(err)
            },
          })
        })
      }

      // Mark original request as retried to guarantee no infinite loop
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Direct call without Authorization header to obtain refreshed access token from HttpOnly cookie
        const refreshUrl = `${apiClient.defaults.baseURL}/auth/refresh`
        const refreshResponse = await axios.post<{ accessToken: string }>(
          refreshUrl,
          {},
          { withCredentials: true }
        )

        const newAccessToken = refreshResponse.data.accessToken
        setClientAccessToken(newAccessToken)

        // Dispatch custom event to sync with AuthContext
        window.dispatchEvent(
          new CustomEvent('auth:token-refreshed', { detail: { accessToken: newAccessToken } })
        )

        // Resolve all waiting queued requests with the new access token
        refreshSubscribers.forEach((subscriber) => subscriber.resolve(newAccessToken))
        refreshSubscribers = []
        isRefreshing = false

        // Retry the original failed request with the new access token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Token refresh failed -> reject all pending requests and trigger session logout
        refreshSubscribers.forEach((subscriber) => subscriber.reject(refreshError))
        refreshSubscribers = []
        isRefreshing = false

        setClientAccessToken(null)
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
