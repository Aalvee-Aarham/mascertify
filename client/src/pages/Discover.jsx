import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Compass, TrendingUp } from 'lucide-react'

export default function Discover() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/discover/courses', { params: { limit: 48, sort: 'popular' } })
      .then((r) => setCourses(r.data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 noise-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-blue-500/15 border border-blue-500/25">
            <Compass className="text-blue-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Discover certifications</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">Popular public course listings from verified organizations on MAScertify.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <Link
                key={c._id}
                to={`/discover/${c.slug}`}
                className="group glass rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/40 transition-all animate-fade-in"
              >
                <div className="aspect-[16/9] bg-gray-900 relative">
                  {c.heroImageUrl ? (
                    <img src={c.heroImageUrl} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No image</div>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-black/60 text-gray-300">
                    <TrendingUp size={12} className="text-green-400" />
                    {c.verifyCount ?? 0} verifies
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-400/80 mb-1">{c.orgName}</p>
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {c.title}
                  </h2>
                  {c.summary && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.summary}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && courses.length === 0 && (
          <p className="text-center text-gray-500 py-16">No published listings yet. Organizations can submit course pages from their dashboard.</p>
        )}
      </div>
    </div>
  )
}
