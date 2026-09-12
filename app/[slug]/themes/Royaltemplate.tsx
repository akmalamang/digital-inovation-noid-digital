'use client';
// app/[slug]/themes/RoyalTemplate.tsx
// Tema 5: Royal Kingdom — F0F2BD / B2CD9C / CA7842 / 4B352A
// Fitur: Parallax scroll, animasi per section, ornamen kerajaan

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

// ── Path aset — letakkan file di public/themes/royal/ ─────────────────────────
const ASSETS = {
  // Ornamen sudut (ukiran / batik / motif kerajaan)
  cornerTL: '/themes/royal/kerajaan-top-left.png',
  cornerTR: '/themes/royal/kerajaan-top-right.png',
  cornerBL: '/themes/royal/kerajaan-bottom-left.png',
  cornerBR: '/themes/royal/kerajaan-bottom-right.png',
  // Ornamen tengah
  crown: '/themes/royal/kerajaan-mahkota.png', // mahkota di cover
  divider: '/themes/royal/ornamen-tengah.png', // garis pemisah ornamen
  sealTop: '/themes/royal/ornamen-bunga-kerajaan.png', // ornamen atas section
  sealBottom: '/themes/royal/ornamen-atas.png', // ornamen bawah section
  // Background parallax (opsional — bisa pakai foto dari galleries)
  bgPattern: '/themes/royal/bg-kerajaan.png', // tekstur batik/songket
};

// ── Hook Parallax ─────────────────────────────────────────────────────────────
function useParallax(speed = 0.3) {
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

// ── Ornamen sudut ──────────────────────────────────────────────────────────────
function RoyalCorners({ size = 140, opacity = 1 }: { size?: number; opacity?: number }) {
  const style = { width: size, height: size, opacity };
  return (
    <>
      <img src={ASSETS.cornerTL} alt="" aria-hidden="true" className="rk-corner rk-corner-tl" style={style} />
      <img src={ASSETS.cornerTR} alt="" aria-hidden="true" className="rk-corner rk-corner-tr" style={style} />
      <img src={ASSETS.cornerBL} alt="" aria-hidden="true" className="rk-corner rk-corner-bl" style={style} />
      <img src={ASSETS.cornerBR} alt="" aria-hidden="true" className="rk-corner rk-corner-br" style={style} />
    </>
  );
}

// ── Divider ornamen ───────────────────────────────────────────────────────────
function RoyalDivider({ label }: { label?: string }) {
  return (
    <div className="rk-divider">
      <div className="rk-divider-line" />
      {label ? <span className="rk-divider-label">{label}</span> : <img src={ASSETS.divider} alt="" aria-hidden="true" className="rk-divider-img" />}
      <div className="rk-divider-line" />
    </div>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function RoyalTemplate({ invitation }: { invitation: Invitation }) {
  const d = invitation.weddingDetail;
  const [opened, setOpened] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuestName(params.get('to') ?? '');
  }, []);

  // Fade-in observer + parallax init setelah dibuka
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.rk-fade');
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('rk-visible');
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
      <div className="rk-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#4B352A' }}>Detail undangan belum tersedia.</p>
      </div>
    );
  }

  const sliderPhotos = invitation.galleries.filter((g) => g.type === 'slider');
  const galleryPhotos = invitation.galleries.filter((g) => g.type === 'gallery');
  const bgPhoto = invitation.galleries.find((g) => g.type === 'background');

  return (
    <>
      {!opened && <RkCover detail={d} guestName={guestName} bgPhoto={bgPhoto?.filePath} onOpen={() => setOpened(true)} />}
      {opened && (
        <div className="rk-wrap">
          <RkHero detail={d} sliderPhotos={sliderPhotos} />
          <RkCouple detail={d} />
          <RkCountdown detail={d} bgPhoto={bgPhoto?.filePath} />
          <RkEvents detail={d} />
          {galleryPhotos.length > 0 && <RkGallery photos={galleryPhotos} />}
          {d.loveStory && <RkLoveStory story={d.loveStory} bgPhoto={bgPhoto?.filePath} />}
          {d.liveStreamingUrl && <RkLiveStream url={d.liveStreamingUrl} />}
          {invitation.digitalWallets.length > 0 && <RkGift wallets={invitation.digitalWallets} />}
          <RkGuestBook invitationId={invitation.id} guestBooks={invitation.guestBooks} defaultName={guestName} />
          <RkFooter detail={d} />
        </div>
      )}
      <style>{RK_STYLES}</style>
    </>
  );
}

