'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
};

type Theme = {
  id: number;
  themeName: string;
  thumbnail: string;
  thumbnails?: string | null;
};

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.avi'];

function getMediaType(url: string): 'image' | 'video' {
  const cleanUrl = url.split('?')[0].toLowerCase();

  return VIDEO_EXTENSIONS.some((ext) => cleanUrl.endsWith(ext)) ? 'video' : 'image';
}

function parseMedia(theme: Theme): MediaItem[] {
  if (theme.thumbnails) {
    try {
      const parsed = JSON.parse(theme.thumbnails);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item): MediaItem | null => {
            // Format baru:
            // { url: "...", type: "image" | "video" }
            if (typeof item === 'object' && item !== null && typeof item.url === 'string') {
              return {
                url: item.url,
                type: item.type === 'video' ? 'video' : getMediaType(item.url),
              };
            }

            // Format lama:
            // ["image1.jpg", "image2.jpg"]
            if (typeof item === 'string') {
              return {
                url: item,
                type: getMediaType(item),
              };
            }

            return null;
          })
          .filter(Boolean) as MediaItem[];
      }
    } catch {
      console.warn('Gagal membaca thumbnails:', theme.themeName);
    }
  }

  if (theme.thumbnail) {
    return [
      {
        url: theme.thumbnail,
        type: getMediaType(theme.thumbnail),
      },
    ];
  }

  return [];
}

