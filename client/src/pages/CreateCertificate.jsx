import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CertificateTemplate from '../components/CertificateTemplate'
import { Download, ArrowLeft, Eye, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const today = new Date().toISOString().split('T')[0]

export default function CreateCertificate() {
  const { user, organization } = useAuth()
  const navigate = useNavigate()
  const certRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedCert, setSavedCert] = useState(null)
  const [showPreview, setShowPreview] = useState(true)

  const [form, setForm] = useState({
    recipientName: '',
    courseName: '',
    description: '',
    issueDate: today,
    expiryDate: '',
    recipientEmail: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const previewCert = {
    ...form,
    certificateId: savedCert?.certificateId || 'MASC-PREVIEW',
    orgName: organization?.orgName || user?.name || 'Your Organization',
    orgLogo: organization?.logo || '',
    recipientName: form.recipientName || 'Recipient Name',
    courseName: form.courseName || 'Course / Program Name',
  }

  const handleSave = async () => {
    if (!form.recipientName || !form.courseName || !form.issueDate)
      return toast.error('Recipient name, course name and issue date are required')
    setSaving(true)
    try {
      const res = await axios.post('/api/certificates', form)
      setSavedCert(res.data.certificate)
      setSaved(true)
      toast.success('Certificate created successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create certificate')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!certRef.current) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [794, 560] })
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 560)
      const fileName = `${(savedCert?.recipientName || form.recipientName || 'certificate').replace(/\s+/g, '_')}_certificate.pdf`
      pdf.save(fileName)
      toast.success('PDF downloaded!')
    } catch (err) {
      toast.error('PDF generation failed')
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Issue New Certificate
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-gray-800">
              <h2 className="text-base font-semibold text-white mb-5">Recipient Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Recipient Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="Full name of recipient" value={form.recipientName}
                    onChange={e => set('recipientName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Recipient Email</label>
                  <input type="email" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="recipient@email.com (optional)" value={form.recipientEmail}
                    onChange={e => set('recipientEmail', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-gray-800">
              <h2 className="text-base font-semibold text-white mb-5">Certificate Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Course / Event Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                    placeholder="e.g. Full Stack Web Development" value={form.courseName}
                    onChange={e => set('courseName', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                  <textarea className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" rows={2}
                    placeholder="Brief description (optional)" value={form.description}
                    onChange={e => set('description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Issue Date <span className="text-red-400">*</span>
                    </label>
                    <input type="date" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                      value={form.issueDate} onChange={e => set('issueDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Expiry Date</label>
                    <input type="date" className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                      value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!saved ? (
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><Save size={16} /> Save Certificate</>}
                </button>
              ) : (
                <>
                  <div className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                    ✓ Certificate Saved — ID: <span className="font-mono text-xs">{savedCert?.certificateId}</span>
                  </div>
                </>
              )}
              <button onClick={handleDownloadPDF} disabled={downloading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-50">
                {downloading
                  ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  : <Download size={16} />}
                PDF
              </button>
            </div>

            {saved && (
              <div className="flex gap-3">
                <button onClick={() => { setSaved(false); setSavedCert(null); setForm({ recipientName: '', courseName: '', description: '', issueDate: today, expiryDate: '', recipientEmail: '' }) }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:border-gray-500 transition-all">
                  Create Another
                </button>
                <button onClick={() => navigate('/dashboard')}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:border-gray-500 transition-all">
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Eye size={16} className="text-gray-400" /> Live Preview
              </h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">794 × 560px</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-800"
              style={{ background: '#f3f4f6' }}>
              <div style={{ transform: 'scale(0.72)', transformOrigin: 'top left', width: '794px', height: '560px' }}
                ref={certRef}>
                <CertificateTemplate cert={previewCert} />
              </div>
              {/* Scale wrapper to show correctly */}
              <div style={{ height: `${560 * 0.72}px`, marginTop: `-${560 * (1 - 0.72)}px` }} />
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Preview updates as you type</p>
          </div>
        </div>
      </div>
    </div>
  )
}
