import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload, Download } from 'lucide-react'

const SAMPLE_CSV = `recipientName,courseName,issueDate,recipientEmail,description,expiryDate,templateKey,collectionId,publishedCourseId
Jane Doe,Intro to Web,2026-01-15,jane@example.com,Completed all modules,,minimal,,
John Smith,Advanced JS,2026-02-01,,,,academic,,`

export default function ImportCertificates() {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [job, setJob] = useState(null)

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mascertify-import-sample.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const pollJob = async (jobId) => {
    const max = 60
    for (let i = 0; i < max; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      try {
        const res = await axios.get(`/api/certificates/import/jobs/${jobId}`)
        const j = res.data.job
        setJob(j)
        if (j.status === 'completed' || j.status === 'failed') {
          if (j.status === 'completed') {
            toast.success(`Import done: ${j.successCount} ok, ${j.errorCount} errors`)
          }
          return
        }
      } catch {
        toast.error('Failed to poll import job')
        return
      }
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Choose a CSV file')
    setBusy(true)
    setJob(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post('/api/certificates/import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Import started…')
      pollJob(res.data.jobId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Bulk CSV import</h1>
        <p className="text-sm text-gray-500 mb-6">
          Up to 500 rows. Required columns: <span className="font-mono text-gray-400">recipientName</span>,{' '}
          <span className="font-mono text-gray-400">courseName</span>,{' '}
          <span className="font-mono text-gray-400">issueDate</span> (ISO or parseable date).
        </p>

        <div className="glass rounded-2xl border border-gray-800 p-6 space-y-4">
          <button
            type="button"
            onClick={downloadSample}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <Download size={16} /> Download sample CSV
          </button>
          <form onSubmit={submit} className="space-y-4">
            <input
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-gray-400"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {busy ? <span>Uploading…</span> : <><Upload size={16} /> Start import</>}
            </button>
          </form>
        </div>

        {job && (
          <div className="mt-6 glass rounded-2xl border border-gray-800 p-5 text-sm">
            <p className="text-gray-400 mb-2">Job status: <span className="text-white font-medium">{job.status}</span></p>
            <p className="text-gray-500">
              Rows: {job.totalRows} · Success: {job.successCount} · Errors: {job.errorCount}
            </p>
            {job.rowErrors?.length > 0 && (
              <ul className="mt-3 max-h-48 overflow-y-auto text-xs text-red-400/90 space-y-1">
                {job.rowErrors.slice(0, 50).map((e, i) => (
                  <li key={i}>Row {e.row}: {e.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
