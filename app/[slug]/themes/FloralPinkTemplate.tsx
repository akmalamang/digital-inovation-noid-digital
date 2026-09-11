'use client';
// app/[slug]/themes/FloralPinkTemplate.tsx
// Tema 2: Floral Pink — background pink pudar, bunga di setiap sudut

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

// ── Path aset bunga — ganti dengan file kamu nanti ────────────────────────────
// Letakkan file gambar bunga di folder: public/themes/floral-pink/
// Contoh nama file yang diharapkan:
const FLOWER_ASSETS = {
  topLeft: '/themes/floral-pink/desain-bunga-pink.png',
  topRight: '/themes/floral-pink/desain-bunga-pink-2.png',
  bottomLeft: '/themes/floral-pink/desain-bunga-pink-2.png',
  bottomRight: '/themes/floral-pink/desain-bunga-pink-2.png',
  divider: '/themes/floral-pink/flower-divider.png', // opsional, untuk pemisah section
};

// ── Komponen bunga sudut ───────────────────────────────────────────────────────
function FlowerCorners() {
  return (
    <>
      {/* Bunga pojok kiri atas */}
      <img src={FLOWER_ASSETS.topLeft} alt="" aria-hidden="true" className="flower-corner flower-top-left" />
      {/* Bunga pojok kanan atas */}
      <img src={FLOWER_ASSETS.topRight} alt="" aria-hidden="true" className="flower-corner flower-top-right" />
      {/* Bunga pojok kiri bawah */}
      <img src={FLOWER_ASSETS.bottomLeft} alt="" aria-hidden="true" className="flower-corner flower-bottom-left" />
      {/* Bunga pojok kanan bawah */}
      <img src={FLOWER_ASSETS.bottomRight} alt="" aria-hidden="true" className="flower-corner flower-bottom-right" />
    </>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function FloralPinkTemplate({ invitation }: { invitation: Invitation }) {
  const d = invitation.weddingDetail;
  const [opened, setOpened] = useState(false);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuestName(params.get('to') ?? '');
  }, []);

  // Fade-in observer setelah konten dibuka
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.fp-fade');
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('fp-visible');
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
      <div className="fp-wrap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#b07a8a' }}>Detail undangan belum tersedia.</p>
      </div>
    );
  }

  const sliderPhotos = invitation.galleries.filter((g) => g.type === 'slider');
  const galleryPhotos = invitation.galleries.filter((g) => g.type === 'gallery');
  const bgPhoto = invitation.galleries.find((g) => g.type === 'background');

  return (
    <>
      {!opened && <FPCover detail={d} guestName={guestName} bgPhoto={bgPhoto?.filePath} onOpen={() => setOpened(true)} />}

      {opened && (
        <div className="fp-wrap">
          <FPHero detail={d} sliderPhotos={sliderPhotos} />
          <FPCouple detail={d} />
          <FPCountdown detail={d} />
          <FPEvents detail={d} />
          {galleryPhotos.length > 0 && <FPGallery photos={galleryPhotos} />}
          {d.loveStory && <FPLoveStory story={d.loveStory} />}
          {d.liveStreamingUrl && <FPLiveStream url={d.liveStreamingUrl} />}
          {invitation.digitalWallets.length > 0 && <FPGift wallets={invitation.digitalWallets} />}
          <FPGuestBook invitationId={invitation.id} guestBooks={invitation.guestBooks} defaultName={guestName} />
          <FPFooter detail={d} />
        </div>
      )}

      <style>{FP_STYLES}</style>
    </>
  );
}

