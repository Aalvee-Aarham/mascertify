import { QRCodeSVG } from 'qrcode.react'

const MOCK_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40 Z' fill='%236366f1'/%3E%3C/svg%3E"

export default function ElegantTemplate({ cert }) {
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
        fontFamily: '"DM Serif Display", serif',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '2px solid #e2e8f0', margin: '14px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid #94a3b8', margin: '18px', pointerEvents: 'none' }} />
      
      <div style={{ padding: '60px', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'center', background: '#fdfcfb' }}>
        <div style={{ marginBottom: '30px' }}>
          <img src={cert.orgLogo || MOCK_LOGO} style={{ width: '48px', height: '48px', opacity: 0.8 }} />
          <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#64748b', margin: '4px 0 0' }}>{cert.orgName}</p>
        </div>

        <h1 style={{ fontSize: '48px', fontWeight: 400, color: '#1e293b', margin: '0 0 10px', fontStyle: 'italic' }}>
          Award of Completion
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 35px' }}>
          presents this to
        </p>

        <p style={{ fontSize: '42px', fontWeight: 600, color: '#312e81', margin: '0 0 20px', fontFamily: '"DM Serif Display", serif' }}>
          {cert.recipientName}
        </p>

        <p style={{ fontSize: '15px', color: '#64748b', margin: '0 0 10px', fontStyle: 'italic' }}>for the successful fulfillment of</p>
        <p style={{ fontSize: '26px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px' }}>{cert.courseName}</p>
        <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>{cert.description || 'Distinguished Academic Performance'}</p>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '40px' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 2px' }}>Issued on</p>
            <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500, margin: 0 }}>{issueDate}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <QRCodeSVG value={verifyUrl} size={50} level="M" fgColor="#312e81" />
            <p style={{ fontSize: '8px', color: '#94a3b8', margin: '4px 0 0', textTransform: 'uppercase' }}>Secure Verify</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 2px' }}>Credential ID</p>
            <p style={{ fontSize: '11px', color: '#1e293b', fontWeight: 500, margin: 0 }}>{cert.certificateId}</p>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '4px 60px', textAlign: 'center', fontSize: '9px', color: '#cbd5e1', letterSpacing: '1px' }}>
        MAScertify Digital Credential · Verifiable Authenticity
      </div>
    </div>
  )
}
