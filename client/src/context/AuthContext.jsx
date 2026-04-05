import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// Configure axios base URL for production/development
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = apiBaseUrl

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [organizationApproval, setOrganizationApproval] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('masc_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async () => {
    try {
      const res = await axios.get('/api/auth/me')
      setUser(res.data.user)
      setOrganization(res.data.organization)
      setOrganizationApproval(res.data.organizationApproval ?? null)
    } catch {
      localStorage.removeItem('masc_token')
      delete axios.defaults.headers.common['Authorization']
      setOrganizationApproval(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password })
    const { token, user: userData } = res.data
    localStorage.setItem('masc_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    await fetchMe()
    return userData
  }

  const registerUser = async (data) => {
    const res = await axios.post('/api/auth/register/user', data)
    const { token, user: userData } = res.data
    localStorage.setItem('masc_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    return userData
  }

  const registerOrg = async (data) => {
    const res = await axios.post('/api/auth/register/organization', data)
    const { token, user: userData } = res.data
    localStorage.setItem('masc_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
    await fetchMe()
    return userData
  }

  const logout = () => {
    localStorage.removeItem('masc_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    setOrganization(null)
    setOrganizationApproval(null)
  }

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data)
    setUser(res.data.user)
    if (res.data.organization) setOrganization(res.data.organization)
    setOrganizationApproval(res.data.organizationApproval ?? null)
    return res.data
  }

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      organizationApproval,
      loading,
      login,
      registerUser,
      registerOrg,
      logout,
      updateProfile,
      fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
