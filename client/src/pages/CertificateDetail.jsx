import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import CertificateTemplate from '../components/CertificateTemplate'
import { Download, ArrowLeft, CheckCircle, XCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function CertificateDetail() {
  const { id } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/certificates/verify/${id}`)
        setCert(res.data.certificate)
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
        else toast.error('Failed to load certificate')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleDownload = async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(certRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [794, 560] })
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 560)
      pdf.save(`${cert.recipientName.replace(/\s+/g, '_')}_${cert.certificateId}.pdf`)
      toast.success('Certificate downloaded!')
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Certificate Not Found</h1>
        <p className="text-gray-500 mb-6">No certificate found with ID: <span className="font-mono text-red-400">{id}</span></p>
        <Link to="/verify" className="btn-primary px-6 py-3 rounded-xl font-semibold">
          Try Another ID
        </Link>
      </div>
    </div>
  )

  const isValid = cert.status === 'active'

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 noise-bg">
      <div className="max-w-5xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Link to="/verify" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Verify
          </Link>
          <button onClick={handleDownload} disabled={downloading}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
            {downloading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              : <><Download size={15} /> Download PDF</>}
          </button>
        </div>

        {/* Validity banner */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6 animate-slide-up ${isValid ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
          {isValid
            ? <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            : <XCircle size={20} className="text-red-400 flex-shrink-0" />}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
              {isValid ? 'This certificate is valid and authentic' : `This certificate is ${cert.status}`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Verified by MAScertify · ID: <span className="font-mono">{cert.certificateId}</span></p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield size={13} /> MAScertify
          </div>
        </div>

        {/* Certificate - actual size for PDF, scaled for display */}
        <div className="animate-slide-up">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-700"
            style={{ background: '#f3f4f6' }}>
            {/* Scaled display wrapper */}
            <div className="w-full overflow-hidden">
              <div style={{
                width: '794px',
                transformOrigin: 'top left',
                transform: `scale(${Math.min(1, (typeof window !== 'undefined' ? window.innerWidth - 32 : 794) / 794)})`,
              }}>
                <div ref={certRef}>
                  <CertificateTemplate cert={cert} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            This certificate was issued by <span className="text-gray-400">{cert.orgName}</span> through MAScertify's secure platform.
          </p>
        </div>
      </div>
    </div>
  )
}
