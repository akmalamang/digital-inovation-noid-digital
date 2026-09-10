'use client';
// app/[slug]/themes/FloralGreenTemplate.tsx
// Tema 3: Floral Green — botanical sage green, bunga putih di sudut

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ── Types ──────────────────────────────────────────────────────────────────────
type WeddingDetail = {
  bridegroomName: string;
  bridegroomShortName: string;
  bridegroomParent: string;
  brideName: string;
  brideShortName: string;
  brideParent: string;
  akadDate: string;
  akadTime: string;
  akadLocation: string;
  akadMapsUrl?: string | null;
  receptionDate: string;
  receptionTime: string;
  receptionLocation: string;
  receptionMapsUrl?: string | null;
  loveStory?: string | null;
  liveStreamingUrl?: string | null;
};
type Gallery = { id: number; filePath: string; type: string };
type Wallet = { id: number; bankName: string; accountNumber: string; accountOwner: string };
type GuestBook = { id: number; guestName: string; rsvp: string; wishes: string; createdAt: string };
type Invitation = {
  id: number;
  slug: string;
  weddingDetail: WeddingDetail | null;
  galleries: Gallery[];
  digitalWallets: Wallet[];
  guestBooks: GuestBook[];
};

const rsvpLabel: Record<string, string> = {
  hadir: 'Hadir',
  tidak_hadir: 'Tidak Hadir',
  ragu_ragu: 'Ragu-ragu',
};

// ── Path aset — letakkan file di public/themes/floral-green/ ──────────────────
// Ganti path ini dengan file gambar kamu
const ASSETS = {
  flowerTopLeft: '/themes/floral-green/flower-top-left.png', // bunga putih pojok kiri atas
  flowerTopRight: '/themes/floral-green/flower-top-right.png', // bunga putih pojok kanan atas
  leafBottomLeft: '/themes/floral-green/leaf-bottom-left.png', // daun pojok kiri bawah
  leafBottomRight: '/themes/floral-green/leaf-bottom-right.png', // daun pojok kanan bawah
  leafBottomCenter: '/themes/floral-green/leaf-bottom-center.png', // daun bawah tengah
  divider: '/themes/floral-green/divider.png', // pemisah section (opsional)
};

// ── Dekorasi sudut cover ───────────────────────────────────────────────────────
function GreenCoverDecor() {
  return (
    <>
      {/* Bunga putih pojok kiri atas */}
      <img src={'/themes/floral-green/bunga-green-kiri-atas.png'} alt="" aria-hidden="true" className="fg-decor fg-decor-tl" />
      {/* Bunga putih pojok kanan atxas */}
      <img src={'/themes/floral-green/bunga-green-kanan-atas.png'} alt="" aria-hidden="true" className="fg-decor fg-decor-tr" />
      {/* Daun pojok kiri bawah */}
      <img src={'/themes/floral-green/bunga-green-bawah-kiri.png'} alt="" aria-hidden="true" className="fg-decor fg-decor-bl" />
      {/* Daun pojok kanan bawah */}
      <img src={'/themes/floral-green/bunga-green-bawah-kanan.png'} alt="" aria-hidden="true" className="fg-decor fg-decor-br" />
      {/* Daun bawah tengah */}
      <img src={'/themes/floral-green/bunga-green-bawah.png'} alt="" aria-hidden="true" className="fg-decor fg-decor-bc" />
    </>
  );
}