// ── Cover ──────────────────────────────────────────────────────────────────────
function FPCover({ detail, guestName, bgPhoto, onOpen }: { detail: WeddingDetail; guestName: string; bgPhoto?: string; onOpen: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [petals, setPetals] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    // Generate bunga jatuh hanya di client
    setPetals(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${5 + Math.random() * 5}s`,
        size: `${0.8 + Math.random() * 1}rem`,
      })),
    );

    // Audio — ganti URL dengan file musik kamu di public/music/
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
    <div className="fp-cover" style={bgPhoto ? { backgroundImage: `url(${bgPhoto})` } : {}}>
      <div className="fp-cover-overlay" />

      {/* Bunga di sudut cover */}
      <FlowerCorners />

      {/* Bunga jatuh animasi */}
      {petals.length > 0 && (
        <div className="fp-petals" aria-hidden="true">
          {petals.map((p) => (
            <span
              key={p.id}
              className="fp-petal"
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

      {/* Tombol mute */}
      <button onClick={toggleMute} className="fp-mute">
        {muted ? '🔇' : '🎵'}
      </button>

      <div className="fp-cover-content">
        <p className="fp-cover-eyebrow">~ Undangan Pernikahan ~</p>

        {/* Frame bunga dekoratif di sekitar nama */}
        <div className="fp-name-frame">
          <div className="fp-name-ornament">✿ ❀ ✿</div>
          <h1 className="fp-cover-names">
            {detail.bridegroomShortName}
            <span className="fp-cover-amp"> & </span>
            {detail.brideShortName}
          </h1>
          <div className="fp-name-ornament">✿ ❀ ✿</div>
        </div>

        {guestName && (
          <p className="fp-cover-guest">
            Kepada Yth.
            <br />
            <strong>{guestName}</strong>
          </p>
        )}

        <button onClick={handleOpen} className="fp-cover-btn">
          💌 Buka Undangan
        </button>
        <p className="fp-cover-scroll">~ scroll ke bawah ~</p>
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function FPHero({ detail, sliderPhotos }: { detail: WeddingDetail; sliderPhotos: Gallery[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sliderPhotos.length < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % sliderPhotos.length), 4000);
    return () => clearInterval(t);
  }, [sliderPhotos.length]);

  const receptionDate = new Date(detail.receptionDate);

  return (
    <section className="fp-hero fp-fade">
      {/* Bunga sudut di hero */}
      <FlowerCorners />

      {sliderPhotos.length > 0 ? (
        <div className="fp-slider">
          {sliderPhotos.map((p, i) => (
            <img key={p.id} src={p.filePath} alt="" className={`fp-slider-img ${i === current ? 'active' : ''}`} />
          ))}
          <div className="fp-slider-overlay" />
        </div>
      ) : (
        <div className="fp-slider fp-slider-placeholder" />
      )}

      <div className="fp-hero-content">
        <p className="fp-eyebrow">The Wedding of</p>
        <h2 className="fp-hero-names">
          {detail.bridegroomShortName}
          <em> & </em>
          {detail.brideShortName}
        </h2>
        <p className="fp-hero-date">
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
function FPCouple({ detail }: { detail: WeddingDetail }) {
  return (
    <section className="fp-section fp-fade">
      <FlowerCorners />
      <p className="fp-section-eyebrow">~ Mempelai ~</p>
      <h2 className="fp-section-title">Bismillahirrahmanirrahim</h2>
      <p className="fp-section-sub">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>

      <div className="fp-couple-grid">
        <div className="fp-couple-card">
          <div className="fp-couple-flower">🌸</div>
          <h3 className="fp-couple-name">{detail.bridegroomName}</h3>
          <p className="fp-couple-parent-label">Putra dari</p>
          <p className="fp-couple-parent">{detail.bridegroomParent}</p>
        </div>

        <div className="fp-couple-divider">
          <div className="fp-divider-line" />
          <span className="fp-divider-heart">💕</span>
          <div className="fp-divider-line" />
        </div>

        <div className="fp-couple-card">
          <div className="fp-couple-flower">🌺</div>
          <h3 className="fp-couple-name">{detail.brideName}</h3>
          <p className="fp-couple-parent-label">Putri dari</p>
          <p className="fp-couple-parent">{detail.brideParent}</p>
        </div>
      </div>
    </section>
  );
}

// ── Countdown ──────────────────────────────────────────────────────────────────
function FPCountdown({ detail }: { detail: WeddingDetail }) {
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
    <section className="fp-countdown fp-fade">
      <FlowerCorners />
      <p className="fp-countdown-eyebrow">~ Menghitung Hari ~</p>
      <h2 className="fp-countdown-title">Menuju Hari Bahagia</h2>
      <div className="fp-countdown-grid">
        {[
          { val: time.days, label: 'Hari' },
          { val: time.hours, label: 'Jam' },
          { val: time.minutes, label: 'Menit' },
          { val: time.seconds, label: 'Detik' },
        ].map(({ val, label }) => (
          <div key={label} className="fp-countdown-box">
            <span className="fp-countdown-num">{String(val).padStart(2, '0')}</span>
            <span className="fp-countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Events ─────────────────────────────────────────────────────────────────────
function FPEvents({ detail }: { detail: WeddingDetail }) {
  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <section className="fp-section fp-fade">
      <FlowerCorners />
      <p className="fp-section-eyebrow">~ Rangkaian Acara ~</p>
      <h2 className="fp-section-title">Jadwal Pernikahan</h2>

      <div className="fp-events-grid">
        <div className="fp-event-card">
          <div className="fp-event-flower">🌸 Akad Nikah 🌸</div>
          <p className="fp-event-date">{fmt(detail.akadDate)}</p>
          <p className="fp-event-time">{detail.akadTime} WIB</p>
          <p className="fp-event-loc">{detail.akadLocation}</p>
          {detail.akadMapsUrl && (
            <a href={detail.akadMapsUrl} target="_blank" rel="noopener noreferrer" className="fp-maps-btn">
              📍 Lihat Lokasi
            </a>
          )}
        </div>

        <div className="fp-event-card">
          <div className="fp-event-flower">🌺 Resepsi 🌺</div>
          <p className="fp-event-date">{fmt(detail.receptionDate)}</p>
          <p className="fp-event-time">{detail.receptionTime} WIB</p>
          <p className="fp-event-loc">{detail.receptionLocation}</p>
          {detail.receptionMapsUrl && (
            <a href={detail.receptionMapsUrl} target="_blank" rel="noopener noreferrer" className="fp-maps-btn">
              📍 Lihat Lokasi
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────────
function FPGallery({ photos }: { photos: Gallery[] }) {
  return (
    <section className="fp-section fp-fade">
      <FlowerCorners />
      <p className="fp-section-eyebrow">~ Galeri ~</p>
      <h2 className="fp-section-title">Momen Bersama</h2>
      <div className="fp-gallery-grid">
        {photos.map((p, i) => (
          <div key={p.id} className={`fp-gallery-item ${i === 0 ? 'fp-gallery-wide' : ''}`}>
            <img src={p.filePath} alt="" className="fp-gallery-img" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Love Story ─────────────────────────────────────────────────────────────────
function FPLoveStory({ story }: { story: string }) {
  return (
    <section className="fp-countdown fp-fade">
      <FlowerCorners />
      <p className="fp-countdown-eyebrow">~ Our Story ~</p>
      <h2 className="fp-countdown-title">Perjalanan Cinta Kami</h2>
      <p className="fp-love-story">{story}</p>
    </section>
  );
}

// ── Live Stream ────────────────────────────────────────────────────────────────
function FPLiveStream({ url }: { url: string }) {
  return (
    <section className="fp-section fp-fade" style={{ textAlign: 'center' }}>
      <FlowerCorners />
      <p className="fp-section-eyebrow">~ Live Streaming ~</p>
      <h2 className="fp-section-title">Saksikan Secara Online</h2>
      <a href={url} target="_blank" rel="noopener noreferrer" className="fp-maps-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
        ▶ Tonton Live Streaming
      </a>
    </section>
  );
}

// ── Gift ───────────────────────────────────────────────────────────────────────
function FPGift({ wallets }: { wallets: Wallet[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  function handleCopy(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="fp-section fp-fade">
      <FlowerCorners />
      <p className="fp-section-eyebrow">~ Kado Digital ~</p>
      <h2 className="fp-section-title">Kirim Hadiah</h2>
      <p className="fp-section-sub">Kehadiran dan doa restu Anda adalah hadiah terbaik bagi kami.</p>
      <div className="fp-gift-grid">
        {wallets.map((w) => (
          <div key={w.id} className="fp-gift-card">
            <p className="fp-gift-bank">{w.bankName}</p>
            <p className="fp-gift-number">{w.accountNumber}</p>
            <p className="fp-gift-owner">{w.accountOwner}</p>
            <button onClick={() => handleCopy(w.id, w.accountNumber)} className="fp-gift-copy">
              {copied === w.id ? '✓ Tersalin!' : 'Salin Nomor'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Guest Book ─────────────────────────────────────────────────────────────────
function FPGuestBook({ invitationId, guestBooks, defaultName }: { invitationId: number; guestBooks: GuestBook[]; defaultName: string }) {
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
    <section className="fp-section fp-fade">
      <FlowerCorners />
      <p className="fp-section-eyebrow">~ Buku Tamu ~</p>
      <h2 className="fp-section-title">Ucapan & Konfirmasi</h2>

      <form onSubmit={handleSubmit} className="fp-gb-form">
        {sent && <div className="fp-gb-success">✓ Ucapan terkirim! Terima kasih 🌸</div>}
        <input type="text" value={form.guestName} required placeholder="Nama kamu" onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))} className="fp-gb-input" />
        <select value={form.rsvp} onChange={(e) => setForm((p) => ({ ...p, rsvp: e.target.value }))} className="fp-gb-input">
          <option value="hadir">Insya Allah Hadir</option>
          <option value="tidak_hadir">Tidak Bisa Hadir</option>
          <option value="ragu_ragu">Masih Ragu-ragu</option>
        </select>
        <textarea value={form.wishes} required placeholder="Tulis ucapan dan doa untuk mempelai..." onChange={(e) => setForm((p) => ({ ...p, wishes: e.target.value }))} rows={3} className="fp-gb-input fp-gb-textarea" />
        <button type="submit" disabled={sending} className="fp-gb-btn">
          {sending ? 'Mengirim...' : '🌸 Kirim Ucapan'}
        </button>
      </form>

      {/* <div className="fp-gb-list">
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#c4899a', fontSize: '0.9rem' }}>Belum ada ucapan.</p>
        ) : (
          entries.map((g) => (
            <div key={g.id} className="fp-gb-entry">
              <div className="fp-gb-avatar">{g.guestName[0].toUpperCase()}</div>
              <div className="fp-gb-body">
                <div className="fp-gb-header">
                  <p className="fp-gb-name">{g.guestName}</p>
                  <span className={`fp-gb-rsvp fp-rsvp-${g.rsvp}`}>{rsvpLabel[g.rsvp]}</span>
                </div>
                <p className="fp-gb-wishes">{g.wishes}</p>
                <p className="fp-gb-time">{new Date(g.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
function FPFooter({ detail }: { detail: WeddingDetail }) {
  return (
    <footer className="fp-footer">
      <FlowerCorners />
      <p className="fp-footer-eyebrow">~ We're Getting Married ~</p>
      <h2 className="fp-footer-names">
        {detail.bridegroomShortName} & {detail.brideShortName}
      </h2>
      <p className="fp-footer-sub">Terima kasih telah menjadi bagian dari hari istimewa kami.</p>
      <p className="fp-footer-credit">Made with 🌸 · UndanganDigital</p>
    </footer>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const FP_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Great+Vibes&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; max-width: 100%; }

:root {
  --fp-bg:       #fff5f7;       /* background utama — pink sangat pudar */
  --fp-bg2:      #fce8ed;       /* background section gelap */
  --fp-pink:     #e8829a;       /* pink utama */
  --fp-pink-d:   #c9607a;       /* pink gelap untuk hover */
  --fp-pink-l:   #f9d0db;       /* pink sangat muda */
  --fp-rose:     #d4506e;       /* rose untuk aksen */
  --fp-text:     #5a2d3a;       /* teks utama — wine gelap */
  --fp-muted:    #9a6070;       /* teks sekunder */
  --fp-white:    #ffffff;
  --fp-serif:    'Cormorant Garamond', Georgia, serif;
  --fp-script:   'Great Vibes', cursive;  /* font kursif untuk nama */
  --fp-sans:     'Inter', system-ui, sans-serif;
}

/* ── Base ── */
.fp-wrap { font-family: var(--fp-sans); background: var(--fp-bg); color: var(--fp-text); overflow-x: hidden; }

/* ── Fade animation ── */
.fp-fade { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
.fp-visible { opacity: 1; transform: none; }

/* ── Bunga sudut ── */
.flower-corner {
  position: absolute; width: 160px; height: 160px;
  object-fit: contain; pointer-events: none; z-index: 2;
}
.flower-top-left    { top: 0; left: 0; transform-origin: top left; }
.flower-top-right   { top: 0; right: 0; transform: scaleX(-1); transform-origin: top right; }
.flower-bottom-left { bottom: 0; left: 0; transform: scaleY(-1); transform-origin: bottom left; }
.flower-bottom-right{ bottom: 0; right: 0; transform: scale(-1); transform-origin: bottom right; }

/* Ukuran bunga lebih kecil di mobile */
@media (max-width: 640px) {
.flower-corner { width: 120px; height: 110px; }
}

/* ── Cover ── */
.fp-cover {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--fp-bg2) center/cover no-repeat;
  position: relative; text-align: center; overflow: hidden;
}
.fp-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,182,193,0.45) 0%, rgba(255,240,245,0.6) 100%);
}

/* Bunga jatuh */
.fp-petals { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 3; }
.fp-petal {
  position: absolute; top: -2rem;
  animation: fp-petal-fall linear infinite;
  user-select: none;
}
@keyframes fp-petal-fall {
  0%   { transform: translateY(-2rem) rotate(0deg); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
}

/* Tombol mute */
.fp-mute {
  position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10;
  background: rgba(255,255,255,0.5); backdrop-filter: blur(8px);
  border: 1px solid rgba(232,130,154,0.3); border-radius: 100px;
  color: var(--fp-text); font-size: 1rem; padding: 0.45rem 0.85rem;
  cursor: pointer; transition: background 0.2s;
}
.fp-mute:hover { background: rgba(255,255,255,0.75); }

.fp-cover-content { position: relative; z-index: 4; padding: 2rem; }
.fp-cover-eyebrow {
  font-family: var(--fp-serif); font-style: italic;
  color: var(--fp-rose); font-size: 1rem; letter-spacing: 0.1em; margin-bottom: 1.5rem;
}
.fp-name-frame { margin: 0 auto 1.5rem; display: inline-block; }
.fp-name-ornament { color: var(--fp-pink); font-size: 1.2rem; letter-spacing: 0.3em; margin: 0.5rem 0; }
.fp-cover-names {
  font-family: var(--fp-script); font-size: clamp(3rem, 10vw, 6rem);
  color: var(--fp-text); line-height: 1.1; font-weight: 400;
}
.fp-cover-amp { color: var(--fp-pink); }
.fp-cover-guest {
  color: var(--fp-muted); font-size: 0.9rem; line-height: 1.7; margin: 1.25rem 0;
}
.fp-cover-guest strong { color: var(--fp-text); }
.fp-cover-btn {
  display: inline-block; margin-top: 1.5rem;
  background: linear-gradient(135deg, var(--fp-pink), var(--fp-rose));
  color: var(--fp-white); font-family: var(--fp-sans); font-size: 0.95rem; font-weight: 500;
  padding: 0.85rem 2.2rem; border-radius: 100px; border: none; cursor: pointer;
  box-shadow: 0 4px 15px rgba(232,130,154,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.fp-cover-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232,130,154,0.5); }
.fp-cover-scroll { color: var(--fp-pink); font-size: 0.75rem; margin-top: 1.25rem; letter-spacing: 0.1em; }

/* ── Hero ── */
.fp-hero {
  position: relative; height: 90vh;
  display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
}
.fp-slider { position: absolute; inset: 0; }
.fp-slider-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1s ease; }
.fp-slider-img.active { opacity: 1; }
.fp-slider-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(90,45,58,0.65) 0%, transparent 60%); }
.fp-slider-placeholder { background: linear-gradient(135deg, var(--fp-bg2), var(--fp-pink-l)); }
.fp-hero-content { position: relative; z-index: 3; text-align: center; padding: 3rem 2rem; color: var(--fp-white); }
.fp-eyebrow { font-family: var(--fp-serif); font-style: italic; font-size: 0.9rem; color: var(--fp-pink-l); margin-bottom: 0.75rem; letter-spacing: 0.1em; }
.fp-hero-names { font-family: var(--fp-script); font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 400; line-height: 1.1; }
.fp-hero-names em { font-style: normal; color: var(--fp-pink-l); }
.fp-hero-date { font-size: 0.9rem; color: rgba(255,255,255,0.75); margin-top: 0.75rem; }

/* ── Section ── */
.fp-section {
  padding: 5rem 2rem; max-width: 900px; margin: 0 auto;
  text-align: center; position: relative;
}
.fp-section-eyebrow { font-family: var(--fp-serif); font-style: italic; color: var(--fp-pink); font-size: 1rem; margin-bottom: 0.5rem; }
.fp-section-title { font-family: var(--fp-serif); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; color: var(--fp-text); margin-bottom: 1rem; }
.fp-section-sub { color: var(--fp-muted); font-size: 0.95rem; line-height: 1.7; max-width: 540px; margin: 0 auto 2.5rem; }

/* ── Couple ── */
.fp-couple-grid { display: flex; align-items: center; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
.fp-couple-card { text-align: center; flex: 1; min-width: 200px; }
.fp-couple-flower { font-size: 2.5rem; margin-bottom: 0.75rem; }
.fp-couple-name { font-family: var(--fp-script); font-size: 2rem; color: var(--fp-text); margin-bottom: 0.5rem; }
.fp-couple-parent-label { font-size: 0.8rem; color: var(--fp-muted); }
.fp-couple-parent { font-size: 0.95rem; color: var(--fp-text); font-weight: 500; }
.fp-couple-divider { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.fp-divider-line { width: 1px; height: 60px; background: linear-gradient(to bottom, transparent, var(--fp-pink), transparent); }
.fp-divider-heart { font-size: 1.5rem; }

/* ── Countdown ── */
.fp-countdown { background: linear-gradient(135deg, var(--fp-bg2), var(--fp-pink-l)); padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden; }
.fp-countdown-eyebrow { font-family: var(--fp-serif); font-style: italic; color: var(--fp-rose); font-size: 1rem; margin-bottom: 0.5rem; }
.fp-countdown-title { font-family: var(--fp-serif); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 300; color: var(--fp-text); margin-bottom: 2.5rem; }
.fp-countdown-grid { display: flex; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
.fp-countdown-box {
  background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
  border: 1px solid rgba(232,130,154,0.3); border-radius: 20px;
  padding: 1.5rem 1.75rem; min-width: 85px; text-align: center;
  box-shadow: 0 4px 15px rgba(232,130,154,0.15);
}
.fp-countdown-num { display: block; font-family: var(--fp-serif); font-size: 2.8rem; font-weight: 300; color: var(--fp-rose); line-height: 1; }
.fp-countdown-label { display: block; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fp-muted); margin-top: 0.4rem; }

/* ── Events ── */
.fp-events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
.fp-event-card {
  background: var(--fp-white); border: 1px solid var(--fp-pink-l); border-radius: 24px;
  padding: 2rem; text-align: center;
  box-shadow: 0 4px 20px rgba(232,130,154,0.1);
}
.fp-event-flower { font-size: 1rem; color: var(--fp-pink); font-weight: 600; margin-bottom: 1rem; letter-spacing: 0.05em; }
.fp-event-date { font-family: var(--fp-serif); font-size: 1rem; color: var(--fp-text); margin-bottom: 0.25rem; }
.fp-event-time { font-size: 1.5rem; font-weight: 700; color: var(--fp-rose); margin-bottom: 0.75rem; }
.fp-event-loc { font-size: 0.85rem; color: var(--fp-muted); line-height: 1.5; margin-bottom: 1rem; }
.fp-maps-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: linear-gradient(135deg, var(--fp-pink), var(--fp-rose));
  color: var(--fp-white); font-size: 0.8rem; font-weight: 500;
  padding: 0.5rem 1.25rem; border-radius: 100px; text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 3px 10px rgba(232,130,154,0.35);
}
.fp-maps-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(232,130,154,0.45); }

/* ── Gallery ── */
.fp-gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-top: 2rem; }
.fp-gallery-item { border-radius: 16px; overflow: hidden; aspect-ratio: 1; }
.fp-gallery-wide { grid-column: span 2; aspect-ratio: 2/1; }
.fp-gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.fp-gallery-img:hover { transform: scale(1.05); }

/* ── Love Story ── */
.fp-love-story { color: var(--fp-muted); font-size: 1rem; line-height: 1.9; max-width: 580px; margin: 2rem auto 0; font-style: italic; }

/* ── Gift ── */
.fp-gift-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1rem; margin-top: 2rem; }
.fp-gift-card { background: var(--fp-white); border: 1px solid var(--fp-pink-l); border-radius: 20px; padding: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(232,130,154,0.1); }
.fp-gift-bank { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: var(--fp-pink); margin-bottom: 0.5rem; }
.fp-gift-number { font-family: monospace; font-size: 1.3rem; font-weight: 700; color: var(--fp-text); margin-bottom: 0.25rem; }
.fp-gift-owner { font-size: 0.85rem; color: var(--fp-muted); margin-bottom: 1rem; }
.fp-gift-copy { background: linear-gradient(135deg, var(--fp-pink), var(--fp-rose)); color: white; border: none; border-radius: 100px; padding: 0.45rem 1.2rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: transform 0.15s; }
.fp-gift-copy:hover { transform: translateY(-1px); }

/* ── Guest Book ── */
.fp-gb-form { background: var(--fp-white); border: 1px solid var(--fp-pink-l); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(232,130,154,0.1); }
.fp-gb-success { background: #fce8ed; color: var(--fp-rose); border: 1px solid var(--fp-pink-l); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1rem; }
.fp-gb-input { display: block; width: 100%; border: 1.5px solid var(--fp-pink-l); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9rem; font-family: var(--fp-sans); margin-bottom: 0.75rem; outline: none; transition: border-color 0.2s; background: var(--fp-bg); color: var(--fp-text); }
.fp-gb-input:focus { border-color: var(--fp-pink); }
.fp-gb-textarea { resize: none; }
.fp-gb-btn { width: 100%; background: linear-gradient(135deg, var(--fp-pink), var(--fp-rose)); color: white; border: none; border-radius: 100px; padding: 0.85rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 12px rgba(232,130,154,0.35); }
.fp-gb-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(232,130,154,0.45); }
.fp-gb-btn:disabled { opacity: 0.6; }
.fp-gb-list { display: flex; flex-direction: column; gap: 1rem; }
.fp-gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--fp-white); border-radius: 16px; padding: 1rem 1.25rem; border: 1px solid var(--fp-pink-l); }
.fp-gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--fp-pink), var(--fp-rose)); color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fp-gb-body { flex: 1; }
.fp-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.fp-gb-name { font-weight: 600; font-size: 0.9rem; color: var(--fp-text); }
.fp-gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.fp-rsvp-hadir { background: #fce8ed; color: var(--fp-rose); }
.fp-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.fp-rsvp-ragu_ragu { background: #fffbeb; color: #92400e; }
.fp-gb-wishes { font-size: 0.875rem; color: var(--fp-muted); line-height: 1.6; }
.fp-gb-time { font-size: 0.75rem; color: #c4a0aa; margin-top: 0.4rem; }

/* ── Swiper Guest Book (pink theme) ── */
.fg-gb-list { width: 100%; }
.fg-gb-page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 3rem; }
.fg-gb-entry { display: flex; gap: 0.75rem; align-items: flex-start; background: var(--fp-white); border-radius: 16px; padding: 1rem 1.25rem; border: 1px solid var(--fp-pink-l); }
.fg-gb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--fp-pink), var(--fp-rose)); color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fg-gb-body { flex: 1; }
.fg-gb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.5rem; }
.fg-gb-name { font-weight: 600; font-size: 0.9rem; color: var(--fp-text); }
.fg-gb-rsvp { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.fg-rsvp-hadir { background: #fce8ed; color: var(--fp-rose); }
.fg-rsvp-tidak_hadir { background: #fef2f2; color: #991b1b; }
.fg-rsvp-ragu_ragu { background: #fffbeb; color: #92400e; }
.fg-gb-wishes { font-size: 0.875rem; color: var(--fp-muted); line-height: 1.6; }
.fg-gb-time { font-size: 0.75rem; color: #c4a0aa; margin-top: 0.4rem; }
.fg-gb-list .swiper-button-next,
.fg-gb-list .swiper-button-prev { color: var(--fp-pink); transform: scale(0.75); }
.fg-gb-list .swiper-pagination-bullet { background: var(--fp-pink-l); opacity: 1; }
.fg-gb-list .swiper-pagination-bullet-active { background: var(--fp-pink); }



/* ── Footer ── */
.fp-footer { background: linear-gradient(135deg, var(--fp-bg2), var(--fp-pink-l)); padding: 6rem 2rem; text-align: center; position: relative; overflow: hidden; }
.fp-footer-eyebrow { font-family: var(--fp-serif); font-style: italic; color: var(--fp-rose); font-size: 1rem; margin-bottom: 1rem; }
.fp-footer-names { font-family: var(--fp-script); font-size: clamp(2.5rem, 7vw, 4.5rem); color: var(--fp-text); margin-bottom: 1rem; font-weight: 400; }
.fp-footer-sub { color: var(--fp-muted); font-size: 0.9rem; margin-bottom: 2rem; }
.fp-footer-credit { color: var(--fp-pink); font-size: 0.8rem; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .fp-couple-grid { flex-direction: column; }
  .fp-couple-divider { flex-direction: row; }
  .fp-divider-line { width: 60px; height: 1px; }
  .fp-gallery-grid { grid-template-columns: repeat(2,1fr); }
  .fp-gallery-wide { grid-column: span 2; }
  .fp-countdown-grid { gap: 0.75rem; }
  .fp-countdown-box { padding: 1rem 1.25rem; min-width: 70px; }
  .fp-countdown-num { font-size: 2rem; }
  .fp-section { padding: 3.5rem 1.5rem; }
}
`;
