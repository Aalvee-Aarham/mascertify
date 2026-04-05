/** Extract MASC-XXXXXXXX from raw QR text or verification URLs. */
export function parseCertificateIdFromQr(text) {
  if (!text || typeof text !== 'string') return ''
  const t = text.trim()
  const direct = t.match(/MASC-[A-F0-9]+/i)
  if (direct) return direct[0].toUpperCase()
  try {
    const u = new URL(t, typeof window !== 'undefined' ? window.location.origin : undefined)
    const pathMatch = u.pathname.match(/MASC-[A-F0-9]+/i)
    if (pathMatch) return pathMatch[0].toUpperCase()
    const q = u.searchParams.get('id')
    if (q && /^MASC-/i.test(q)) return q.trim().toUpperCase()
  } catch {
    /* not a URL */
  }
  return ''
}
