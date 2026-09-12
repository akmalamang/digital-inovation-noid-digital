'use client';
// app/[slug]/themes/LavenderTemplate.tsx
// Tema 4: Lavender Bloom — #424874 / #A6B1E1 / #DCD6F7 / #F4EEFF

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
  akadDate: Date;
  akadTime: string;
  akadLocation: string;
  akadMapsUrl?: string | null;
  receptionDate: Date;
  receptionTime: string;
  receptionLocation: string;
  receptionMapsUrl?: string | null;
  loveStory?: string | null;
  liveStreamingUrl?: string | null;
};
type Gallery = { id: number; filePath: string; type: string };
type Wallet = { id: number; bankName: string; accountNumber: string; accountOwner: string };
type GuestBook = { id: number; guestName: string; rsvp: string; wishes: string; createdAt: Date };
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

// ── Path aset bunga lavender — letakkan di public/themes/lavender/ ────────────
const ASSETS = {
  flowerTopLeft: '/themes/lavender/bunga-lavender.png',
  flowerTopRight: '/themes/lavender/bunga-lavender-2.png',
  flowerBottomLeft: '/themes/lavender/bunga-lavender-2.png',
  flowerBottomRight: '/themes/lavender/bunga-lavender.png',
  divider: '/themes/lavender/bunga-lavender-3.png',
};

// ── Dekorasi bunga sudut ───────────────────────────────────────────────────────
function LvCorners({ opacity = 1 }: { opacity?: number }) {
  return (
    <>
      <img src={ASSETS.flowerTopLeft} alt="" aria-hidden="true" className="lv-corner lv-corner-tl" />
      <img src={ASSETS.flowerTopRight} alt="" aria-hidden="true" className="lv-corner lv-corner-tr" />
      <img src={ASSETS.flowerBottomLeft} alt="" aria-hidden="true" className="lv-corner lv-corner-bl" />
      <img src={ASSETS.flowerBottomRight} alt="" aria-hidden="true" className="lv-corner lv-corner-br" />
    </>
  );
}

// ── Divider bunga ─────────────────────────────────────────────────────────────
function LvDivider() {
  return (
    <div className="lv-divider-wrap">
      <div className="lv-divider-line" />
      <img src={ASSETS.divider} alt="" aria-hidden="true" className="lv-divider-img" />
      <div className="lv-divider-line" />
    </div>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function LavenderTemplate({ invitation }: { invitation: Invitation }) {
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
      const els = document.querySelectorAll('.lv-fade');
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('lv-visible');
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
      <div className="lv-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#424874' }}>Detail undangan belum tersedia.</p>
      </div>
    );
  }

  const sliderPhotos = invitation.galleries.filter((g) => g.type === 'slider');
  const galleryPhotos = invitation.galleries.filter((g) => g.type === 'gallery');
  const bgPhoto = invitation.galleries.find((g) => g.type === 'background');

  return (
    <>
      {!opened && <LvCover detail={d} guestName={guestName} bgPhoto={bgPhoto?.filePath} onOpen={() => setOpened(true)} />}
      {opened && (
        <div className="lv-wrap">
          <LvHero detail={d} sliderPhotos={sliderPhotos} />
          <LvCouple detail={d} />
          <LvCountdown detail={d} />
          <LvEvents detail={d} />
          {galleryPhotos.length > 0 && <LvGallery photos={galleryPhotos} />}
          {d.loveStory && <LvLoveStory story={d.loveStory} />}
          {d.liveStreamingUrl && <LvLiveStream url={d.liveStreamingUrl} />}
          {invitation.digitalWallets.length > 0 && <LvGift wallets={invitation.digitalWallets} />}
          <LvGuestBook invitationId={invitation.id} guestBooks={invitation.guestBooks} defaultName={guestName} />
          <LvFooter detail={d} />
        </div>
      )}
      <style>{LV_STYLES}</style>
    </>
  );
}