// Dekorasi sudut untuk section dalam (lebih minimal)
function GreenSectionDecor() {
  return (
    <>
      <img src={'/themes/floral-green/bunga-green-kiri-atas.png'} alt="" aria-hidden="true" className="fg-section-decor fg-section-tl" />
      <img src={'/themes/floral-green/bunga-green-kanan-atas.png'} alt="" aria-hidden="true" className="fg-section-decor fg-section-tr" />
    </>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function FloralGreenTemplate({ invitation }: { invitation: Invitation }) {
  const d = invitation.weddingDetail;
  const [opened, setOpened] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuestName(params.get('to') ?? '');
  }, []);

  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.fg-fade');
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('fg-visible');
          }),
        { threshold: 0.08 },
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 150);
    return () => clearTimeout(timer);
  }, [opened]);

  if (!d) {
    return (
      <div className="fg-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4a7c59' }}>Detail undangan belum tersedia.</p>
      </div>
    );
  }

  const sliderPhotos = invitation.galleries.filter((g) => g.type === 'slider');
  const galleryPhotos = invitation.galleries.filter((g) => g.type === 'gallery');
  const bgPhoto = invitation.galleries.find((g) => g.type === 'background');

  return (
    <>
      {!opened && <FGCover detail={d} guestName={guestName} bgPhoto={bgPhoto?.filePath} onOpen={() => setOpened(true)} />}

      {opened && (
        <div className="fg-wrap">
          <FGHero detail={d} sliderPhotos={sliderPhotos} />
          <FGCouple detail={d} />
          <FGCountdown detail={d} />
          <FGEvents detail={d} />
          {galleryPhotos.length > 0 && <FGGallery photos={galleryPhotos} />}
          {d.loveStory && <FGLoveStory story={d.loveStory} />}
          {d.liveStreamingUrl && <FGLiveStream url={d.liveStreamingUrl} />}
          {invitation.digitalWallets.length > 0 && <FGGift wallets={invitation.digitalWallets} />}
          <FGGuestBook invitationId={invitation.id} guestBooks={invitation.guestBooks} defaultName={guestName} />
          <FGFooter detail={d} />
        </div>
      )}

      <style>{FG_STYLES}</style>
    </>
  );
}

