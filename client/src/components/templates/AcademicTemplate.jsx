import { QRCodeSVG } from 'qrcode.react'

const MOCK_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='8' fill='%237c2d12'/%3E%3Ctext x='40' y='48' text-anchor='middle' fill='white' font-size='28' font-family='serif'%3EA%3C/text%3E%3C/svg%3E"

export default function AcademicTemplate({ cert }) {
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
        background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 35%)',
        fontFamily: 'Georgia, "Times New Roman", serif',
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        border: '3px double #b45309',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ padding: '36px 48px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1px solid #d97706', paddingBottom: '16px' }}>
          <img
            src={cert.orgLogo || MOCK_LOGO}
            alt=""
            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', marginBottom: '8px' }}
            onError={e => { e.target.src = MOCK_LOGO }}
          />
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#78350f', margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {cert.orgName || 'Institution'}
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#92400e', letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Diploma of Achievement
        </p>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716c', margin: '0 0 24px' }}>
          This document certifies that
        </p>

        <p style={{
          textAlign: 'center',
          fontSize: '34px',
          fontWeight: 700,
          color: '#1c1917',
          margin: '0 0 20px',
          fontStyle: 'italic',
        }}>
          {cert.recipientName}
        </p>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716c', margin: '0 0 8px' }}>
          has completed the program
        </p>
        <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700, color: '#b45309', margin: '0 0 12px' }}>
          {cert.courseName}
        </p>
        {cert.description && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#a8a29e', margin: '0 0 24px', maxWidth: '520px', alignSelf: 'center', lineHeight: 1.5 }}>
            {cert.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '20px' }}>
          <div>
            <p style={{ fontSize: '9px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Date of issue</p>
            <p style={{ fontSize: '13px', color: '#44403c', margin: 0 }}>{issueDate}</p>
            <p style={{ fontSize: '9px', color: '#a8a29e', margin: '12px 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Credential ID</p>
            <p style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', color: '#b45309', margin: 0 }}>{cert.certificateId}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '6px', background: '#fff', border: '2px solid #d97706', borderRadius: '4px', display: 'inline-block' }}>
              <QRCodeSVG value={verifyUrl} size={68} level="M" fgColor="#1c1917" bgColor="#ffffff" />
            </div>
            <p style={{ fontSize: '8px', color: '#a8a29e', margin: '6px 0 0' }}>Verify authenticity</p>
          </div>
        </div>
      </div>
      <div style={{ padding: '6px 48px', background: '#fef3c7', borderTop: '1px solid #fcd34d' }}>
        <p style={{ fontSize: '8px', color: '#92400e', margin: 0, textAlign: 'center', fontFamily: 'ui-monospace, monospace' }}>
          {verifyUrl} · MAScertify
        </p>
      </div>
    </div>
  )
}
