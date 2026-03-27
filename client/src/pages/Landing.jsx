import { Link } from 'react-router-dom'
import { Shield, Zap, QrCode, Globe, ArrowRight, CheckCircle, Lock, Award } from 'lucide-react'

const features = [
  { icon: Shield, title: 'Tamper-proof Certificates', desc: 'Every certificate is cryptographically signed with a unique ID that cannot be altered.' },
  { icon: Zap, title: 'Instant Verification', desc: 'Employers and institutions can verify any certificate in seconds — no calls, no emails.' },
  { icon: QrCode, title: 'QR Code Validation', desc: 'Each certificate carries a scannable QR code that links directly to its verification page.' },
  { icon: Globe, title: 'Globally Accessible', desc: 'Cloud-hosted and always online. Verify from anywhere in the world, anytime.' },
  { icon: Lock, title: 'Role-based Access', desc: 'Separate access for organizations, users, and verifiers — every action is logged and secured.' },
  { icon: Award, title: 'PDF Downloads', desc: 'Beautiful, print-ready certificates downloadable as PDFs with embedded verification data.' },
]

const stats = [
  { value: '100%', label: 'Fraud Prevention' },
  { value: '<2s', label: 'Verification Time' },
  { value: '∞', label: 'Certificates Stored' },
  { value: '24/7', label: 'Always Online' },
]

export default function Landing() {
  return (
    <div className="min-h-screen noise-bg">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-blue-400 border border-blue-500/30 mb-8"
            style={{ background: 'rgba(59,130,246,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
            Secure · Instant · Globally Verifiable
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Certificates That
            <span className="block" style={{ color: '#3b82f6' }}>Can't Be Faked</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MAScertify lets organizations issue digitally-signed certificates with unique IDs and QR codes.
            Anyone can verify authenticity instantly — no phone calls, no paperwork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register/organization"
              className="btn-primary flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold">
              Start Issuing Certificates <ArrowRight size={18} />
            </Link>
            <Link to="/verify"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white transition-all">
              <QrCode size={18} /> Verify a Certificate
            </Link>
          </div>
        </div>

        {/* Mock certificate preview */}
        <div className="mt-20 max-w-2xl mx-auto relative animate-fade-in">
          <div className="absolute inset-0 rounded-2xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
          <div className="relative glass rounded-2xl p-8 border border-blue-500/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  🎓
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-mono">MASC-A3F8E2C1</p>
                  <p className="text-sm font-semibold text-white">Tech Academy Bangladesh</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20">
                ✓ Verified
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              Certificate of Completion
            </p>
            <p className="text-gray-400 text-sm mb-4">This certifies that <span className="text-blue-400 font-medium">Arham Al-Vee</span> has successfully completed</p>
            <p className="text-xl font-semibold text-white mb-4">Full Stack Web Development</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-800">
              <span>Issued: Jan 15, 2025</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Valid indefinitely</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-gray-800/60">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-blue-400 mb-1"
                style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Everything you need for<br />secure credentialing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="p-6 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all group"
                style={{ background: 'var(--bg-card)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <f.icon size={20} className="text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 border-t border-gray-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register your organization', desc: 'Sign up and create your verified organization profile.' },
              { step: '02', title: 'Issue certificates', desc: 'Fill in recipient details, generate unique IDs and QR codes instantly.' },
              { step: '03', title: 'Share & verify', desc: 'Recipients download PDFs. Anyone can verify via QR or certificate ID.' },
            ].map((item) => (
              <div key={item.step} className="relative pl-16">
                <span className="absolute left-0 top-0 text-5xl font-bold text-gray-800"
                  style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{item.step}</span>
                <div className="pt-6">
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 border border-blue-500/20"
            style={{ background: 'rgba(59,130,246,0.05)' }}>
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Ready to eliminate certificate fraud?
            </h2>
            <p className="text-gray-400 mb-8">Join organizations issuing verifiable digital certificates today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register/organization"
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold">
                Register Organization <ArrowRight size={18} />
              </Link>
              <Link to="/register/user"
                className="flex items-center justify-center px-6 py-3.5 rounded-xl font-medium text-gray-300 border border-gray-700 hover:border-gray-500 transition-all">
                I have a certificate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-500" />
            <span className="font-bold text-sm text-white" style={{ fontFamily: 'Syne, sans-serif' }}>MAScertify</span>
          </div>
          <p className="text-xs text-gray-600">© 2025 MAScertify. Secure Certificate Verification Platform.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <Link to="/verify" className="hover:text-gray-400 transition-colors">Verify</Link>
            <Link to="/login" className="hover:text-gray-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