// ── Cover ──────────────────────────────────────────────────────────────────────
function RkCover({ detail, guestName, bgPhoto, onOpen }: { detail: WeddingDetail; guestName: string; bgPhoto?: string; onOpen: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const audio = new Audio('/music/wedding.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Parallax pada cover saat scroll
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      el.style.transform = `translateY(${window.scrollY * 0.4}px)`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleOpen() {
    if (audioRef.current && !muted) audioRef.current.play().catch(() => {});

    // Konfetti emas kerajaan
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
    script.onload = () => {
      const confetti = (window as any).confetti;
      if (!confetti) return;
      const colors = ['#F0F2BD', '#CA7842', '#B2CD9C', '#4B352A', '#ffffff'];
      confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.9 }, colors });
      setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.9 }, colors }), 200);
      setTimeout(() => confetti({ particleCount: 150, spread: 120, origin: { x: 0.5, y: 0.6 }, colors, gravity: 0.7 }), 400);
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
    <div className="rk-cover">
      {/* Background parallax */}
      <div ref={parallaxRef} className="rk-cover-bg" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : { backgroundImage: `url(${ASSETS.bgPattern})` }} />
      <div className="rk-cover-overlay" />

      {/* Ornamen sudut */}
      <RoyalCorners size={180} />

      {/* Tombol mute */}
      <button onClick={toggleMute} className="rk-mute">
        {muted ? '🔇' : '🎵'}
      </button>

      {/* Konten cover */}
      <div className={`rk-cover-content ${loaded ? 'rk-cover-loaded' : ''}`}>
        {/* Mahkota animasi */}
        <div className="rk-crown-wrap">
          <img src={ASSETS.crown} alt="" aria-hidden="true" className="rk-crown" />
        </div>

        <p className="rk-cover-eyebrow">~ Undangan Pernikahan Kerajaan ~</p>

        <div className="rk-cover-frame">
          <div className="rk-cover-frame-corner rk-cover-frame-tl" />
          <div className="rk-cover-frame-corner rk-cover-frame-tr" />
          <div className="rk-cover-frame-corner rk-cover-frame-bl" />
          <div className="rk-cover-frame-corner rk-cover-frame-br" />

          <h1 className="rk-cover-names">
            {detail.brideShortName}
            <span className="rk-cover-amp"> & </span>
            {detail.bridegroomShortName}
          </h1>
        </div>

        <RoyalDivider label="✦" />

        <p className="rk-cover-date">
          {new Date(detail.receptionDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        {guestName && (
          <div className="rk-cover-guest">
            <p className="rk-cover-guest-label">Kepada Yang Terhormat</p>
            <p className="rk-cover-guest-name">{guestName}</p>
          </div>
        )}

        <button onClick={handleOpen} className="rk-cover-btn">
          ✦ Buka Undangan ✦
        </button>
        <p className="rk-cover-scroll">~ gulir untuk melihat ~</p>
      </div>
    </div>
  );
}

