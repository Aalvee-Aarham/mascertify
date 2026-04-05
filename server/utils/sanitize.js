/** Basic XSS mitigation for user-provided text shown as HTML. */
export function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isHttpsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const t = url.trim();
  if (t.length > 2048) return false;
  try {
    const u = new URL(t);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}
