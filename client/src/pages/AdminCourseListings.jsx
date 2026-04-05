import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, BookOpen, Check, X, Ban } from 'lucide-react'

export default function AdminCourseListings() {
  const [filter, setFilter] = useState('pending_review')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const q = filter === 'all' ? 'all' : filter
    axios
      .get('/api/admin/course-listings', { params: { status: q } })
      .then((r) => setCourses(r.data.courses || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const patch = async (id, action, rejectionReason) => {
    try {
      await axios.patch(`/api/admin/course-listings/${id}`, { action, rejectionReason })
      toast.success('Updated')
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/organizations" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Organizations
        </Link>
        <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <BookOpen className="text-blue-400" size={22} /> Course listings
        </h1>
        <div className="flex flex-wrap gap-2 mb-6">
          {['pending_review', 'published', 'rejected', 'delisted', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter === f ? 'bg-blue-500 text-white' : 'border border-gray-700 text-gray-400'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <ul className="space-y-3">
            {courses.map((c) => (
              <li key={c._id} className="glass rounded-xl border border-gray-800 p-4">
                <p className="text-white font-semibold">{c.title}</p>
                <p className="text-xs text-gray-500">{c.orgName} · /discover/{c.slug} · <span className="capitalize">{c.listingStatus?.replace('_', ' ')}</span></p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {c.listingStatus === 'pending_review' && (
                    <>
                      <button type="button" onClick={() => patch(c._id, 'approve')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/25">
                        <Check size={14} /> Approve
                      </button>
                      <button type="button" onClick={() => patch(c._id, 'reject', 'Does not meet guidelines')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25">
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                  {c.listingStatus === 'published' && (
                    <button type="button" onClick={() => patch(c._id, 'delist')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/25">
                      <Ban size={14} /> Delist
                    </button>
                  )}
                </div>
              </li>
            ))}
            {courses.length === 0 && <p className="text-gray-500 text-sm">No listings.</p>}
          </ul>
        )}
      </div>
    </div>
  )
}
