// lib/response.ts
// Helper untuk format response API yang konsisten

import { NextResponse } from 'next/server';

// Response sukses
export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// Response error
export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
