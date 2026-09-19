// app/page.tsx
// Landing page — palette lavender F4EEFF / A6B1E1 / DCD6F7
// Bunga di pojok kanan atas dan kiri atas (aset dari user)

import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PRICING_STYLES, PricingSection } from './PricingSection';
import ThemeGallery from './ThemeGallery';

// ── Path aset bunga — letakkan file di public/landing/ ───────────────────────
// Ganti dengan file gambar bunga kamu
const FLOWER_TOP_LEFT = '/landing/bunga-lavender.png';
const FLOWER_TOP_RIGHT = '/landing/bunga-lavender-2.png';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.user.role === 'admin') redirect('/admin');
    else redirect('/dashboard');
  }

  // Fetch tema untuk section preview
  const themes = await prisma.theme.findMany({ orderBy: { id: 'asc' } });

  return (
    <main className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-rings" aria-hidden="true">
            <span className="brand-ring" />
            <span className="brand-ring brand-ring--2" />
          </span>
          Undangan<em>Digital</em>
        </div>
        <div className="nav-actions">
          <Link href="/auth/login" className="btn-ghost">
            Masuk
          </Link>
          <Link href="/auth/register" className="btn-primary">
            Mulai Gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        {/* Bunga pojok kiri atas */}
        <img src={FLOWER_TOP_LEFT} alt="" aria-hidden="true" className="hero-flower hero-flower--tl" />
        {/* Bunga pojok kanan atas */}
        <img src={FLOWER_TOP_RIGHT} alt="" aria-hidden="true" className="hero-flower hero-flower--tr" />

        {/* Orbs dekoratif */}
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />

        <div className="hero-content">
          <p className="hero-eyebrow">✦ Platform Undangan Pernikahan Digital ✦</p>
          <h1 className="hero-title">
            Ceritakan Cinta
            <br />
            <em>Tanpa Batas</em>
          </h1>
          <p className="hero-desc">Buat undangan pernikahan digital yang elegan, personal, dan mudah dibagikan ke semua tamu — dalam hitungan menit.</p>
          <div className="hero-cta">
            <Link href="/auth/register" className="btn-primary btn-lg">
              Buat Undangan Sekarang
            </Link>
            <Link href="/auth/login" className="btn-outline btn-lg">
              Sudah punya akun
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            {[
              { val: '3+', label: 'Tema Eksklusif' },
              { val: '100%', label: 'Gratis Daftar' },
              { val: 'Real-time', label: 'RSVP & Ucapan' },
            ].map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-val">{s.val}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fitur ── */}
      <section className="features">
        <p className="section-eyebrow">Mengapa Kami</p>
        <h2 className="section-title">
          Semua yang kamu butuhkan,
          <br />
          sudah tersedia
        </h2>

        <div className="features-grid">
          {[
            { icon: '✦', title: 'Tema Elegan', desc: 'Pilih dari koleksi tema premium yang dirancang khusus untuk pernikahan modern dan tradisional.' },
            { icon: '◈', title: 'RSVP Real-time', desc: 'Tamu konfirmasi kehadiran langsung dari undangan. Kamu pantau dari dashboard kapan saja.' },
            { icon: '❋', title: 'Galeri Foto', desc: 'Tampilkan momen prewedding terbaik dalam galeri yang indah dan responsif di semua perangkat.' },
            { icon: '◇', title: 'Angpao Digital', desc: 'Terima kado digital lewat transfer bank atau dompet digital yang terintegrasi rapi.' },
            { icon: '✿', title: 'Love Story', desc: 'Ceritakan perjalanan cinta kalian dengan halaman story yang menyentuh hati para tamu.' },
            { icon: '⊕', title: 'Live Streaming', desc: 'Sambungkan link live streaming agar tamu yang jauh tetap bisa menyaksikan momen sakral.' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tema Tersedia ── */}
      {themes.length > 0 && (
        <section className="themes-section">
          <p className="section-eyebrow">Koleksi Tema</p>
          <h2 className="section-title">
            Pilih Tema Favoritmu,
            <br />
            Sesuai Gaya Pernikahanmu
          </h2>

          {/* <div className="themes-grid">
            {themes.map((theme) => {
              const images: string[] = (theme as any).thumbnails ? JSON.parse((theme as any).thumbnails) : theme.thumbnail ? [theme.thumbnail] : [];

              return (
                <div key={theme.id} className="theme-card">
                  <div className="theme-card-img-wrap">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={theme.themeName} className="theme-card-img" />
                    ) : (
                      <div className="theme-card-placeholder">
                        <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="theme-card-overlay">
                      <span className="theme-card-overlay-text">Lihat Tema</span>
                    </div>
                  </div>
                  <div className="theme-card-info">
                    <p className="theme-card-name">{theme.themeName}</p>
                    {images.length > 1 && <p className="theme-card-count">{images.length} foto preview</p>}
                  </div>
                </div>
              );
            })}
          </div> */}

          <ThemeGallery themes={themes} />

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/auth/register" className="btn-primary btn-lg">
              Mulai Buat Undangan →
            </Link>
          </div>
        </section>
      )}

      {/* ── Cara Kerja ── */}
      <section className="how">
        <p className="section-eyebrow">Cara Kerja</p>
        <h2 className="section-title">
          Tiga langkah,
          <br />
          undangan siap dibagikan
        </h2>

        <div className="steps">
          {[
            { step: '01', title: 'Daftar & Pilih Tema', desc: 'Buat akun gratis, lalu pilih tema yang paling cocok dengan konsep pernikahanmu.' },
            { step: '02', title: 'Isi Detail Pernikahan', desc: 'Masukkan nama, tanggal, lokasi akad dan resepsi, serta foto-foto terbaik kalian.' },
            { step: '03', title: 'Bagikan ke Tamu', desc: 'Salin link undangan dan bagikan lewat WhatsApp, Instagram, atau media apapun.' },
          ].map((s) => (
            <div key={s.step} className="step">
              <span className="step-num">{s.step}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />

      {/* ── CTA Bottom ── */}
      <section className="cta-bottom">
        {/* Bunga di sudut CTA juga */}
        <img src={FLOWER_TOP_LEFT} alt="" aria-hidden="true" className="cta-flower cta-flower--tl" />
        <img src={FLOWER_TOP_RIGHT} alt="" aria-hidden="true" className="cta-flower cta-flower--tr" />

        <div className="cta-orb cta-orb-1" aria-hidden="true" />
        <div className="cta-orb cta-orb-2" aria-hidden="true" />

        <div className="cta-content">
          <h2 className="cta-title">Siap memulai?</h2>
          <p className="cta-desc">Bergabung dengan ribuan pasangan yang sudah mempercayakan momen spesial mereka.</p>
          <Link href="/auth/register" className="btn-white btn-lg">
            Daftar Sekarang — Gratis
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>© 2026 UndanganDigital. Dibuat dengan ♥ untuk setiap pasangan.</p>
      </footer>

      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; }

        /* ── Token warna lavender ── */
        :root {
          --lv-lightest: #F4EEFF;   /* background utama */
          --lv-light:    #DCD6F7;   /* card, hover ringan */
          --lv-mid:      #A6B1E1;   /* aksen, border, tombol */
          --lv-dark:     #6b72b8;   /* tombol hover */
          --lv-deep:     #3d2c6e;   /* teks heading */
          --lv-text:     #4a3f6b;   /* teks body */
          --lv-muted:    #8b7fb5;   /* teks sekunder */
          --white:       #ffffff;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans:  'Inter', system-ui, sans-serif;
        }

        /* ── Base ── */
        .landing { font-family: var(--sans); background: var(--lv-lightest); color: var(--lv-text); overflow-x: hidden; }

        /* ── Navbar ── */
        .landing-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 4rem;
          background: rgba(244,238,255,0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(166,177,225,0.25);
        }
        .nav-brand {
          font-family: var(--serif); font-size: 1.4rem; font-weight: 300;
          letter-spacing: 0.02em; color: var(--lv-deep);
          display: flex; align-items: center; gap: 0.6rem;
        }
        .nav-brand em { font-style: italic; color: var(--lv-mid); }
        .brand-rings { display: flex; align-items: center; }
        .brand-ring {
          display: inline-block; width: 13px; height: 13px;
          border-radius: 50%; border: 1.5px solid var(--lv-mid);
        }
        .brand-ring--2 { margin-left: -5px; border-color: var(--lv-deep); }
        .nav-actions { display: flex; align-items: center; gap: 0.75rem; }

        /* ── Buttons ── */
        .btn-ghost {
          font-size: 0.875rem; font-weight: 500; color: var(--lv-deep);
          text-decoration: none; padding: 0.5rem 1.25rem;
          border-radius: 100px; transition: background 0.2s;
        }
        .btn-ghost:hover { background: rgba(166,177,225,0.15); }

        .btn-primary {
          font-size: 0.875rem; font-weight: 600; color: var(--white);
          text-decoration: none; display: inline-block;
          background: linear-gradient(135deg, var(--lv-mid), var(--lv-dark));
          padding: 0.55rem 1.4rem; border-radius: 100px;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(166,177,225,0.4);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(166,177,225,0.5); }
        .btn-primary.btn-lg { font-size: 1rem; padding: 0.85rem 2.2rem; }

        .btn-outline {
          font-size: 1rem; font-weight: 500; color: var(--lv-deep);
          text-decoration: none; display: inline-block;
          border: 1.5px solid var(--lv-light); padding: 0.8rem 2rem;
          border-radius: 100px; transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-outline:hover { border-color: var(--lv-mid); color: var(--lv-dark); transform: translateY(-1px); }
        .btn-outline.btn-lg { padding: 0.85rem 2.2rem; }

        .btn-white {
          font-size: 1rem; font-weight: 600; color: var(--lv-deep);
          text-decoration: none; display: inline-block;
          background: var(--white); padding: 0.85rem 2.4rem;
          border-radius: 100px;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.12); }
        .btn-white.btn-lg { padding: 0.95rem 2.6rem; font-size: 1.05rem; }

        /* ── Hero ── */
        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          position: relative; padding: 8rem 2rem 5rem; text-align: center;
          overflow: hidden;
          background: radial-gradient(ellipse at top, #DCD6F7 0%, #F4EEFF 60%);
        }

        /* Bunga sudut hero */
        .hero-flower {
          position: absolute; pointer-events: none; z-index: 2;
          width: 220px; height: 220px; object-fit: contain;
        }
        .hero-flower--tl { top: 0; left: 0; }
        .hero-flower--tr { top: 0; right: 0; transform: scaleX(-1); }

        /* Orbs dekoratif */
        .hero-orb {
          position: absolute; border-radius: 50%;
          background: rgba(166,177,225,0.15);
          pointer-events: none;
        }
        .hero-orb-1 { width: 400px; height: 400px; top: -100px; left: -100px; }
        .hero-orb-2 { width: 300px; height: 300px; bottom: -80px; right: -80px; }
        .hero-orb-3 { width: 200px; height: 200px; top: 30%; left: 50%; transform: translateX(-50%); background: rgba(220,214,247,0.2); }

        .hero-content { position: relative; z-index: 3; max-width: 680px; }
        .hero-eyebrow {
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--lv-mid);
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-family: var(--serif); font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 300; line-height: 1.1; color: var(--lv-deep);
          margin-bottom: 1.5rem;
        }
        .hero-title em { font-style: italic; color: var(--lv-mid); }
        .hero-desc {
          font-size: 1.05rem; line-height: 1.75; color: var(--lv-muted);
          max-width: 480px; margin: 0 auto 2.5rem;
        }
        .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }

        /* Stats */
        .hero-stats {
          display: flex; justify-content: center; gap: 2.5rem; flex-wrap: wrap;
          border-top: 1px solid rgba(166,177,225,0.25);
          padding-top: 2rem;
        }
        .hero-stat { text-align: center; }
        .hero-stat-val { display: block; font-family: var(--serif); font-size: 1.8rem; font-weight: 400; color: var(--lv-deep); }
        .hero-stat-label { display: block; font-size: 0.78rem; color: var(--lv-muted); margin-top: 0.2rem; }

        /* ── Section shared ── */
        .section-eyebrow {
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--lv-mid);
          margin-bottom: 0.75rem; text-align: center;
        }
        .section-title {
          font-family: var(--serif); font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 300; line-height: 1.2; text-align: center;
          color: var(--lv-deep); margin-bottom: 3.5rem;
        }

        /* ── Features ── */
        .features { padding: 6rem 4rem; background: var(--white); }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem; max-width: 1100px; margin: 0 auto;
        }
        .feature-card {
          padding: 2rem; border: 1px solid var(--lv-light);
          border-radius: 20px; background: var(--lv-lightest);
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover {
          border-color: var(--lv-mid); transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(166,177,225,0.2);
        }
        .feature-icon { font-size: 1.5rem; color: var(--lv-mid); display: block; margin-bottom: 1rem; }
        .feature-title { font-family: var(--serif); font-size: 1.3rem; font-weight: 400; color: var(--lv-deep); margin-bottom: 0.6rem; }
        .feature-desc { font-size: 0.9rem; color: var(--lv-muted); line-height: 1.65; }

        /* ── Themes ── */
        .themes-section { padding: 6rem 4rem; background: var(--lv-lightest); }
        .themes-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem; max-width: 1100px; margin: 0 auto;
        }
       
        
        .theme-card:hover .theme-card-overlay { background: rgba(61,44,110,0.35); }
        .theme-card-overlay-text {
          color: white; font-size: 0.9rem; font-weight: 600;
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.3s, transform 0.3s;
        }
        .theme-card:hover .theme-card-overlay-text { opacity: 1; transform: translateY(0); }
        .theme-card-info { padding: 1.25rem 1.5rem; }
        .theme-card-name { font-family: var(--serif); font-size: 1.2rem; font-weight: 400; color: var(--lv-deep); }
        .theme-card-count { font-size: 0.8rem; color: var(--lv-muted); margin-top: 0.25rem; }

        /* ── How ── */
        .how { padding: 6rem 4rem; background: var(--lv-light); }
        .steps {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 3rem; max-width: 900px; margin: 0 auto;
        }
        .step { text-align: center; }
        .step-num {
          font-family: var(--serif); font-size: 3.5rem; font-weight: 300;
          color: rgba(166,177,225,0.5); line-height: 1; display: block; margin-bottom: 1rem;
        }
        .step-title { font-family: var(--serif); font-size: 1.4rem; font-weight: 400; color: var(--lv-deep); margin-bottom: 0.75rem; }
        .step-desc { font-size: 0.9rem; color: var(--lv-muted); line-height: 1.65; }

        /* ── CTA Bottom ── */
        .cta-bottom {
          padding: 7rem 2rem; text-align: center;
          background: linear-gradient(135deg, var(--lv-mid) 0%, #8a96d4 100%);
          position: relative; overflow: hidden;
        }
        .cta-flower {
          position: absolute; pointer-events: none; z-index: 2;
          width: 180px; height: 180px; object-fit: contain;
          opacity: 0.5;
        }
        .cta-flower--tl { top: 0; left: 0; }
        .cta-flower--tr { top: 0; right: 0; transform: scaleX(-1); }
        .cta-orb { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); pointer-events: none; }
        .cta-orb-1 { width: 400px; height: 400px; top: -150px; left: -100px; }
        .cta-orb-2 { width: 300px; height: 300px; bottom: -100px; right: -80px; }
        .cta-content { position: relative; z-index: 3; }
        .cta-title {
          font-family: var(--serif); font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 300; color: var(--white); margin-bottom: 1rem;
        }
        .cta-desc { color: rgba(255,255,255,0.8); margin-bottom: 2.5rem; font-size: 1rem; }

        /* ── Footer ── */
        .landing-footer {
          background: var(--lv-deep); padding: 1.75rem; text-align: center;
          color: rgba(255,255,255,0.3); font-size: 0.8rem;
        }


        /* pricing style 
        ${PRICING_STYLES}

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .landing-nav { padding: 1rem 1.5rem; }
          .hero-flower { width: 130px; height: 130px; }
          .features { padding: 4rem 1.5rem; }
          .themes-section { padding: 4rem 1.5rem; }
          .how { padding: 4rem 1.5rem; }
          .steps { gap: 2rem; }
          .cta-flower { width: 110px; height: 110px; }
          .btn-primary {font-size: .7rem}
          .nav-brand {font-size : 1rem}
          btn-ghost { font-size : 1rem }
        }

        @media (max-width: 380px){
        .btn-primary {font-size: .5rem; padding: 0.5rem}
        }
      `}</style>
    </main>
  );
}
