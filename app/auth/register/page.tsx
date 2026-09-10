'use client';
// app/auth/register/page.tsx

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (form.password.length < 8) {
      setErrorMsg('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setErrorMsg(data.message || 'Registrasi gagal');
      return;
    }

    const signInResult = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      router.push('/auth/login');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  // Strength indicator password
  function getPasswordStrength(pwd: string) {
    if (pwd.length === 0) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: 'Lemah', color: '#ef4444' };
    if (pwd.length < 8) return { level: 2, label: 'Cukup', color: '#f59e0b' };
    if (pwd.length < 12 && /[A-Z]/.test(pwd)) return { level: 3, label: 'Kuat', color: '#10b981' };
    if (pwd.length >= 12) return { level: 4, label: 'Sangat Kuat', color: '#059669' };
    return { level: 2, label: 'Cukup', color: '#f59e0b' };
  }

  const strength = getPasswordStrength(form.password);

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

        /* ── Panel kiri ── */
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
        .auth-left-orb-1 { width: 350px; height: 350px; top: -80px; right: -80px; }
        .auth-left-orb-2 { width: 200px; height: 200px; bottom: -50px; left: -50px; }
        .auth-left-orb-3 { width: 120px; height: 120px; top: 40%; left: 10%; }

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

        .auth-steps {
          margin-top: 2rem; text-align: left; width: 100%; max-width: 280px;
        }
        .auth-step {
          display: flex; align-items: flex-start; gap: 0.75rem;
          margin-bottom: 1rem; color: white;
        }
        .auth-step-num {
          width: 24px; height: 24px; border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; shrink: 0; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.4);
        }
        .auth-step-text { font-size: 0.85rem; opacity: 0.9; line-height: 1.4; }

        /* ── Panel kanan ── */
        .auth-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 2rem;
          overflow-y: auto;
        }
        @media (min-width: 1024px) { .auth-right { max-width: 520px; } }

        .auth-card { width: 100%; max-width: 420px; padding: 1rem 0; }

        .auth-brand-mobile {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 2rem;
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

        .auth-heading { margin-bottom: 1.75rem; }
        .auth-heading h1 {
          font-size: 1.75rem; font-weight: 700; color: #1e1333;
          margin-bottom: 0.4rem;
        }
        .auth-heading p { font-size: 0.9rem; color: #7b6fa0; }

        .auth-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 12px; padding: 0.85rem 1rem;
          font-size: 0.85rem; color: #dc2626;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 0.5rem;
        }

        .auth-field { margin-bottom: 1rem; }
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
          color: #1e1333; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus {
          border-color: #A6B1E1;
          box-shadow: 0 0 0 3px rgba(166,177,225,0.2);
        }
        .auth-input::placeholder { color: #b8afd0; }
        .auth-input.with-icon { padding-left: 2.75rem; }
        .auth-input-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: #b8afd0; pointer-events: none;
        }
        .auth-input-toggle {
          position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #b8afd0; padding: 0; display: flex;
          transition: color 0.2s;
        }
        .auth-input-toggle:hover { color: #A6B1E1; }

        /* Password strength */
        .pwd-strength { margin-top: 0.5rem; }
        .pwd-strength-bars {
          display: flex; gap: 3px; margin-bottom: 0.3rem;
        }
        .pwd-bar {
          flex: 1; height: 3px; border-radius: 100px;
          background: #EDE9F8; transition: background 0.3s;
        }
        .pwd-label { font-size: 0.75rem; color: #b8afd0; }

        /* Match indicator */
        .pwd-match {
          font-size: 0.75rem; margin-top: 0.4rem;
          display: flex; align-items: center; gap: 0.3rem;
        }

        .auth-btn {
          width: 100%;
          background: linear-gradient(135deg, #A6B1E1, #8a96d4);
          color: white; font-size: 0.95rem; font-weight: 600;
          padding: 0.9rem; border-radius: 12px; border: none;
          cursor: pointer; margin-top: 0.75rem;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(166,177,225,0.4);
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .auth-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(166,177,225,0.5);
        }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .auth-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer {
          text-align: center; margin-top: 1.5rem;
          font-size: 0.875rem; color: #7b6fa0;
        }
        .auth-footer a {
          color: #A6B1E1; font-weight: 600; text-decoration: none;
          transition: color 0.2s;
        }
        .auth-footer a:hover { color: #8a96d4; }

        .auth-back {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; color: #b8afd0; text-decoration: none;
          margin-bottom: 1.75rem; transition: color 0.2s;
        }
        .auth-back:hover { color: #A6B1E1; }

        .auth-terms {
          font-size: 0.78rem; color: #b8afd0; text-align: center;
          margin-top: 0.75rem; line-height: 1.5;
        }
        .auth-terms a { color: #A6B1E1; text-decoration: none; }
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
              Mulai Perjalanan
              <br />
              <em>Spesialmu</em>
            </h2>
            <p className="auth-left-desc">Daftar gratis dan buat undangan digital pertamamu dalam hitungan menit.</p>
            <div className="auth-steps">
              {['Daftar akun gratis', 'Pilih tema undangan', 'Isi detail pernikahan', 'Bagikan ke tamu'].map((step, i) => (
                <div key={i} className="auth-step">
                  <div className="auth-step-num">{i + 1}</div>
                  <p className="auth-step-text">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel Kanan ── */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-brand-mobile">
              <div className="auth-brand-icon">💍</div>
              <span className="auth-brand-name">UndanganDigital</span>
            </div>

            <Link href="/" className="auth-back">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
              Kembali ke beranda
            </Link>

            <div className="auth-heading">
              <h1>Buat Akun Baru ✨</h1>
              <p>Gratis, tanpa kartu kredit, langsung bisa dipakai</p>
            </div>

            {errorMsg && (
              <div className="auth-error">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input type="text" name="username" value={form.username} onChange={handleChange} required placeholder="username_kamu" className="auth-input with-icon" />
                </div>
              </div>

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

                {/* Password strength */}
                {form.password.length > 0 && (
                  <div className="pwd-strength">
                    <div className="pwd-strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className="pwd-bar" style={{ background: level <= strength.level ? strength.color : '#EDE9F8' }} />
                      ))}
                    </div>
                    <p className="pwd-label" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="auth-field">
                <label className="auth-label">Konfirmasi Password</label>
                <div className="auth-input-wrap">
                  <svg className="auth-input-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Ulangi password"
                    className="auth-input with-icon"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowConfirm((p) => !p)}>
                    {showConfirm ? (
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

                {/* Password match indicator */}
                {form.confirmPassword.length > 0 && (
                  <div className="pwd-match">
                    {form.password === form.confirmPassword ? (
                      <>
                        <svg width="13" height="13" fill="none" stroke="#10b981" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ color: '#10b981' }}>Password cocok</span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" fill="none" stroke="#ef4444" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span style={{ color: '#ef4444' }}>Password tidak cocok</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? (
                  <>
                    <div className="auth-spinner" /> Mendaftarkan...
                  </>
                ) : (
                  'Buat Akun Sekarang'
                )}
              </button>

              <p className="auth-terms">
                Dengan mendaftar, kamu menyetujui <a href="#">Syarat & Ketentuan</a> kami.
              </p>
            </form>

            <div className="auth-footer">
              Sudah punya akun? <Link href="/auth/login">Masuk di sini</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
