import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, ExternalLink, TrendingUp } from 'lucide-react'

export default function DiscoverDetail() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`/api/discover/courses/${encodeURIComponent(slug)}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen pt-28 px-4 text-center">
        <p className="text-gray-500 mb-4">Listing not found.</p>
        <Link to="/discover" className="text-blue-400 text-sm">← Back to discover</Link>
      </div>
    )
  }

  const c = data.course
  const website = c.websiteUrl

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 noise-bg">
      <div className="max-w-3xl mx-auto">
        <Link to="/discover" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> All listings
        </Link>

        {c.heroImageUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-800 mb-8 aspect-[21/9] bg-gray-900">
            <img src={c.heroImageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-sm text-blue-400/90 mb-1">{c.orgName}</p>
        <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{c.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <TrendingUp size={16} className="text-green-400" />
          {c.verifyCount ?? 0} verification events (popularity signal)
        </div>
        {c.summary && <p className="text-lg text-gray-300 mb-6">{c.summary}</p>}
        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-gray-400 whitespace-pre-wrap">{c.description}</p>
        </div>

        {c.galleryUrls?.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {c.galleryUrls.map((u, i) => (
              <img key={i} src={u} alt="" className="rounded-xl border border-gray-800 w-full h-40 object-cover" />
            ))}
          </div>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
          >
            <ExternalLink size={18} /> Visit organization website
          </a>
        )}
      </div>
    </div>
  )
}