export default function ThemeGallery({ themes }: { themes: Theme[] }) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const selectedMedia = useMemo(() => {
    if (!selectedTheme) return [];

    return parseMedia(selectedTheme);
  }, [selectedTheme]);

  const currentMedia = selectedMedia[currentIndex];

  /* ─────────────────────────────
     OPEN
  ───────────────────────────── */

  const openTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setCurrentIndex(0);
    setIsClosing(false);

    document.body.style.overflow = 'hidden';
  };

  /* ─────────────────────────────
     CLOSE
  ───────────────────────────── */

  const closeTheme = () => {
    setIsClosing(true);

    setTimeout(() => {
      setSelectedTheme(null);
      setIsClosing(false);
      document.body.style.overflow = '';
    }, 350);
  };

  /* ─────────────────────────────
     NEXT / PREVIOUS
  ───────────────────────────── */

  const nextMedia = () => {
    if (selectedMedia.length <= 1) return;

    setCurrentIndex((prev) => (prev >= selectedMedia.length - 1 ? 0 : prev + 1));
  };

  const previousMedia = () => {
    if (selectedMedia.length <= 1) return;

    setCurrentIndex((prev) => (prev <= 0 ? selectedMedia.length - 1 : prev - 1));
  };

  /* ─────────────────────────────
     KEYBOARD
  ───────────────────────────── */

  useEffect(() => {
    if (!selectedTheme) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTheme();
      }

      if (event.key === 'ArrowRight') {
        nextMedia();
      }

      if (event.key === 'ArrowLeft') {
        previousMedia();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTheme, selectedMedia.length]);

  /* ─────────────────────────────
     CLEANUP
  ───────────────────────────── */

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* ═══════════════════════════════
          GALLERY
      ═══════════════════════════════ */}

      <div className="themes-grid">
        {themes.map((theme, index) => {
          const media = parseMedia(theme);
          const firstMedia = media[0];

          return (
            <article
              key={theme.id}
              className="cinematic-theme-card"
              style={
                {
                  '--card-index': index,
                } as React.CSSProperties
              }
              onClick={() => openTheme(theme)}
            >
              <div className="cinematic-card-frame">
                {/* image / video */}
                <div className="cinematic-card-media">
                  {firstMedia ? (
                    firstMedia.type === 'video' ? (
                      <video src={firstMedia.url} muted autoPlay loop playsInline preload="metadata" className="theme-card-media" />
                    ) : (
                      <img src={firstMedia.url} alt={theme.themeName} className="theme-card-media" />
                    )
                  ) : (
                    <div className="theme-card-placeholder">
                      <span>Preview Tema</span>
                    </div>
                  )}

                  {/* cinematic gradient */}
                  <div className="cinematic-card-gradient" />

                  {/* floating glow */}
                  <div className="cinematic-card-glow" />

                  {/* top badge */}
                  <div className="cinematic-card-badge">
                    <span className="badge-dot" />
                    Preview
                  </div>

                  {/* media counter */}
                  {media.length > 1 && <div className="cinematic-card-counter">{media.length} media</div>}

                  {/* hover content */}
                  <div className="cinematic-card-content">
                    <span className="cinematic-card-eyebrow">Wedding Collection</span>

                    <h3>{theme.themeName}</h3>

                    <span className="cinematic-view">
                      <span>↗</span>
                      Lihat Tema
                    </span>
                  </div>

                  {/* floating petals */}
                  <div className="card-petal petal-one">✦</div>
                  <div className="card-petal petal-two">❋</div>
                  <div className="card-petal petal-three">✦</div>
                </div>

                {/* card info */}
                <div className="cinematic-card-info">
                  <div>
                    <span className="cinematic-card-small">Wedding Theme</span>

                    <p>{theme.themeName}</p>
                  </div>

                  <span className="cinematic-arrow">→</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ═══════════════════════════════
          CINEMATIC MODAL
      ═══════════════════════════════ */}

      {selectedTheme && currentMedia && (
        <div
          className={`cinematic-modal ${isClosing ? 'cinematic-modal-closing' : ''}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeTheme();
            }
          }}
        >
          {/* ambient background */}
          <div className="modal-ambient ambient-one" />
          <div className="modal-ambient ambient-two" />

          {/* SVG floating petals */}
          <svg className="floating-petals" viewBox="0 0 500 800" preserveAspectRatio="none" aria-hidden="true">
            <path className="petal-svg petal-svg-one" d="M100 100 C80 70 110 40 130 70 C145 95 125 120 100 100Z" />

            <path className="petal-svg petal-svg-two" d="M400 180 C380 150 410 120 430 150 C445 175 425 200 400 180Z" />

            <path className="petal-svg petal-svg-three" d="M180 500 C160 470 190 440 210 470 C225 495 205 520 180 500Z" />

            <path className="petal-svg petal-svg-four" d="M380 650 C360 620 390 590 410 620 C425 645 405 670 380 650Z" />

            <path className="petal-svg petal-svg-five" d="M70 650 C50 620 80 590 100 620 C115 645 95 670 70 650Z" />
          </svg>

          {/* modal */}
          <div className={`cinematic-modal-shell ${isClosing ? 'modal-shell-closing' : ''}`}>
            {/* glass header */}
            <div className="cinematic-modal-header">
              <div>
                <span className="modal-kicker">WEDDING COLLECTION</span>

                <h2>{selectedTheme.themeName}</h2>
              </div>

              <button type="button" className="cinematic-close" onClick={closeTheme} aria-label="Tutup preview">
                <span />
                <span />
              </button>
            </div>

            {/* preview stage */}
            <div className="cinematic-preview-stage">
              <div className="preview-glow" />

              <div className="preview-frame">
                <div className="preview-inner">
                  {currentMedia.type === 'video' ? (
                    <video key={currentMedia.url} src={currentMedia.url} autoPlay muted loop playsInline controls preload="metadata" className="cinematic-preview-media cinematic-video" />
                  ) : (
                    <img key={currentMedia.url} src={currentMedia.url} alt={selectedTheme.themeName} className="cinematic-preview-media" />
                  )}

                  {/* cinematic overlay */}
                  <div className="preview-vignette" />

                  {/* media label */}
                  <div className="preview-media-label">{currentMedia.type === 'video' ? 'VIDEO PREVIEW' : 'PHOTO PREVIEW'}</div>
                </div>
              </div>

              {/* Navigation */}
              {selectedMedia.length > 1 && (
                <>
                  <button type="button" className="preview-nav preview-prev" onClick={previousMedia} aria-label="Previous">
                    <span>←</span>
                  </button>

                  <button type="button" className="preview-nav preview-next" onClick={nextMedia} aria-label="Next">
                    <span>→</span>
                  </button>
                </>
              )}
            </div>

            {/* dots */}
            {selectedMedia.length > 1 && (
              <div className="cinematic-dots">
                {selectedMedia.map((item, index) => (
                  <button key={`${item.url}-${index}`} type="button" className={index === currentIndex ? 'cinematic-dot active' : 'cinematic-dot'} onClick={() => setCurrentIndex(index)} aria-label={`Preview ${index + 1}`} />
                ))}
              </div>
            )}

            {/* footer */}
            <div className="cinematic-modal-footer">
              <div className="modal-media-info">
                <span>{String(currentIndex + 1).padStart(2, '0')}</span>

                <i />

                <span>{String(selectedMedia.length).padStart(2, '0')}</span>
              </div>

              <Link href="/auth/register" className="cinematic-use-button">
                <span>Gunakan Tema Ini</span>
                <b>→</b>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════
          CINEMATIC CSS
      ═══════════════════════════════ */}

      <style jsx>{`
        /* ═══════════════════════════════
           CARD
        ═══════════════════════════════ */

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .cinematic-theme-card {
          cursor: pointer;
          perspective: 1200px;
        }

        .cinematic-card-frame {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.75);
          box-shadow:
            0 18px 50px rgba(70, 48, 30, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition:
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.7s ease;
        }

        .cinematic-theme-card:hover .cinematic-card-frame {
          transform: translateY(-8px) rotateX(1deg);
          box-shadow:
            0 30px 80px rgba(70, 48, 30, 0.16),
            0 0 0 1px rgba(255, 255, 255, 0.5);
        }

        .cinematic-card-media {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #eee8e1;
        }

        .theme-card-media {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
            filter 0.8s ease;
        }

        .cinematic-theme-card:hover .theme-card-media {
          transform: scale(1.045);
          filter: saturate(1.06);
        }

        .cinematic-card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(20, 15, 12, 0.12) 0%, transparent 38%, rgba(20, 15, 12, 0.76) 100%);
          pointer-events: none;
        }

        .cinematic-card-glow {
          position: absolute;
          width: 180px;
          height: 180px;
          right: -80px;
          top: -80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          filter: blur(40px);
          transition: transform 0.8s ease;
        }

        .cinematic-theme-card:hover .cinematic-card-glow {
          transform: scale(1.4);
        }

        .cinematic-card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 999px;
          color: white;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.13);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
          animation: pulseDot 2s infinite;
        }

        .cinematic-card-counter {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 7px 10px;
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 9px;
          letter-spacing: 0.08em;
          background: rgba(30, 25, 20, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
        }

        .cinematic-card-content {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 20px;
          color: white;
          transform: translateY(8px);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cinematic-theme-card:hover .cinematic-card-content {
          transform: translateY(0);
        }

        .cinematic-card-eyebrow {
          display: block;
          margin-bottom: 6px;
          font-size: 8px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        .cinematic-card-content h3 {
          margin: 0 0 14px;
          font-family: var(--serif);
          font-size: clamp(1.35rem, 2vw, 1.8rem);
          font-weight: 400;
          letter-spacing: -0.02em;
        }

        .cinematic-view {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .cinematic-view span {
          display: inline-flex;
          width: 25px;
          height: 25px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: transform 0.4s ease;
        }

        .cinematic-theme-card:hover .cinematic-view span {
          transform: rotate(45deg);
        }

        .cinematic-card-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 15px 18px 17px;
        }

        .cinematic-card-small {
          display: block;
          margin-bottom: 4px;
          color: var(--lv-muted);
          font-size: 8px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .cinematic-card-info p {
          margin: 0;
          color: var(--lv-dark);
          font-family: var(--serif);
          font-size: 1.05rem;
        }

        .cinematic-arrow {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(100, 80, 60, 0.12);
          color: var(--lv-dark);
          transition: 0.4s ease;
        }

        .cinematic-theme-card:hover .cinematic-arrow {
          transform: translateX(4px);
          background: var(--lv-dark);
          color: white;
        }

        /* petals on card */

        .card-petal {
          position: absolute;
          z-index: 2;
          color: rgba(255, 255, 255, 0.55);
          font-size: 14px;
          pointer-events: none;
          opacity: 0;
          transition: 0.6s ease;
        }

        .petal-one {
          left: 24%;
          top: 30%;
        }

        .petal-two {
          right: 20%;
          top: 22%;
        }

        .petal-three {
          right: 34%;
          bottom: 30%;
        }

        .cinematic-theme-card:hover .card-petal {
          opacity: 1;
        }

        .cinematic-theme-card:hover .petal-one {
          animation: petalFloatOne 4s ease-in-out infinite;
        }

        .cinematic-theme-card:hover .petal-two {
          animation: petalFloatTwo 5s ease-in-out infinite;
        }

        .cinematic-theme-card:hover .petal-three {
          animation: petalFloatThree 4.5s ease-in-out infinite;
        }

        /* ═══════════════════════════════
           MODAL
        ═══════════════════════════════ */

        .cinematic-modal {
          position: fixed;
          z-index: 9999;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          background: radial-gradient(circle at 50% 30%, rgba(120, 92, 70, 0.18), transparent 38%), rgba(15, 12, 10, 0.76);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          animation: modalFadeIn 0.5s ease both;
        }

        .cinematic-modal-closing {
          animation: modalFadeOut 0.35s ease both;
        }

        .modal-ambient {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(70px);
          opacity: 0.45;
        }

        .ambient-one {
          width: 420px;
          height: 420px;
          top: -180px;
          left: -120px;
          background: rgba(220, 190, 160, 0.22);
          animation: ambientMoveOne 10s ease-in-out infinite;
        }

        .ambient-two {
          width: 360px;
          height: 360px;
          right: -100px;
          bottom: -120px;
          background: rgba(180, 155, 130, 0.18);
          animation: ambientMoveTwo 12s ease-in-out infinite;
        }

        /* SVG petals */

        .floating-petals {
          position: absolute;
          z-index: 1;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .petal-svg {
          fill: rgba(255, 255, 255, 0.18);
          stroke: rgba(255, 255, 255, 0.35);
          stroke-width: 1;
          filter: blur(0.2px);
          transform-origin: center;
        }

        .petal-svg-one {
          animation: svgPetalOne 12s linear infinite;
        }

        .petal-svg-two {
          animation: svgPetalTwo 15s linear infinite;
        }

        .petal-svg-three {
          animation: svgPetalThree 11s linear infinite;
        }

        .petal-svg-four {
          animation: svgPetalFour 14s linear infinite;
        }

        .petal-svg-five {
          animation: svgPetalFive 13s linear infinite;
        }

        /* shell */

        .cinematic-modal-shell {
          position: relative;
          z-index: 5;
          width: min(920px, 94vw);
          max-height: 94vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.17);
          border-radius: 30px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.045));
          box-shadow:
            0 50px 120px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          animation: modalZoomIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .modal-shell-closing {
          animation: modalZoomOut 0.35s ease both;
        }

        .cinematic-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 24px 18px;
          color: white;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-kicker {
          display: block;
          margin-bottom: 6px;
          font-size: 8px;
          letter-spacing: 0.24em;
          opacity: 0.55;
        }

        .cinematic-modal-header h2 {
          margin: 0;
          font-family: var(--serif);
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 400;
        }

        .cinematic-close {
          position: relative;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.07);
          cursor: pointer;
          transition:
            transform 0.4s ease,
            background 0.4s ease;
        }

        .cinematic-close:hover {
          transform: rotate(90deg);
          background: rgba(255, 255, 255, 0.15);
        }

        .cinematic-close span {
          position: absolute;
          left: 12px;
          top: 20px;
          width: 16px;
          height: 1px;
          background: white;
        }

        .cinematic-close span:first-child {
          transform: rotate(45deg);
        }

        .cinematic-close span:last-child {
          transform: rotate(-45deg);
        }

        /* ═══════════════════════════════
           PREVIEW
        ═══════════════════════════════ */

        .cinematic-preview-stage {
          position: relative;
          min-height: 0;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px 70px;
          overflow: hidden;
        }

        .preview-glow {
          position: absolute;
          width: 55%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          filter: blur(60px);
          pointer-events: none;
        }

        .preview-frame {
          position: relative;
          z-index: 2;
          width: min(560px, 100%);
          height: min(57vh, 570px);
          padding: 7px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.04));
          box-shadow:
            0 30px 70px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.08);
          animation: previewFloat 6s ease-in-out infinite;
        }

        .preview-inner {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 17px;
          background: #181411;
        }

        .cinematic-preview-media {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          background: #181411;
          animation: mediaReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cinematic-video {
          object-fit: contain;
        }

        .preview-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.15), transparent 25%, transparent 70%, rgba(0, 0, 0, 0.2));
        }

        .preview-media-label {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 7px 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 7px;
          letter-spacing: 0.2em;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
        }

        .preview-nav {
          position: absolute;
          z-index: 4;
          top: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 50%;
          color: white;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          cursor: pointer;
          transform: translateY(-50%);
          transition:
            transform 0.4s ease,
            background 0.4s ease;
        }

        .preview-nav:hover {
          background: rgba(255, 255, 255, 0.17);
        }

        .preview-prev {
          left: 12px;
        }

        .preview-next {
          right: 12px;
        }

        .preview-prev:hover {
          transform: translate(-3px, -50%);
        }

        .preview-next:hover {
          transform: translate(3px, -50%);
        }

        /* ═══════════════════════════════
           DOTS
        ═══════════════════════════════ */

        .cinematic-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 2px 0 10px;
        }

        .cinematic-dot {
          width: 5px;
          height: 5px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.28);
          cursor: pointer;
          transition:
            width 0.4s ease,
            background 0.4s ease;
        }

        .cinematic-dot.active {
          width: 24px;
          background: rgba(255, 255, 255, 0.9);
        }

        /* ═══════════════════════════════
           FOOTER
        ═══════════════════════════════ */

        .cinematic-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 14px 24px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .modal-media-info {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 9px;
          letter-spacing: 0.16em;
        }

        .modal-media-info i {
          width: 20px;
          height: 1px;
          background: rgba(255, 255, 255, 0.25);
        }

        .cinematic-use-button {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 12px 16px 12px 18px;
          color: #2b211b;
          text-decoration: none;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
          transition:
            transform 0.4s ease,
            background 0.4s ease;
        }

        .cinematic-use-button b {
          font-size: 14px;
          font-weight: 400;
          transition: transform 0.4s ease;
        }

        .cinematic-use-button:hover {
          transform: translateY(-2px);
          background: white;
        }

        .cinematic-use-button:hover b {
          transform: translateX(4px);
        }

        /* ═══════════════════════════════
           ANIMATIONS
        ═══════════════════════════════ */

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeOut {
          from {
            opacity: 1;
          }

          to {
            opacity: 0;
          }
        }

        @keyframes modalZoomIn {
          from {
            opacity: 0;
            transform: scale(0.93) translateY(18px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalZoomOut {
          from {
            opacity: 1;
            transform: scale(1);
          }

          to {
            opacity: 0;
            transform: scale(0.95) translateY(12px);
          }
        }

        @keyframes mediaReveal {
          from {
            opacity: 0;
            transform: scale(1.035);
            filter: blur(5px);
          }

          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes previewFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes ambientMoveOne {
          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(80px, 60px);
          }
        }

        @keyframes ambientMoveTwo {
          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-70px, -40px);
          }
        }

        @keyframes petalFloatOne {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }

          50% {
            transform: translate(-12px, 18px) rotate(30deg);
          }
        }

        @keyframes petalFloatTwo {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }

          50% {
            transform: translate(16px, 12px) rotate(-30deg);
          }
        }

        @keyframes petalFloatThree {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }

          50% {
            transform: translate(-10px, -15px) rotate(25deg);
          }
        }

        @keyframes svgPetalOne {
          0% {
            transform: translate(-50px, -80px) rotate(0deg);
            opacity: 0;
          }

          20% {
            opacity: 0.8;
          }

          80% {
            opacity: 0.35;
          }

          100% {
            transform: translate(120px, 900px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes svgPetalTwo {
          0% {
            transform: translate(40px, -100px) rotate(20deg);
            opacity: 0;
          }

          20% {
            opacity: 0.6;
          }

          100% {
            transform: translate(-140px, 900px) rotate(-300deg);
            opacity: 0;
          }
        }

        @keyframes svgPetalThree {
          0% {
            transform: translate(100px, -120px) rotate(0);
            opacity: 0;
          }

          25% {
            opacity: 0.6;
          }

          100% {
            transform: translate(-80px, 850px) rotate(420deg);
            opacity: 0;
          }
        }

        @keyframes svgPetalFour {
          0% {
            transform: translate(-80px, -150px) rotate(30deg);
            opacity: 0;
          }

          25% {
            opacity: 0.55;
          }

          100% {
            transform: translate(80px, 900px) rotate(-360deg);
            opacity: 0;
          }
        }

        @keyframes svgPetalFive {
          0% {
            transform: translate(30px, -100px) rotate(0);
            opacity: 0;
          }

          20% {
            opacity: 0.5;
          }

          100% {
            transform: translate(-160px, 900px) rotate(300deg);
            opacity: 0;
          }
        }

        /* ═══════════════════════════════
           TABLET
        ═══════════════════════════════ */

        @media (max-width: 900px) {
          .themes-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .cinematic-preview-stage {
            padding-left: 60px;
            padding-right: 60px;
          }

          .preview-frame {
            width: min(500px, 100%);
            height: min(52vh, 520px);
          }
        }

        /* ═══════════════════════════════
           MOBILE
        ═══════════════════════════════ */

        @media (max-width: 640px) {
          .themes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .cinematic-card-frame {
            border-radius: 20px;
          }

          /*
           * Mobile card dibuat lebih pendek.
           * Ini mencegah foto portrait terlihat terlalu besar.
           */
          .cinematic-card-media {
            aspect-ratio: 1.18 / 1;
            max-height: 430px;
          }

          .cinematic-card-content {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }

          .cinematic-card-content h3 {
            font-size: 1.3rem;
            margin-bottom: 10px;
          }

          .cinematic-card-info {
            padding: 13px 15px 15px;
          }

          /* modal */

          .cinematic-modal {
            padding: 10px;
            align-items: center;
          }

          .cinematic-modal-shell {
            width: 100%;
            max-height: 96vh;
            border-radius: 23px;
          }

          .cinematic-modal-header {
            padding: 16px 16px 13px;
          }

          .cinematic-modal-header h2 {
            font-size: 1.35rem;
          }

          .modal-kicker {
            font-size: 7px;
          }

          .cinematic-close {
            width: 36px;
            height: 36px;
          }

          .cinematic-preview-stage {
            padding: 16px 16px 10px;
          }

          /*
           * INI bagian utama untuk problem gambar HP.
           *
           * Preview tidak lagi dipaksa memenuhi tinggi layar.
           */
          .preview-frame {
            width: min(100%, 340px);
            height: min(58vh, 430px);
            max-height: 430px;
            padding: 5px;
            border-radius: 18px;
          }

          .preview-inner {
            border-radius: 14px;
          }

          /*
           * contain menjaga seluruh foto/video tetap terlihat.
           * Jadi foto portrait tidak akan terpotong.
           */
          .cinematic-preview-media {
            object-fit: contain;
          }

          .preview-nav {
            width: 38px;
            height: 38px;
          }

          .preview-prev {
            left: 4px;
          }

          .preview-next {
            right: 4px;
          }

          .preview-media-label {
            top: 10px;
            left: 10px;
            padding: 6px 8px;
          }

          .cinematic-modal-footer {
            padding: 10px 16px 14px;
          }

          .modal-media-info {
            font-size: 8px;
          }

          .cinematic-use-button {
            gap: 10px;
            padding: 11px 13px 11px 15px;
            font-size: 8px;
          }

          .cinematic-dots {
            padding-bottom: 7px;
          }
        }

        @media (max-width: 380px) {
          .cinematic-preview-stage {
            padding-left: 12px;
            padding-right: 12px;
          }

          .preview-frame {
            width: min(100%, 300px);
            height: min(54vh, 370px);
          }

          .cinematic-use-button span {
            display: none;
          }

          .cinematic-use-button {
            padding: 10px 14px;
          }
        }

        /* accessibility */

        @media (prefers-reduced-motion: reduce) {
          .cinematic-modal,
          .cinematic-modal-shell,
          .preview-frame,
          .theme-card-media,
          .petal-svg,
          .card-petal,
          .modal-ambient {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
