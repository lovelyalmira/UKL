import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

// Membaca Base URL dari .env.local
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'https://be-toast-production.up.railway.app'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interseptor Request: Otomatis menempelkan token ke setiap tembakan API
api.interceptors.request.use(
  (config) => {
    // Ambil token secara dinamis tepat saat request mau dikirim
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interseptor Response: Jinakkan penendang otomatis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🚀 BYPASS TOTAL UNTUK DEVELOPMENT:
    // Kita matikan window.location.href = '/admin/login' agar jika backend 401/404,
    // halaman tidak akan pernah mental atau refresh sendiri ke halaman login!
    console.warn('Axios Interceptor mendeteksi eror API:', error.response?.status)
    
    return Promise.reject(error)
  }
)

// Fungsi pembungkus apiRequest yang dipakai di dashboard kamu
export const apiRequest = async <T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<T> => {
  const { data } = await api<T>(endpoint, options)
  return data
}