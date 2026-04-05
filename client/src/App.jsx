import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import RegisterOrg from './pages/RegisterOrg'
import RegisterUser from './pages/RegisterUser'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import CreateCertificate from './pages/CreateCertificate'
import Verify from './pages/Verify'
import CertificateDetail from './pages/CertificateDetail'
import AdminOrganizations from './pages/AdminOrganizations'
import AdminCourseListings from './pages/AdminCourseListings'
import AdminAuditLogs from './pages/AdminAuditLogs'
import DashboardAnalytics from './pages/DashboardAnalytics'
import ImportCertificates from './pages/ImportCertificates'
import CollectionsPage from './pages/CollectionsPage'
import AuditLogPage from './pages/AuditLogPage'
import OrgPublishedCourses from './pages/OrgPublishedCourses'
import Discover from './pages/Discover'
import DiscoverDetail from './pages/DiscoverDetail'

const ProtectedRoute = ({ children, orgOnly = false }) => {
  const { user, loading, networkError } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user && networkError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-medium">Connecting to server — this may take a moment…</p>
      <p className="text-gray-600 text-xs">Render free tier may be waking up</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (orgOnly && user.role !== 'organization' && user.role !== 'admin')
    return <Navigate to="/" replace />
  return children
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/register/user', '/register/organization'].includes(location.pathname)

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register/organization" element={user ? <Navigate to="/dashboard" replace /> : <RegisterOrg />} />
        <Route path="/register/user" element={user ? <Navigate to="/dashboard" replace /> : <RegisterUser />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/:slug" element={<DiscoverDetail />} />
        <Route path="/certificate/:id" element={<CertificateDetail />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'user' ? <UserDashboard /> : <Dashboard />}
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/create" element={
          <ProtectedRoute orgOnly>
            <CreateCertificate />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute orgOnly>
            <DashboardAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/import" element={
          <ProtectedRoute orgOnly>
            <ImportCertificates />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/collections" element={
          <ProtectedRoute orgOnly>
            <CollectionsPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/audit" element={
          <ProtectedRoute orgOnly>
            <AuditLogPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/listings" element={
          <ProtectedRoute orgOnly>
            <OrgPublishedCourses />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/organizations" element={
          <AdminRoute>
            <AdminOrganizations />
          </AdminRoute>
        } />
        <Route path="/admin/course-listings" element={
          <AdminRoute>
            <AdminCourseListings />
          </AdminRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <AdminRoute>
            <AdminAuditLogs />
          </AdminRoute>
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