// ── Hero dengan parallax ───────────────────────────────────────────────────────
function RkHero({ detail, sliderPhotos }: { detail: WeddingDetail; sliderPhotos: Gallery[] }) {
  const [current, setCurrent] = useState(0);
  const parallaxRef = useParallax(0.25);

  useEffect(() => {
    if (sliderPhotos.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % sliderPhotos.length), 4500);
    return () => clearInterval(t);
  }, [sliderPhotos.length]);

  return (
    <section className="rk-hero rk-fade">
      <RoyalCorners size={120} opacity={0.6} />
      <div className="rk-hero-parallax-wrap" style={{ overflow: 'hidden' }}>
        <div ref={parallaxRef} className="rk-hero-parallax-inner">
          {sliderPhotos.length > 0 ? sliderPhotos.map((p, i) => <img key={p.id} src={p.filePath} alt="" className={`rk-slider-img ${i === current ? 'active' : ''}`} />) : <div className="rk-slider-placeholder" />}
        </div>
        <div className="rk-hero-overlay" />
      </div>

      <div className="rk-hero-content">
        <img src={ASSETS.sealTop} alt="" aria-hidden="true" className="rk-hero-seal" />
        <p className="rk-eyebrow">The Wedding of</p>
        <h2 className="rk-hero-names">
          {detail.brideShortName}
          <em> & </em>
          {detail.bridegroomShortName}
        </h2>
        <p className="rk-hero-date">
          {new Date(detail.receptionDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <img src={ASSETS.sealBottom} alt="" aria-hidden="true" className="rk-hero-seal" />
      </div>
    </section>
  );
}

// ── Couple ─────────────────────────────────────────────────────────────────────
function RkCouple({ detail }: { detail: WeddingDetail }) {
  return (
    <section className="rk-section rk-fade">
      <RoyalCorners size={110} opacity={0.5} />
      <img src={ASSETS.sealTop} alt="" aria-hidden="true" className="rk-section-seal-top" />

      <p className="rk-eyebrow">~ Mempelai ~</p>
      <h2 className="rk-section-title">Bismillahirrahmanirrahim</h2>
      <p className="rk-section-sub">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>

      <RoyalDivider />

      <div className="rk-couple-grid">
        {/* Pengantin Wanita */}
        <div className="rk-couple-card rk-fade" style={{ transitionDelay: '0.1s' }}>
          <div className="rk-couple-badge">♛</div>
          <h3 className="rk-couple-name">{detail.brideName}</h3>
          <p className="rk-couple-parent-label">Putri dari</p>
          <p className="rk-couple-parent">{detail.brideParent}</p>
        </div>

        {/* Divider tengah */}
        <div className="rk-couple-divider">
          <div className="rk-couple-line" />
          <span className="rk-couple-heart">❧</span>
          <div className="rk-couple-line" />
        </div>

        {/* Pengantin Pria */}
        <div className="rk-couple-card rk-fade" style={{ transitionDelay: '0.2s' }}>
          <div className="rk-couple-badge">♚</div>
          <h3 className="rk-couple-name">{detail.bridegroomName}</h3>
          <p className="rk-couple-parent-label">Putra dari</p>
          <p className="rk-couple-parent">{detail.bridegroomParent}</p>
        </div>
      </div>

      <RoyalDivider />
      <img src={ASSETS.sealBottom} alt="" aria-hidden="true" className="rk-section-seal-bottom" />
    </section>
  );
}

// ── Countdown dengan parallax background ──────────────────────────────────────
function RkCountdown({ detail, bgPhoto }: { detail: WeddingDetail; bgPhoto?: string }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const parallaxRef = useParallax(0.2);

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
    <section className="rk-countdown rk-fade">
      {/* Parallax background */}
      <div className="rk-countdown-parallax-wrap">
        <div ref={parallaxRef} className="rk-countdown-parallax-inner" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : { backgroundImage: `url(${ASSETS.bgPattern})` }} />
      </div>
      <div className="rk-countdown-overlay" />

      <RoyalCorners size={120} opacity={0.5} />

      <div className="rk-countdown-content">
        <img src={ASSETS.crown} alt="" aria-hidden="true" className="rk-countdown-crown" />
        <p className="rk-eyebrow rk-eyebrow-light">~ Menghitung Hari ~</p>
        <h2 className="rk-countdown-title">Menuju Hari Bersejarah</h2>
        <RoyalDivider label="✦" />
        <div className="rk-countdown-grid">
          {[
            { val: time.days, label: 'Hari' },
            { val: time.hours, label: 'Jam' },
            { val: time.minutes, label: 'Menit' },
            { val: time.seconds, label: 'Detik' },
          ].map(({ val, label }) => (
            <div key={label} className="rk-countdown-box">
              <span className="rk-countdown-num">{String(val).padStart(2, '0')}</span>
              <span className="rk-countdown-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Events ─────────────────────────────────────────────────────────────────────
function RkEvents({ detail }: { detail: WeddingDetail }) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <section className="rk-section rk-fade">
      <RoyalCorners size={110} opacity={0.5} />
      <img src={ASSETS.sealTop} alt="" aria-hidden="true" className="rk-section-seal-top" />

      <p className="rk-eyebrow">~ Rangkaian Acara ~</p>
      <h2 className="rk-section-title">Jadwal Pernikahan</h2>
      <RoyalDivider />

      <div className="rk-events-grid">
        {[
          {
            badge: '✦ Akad Nikah ✦',
            date: detail.akadDate,
            time: detail.akadTime,
            loc: detail.akadLocation,
            maps: detail.akadMapsUrl,
          },
          {
            badge: '✦ Resepsi ✦',
            date: detail.receptionDate,
            time: detail.receptionTime,
            loc: detail.receptionLocation,
            maps: detail.receptionMapsUrl,
          },
        ].map((ev) => (
          <div key={ev.badge} className="rk-event-card rk-fade">
            <div className="rk-event-frame">
              <div className="rk-event-frame-corner rk-efc-tl" />
              <div className="rk-event-frame-corner rk-efc-tr" />
              <div className="rk-event-frame-corner rk-efc-bl" />
              <div className="rk-event-frame-corner rk-efc-br" />
              <div className="rk-event-badge">{ev.badge}</div>
              <p className="rk-event-date">{fmt(ev.date)}</p>
              <p className="rk-event-time">{ev.time} WIB</p>
              <p className="rk-event-loc">{ev.loc}</p>
              {ev.maps && (
                <a href={ev.maps} target="_blank" rel="noopener noreferrer" className="rk-maps-btn">
                  ✦ Lihat Lokasi
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <img src={ASSETS.sealBottom} alt="" aria-hidden="true" className="rk-section-seal-bottom" />
    </section>
  );
}

// ── Gallery dengan animasi stagger ────────────────────────────────────────────
function RkGallery({ photos }: { photos: Gallery[] }) {
  return (
    <section className="rk-section rk-fade">
      <RoyalCorners size={110} opacity={0.5} />
      <p className="rk-eyebrow">~ Galeri Kerajaan ~</p>
      <h2 className="rk-section-title">Momen Abadi</h2>
      <RoyalDivider />
      <div className="rk-gallery-grid">
        {photos.map((p, i) => (
          <div key={p.id} className={`rk-gallery-item rk-fade ${i === 0 ? 'rk-gallery-wide' : ''}`} style={{ transitionDelay: `${i * 0.08}s` }}>
            <img src={p.filePath} alt="" className="rk-gallery-img" />
            <div className="rk-gallery-frame" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Love Story dengan parallax ─────────────────────────────────────────────────
function RkLoveStory({ story, bgPhoto }: { story: string; bgPhoto?: string }) {
  const parallaxRef = useParallax(0.2);
  return (
    <section className="rk-countdown rk-fade">
      <div className="rk-countdown-parallax-wrap">
        <div ref={parallaxRef} className="rk-countdown-parallax-inner" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : { backgroundImage: `url(${ASSETS.bgPattern})` }} />
      </div>
      <div className="rk-countdown-overlay" />
      <RoyalCorners size={120} opacity={0.5} />
      <div className="rk-countdown-content">
        <p className="rk-eyebrow rk-eyebrow-light">~ Kisah Cinta Kami ~</p>
        <h2 className="rk-countdown-title">Perjalanan Menuju Singgasana</h2>
        <RoyalDivider label="❧" />
        <p className="rk-love-story">{story}</p>
      </div>
    </section>
  );
}

// ── Live Stream ────────────────────────────────────────────────────────────────
function RkLiveStream({ url }: { url: string }) {
  return (
    <section className="rk-section rk-fade" style={{ textAlign: 'center' }}>
      <RoyalCorners size={110} opacity={0.5} />
      <p className="rk-eyebrow">~ Live Streaming ~</p>
      <h2 className="rk-section-title">Saksikan Secara Online</h2>
      <RoyalDivider />
      <a href={url} target="_blank" rel="noopener noreferrer" className="rk-maps-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
        ✦ Tonton Live
      </a>
    </section>
  );
}

// ── Gift ───────────────────────────────────────────────────────────────────────
function RkGift({ wallets }: { wallets: Wallet[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="rk-section rk-fade">
      <RoyalCorners size={110} opacity={0.5} />
      <img src={ASSETS.sealTop} alt="" aria-hidden="true" className="rk-section-seal-top" />
      <p className="rk-eyebrow">~ Persembahan ~</p>
      <h2 className="rk-section-title">Kado Digital</h2>
      <p className="rk-section-sub">Kehadiran dan doa restu Anda adalah persembahan terbaik bagi kami.</p>
      <RoyalDivider />
      <div className="rk-gift-grid">
        {wallets.map((w) => (
          <div key={w.id} className="rk-gift-card">
            <div className="rk-gift-frame">
              <div className="rk-event-frame-corner rk-efc-tl" />
              <div className="rk-event-frame-corner rk-efc-tr" />
              <div className="rk-event-frame-corner rk-efc-bl" />
              <div className="rk-event-frame-corner rk-efc-br" />
              <p className="rk-gift-bank">{w.bankName}</p>
              <p className="rk-gift-number">{w.accountNumber}</p>
              <p className="rk-gift-owner">{w.accountOwner}</p>
              <button onClick={() => handleCopy(w.id, w.accountNumber)} className="rk-gift-copy">
                {copied === w.id ? '✓ Tersalin!' : '✦ Salin Nomor'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Guest Book ─────────────────────────────────────────────────────────────────
function RkGuestBook({ invitationId, guestBooks, defaultName }: { invitationId: number; guestBooks: GuestBook[]; defaultName: string }) {
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
    <section className="rk-section rk-fade">
      <RoyalCorners size={110} opacity={0.5} />
      <img src={ASSETS.sealTop} alt="" aria-hidden="true" className="rk-section-seal-top" />
      <p className="rk-eyebrow">~ Buku Tamu Kerajaan ~</p>
      <h2 className="rk-section-title">Ucapan & Konfirmasi</h2>
      <RoyalDivider />

      <form onSubmit={handleSubmit} className="rk-gb-form">
        {sent && <div className="rk-gb-success">✦ Ucapan terkirim! Terima kasih atas kehadiranmu.</div>}
        <input type="text" value={form.guestName} required placeholder="Nama Yang Terhormat" onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} className="rk-gb-input" />
        <select value={form.rsvp} onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value }))} className="rk-gb-input">
          <option value="hadir">Insya Allah Hadir</option>
          <option value="tidak_hadir">Tidak Bisa Hadir</option>
          <option value="ragu_ragu">Masih Ragu-ragu</option>
        </select>
        <textarea value={form.wishes} required placeholder="Sampaikan ucapan dan doa untuk mempelai..." onChange={(e) => setForm((p) => ({ ...p, wishes: e.target.value }))} rows={3} className="rk-gb-input rk-gb-textarea" />
        <button type="submit" disabled={sending} className="rk-gb-btn">
          {sending ? 'Mengirim...' : '✦ Kirim Ucapan ✦'}
        </button>
      </form>

      {/* Swiper */}
      <div className="rk-gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#CA7842', fontSize: '0.9rem' }}>Belum ada ucapan.</p>
        ) : (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={16} slidesPerView={1} navigation pagination={{ clickable: true }}>
            {Array.from({ length: Math.ceil(entries.length / 3) }, (_, pi) => (
              <SwiperSlide key={pi}>
                <div className="rk-gb-page">
                  {entries.slice(pi * 3, pi * 3 + 3).map((g) => (
                    <div key={g.id} className="rk-gb-entry">
                      <div className="rk-gb-avatar">{g.guestName[0].toUpperCase()}</div>
                      <div className="rk-gb-body">
                        <div className="rk-gb-header">
                          <p className="rk-gb-name">{g.guestName}</p>
                          <span className={`rk-gb-rsvp rk-rsvp-${g.rsvp}`}>{rsvpLabel[g.rsvp]}</span>
                        </div>
                        <p className="rk-gb-wishes">{g.wishes}</p>
                        <p className="rk-gb-time">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <img src={ASSETS.sealBottom} alt="" aria-hidden="true" className="rk-section-seal-bottom" />
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function RkFooter({ detail }: { detail: WeddingDetail }) {
  const parallaxRef = useParallax(0.2);
  return (
    <footer className="rk-footer">
      <div className="rk-countdown-parallax-wrap">
        <div ref={parallaxRef} className="rk-countdown-parallax-inner" style={{ backgroundImage: `url(${ASSETS.bgPattern})` }} />
      </div>
      <div className="rk-footer-overlay" />
      <RoyalCorners size={150} opacity={0.6} />
      <div className="rk-footer-content">
        <img src={ASSETS.crown} alt="" aria-hidden="true" className="rk-footer-crown" />
        <p className="rk-eyebrow rk-eyebrow-light">~ Dengan Penuh Kebahagiaan ~</p>
        <RoyalDivider label="✦" />
        <h2 className="rk-footer-names">
          {detail.brideShortName} & {detail.bridegroomShortName}
        </h2>
        <p className="rk-footer-sub">Terima kasih telah menjadi bagian dari momen bersejarah kami.</p>
        <RoyalDivider label="❧" />
        <p className="rk-footer-credit">Made with ✦ · UndanganDigital</p>
      </div>
    </footer>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const RK_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=IM+Fell+English:ital@0;1&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; max-width: 100%; }

:root {
  --rk-cream:   #F0F2BD;  /* krem keemasan */
  --rk-sage:    #B2CD9C;  /* hijau sage */
  --rk-copper:  #CA7842;  /* tembaga */
  --rk-brown:   #4B352A;  /* coklat tua */
  --rk-gold:    #d4a843;  /* emas aksen */
  --rk-light:   #f9faeb;  /* background terang */
  --rk-white:   #ffffff;
  --rk-text:    #2d1f18;  /* teks utama */
  --rk-muted:   #7a5c46;  /* teks sekunder */
  --rk-serif:   'Cormorant Garamond', Georgia, serif;
  --rk-display: 'Cinzel', serif;         /* font judul kerajaan */
  --rk-classic: 'IM Fell English', serif; /* font klasik */
  --rk-sans:    'Inter', system-ui, sans-serif;
}

/* ── Base ── */
.rk-wrap { font-family: var(--rk-sans); background: var(--rk-light); color: var(--rk-text); overflow-x: hidden; }

/* ── Fade ── */
.rk-fade { opacity: 0; transform: translateY(32px); transition: opacity 0.8s ease, transform 0.8s ease; }
.rk-visible { opacity: 1; transform: none; }

/* ── Ornamen sudut ── */
.rk-corner {
  position: absolute; pointer-events: none; z-index: 3;
  object-fit: contain;
}
.rk-corner-tl { top: 0; left: 0; }
.rk-corner-tr { top: 0; right: 0; transform: scaleX(-1); }
.rk-corner-bl { bottom: 0; left: 0;  }
.rk-corner-br { bottom: 0; right: 0;  }

@media (max-width: 640px) {
  .rk-corner { width: 80px !important; height: 80px !important; }
}

/* ── Divider ── */
.rk-divider {
  display: flex; align-items: center; gap: 1rem;
  max-width: 500px; margin: 1.5rem auto;
}
.rk-divider-line {
  flex: 1; height: 1px;
  background: linear-gradient(to right, transparent, var(--rk-copper), transparent);
}
.rk-divider-label { color: var(--rk-copper); font-size: 1.1rem; letter-spacing: 0.3em; white-space: nowrap; }
.rk-divider-img { width: 70px; height: 35px; object-fit: contain; opacity: 0.8; }

/* ── Section seal ── */
.rk-section-seal-top, .rk-section-seal-bottom {
  width: 80px; height: 40px; object-fit: contain;
  opacity: 0.6; display: block; margin: 0.5rem auto;
}

/* ── Cover ── */
.rk-cover {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; text-align: center; overflow: hidden;
  background: var(--rk-brown);
}
.rk-cover-bg {
  position: absolute; inset: -20%; /* lebih besar untuk parallax */
  background: center/cover no-repeat;
  transition: transform 0.1s linear;
}
.rk-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(75,53,42,0.55) 0%, rgba(43,28,18,0.75) 100%);
}

/* Frame dekoratif di sekeliling nama */
.rk-cover-frame {
  position: relative; display: inline-block;
  padding: 1.5rem 2.5rem; margin: 0.75rem 0 1.25rem;
  border: 1px solid rgba(202,120,66,0.4);
}
.rk-cover-frame-corner {
  position: absolute; width: 16px; height: 16px;
  border-color: var(--rk-copper); border-style: solid;
}
.rk-cover-frame-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.rk-cover-frame-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.rk-cover-frame-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.rk-cover-frame-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

/* Mahkota animasi */
.rk-crown-wrap { margin-bottom: 1.25rem; }
.rk-crown {
  width: 80px; height: 80px; object-fit: contain;
  animation: rk-float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(202,120,66,0.4));
}
@keyframes rk-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}

/* Mute */
.rk-mute {
  position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10;
  background: rgba(240,242,189,0.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(202,120,66,0.4); border-radius: 100px;
  color: var(--rk-cream); font-size: 1rem; padding: 0.45rem 0.85rem;
  cursor: pointer; transition: background 0.2s;
}
.rk-mute:hover { background: rgba(240,242,189,0.25); }

/* Cover content */
.rk-cover-content {
  position: relative; z-index: 4; padding: 2rem;
  opacity: 0; transform: translateY(20px);
  transition: opacity 1s ease 0.3s, transform 1s ease 0.3s;
}
.rk-cover-loaded { opacity: 1; transform: none; }

.rk-cover-eyebrow {
  font-family: var(--rk-classic); font-style: italic;
  color: var(--rk-sage); font-size: 1rem; letter-spacing: 0.12em;
  margin-bottom: 1rem;
}
.rk-cover-names {
  font-family: var(--rk-classic); font-style: italic;
  font-size: clamp(3rem, 10vw, 6rem);
  color: var(--rk-cream); line-height: 1.1;
  text-shadow: 0 2px 20px rgba(75,53,42,0.5);
}
.rk-cover-amp { color: var(--rk-copper); font-style: normal; }
.rk-cover-date {
  font-family: var(--rk-display); font-size: 0.8rem;
  letter-spacing: 0.15em; color: var(--rk-sage);
  margin: 1rem 0 1.5rem;
}
.rk-cover-guest { margin-bottom: 2rem; }
.rk-cover-guest-label {
  font-family: var(--rk-classic); font-style: italic;
  font-size: 0.9rem; color: rgba(240,242,189,0.65);
}
.rk-cover-guest-name {
  font-family: var(--rk-classic); font-size: 1.4rem;
  color: var(--rk-cream); font-weight: 400;
}
.rk-cover-btn {
  display: inline-block;
  background: linear-gradient(135deg, var(--rk-copper), #9a5a2c);
  color: var(--rk-cream); font-family: var(--rk-display);
  font-size: 0.85rem; font-weight: 500; letter-spacing: 0.15em;
  padding: 0.9rem 2.5rem; border-radius: 4px; border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(75,53,42,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(202,120,66,0.5);
}
.rk-cover-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 26px rgba(75,53,42,0.5); }
.rk-cover-scroll {
  font-family: var(--rk-classic); font-style: italic;
  color: rgba(240,242,189,0.45); font-size: 0.85rem; margin-top: 1.25rem;
}

/* ── Hero ── */
.rk-hero {
  position: relative; height: 90vh;
  display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
}
.rk-hero-parallax-wrap { position: absolute; inset: 0; overflow: hidden; }
.rk-hero-parallax-inner {
  position: absolute; inset: -20%;
  display: flex; align-items: center; justify-content: center;
}
.rk-slider-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; opacity: 0; transition: opacity 1.2s ease;
}
.rk-slider-img.active { opacity: 1; }
.rk-slider-placeholder { position: absolute; inset: 0; background: linear-gradient(135deg, var(--rk-brown), var(--rk-copper)); }
.rk-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(75,53,42,0.8) 0%, rgba(75,53,42,0.2) 60%);
}
.rk-hero-content {
  position: relative; z-index: 3; text-align: center;
  padding: 3rem 2rem; color: white;
}
.rk-hero-seal { width: 60px; height: 30px; object-fit: contain; opacity: 0.7; margin: 0.5rem auto; display: block; }
.rk-eyebrow {
  font-family: var(--rk-display); font-size: 0.75rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--rk-sage); text-align: center;
  margin-bottom: 0.5rem;
}
.rk-eyebrow-light { color: var(--rk-cream) !important; }
.rk-hero-names {
  font-family: var(--rk-classic); font-style: italic;
  font-size: clamp(2.5rem, 8vw, 5rem); line-height: 1.1; color: var(--rk-cream);
}
.rk-hero-names em { font-style: normal; color: var(--rk-sage); }
.rk-hero-date { font-size: 0.85rem; color: rgba(240,242,189,0.75); margin-top: 0.75rem; letter-spacing: 0.08em; }

/* ── Section ── */
.rk-section {
  padding: 5.5rem 2rem; max-width: 900px; margin: 0 auto;
  text-align: center; position: relative;
}
.rk-section-title {
  font-family: var(--rk-classic); font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 400; color: var(--rk-text); margin-bottom: 1rem;
}
.rk-section-sub { color: var(--rk-muted); font-size: 0.95rem; line-height: 1.75; max-width: 540px; margin: 0 auto 1rem; }

/* ── Couple ── */
.rk-couple-grid { display: flex; align-items: center; gap: 2rem; justify-content: center; flex-wrap: wrap; margin: 2rem 0; }
.rk-couple-card { text-align: center; flex: 1; min-width: 200px; }
.rk-couple-badge { font-size: 2.5rem; color: var(--rk-copper); margin-bottom: 0.75rem; line-height: 1; animation: rk-pulse 2s ease-in-out infinite; }
@keyframes rk-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
.rk-couple-name { font-family: var(--rk-classic); font-style: italic; font-size: 1.8rem; color: var(--rk-text); margin-bottom: 0.5rem; }
.rk-couple-parent-label { font-size: 0.8rem; color: var(--rk-muted); font-family: var(--rk-display); letter-spacing: 0.1em; }
.rk-couple-parent { font-size: 0.95rem; color: var(--rk-text); font-weight: 500; margin-top: 0.25rem; }
.rk-couple-divider { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.rk-couple-line { width: 1px; height: 70px; background: linear-gradient(to bottom, transparent, var(--rk-copper), transparent); }
.rk-couple-heart { font-family: var(--rk-classic); font-size: 2rem; color: var(--rk-copper); }

/* ── Countdown ── */
.rk-countdown { position: relative; padding: 6rem 2rem; text-align: center; overflow: hidden; }
.rk-countdown-parallax-wrap { position: absolute; inset: 0; overflow: hidden; }
.rk-countdown-parallax-inner {
  position: absolute; inset: -20%;
  background: center/cover no-repeat;
  transition: transform 0.1s linear;
}
.rk-countdown-overlay {
  position: absolute; inset: 0;
  background: rgba(75,53,42,0.82);
}
.rk-countdown-content { position: relative; z-index: 2; }
.rk-countdown-crown { width: 60px; height: 60px; object-fit: contain; margin: 0 auto 1rem; display: block; animation: rk-float 3s ease-in-out infinite; filter: drop-shadow(0 3px 8px rgba(202,120,66,0.4)); }
.rk-countdown-title {
  font-family: var(--rk-classic); font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 400; color: var(--rk-cream); margin-bottom: 1rem;
}
.rk-countdown-grid { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; margin-top: 2rem; }
.rk-countdown-box {
  background: rgba(240,242,189,0.08); backdrop-filter: blur(8px);
  border: 1px solid rgba(202,120,66,0.4); border-radius: 4px;
  padding: 1.5rem 1.75rem; min-width: 85px; text-align: center;
  position: relative;
}
.rk-countdown-box::before, .rk-countdown-box::after {
  content: '✦'; position: absolute; color: var(--rk-copper); font-size: 0.5rem;
  opacity: 0.6;
}
.rk-countdown-box::before { top: 4px; left: 4px; }
.rk-countdown-box::after  { bottom: 4px; right: 4px; }
.rk-countdown-num { display: block; font-family: var(--rk-classic); font-size: 2.8rem; font-weight: 400; color: var(--rk-cream); line-height: 1; }
.rk-countdown-label { display: block; font-family: var(--rk-display); font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--rk-sage); margin-top: 0.4rem; }

/* ── Events ── */
.rk-events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 2rem; margin-top: 2rem; }
.rk-event-card {}
.rk-event-frame {
  background: var(--rk-white); border: 1px solid var(--rk-sage);
  border-radius: 4px; padding: 2rem; text-align: center; position: relative;
  box-shadow: 0 4px 20px rgba(75,53,42,0.1);
}
/* Frame corner ornamen di event card */
.rk-event-frame-corner {
  position: absolute; width: 14px; height: 14px;
  border-color: var(--rk-copper); border-style: solid;
}
.rk-efc-tl { top: 4px; left: 4px; border-width: 2px 0 0 2px; }
.rk-efc-tr { top: 4px; right: 4px; border-width: 2px 2px 0 0; }
.rk-efc-bl { bottom: 4px; left: 4px; border-width: 0 0 2px 2px; }
.rk-efc-br { bottom: 4px; right: 4px; border-width: 0 2px 2px 0; }
.rk-event-badge { font-family: var(--rk-display); font-size: 0.8rem; letter-spacing: 0.15em; color: var(--rk-copper); font-weight: 600; margin-bottom: 1rem; }
.rk-event-date { font-family: var(--rk-classic); font-style: italic; font-size: 1rem; color: var(--rk-text); margin-bottom: 0.25rem; }
.rk-event-time { font-family: var(--rk-display); font-size: 1.4rem; font-weight: 600; color: var(--rk-brown); margin-bottom: 0.75rem; }
.rk-event-loc { font-size: 0.85rem; color: var(--rk-muted); line-height: 1.5; margin-bottom: 1rem; }
.rk-maps-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: linear-gradient(135deg, var(--rk-copper), #9a5a2c);
  color: var(--rk-cream); font-family: var(--rk-display); font-size: 0.75rem;
  letter-spacing: 0.1em; font-weight: 500;
  padding: 0.55rem 1.4rem; border-radius: 4px; text-decoration: none;
  transition: transform 0.2s; box-shadow: 0 3px 10px rgba(75,53,42,0.3);
}
.rk-maps-btn:hover { transform: translateY(-1px); }

/* ── Gallery ── */
.rk-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-top: 2rem; }
.rk-gallery-item { border-radius: 2px; overflow: hidden; aspect-ratio: 1; position: relative; }
.rk-gallery-wide { grid-column: span 2; aspect-ratio: 2/1; }
.rk-gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.rk-gallery-item:hover .rk-gallery-img { transform: scale(1.06); }
.rk-gallery-frame {
  position: absolute; inset: 6px; pointer-events: none;
  border: 1px solid rgba(202,120,66,0.4);
}

/* ── Love Story ── */
.rk-love-story {
  font-family: var(--rk-classic); font-style: italic;
  color: rgba(240,242,189,0.8); font-size: 1.05rem; line-height: 2;
  max-width: 600px; margin: 1.5rem auto 0;
}

/* ── Gift ── */
.rk-gift-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1.5rem; margin-top: 1.5rem; }
.rk-gift-card {}
.rk-gift-frame {
  background: var(--rk-white); border: 1px solid var(--rk-sage);
  border-radius: 4px; padding: 1.75rem; text-align: center; position: relative;
  box-shadow: 0 4px 15px rgba(75,53,42,0.08);
}
.rk-gift-bank { font-family: var(--rk-display); font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--rk-copper); margin-bottom: 0.5rem; }
.rk-gift-number { font-family: monospace; font-size: 1.3rem; font-weight: 700; color: var(--rk-text); margin-bottom: 0.25rem; }
.rk-gift-owner { font-size: 0.85rem; color: var(--rk-muted); margin-bottom: 1rem; }
.rk-gift-copy { background: linear-gradient(135deg, var(--rk-copper), #9a5a2c); color: var(--rk-cream); border: none; border-radius: 4px; padding: 0.5rem 1.2rem; font-family: var(--rk-display); font-size: 0.75rem; letter-spacing: 0.1em; cursor: pointer; transition: transform 0.15s; }
.rk-gift-copy:hover { transform: translateY(-1px); }

/* ── Guest Book ── */
.rk-gb-form { background: var(--rk-white); border: 1px solid var(--rk-sage); border-radius: 4px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(75,53,42,0.08); position: relative; }
.rk-gb-form::before, .rk-gb-form::after { content: '✦'; position: absolute; color: var(--rk-copper); font-size: 0.6rem; }
.rk-gb-form::before { top: 8px; left: 8px; }
.rk-gb-form::after  { bottom: 8px; right: 8px; }
.rk-gb-success { background: #f7f5e6; color: var(--rk-brown); border: 1px solid var(--rk-sage); border-radius: 4px; padding: 0.75rem 1rem; font-size: 0.875rem; font-family: var(--rk-classic); font-style: italic; margin-bottom: 1rem; }
.rk-gb-input { display: block; width: 100%; border: 1px solid rgba(178,205,156,0.5); border-radius: 4px; padding: 0.75rem 1rem; font-size: 0.9rem; font-family: var(--rk-sans); margin-bottom: 0.75rem; outline: none; transition: border-color 0.2s; background: var(--rk-light); color: var(--rk-text); }
.rk-gb-input:focus { border-color: var(--rk-copper); box-shadow: 0 0 0 3px rgba(202,120,66,0.1); }
.rk-gb-textarea { resize: none; }
.rk-gb-btn { width: 100%; background: linear-gradient(135deg, var(--rk-copper), #9a5a2c); color: var(--rk-cream); border: none; border-radius: 4px; padding: 0.9rem; font-family: var(--rk-display); font-size: 0.8rem; letter-spacing: 0.12em; cursor: pointer; transition: transform 0.15s; box-shadow: 0 4px 14px rgba(75,53,42,0.3); }
.rk-gb-btn:hover { transform: translateY(-1px); }
.rk-gb-btn:disabled { opacity: 0.6; }

.rk-gb-list { width: 100%; }
.rk-gb-page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 3rem; }
.rk-gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--rk-white); border-radius: 4px; padding: 1rem 1.25rem; border: 1px solid rgba(178,205,156,0.4); }
.rk-gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--rk-copper), var(--rk-brown)); color: var(--rk-cream); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.rk-gb-body { flex: 1; }
.rk-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.rk-gb-name { font-family: var(--rk-classic); font-size: 0.95rem; color: var(--rk-text); }
.rk-gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; font-family: var(--rk-display); letter-spacing: 0.05em; }
.rk-rsvp-hadir { background: rgba(178,205,156,0.25); color: #4a6e3a; }
.rk-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.rk-rsvp-ragu_ragu { background: rgba(240,242,189,0.5); color: #7a6a10; }
.rk-gb-wishes { font-size: 0.875rem; color: var(--rk-muted); line-height: 1.65; font-family: var(--rk-classic); font-style: italic; }
.rk-gb-time { font-size: 0.72rem; color: var(--rk-copper); margin-top: 0.4rem; opacity: 0.7; }

.rk-gb-list .swiper-button-next,
.rk-gb-list .swiper-button-prev { color: var(--rk-copper); transform: scale(0.75); }
.rk-gb-list .swiper-pagination-bullet { background: var(--rk-sage); opacity: 1; }
.rk-gb-list .swiper-pagination-bullet-active { background: var(--rk-copper); }

/* ── Footer ── */
.rk-footer { position: relative; padding: 7rem 2rem; text-align: center; overflow: hidden; }
.rk-footer-overlay { position: absolute; inset: 0; background: rgba(75,53,42,0.88); }
.rk-footer-content { position: relative; z-index: 2; }
.rk-footer-crown { width: 70px; height: 70px; object-fit: contain; margin: 0 auto 1.25rem; display: block; animation: rk-float 3s ease-in-out infinite; filter: drop-shadow(0 4px 12px rgba(202,120,66,0.5)); }
.rk-footer-names { font-family: var(--rk-classic); font-style: italic; font-size: clamp(2.5rem, 7vw, 4.5rem); color: var(--rk-cream); margin: 1rem 0; }
.rk-footer-sub { color: rgba(240,242,189,0.55); font-size: 0.9rem; margin-bottom: 1rem; font-family: var(--rk-classic); font-style: italic; }
.rk-footer-credit { color: var(--rk-copper); font-size: 0.8rem; font-family: var(--rk-display); letter-spacing: 0.1em; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .rk-couple-grid { flex-direction: column; }
  .rk-couple-divider { flex-direction: row; }
  .rk-couple-line { width: 60px; height: 1px; }
  .rk-gallery-grid { grid-template-columns: repeat(2,1fr); }
  .rk-gallery-wide { grid-column: span 2; }
  .rk-countdown-grid { gap: 0.75rem; }
  .rk-countdown-box { padding: 1rem 1.25rem; min-width: 70px; }
  .rk-countdown-num { font-size: 2rem; }
  .rk-section { padding: 3.5rem 1.5rem; }
  .rk-cover-names { font-size: clamp(2.5rem, 12vw, 4.5rem); }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .rk-crown, .rk-footer-crown, .rk-countdown-crown { animation: none; }
  .rk-cover-bg { transition: none; }
  .rk-hero-parallax-inner, .rk-countdown-parallax-inner { transition: none; }
}
`;
