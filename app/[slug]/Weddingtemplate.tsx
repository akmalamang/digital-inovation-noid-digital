'use client';
// app/[slug]/WeddingTemplate.tsx
// Template undangan digital — semua section dalam satu halaman scroll

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useState, useEffect, useRef } from 'react';
import { launchConfetti } from './utils/launchConfetti';

// Emoji bunga untuk animasi jatuh
const FLOWERS = ['🌸', '🌺', '🌹', '🌷', '💐', '✿', '❀', '🌼'];

function generatePetals(count = 24) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    flower: FLOWERS[i % FLOWERS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${5 + Math.random() * 5}s`,
    size: `${0.8 + Math.random() * 1.2}rem`,
  }));
}
// const PETALS = generatePetals(24);

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

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function WeddingTemplate({ invitation }: { invitation: Invitation }) {
  const d = invitation.weddingDetail;
  const [opened, setOpened] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Trigger fade-in observer setelah konten muncul
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.fade-section');
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('visible');
          }),
        { threshold: 0.05 },
      );
      els.forEach((el) => obs.observe(el));
    }, 150); // delay kecil supaya DOM sudah render
    return () => clearTimeout(timer);
  }, [opened]);

  // Ambil nama tamu dari query param ?to=NamaTamu
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuestName(params.get('to') ?? '');
  }, []);

  if (!d) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-white">
        <p>Detail undangan belum tersedia.</p>
      </div>
    );
  }

  const sliderPhotos = invitation.galleries.filter((g) => g.type === 'slider');
  const galleryPhotos = invitation.galleries.filter((g) => g.type === 'gallery');
  const bgPhoto = invitation.galleries.find((g) => g.type === 'background');

  return (
    <>
      {/* ── Cover / Sampul ── */}
      {!opened && <Cover detail={d} guestName={guestName} bgPhoto={bgPhoto?.filePath} onOpen={() => setOpened(true)} />}

      {/* ── Isi Undangan ── */}
      {opened && (
        <div className="wedding-wrap">
          <SectionHero detail={d} sliderPhotos={sliderPhotos} />
          <SectionCouple detail={d} />
          <SectionCountdown detail={d} />
          <SectionEvents detail={d} />
          {galleryPhotos.length > 0 && <SectionGallery photos={galleryPhotos} />}
          {d.loveStory && <SectionLoveStory story={d.loveStory} />}
          {d.liveStreamingUrl && <SectionLiveStream url={d.liveStreamingUrl} />}
          {invitation.digitalWallets.length > 0 && <SectionGift wallets={invitation.digitalWallets} />}
          <SectionGuestBook invitationId={invitation.id} guestBooks={invitation.guestBooks} defaultName={guestName} />
          <Footer detail={d} />
        </div>
      )}

      <style>{STYLES}</style>
    </>
  );
}

// ── Cover ──────────────────────────────────────────────────────────────────────
function Cover({ detail, guestName, bgPhoto, onOpen }: { detail: WeddingDetail; guestName: string; bgPhoto?: string; onOpen: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [petals, setPetals] = useState<ReturnType<typeof generatePetals>>([]);

  useEffect(() => {
    // Generate petals hanya di client — hindari hydration mismatch
    setPetals(generatePetals(24));

    // Pakai audio dari URL yang bebas hotlink
    const audio = new Audio('');
    audio.loop = true;
    audio.volume = 0.3;
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
    // Konfetti dengan warna sesuai tema
    launchConfetti();

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
    <div className="cover" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : {}}>
      <div className="cover-overlay" />

      {/* Animasi bunga jatuh — hanya render setelah client mount */}
      {petals.length > 0 && (
        <div className="petals-container" aria-hidden="true">
          {petals.map((p) => (
            <span
              key={p.id}
              className="petal"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                fontSize: p.size,
              }}
            >
              {p.flower}
            </span>
          ))}
        </div>
      )}

      {/* Tombol mute */}
      <button onClick={toggleMute} className="cover-mute" title={muted ? 'Nyalakan musik' : 'Matikan musik'}>
        {muted ? '🔇' : '🎵'}
      </button>

      <div className="cover-content">
        <p className="cover-label">Undangan Pernikahan</p>
        <div className="cover-rings" aria-hidden="true">
          <div className="c-ring c-ring-1" />
          <div className="c-ring c-ring-2" />
        </div>
        <h1 className="cover-names">
          {detail.bridegroomShortName}
          <br />
          <span className="cover-amp">&</span>
          <br />
          {detail.brideShortName}
        </h1>
        {guestName && (
          <p className="cover-guest">
            Kepada Yth.
            <br />
            <strong>{guestName}</strong>
          </p>
        )}
        <button onClick={handleOpen} className="cover-btn">
          Buka Undangan
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <p className="cover-scroll">✦ scroll untuk membuka ✦</p>
      </div>
    </div>
  );
}

// ── Hero / Slider ──────────────────────────────────────────────────────────────
function SectionHero({ detail, sliderPhotos }: { detail: WeddingDetail; sliderPhotos: Gallery[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sliderPhotos.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % sliderPhotos.length), 4000);
    return () => clearInterval(t);
  }, [sliderPhotos.length]);

  const receptionDate = new Date(detail.receptionDate);

  return (
    <section className="s-hero fade-section">
      {/* Foto slider */}
      {sliderPhotos.length > 0 ? (
        <div className="slider">
          {sliderPhotos.map((p, i) => (
            <img key={p.id} src={p.filePath} alt="" className={`slider-img ${i === current ? 'active' : ''}`} />
          ))}
          <div className="slider-overlay" />
        </div>
      ) : (
        <div className="slider slider-placeholder" />
      )}

      <div className="s-hero-content">
        <p className="eyebrow">The Wedding of</p>
        <h2 className="hero-names">
          {detail.bridegroomShortName}
          <em> & </em>
          {detail.brideShortName}
        </h2>
        <p className="hero-date">{receptionDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </section>
  );
}

// ── Couple ────────────────────────────────────────────────────────────────────
function SectionCouple({ detail }: { detail: WeddingDetail }) {
  return (
    <section className="s-section fade-section">
      <p className="s-eyebrow">Mempelai</p>
      <h2 className="s-title">Bismillahirrahmanirrahim</h2>
      <p className="s-sub">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>

      <div className="couple-grid">
        {/* Pengantin Pria */}
        <div className="couple-card">
          <div className="couple-icon">♙</div>
          <h3 className="couple-name">{detail.bridegroomName}</h3>
          <p className="couple-parent">Putra dari</p>
          <p className="couple-parent-name">{detail.bridegroomParent}</p>
        </div>

        <div className="couple-divider">
          <div className="couple-divider-line" />
          <span className="couple-divider-heart">♥</span>
          <div className="couple-divider-line" />
        </div>

        {/* Pengantin Wanita */}
        <div className="couple-card">
          <div className="couple-icon">♛</div>
          <h3 className="couple-name">{detail.brideName}</h3>
          <p className="couple-parent">Putri dari</p>
          <p className="couple-parent-name">{detail.brideParent}</p>
        </div>
      </div>
    </section>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function SectionCountdown({ detail }: { detail: WeddingDetail }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const target = new Date(detail.receptionDate).getTime();
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
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
    <section className="s-countdown fade-section">
      <p className="s-eyebrow" style={{ color: '#c9a96e' }}>
        Menghitung Hari
      </p>
      <h2 className="s-title" style={{ color: '#fff' }}>
        Menuju Hari Bahagia
      </h2>
      <div className="countdown-grid">
        {[
          { val: timeLeft.days, label: 'Hari' },
          { val: timeLeft.hours, label: 'Jam' },
          { val: timeLeft.minutes, label: 'Menit' },
          { val: timeLeft.seconds, label: 'Detik' },
        ].map(({ val, label }) => (
          <div key={label} className="countdown-box">
            <span className="countdown-num">{String(val).padStart(2, '0')}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Events ────────────────────────────────────────────────────────────────────
function SectionEvents({ detail }: { detail: WeddingDetail }) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="s-section fade-section">
      <p className="s-eyebrow">Rangkaian Acara</p>
      <h2 className="s-title">Jadwal Pernikahan</h2>

      <div className="events-grid">
        {/* Akad */}
        <div className="event-card">
          <div className="event-badge">Akad Nikah</div>
          <p className="event-date">{fmt(detail.akadDate)}</p>
          <p className="event-time">{detail.akadTime} WIB</p>
          <p className="event-loc">{detail.akadLocation}</p>
          {detail.akadMapsUrl && (
            <a href={detail.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="event-maps">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Lihat Lokasi
            </a>
          )}
        </div>

        {/* Resepsi */}
        <div className="event-card">
          <div className="event-badge">Resepsi</div>
          <p className="event-date">{fmt(detail.receptionDate)}</p>
          <p className="event-time">{detail.receptionTime} WIB</p>
          <p className="event-loc">{detail.receptionLocation}</p>
          {detail.receptionMapsUrl && (
            <a href={detail.receptionMapsUrl} target="_blank" rel="noopener noreferrer" className="event-maps">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Lihat Lokasi
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function SectionGallery({ photos }: { photos: Gallery[] }) {
  return (
    <section className="s-section fade-section">
      <p className="s-eyebrow">Galeri</p>
      <h2 className="s-title">Momen Bersama</h2>
      <div className="gallery-grid">
        {photos.map((p, i) => (
          <div key={p.id} className={`gallery-item ${i === 0 ? 'gallery-item--wide' : ''}`}>
            <img src={p.filePath} alt="" className="gallery-img" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Love Story ────────────────────────────────────────────────────────────────
function SectionLoveStory({ story }: { story: string }) {
  return (
    <section className="s-countdown fade-section">
      <p className="s-eyebrow" style={{ color: '#c9a96e' }}>
        Our Story
      </p>
      <h2 className="s-title" style={{ color: '#fff' }}>
        Perjalanan Cinta Kami
      </h2>
      <p className="love-story-text">{story}</p>
    </section>
  );
}

// ── Live Stream ───────────────────────────────────────────────────────────────
function SectionLiveStream({ url }: { url: string }) {
  return (
    <section className="s-section fade-section" style={{ textAlign: 'center' }}>
      <p className="s-eyebrow">Live Streaming</p>
      <h2 className="s-title">Saksikan Secara Online</h2>
      <p className="s-sub">Tidak bisa hadir? Saksikan momen sakral kami secara live.</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="event-maps" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tonton Live Streaming
      </a>
    </section>
  );
}

// ── Gift / Angpao ─────────────────────────────────────────────────────────────
function SectionGift({ wallets }: { wallets: Wallet[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="s-section fade-section">
      <p className="s-eyebrow">Kado Digital</p>
      <h2 className="s-title">Kirim Hadiah</h2>
      <p className="s-sub">Kehadiran dan doa restu Anda adalah hadiah terbaik. Namun jika ingin memberikan hadiah, bisa melalui:</p>
      <div className="gift-grid">
        {wallets.map((w) => (
          <div key={w.id} className="gift-card">
            <p className="gift-bank">{w.bankName}</p>
            <p className="gift-number">{w.accountNumber}</p>
            <p className="gift-owner">{w.accountOwner}</p>
            <button onClick={() => handleCopy(w.id, w.accountNumber)} className="gift-copy">
              {copied === w.id ? '✓ Tersalin!' : 'Salin Nomor'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Guest Book ────────────────────────────────────────────────────────────────
function SectionGuestBook({ invitationId, guestBooks, defaultName }: { invitationId: number; guestBooks: GuestBook[]; defaultName: string }) {
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
    <section className="s-section fade-section">
      <p className="s-eyebrow">Buku Tamu</p>
      <h2 className="s-title">Ucapan & Konfirmasi</h2>

      {/* Form ucapan */}
      <form onSubmit={handleSubmit} className="gb-form">
        {sent && <div className="gb-success">✓ Ucapan terkirim! Terima kasih 🎉</div>}
        <input type="text" value={form.guestName} required placeholder="Nama kamu" onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} className="gb-input" />
        <select value={form.rsvp} onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value }))} className="gb-input">
          <option value="hadir">Insya Allah Hadir</option>
          <option value="tidak_hadir">Tidak Bisa Hadir</option>
          <option value="ragu_ragu">Masih Ragu-ragu</option>
        </select>
        <textarea value={form.wishes} required placeholder="Tulis ucapan dan doa untuk mempelai..." onChange={(e) => setForm((p) => ({ ...p, wishes: e.target.value }))} rows={3} className="gb-input gb-textarea" />
        <button type="submit" disabled={sending} className="gb-btn">
          {sending ? 'Mengirim...' : 'Kirim Ucapan ✦'}
        </button>
      </form>

      {/* Daftar ucapan */}
      {/* <div className="gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>Belum ada ucapan.</p>
        ) : (
          entries.map((g) => (
            <div key={g.id} className="gb-entry">
              <div className="gb-avatar">{g.guestName[0].toUpperCase()}</div>
              <div className="gb-body">
                <div className="gb-header">
                  <p className="gb-name">{g.guestName}</p>
                  <span className={`gb-rsvp gb-rsvp--${g.rsvp}`}>{rsvpLabel[g.rsvp]}</span>
                </div>
                <p className="gb-wishes">{g.wishes}</p>
                <p className="gb-time">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          ))
        )}
      </div> */}

      <div className="fg-gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>Belum ada ucapan.</p>
        ) : (
          <Swiper modules={[Navigation, Pagination]} spaceBetween={16} slidesPerView={1} navigation pagination={{ clickable: true }}>
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

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ detail }: { detail: WeddingDetail }) {
  return (
    <footer className="w-footer">
      <div className="w-footer-rings" aria-hidden="true">
        <div className="c-ring c-ring-1" />
        <div className="c-ring c-ring-2" />
      </div>
      <p className="w-footer-label">We're Getting Married</p>
      <h2 className="w-footer-names">
        {detail.bridegroomShortName} & {detail.brideShortName}
      </h2>
      <p className="w-footer-sub">Terima kasih telah menjadi bagian dari hari istimewa kami.</p>
      <p className="w-footer-credit">Made with ♥ · UndanganDigital</p>
    </footer>
  );
}

// ── Fade-in on scroll ─────────────────────────────────────────────────────────
function useFadeOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-section');
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        }),
      { threshold: 0.1 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; max-width: 100%; }
:root {
  --black: #0d0d0d; --cream: #f9f5f0; --cream2: #f0ebe3;
  --gold: #c9a96e; --gold-d: #a8854d; --white: #fff; --muted: #6b6560;
  --serif: 'Cormorant Garamond', Georgia, serif; --sans: 'Inter', system-ui, sans-serif;
}

/* Cover */
.cover {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--black) center/cover no-repeat; position: relative; text-align: center;
  font-family: var(--sans);
}
.cover-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
.cover-content { position: relative; z-index: 1; padding: 2rem; }
.cover-label { color: var(--gold); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 2rem; }
.cover-rings { position: relative; width: 200px; height: 200px; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; }
.c-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(201,169,110,0.4); animation: pulse-ring 3s ease-in-out infinite; }
.c-ring-1 { width: 140px; height: 140px; }
.c-ring-2 { width: 200px; height: 200px; animation-delay: 0.8s; border-color: rgba(201,169,110,0.2); }
@keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.5} }
.cover-names { font-family: var(--serif); font-size: clamp(3rem,10vw,6rem); font-weight: 300; color: var(--white); line-height: 1.1; }
.cover-amp { font-style: italic; color: var(--gold); }
.cover-guest { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin: 1.5rem 0; line-height: 1.6; }
.cover-guest strong { color: var(--white); }
.cover-btn {
  margin-top: 2rem; display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--gold); color: var(--white); font-size: 0.9rem; font-weight: 600;
  padding: 0.8rem 2rem; border-radius: 100px; border: none; cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.cover-btn:hover { background: var(--gold-d); transform: translateY(-2px); }
.cover-scroll { color: rgba(255,255,255,0.35); font-size: 0.7rem; letter-spacing: 0.15em; margin-top: 1.5rem; }

/* Animasi bunga jatuh */
.petals-container {
  position: absolute; inset: 0; pointer-events: none;
  overflow: hidden; z-index: 2;
}
.petal {
  position: absolute; top: -2rem;
  animation: petal-fall linear infinite;
  user-select: none; will-change: transform;
}
@keyframes petal-fall {
  0%   { transform: translateY(-2rem) rotate(0deg); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
}

/* Tombol mute musik */
.cover-mute {
  position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 100px;
  color: white; font-size: 1rem; padding: 0.5rem 0.85rem;
  cursor: pointer; transition: background 0.2s;
}
.cover-mute:hover { background: rgba(255,255,255,0.25); }

/* Wedding wrap */
.wedding-wrap { font-family: var(--sans); background: var(--cream); }

/* Fade section */
.fade-section { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
.fade-section.visible { opacity: 1; transform: none; }

/* Hero */
.s-hero { position: relative; height: 90vh; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.slider { position: absolute; inset: 0; }
.slider-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease; }
.slider-img.active { opacity: 1; }
.slider-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%); }
.slider-placeholder { background: #1a1a1a; }
.s-hero-content { position: relative; z-index: 1; text-align: center; padding: 3rem 2rem; color: var(--white); }
.eyebrow { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; }
.hero-names { font-family: var(--serif); font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 300; line-height: 1.1; }
.hero-names em { font-style: italic; color: var(--gold); }
.hero-date { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 0.75rem; }

/* Sections */
.s-section { padding: 5rem 2rem; max-width: 900px; margin: 0 auto; text-align: center; }
.s-eyebrow { font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; }
.s-title { font-family: var(--serif); font-size: clamp(2rem, 5vw, 3rem); font-weight: 300; color: var(--black); margin-bottom: 1.25rem; }
.s-sub { color: var(--muted); font-size: 0.95rem; line-height: 1.7; max-width: 560px; margin: 0 auto 2.5rem; }

/* Couple */
.couple-grid { display: flex; align-items: center; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
.couple-card { text-align: center; flex: 1; min-width: 200px; }
.couple-icon { font-size: 2.5rem; color: var(--gold); margin-bottom: 1rem; }
.couple-name { font-family: var(--serif); font-size: 1.6rem; font-weight: 400; color: var(--black); margin-bottom: 0.5rem; }
.couple-parent { font-size: 0.8rem; color: var(--muted); }
.couple-parent-name { font-size: 0.95rem; color: var(--black); font-weight: 500; }
.couple-divider { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.couple-divider-line { width: 1px; height: 60px; background: linear-gradient(to bottom, transparent, var(--gold), transparent); }
.couple-divider-heart { font-size: 1.5rem; color: var(--gold); }

/* Countdown */
.s-countdown { background: var(--black); padding: 5rem 2rem; text-align: center; }
.countdown-grid { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-top: 2.5rem; }
.countdown-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(201,169,110,0.3); border-radius: 16px; padding: 1.5rem 2rem; min-width: 90px; }
.countdown-num { display: block; font-family: var(--serif); font-size: 3rem; font-weight: 300; color: var(--gold); line-height: 1; }
.countdown-label { display: block; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 0.5rem; }

/* Events */
.events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
.event-card { border: 1px solid rgba(201,169,110,0.3); border-radius: 20px; padding: 2rem; background: var(--white); text-align: center; }
.event-badge { display: inline-block; background: var(--gold); color: var(--white); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; padding: 0.35rem 1rem; border-radius: 100px; margin-bottom: 1.25rem; }
.event-date { font-family: var(--serif); font-size: 1.1rem; color: var(--black); margin-bottom: 0.25rem; }
.event-time { font-size: 1.5rem; font-weight: 600; color: var(--gold); margin-bottom: 0.75rem; }
.event-loc { font-size: 0.85rem; color: var(--muted); line-height: 1.5; margin-bottom: 1rem; }
.event-maps { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--gold); font-size: 0.85rem; font-weight: 500; text-decoration: none; border: 1px solid rgba(201,169,110,0.4); padding: 0.5rem 1rem; border-radius: 100px; transition: background 0.2s; }
.event-maps:hover { background: rgba(201,169,110,0.1); }

/* Gallery */
.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 2rem; }
.gallery-item { border-radius: 12px; overflow: hidden; aspect-ratio: 1; }
.gallery-item--wide { grid-column: span 2; aspect-ratio: 2/1; }
.gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.gallery-img:hover { transform: scale(1.05); }

/* Love Story */
.love-story-text { color: rgba(255,255,255,0.75); font-size: 1rem; line-height: 1.9; max-width: 600px; margin: 2rem auto 0; font-style: italic; }

/* Gift */
.gift-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 2rem; }
.gift-card { background: var(--white); border: 1px solid rgba(201,169,110,0.3); border-radius: 20px; padding: 1.5rem; text-align: center; }
.gift-bank { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.5rem; font-weight: 600; }
.gift-number { font-family: monospace; font-size: 1.3rem; font-weight: 700; color: var(--black); margin-bottom: 0.25rem; }
.gift-owner { font-size: 0.85rem; color: var(--muted); margin-bottom: 1rem; }
.gift-copy { background: var(--gold); color: var(--white); border: none; border-radius: 100px; padding: 0.5rem 1.25rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.gift-copy:hover { background: var(--gold-d); }

/* Guest Book */
.gb-form { background: var(--white); border: 1px solid rgba(201,169,110,0.25); border-radius: 20px; padding: 2rem; margin-bottom: 2rem; }
.gb-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1rem; }
.gb-input { display: block; width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.9rem; font-family: var(--sans); margin-bottom: 0.75rem; outline: none; transition: border-color 0.2s; background: var(--cream); }
.gb-input:focus { border-color: var(--gold); }
.gb-textarea { resize: none; }
.gb-btn { width: 100%; background: var(--gold); color: var(--white); border: none; border-radius: 100px; padding: 0.85rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.gb-btn:hover { background: var(--gold-d); }
.gb-btn:disabled { opacity: 0.6; }
.gb-list { display: flex; flex-direction: column; gap: 1rem; }
.gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--white); border-radius: 16px; padding: 1rem 1.25rem; }
.gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: var(--white); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; shrink: 0; flex-shrink: 0; }
.gb-body { flex: 1; }
.gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.gb-name { font-weight: 600; font-size: 0.9rem; color: var(--black); }
.gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.gb-rsvp--hadir { background: #ecfdf5; color: #065f46; }
.gb-rsvp--tidak_hadir { background: #fef2f2; color: #991b1b; }
.gb-rsvp--ragu_ragu { background: #fffbeb; color: #92400e; }
.gb-wishes { font-size: 0.875rem; color: var(--muted); line-height: 1.6; }
.gb-time { font-size: 0.75rem; color: #9ca3af; margin-top: 0.4rem; }

/* ── Swiper Guest Book (gold theme) ── */
.fg-gb-list { width: 100%; }
.fg-gb-page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 3rem; }
.fg-gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--white); border-radius: 16px; padding: 1rem 1.25rem; }
.fg-gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: var(--white); font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fg-gb-body { flex: 1; }
.fg-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.fg-gb-name { font-weight: 600; font-size: 0.9rem; color: var(--black); }
.fg-gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.fg-rsvp-hadir { background: #ecfdf5; color: #065f46; }
.fg-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.fg-rsvp-ragu_ragu { background: #fffbeb; color: #92400e; }
.fg-gb-wishes { font-size: 0.875rem; color: var(--muted); line-height: 1.6; }
.fg-gb-time { font-size: 0.75rem; color: #9ca3af; margin-top: 0.4rem; }
.fg-gb-list .swiper-button-next,
.fg-gb-list .swiper-button-prev { color: var(--gold); transform: scale(0.75); }
.fg-gb-list .swiper-pagination-bullet { background: rgba(201,169,110,0.3); opacity: 1; }
.fg-gb-list .swiper-pagination-bullet-active { background: var(--gold); }

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




/* Footer */
.w-footer { background: var(--black); padding: 6rem 2rem; text-align: center; position: relative; overflow: hidden; }
.w-footer-rings { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.w-footer-rings .c-ring { border-color: rgba(201,169,110,0.1); }
.w-footer-label { position: relative; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1rem; }
.w-footer-names { position: relative; font-family: var(--serif); font-size: clamp(2.5rem, 7vw, 4.5rem); font-weight: 300; color: var(--white); margin-bottom: 1rem; }
.w-footer-sub { position: relative; color: rgba(255,255,255,0.45); font-size: 0.9rem; margin-bottom: 3rem; }
.w-footer-credit { position: relative; color: rgba(255,255,255,0.2); font-size: 0.75rem; }

@media (max-width: 640px) {
  .couple-grid { flex-direction: column; }
  .couple-divider { flex-direction: row; }
  .couple-divider-line { width: 60px; height: 1px; }
  .gallery-grid { grid-template-columns: repeat(2,1fr); }
  .gallery-item--wide { grid-column: span 2; }
  .countdown-grid { gap: 0.75rem; }
  .countdown-box { padding: 1rem 1.25rem; min-width: 70px; }
  .countdown-num { font-size: 2rem; }
}
`;
