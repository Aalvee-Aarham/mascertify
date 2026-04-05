import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, ClipboardList } from 'lucide-react'

export default function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    axios
      .get('/api/organizations/audit-logs', { params: { page, limit: 40 } })
      .then((r) => {
        setLogs(r.data.logs || [])
        setTotalPages(r.data.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load audit log'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <ClipboardList size={22} className="text-blue-400" /> Verification audit log
        </h1>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="glass rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-500">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Names</th>
                    <th className="px-4 py-3 hidden md:table-cell">Emails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {logs.map((log) => (
                    <tr key={log._id} className="text-gray-300">
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-blue-400">{log.certificateId || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-300">{log.recipientName || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{log.recipientEmail || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-800">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-sm text-gray-400 disabled:opacity-30">Previous</button>
              <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="text-sm text-gray-400 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
