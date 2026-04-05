/**
 * Effective status for display and verification (expiry overrides active).
 */
export function getEffectiveCertificateStatus(cert) {
  if (!cert) return null;
  const stored = cert.status || 'active';
  if (stored === 'revoked') return 'revoked';
  if (cert.expiryDate) {
    const end = new Date(cert.expiryDate);
    if (!Number.isNaN(end.getTime()) && end < new Date()) return 'expired';
  }
  return 'active';
}

/**
 * Plain object for JSON with effective `status` (does not mutate Mongoose doc).
 */
export function toPublicCertificate(cert) {
  if (!cert) return null;
  const o = typeof cert.toObject === 'function' ? cert.toObject() : { ...cert };
  o.status = getEffectiveCertificateStatus(cert);
  return o;
}
