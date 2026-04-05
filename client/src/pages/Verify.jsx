import { useState, useRef, useEffect } from 'react'
import { Search, QrCode, CheckCircle, XCircle, ExternalLink, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Html5Qrcode } from 'html5-qrcode'
import { parseCertificateIdFromQr } from '../utils/qrCertId'

const QR_READER_ID = 'verify-qr-reader'

export default function Verify() {
  const [certId, setCertId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [mode, setMode] = useState('text')
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

  useEffect(() => {
    if (mode !== 'qr') return undefined

    const scanner = new Html5Qrcode(QR_READER_ID)

    const verifyById = async (searchId) => {
      setLoading(true)
      setResult(null)
      setNotFound(false)
      setCertId(searchId)
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

    ;(async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            const parsed = parseCertificateIdFromQr(decodedText)
            if (!parsed) {
              toast.error('This QR code is not a MAScertify certificate link')
              return
            }
            scanner.stop().catch(() => {})
            verifyById(parsed)
          },
          () => {}
        )
      } catch {
        toast.error('Camera unavailable. Allow permission, use HTTPS, or enter the certificate ID.')
      }
    })()

    return () => {
      scanner.stop().catch(() => {})
      scanner.clear().catch(() => {})
    }
  }, [mode])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

  const statusConfig = {
    active:  { color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20', icon: CheckCircle, label: 'Valid & Active', border: 'border-green-500/25', bar: 'bg-green-500/5' },
    revoked: { color: 'text-red-400',   bg: 'bg-red-400/10 border-red-400/20',     icon: XCircle,     label: 'Revoked', border: 'border-red-500/25', bar: 'bg-red-500/5' },
    expired: { color: 'text-yellow-400',bg: 'bg-yellow-400/10 border-yellow-400/20',icon: XCircle,    label: 'Expired', border: 'border-yellow-500/25', bar: 'bg-yellow-500/5' },
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 noise-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.09) 0%, transparent 70%)' }} />

      <div className="max-w-2xl mx-auto relative z-10">
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

        <div className="flex gap-1 p-1 rounded-xl border border-gray-800 mb-6 w-fit mx-auto"
          style={{ background: 'var(--bg-card)' }}>
          <button type="button" onClick={() => setMode('text')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'text' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Search size={15} /> Enter ID
          </button>
          <button type="button" onClick={() => setMode('qr')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'qr' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Camera size={15} /> Scan QR
          </button>
        </div>

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
                  type="button"
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
            <div className="py-2">
              <p className="text-sm text-gray-400 mb-3 text-center">Point your camera at the certificate QR code.</p>
              <div id={QR_READER_ID} className="w-full min-h-[280px] rounded-xl overflow-hidden bg-black/50 border border-gray-800" />
              <p className="text-xs text-gray-600 mt-3 text-center">Works on HTTPS or localhost. Stops when a valid certificate is read.</p>
            </div>
          )}
        </div>

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

        {result && (() => {
          const cfg = statusConfig[result.status] || statusConfig.active
          const Icon = cfg.icon
          return (
            <div className={`glass rounded-2xl border animate-slide-up overflow-hidden ${cfg.border}`}>
              <div className={`px-6 py-4 border-b border-gray-800 flex items-center justify-between ${cfg.bar}`}>
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
