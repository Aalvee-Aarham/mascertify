import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Eye, EyeOff, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterUser() {
  const { registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await registerUser(form)
      toast.success(`Welcome, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617] selection:bg-blue-500/30">
      {/* Left side: Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[#020617]">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[100px]" />
        
        <Link to="/" className="flex items-center gap-2.5 relative z-10 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>MAScertify</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-bold text-white leading-[1.1] mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
            Start your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">verified</span> career journey.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Join thousands of professionals showcasing their verified skills to the world's leading companies.
          </p>

          <div className="space-y-4">
            {[
              "Personalized digital credential portfolio",
              "One-click verification for employers",
              "Discover courses from top-tier institutions",
              "Permanent, immutable record of achievement"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 pt-12 border-t border-gray-800/50">
          <p className="text-sm text-gray-500">
            Register as an <Link to="/register/organization" className="text-white font-semibold hover:text-blue-400 transition-colors underline underline-offset-4">Organization</Link> instead
          </p>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white/[0.02] lg:bg-transparent">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="lg:hidden mb-10 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>MAScertify</span>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Join a world of verified expertise</h1>
            <p className="text-gray-500">Create your learner account today.</p>
          </div>

          <div className="glass rounded-3xl p-8 border border-gray-800/50 shadow-2xl shadow-blue-500/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    className="input-dark w-full pl-12 pr-5 py-3.5 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 border-gray-800 hover:border-gray-700 transition-all font-sans"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email address</label>
                <input
                  type="email"
                  className="input-dark w-full px-5 py-3.5 rounded-2xl text-sm focus:ring-2 ring-blue-500/20 border-gray-800 hover:border-gray-700 transition-all font-sans"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-dark w-full px-5 py-3.5 rounded-2xl text-sm pr-12 focus:ring-2 ring-blue-500/20 border-gray-800 hover:border-gray-700 transition-all font-sans"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                  />
                  <button type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                ) : (
                  <>Get Started <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
              <p className="text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Sign in</Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-10">
            By registering, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
