import { QRCodeSVG } from 'qrcode.react'

const MOCK_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='16' fill='%231e293b'/%3E%3Cpath d='M40 15 L55 35 L40 65 L25 35 Z' fill='%23fbbf24' opacity='0.9'/%3E%3C/svg%3E"

export default function ProfessionalTemplate({ cert }) {
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
        border: '12px solid #0f172a',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid #fbbf24', margin: '4px', pointerEvents: 'none' }} />
      
      <div style={{ padding: '60px 80px', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 30, left: 30 }}>
          <img src={cert.orgLogo || MOCK_LOGO} style={{ width: '40px', height: '40px' }} />
        </div>

        <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#0f172a', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Certificate
        </h1>
        <p style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 40px' }}>
          of achievement
        </p>

        <p style={{ fontSize: '16px', color: '#64748b', margin: '0 0 15px' }}>This is to certify that</p>
        <p style={{ fontSize: '38px', fontWeight: 800, color: '#1e293b', margin: '0 0 15px', textDecoration: 'underline solid #fbbf24 2px' }}>
          {cert.recipientName}
        </p>

        <p style={{ fontSize: '16px', color: '#64748b', margin: '0 0 15px' }}>has successfully accomplished the requirements of</p>
        <p style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 5px' }}>{cert.courseName}</p>
        <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>{cert.description || 'Verified Professional Achievement'}</p>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '40px' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 5px' }}>ID: {cert.certificateId}</p>
            <p style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600, margin: 0 }}>Date: {issueDate}</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #1e293b', width: '150px', marginBottom: '8px' }} />
            <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, margin: 0 }}>{cert.orgName}</p>
            <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>AUTHORIZED REPRESENTATIVE</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <QRCodeSVG value={verifyUrl} size={60} level="M" />
            <p style={{ fontSize: '8px', color: '#94a3b8', margin: '4px 0 0' }}>VERIFY ONLINE</p>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '8px', background: '#0f172a', color: '#fbbf24', textAlign: 'center', fontSize: '9px', letterSpacing: '0.1em' }}>
        POWERED BY MASCERTIFY SECURE CREDENTIAL SYSTEM
      </div>
    </div>
  )
}
