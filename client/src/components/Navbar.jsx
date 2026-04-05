import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Menu, X, LogOut, LayoutDashboard, PlusSquare } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/60 backdrop-blur-xl"
      style={{ background: 'rgba(8,10,15,0.85)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-lg tracking-tight text-white"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              MAS<span className="text-blue-500">certify</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/verify"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/verify') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              Verify Certificate
            </Link>
            <Link to="/discover"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/discover') || location.pathname.startsWith('/discover/') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              Discover
            </Link>
            {user ? (
              <>
                <Link to="/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive('/dashboard') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                {user.role === 'organization' && (
                  <Link to="/dashboard/create"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive('/dashboard/create') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <PlusSquare size={15} /> Issue Certificate
                  </Link>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/organizations"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive('/admin/organizations') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <Shield size={15} /> Orgs
                    </Link>
                    <Link to="/admin/course-listings"
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname.startsWith('/admin/course') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      Courses
                    </Link>
                    <Link to="/admin/audit-logs"
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive('/admin/audit-logs') ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      Audit
                    </Link>
                  </>
                )}
                <div className="w-px h-5 bg-gray-700 mx-2" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{user.role}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  Sign In
                </Link>
                <Link to="/register/user"
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold ml-1 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 animate-fade-in"
          style={{ background: 'rgba(8,10,15,0.97)' }}>
          <div className="px-4 py-3 space-y-1">
            <Link to="/verify" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Verify Certificate
            </Link>
            <Link to="/discover" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Discover
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  Dashboard
                </Link>
                {user.role === 'organization' && (
                  <Link to="/dashboard/create" onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    Issue Certificate
                  </Link>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/organizations" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      Admin · Orgs
                    </Link>
                    <Link to="/admin/course-listings" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      Admin · Courses
                    </Link>
                    <Link to="/admin/audit-logs" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                      Admin · Audit
                    </Link>
                  </>
                )}
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  Sign In
                </Link>
                <Link to="/register/organization" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-blue-400 hover:bg-blue-500/10 transition-all">
                  Register Organization
                </Link>
                <Link to="/register/user" onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 transition-all">
                  Register as User
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
