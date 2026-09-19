'use client';
// app/[slug]/themes/RetroTemplate.tsx
// Tema 6: Retro Modern — #F5F5F5 / #76ABAE / #303841 / #FF5722

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

// ── Path aset — letakkan di public/themes/retro/ ──────────────────────────────
// Tema ini menggunakan ornamen geometric dari CSS, bukan gambar
// Tapi kamu bisa tambah aset opsional:
const ASSETS = {
  bgTexture: '/themes/retro/bg-tekstur-grain.jpg', // tekstur grain/noise opsional
  stamp: '/themes/retro/stamp.png', // stempel vintage opsional
};

// ── Typewriter Hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 80, delay = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return { displayed, done };
}

// ── Parallax Hook ─────────────────────────────────────────────────────────────
function useParallax(speed = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);
  return ref;
}

// ── Count Up Hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1000, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

// ── Geometric ornament ────────────────────────────────────────────────────────
function RetroOrn({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posStyle: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return (
    <div className="rt-orn" style={posStyle[pos]}>
      <div className="rt-orn-inner" />
    </div>
  );
}

// ── Divider retro ─────────────────────────────────────────────────────────────
function RetroDivider({ label, light = false }: { label?: string; light?: boolean }) {
  return (
    <div className={`rt-divider ${light ? 'rt-divider--light' : ''}`}>
      <div className="rt-divider-line" />
      <div className="rt-divider-center">
        <div className="rt-divider-diamond" />
        {label && <span className="rt-divider-label">{label}</span>}
        <div className="rt-divider-diamond" />
      </div>
      <div className="rt-divider-line" />
    </div>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function RetroTemplate({ invitation }: { invitation: Invitation }) {
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
      const els = document.querySelectorAll('.rt-fade');
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('rt-visible');
          }),
        { threshold: 0.07 },
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 150);
    return () => clearTimeout(timer);
  }, [opened]);

  if (!d) {
    return (
      <div className="rt-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#303841' }}>Detail undangan belum tersedia.</p>
      </div>
    );
  }

  const sliderPhotos = invitation.galleries.filter((g) => g.type === 'slider');
  const galleryPhotos = invitation.galleries.filter((g) => g.type === 'gallery');
  const bgPhoto = invitation.galleries.find((g) => g.type === 'background');

  return (
    <>
      {!opened && <RtCover detail={d} guestName={guestName} bgPhoto={bgPhoto?.filePath} onOpen={() => setOpened(true)} />}
      {opened && (
        <div className="rt-wrap">
          <RtHero detail={d} sliderPhotos={sliderPhotos} />
          <RtCouple detail={d} />
          <RtCountdown detail={d} />
          <RtEvents detail={d} />
          {galleryPhotos.length > 0 && <RtGallery photos={galleryPhotos} />}
          {d.loveStory && <RtLoveStory story={d.loveStory} />}
          {d.liveStreamingUrl && <RtLiveStream url={d.liveStreamingUrl} />}
          {invitation.digitalWallets.length > 0 && <RtGift wallets={invitation.digitalWallets} />}
          <RtGuestBook invitationId={invitation.id} guestBooks={invitation.guestBooks} defaultName={guestName} />
          <RtFooter detail={d} />
        </div>
      )}
      <style>{RT_STYLES}</style>
    </>
  );
}

