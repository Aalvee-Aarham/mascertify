import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, FolderOpen, Plus, Trash2 } from 'lucide-react'

const types = ['course', 'event', 'cohort', 'other']

export default function CollectionsPage() {
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('course')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [certs, setCerts] = useState([])
  const [certsLoading, setCertsLoading] = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/collections').then((r) => setList(r.data.collections || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const drillDown = async (col) => {
    setSelected(col)
    setCertsLoading(true)
    try {
      const res = await axios.get(`/api/collections/${col._id}/certificates`)
      setCerts(res.data.certificates || [])
    } catch {
      toast.error('Failed to load certificates')
    } finally {
      setCertsLoading(false)
    }
  }

  const create = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await axios.post('/api/collections', { name: name.trim(), type })
      setName('')
      toast.success('Collection created')
      load()
    } catch {
      toast.error('Create failed')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this collection? Certificates keep their data; collection link is removed.')) return
    try {
      await axios.delete(`/api/collections/${id}`)
      toast.success('Deleted')
      if (selected?._id === id) setSelected(null)
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          {selected && (
            <button onClick={() => setSelected(null)} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
              View all collections
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <FolderOpen size={22} className="text-blue-400" /> 
          {selected ? `Collection: ${selected.name}` : 'Collections'}
        </h1>

        {!selected && (
          <>
            <form onSubmit={create} className="glass rounded-2xl border border-gray-800 p-5 mb-6 flex flex-col sm:flex-row gap-3">
              <input className="input-dark flex-1 px-4 py-2.5 rounded-xl text-sm" placeholder="Name (e.g. Spring 2026 Cohort)" value={name} onChange={(e) => setName(e.target.value)} />
              <select className="input-dark px-3 py-2.5 rounded-xl text-sm" value={type} onChange={(e) => setType(e.target.value)}>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="submit" className="btn-primary px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <Plus size={16} /> Add
              </button>
            </form>

            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((c) => (
                  <div key={c._id} 
                    onClick={() => drillDown(c)}
                    className="glass rounded-xl border border-gray-800 px-5 py-4 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-500/50 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate group-hover:text-blue-400">{c.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{c.type} · {c.count || 0} certificates</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); remove(c._id); }} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {list.length === 0 && <p className="text-gray-500 text-sm col-span-2">No collections yet.</p>}
              </div>
            )}
          </>
        )}

        {selected && (
          <div className="glass rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 bg-white/5 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Recipients ({certs.length})</h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">{selected._id}</span>
            </div>
            {certsLoading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-gray-500">
                      <th className="px-5 py-3">Recipient Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Certificate ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/80">
                    {certs.map((cert) => (
                      <tr key={cert._id} className="text-gray-300">
                        <td className="px-5 py-3 font-medium text-white">{cert.recipientName}</td>
                        <td className="px-5 py-3 text-gray-500">{cert.recipientEmail || '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${
                            cert.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            cert.status === 'revoked' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-gray-500/10 border-gray-500/20 text-gray-400'
                          }`}>
                            {cert.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-xs text-blue-400">
                          {cert.certificateId}
                        </td>
                      </tr>
                    ))}
                    {certs.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-5 py-12 text-center text-gray-500 italic">
                          No certificates issued in this collection yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
