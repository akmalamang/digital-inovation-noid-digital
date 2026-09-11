'use client';
// app/admin/analytics/page.tsx
// Halaman analitik admin — grafik perkembangan undangan, RSVP, dan ucapan tamu

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────────
type AnalyticsData = {
  invPerMonth: { bulan: string; total: number }[];
  rsvpStats: { label: string; value: number; color: string }[];
  ucapanPerHari: { tanggal: string; total: number }[];
  summary: {
    totalUsers: number;
    totalInvitations: number;
    totalThemes: number;
    totalGuestBooks: number;
    totalHadir: number;
  };
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-lg text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Custom Pie Label ───────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {value}
    </text>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setData(json.data);
      } catch (err) {
        setError('Gagal memuat data analitik');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#424874] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || 'Data tidak tersedia'}</p>
      </div>
    );
  }

  const totalRsvp = data.rsvpStats.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Pengguna', value: data.summary.totalUsers, icon: '👥', color: 'bg-sky-50 text-sky-600' },
          { label: 'Total Undangan', value: data.summary.totalInvitations, icon: '✉️', color: 'bg-violet-50 text-violet-600' },
          { label: 'Total Ucapan', value: data.summary.totalGuestBooks, icon: '💬', color: 'bg-rose-50 text-rose-600' },
          { label: 'Konfirmasi Hadir', value: data.summary.totalHadir, icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grafik Undangan per Bulan ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-1">Undangan Baru per Bulan</h2>
        <p className="text-slate-400 text-sm mb-6">Perkembangan jumlah undangan yang dibuat sepanjang tahun ini</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.invPerMonth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="Undangan" fill="#7c3aed" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Grafik RSVP + Ucapan per Hari (dua kolom) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart RSVP */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Statistik RSVP</h2>
          <p className="text-slate-400 text-sm mb-4">Konfirmasi kehadiran dari seluruh tamu</p>

          {totalRsvp === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Belum ada data RSVP</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.rsvpStats.filter((d) => d.value > 0)} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={PieLabel}>
                    {data.rsvpStats.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value ?? 0, name]} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend manual */}
              <div className="flex justify-center gap-5 mt-2">
                {data.rsvpStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600">{s.label}</span>
                    <span className="font-semibold text-slate-800">({s.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Line Chart Ucapan per Hari */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Ucapan Tamu per Hari</h2>
          <p className="text-slate-400 text-sm mb-6">Aktivitas ucapan dalam 30 hari terakhir</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.ucapanPerHari.filter((_, i) => i % 3 === 0 || i === 29)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Ucapan" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3, fill: '#e11d48', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tabel ringkasan RSVP ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Ringkasan Kehadiran</h2>
        <div className="space-y-3">
          {data.rsvpStats.map((s) => {
            const pct = totalRsvp > 0 ? Math.round((s.value / totalRsvp) * 100) : 0;
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600">{s.label}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {s.value} tamu ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-slate-400 pt-1">Total {totalRsvp} tamu merespons</p>
        </div>
      </div>
    </div>
  );
}
