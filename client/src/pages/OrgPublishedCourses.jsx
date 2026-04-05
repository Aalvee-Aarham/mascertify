import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Globe, Send } from 'lucide-react'

const statusColors = {
  draft: 'text-gray-400 bg-gray-500/10',
  pending_review: 'text-amber-400 bg-amber-500/10',
  published: 'text-green-400 bg-green-500/10',
  rejected: 'text-red-400 bg-red-500/10',
  delisted: 'text-orange-400 bg-orange-500/10',
}

export default function OrgPublishedCourses() {
  const [courses, setCourses] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    description: '',
    heroImageUrl: '',
    websiteUrl: '',
    linkedCollectionId: '',
  })

  const load = () => {
    axios.get('/api/org/published-courses').then((r) => setCourses(r.data.courses || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }

  useEffect(() => {
    axios.get('/api/collections').then((r) => setCollections(r.data.collections || [])).catch(() => {})
    load()
  }, [])

  const startNew = () => {
    setEditing('new')
    setForm({ title: '', summary: '', description: '', heroImageUrl: '', websiteUrl: '', linkedCollectionId: '' })
  }

  const startEdit = (c) => {
    setEditing(c._id)
    setForm({
      title: c.title,
      summary: c.summary || '',
      description: c.description || '',
      heroImageUrl: c.heroImageUrl || '',
      websiteUrl: c.websiteUrl || '',
      linkedCollectionId: c.linkedCollectionId || '',
    })
  }

  const saveNew = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/org/published-courses', {
        ...form,
        linkedCollectionId: form.linkedCollectionId || undefined,
      })
      toast.success('Draft created')
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      await axios.patch(`/api/org/published-courses/${editing}`, {
        ...form,
        linkedCollectionId: form.linkedCollectionId || null,
      })
      toast.success('Saved')
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    }
  }

  const submitReview = async (id) => {
    try {
      await axios.patch(`/api/org/published-courses/${id}`, { action: 'submit_review' })
      toast.success('Submitted for review')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed')
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <Globe size={22} className="text-blue-400" /> Public course pages
          </h1>
          <button type="button" onClick={startNew} className="btn-primary text-sm px-4 py-2 rounded-xl">New listing</button>
        </div>

        {editing === 'new' && (
          <form onSubmit={saveNew} className="glass rounded-2xl border border-gray-800 p-5 space-y-3 mb-6">
            <h2 className="text-white font-semibold">New draft</h2>
            <FormFields form={form} setForm={setForm} collections={collections} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm">Create draft</button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <ul className="space-y-3">
            {courses.map((c) => (
              <li key={c._id} className="glass rounded-xl border border-gray-800 p-4">
                {editing === c._id ? (
                  <form onSubmit={saveEdit} className="space-y-3">
                    <FormFields form={form} setForm={setForm} collections={collections} />
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-sm">Save</button>
                      <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white font-semibold">{c.title}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">/discover/{c.slug}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColors[c.listingStatus] || statusColors.draft}`}>
                        {c.listingStatus?.replace('_', ' ')}
                      </span>
                    </div>
                    {c.rejectionReason && <p className="text-xs text-red-400 mt-2">{c.rejectionReason}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button type="button" onClick={() => startEdit(c)} className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                      {['draft', 'rejected'].includes(c.listingStatus) && (
                        <button type="button" onClick={() => submitReview(c._id)} className="text-sm text-amber-400 flex items-center gap-1 hover:text-amber-300">
                          <Send size={14} /> Submit for review
                        </button>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
            {courses.length === 0 && !editing && <p className="text-gray-500 text-sm">No listings yet.</p>}
          </ul>
        )}
      </div>
    </div>
  )
}

import ImageUpload from '../components/ImageUpload'

function FormFields({ form, setForm, collections }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  return (
    <>
      <div className="space-y-4">
        <input className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" placeholder="Title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        <input className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" placeholder="Short summary" value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        <textarea className="input-dark w-full px-4 py-2.5 rounded-xl text-sm resize-none font-sans" rows={4} placeholder="Description (plain text)" value={form.description} onChange={(e) => set('description', e.target.value)} />
        
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/40">
          <ImageUpload 
            label="Hero Image (Cloudinary)" 
            value={form.heroImageUrl} 
            onChange={(url) => set('heroImageUrl', url)}
            context="course_hero"
          />
        </div>

        <input className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" placeholder="Website override (https)" value={form.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} />
        <select className="input-dark w-full px-4 py-2.5 rounded-xl text-sm" value={form.linkedCollectionId} onChange={(e) => set('linkedCollectionId', e.target.value)}>
          <option value="">Link collection (optional)</option>
          {collections.map((col) => (
            <option key={col._id} value={col._id}>{col.name}</option>
          ))}
        </select>
      </div>
    </>
  )
}
