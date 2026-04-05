import express from 'express';
import Certificate from '../models/Certificate.js';
import { getEffectiveCertificateStatus } from '../utils/certificateStatus.js';

const router = express.Router();

const baseUrl = () =>
  (process.env.APP_BASE_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

// GET /api/embed/cert/:certificateId — minimal HTML for iframe embed
router.get('/cert/:certificateId', async (req, res) => {
  try {
    const id = String(req.params.certificateId || '').trim().toUpperCase();
    const cert = await Certificate.findOne({ certificateId: id })
      .select('certificateId status expiryDate')
      .lean();
    const status = cert ? getEffectiveCertificateStatus(cert) : 'unknown';
    const label =
      status === 'active'
        ? 'Verified — credential valid'
        : status === 'expired'
          ? 'Expired'
          : status === 'revoked'
            ? 'Revoked'
            : 'Not found';
    const cls =
      status === 'active' ? 'ok' : status === 'unknown' ? 'unk' : 'bad';
    const verifyLink = `${baseUrl()}/certificate/${encodeURIComponent(id)}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>MAScertify · ${id}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: transparent; }
    a { text-decoration: none; color: inherit; }
    .wrap { padding: 8px; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 14px; border-radius: 12px; font-size: 13px; max-width: 100%;
    }
    .ok { background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; }
    .bad { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .unk { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
    .sub { font-size: 11px; opacity: 0.85; margin-top: 4px; font-family: ui-monospace, monospace; }
  </style>
</head>
<body>
  <div class="wrap">
    <a href="${verifyLink}" target="_blank" rel="noopener noreferrer">
      <div class="badge ${cls}">
        <strong>MAScertify</strong>
        <span>·</span>
        <span>${label}</span>
      </div>
      <div class="sub">${id}</div>
    </a>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.send(html);
  } catch (err) {
    res.status(500).type('text').send('Embed error');
  }
});

export default router;
