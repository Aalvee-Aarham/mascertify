import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Award, User as UserIcon, Settings, Search, CheckCircle, Clock, ExternalLink, ShieldCheck, Mail, Briefcase, Share2, Download, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import ImageUpload from '../components/ImageUpload'

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass rounded-2xl p-5 border border-gray-800/50 flex items-center gap-4 hover:border-gray-700 transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
    </div>
  </div>
)

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
      ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <Icon size={18} />
    {label}
  </button>
)

export default function UserDashboard() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('credentials')
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    profilePicture: user?.profilePicture || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        headline: user.headline || '',
        profilePicture: user.profilePicture || '',
      })
    }
  }, [user])

  useEffect(() => {
    fetchCerts()
  }, [])

  const fetchCerts = async () => {
    try {
      const res = await axios.get('/api/certificates/me')
      setCerts(res.data.certificates || [])
    } catch {
      toast.error('Failed to load your credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e, override = null) => {
    if (e) e.preventDefault()
    const dataToSave = override || profileForm
    setSavingProfile(true)
    try {
      await updateProfile(dataToSave)
      toast.success('Professional profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const filteredCerts = certs.filter(c => 
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.orgName.toLowerCase().includes(search.toLowerCase())
  )

  const activeCerts = certs.filter(c => c.status === 'active').length

  return (
    <div className="min-h-screen pt-20 pb-20 bg-[#020617] selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Backdrop Area */}
        <div className="relative h-48 rounded-3xl overflow-hidden mb-8 border border-gray-800/50 bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
          <div className="absolute inset-0 noise-bg opacity-30" />
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[150%] rounded-full bg-indigo-600/10 blur-[80px]" />
        </div>

        {/* User Info & Header */}
        <div className="relative -mt-24 px-6 mb-12">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-32 h-32 rounded-3xl border-4 border-[#020617] bg-gray-900 overflow-hidden shadow-2xl relative group cursor-pointer"
            >
              <img 
                src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-tighter">Edit Avatar</span>
              </div>
            </button>
            
            <div className="flex-1 pb-2 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {user?.name}
              </h1>
              <p className="text-blue-400 font-medium flex items-center gap-2 mt-1">
                <Briefcase size={16} /> {user?.headline || 'Learner Profile'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <p className="text-sm text-gray-500 flex items-center gap-1.5"><Mail size={14} /> {user?.email}</p>
                <div className="w-1 h-1 rounded-full bg-gray-700" />
                <p className="text-sm text-gray-500 flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Verified LearnerID: {user?._id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          <NavButton active={activeTab === 'credentials'} onClick={() => setActiveTab('credentials')} icon={Award} label="My Credentials" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={UserIcon} label="Professional Profile" />
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          {activeTab === 'credentials' && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Certificates" value={certs.length} icon={Award} color="bg-blue-600/10 text-blue-400" />
                <StatCard label="Active Credentials" value={activeCerts} icon={CheckCircle} color="bg-green-600/10 text-green-400" />
                <StatCard label="Total Verifications" value={0} icon={Zap} color="bg-amber-600/10 text-amber-400" />
                <StatCard label="Issuer Trust" value="100%" icon={ShieldCheck} color="bg-indigo-600/10 text-indigo-400" />
              </div>

              {/* Search & Credentials Grid */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Achievements</h3>
                  <div className="relative w-full sm:w-auto">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      className="input-dark pl-12 pr-4 py-3 rounded-2xl text-sm w-full sm:w-72 border-gray-800/50" 
                      placeholder="Search courses or organizations..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-white rounded-full animate-spin" />
                  </div>
                ) : filteredCerts.length === 0 ? (
                  <div className="text-center py-32 glass rounded-3xl border border-gray-800/50 bg-gray-900/20">
                    <Award size={48} className="text-gray-700 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">No achievements found</h4>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">When you earn a certificate on MAScertify, it will appear here automatically if it matches your email.</p>
                    <Link to="/discover" className="text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors decoration-2 underline underline-offset-4">Browse verified courses →</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCerts.map((c) => (
                      <div key={c._id} className="group glass rounded-3xl border border-gray-800/50 overflow-hidden hover:border-blue-500/30 transition-all flex flex-col hover:shadow-2xl hover:shadow-blue-500/5">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
                              <img src={c.orgLogo || 'https://via.placeholder.com/150'} alt={c.orgName} className="w-full h-full object-contain" />
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-widest ${c.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {c.status}
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition-colors">{c.courseName}</h4>
                          <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-500" /> {c.orgName}</p>

                          <div className="flex items-center justify-between pt-6 border-t border-gray-800/50 mt-auto">
                            <div className="text-xs">
                              <p className="text-gray-500 font-medium">Issued on</p>
                              <p className="text-gray-300 mt-0.5">{new Date(c.issueDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="flex gap-2">
                              <Link 
                                to={`/certificate/${c.certificateId}`} 
                                className="p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                                title="View Certificate"
                              >
                                <ExternalLink size={18} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-3xl animate-in fade-in zoom-in-95 duration-500">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>Professional Profile</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="glass rounded-3xl p-8 border border-gray-800/50 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Name</label>
                        <input 
                          className="input-dark w-full px-5 py-4 rounded-2xl text-sm border-gray-800 focus:ring-2 ring-blue-500/20 transition-all font-sans" 
                          value={profileForm.name} 
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Headline</label>
                        <input 
                          className="input-dark w-full px-5 py-4 rounded-2xl text-sm border-gray-800 focus:ring-2 ring-blue-500/20 transition-all font-sans" 
                          placeholder="e.g. Senior Software Engineer / Aspiring UI Designer"
                          value={profileForm.headline} 
                          onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })} 
                        />
                        <p className="text-[10px] text-gray-600 mt-2 font-medium">This will be displayed on your future public credential portfolio.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Avatar</label>
                      <ImageUpload 
                        value={profileForm.profilePicture} 
                        onChange={(url) => {
                          const nextForm = { ...profileForm, profilePicture: url }
                          setProfileForm(nextForm)
                          handleUpdateProfile(null, nextForm)
                        }}
                        context="user"
                        className="p-5 rounded-2xl border border-gray-800 bg-black/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button type="button" className="px-8 py-3.5 rounded-2xl font-bold text-sm text-gray-500 hover:text-white transition-colors">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className="btn-primary px-10 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-xl shadow-blue-600/20 flex items-center gap-2"
                  >
                    {savingProfile ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Professional Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
