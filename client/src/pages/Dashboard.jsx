import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Award, User, Settings, Plus, Search, MoreVertical, Ban, Trash2, Download, QrCode, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const tabs = [
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const StatusBadge = ({ status }) => {
  const map = {
    active:  { color: 'text-green-400 bg-green-400/10 border-green-400/20', label: 'Active', icon: CheckCircle },
    revoked: { color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Revoked', icon: XCircle },
    expired: { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', label: 'Expired', icon: Clock },
  }
  const cfg = map[status] || map.active
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <cfg.icon size={11} />
      {cfg.label}
    </span>
  )
}

function CertificatesTab({ org }) {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    fetchCerts()
  }, [])

  const fetchCerts = async () => {
    try {
      const res = await axios.get('/api/certificates')
      setCerts(res.data.certificates)
    } catch { toast.error('Failed to load certificates') }
    finally { setLoading(false) }
  }

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this certificate? This cannot be undone.')) return
    try {
      await axios.put(`/api/certificates/${id}/revoke`)
      setCerts(c => c.map(cert => cert._id === id ? { ...cert, status: 'revoked' } : cert))
      toast.success('Certificate revoked')
    } catch { toast.error('Failed to revoke') }
    setOpenMenu(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this certificate?')) return
    try {
      await axios.delete(`/api/certificates/${id}`)
      setCerts(c => c.filter(cert => cert._id !== id))
      toast.success('Certificate deleted')
    } catch { toast.error('Failed to delete') }
    setOpenMenu(null)
  }

  const filtered = certs.filter(c =>
    c.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Issued Certificates</h2>
          <p className="text-sm text-gray-500 mt-0.5">{certs.length} total · {certs.filter(c => c.status === 'active').length} active</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input-dark pl-9 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-56"
              placeholder="Search certificates..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Link to="/dashboard/create"
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap">
            <Plus size={15} /> Issue New
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-gray-800">
          <Award size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">{search ? 'No certificates match your search' : 'No certificates issued yet'}</p>
          {!search && <Link to="/dashboard/create" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">Issue your first certificate →</Link>}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Recipient</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Certificate ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Issued</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filtered.map(cert => (
                  <tr key={cert._id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{cert.recipientName}</p>
                      {cert.recipientEmail && <p className="text-xs text-gray-500 mt-0.5">{cert.recipientEmail}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-300 max-w-[180px] truncate">{cert.courseName}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-blue-400">{cert.certificateId}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">
                        {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={cert.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/certificate/${cert.certificateId}`} target="_blank"
                          className="p-1.5 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="View">
                          <ExternalLink size={14} />
                        </Link>
                        <div className="relative">
                          <button onClick={() => setOpenMenu(openMenu === cert._id ? null : cert._id)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
                            <MoreVertical size={14} />
                          </button>
                          {openMenu === cert._id && (
                            <div className="absolute right-0 top-full mt-1 w-44 glass rounded-xl border border-gray-700 shadow-xl z-20 overflow-hidden animate-fade-in">
                              {cert.status === 'active' && (
                                <button onClick={() => handleRevoke(cert._id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors text-left">
                                  <Ban size={14} /> Revoke
                                </button>
                              )}
                              <button onClick={() => handleDelete(cert._id)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileTab({ user, organization, updateProfile }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    orgName: organization?.orgName || '',
    orgType: organization?.orgType || '',
    website: organization?.website || '',
    description: organization?.description || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>Organization Profile</h2>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Account</p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Your name</label>
            <input className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input className="input-dark w-full px-4 py-3 rounded-xl text-sm opacity-60 cursor-not-allowed"
              value={user?.email} disabled />
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>
        </div>
        {organization && (
          <div className="glass rounded-2xl p-6 border border-gray-800 space-y-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Organization</p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Organization name</label>
              <input className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                value={form.orgName} onChange={e => set('orgName', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Website</label>
              <input type="url" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                placeholder="https://yourorg.com" value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" rows={3}
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        )}
        <button type="submit" disabled={saving}
          className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50">
          {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Settings</h2>
      {[
        { title: 'Email Notifications', desc: 'Receive an email when a certificate is issued', enabled: true },
        { title: 'Certificate Expiry Alerts', desc: 'Get notified before certificates expire', enabled: false },
        { title: 'Public Organization Page', desc: 'Allow anyone to see your organization profile', enabled: true },
      ].map((s, i) => (
        <div key={i} className="glass rounded-2xl p-5 border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{s.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${s.enabled ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => toast('Settings persistence coming soon', { icon: '⚙️' })}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${s.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </div>
      ))}
      <div className="glass rounded-2xl p-5 border border-red-500/20">
        <p className="text-sm font-medium text-red-400 mb-1">Danger Zone</p>
        <p className="text-xs text-gray-500 mb-4">Permanently delete your organization and all certificates.</p>
        <button className="px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
          onClick={() => toast.error('Please contact support to delete your account')}>
          Delete Organization
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, organization, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('certificates')

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {organization?.orgName || user?.name}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 capitalize">{user?.role} · {user?.email}</p>
          </div>
          <Link to="/dashboard/create"
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Issue Certificate
          </Link>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 p-1 rounded-xl border border-gray-800 mb-8 w-fit"
          style={{ background: 'var(--bg-card)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === 'certificates' && <CertificatesTab org={organization} />}
          {activeTab === 'profile' && <ProfileTab user={user} organization={organization} updateProfile={updateProfile} />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}
