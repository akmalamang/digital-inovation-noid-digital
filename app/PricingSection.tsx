// ── Section Pricing ──────────────────────────────────────────────────────────
// Tambahkan komponen ini di app/page.tsx
// Letakkan setelah section "Cara Kerja" dan sebelum "CTA Bottom"

// Nomor WhatsApp admin
const WA_NUMBER = '6281574394344';

// Generate pesan WhatsApp otomatis sesuai paket
function generateWAMessage(paket: 'basic' | 'premium') {
  const info = {
    basic: {
      nama: 'Basic',
      harga: 'Rp 39.000',
      fitur: '1 undangan, 2 tema, galeri max 5 foto, aktif 90 hari',
    },
    premium: {
      nama: 'Premium',
      harga: 'Rp 49.000',
      fitur: '1 undangan, semua tema, galeri unlimited, live streaming, love story, aktif 90 hari',
    },
  };

  const p = info[paket];
  return encodeURIComponent(
    `Halo Admin UndanganDigital! 👋\n\nSaya ingin memesan paket *${p.nama}* senilai *${p.harga}*.\n\n✅ Fitur: ${p.fitur}\n\nMohon informasi lebih lanjut mengenai cara pembayaran dan proses pembuatan undangan. Terima kasih! 🙏`,
  );
}