// ── Cover ──────────────────────────────────────────────────────────────────────
function RtCover({ detail, guestName, bgPhoto, onOpen }: { detail: WeddingDetail; guestName: string; bgPhoto?: string; onOpen: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  const fullName = `${detail.brideShortName} & ${detail.bridegroomShortName}`;
  const { displayed, done } = useTypewriter(ready ? fullName : '', 90, 800);

  useEffect(() => {
    setReady(true);
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

    // Konfetti retro
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
    script.onload = () => {
      const confetti = (window as any).confetti;
      if (!confetti) return;
      const colors = ['#76ABAE', '#FF5722', '#F5F5F5', '#303841'];
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.9 }, colors, shapes: ['square', 'circle'] });
      setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.9 }, colors, shapes: ['square', 'circle'] }), 200);
      setTimeout(() => confetti({ particleCount: 150, spread: 120, origin: { x: 0.5, y: 0.6 }, colors }), 400);
    };
    if ((window as any).confetti) script.onload(new Event('load'));
    else document.head.appendChild(script);

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
    <div className="rt-cover" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : {}}>
      <div className="rt-cover-overlay" />

      {/* Geometric ornamen sudut */}
      <RetroOrn pos="tl" />
      <RetroOrn pos="tr" />
      <RetroOrn pos="bl" />
      <RetroOrn pos="br" />

      {/* Garis dekorasi horizontal */}
      <div className="rt-cover-stripe rt-cover-stripe--top" />
      <div className="rt-cover-stripe rt-cover-stripe--bottom" />

      {/* Mute */}
      <button onClick={toggleMute} className="rt-mute">
        {muted ? '🔇' : '🎵'}
      </button>

      <div className="rt-cover-content">
        {/* Label atas */}
        <div className="rt-cover-label-wrap">
          <div className="rt-cover-label-line" />
          <p className="rt-cover-label">WEDDING INVITATION</p>
          <div className="rt-cover-label-line" />
        </div>

        {/* Nama dengan typewriter */}
        <div className="rt-cover-name-box">
          <div className="rt-cover-name-border" />
          <h1 className="rt-cover-names">
            {displayed}
            {!done && <span className="rt-cursor">|</span>}
          </h1>
        </div>

        {/* Tanggal dengan style retro */}
        <div className="rt-cover-date-box">
          <span className="rt-cover-date-day">{new Date(detail.receptionDate).toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase()}</span>
          <span className="rt-cover-date-num">{new Date(detail.receptionDate).getDate()}</span>
          <div className="rt-cover-date-right">
            <span className="rt-cover-date-month">{new Date(detail.receptionDate).toLocaleDateString('id-ID', { month: 'long' }).toUpperCase()}</span>
            <span className="rt-cover-date-year">{new Date(detail.receptionDate).getFullYear()}</span>
          </div>
        </div>

        {/* Nama tamu */}
        {guestName && (
          <div className="rt-cover-guest">
            <p className="rt-cover-guest-label">KEPADA YTH.</p>
            <p className="rt-cover-guest-name">{guestName}</p>
          </div>
        )}

        {/* Tombol */}
        <button onClick={handleOpen} className="rt-cover-btn">
          BUKA UNDANGAN
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function RtHero({ detail, sliderPhotos }: { detail: WeddingDetail; sliderPhotos: Gallery[] }) {
  const [current, setCurrent] = useState(0);
  const parallaxRef = useParallax(0.2);

  useEffect(() => {
    if (sliderPhotos.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % sliderPhotos.length), 4500);
    return () => clearInterval(t);
  }, [sliderPhotos.length]);

  return (
    <section className="rt-hero rt-fade">
      {/* Parallax image layer */}
      <div className="rt-hero-parallax-wrap">
        <div ref={parallaxRef} className="rt-hero-parallax-inner">
          {sliderPhotos.length > 0 ? sliderPhotos.map((p, i) => <img key={p.id} src={p.filePath} alt="" className={`rt-slider-img ${i === current ? 'active' : ''}`} />) : <div className="rt-slider-placeholder" />}
        </div>
        <div className="rt-slider-overlay" />
      </div>

      <div className="rt-hero-content">
        {/* Tag animasi slide dari kiri */}
        <div className="rt-hero-tag rt-anim-slide-left">THE WEDDING OF</div>
        {/* Nama animasi slide dari bawah */}
        <h2 className="rt-hero-names rt-anim-slide-up">
          {detail.brideShortName}
          <span className="rt-hero-amp"> & </span>
          {detail.bridegroomShortName}
        </h2>
        {/* Date strip animasi slide dari kanan */}
        <div className="rt-hero-date-strip rt-anim-slide-right">
          <span>{new Date(detail.receptionDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</span>
        </div>
        {/* Garis animasi grow */}
        <div className="rt-hero-line rt-anim-grow" />
      </div>
    </section>
  );
}

// ── Couple ─────────────────────────────────────────────────────────────────────
function RtCouple({ detail }: { detail: WeddingDetail }) {
  return (
    <section className="rt-section rt-fade">
      <div className="rt-section-tag">01 — MEMPELAI</div>
      <h2 className="rt-section-title">BISMILLAHIRRAHMANIRRAHIM</h2>
      <p className="rt-section-sub">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>
      <RetroDivider />

      <div className="rt-couple-grid">
        {/* Slide dari kiri */}
        <div className="rt-couple-card rt-fade rt-fade-left" style={{ transitionDelay: '0.1s' }}>
          <div className="rt-couple-num">01</div>
          <h3 className="rt-couple-name">{detail.brideName}</h3>
          <div className="rt-couple-divider rt-divider-anim" />
          <p className="rt-couple-parent-label">PUTRI DARI</p>
          <p className="rt-couple-parent">{detail.brideParent}</p>
        </div>

        <div className="rt-couple-sep">
          <div className="rt-couple-sep-line" />
          <div className="rt-couple-sep-circle rt-pulse">
            <div className="rt-couple-sep-inner" />
          </div>
          <div className="rt-couple-sep-line" />
        </div>

        {/* Slide dari kanan */}
        <div className="rt-couple-card rt-fade rt-fade-right" style={{ transitionDelay: '0.2s' }}>
          <div className="rt-couple-num">02</div>
          <h3 className="rt-couple-name">{detail.bridegroomName}</h3>
          <div className="rt-couple-divider rt-divider-anim" />
          <p className="rt-couple-parent-label">PUTRA DARI</p>
          <p className="rt-couple-parent">{detail.bridegroomParent}</p>
        </div>
      </div>

      <RetroDivider />
    </section>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function RtCountdown({ detail }: { detail: WeddingDetail }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Observer untuk trigger animasi saat section terlihat
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="rt-countdown rt-fade">
      <div className="rt-countdown-stripe rt-stripe-anim" />

      <div className="rt-countdown-content">
        <div className="rt-section-tag rt-section-tag--light rt-anim-slide-up">02 — COUNTDOWN</div>
        <h2 className="rt-countdown-title rt-anim-slide-up" style={{ animationDelay: '0.1s' }}>
          MENGHITUNG HARI
        </h2>
        <RetroDivider light />

        <div className="rt-countdown-grid">
          {[
            { val: time.days, label: 'HARI', delay: '0s' },
            { val: time.hours, label: 'JAM', delay: '0.1s' },
            { val: time.minutes, label: 'MENIT', delay: '0.2s' },
            { val: time.seconds, label: 'DETIK', delay: '0.3s' },
          ].map(({ val, label, delay }) => (
            <div key={label} className={`rt-countdown-box ${isVisible ? 'rt-countdown-box--visible' : ''}`} style={{ animationDelay: delay }}>
              <span className="rt-countdown-num rt-num-flip">{String(val).padStart(2, '0')}</span>
              <div className="rt-countdown-sep" />
              <span className="rt-countdown-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rt-countdown-stripe rt-stripe-anim" />
    </section>
  );
}

// ── Events ─────────────────────────────────────────────────────────────────────
function RtEvents({ detail }: { detail: WeddingDetail }) {
  const fmt = (d: string) =>
    new Date(d)
      .toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      .toUpperCase();

  return (
    <section className="rt-section rt-fade">
      <div className="rt-section-tag">03 — JADWAL</div>
      <h2 className="rt-section-title">RANGKAIAN ACARA</h2>
      <RetroDivider />

      <div className="rt-events-grid">
        {[
          { num: 'I', label: 'AKAD NIKAH', date: detail.akadDate, time: detail.akadTime, loc: detail.akadLocation, maps: detail.akadMapsUrl, delay: '0s' },
          { num: 'II', label: 'RESEPSI', date: detail.receptionDate, time: detail.receptionTime, loc: detail.receptionLocation, maps: detail.receptionMapsUrl, delay: '0.15s' },
        ].map((ev) => (
          <div key={ev.label} className="rt-event-card rt-fade rt-fade-up" style={{ transitionDelay: ev.delay }}>
            {/* Animasi border kiri grow */}
            <div className="rt-event-border-anim" />
            <div className="rt-event-num">{ev.num}</div>
            <div className="rt-event-content">
              <p className="rt-event-label">{ev.label}</p>
              <div className="rt-event-sep rt-sep-grow" />
              <p className="rt-event-date">{fmt(ev.date)}</p>
              <p className="rt-event-time">{ev.time} WIB</p>
              <p className="rt-event-loc">{ev.loc}</p>
              {ev.maps && (
                <a href={ev.maps} target="_blank" rel="noopener noreferrer" className="rt-maps-btn rt-btn-hover">
                  ↗ LIHAT LOKASI
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────────
function RtGallery({ photos }: { photos: Gallery[] }) {
  return (
    <section className="rt-section rt-fade" style={{ background: '#303841' }}>
      <div className="rt-section-tag rt-section-tag--light">04 — GALERI</div>
      <h2 className="rt-section-title rt-section-title--light">MOMEN BERSAMA</h2>
      <RetroDivider light />
      <div className="rt-gallery-grid">
        {photos.map((p, i) => (
          <div key={p.id} className={`rt-gallery-item rt-fade ${i === 0 ? 'rt-gallery-wide' : ''}`} style={{ transitionDelay: `${i * 0.07}s` }}>
            <img src={p.filePath} alt="" className="rt-gallery-img" />
            <div className="rt-gallery-overlay" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Love Story ─────────────────────────────────────────────────────────────────
function RtLoveStory({ story }: { story: string }) {
  return (
    <section className="rt-section rt-fade">
      <div className="rt-section-tag">05 — OUR STORY</div>
      <h2 className="rt-section-title">PERJALANAN CINTA</h2>
      <RetroDivider />
      <p className="rt-love-story">{story}</p>
    </section>
  );
}

// ── Live Stream ────────────────────────────────────────────────────────────────
function RtLiveStream({ url }: { url: string }) {
  return (
    <section className="rt-section rt-fade" style={{ textAlign: 'center' }}>
      <div className="rt-section-tag">LIVE STREAMING</div>
      <h2 className="rt-section-title">SAKSIKAN SECARA ONLINE</h2>
      <RetroDivider />
      <a href={url} target="_blank" rel="noopener noreferrer" className="rt-maps-btn" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
        ▶ TONTON LIVE
      </a>
    </section>
  );
}

// ── Gift ───────────────────────────────────────────────────────────────────────
function RtGift({ wallets }: { wallets: Wallet[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="rt-section rt-fade" style={{ background: '#303841' }}>
      <div className="rt-section-tag rt-section-tag--light">KADO DIGITAL</div>
      <h2 className="rt-section-title rt-section-title--light">KIRIM HADIAH</h2>
      <p className="rt-section-sub rt-section-sub--light">Kehadiran dan doa restu Anda adalah hadiah terbaik bagi kami.</p>
      <RetroDivider light />
      <div className="rt-gift-grid">
        {wallets.map((w) => (
          <div key={w.id} className="rt-gift-card">
            <p className="rt-gift-bank">{w.bankName}</p>
            <div className="rt-gift-sep" />
            <p className="rt-gift-number">{w.accountNumber}</p>
            <p className="rt-gift-owner">{w.accountOwner}</p>
            <button onClick={() => handleCopy(w.id, w.accountNumber)} className="rt-gift-copy">
              {copied === w.id ? '✓ TERSALIN' : 'SALIN NOMOR'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Guest Book ─────────────────────────────────────────────────────────────────
function RtGuestBook({ invitationId, guestBooks, defaultName }: { invitationId: number; guestBooks: GuestBook[]; defaultName: string }) {
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
    <section className="rt-section rt-fade">
      <div className="rt-section-tag">BUKU TAMU</div>
      <h2 className="rt-section-title">UCAPAN & KONFIRMASI</h2>
      <RetroDivider />

      <form onSubmit={handleSubmit} className="rt-gb-form">
        {sent && <div className="rt-gb-success">✓ UCAPAN TERKIRIM! TERIMA KASIH.</div>}
        <input type="text" value={form.guestName} required placeholder="NAMA KAMU" onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} className="rt-gb-input" />
        <select value={form.rsvp} onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value }))} className="rt-gb-input">
          <option value="hadir">INSYA ALLAH HADIR</option>
          <option value="tidak_hadir">TIDAK BISA HADIR</option>
          <option value="ragu_ragu">MASIH RAGU-RAGU</option>
        </select>
        <textarea value={form.wishes} required placeholder="TULIS UCAPAN DAN DOA..." onChange={(e) => setForm((p) => ({ ...p, wishes: e.target.value }))} rows={3} className="rt-gb-input rt-gb-textarea" />
        <button type="submit" disabled={sending} className="rt-gb-btn">
          {sending ? 'MENGIRIM...' : '→ KIRIM UCAPAN'}
        </button>
      </form>

      {/* Swiper */}
      <div className="rt-gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#76ABAE', fontSize: '0.85rem', letterSpacing: '0.1em' }}>BELUM ADA UCAPAN.</p>
        ) : (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={16} slidesPerView={1} navigation pagination={{ clickable: true }}>
            {Array.from({ length: Math.ceil(entries.length / 3) }, (_, pi) => (
              <SwiperSlide key={pi}>
                <div className="rt-gb-page">
                  {entries.slice(pi * 3, pi * 3 + 3).map((g) => (
                    <div key={g.id} className="rt-gb-entry">
                      <div className="rt-gb-avatar">{g.guestName[0].toUpperCase()}</div>
                      <div className="rt-gb-body">
                        <div className="rt-gb-header">
                          <p className="rt-gb-name">{g.guestName.toUpperCase()}</p>
                          <span className={`rt-gb-rsvp rt-rsvp-${g.rsvp}`}>{rsvpLabel[g.rsvp].toUpperCase()}</span>
                        </div>
                        <p className="rt-gb-wishes">{g.wishes}</p>
                        <p className="rt-gb-time">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</p>
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
function RtFooter({ detail }: { detail: WeddingDetail }) {
  return (
    <footer className="rt-footer">
      <div className="rt-footer-stripe" />
      <div className="rt-footer-content">
        <p className="rt-footer-eyebrow">WE'RE GETTING MARRIED</p>
        <RetroDivider light />
        <h2 className="rt-footer-names">
          {detail.brideShortName} & {detail.bridegroomShortName}
        </h2>
        <p className="rt-footer-date">
          {new Date(detail.receptionDate)
            .toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            .toUpperCase()}
        </p>
        <RetroDivider light />
        <p className="rt-footer-credit">MADE WITH ♥ · UNDANGANDIGITAL</p>
      </div>
      <div className="rt-footer-stripe" />
    </footer>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const RT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Slab:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; max-width: 100%; }

:root {
  --rt-light:   #F5F5F5;  /* abu terang */
  --rt-teal:    #76ABAE;  /* teal */
  --rt-dark:    #303841;  /* charcoal */
  --rt-orange:  #FF5722;  /* oranye */
  --rt-white:   #ffffff;
  --rt-text:    #1a1a1a;
  --rt-muted:   #6b7280;
  --rt-display: 'Bebas Neue', sans-serif;       /* font display retro */
  --rt-slab:    'Roboto Slab', serif;           /* font body */
  --rt-mono:    'Roboto Mono', monospace;       /* font monospace */
  --rt-sans:    'Inter', system-ui, sans-serif;
}

/* ── Base ── */
.rt-wrap { font-family: var(--rt-sans); background: var(--rt-light); color: var(--rt-text); overflow-x: hidden; }

/* ── Fade & Animasi masuk ── */
.rt-fade { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.rt-fade-left  { opacity: 0; transform: translateX(-40px); transition: opacity 0.7s ease, transform 0.7s ease; }
.rt-fade-right { opacity: 0; transform: translateX(40px);  transition: opacity 0.7s ease, transform 0.7s ease; }
.rt-fade-up    { opacity: 0; transform: translateY(32px);  transition: opacity 0.7s ease, transform 0.7s ease; }
.rt-visible { opacity: 1 !important; transform: none !important; }

/* ── Animasi hero content ── */
.rt-anim-slide-left  { animation: rt-slide-left  0.8s cubic-bezier(0.22,1,0.36,1) both; }
.rt-anim-slide-right { animation: rt-slide-right 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
.rt-anim-slide-up    { animation: rt-slide-up    0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
.rt-anim-grow        { animation: rt-grow        1s cubic-bezier(0.22,1,0.36,1) 0.4s both; }

@keyframes rt-slide-left  { from { opacity:0; transform: translateX(-30px); } to { opacity:1; transform: none; } }
@keyframes rt-slide-right { from { opacity:0; transform: translateX(30px);  } to { opacity:1; transform: none; } }
@keyframes rt-slide-up    { from { opacity:0; transform: translateY(20px);  } to { opacity:1; transform: none; } }
@keyframes rt-grow        { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* Garis dekorasi di hero */
.rt-hero-line {
  width: 80px; height: 3px; background: var(--rt-orange);
  margin-top: 1.5rem; transform-origin: left;
}

/* ── Pulse animasi untuk elemen dekoratif ── */
.rt-pulse { animation: rt-pulse 2s ease-in-out infinite; }
@keyframes rt-pulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,87,34,0.4); }
  50%      { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(255,87,34,0); }
}

/* ── Animasi divider line grow ── */
.rt-divider-anim {
  width: 0; transition: width 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s;
}
.rt-visible .rt-divider-anim { width: 40px; }

/* ── Geometric ornamen ── */
.rt-orn {
  position: absolute; width: 60px; height: 60px;
  pointer-events: none; z-index: 3;
}
.rt-orn-inner {
  width: 100%; height: 100%;
  border: 3px solid var(--rt-teal);
  opacity: 0.4;
}

/* ── Divider ── */
.rt-divider {
  display: flex; align-items: center; gap: 1rem;
  max-width: 500px; margin: 1.5rem auto;
}
.rt-divider--light .rt-divider-line { background: rgba(118,171,174,0.4); }
.rt-divider--light .rt-divider-diamond { border-color: rgba(118,171,174,0.6); }
.rt-divider--light .rt-divider-label { color: var(--rt-teal); }
.rt-divider-line { flex: 1; height: 1px; background: rgba(48,56,65,0.2); }
.rt-divider-center { display: flex; align-items: center; gap: 0.5rem; }
.rt-divider-diamond { width: 8px; height: 8px; border: 1.5px solid var(--rt-dark); transform: rotate(45deg); }
.rt-divider-label { font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.2em; color: var(--rt-dark); }

/* ── Cover ── */
.rt-cover {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--rt-dark) center/cover no-repeat;
  position: relative; text-align: center; overflow: hidden;
}
.rt-cover-overlay {
  position: absolute; inset: 0;
  background: rgba(48,56,65,0.88);
}

/* Stripe dekorasi */
.rt-cover-stripe {
  position: absolute; left: 0; right: 0; height: 6px;
  background: var(--rt-orange); z-index: 2;
}
.rt-cover-stripe--top  { top: 0; }
.rt-cover-stripe--bottom { bottom: 0; }

/* Mute */
.rt-mute {
  position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10;
  background: rgba(118,171,174,0.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(118,171,174,0.4); border-radius: 4px;
  color: var(--rt-teal); font-size: 1rem; padding: 0.4rem 0.8rem;
  cursor: pointer; font-family: var(--rt-mono); transition: background 0.2s;
}
.rt-mute:hover { background: rgba(118,171,174,0.25); }

/* Cover content */
.rt-cover-content { position: relative; z-index: 4; padding: 2rem; max-width: 600px; }

.rt-cover-label-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
.rt-cover-label-line { flex: 1; height: 1px; background: rgba(118,171,174,0.4); }
.rt-cover-label { font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.3em; color: var(--rt-teal); white-space: nowrap; }

.rt-cover-name-box { position: relative; margin: 0.5rem 0 1.5rem; padding: 0.5rem 0; }
.rt-cover-name-border { position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; width: 60%; height: 3px; background: var(--rt-orange); }
.rt-cover-names {
  font-family: var(--rt-display); font-size: clamp(3rem, 12vw, 7rem);
  color: var(--rt-white); line-height: 1; letter-spacing: 0.02em;
  min-height: 1.1em;
}
.rt-cursor { animation: rt-blink 0.8s step-end infinite; color: var(--rt-orange); }
@keyframes rt-blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* Date box retro */
.rt-cover-date-box {
  display: inline-flex; align-items: center; gap: 1rem;
  border: 2px solid rgba(118,171,174,0.4); padding: 0.75rem 1.5rem;
  margin: 1rem 0 1.5rem;
}
.rt-cover-date-day { font-family: var(--rt-mono); font-size: 0.65rem; letter-spacing: 0.15em; color: var(--rt-teal); }
.rt-cover-date-num { font-family: var(--rt-display); font-size: 3rem; color: var(--rt-orange); line-height: 1; }
.rt-cover-date-right { display: flex; flex-direction: column; }
.rt-cover-date-month { font-family: var(--rt-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--rt-white); }
.rt-cover-date-year  { font-family: var(--rt-display); font-size: 1.5rem; color: var(--rt-teal); line-height: 1; }

.rt-cover-guest { margin-bottom: 2rem; }
.rt-cover-guest-label { font-family: var(--rt-mono); font-size: 0.65rem; letter-spacing: 0.2em; color: var(--rt-teal); margin-bottom: 0.25rem; }
.rt-cover-guest-name { font-family: var(--rt-slab); font-size: 1.3rem; color: var(--rt-white); font-weight: 300; }

.rt-cover-btn {
  display: inline-flex; align-items: center; gap: 0.75rem;
  background: var(--rt-orange); color: var(--rt-white);
  font-family: var(--rt-mono); font-size: 0.8rem; letter-spacing: 0.2em; font-weight: 500;
  padding: 0.9rem 2.5rem; border: none; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 4px 4px 0 rgba(118,171,174,0.4);
}
.rt-cover-btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 rgba(118,171,174,0.5); }

/* ── Hero ── */
.rt-hero {
  position: relative; height: 80vh;
  display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
}
.rt-hero-parallax-wrap { position: absolute; inset: 0; overflow: hidden; }
.rt-hero-parallax-inner {
  position: absolute; inset: -20%;
  display: flex; align-items: center; justify-content: center;
}
.rt-slider-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.2s ease; }
.rt-slider-img.active { opacity: 1; }
.rt-slider-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(48,56,65,0.9) 0%, rgba(48,56,65,0.2) 60%); }
.rt-slider-placeholder { position: absolute; inset: 0; background: var(--rt-dark); }
.rt-hero-content { position: relative; z-index: 3; text-align: left; padding: 3rem; width: 100%; max-width: 900px; }
.rt-hero-tag { font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.3em; color: var(--rt-teal); margin-bottom: 0.75rem; }
.rt-hero-names { font-family: var(--rt-display); font-size: clamp(2.5rem, 7vw, 5rem); color: var(--rt-white); line-height: 1; }
.rt-hero-amp { color: var(--rt-orange); }
.rt-hero-date-strip {
  display: inline-block; background: var(--rt-orange);
  font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.15em;
  color: white; padding: 0.4rem 1rem; margin-top: 1rem;
  animation: rt-slide-right 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both;
}

/* ── Section ── */
.rt-section {
  padding: 5rem 2rem; max-width: 900px; margin: 0 auto;
  text-align: center; position: relative;
}
.rt-section-tag {
  font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.25em;
  color: var(--rt-teal); margin-bottom: 0.75rem; text-align: center;
}
.rt-section-tag--light { color: rgba(118,171,174,0.8); }
.rt-section-title {
  font-family: var(--rt-display); font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: 0.05em; color: var(--rt-dark); margin-bottom: 1rem;
}
.rt-section-title--light { color: var(--rt-white); }
.rt-section-sub { color: var(--rt-muted); font-size: 0.9rem; line-height: 1.7; max-width: 540px; margin: 0 auto 1rem; font-family: var(--rt-slab); font-weight: 300; }
.rt-section-sub--light { color: rgba(245,245,245,0.6); }

/* ── Couple ── */
.rt-couple-grid { display: flex; align-items: stretch; gap: 2rem; justify-content: center; flex-wrap: wrap; margin: 2rem 0; }
.rt-couple-card { text-align: center; flex: 1; min-width: 220px; padding: 2rem; border: 1px solid rgba(48,56,65,0.15); background: var(--rt-white); }
.rt-couple-num { font-family: var(--rt-display); font-size: 3rem; color: rgba(118,171,174,0.3); line-height: 1; margin-bottom: 0.5rem; }
.rt-couple-name { font-family: var(--rt-slab); font-size: 1.4rem; font-weight: 500; color: var(--rt-dark); }
.rt-couple-divider { width: 40px; height: 2px; background: var(--rt-orange); margin: 0.75rem auto; }
.rt-couple-parent-label { font-family: var(--rt-mono); font-size: 0.65rem; letter-spacing: 0.15em; color: var(--rt-teal); margin-bottom: 0.3rem; }
.rt-couple-parent { font-size: 0.9rem; color: var(--rt-muted); font-family: var(--rt-slab); font-weight: 300; }
.rt-couple-sep { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; }
.rt-couple-sep-line { width: 1px; flex: 1; background: rgba(118,171,174,0.3); }
.rt-couple-sep-circle { width: 36px; height: 36px; border: 2px solid var(--rt-teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.rt-couple-sep-inner { width: 12px; height: 12px; background: var(--rt-orange); border-radius: 50%; }

/* ── Countdown ── */
.rt-countdown { background: var(--rt-dark); padding: 0 0 4rem; text-align: center; position: relative; overflow: hidden; }
.rt-countdown-stripe {
  height: 5px;
  background: linear-gradient(to right, var(--rt-teal), var(--rt-orange), var(--rt-teal));
  background-size: 200% 100%;
}
.rt-stripe-anim { animation: rt-stripe-move 3s linear infinite; }
@keyframes rt-stripe-move {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
.rt-countdown-content { padding: 3rem 2rem; }
.rt-countdown-title { font-family: var(--rt-display); font-size: clamp(2rem, 5vw, 3.5rem); color: var(--rt-white); letter-spacing: 0.05em; margin-bottom: 1rem; }
.rt-countdown-grid { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-top: 2rem; }
.rt-countdown-box {
  text-align: center; min-width: 80px;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.rt-countdown-box--visible { opacity: 1; transform: none; }
.rt-countdown-num {
  display: block; font-family: var(--rt-display); font-size: 3.5rem;
  color: var(--rt-orange); line-height: 1;
  transition: transform 0.15s ease;
}
.rt-num-flip { animation: rt-num-tick 0.1s ease; }
@keyframes rt-num-tick {
  0%   { transform: translateY(-4px); opacity: 0.7; }
  100% { transform: translateY(0);    opacity: 1;   }
}
.rt-countdown-sep { width: 30px; height: 2px; background: var(--rt-teal); margin: 0.4rem auto; }
.rt-countdown-label { display: block; font-family: var(--rt-mono); font-size: 0.65rem; letter-spacing: 0.2em; color: rgba(118,171,174,0.7); }

/* ── Events ── */
.rt-events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 1.5rem; margin-top: 2rem; }
.rt-event-card {
  display: flex; gap: 1.5rem; align-items: flex-start;
  background: var(--rt-white); padding: 2rem;
  border: 1px solid rgba(48,56,65,0.1);
  border-left: 4px solid transparent;
  text-align: left; position: relative; overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-left-color 0.4s ease;
}
.rt-event-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(48,56,65,0.12); }
.rt-visible.rt-event-card { border-left-color: var(--rt-orange); }

/* Animasi border kiri */
.rt-event-border-anim {
  position: absolute; left: 0; top: 0; width: 4px; height: 0;
  background: var(--rt-orange);
  transition: height 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s;
}
.rt-visible .rt-event-border-anim { height: 100%; }

.rt-event-num { font-family: var(--rt-display); font-size: 2.5rem; color: rgba(118,171,174,0.3); line-height: 1; flex-shrink: 0; transition: color 0.3s; }
.rt-event-card:hover .rt-event-num { color: rgba(255,87,34,0.3); }
.rt-event-content { flex: 1; }
.rt-event-label { font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.2em; color: var(--rt-teal); margin-bottom: 0.5rem; }

/* Animasi sep grow */
.rt-sep-grow { width: 0; height: 2px; background: var(--rt-orange); margin: 0.5rem 0; transition: width 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s; }
.rt-visible .rt-sep-grow { width: 30px; }

.rt-event-date { font-family: var(--rt-slab); font-size: 0.85rem; font-weight: 500; color: var(--rt-dark); }
.rt-event-time { font-family: var(--rt-display); font-size: 1.75rem; color: var(--rt-orange); line-height: 1.1; margin: 0.25rem 0; }
.rt-event-loc { font-size: 0.85rem; color: var(--rt-muted); line-height: 1.5; margin-bottom: 0.75rem; font-family: var(--rt-slab); font-weight: 300; }
.rt-maps-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: var(--rt-dark); color: var(--rt-teal);
  font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.15em;
  padding: 0.5rem 1.25rem; text-decoration: none;
  transition: background 0.2s, color 0.2s, transform 0.15s;
  border: 1px solid var(--rt-teal);
}
.rt-maps-btn:hover { background: var(--rt-teal); color: var(--rt-white); transform: translateX(4px); }

/* ── Gallery ── */
.rt-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 4px; margin-top: 2rem; max-width: 900px; margin-left: auto; margin-right: auto; }
.rt-gallery-item { aspect-ratio: 1; overflow: hidden; position: relative; }
.rt-gallery-wide { grid-column: span 2; aspect-ratio: 2/1; }
.rt-gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; filter: grayscale(20%); }
.rt-gallery-item:hover .rt-gallery-img { transform: scale(1.06); filter: grayscale(0%); }
.rt-gallery-overlay { position: absolute; inset: 0; border: 2px solid transparent; transition: border-color 0.3s; }
.rt-gallery-item:hover .rt-gallery-overlay { border-color: var(--rt-orange); }

/* ── Love Story ── */
.rt-love-story { font-family: var(--rt-slab); font-weight: 300; font-size: 1rem; line-height: 1.9; color: var(--rt-muted); max-width: 600px; margin: 1.5rem auto 0; text-align: left; border-left: 3px solid var(--rt-teal); padding-left: 1.5rem; }

/* ── Gift ── */
.rt-gift-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1rem; margin-top: 1.5rem; max-width: 700px; margin-left: auto; margin-right: auto; }
.rt-gift-card { background: rgba(245,245,245,0.05); border: 1px solid rgba(118,171,174,0.3); padding: 1.5rem; text-align: center; }
.rt-gift-bank { font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.2em; color: var(--rt-teal); margin-bottom: 0.5rem; }
.rt-gift-sep { width: 30px; height: 1px; background: var(--rt-orange); margin: 0.5rem auto; }
.rt-gift-number { font-family: var(--rt-display); font-size: 1.5rem; color: var(--rt-white); margin-bottom: 0.25rem; letter-spacing: 0.05em; }
.rt-gift-owner { font-size: 0.8rem; color: rgba(245,245,245,0.5); margin-bottom: 1rem; font-family: var(--rt-mono); }
.rt-gift-copy { background: transparent; color: var(--rt-orange); border: 1px solid var(--rt-orange); padding: 0.4rem 1rem; font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.15em; cursor: pointer; transition: background 0.2s, color 0.2s; }
.rt-gift-copy:hover { background: var(--rt-orange); color: white; }

/* ── Guest Book ── */
.rt-gb-form { background: var(--rt-white); border: 1px solid rgba(48,56,65,0.15); border-top: 3px solid var(--rt-orange); padding: 2rem; margin-bottom: 2rem; }
.rt-gb-success { background: rgba(118,171,174,0.1); color: var(--rt-teal); border: 1px solid rgba(118,171,174,0.3); padding: 0.75rem 1rem; font-family: var(--rt-mono); font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 1rem; }
.rt-gb-input { display: block; width: 100%; border: 1px solid rgba(48,56,65,0.2); border-bottom: 2px solid rgba(48,56,65,0.15); padding: 0.75rem 1rem; font-size: 0.875rem; font-family: var(--rt-mono); letter-spacing: 0.05em; margin-bottom: 0.75rem; outline: none; transition: border-color 0.2s; background: var(--rt-light); color: var(--rt-dark); text-transform: uppercase; }
.rt-gb-input:focus { border-bottom-color: var(--rt-orange); }
.rt-gb-input::placeholder { color: rgba(48,56,65,0.35); }
.rt-gb-textarea { resize: none; text-transform: none; }
.rt-gb-btn { width: 100%; background: var(--rt-dark); color: var(--rt-white); border: none; padding: 0.9rem; font-family: var(--rt-mono); font-size: 0.75rem; letter-spacing: 0.2em; cursor: pointer; transition: background 0.2s; }
.rt-gb-btn:hover { background: var(--rt-orange); }
.rt-gb-btn:disabled { opacity: 0.6; }
.rt-gb-list { width: 100%; }
.rt-gb-page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 3rem; }
.rt-gb-entry { display: flex; gap: 1rem; align-items: flex-start; background: var(--rt-white); padding: 1rem 1.25rem; border-left: 3px solid var(--rt-teal); }
.rt-gb-avatar { width: 36px; height: 36px; background: var(--rt-dark); color: var(--rt-teal); font-family: var(--rt-display); font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rt-gb-body { flex: 1; }
.rt-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem; }
.rt-gb-name { font-family: var(--rt-mono); font-size: 0.8rem; letter-spacing: 0.1em; color: var(--rt-dark); font-weight: 500; }
.rt-gb-rsvp { font-family: var(--rt-mono); font-size: 0.65rem; letter-spacing: 0.08em; padding: 0.15rem 0.5rem; }
.rt-rsvp-hadir       { background: rgba(118,171,174,0.15); color: var(--rt-teal); }
.rt-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.rt-rsvp-ragu_ragu   { background: rgba(255,87,34,0.1); color: var(--rt-orange); }
.rt-gb-wishes { font-size: 0.875rem; color: var(--rt-muted); line-height: 1.65; font-family: var(--rt-slab); font-weight: 300; }
.rt-gb-time { font-family: var(--rt-mono); font-size: 0.7rem; color: rgba(48,56,65,0.35); margin-top: 0.4rem; letter-spacing: 0.05em; }
.rt-gb-list .swiper-button-next,
.rt-gb-list .swiper-button-prev { color: var(--rt-teal); transform: scale(0.75); }
.rt-gb-list .swiper-pagination-bullet { background: var(--rt-dark); opacity: 0.3; }
.rt-gb-list .swiper-pagination-bullet-active { background: var(--rt-orange); opacity: 1; }

/* ── Footer ── */
.rt-footer { background: var(--rt-dark); padding: 5rem 2rem; text-align: center; }
.rt-footer-stripe { height: 6px; background: linear-gradient(to right, var(--rt-teal), var(--rt-orange), var(--rt-teal)); }
.rt-footer-content { padding: 3rem 2rem; }
.rt-footer-eyebrow { font-family: var(--rt-mono); font-size: 0.7rem; letter-spacing: 0.3em; color: var(--rt-teal); margin-bottom: 1rem; }
.rt-footer-names { font-family: var(--rt-display); font-size: clamp(2.5rem, 7vw, 5rem); color: var(--rt-white); letter-spacing: 0.03em; margin: 1rem 0 0.5rem; }
.rt-footer-date { font-family: var(--rt-mono); font-size: 0.75rem; letter-spacing: 0.15em; color: rgba(118,171,174,0.6); margin-bottom: 1rem; }
.rt-footer-credit { font-family: var(--rt-mono); font-size: 0.65rem; letter-spacing: 0.2em; color: rgba(245,245,245,0.2); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .rt-couple-grid { flex-direction: column; }
  .rt-couple-sep { flex-direction: row; }
  .rt-couple-sep-line { flex: 1; width: auto; height: 1px; }
  .rt-gallery-grid { grid-template-columns: repeat(2,1fr); }
  .rt-gallery-wide { grid-column: span 2; }
  .rt-countdown-grid { gap: 1rem; }
  .rt-section { padding: 3.5rem 1.5rem; }
  .rt-cover-date-box { flex-direction: column; gap: 0.5rem; }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .rt-cursor { animation: none; }
}
`;
