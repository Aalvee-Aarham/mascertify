import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Shield } from 'lucide-react'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axios
      .get('/api/admin/audit-logs', { params: { page, limit: 50 } })
      .then((r) => {
        setLogs(r.data.logs || [])
        setTotalPages(r.data.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <Link to="/admin/organizations" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Organizations
        </Link>
        <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <Shield className="text-blue-400" size={22} /> Platform audit log
        </h1>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="glass rounded-2xl border border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500">
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Cert ID</th>
                  <th className="px-3 py-2">Names</th>
                  <th className="px-3 py-2 hidden lg:table-cell">Org ID</th>
                  <th className="px-3 py-2 hidden md:table-cell">Emails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {logs.map((log) => (
                  <tr key={log._id} className="text-gray-300">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono text-xs text-blue-400">{log.certificateId || '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-300">{log.recipientName || '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 hidden lg:table-cell">{log.organizationId ? String(log.organizationId).slice(-6) : '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-500 hidden md:table-cell">{log.recipientEmail || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between px-4 py-3 border-t border-gray-800">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-sm text-gray-400 disabled:opacity-30">Prev</button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="text-sm text-gray-400 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