// ── Cover ──────────────────────────────────────────────────────────────────────
function LvCover({ detail, guestName, bgPhoto, onOpen }: { detail: WeddingDetail; guestName: string; bgPhoto?: string; onOpen: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [petals, setPetals] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 7}s`,
        duration: `${5 + Math.random() * 6}s`,
        size: `${0.7 + Math.random() * 1}rem`,
      })),
    );

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
    if (audioRef.current && !muted) audioRef.current.play().catch(() => {});

    // Konfetti lavender
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
    script.onload = () => {
      const confetti = (window as any).confetti;
      if (!confetti) return;
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.9 }, colors: ['#DCD6F7', '#A6B1E1', '#ffffff', '#424874'] });
      setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.9 }, colors: ['#DCD6F7', '#A6B1E1', '#ffffff', '#F4EEFF'] }), 200);
      setTimeout(() => confetti({ particleCount: 150, spread: 120, origin: { x: 0.5, y: 0.6 }, colors: ['#DCD6F7', '#A6B1E1', '#ffffff', '#424874'] }), 400);
    };
    if ((window as any).confetti) {
      script.onload(new Event('load'));
    } else document.head.appendChild(script);

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
    <div className="lv-cover" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : {}}>
      <div className="lv-cover-overlay" />
      <LvCorners opacity={0.9} />

      {/* Petals jatuh */}
      {petals.length > 0 && (
        <div className="lv-petals" aria-hidden="true">
          {petals.map((p) => (
            <span
              key={p.id}
              className="lv-petal"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                fontSize: p.size,
              }}
            >
              🌸
            </span>
          ))}
        </div>
      )}

      {/* Mute */}
      <button onClick={toggleMute} className="lv-mute">
        {muted ? '🔇' : '🎵'}
      </button>

      <div className="lv-cover-content">
        <p className="lv-cover-eyebrow">~ Undangan Pernikahan ~</p>

        {/* Ornamen atas nama */}
        <div className="lv-cover-ornament">✦ ❧ ✦</div>

        <h1 className="lv-cover-names">
          {detail.brideShortName}
          <span className="lv-cover-amp"> & </span>
          {detail.bridegroomShortName}
        </h1>

        <div className="lv-cover-ornament">✦ ❧ ✦</div>

        <p className="lv-cover-date">
          {new Date(detail.receptionDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {guestName && (
          <div className="lv-cover-guest">
            <p className="lv-cover-guest-label">Kepada Yth.</p>
            <p className="lv-cover-guest-name">{guestName}</p>
          </div>
        )}

        <button onClick={handleOpen} className="lv-cover-btn">
          💌 Buka Undangan
        </button>
        <p className="lv-cover-scroll">~ scroll untuk membuka ~</p>
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function LvHero({ detail, sliderPhotos }: { detail: WeddingDetail; sliderPhotos: Gallery[] }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (sliderPhotos.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % sliderPhotos.length), 4000);
    return () => clearInterval(t);
  }, [sliderPhotos.length]);

  return (
    <section className="lv-hero lv-fade">
      <LvCorners opacity={0.3} />
      {sliderPhotos.length > 0 ? (
        <div className="lv-slider">
          {sliderPhotos.map((p, i) => (
            <img key={p.id} src={p.filePath} alt="" className={`lv-slider-img ${i === current ? 'active' : ''}`} />
          ))}
          <div className="lv-slider-overlay" />
        </div>
      ) : (
        <div className="lv-slider lv-slider-placeholder" />
      )}
      <div className="lv-hero-content">
        <p className="lv-eyebrow">The Wedding of</p>
        <h2 className="lv-hero-names">
          {detail.brideShortName}
          <em> & </em>
          {detail.bridegroomShortName}
        </h2>
        <p className="lv-hero-date">
          {new Date(detail.receptionDate).toLocaleDateString('id-ID', {
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
function LvCouple({ detail }: { detail: WeddingDetail }) {
  return (
    <section className="lv-section lv-fade">
      <LvCorners opacity={0.15} />
      <p className="lv-eyebrow">~ Mempelai ~</p>
      <h2 className="lv-section-title">Bismillahirrahmanirrahim</h2>
      <p className="lv-section-sub">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>
      <LvDivider />
      <div className="lv-couple-grid">
        <div className="lv-couple-card">
          <div className="lv-couple-icon">💜</div>
          <h3 className="lv-couple-name">{detail.brideName}</h3>
          <p className="lv-couple-parent-label">Putri dari</p>
          <p className="lv-couple-parent">{detail.brideParent}</p>
        </div>
        <div className="lv-couple-divider">
          <div className="lv-divider-vert" />
          <span className="lv-divider-heart">🌸</span>
          <div className="lv-divider-vert" />
        </div>
        <div className="lv-couple-card">
          <div className="lv-couple-icon">💜</div>
          <h3 className="lv-couple-name">{detail.bridegroomName}</h3>
          <p className="lv-couple-parent-label">Putra dari</p>
          <p className="lv-couple-parent">{detail.bridegroomParent}</p>
        </div>
      </div>
      <LvDivider />
    </section>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function LvCountdown({ detail }: { detail: WeddingDetail }) {
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
    <section className="lv-countdown lv-fade">
      <LvCorners opacity={0.2} />
      <p className="lv-eyebrow lv-eyebrow-light">~ Menghitung Hari ~</p>
      <h2 className="lv-countdown-title">Menuju Hari Bahagia</h2>
      <div className="lv-countdown-grid">
        {[
          { val: time.days, label: 'Hari' },
          { val: time.hours, label: 'Jam' },
          { val: time.minutes, label: 'Menit' },
          { val: time.seconds, label: 'Detik' },
        ].map(({ val, label }) => (
          <div key={label} className="lv-countdown-box">
            <span className="lv-countdown-num">{String(val).padStart(2, '0')}</span>
            <span className="lv-countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Events ─────────────────────────────────────────────────────────────────────
function LvEvents({ detail }: { detail: WeddingDetail }) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  return (
    <section className="lv-section lv-fade">
      <LvCorners opacity={0.15} />
      <p className="lv-eyebrow">~ Rangkaian Acara ~</p>
      <h2 className="lv-section-title">Jadwal Pernikahan</h2>
      <LvDivider />
      <div className="lv-events-grid">
        <div className="lv-event-card">
          <div className="lv-event-badge">🌸 Akad Nikah 🌸</div>
          <p className="lv-event-date">{fmt(detail.akadDate)}</p>
          <p className="lv-event-time">{detail.akadTime} WIB</p>
          <p className="lv-event-loc">{detail.akadLocation}</p>
          {detail.akadMapsUrl && (
            <a href={detail.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="lv-maps-btn">
              📍 Lihat Lokasi
            </a>
          )}
        </div>
        <div className="lv-event-card">
          <div className="lv-event-badge">🌸 Resepsi 🌸</div>
          <p className="lv-event-date">{fmt(detail.receptionDate)}</p>
          <p className="lv-event-time">{detail.receptionTime} WIB</p>
          <p className="lv-event-loc">{detail.receptionLocation}</p>
          {detail.receptionMapsUrl && (
            <a href={detail.receptionMapsUrl} target="_blank" rel="noopener noreferrer" className="lv-maps-btn">
              📍 Lihat Lokasi
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────────
function LvGallery({ photos }: { photos: Gallery[] }) {
  return (
    <section className="lv-section lv-fade">
      <LvCorners opacity={0.15} />
      <p className="lv-eyebrow">~ Galeri ~</p>
      <h2 className="lv-section-title">Momen Bersama</h2>
      <LvDivider />
      <div className="lv-gallery-grid">
        {photos.map((p, i) => (
          <div key={p.id} className={`lv-gallery-item ${i === 0 ? 'lv-gallery-wide' : ''}`}>
            <img src={p.filePath} alt="" className="lv-gallery-img" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Love Story ─────────────────────────────────────────────────────────────────
function LvLoveStory({ story }: { story: string }) {
  return (
    <section className="lv-countdown lv-fade">
      <LvCorners opacity={0.2} />
      <p className="lv-eyebrow lv-eyebrow-light">~ Our Story ~</p>
      <h2 className="lv-countdown-title">Perjalanan Cinta Kami</h2>
      <p className="lv-love-story">{story}</p>
    </section>
  );
}

// ── Live Stream ────────────────────────────────────────────────────────────────
function LvLiveStream({ url }: { url: string }) {
  return (
    <section className="lv-section lv-fade" style={{ textAlign: 'center' }}>
      <LvCorners opacity={0.15} />
      <p className="lv-eyebrow">~ Live Streaming ~</p>
      <h2 className="lv-section-title">Saksikan Secara Online</h2>
      <a href={url} target="_blank" rel="noopener noreferrer" className="lv-maps-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
        ▶ Tonton Live
      </a>
    </section>
  );
}

// ── Gift ───────────────────────────────────────────────────────────────────────
function LvGift({ wallets }: { wallets: Wallet[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }
  return (
    <section className="lv-section lv-fade">
      <LvCorners opacity={0.15} />
      <p className="lv-eyebrow">~ Kado Digital ~</p>
      <h2 className="lv-section-title">Kirim Hadiah</h2>
      <p className="lv-section-sub">Kehadiran dan doa restu Anda adalah hadiah terbaik bagi kami.</p>
      <LvDivider />
      <div className="lv-gift-grid">
        {wallets.map((w) => (
          <div key={w.id} className="lv-gift-card">
            <p className="lv-gift-bank">{w.bankName}</p>
            <p className="lv-gift-number">{w.accountNumber}</p>
            <p className="lv-gift-owner">{w.accountOwner}</p>
            <button onClick={() => handleCopy(w.id, w.accountNumber)} className="lv-gift-copy">
              {copied === w.id ? '✓ Tersalin!' : 'Salin Nomor'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Guest Book ─────────────────────────────────────────────────────────────────
function LvGuestBook({ invitationId, guestBooks, defaultName }: { invitationId: number; guestBooks: GuestBook[]; defaultName: string }) {
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
    <section className="lv-section lv-fade">
      <LvCorners opacity={0.15} />
      <p className="lv-eyebrow">~ Buku Tamu ~</p>
      <h2 className="lv-section-title">Ucapan & Konfirmasi</h2>
      <LvDivider />

      <form onSubmit={handleSubmit} className="lv-gb-form">
        {sent && <div className="lv-gb-success">✓ Ucapan terkirim! Terima kasih 💜</div>}
        <input type="text" value={form.guestName} required placeholder="Nama kamu" onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} className="lv-gb-input" />
        <select value={form.rsvp} onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value }))} className="lv-gb-input">
          <option value="hadir">Insya Allah Hadir</option>
          <option value="tidak_hadir">Tidak Bisa Hadir</option>
          <option value="ragu_ragu">Masih Ragu-ragu</option>
        </select>
        <textarea value={form.wishes} required placeholder="Tulis ucapan dan doa untuk mempelai..." onChange={(e) => setForm((p) => ({ ...p, wishes: e.target.value }))} rows={3} className="lv-gb-input lv-gb-textarea" />
        <button type="submit" disabled={sending} className="lv-gb-btn">
          {sending ? 'Mengirim...' : '💜 Kirim Ucapan'}
        </button>
      </form>

      {/* Swiper pagination */}
      <div className="lv-gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#A6B1E1', fontSize: '0.9rem' }}>Belum ada ucapan.</p>
        ) : (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={16} slidesPerView={1} navigation pagination={{ clickable: true }}>
            {Array.from({ length: Math.ceil(entries.length / 3) }, (_, pi) => (
              <SwiperSlide key={pi}>
                <div className="lv-gb-page">
                  {entries.slice(pi * 3, pi * 3 + 3).map((g) => (
                    <div key={g.id} className="lv-gb-entry">
                      <div className="lv-gb-avatar">{g.guestName[0].toUpperCase()}</div>
                      <div className="lv-gb-body">
                        <div className="lv-gb-header">
                          <p className="lv-gb-name">{g.guestName}</p>
                          <span className={`lv-gb-rsvp lv-rsvp-${g.rsvp}`}>{rsvpLabel[g.rsvp]}</span>
                        </div>
                        <p className="lv-gb-wishes">{g.wishes}</p>
                        <p className="lv-gb-time">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
function LvFooter({ detail }: { detail: WeddingDetail }) {
  return (
    <footer className="lv-footer">
      <LvCorners opacity={0.3} />
      <div className="lv-footer-content">
        <p className="lv-eyebrow lv-eyebrow-light">~ We're Getting Married ~</p>
        <LvDivider />
        <h2 className="lv-footer-names">
          {detail.brideShortName} & {detail.bridegroomShortName}
        </h2>
        <p className="lv-footer-sub">Terima kasih telah menjadi bagian dari hari istimewa kami.</p>
        <p className="lv-footer-credit">Made with 💜 · UndanganDigital</p>
      </div>
    </footer>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const LV_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Great+Vibes&family=Inter:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; max-width: 100%; }

:root {
  --lv-deep:    #424874;   /* ungu tua */
  --lv-mid:     #A6B1E1;   /* biru lavender */
  --lv-light:   #DCD6F7;   /* lavender muda */
  --lv-pale:    #F4EEFF;   /* background utama */
  --lv-white:   #ffffff;
  --lv-text:    #2d2654;   /* teks utama */
  --lv-muted:   #7b74a8;   /* teks sekunder */
  --lv-serif:   'Cormorant Garamond', Georgia, serif;
  --lv-script:  'Great Vibes', cursive;
  --lv-sans:    'Inter', system-ui, sans-serif;
}

/* ── Base ── */
.lv-wrap { font-family: var(--lv-sans); background: var(--lv-pale); color: var(--lv-text); overflow-x: hidden; }

/* ── Fade ── */
.lv-fade { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
.lv-visible { opacity: 1; transform: none; }

/* ── Bunga sudut ── */
.lv-corner {
  position: absolute; pointer-events: none; z-index: 3;
  width: 160px; height: 160px; object-fit: contain;
}
.lv-corner-tl { top: 0; left: 0; }
.lv-corner-tr { top: 0; right: 0; transform: scaleX(-1); }
.lv-corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
.lv-corner-br { bottom: 0; right: 0; transform: scale(-1); }

@media (max-width: 640px) {
  .lv-corner { width: 90px; height: 90px; }
}

/* ── Divider ── */
.lv-divider-wrap {
  display: flex; align-items: center; gap: 1rem;
  max-width: 400px; margin: 1.5rem auto;
}
.lv-divider-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--lv-light), transparent); }
.lv-divider-img { width: 60px; height: 30px; object-fit: contain; opacity: 0.7; }

/* ── Cover ── */
.lv-cover {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--lv-deep) 0%, #2d2654 100%) center/cover no-repeat;
  position: relative; text-align: center; overflow: hidden;
}
.lv-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(66,72,116,0.6) 0%, rgba(45,38,84,0.75) 100%);
}

/* Petals */
.lv-petals { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 4; }
.lv-petal {
  position: absolute; top: -2rem;
  animation: lv-petal-fall linear infinite;
  user-select: none;
}
@keyframes lv-petal-fall {
  0%   { transform: translateY(-2rem) rotate(0deg); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
}

/* Mute */
.lv-mute {
  position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(220,214,247,0.4); border-radius: 100px;
  color: white; font-size: 1rem; padding: 0.45rem 0.85rem; cursor: pointer;
  transition: background 0.2s;
}
.lv-mute:hover { background: rgba(255,255,255,0.25); }

/* Cover content */
.lv-cover-content { position: relative; z-index: 5; padding: 2rem; }
.lv-cover-eyebrow {
  font-family: var(--lv-serif); font-style: italic;
  color: var(--lv-light); font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 1rem;
}
.lv-cover-ornament {
  color: var(--lv-mid); font-size: 1.1rem; letter-spacing: 0.4em;
  margin: 0.75rem 0;
}
.lv-cover-names {
  font-family: var(--lv-script);
  font-size: clamp(3.5rem, 12vw, 7rem);
  color: var(--lv-white); line-height: 1.1;
  text-shadow: 0 2px 20px rgba(66,72,116,0.4);
  margin: 0.5rem 0;
}
.lv-cover-amp { color: var(--lv-light); }
.lv-cover-date {
  font-family: var(--lv-serif); font-size: 1rem;
  color: rgba(220,214,247,0.85); margin: 1rem 0 1.5rem;
  letter-spacing: 0.05em;
}
.lv-cover-guest { margin-bottom: 2rem; }
.lv-cover-guest-label {
  font-family: var(--lv-serif); font-style: italic;
  font-size: 0.9rem; color: rgba(220,214,247,0.7);
}
.lv-cover-guest-name {
  font-family: var(--lv-serif); font-size: 1.3rem;
  color: var(--lv-white); font-weight: 400;
}
.lv-cover-btn {
  display: inline-block;
  background: linear-gradient(135deg, var(--lv-mid), var(--lv-deep));
  color: var(--lv-white); font-family: var(--lv-sans); font-size: 1rem; font-weight: 500;
  padding: 0.9rem 2.5rem; border-radius: 100px; border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(66,72,116,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(220,214,247,0.3);
}
.lv-cover-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 26px rgba(66,72,116,0.5); }
.lv-cover-scroll {
  font-family: var(--lv-serif); font-style: italic;
  color: rgba(220,214,247,0.5); font-size: 0.85rem; margin-top: 1.25rem;
}

/* ── Hero ── */
.lv-hero {
  position: relative; height: 90vh;
  display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
}
.lv-slider { position: absolute; inset: 0; }
.lv-slider-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease; }
.lv-slider-img.active { opacity: 1; }
.lv-slider-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(66,72,116,0.75) 0%, transparent 60%); }
.lv-slider-placeholder { background: linear-gradient(135deg, var(--lv-deep), var(--lv-mid)); }
.lv-hero-content { position: relative; z-index: 3; text-align: center; padding: 3rem 2rem; color: white; }
.lv-eyebrow { font-family: var(--lv-serif); font-style: italic; font-size: 0.95rem; color: var(--lv-mid); margin-bottom: 0.5rem; letter-spacing: 0.08em; text-align: center; }
.lv-eyebrow-light { color: var(--lv-light) !important; }
.lv-hero-names { font-family: var(--lv-script); font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; }
.lv-hero-names em { font-style: normal; color: var(--lv-light); }
.lv-hero-date { font-size: 0.9rem; color: rgba(255,255,255,0.75); margin-top: 0.75rem; }

/* ── Section ── */
.lv-section {
  padding: 5rem 2rem; max-width: 900px; margin: 0 auto;
  text-align: center; position: relative;
}
.lv-section-title {
  font-family: var(--lv-serif); font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 300; color: var(--lv-text); margin-bottom: 1rem;
}
.lv-section-sub { color: var(--lv-muted); font-size: 0.95rem; line-height: 1.7; max-width: 540px; margin: 0 auto 1rem; }

/* ── Couple ── */
.lv-couple-grid { display: flex; align-items: center; gap: 2rem; justify-content: center; flex-wrap: wrap; margin: 2rem 0; }
.lv-couple-card { text-align: center; flex: 1; min-width: 200px; }
.lv-couple-icon { font-size: 2rem; margin-bottom: 0.75rem; }
.lv-couple-name { font-family: var(--lv-script); font-size: 2rem; color: var(--lv-text); margin-bottom: 0.5rem; }
.lv-couple-parent-label { font-size: 0.8rem; color: var(--lv-muted); }
.lv-couple-parent { font-size: 0.95rem; color: var(--lv-text); font-weight: 500; }
.lv-couple-divider { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.lv-divider-vert { width: 1px; height: 60px; background: linear-gradient(to bottom, transparent, var(--lv-mid), transparent); }
.lv-divider-heart { font-size: 1.5rem; }

/* ── Countdown ── */
.lv-countdown {
  background: linear-gradient(135deg, var(--lv-deep), #2d2654);
  padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden;
}
.lv-countdown-title {
  font-family: var(--lv-serif); font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 300; color: white; margin-bottom: 2.5rem;
}
.lv-countdown-grid { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
.lv-countdown-box {
  background: rgba(255,255,255,0.08); backdrop-filter: blur(8px);
  border: 1px solid rgba(166,177,225,0.3); border-radius: 20px;
  padding: 1.5rem 1.75rem; min-width: 85px; text-align: center;
}
.lv-countdown-num { display: block; font-family: var(--lv-serif); font-size: 2.8rem; font-weight: 300; color: var(--lv-light); line-height: 1; }
.lv-countdown-label { display: block; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 0.4rem; }

/* ── Events ── */
.lv-events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }
.lv-event-card {
  background: var(--lv-white); border: 1px solid var(--lv-light);
  border-radius: 24px; padding: 2rem; text-align: center;
  box-shadow: 0 4px 20px rgba(66,72,116,0.08);
}
.lv-event-badge { font-size: 0.9rem; color: var(--lv-deep); font-weight: 600; margin-bottom: 1rem; }
.lv-event-date { font-family: var(--lv-serif); font-size: 1rem; color: var(--lv-text); margin-bottom: 0.25rem; }
.lv-event-time { font-size: 1.5rem; font-weight: 700; color: var(--lv-deep); margin-bottom: 0.75rem; }
.lv-event-loc { font-size: 0.85rem; color: var(--lv-muted); line-height: 1.5; margin-bottom: 1rem; }
.lv-maps-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: linear-gradient(135deg, var(--lv-mid), var(--lv-deep));
  color: white; font-size: 0.8rem; font-weight: 500;
  padding: 0.5rem 1.25rem; border-radius: 100px; text-decoration: none;
  transition: transform 0.2s; box-shadow: 0 3px 10px rgba(66,72,116,0.3);
}
.lv-maps-btn:hover { transform: translateY(-1px); }

/* ── Gallery ── */
.lv-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-top: 1.5rem; }
.lv-gallery-item { border-radius: 16px; overflow: hidden; aspect-ratio: 1; }
.lv-gallery-wide { grid-column: span 2; aspect-ratio: 2/1; }
.lv-gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.lv-gallery-img:hover { transform: scale(1.05); }

/* ── Love Story ── */
.lv-love-story { color: rgba(255,255,255,0.75); font-size: 1rem; line-height: 1.9; max-width: 580px; margin: 2rem auto 0; font-style: italic; }

/* ── Gift ── */
.lv-gift-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1rem; margin-top: 1.5rem; }
.lv-gift-card { background: var(--lv-white); border: 1px solid var(--lv-light); border-radius: 20px; padding: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(66,72,116,0.08); }
.lv-gift-bank { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--lv-deep); margin-bottom: 0.5rem; }
.lv-gift-number { font-family: monospace; font-size: 1.3rem; font-weight: 700; color: var(--lv-text); margin-bottom: 0.25rem; }
.lv-gift-owner { font-size: 0.85rem; color: var(--lv-muted); margin-bottom: 1rem; }
.lv-gift-copy { background: linear-gradient(135deg, var(--lv-mid), var(--lv-deep)); color: white; border: none; border-radius: 100px; padding: 0.45rem 1.2rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: transform 0.15s; }
.lv-gift-copy:hover { transform: translateY(-1px); }

/* ── Guest Book ── */
.lv-gb-form { background: var(--lv-white); border: 1px solid var(--lv-light); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(66,72,116,0.08); }
.lv-gb-success { background: var(--lv-pale); color: var(--lv-deep); border: 1px solid var(--lv-light); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1rem; }
.lv-gb-input { display: block; width: 100%; border: 1.5px solid var(--lv-light); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9rem; font-family: var(--lv-sans); margin-bottom: 0.75rem; outline: none; transition: border-color 0.2s; background: var(--lv-pale); color: var(--lv-text); }
.lv-gb-input:focus { border-color: var(--lv-mid); box-shadow: 0 0 0 3px rgba(166,177,225,0.15); }
.lv-gb-textarea { resize: none; }
.lv-gb-btn { width: 100%; background: linear-gradient(135deg, var(--lv-mid), var(--lv-deep)); color: white; border: none; border-radius: 100px; padding: 0.85rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: transform 0.15s; box-shadow: 0 4px 14px rgba(66,72,116,0.3); }
.lv-gb-btn:hover { transform: translateY(-1px); }
.lv-gb-btn:disabled { opacity: 0.6; }
.lv-gb-list { width: 100%; }
.lv-gb-page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 3rem; }
.lv-gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--lv-white); border-radius: 16px; padding: 1rem 1.25rem; border: 1px solid var(--lv-light); }
.lv-gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--lv-mid), var(--lv-deep)); color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lv-gb-body { flex: 1; }
.lv-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.lv-gb-name { font-weight: 600; font-size: 0.9rem; color: var(--lv-text); }
.lv-gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.lv-rsvp-hadir { background: var(--lv-pale); color: var(--lv-deep); }
.lv-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.lv-rsvp-ragu_ragu { background: #fffbeb; color: #92400e; }
.lv-gb-wishes { font-size: 0.875rem; color: var(--lv-muted); line-height: 1.6; }
.lv-gb-time { font-size: 0.75rem; color: var(--lv-mid); margin-top: 0.4rem; }
.lv-gb-list .swiper-button-next,
.lv-gb-list .swiper-button-prev { color: var(--lv-mid); transform: scale(0.75); }
.lv-gb-list .swiper-pagination-bullet { background: var(--lv-light); opacity: 1; }
.lv-gb-list .swiper-pagination-bullet-active { background: var(--lv-deep); }

/* ── Footer ── */
.lv-footer {
  background: linear-gradient(135deg, var(--lv-deep), #2d2654);
  padding: 6rem 2rem; text-align: center; position: relative; overflow: hidden;
}
.lv-footer-content { position: relative; z-index: 3; }
.lv-footer-names { font-family: var(--lv-script); font-size: clamp(2.5rem, 7vw, 4.5rem); color: white; margin: 1rem 0; }
.lv-footer-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-bottom: 1.5rem; }
.lv-footer-credit { color: var(--lv-mid); font-size: 0.8rem; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .lv-couple-grid { flex-direction: column; }
  .lv-couple-divider { flex-direction: row; }
  .lv-divider-vert { width: 60px; height: 1px; }
  .lv-gallery-grid { grid-template-columns: repeat(2,1fr); }
  .lv-gallery-wide { grid-column: span 2; }
  .lv-countdown-grid { gap: 0.75rem; }
  .lv-countdown-box { padding: 1rem 1.25rem; min-width: 70px; }
  .lv-countdown-num { font-size: 2rem; }
  .lv-section { padding: 3.5rem 1.5rem; }
  .lv-cover-names { font-size: clamp(3rem, 14vw, 5rem); }
}
`;
