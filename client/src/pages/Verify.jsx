import { useState, useRef } from 'react'
import { Search, QrCode, CheckCircle, XCircle, ExternalLink, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Verify() {
  const [certId, setCertId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [mode, setMode] = useState('text') // 'text' | 'qr'
  const inputRef = useRef(null)

  const handleSearch = async (id) => {
    const searchId = (id || certId).trim().toUpperCase()
    if (!searchId) return toast.error('Enter a certificate ID')
    setLoading(true)
    setResult(null)
    setNotFound(false)
    try {
      const res = await axios.get(`/api/certificates/verify/${searchId}`)
      setResult(res.data.certificate)
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true)
      else toast.error('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

  const statusConfig = {
    active:  { color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: CheckCircle, label: 'Valid & Active' },
    revoked: { color: 'text-red-400',   bg: 'bg-red-400/10 border-red-400/20',     icon: XCircle,     label: 'Revoked' },
    expired: { color: 'text-yellow-400',bg: 'bg-yellow-400/10 border-yellow-400/20',icon: XCircle,    label: 'Expired' },
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 noise-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.09) 0%, transparent 70%)' }} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.2))', border: '1px solid rgba(59,130,246,0.3)' }}>
            <QrCode size={26} className="text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            Verify Certificate
          </h1>
          <p className="text-gray-400 text-base">Enter a Certificate ID or scan the QR code to verify authenticity instantly.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl border border-gray-800 mb-6 w-fit mx-auto"
          style={{ background: 'var(--bg-card)' }}>
          <button onClick={() => setMode('text')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'text' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Search size={15} /> Enter ID
          </button>
          <button onClick={() => setMode('qr')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'qr' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Camera size={15} /> Scan QR
          </button>
        </div>

        {/* Search panel */}
        <div className="glass rounded-2xl p-6 border border-gray-800 mb-6 animate-fade-in">
          {mode === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Certificate ID</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    className="input-dark w-full px-4 py-3.5 rounded-xl text-sm font-mono tracking-wider uppercase"
                    placeholder="MASC-XXXXXXXX"
                    value={certId}
                    onChange={e => { setCertId(e.target.value.toUpperCase()); setResult(null); setNotFound(false) }}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="btn-primary px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Search size={16} /> Verify</>}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">Format: MASC-XXXXXXXX (found on the certificate)</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-blue-500/30 flex flex-col items-center justify-center gap-3 mb-4 relative overflow-hidden"
                style={{ background: 'rgba(59,130,246,0.04)' }}>
                {/* Corner markers */}
                {[['top-2 left-2', 'border-t-2 border-l-2'],['top-2 right-2', 'border-t-2 border-r-2'],['bottom-2 left-2', 'border-b-2 border-l-2'],['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, border], i) => (
                  <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-blue-400 rounded-sm`} />
                ))}
                {/* Scan line animation */}
                <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  style={{ animation: 'scanLine 2s ease-in-out infinite', top: '50%' }} />
                <Camera size={32} className="text-blue-400/50 relative z-10" />
                <p className="text-xs text-gray-500 relative z-10">Camera not active in demo</p>
              </div>
              <p className="text-sm text-gray-400 mb-3">QR Scanner is available in the mobile app or use the certificate ID instead.</p>
              <p className="text-xs text-gray-600">The QR code on every certificate links directly to its verification page.</p>
              <style>{`@keyframes scanLine { 0%,100%{top:20%;opacity:0.3} 50%{top:80%;opacity:1} }`}</style>
            </div>
          )}
        </div>

        {/* Not found */}
        {notFound && (
          <div className="glass rounded-2xl p-6 border border-red-500/20 animate-fade-in" style={{ background: 'rgba(239,68,68,0.04)' }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/15 flex-shrink-0">
                <XCircle size={22} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Certificate Not Found</h3>
                <p className="text-sm text-gray-400">No certificate with ID <span className="font-mono text-red-300">{certId}</span> was found in our system.</p>
                <p className="text-sm text-gray-500 mt-2">This may mean the certificate ID is incorrect or was never issued through MAScertify.</p>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (() => {
          const cfg = statusConfig[result.status] || statusConfig.active
          const Icon = cfg.icon
          return (
            <div className={`glass rounded-2xl border animate-slide-up overflow-hidden ${result.status === 'active' ? 'border-green-500/25' : 'border-red-500/25'}`}>
              {/* Status bar */}
              <div className={`px-6 py-4 border-b border-gray-800 flex items-center justify-between ${result.status === 'active' ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                <div className="flex items-center gap-3">
                  <Icon size={22} className={cfg.color} />
                  <div>
                    <p className={`font-semibold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-xs text-gray-500">Verified by MAScertify</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Recipient</p>
                  <p className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{result.recipientName}</p>
                  {result.recipientEmail && <p className="text-sm text-gray-500">{result.recipientEmail}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Course / Program</p>
                  <p className="text-base font-semibold text-blue-400">{result.courseName}</p>
                  {result.description && <p className="text-sm text-gray-500 mt-0.5">{result.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issued by</p>
                    <p className="text-sm font-medium text-white">{result.orgName || 'Unknown Organization'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Issue date</p>
                    <p className="text-sm font-medium text-white">{formatDate(result.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                    <p className="text-sm font-mono text-blue-400">{result.certificateId}</p>
                  </div>
                  {result.expiryDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expires</p>
                      <p className="text-sm font-medium text-white">{formatDate(result.expiryDate)}</p>
                    </div>
                  )}
                </div>

                <Link to={`/certificate/${result.certificateId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all">
                  <ExternalLink size={15} /> View Full Certificate
                </Link>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
