'use client';
// app/auth/login/page.tsx

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const urlError = searchParams.get('error');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setErrorMsg(result.error);
      return;
    }

    const { getSession } = await import('next-auth/react');
    const session = await getSession();

    if (session?.user?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', system-ui, sans-serif;
          background: #F4EEFF;
        }

        /* ── Panel kiri — dekorasi ── */
        .auth-left {
          display: none;
          flex: 1;
          background: linear-gradient(135deg, #DCD6F7 0%, #A6B1E1 100%);
          position: relative;
          overflow: hidden;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 3rem;
        }
        @media (min-width: 1024px) { .auth-left { display: flex; } }

        .auth-left-orb {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(2px);
        }
        .auth-left-orb-1 { width: 350px; height: 350px; top: -80px; left: -80px; }
        .auth-left-orb-2 { width: 250px; height: 250px; bottom: -60px; right: -60px; }
        .auth-left-orb-3 { width: 150px; height: 150px; top: 50%; left: 50%; transform: translate(-50%, -50%); }

        .auth-left-content { position: relative; z-index: 1; text-align: center; color: white; }
        .auth-left-logo {
          width: 72px; height: 72px;
          background: rgba(255,255,255,0.25);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin: 0 auto 1.5rem;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .auth-left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem; font-weight: 300; line-height: 1.2;
          margin-bottom: 1rem;
        }
        .auth-left-title em { font-style: italic; }
        .auth-left-desc { font-size: 0.95rem; opacity: 0.85; line-height: 1.7; max-width: 320px; }

        .auth-left-badges {
          display: flex; gap: 0.75rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;
        }
        .auth-badge {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white; font-size: 0.75rem; font-weight: 500;
          padding: 0.4rem 0.9rem; border-radius: 100px;
          backdrop-filter: blur(4px);
        }

        /* ── Panel kanan — form ── */
        .auth-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2rem;
          max-width: 100%;
        }
        @media (min-width: 1024px) { .auth-right { max-width: 520px; } }

        .auth-card {
          width: 100%; max-width: 420px;
        }

        /* Brand mobile */
        .auth-brand-mobile {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 2.5rem;
        }
        @media (min-width: 1024px) { .auth-brand-mobile { display: none; } }
        .auth-brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #DCD6F7, #A6B1E1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .auth-brand-name { font-size: 1.1rem; font-weight: 600; color: #3d2c6e; }

        /* Heading */
        .auth-heading { margin-bottom: 2rem; }
        .auth-heading h1 {
          font-size: 1.75rem; font-weight: 700; color: #1e1333;
          margin-bottom: 0.4rem;
        }
        .auth-heading p { font-size: 0.9rem; color: #7b6fa0; }

        /* Error */
        .auth-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 0.85rem 1rem;
          font-size: 0.85rem; color: #dc2626;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 0.5rem;
        }

        /* Form fields */
        .auth-field { margin-bottom: 1.1rem; }
        .auth-label {
          display: block; font-size: 0.85rem; font-weight: 500;
          color: #3d2c6e; margin-bottom: 0.5rem;
        }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          background: white;
          border: 1.5px solid #DCD6F7;
          border-radius: 12px;
          padding: 0.8rem 1rem;
          font-size: 0.9rem; font-family: 'Inter', sans-serif;
          color: #1e1333;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus {
          border-color: #A6B1E1;
          box-shadow: 0 0 0 3px rgba(166,177,225,0.2);
        }
        .auth-input::placeholder { color: #b8afd0; }
        .auth-input-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: #b8afd0; pointer-events: none;
        }
        .auth-input.with-icon { padding-left: 2.75rem; }
        .auth-input-toggle {
          position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #b8afd0; padding: 0; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-input-toggle:hover { color: #A6B1E1; }

        /* Submit button */
        .auth-btn {
          width: 100%;
          background: linear-gradient(135deg, #A6B1E1, #8a96d4);
          color: white; font-size: 0.95rem; font-weight: 600;
          padding: 0.9rem; border-radius: 12px; border: none;
          cursor: pointer; margin-top: 0.5rem;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(166,177,225,0.4);
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .auth-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(166,177,225,0.5);
        }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        .auth-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.5rem 0;
        }
        .auth-divider-line { flex: 1; height: 1px; background: #EDE9F8; }
        .auth-divider-text { font-size: 0.8rem; color: #b8afd0; white-space: nowrap; }

        /* Footer link */
        .auth-footer {
          text-align: center; margin-top: 1.5rem;
          font-size: 0.875rem; color: #7b6fa0;
        }
        .auth-footer a {
          color: #A6B1E1; font-weight: 600; text-decoration: none;
          transition: color 0.2s;
        }
        .auth-footer a:hover { color: #8a96d4; }

        /* Back to home */
        .auth-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; color: #b8afd0; text-decoration: none;
          margin-bottom: 2rem; transition: color 0.2s;
        }
        .auth-back:hover { color: #A6B1E1; }
      `}</style>

      <div className="auth-root">
        {/* ── Panel Kiri ── */}
        <div className="auth-left">
          <div className="auth-left-orb auth-left-orb-1" />
          <div className="auth-left-orb auth-left-orb-2" />
          <div className="auth-left-orb auth-left-orb-3" />
          <div className="auth-left-content">
            <div className="auth-left-logo">💍</div>
            <h2 className="auth-left-title">
              Platform Undangan
              <br />
              <em>Digital Terbaik</em>
            </h2>
            <p className="auth-left-desc">Buat undangan pernikahan digital yang elegan dan personal — siap dibagikan dalam hitungan menit.</p>
            <div className="auth-left-badges">
              <span className="auth-badge">✦ 3 Tema Eksklusif</span>
              <span className="auth-badge">✦ RSVP Real-time</span>
              <span className="auth-badge">✦ Galeri Foto</span>
            </div>
          </div>
        </div>

        {/* ── Panel Kanan ── */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Brand mobile */}
            <div className="auth-brand-mobile">
              <div className="auth-brand-icon">💍</div>
              <span className="auth-brand-name">UndanganDigital</span>
            </div>

            {/* Back */}
            <Link href="/" className="auth-back">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
              Kembali ke beranda
            </Link>

            {/* Heading */}
            <div className="auth-heading">
              <h1>Selamat Datang 👋</h1>
              <p>Masuk ke akun untuk kelola undanganmu</p>
            </div>

            {/* Error */}
            {(errorMsg || urlError) && (
              <div className="auth-error">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {errorMsg || 'Sesi berakhir, silakan login kembali.'}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="contoh@email.com" className="auth-input with-icon" />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimal 8 karakter"
                    className="auth-input with-icon"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? (
                  <>
                    <div className="auth-spinner" /> Memproses...
                  </>
                ) : (
                  'Masuk ke Akun'
                )}
              </button>
            </form>

            <div className="auth-footer">
              Belum punya akun? <Link href="/auth/register">Daftar sekarang</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
