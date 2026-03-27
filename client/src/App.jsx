import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import RegisterOrg from './pages/RegisterOrg'
import RegisterUser from './pages/RegisterUser'
import Dashboard from './pages/Dashboard'
import CreateCertificate from './pages/CreateCertificate'
import Verify from './pages/Verify'
import CertificateDetail from './pages/CertificateDetail'

const ProtectedRoute = ({ children, orgOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (orgOnly && user.role !== 'organization' && user.role !== 'admin')
    return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register/organization" element={user ? <Navigate to="/dashboard" replace /> : <RegisterOrg />} />
        <Route path="/register/user" element={user ? <Navigate to="/dashboard" replace /> : <RegisterUser />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/certificate/:id" element={<CertificateDetail />} />
        <Route path="/dashboard" element={
          <ProtectedRoute orgOnly>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/create" element={
          <ProtectedRoute orgOnly>
            <CreateCertificate />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f9fafb',
              border: '1px solid #1f2937',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#3b82f6', secondary: '#111827' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
