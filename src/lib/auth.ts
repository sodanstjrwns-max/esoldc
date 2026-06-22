// ============================================================
// 인증 유틸 — Web Crypto 기반 (Cloudflare Workers 호환)
// PBKDF2 비밀번호 해싱 + 세션 토큰 관리
// ============================================================
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const SESSION_COOKIE = 'isol_session';
const SESSION_DAYS = 14;

// ---- 비밀번호 해싱 (PBKDF2-SHA256) ----
export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqual(hash, expectedHash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(h: string): Uint8Array {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

// ---- 세션 ----
export function newToken(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

export async function createSession(db: D1Database, memberId: number | null, isAdmin: boolean): Promise<string> {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  await db.prepare('INSERT INTO sessions (token, member_id, is_admin, expires_at) VALUES (?, ?, ?, ?)')
    .bind(token, memberId, isAdmin ? 1 : 0, expires).run();
  return token;
}

export type SessionInfo = { memberId: number | null; isAdmin: boolean; name?: string };

export async function getSession(c: Context): Promise<SessionInfo | null> {
  const db = (c.env as any).DB as D1Database | undefined;
  if (!db) return null;
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  try {
    const row = await db.prepare(`
      SELECT s.member_id, s.is_admin, s.expires_at, m.name
      FROM sessions s LEFT JOIN members m ON m.id = s.member_id
      WHERE s.token = ?`).bind(token).first<any>();
    if (!row) return null;
    if (new Date(row.expires_at) < new Date()) {
      await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      return null;
    }
    return { memberId: row.member_id, isAdmin: !!row.is_admin, name: row.name || undefined };
  } catch { return null; }
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: 'Lax', path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession(c: Context) {
  const db = (c.env as any).DB as D1Database | undefined;
  const token = getCookie(c, SESSION_COOKIE);
  if (db && token) {
    try { await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run(); } catch {}
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

// ---- 관리자 비밀번호 (환경변수 ADMIN_PASSWORD, 기본값은 개발용) ----
export function adminPassword(env: any): string {
  return env.ADMIN_PASSWORD || 'isol2026!admin';
}
