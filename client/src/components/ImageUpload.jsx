import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

/**
 * context: 'org' | 'course_hero'
 */
export default function ImageUpload({ value, onChange, label, context = 'org', className = '' }) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB locally as well
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be 5MB or smaller')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('context', context)

    setUploading(true)
    try {
      const res = await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success) {
        onChange(res.data.url)
        toast.success('Image uploaded')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-700 bg-gray-800 flex-shrink-0">
            <img src={value} alt="Preview" className="w-full h-full object-contain" />
            <button
              onClick={() => onChange('')}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              title="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50 flex items-center justify-center text-gray-500 flex-shrink-0">
            <ImageIcon size={24} />
          </div>
        )}

        <div className="flex-1">
          <label className={`
            relative cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl border border-gray-700
            transition-all flex items-center justify-center gap-2 text-sm font-medium
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? 'Uploading...' : value ? 'Change image' : 'Upload image'}
            <input
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-[10px] text-gray-500 mt-2">
            JPG, PNG, or WebP. Max 5MB.
          </p>
        </div>
      </div>
    </div>
  )
}