// ── Cover — sesuai design referensi ───────────────────────────────────────────
function FGCover({ detail, guestName, bgPhoto, onOpen }: { detail: WeddingDetail; guestName: string; bgPhoto?: string; onOpen: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Ganti dengan file musik kamu di public/music/
    const audio = new Audio('/music/wedding.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  function handleOpen() {
    if (audioRef.current && !muted) {
      audioRef.current.play().catch(() => {});
    }
    onOpen();
  }

  function toggleMute() {
    setMuted((m) => {
      if (audioRef.current) {
        audioRef.current.muted = !m;
        if (m) audioRef.current.play().catch(() => {});
      }
      return !m;
    });
  }

  return (
    <div className="fg-cover" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : {}}>
      {/* Overlay gelap kehijauan — sesuai design */}
      <div className="fg-cover-overlay" />

      {/* Dekorasi bunga & daun */}
      <GreenCoverDecor />

      {/* Tombol mute */}
      <button onClick={toggleMute} className="fg-mute">
        {muted ? '🔇' : '🎵'}
      </button>

      {/* Konten cover */}
      <div className="fg-cover-content">
        {/* "the wedding of" — font kecil italic */}
        <p className="fg-cover-sub">the wedding of</p>

        {/* Nama pasangan — font script besar */}
        <h1 className="fg-cover-names">
          {detail.brideShortName}
          <span className="fg-cover-amp"> & </span>
          {detail.bridegroomShortName}
        </h1>

        {/* Nama tamu */}
        {guestName && (
          <p className="fg-cover-guest">
            <span className="fg-cover-guest-label">nama tamu</span>
            <strong>{guestName}</strong>
          </p>
        )}

        {/* Tombol buka undangan — hijau sage rounded */}
        <button onClick={handleOpen} className="fg-cover-btn">
          Buka Undangan
        </button>
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function FGHero({ detail, sliderPhotos }: { detail: WeddingDetail; sliderPhotos: Gallery[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sliderPhotos.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % sliderPhotos.length), 4000);
    return () => clearInterval(t);
  }, [sliderPhotos.length]);

  const receptionDate = new Date(detail.receptionDate);

  return (
    <section className="fg-hero fg-fade">
      <GreenSectionDecor />
      {sliderPhotos.length > 0 ? (
        <div className="fg-slider">
          {sliderPhotos.map((p, i) => (
            <img key={p.id} src={p.filePath} alt="" className={`fg-slider-img ${i === current ? 'active' : ''}`} />
          ))}
          <div className="fg-slider-overlay" />
        </div>
      ) : (
        <div className="fg-slider fg-slider-placeholder" />
      )}
      <div className="fg-hero-content">
        <p className="fg-eyebrow">the wedding of</p>
        <h2 className="fg-hero-names">
          {detail.brideShortName}
          <em> & </em>
          {detail.bridegroomShortName}
        </h2>
        <p className="fg-hero-date">
          {receptionDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </section>
  );
}

// ── Couple ─────────────────────────────────────────────────────────────────────
function FGCouple({ detail }: { detail: WeddingDetail }) {
  return (
    <section className="fg-section fg-fade">
      <GreenSectionDecor />
      <p className="fg-section-eyebrow">~ Mempelai ~</p>
      <h2 className="fg-section-title">Bismillahirrahmanirrahim</h2>
      <p className="fg-section-sub">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>

      <div className="fg-couple-grid">
        <div className="fg-couple-card">
          <div className="fg-couple-icon">🌿</div>
          <h3 className="fg-couple-name">{detail.brideName}</h3>
          <p className="fg-couple-parent-label">Putri dari</p>
          <p className="fg-couple-parent">{detail.brideParent}</p>
        </div>

        <div className="fg-couple-divider">
          <div className="fg-divider-line" />
          <span className="fg-divider-icon">🌸</span>
          <div className="fg-divider-line" />
        </div>

        <div className="fg-couple-card">
          <div className="fg-couple-icon">🌿</div>
          <h3 className="fg-couple-name">{detail.bridegroomName}</h3>
          <p className="fg-couple-parent-label">Putra dari</p>
          <p className="fg-couple-parent">{detail.bridegroomParent}</p>
        </div>
      </div>
    </section>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function FGCountdown({ detail }: { detail: WeddingDetail }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(detail.receptionDate).getTime() - Date.now();
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [detail.receptionDate]);

  return (
    <section className="fg-countdown fg-fade">
      <GreenSectionDecor />
      <p className="fg-countdown-eyebrow">~ Menghitung Hari ~</p>
      <h2 className="fg-countdown-title">Menuju Hari Bahagia</h2>
      <div className="fg-countdown-grid">
        {[
          { val: time.days, label: 'Hari' },
          { val: time.hours, label: 'Jam' },
          { val: time.minutes, label: 'Menit' },
          { val: time.seconds, label: 'Detik' },
        ].map(({ val, label }) => (
          <div key={label} className="fg-countdown-box">
            <span className="fg-countdown-num">{String(val).padStart(2, '0')}</span>
            <span className="fg-countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Events ─────────────────────────────────────────────────────────────────────
function FGEvents({ detail }: { detail: WeddingDetail }) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <section className="fg-section fg-fade">
      <GreenSectionDecor />
      <p className="fg-section-eyebrow">~ Rangkaian Acara ~</p>
      <h2 className="fg-section-title">Jadwal Pernikahan</h2>
      <div className="fg-events-grid">
        <div className="fg-event-card">
          <div className="fg-event-badge">🌿 Akad Nikah</div>
          <p className="fg-event-date">{fmt(detail.akadDate)}</p>
          <p className="fg-event-time">{detail.akadTime} WIB</p>
          <p className="fg-event-loc">{detail.akadLocation}</p>
          {detail.akadMapsUrl && (
            <a href={detail.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="fg-maps-btn">
              📍 Lihat Lokasi
            </a>
          )}
        </div>
        <div className="fg-event-card">
          <div className="fg-event-badge">🌿 Resepsi</div>
          <p className="fg-event-date">{fmt(detail.receptionDate)}</p>
          <p className="fg-event-time">{detail.receptionTime} WIB</p>
          <p className="fg-event-loc">{detail.receptionLocation}</p>
          {detail.receptionMapsUrl && (
            <a href={detail.receptionMapsUrl} target="_blank" rel="noopener noreferrer" className="fg-maps-btn">
              📍 Lihat Lokasi
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────────
function FGGallery({ photos }: { photos: Gallery[] }) {
  return (
    <section className="fg-section fg-fade">
      <GreenSectionDecor />
      <p className="fg-section-eyebrow">~ Galeri ~</p>
      <h2 className="fg-section-title">Momen Bersama</h2>
      <div className="fg-gallery-grid">
        {photos.map((p, i) => (
          <div key={p.id} className={`fg-gallery-item ${i === 0 ? 'fg-gallery-wide' : ''}`}>
            <img src={p.filePath} alt="" className="fg-gallery-img" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Love Story ─────────────────────────────────────────────────────────────────
function FGLoveStory({ story }: { story: string }) {
  return (
    <section className="fg-countdown fg-fade">
      <GreenSectionDecor />
      <p className="fg-countdown-eyebrow">~ Our Story ~</p>
      <h2 className="fg-countdown-title">Perjalanan Cinta Kami</h2>
      <p className="fg-love-story">{story}</p>
    </section>
  );
}

// ── Live Stream ────────────────────────────────────────────────────────────────
function FGLiveStream({ url }: { url: string }) {
  return (
    <section className="fg-section fg-fade" style={{ textAlign: 'center' }}>
      <GreenSectionDecor />
      <p className="fg-section-eyebrow">~ Live Streaming ~</p>
      <h2 className="fg-section-title">Saksikan Secara Online</h2>
      <a href={url} target="_blank" rel="noopener noreferrer" className="fg-maps-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
        ▶ Tonton Live
      </a>
    </section>
  );
}

// ── Gift ───────────────────────────────────────────────────────────────────────
function FGGift({ wallets }: { wallets: Wallet[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="fg-section fg-fade">
      <GreenSectionDecor />
      <p className="fg-section-eyebrow">~ Kado Digital ~</p>
      <h2 className="fg-section-title">Kirim Hadiah</h2>
      <p className="fg-section-sub">Kehadiran dan doa restu Anda adalah hadiah terbaik bagi kami.</p>
      <div className="fg-gift-grid">
        {wallets.map((w) => (
          <div key={w.id} className="fg-gift-card">
            <p className="fg-gift-bank">{w.bankName}</p>
            <p className="fg-gift-number">{w.accountNumber}</p>
            <p className="fg-gift-owner">{w.accountOwner}</p>
            <button onClick={() => handleCopy(w.id, w.accountNumber)} className="fg-gift-copy">
              {copied === w.id ? '✓ Tersalin!' : 'Salin Nomor'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Guest Book ─────────────────────────────────────────────────────────────────
function FGGuestBook({ invitationId, guestBooks, defaultName }: { invitationId: number; guestBooks: GuestBook[]; defaultName: string }) {
  const [entries, setEntries] = useState(guestBooks);
  const [form, setForm] = useState({ guestName: defaultName, rsvp: 'hadir', wishes: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch('/api/guest-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries([data.data, ...entries]);
      setForm({ guestName: defaultName, rsvp: 'hadir', wishes: '' });
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    }
    setSending(false);
  }

  return (
    <section className="fg-section fg-fade">
      <GreenSectionDecor />
      <p className="fg-section-eyebrow">~ Buku Tamu ~</p>
      <h2 className="fg-section-title">Ucapan & Konfirmasi</h2>

      <form onSubmit={handleSubmit} className="fg-gb-form">
        {sent && <div className="fg-gb-success">✓ Ucapan terkirim! Terima kasih 🌿</div>}
        <input type="text" value={form.guestName} required placeholder="Nama kamu" onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} className="fg-gb-input" />
        <select value={form.rsvp} onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value }))} className="fg-gb-input">
          <option value="hadir">Insya Allah Hadir</option>
          <option value="tidak_hadir">Tidak Bisa Hadir</option>
          <option value="ragu_ragu">Masih Ragu-ragu</option>
        </select>
        <textarea value={form.wishes} required placeholder="Tulis ucapan dan doa untuk mempelai..." onChange={(e) => setForm((p) => ({ ...p, wishes: e.target.value }))} rows={3} className="fg-gb-input fg-gb-textarea" />
        <button type="submit" disabled={sending} className="fg-gb-btn">
          {sending ? 'Mengirim...' : '🌿 Kirim Ucapan'}
        </button>
      </form>

      {/* <div className="fg-gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7a9e7e', fontSize: '0.9rem' }}>Belum ada ucapan.</p>
        ) : (
          entries.map((g) => (
            <div key={g.id} className="fg-gb-entry">
              <div className="fg-gb-avatar">{g.guestName[0].toUpperCase()}</div>
              <div className="fg-gb-body">
                <div className="fg-gb-header">
                  <p className="fg-gb-name">{g.guestName}</p>
                  <span className={`fg-gb-rsvp fg-rsvp-${g.rsvp}`}>{rsvpLabel[g.rsvp]}</span>
                </div>
                <p className="fg-gb-wishes">{g.wishes}</p>
                <p className="fg-gb-time">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          ))
        )}
      </div> */}
      <div className="fg-gb-list">
        {entries.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: '#7a9e7e',
              fontSize: '0.9rem',
            }}
          >
            Belum ada ucapan.
          </p>
        ) : (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              768: {
                slidesPerView: 1,
              },
            }}
          >
            {Array.from({ length: Math.ceil(entries.length / 3) }, (_, pageIndex) => (
              <SwiperSlide key={pageIndex}>
                <div className="fg-gb-page">
                  {entries.slice(pageIndex * 3, pageIndex * 3 + 3).map((g) => (
                    <div key={g.id} className="fg-gb-entry">
                      <div className="fg-gb-avatar">{g.guestName[0].toUpperCase()}</div>

                      <div className="fg-gb-body">
                        <div className="fg-gb-header">
                          <p className="fg-gb-name">{g.guestName}</p>

                          <span className={`fg-gb-rsvp fg-rsvp-${g.rsvp}`}>{rsvpLabel[g.rsvp]}</span>
                        </div>

                        <p className="fg-gb-wishes">{g.wishes}</p>

                        <p className="fg-gb-time">
                          {new Date(g.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function FGFooter({ detail }: { detail: WeddingDetail }) {
  return (
    <footer className="fg-footer">
      <GreenSectionDecor />
      <p className="fg-footer-eyebrow">~ We're Getting Married ~</p>
      <h2 className="fg-footer-names">
        {detail.brideShortName} & {detail.bridegroomShortName}
      </h2>
      <p className="fg-footer-sub">Terima kasih telah menjadi bagian dari hari istimewa kami.</p>
      <p className="fg-footer-credit">Made with 🌿 · UndanganDigital</p>
    </footer>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const FG_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; max-width: 100%; }

:root {
  --fg-bg:       #f4f7f2;       /* background utama — hijau sangat pudar */
  --fg-bg2:      #e8f0e4;       /* background section alt */
  --fg-green:    #5c7a52;       /* hijau sage utama */
  --fg-green-d:  #4a6342;       /* hijau gelap */
  --fg-green-l:  #a8c4a0;       /* hijau muda */
  --fg-btn:      #6b8f5e;       /* warna tombol — sesuai design */
  --fg-btn-d:    #527045;       /* tombol hover */
  --fg-text:     #2d3d28;       /* teks utama — hijau sangat gelap */
  --fg-muted:    #6b7f65;       /* teks sekunder */
  --fg-white:    #ffffff;
  --fg-cream:    #fafdf8;
  --fg-script:   'Great Vibes', cursive;
  --fg-serif:    'Cormorant Garamond', Georgia, serif;
  --fg-sans:     'Inter', system-ui, sans-serif;
}

/* ── Base ── */
.fg-wrap { font-family: var(--fg-sans); background: var(--fg-bg); color: var(--fg-text); overflow-x: hidden; }

/* ── Fade animation ── */
.fg-fade { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
.fg-visible { opacity: 1; transform: none; }

/* ── Cover — sesuai design referensi ── */
.fg-cover {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #3d4f3a center/cover no-repeat; /* fallback sebelum foto background */
  position: relative; text-align: center; overflow: hidden;
}

/* Overlay gelap kehijauan — sesuai design */
.fg-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(30,42,28,0.35) 0%,
    rgba(20,30,18,0.5) 50%,
    rgba(30,42,28,0.7) 100%
  );
}

/* ── Dekorasi sudut cover ── */
.fg-decor {
  position: absolute; pointer-events: none; z-index: 10;
  object-fit: contain;
}
.fg-decor-tl  { top: 0; left: 0;   width: 180px; height: 180px; }
.fg-decor-tr  { top: 0; right: 0;  width: 200px; height: 200px; }
.fg-decor-bl  { bottom: 0px; left: 0;  width: 150px; height: 150px; }
.fg-decor-br  { bottom: 0px; right: 0; width: 150px; height: 150px; }
.fg-decor-bc  {
  bottom: 0; left: 50%; transform: translateX(-50%);
  width: 280px; height: 100px; object-fit: cover;
}

/* Dekorasi section dalam */
.fg-section-decor {
  position: absolute; pointer-events: none; z-index: 2;
  object-fit: contain; opacity: .7;
}
.fg-section-tl { top: 0; left: 0;  width: 120px; height: 120px; }
.fg-section-tr { top: 0; right: 0; width: 120px; height: 120px; }

/* Tombol mute */
.fg-mute {
  position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10;
  background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3); border-radius: 100px;
  color: white; font-size: 1rem; padding: 0.45rem 0.85rem;
  cursor: pointer; transition: background 0.2s;
}
.fg-mute:hover { background: rgba(255,255,255,0.35); }

/* ── Konten cover ── */
.fg-cover-content {
  position: relative; z-index: 4;
  padding: 2rem 2rem 8rem; /* padding bawah untuk beri ruang dekorasi daun */
  display: flex; flex-direction: column; align-items: center;
}

/* "the wedding of" */
.fg-cover-sub {
  font-family: var(--fg-serif); font-style: italic;
  font-size: 1.1rem; color: rgba(255,255,255,0.9);
  letter-spacing: 0.08em; margin-bottom: 0.5rem;
}

/* Nama pasangan — font script besar sesuai design */
.fg-cover-names {
  font-family: var(--fg-script);
  font-size: clamp(3.5rem, 12vw, 7rem);
  color: #ffffff;
  line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0,0,0,0.3);
  margin-bottom: 1.5rem;
}
.fg-cover-amp { color: rgba(255,255,255,0.9); }

/* Nama tamu */
.fg-cover-guest {
  display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
  margin-bottom: 2rem;
}
.fg-cover-guest-label {
  font-family: var(--fg-serif); font-style: italic;
  font-size: 0.9rem; color: rgba(255,255,255,0.7);
  letter-spacing: 0.05em;
}
.fg-cover-guest strong {
  font-family: var(--fg-serif); font-size: 1.2rem;
  color: rgba(255,255,255,0.95); font-weight: 400;
}

/* Tombol Buka Undangan — sesuai design: hijau sage, rounded besar */
.fg-cover-btn {
  background: var(--fg-btn);
  color: var(--fg-white);
  font-family: var(--fg-sans); font-size: 1.1rem; font-weight: 500;
  padding: 1rem 3.5rem;
  border-radius: 100px;
  border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  letter-spacing: 0.02em;
}
.fg-cover-btn:hover {
  background: var(--fg-btn-d);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.3);
}

/* ── Hero ── */
.fg-hero {
  position: relative; height: 90vh;
  display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
}
.fg-slider { position: absolute; inset: 0; }
.fg-slider-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease; }
.fg-slider-img.active { opacity: 1; }
.fg-slider-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(30,42,28,0.7) 0%, transparent 60%); }
.fg-slider-placeholder { background: linear-gradient(135deg, #3d4f3a, #5c7a52); }
.fg-hero-content { position: relative; z-index: 3; text-align: center; padding: 3rem 2rem; color: white; }
.fg-eyebrow { font-family: var(--fg-serif); font-style: italic; font-size: 1rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem; }
.fg-hero-names { font-family: var(--fg-script); font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; }
.fg-hero-names em { font-style: normal; color: var(--fg-green-l); }
.fg-hero-date { font-size: 0.9rem; color: rgba(255,255,255,0.75); margin-top: 0.75rem; }

/* ── Section ── */
.fg-section {
  padding: 5rem 2rem; max-width: 900px; margin: 0 auto;
  text-align: center; position: relative;
}
.fg-section-eyebrow { font-family: var(--fg-serif); font-style: italic; color: var(--fg-green); font-size: 1rem; margin-bottom: 0.5rem; }
.fg-section-title { font-family: var(--fg-serif); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; color: var(--fg-text); margin-bottom: 1rem; }
.fg-section-sub { color: var(--fg-muted); font-size: 0.95rem; line-height: 1.7; max-width: 540px; margin: 0 auto 2.5rem; }

/* ── Couple ── */
.fg-couple-grid { display: flex; align-items: center; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
.fg-couple-card { text-align: center; flex: 1; min-width: 200px; }
.fg-couple-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.fg-couple-name { font-family: var(--fg-script); font-size: 2rem; color: var(--fg-text); margin-bottom: 0.5rem; }
.fg-couple-parent-label { font-size: 0.8rem; color: var(--fg-muted); }
.fg-couple-parent { font-size: 0.95rem; color: var(--fg-text); font-weight: 500; }
.fg-couple-divider { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.fg-divider-line { width: 1px; height: 60px; background: linear-gradient(to bottom, transparent, var(--fg-green-l), transparent); }
.fg-divider-icon { font-size: 1.5rem; }

/* ── Countdown ── */
.fg-countdown { background: linear-gradient(135deg, #2d3d28, #3d4f3a); padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden; }
.fg-countdown-eyebrow { font-family: var(--fg-serif); font-style: italic; color: var(--fg-green-l); font-size: 1rem; margin-bottom: 0.5rem; }
.fg-countdown-title { font-family: var(--fg-serif); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; color: white; margin-bottom: 2.5rem; }
.fg-countdown-grid { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
.fg-countdown-box {
  background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
  border: 1px solid rgba(168,196,160,0.3); border-radius: 20px;
  padding: 1.5rem 1.75rem; min-width: 85px; text-align: center;
}
.fg-countdown-num { display: block; font-family: var(--fg-serif); font-size: 2.8rem; font-weight: 300; color: var(--fg-green-l); line-height: 1; }
.fg-countdown-label { display: block; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 0.4rem; }

/* ── Events ── */
.fg-events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
.fg-event-card { background: var(--fg-white); border: 1px solid rgba(92,122,82,0.2); border-radius: 24px; padding: 2rem; text-align: center; box-shadow: 0 4px 20px rgba(92,122,82,0.08); }
.fg-event-badge { font-size: 0.9rem; color: var(--fg-green); font-weight: 600; margin-bottom: 1rem; }
.fg-event-date { font-family: var(--fg-serif); font-size: 1rem; color: var(--fg-text); margin-bottom: 0.25rem; }
.fg-event-time { font-size: 1.5rem; font-weight: 700; color: var(--fg-green); margin-bottom: 0.75rem; }
.fg-event-loc { font-size: 0.85rem; color: var(--fg-muted); line-height: 1.5; margin-bottom: 1rem; }
.fg-maps-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: var(--fg-btn); color: white;
  font-size: 0.8rem; font-weight: 500;
  padding: 0.5rem 1.25rem; border-radius: 100px; text-decoration: none;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 3px 10px rgba(92,122,82,0.3);
}
.fg-maps-btn:hover { background: var(--fg-btn-d); transform: translateY(-1px); }

/* ── Gallery ── */
.fg-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-top: 2rem; }
.fg-gallery-item { border-radius: 16px; overflow: hidden; aspect-ratio: 1; }
.fg-gallery-wide { grid-column: span 2; aspect-ratio: 2/1; }
.fg-gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.fg-gallery-img:hover { transform: scale(1.05); }

/* ── Love Story ── */
.fg-love-story { color: rgba(255,255,255,0.75); font-size: 1rem; line-height: 1.9; max-width: 580px; margin: 2rem auto 0; font-style: italic; }

/* ── Gift ── */
.fg-gift-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1rem; margin-top: 2rem; }
.fg-gift-card { background: var(--fg-white); border: 1px solid rgba(92,122,82,0.2); border-radius: 20px; padding: 1.5rem; text-align: center; }
.fg-gift-bank { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--fg-green); margin-bottom: 0.5rem; }
.fg-gift-number { font-family: monospace; font-size: 1.3rem; font-weight: 700; color: var(--fg-text); margin-bottom: 0.25rem; }
.fg-gift-owner { font-size: 0.85rem; color: var(--fg-muted); margin-bottom: 1rem; }
.fg-gift-copy { background: var(--fg-btn); color: white; border: none; border-radius: 100px; padding: 0.45rem 1.2rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.fg-gift-copy:hover { background: var(--fg-btn-d); }

/* ── Guest Book ── */
.fg-gb-form { background: var(--fg-white); border: 1px solid rgba(92,122,82,0.2); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(92,122,82,0.08); }
.fg-gb-success { background: #e8f5e9; color: var(--fg-green-d); border: 1px solid rgba(92,122,82,0.3); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1rem; }
.fg-gb-input { display: block; width: 100%; border: 1.5px solid rgba(92,122,82,0.2); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9rem; font-family: var(--fg-sans); margin-bottom: 0.75rem; outline: none; transition: border-color 0.2s; background: var(--fg-bg); color: var(--fg-text); }
.fg-gb-input:focus { border-color: var(--fg-green); }
.fg-gb-textarea { resize: none; }
.fg-gb-btn { width: 100%; background: var(--fg-btn); color: white; border: none; border-radius: 100px; padding: 0.85rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s; }
.fg-gb-btn:hover { background: var(--fg-btn-d); transform: translateY(-1px); }
.fg-gb-btn:disabled { opacity: 0.6; }
.fg-gb-list { display: flex; flex-direction: column; gap: 1rem; }
.fg-gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--fg-white); border-radius: 16px; padding: 1rem 1.25rem; border: 1px solid rgba(92,122,82,0.15); }
.fg-gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--fg-green), var(--fg-green-d)); color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fg-gb-body { flex: 1; }
.fg-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.fg-gb-name { font-weight: 600; font-size: 0.9rem; color: var(--fg-text); }
.fg-gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.fg-rsvp-hadir { background: #e8f5e9; color: var(--fg-green-d); }
.fg-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.fg-rsvp-ragu_ragu { background: #fffbeb; color: #92400e; }
.fg-gb-wishes { font-size: 0.875rem; color: var(--fg-muted); line-height: 1.6; }
.fg-gb-time { font-size: 0.75rem; color: #9aaf94; margin-top: 0.4rem; }

/* ===== Swiper Guest Book ===== */
.fg-gb-page{
    display:flex;
    flex-direction:column;
    gap:1rem;
    padding-bottom:3rem;
}
.fg-gb-list .swiper{
    width:100%;
}
.fg-gb-list .swiper-slide{
    height:auto;
}
.fg-gb-list .swiper-button-next,
.fg-gb-list .swiper-button-prev{
    color:var(--fg-green);
    transform:scale(.75);
}
.fg-gb-list .swiper-button-next:hover,
.fg-gb-list .swiper-button-prev:hover{
    color:var(--fg-green-d);
}
.fg-gb-list .swiper-pagination-bullet{
    background:#bfd4be;
    opacity:1;
}
.fg-gb-list .swiper-pagination-bullet-active{
    background:var(--fg-green);
}
    
/* ── Footer ── */
.fg-footer { background: linear-gradient(135deg, #2d3d28, #3d4f3a); padding: 6rem 2rem; text-align: center; position: relative; overflow: hidden; }
.fg-footer-eyebrow { font-family: var(--fg-serif); font-style: italic; color: var(--fg-green-l); font-size: 1rem; margin-bottom: 1rem; }
.fg-footer-names { font-family: var(--fg-script); font-size: clamp(2.5rem, 7vw, 4.5rem); color: white; margin-bottom: 1rem; }
.fg-footer-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-bottom: 2rem; }
.fg-footer-credit { color: var(--fg-green-l); font-size: 0.8rem; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .fg-decor-tl  { width: 110px; height: 110px; }
  .fg-decor-tr  { width: 120px; height: 120px; }
  .fg-decor-bl, .fg-decor-br { width: 90px; height: 90px; }
  .fg-decor-bc  { width: 200px; }
  .fg-couple-grid { flex-direction: column; }
  .fg-couple-divider { flex-direction: row; }
  .fg-divider-line { width: 60px; height: 1px; }
  .fg-gallery-grid { grid-template-columns: repeat(2,1fr); }
  .fg-gallery-wide { grid-column: span 2; }
  .fg-countdown-grid { gap: 0.75rem; }
  .fg-countdown-box { padding: 1rem 1.25rem; min-width: 70px; }
  .fg-countdown-num { font-size: 2rem; }
  .fg-section { padding: 3.5rem 1.5rem; }
  .fg-cover-names { font-size: clamp(3rem, 14vw, 5rem); }
}
`;
