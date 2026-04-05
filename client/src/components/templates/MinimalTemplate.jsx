import { QRCodeSVG } from 'qrcode.react'

const MOCK_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='16' fill='%233b82f6'/%3E%3Cpath d='M40 15 L55 35 L40 65 L25 35 Z' fill='white' opacity='0.9'/%3E%3Ccircle cx='40' cy='38' r='8' fill='%231d4ed8'/%3E%3C/svg%3E"

export default function MinimalTemplate({ cert }) {
  const verifyUrl = `${window.location.origin}/certificate/${cert.certificateId}`
  const issueDate = cert.issueDate
    ? new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <div
      id="certificate-print"
      style={{
        width: '794px',
        minHeight: '560px',
        background: '#ffffff',
        fontFamily: '"DM Sans", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa)', width: '100%' }} />
      <div style={{
        position: 'absolute', left: 0, top: '6px', bottom: 0,
        width: '4px', background: 'linear-gradient(180deg, #3b82f6 0%, transparent 100%)',
        opacity: 0.3
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '320px', height: '320px',
        opacity: 0.025,
        background: 'radial-gradient(circle at center, #1d4ed8 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60, width: '280px', height: '280px',
        borderRadius: '50%', border: '60px solid #3b82f6', opacity: 0.04, pointerEvents: 'none'
      }} />

      <div style={{ padding: '40px 52px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={cert.orgLogo || MOCK_LOGO}
              alt="logo"
              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'contain' }}
              onError={e => { e.target.src = MOCK_LOGO }}
            />
            <div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0, fontFamily: 'Syne, sans-serif' }}>
                {cert.orgName || 'MAScertify Organization'}
              </p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0', letterSpacing: '0.05em' }}>
                OFFICIAL CERTIFICATE ISSUER
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '999px',
            background: '#eff6ff', border: '1px solid #bfdbfe'
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#1d4ed8', letterSpacing: '0.05em' }}>VERIFIED</span>
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.15em', color: '#9ca3af', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase' }}>
            Certificate of Completion
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
            This is to certify that
          </p>
          <div style={{ borderBottom: '2px solid #1d4ed8', paddingBottom: '8px', marginBottom: '20px', display: 'inline-block' }}>
            <p style={{
              fontSize: '36px', fontWeight: 800, color: '#111827',
              margin: 0, fontFamily: 'Syne, sans-serif', lineHeight: 1.1
            }}>
              {cert.recipientName}
            </p>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 6px', lineHeight: 1.5 }}>
            has successfully completed
          </p>
          <p style={{
            fontSize: '22px', fontWeight: 700, color: '#1d4ed8',
            margin: '0 0 8px', fontFamily: 'Syne, sans-serif'
          }}>
            {cert.courseName}
          </p>
          {cert.description && (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>{cert.description}</p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Issue Date</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>{issueDate}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Certificate ID</p>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#374151', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                {cert.certificateId}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>Authorized Signature</p>
              <div style={{ borderBottom: '1.5px solid #374151', width: '120px' }} />
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: '4px 0 0' }}>Issuing Authority</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ padding: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <QRCodeSVG value={verifyUrl} size={72} level="M" fgColor="#111827" bgColor="#ffffff" />
            </div>
            <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0, textAlign: 'center' }}>Scan to verify</p>
          </div>
        </div>
      </div>

      <div style={{
        padding: '8px 52px', background: '#f9fafb',
        borderTop: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
          {verifyUrl}
        </p>
        <p style={{ fontSize: '9px', color: '#9ca3af', margin: 0 }}>
          Powered by MAScertify · Secure Digital Credential
        </p>
      </div>
    </div>
  )
}
