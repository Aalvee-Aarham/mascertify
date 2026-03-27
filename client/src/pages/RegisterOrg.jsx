import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const orgTypes = [
  { value: 'university', label: 'University / College' },
  { value: 'school', label: 'School' },
  { value: 'training', label: 'Training Center' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'event', label: 'Event Organizer' },
  { value: 'other', label: 'Other' },
]

export default function RegisterOrg() {
  const { registerOrg } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    orgName: '', orgType: '', website: '', description: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const nextStep = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password)
      return toast.error('Please complete all fields')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.orgName || !form.orgType) return toast.error('Organization name and type required')
    setLoading(true)
    try {
      await registerOrg(form)
      toast.success('Organization registered successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 noise-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Register Organization</h1>
          <p className="text-gray-500 text-sm mt-1">Start issuing verifiable certificates</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= s ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                {s}
              </div>
              {s < 2 && <div className={`w-16 h-px transition-all ${step > s ? 'bg-blue-500' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 border border-gray-800">
          {step === 1 ? (
            <form onSubmit={nextStep} className="space-y-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Account Details</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Your full name</label>
                <input type="text" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                <input type="email" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="admin@organization.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input-dark w-full px-4 py-3 rounded-xl text-sm pr-12"
                    placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                Continue <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Organization Details</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Organization name</label>
                <input type="text" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="Tech Academy Bangladesh" value={form.orgName} onChange={e => set('orgName', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Organization type</label>
                <select className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  value={form.orgType} onChange={e => set('orgType', e.target.value)} required>
                  <option value="">Select type...</option>
                  {orgTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Website <span className="text-gray-600">(optional)</span></label>
                <input type="url" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                  placeholder="https://yourorg.com" value={form.website} onChange={e => set('website', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
                <textarea className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" rows={3}
                  placeholder="Brief description of your organization..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-400 border border-gray-700 hover:border-gray-500 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="btn-primary flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                    : <>Register <ArrowRight size={16} /></>
                  }
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