// Komponen PricingSection — tambahkan ini di dalam fungsi HomePage
export function PricingSection() {
  const packages = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: 'Rp 39.000',
      priceNum: 39000,
      period: '90 hari aktif',
      color: '#A6B1E1',
      colorDark: '#6b72b8',
      badge: null,
      features: [
        { text: '1 Undangan Digital', included: true },
        { text: '2 Pilihan Tema', included: true },
        { text: 'Galeri Foto (maks. 5 foto)', included: true },
        { text: 'RSVP & Buku Tamu', included: true },
        { text: 'Angpao Digital', included: true },
        { text: 'Link Personal per Tamu', included: true },
        { text: 'Semua Tema Premium', included: false },
        { text: 'Galeri Unlimited', included: false },
        { text: 'Love Story', included: false },
        { text: 'Live Streaming', included: false },
      ],
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: 'Rp 49.000',
      priceNum: 49000,
      period: '90 hari aktif',
      color: '#DCD6F7',
      colorDark: '#424874',
      badge: 'Terpopuler ✦',
      features: [
        { text: '1 Undangan Digital', included: true },
        { text: 'Semua Tema Premium', included: true },
        { text: 'Galeri Foto Unlimited', included: true },
        { text: 'RSVP & Buku Tamu', included: true },
        { text: 'Angpao Digital', included: true },
        { text: 'Link Personal per Tamu', included: true },
        { text: 'Love Story', included: true },
        { text: 'Live Streaming', included: true },
        { text: 'Musik Latar', included: true },
        { text: 'Prioritas Support', included: true },
      ],
    },
  ];

  return (
    <section className="pricing-section">
      <p className="section-eyebrow">Harga</p>
      <h2 className="section-title">
        Pilih Paket yang Sesuai,
        <br />
        Mulai dari Rp 39.000
      </h2>
      <p className="pricing-sub">Bayar sekali, undangan aktif 90 hari. Tidak ada biaya tersembunyi.</p>

      <div className="pricing-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`pricing-card ${pkg.badge ? 'pricing-card--featured' : ''}`} style={pkg.badge ? { borderColor: pkg.colorDark } : {}}>
            {/* Badge populer */}
            {pkg.badge && (
              <div className="pricing-badge" style={{ background: pkg.colorDark }}>
                {pkg.badge}
              </div>
            )}

            {/* Header */}
            <div className="pricing-header" style={{ background: pkg.badge ? `linear-gradient(135deg, ${pkg.color}, ${pkg.colorDark})` : pkg.color }}>
              <p className="pricing-name" style={{ color: pkg.badge ? '#fff' : pkg.colorDark }}>
                {pkg.name}
              </p>
              <p className="pricing-price" style={{ color: pkg.badge ? '#fff' : pkg.colorDark }}>
                {pkg.price}
              </p>
              <p className="pricing-period" style={{ color: pkg.badge ? 'rgba(255,255,255,0.75)' : pkg.colorDark }}>
                {pkg.period}
              </p>
            </div>

            {/* Fitur */}
            <div className="pricing-features">
              {pkg.features.map((f) => (
                <div key={f.text} className="pricing-feature">
                  {f.included ? (
                    <svg className="pricing-check" style={{ color: pkg.colorDark }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="pricing-cross" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={f.included ? 'pricing-feature-text' : 'pricing-feature-text--off'}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Tombol WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${generateWAMessage(pkg.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pricing-btn"
              style={pkg.badge ? { background: `linear-gradient(135deg, ${pkg.color}, ${pkg.colorDark})`, color: '#fff' } : { background: pkg.color, color: pkg.colorDark }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pesan via WhatsApp
            </a>

            <p className="pricing-note">Pembayaran via transfer bank · Konfirmasi dalam 1x24 jam</p>
          </div>
        ))}
      </div>

      {/* FAQ singkat */}
      <div className="pricing-faq">
        {[
          { q: 'Bagaimana cara memesan?', a: 'Klik tombol WhatsApp, admin akan memandu proses pembuatan undangan dan pembayaran.' },
          { q: 'Metode pembayaran apa saja?', a: 'Transfer bank (BCA, Mandiri, BNI, BRI) dan dompet digital (GoPay, OVO, Dana).' },
          { q: 'Berapa lama proses pembuatan?', a: 'Undangan siap dalam 1-3 jam setelah pembayaran dikonfirmasi.' },
          { q: 'Apakah bisa ganti tema setelah jadi?', a: 'Bisa, hubungi admin via WhatsApp untuk request perubahan tema.' },
        ].map((item) => (
          <div key={item.q} className="pricing-faq-item">
            <p className="pricing-faq-q">✦ {item.q}</p>
            <p className="pricing-faq-a">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CSS — tambahkan di dalam tag <style> di app/page.tsx ─────────────────────
export const PRICING_STYLES = `
/* ── Pricing ── */
.pricing-section { padding: 6rem 4rem; background: var(--white); }
.pricing-sub {
  text-align: center; color: var(--lv-muted, #8b7fb5);
  font-size: 0.95rem; margin-top: -2.5rem; margin-bottom: 3rem;
}
.pricing-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem; max-width: 800px; margin: 0 auto;
}
.pricing-card {
  background: var(--white); border: 1.5px solid #DCD6F7;
  border-radius: 24px; overflow: hidden; position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pricing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(166,177,225,0.2); }
.pricing-card--featured { border-width: 2px; box-shadow: 0 8px 24px rgba(66,72,116,0.15); }

.pricing-badge {
  position: absolute; top: 1rem; right: 1rem;
  color: white; font-size: 0.72rem; font-weight: 700;
  padding: 0.3rem 0.85rem; border-radius: 100px;
  letter-spacing: 0.05em;
}
.pricing-header { padding: 2rem 2rem 1.5rem; }
.pricing-name { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.5rem; }
.pricing-price { font-family: var(--serif); font-size: 2.5rem; font-weight: 400; line-height: 1; margin-bottom: 0.25rem; }
.pricing-period { font-size: 0.8rem; opacity: 0.8; }

.pricing-features { padding: 1.5rem 2rem; border-top: 1px solid #F4EEFF; }
.pricing-feature { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.pricing-check { flex-shrink: 0; }
.pricing-cross { flex-shrink: 0; color: #cbd5e1; }
.pricing-feature-text { font-size: 0.875rem; color: #3d2c6e; }
.pricing-feature-text--off { font-size: 0.875rem; color: #cbd5e1; text-decoration: line-through; }

.pricing-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  margin: 0 2rem 1rem; padding: 0.9rem;
  border-radius: 100px; font-size: 0.9rem; font-weight: 600;
  text-decoration: none; transition: opacity 0.2s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.pricing-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.pricing-note { text-align: center; font-size: 0.72rem; color: #b8afd0; padding: 0 2rem 1.5rem; }

/* FAQ */
.pricing-faq {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem; max-width: 900px; margin: 4rem auto 0;
  padding-top: 3rem; border-top: 1px solid #F4EEFF;
}
.pricing-faq-item { }
.pricing-faq-q { font-size: 0.9rem; font-weight: 600; color: #3d2c6e; margin-bottom: 0.4rem; }
.pricing-faq-a { font-size: 0.85rem; color: #8b7fb5; line-height: 1.6; }

@media (max-width: 768px) {
  .pricing-section { padding: 4rem 1.5rem; }
  .pricing-grid { grid-template-columns: 1fr; max-width: 400px; }
}
`;
