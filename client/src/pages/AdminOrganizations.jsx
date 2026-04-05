import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Shield, Check, X, Building2, Mail, Filter } from 'lucide-react'

const statusFilters = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

export default function AdminOrganizations() {
  const [filter, setFilter] = useState('pending')
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`
      const res = await axios.get(`/api/admin/organizations${q}`)
      setOrgs(res.data.organizations || [])
    } catch {
      toast.error('Failed to load organizations')
      setOrgs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const approve = async (id) => {
    try {
      await axios.patch(`/api/admin/organizations/${id}`, { action: 'approve' })
      toast.success('Organization approved')
      load()
    } catch {
      toast.error('Approve failed')
    }
  }

  const submitReject = async () => {
    if (!rejectId) return
    try {
      await axios.patch(`/api/admin/organizations/${rejectId}`, {
        action: 'reject',
        rejectionReason: rejectReason.trim() || undefined,
      })
      toast.success('Organization rejected')
      setRejectId(null)
      setRejectReason('')
      load()
    } catch {
      toast.error('Reject failed')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          <Link to="/admin/course-listings" className="text-sm text-blue-400 hover:text-blue-300">Course listings →</Link>
          <span className="text-gray-600">·</span>
          <Link to="/admin/audit-logs" className="text-sm text-blue-400 hover:text-blue-300">Platform audit →</Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/15 border border-blue-500/25">
              <Shield className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Admin · Organizations
              </h1>
              <p className="text-sm text-gray-500">Approve new organizations before they can issue certificates.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Filter size={16} className="text-gray-500" />
          {statusFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 border border-gray-800 hover:text-white hover:border-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="glass rounded-2xl border border-gray-800 p-12 text-center text-gray-500">
            No organizations in this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {orgs.map((o) => (
              <div
                key={o._id}
                className="glass rounded-2xl border border-gray-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{o.orgName}</p>
                    <p className="text-xs text-gray-500 capitalize">{o.orgType}</p>
                    {o.contact && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <Mail size={14} className="text-gray-600 flex-shrink-0" />
                        <span className="truncate">{o.contact.email}</span>
                        <span className="text-gray-600">·</span>
                        <span className="truncate">{o.contact.name}</span>
                      </p>
                    )}
                    {o.website && (
                      <p className="text-xs text-blue-400/80 mt-1 truncate">{o.website}</p>
                    )}
                    <span
                      className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-md border ${
                        o.approval?.status === 'approved'
                          ? 'text-green-400 border-green-500/30 bg-green-500/10'
                          : o.approval?.status === 'rejected'
                            ? 'text-red-400 border-red-500/30 bg-red-500/10'
                            : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}
                    >
                      {o.approval?.status || 'pending'}
                    </span>
                    {o.rejectionReason && (
                      <p className="text-xs text-red-400/90 mt-1">{o.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                  {o.approval?.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => approve(o._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-colors"
                    >
                      <Check size={16} /> Approve
                    </button>
                  )}
                  {o.approval?.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectId(o._id)
                        setRejectReason('')
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 transition-colors"
                    >
                      <X size={16} /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-gray-700 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              Reject organization
            </h3>
            <p className="text-sm text-gray-500 mb-4">Optional reason (shown if you add org messaging later).</p>
            <textarea
              className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none mb-4"
              rows={3}
              placeholder="Reason…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white"
                onClick={() => setRejectId(null)}
              >
                Cancel
              </button>
              <button type="button" className="btn-primary px-4 py-2 rounded-xl text-sm" onClick={submitReject}>
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
