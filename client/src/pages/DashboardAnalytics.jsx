import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, BarChart3 } from 'lucide-react'

export default function DashboardAnalytics() {
  const [data, setData] = useState(null)
  const [collections, setCollections] = useState([])
  const [collectionId, setCollectionId] = useState('')
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/collections').then(r => setCollections(r.data.collections || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const to = new Date()
    const from = new Date(to.getTime() - days * 86400000)
    setLoading(true)
    axios
      .get('/api/organizations/analytics', {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
          ...(collectionId ? { collectionId } : {}),
        },
      })
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [days, collectionId])

  const chartData = useMemo(() => {
    if (!data) return []
    const issueMap = Object.fromEntries((data.issuesByDay || []).map((d) => [d.date, d.count]))
    const verMap = Object.fromEntries((data.verificationsByDay || []).map((d) => [d.date, d.count]))
    const dates = [...new Set([...Object.keys(issueMap), ...Object.keys(verMap)])].sort()
    return dates.map((date) => ({
      date,
      issued: issueMap[date] || 0,
      verifications: verMap[date] || 0,
    }))
  }, [data])

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
              <BarChart3 className="text-blue-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Analytics</h1>
              <p className="text-sm text-gray-500">Issues and verification attempts over time</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="input-dark px-3 py-2 rounded-xl text-sm"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <select
              className="input-dark px-3 py-2 rounded-xl text-sm min-w-[160px]"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            >
              <option value="">All collections</option>
              {collections.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {data && (
          <p className="text-xs text-gray-600 mb-4">
            Revoked certificates (current snapshot): <span className="text-gray-400">{data.revokedCertificatesTotal}</span>
          </p>
        )}

        <div className="glass rounded-2xl border border-gray-800 p-4 sm:p-6" style={{ minHeight: 360 }}>
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Line type="monotone" dataKey="issued" name="Issued" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="verifications" name="Verifications" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
