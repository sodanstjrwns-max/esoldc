// ============================================================
// 인증 API 라우트 — /api/auth/*
// ============================================================
import { Hono } from 'hono';
import { hashPassword, verifyPassword, createSession, setSessionCookie, destroySession, getSession } from '../lib/auth';

type Bindings = { DB?: D1Database };

export const authApi = new Hono<{ Bindings: Bindings }>();

// 회원가입
authApi.post('/signup', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ ok: false, error: '데이터베이스가 연결되지 않았습니다.' }, 500);
  try {
    const b = await c.req.json();
    const name = (b.name || '').trim();
    const email = (b.email || '').trim().toLowerCase();
    const phone = (b.phone || '').trim();
    const password = b.password || '';
    const agreePrivacy = b.agree_privacy ? 1 : 0;
    const agreeMarketing = b.agree_marketing ? 1 : 0;

    if (!name || !email || !phone || !password) return c.json({ ok: false, error: '필수 항목을 모두 입력해 주세요.' }, 400);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ ok: false, error: '이메일 형식이 올바르지 않습니다.' }, 400);
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone)) return c.json({ ok: false, error: '휴대전화번호 형식이 올바르지 않습니다.' }, 400);
    if (password.length < 8) return c.json({ ok: false, error: '비밀번호는 8자 이상이어야 합니다.' }, 400);
    if (!agreePrivacy) return c.json({ ok: false, error: '개인정보 수집·이용 동의(필수)에 체크해 주세요.' }, 400);

    const exists = await db.prepare('SELECT id FROM members WHERE email = ?').bind(email).first();
    if (exists) return c.json({ ok: false, error: '이미 가입된 이메일입니다. 로그인해 주세요.' }, 409);

    const { hash, salt } = await hashPassword(password);
    const result = await db.prepare(`
      INSERT INTO members (email, phone, name, password_hash, password_salt, agree_privacy, agree_marketing, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(email, phone, name, hash, salt, agreePrivacy, agreeMarketing).run();

    const token = await createSession(db, result.meta.last_row_id as number, false);
    setSessionCookie(c, token);
    return c.json({ ok: true, redirect: '/cases' });
  } catch (e) {
    return c.json({ ok: false, error: '가입 처리 중 오류가 발생했습니다.' }, 500);
  }
});

// 로그인
authApi.post('/login', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ ok: false, error: '데이터베이스가 연결되지 않았습니다.' }, 500);
  try {
    const b = await c.req.json();
    const email = (b.email || '').trim().toLowerCase();
    const password = b.password || '';
    if (!email || !password) return c.json({ ok: false, error: '이메일과 비밀번호를 입력해 주세요.' }, 400);

    const m = await db.prepare('SELECT id, password_hash, password_salt FROM members WHERE email = ?').bind(email).first<any>();
    if (!m) return c.json({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);

    const valid = await verifyPassword(password, m.password_salt, m.password_hash);
    if (!valid) return c.json({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);

    await db.prepare("UPDATE members SET last_login_at = datetime('now') WHERE id = ?").bind(m.id).run();
    const token = await createSession(db, m.id, false);
    setSessionCookie(c, token);
    return c.json({ ok: true });
  } catch {
    return c.json({ ok: false, error: '로그인 처리 중 오류가 발생했습니다.' }, 500);
  }
});

// 로그아웃
authApi.post('/logout', async (c) => {
  await destroySession(c);
  return c.json({ ok: true });
});

// 세션 확인
authApi.get('/me', async (c) => {
  const s = await getSession(c);
  if (!s) return c.json({ ok: false }, 401);
  return c.json({ ok: true, name: s.name, isAdmin: s.isAdmin });
});
