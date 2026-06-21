// ============================================================
// 관리자 — /admin (비밀번호 접근)
// 회원 조회 / 비포애프터·블로그·공지 CRUD / 조회수
// ============================================================
import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import { createSession, setSessionCookie, destroySession, getSession, adminPassword } from '../lib/auth';
import { DOCTORS, TREATMENTS, CLINIC } from '../data/clinic';
import { searchRegions } from '../data/regions';
import { EDITOR_CSS, EDITOR_MODALS, EDITOR_JS } from '../lib/editor';

type Bindings = { DB?: D1Database; R2?: R2Bucket; ADMIN_PASSWORD?: string };

export const admin = new Hono<{ Bindings: Bindings }>();

// ---------- 공통 ----------
async function requireAdmin(c: any): Promise<boolean> {
  const s = await getSession(c);
  return !!(s && s.isAdmin);
}

const ADMIN_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--navy:#3E2C1F;--navy-2:#291C12;--gold:#A6772F;--gold-2:#C99A52;--gold-soft:#EFE2C9;--bg:#F7F0E1;--line:#E2D7C3;--ink:#2A2018;--ink-soft:#7A6A58}
body{font-family:'Pretendard',-apple-system,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh}
a{color:inherit;text-decoration:none}
.adm-top{background:var(--navy);color:#fff;padding:14px 24px;display:flex;align-items:center;gap:20px;position:sticky;top:0;z-index:50}
.adm-top .brand{font-weight:800;font-size:1.05rem}
.adm-top .brand i{color:var(--gold-2);margin-right:8px}
.adm-top nav{display:flex;gap:4px;flex:1;flex-wrap:wrap}
.adm-top nav a{padding:8px 14px;border-radius:8px;font-size:.88rem;font-weight:600;color:rgba(255,255,255,.75);transition:.2s}
.adm-top nav a:hover,.adm-top nav a.on{background:rgba(255,255,255,.12);color:#fff}
.adm-top .out{font-size:.82rem;color:rgba(255,255,255,.6);cursor:pointer;background:none;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:7px 14px}
.adm-wrap{max-width:1100px;margin:0 auto;padding:32px 24px 80px}
.adm-wrap h1{font-size:1.5rem;margin-bottom:6px}
.adm-wrap .sub{color:var(--ink-soft);font-size:.9rem;margin-bottom:24px}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;margin-bottom:20px}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px}
.stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px}
.stat .n{font-size:1.8rem;font-weight:800;color:var(--navy)}
.stat .l{font-size:.82rem;color:var(--ink-soft);margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:.88rem}
th{text-align:left;padding:10px 12px;border-bottom:2px solid var(--line);color:var(--ink-soft);font-size:.78rem;letter-spacing:.05em;text-transform:uppercase}
td{padding:12px;border-bottom:1px solid var(--line);vertical-align:middle}
tr:hover td{background:var(--gold-soft)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;font-weight:700;font-size:.86rem;cursor:pointer;border:none;transition:.2s}
.btn-p{background:var(--navy);color:#fff}.btn-p:hover{background:var(--navy-2)}
.btn-g{background:var(--gold);color:#fff}.btn-g:hover{background:#8A5F26}
.btn-o{background:transparent;border:1px solid var(--line);color:var(--ink)}
.btn-d{background:#fde8e8;color:#a33}
.btn-sm{padding:5px 10px;font-size:.78rem;border-radius:8px}
label{display:block;font-weight:700;font-size:.85rem;margin:14px 0 6px}
input[type=text],input[type=password],input[type=email],select,textarea{width:100%;padding:11px 14px;border:1px solid var(--line);border-radius:10px;font-size:.95rem;font-family:inherit;background:#fff}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--gold)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.img-slot{border:2px dashed var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer;transition:.2s;position:relative;min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.img-slot:hover{border-color:var(--gold)}
.img-slot img{max-width:100%;max-height:120px;border-radius:8px}
.img-slot .lbl{font-size:.78rem;color:var(--ink-soft);font-weight:600}
.img-slot .rm{position:absolute;top:6px;right:6px;background:#a33;color:#fff;border:none;border-radius:6px;font-size:.7rem;padding:3px 7px;cursor:pointer;display:none}
.img-slot.has .rm{display:block}
.badge{display:inline-block;padding:3px 9px;border-radius:99px;font-size:.72rem;font-weight:700}
.badge.on{background:var(--gold-soft);color:#8A5F26}
.badge.off{background:#eee;color:#999}
.badge.pin{background:var(--navy);color:#fff}
.msg{padding:12px 16px;border-radius:10px;margin-top:14px;display:none;font-weight:600;font-size:.88rem}
.msg.ok{display:block;background:var(--gold-soft);color:var(--navy)}
.msg.err{display:block;background:#fde8e8;color:#a33}
.autocomplete{position:relative}
.ac-list{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid var(--line);border-radius:10px;margin-top:4px;max-height:220px;overflow-y:auto;z-index:20;display:none;box-shadow:0 8px 24px rgba(0,0,0,.1)}
.ac-list div{padding:10px 14px;cursor:pointer;font-size:.88rem}
.ac-list div:hover{background:var(--gold-soft)}
.editor-bar{display:flex;gap:4px;flex-wrap:wrap;padding:8px;background:var(--bg);border:1px solid var(--line);border-bottom:none;border-radius:10px 10px 0 0}
.editor-bar button{padding:7px 11px;border:1px solid var(--line);background:#fff;border-radius:7px;cursor:pointer;font-size:.8rem;font-weight:600}
.editor-bar button:hover{background:var(--gold-soft)}
.editor-body{border:1px solid var(--line);border-radius:0 0 10px 10px;min-height:340px;padding:18px;background:#fff;overflow-y:auto;max-height:560px}
.editor-body:focus{outline:2px solid var(--gold-soft)}
.editor-body h2{font-size:1.4rem;margin:.8em 0 .4em}
.editor-body h3{font-size:1.15rem;margin:.7em 0 .35em}
.editor-body p{margin:.5em 0;line-height:1.7}
.editor-body img{max-width:100%;border-radius:10px;margin:8px 0}
.editor-body.dragover{outline:3px dashed var(--gold)}
.drop-hint{font-size:.78rem;color:var(--ink-soft);margin-top:6px}
/* 토글 스위치 */
.switch{position:relative;display:inline-block;width:48px;height:26px;flex:none}
.switch input{opacity:0;width:0;height:0}
.switch .slider{position:absolute;inset:0;background:#cbc0ad;border-radius:99px;transition:.25s;cursor:pointer}
.switch .slider:before{content:"";position:absolute;height:20px;width:20px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.25s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.switch input:checked+.slider{background:var(--gold)}
.switch input:checked+.slider:before{transform:translateX(22px)}
.switch.sm{width:38px;height:21px}.switch.sm .slider:before{height:15px;width:15px}.switch.sm input:checked+.slider:before{transform:translateX(17px)}
/* 팝업 미리보기 */
.preview-wrap{margin-top:20px;border-top:1px dashed var(--line);padding-top:18px}
.preview-label{font-size:.8rem;font-weight:700;color:var(--ink-soft);margin-bottom:10px}
.preview-label i{color:var(--gold);margin-right:6px}
.preview-stage{background:linear-gradient(135deg,#efe6d4,#f7f0e1);border-radius:14px;padding:30px 16px;display:flex;justify-content:center;min-height:180px;align-items:center}
.pv-popup{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(62,44,31,.28);width:300px;text-align:left;position:relative;border:1px solid var(--line)}
.pv-popup.pv-sm{width:240px}.pv-popup.pv-lg{width:380px}
.pv-popup .pv-x{position:absolute;top:10px;right:10px;width:30px;height:30px;border:none;border-radius:50%;background:rgba(255,255,255,.85);color:var(--navy);font-size:1.2rem;cursor:pointer;z-index:2;line-height:1}
.pv-img img{width:100%;display:block;max-height:200px;object-fit:cover}
.pv-body{padding:20px}
.pv-tag{display:inline-block;font-size:.66rem;font-weight:800;letter-spacing:.12em;color:var(--gold);background:var(--gold-soft);padding:4px 10px;border-radius:99px;margin-bottom:10px}
.pv-body h4{font-size:1.15rem;color:var(--navy);margin:0 0 8px;line-height:1.3;word-break:keep-all}
.pv-content{font-size:.82rem;color:var(--ink-soft);line-height:1.6;max-height:90px;overflow:hidden}
.pv-content h3{font-size:.9rem;margin:.4em 0}.pv-content p{margin:.3em 0}
.pv-actions{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:8px}
.pv-btn-x{font-size:.74rem;color:var(--ink-soft);text-decoration:underline;cursor:default}
.pv-btn-go{font-size:.8rem;font-weight:700;color:#fff;background:var(--navy);padding:8px 14px;border-radius:10px}
@media(max-width:760px){.row2,.row3{grid-template-columns:1fr}.adm-top nav{font-size:.8rem}}
${EDITOR_CSS}
`;

function adminShell(title: string, active: string, body: string) {
  return html`<!DOCTYPE html><html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${title} | 관리자 - ${CLINIC.name}</title>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
<style>${raw(ADMIN_CSS)}</style>
</head><body>
<header class="adm-top">
  <a href="/admin" class="brand"><i class="fas fa-tooth"></i>${CLINIC.name} 관리자</a>
  <nav>
    <a href="/admin" class="${active === 'dash' ? 'on' : ''}">대시보드</a>
    <a href="/admin/members" class="${active === 'members' ? 'on' : ''}">회원</a>
    <a href="/admin/cases" class="${active === 'cases' ? 'on' : ''}">비포&애프터</a>
    <a href="/admin/posts" class="${active === 'posts' ? 'on' : ''}">블로그</a>
    <a href="/admin/notices" class="${active === 'notices' ? 'on' : ''}">공지사항</a>
    <a href="/admin/reservations" class="${active === 'res' ? 'on' : ''}">예약문의</a>
  </nav>
  <button class="out" onclick="fetch('/api/auth/logout',{method:'POST'}).then(()=>location.href='/admin')">로그아웃</button>
</header>
<div class="adm-wrap">${raw(body)}</div>
${raw(EDITOR_MODALS)}
${raw(EDITOR_JS)}
</body></html>`;
}

// ---------- 로그인 ----------
admin.get('/', async (c) => {
  if (!(await requireAdmin(c))) {
    return c.html(html`<!DOCTYPE html><html lang="ko"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>관리자 로그인</title>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>${raw(ADMIN_CSS)}</style></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh">
<div class="card" style="width:100%;max-width:380px">
  <h1 style="font-size:1.3rem">🔐 관리자 로그인</h1>
  <p class="sub" style="color:var(--ink-soft);font-size:.85rem;margin-top:6px">관리자 비밀번호를 입력하세요.</p>
  <form id="af">
    <label>비밀번호</label>
    <input type="password" id="pw" required autofocus>
    <button type="submit" class="btn btn-p" style="width:100%;margin-top:18px;justify-content:center">로그인</button>
    <div class="msg" id="m"></div>
  </form>
</div>
<script>
document.getElementById('af').addEventListener('submit',async function(e){
  e.preventDefault();var m=document.getElementById('m');
  var r=await fetch('/admin/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('pw').value})});
  var j=await r.json();
  if(j.ok)location.reload();else{m.className='msg err';m.textContent=j.error||'비밀번호가 올바르지 않습니다.';}
});
</script></body></html>`);
  }
  // 대시보드
  const db = c.env.DB!;
  const today = new Date().toISOString().slice(0, 10);
  const [members, cases, posts, notices, reservations, activePopup, recentRes] = await Promise.all([
    db.prepare('SELECT COUNT(*) n FROM members').first<any>(),
    db.prepare('SELECT COUNT(*) n, COALESCE(SUM(views),0) v FROM cases').first<any>(),
    db.prepare('SELECT COUNT(*) n, COALESCE(SUM(views),0) v FROM posts').first<any>(),
    db.prepare('SELECT COUNT(*) n, COALESCE(SUM(views),0) v FROM notices').first<any>(),
    db.prepare('SELECT COUNT(*) n FROM reservations').first<any>(),
    db.prepare(`SELECT id, title, popup_start, popup_end FROM notices
      WHERE published=1 AND is_popup=1
        AND (popup_start IS NULL OR popup_start <= ?) AND (popup_end IS NULL OR popup_end >= ?)
      ORDER BY id DESC LIMIT 1`).bind(today, today).first<any>().catch(() => null),
    db.prepare('SELECT name, phone, treatment, created_at FROM reservations ORDER BY id DESC LIMIT 5').all().catch(() => ({ results: [] })),
  ]);

  const popupCard = activePopup
    ? `<div class="card" style="background:linear-gradient(135deg,#fbf4e6,#fff);border:2px solid var(--gold-soft)">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="font-size:1.6rem">🟢</span>
          <div style="flex:1;min-width:180px">
            <div style="font-weight:800;color:var(--navy)">홈 팝업 노출 중</div>
            <div style="font-size:.88rem;color:var(--ink-soft);margin-top:2px">"${esc(activePopup.title)}" · ${activePopup.popup_start || '즉시'} ~ ${activePopup.popup_end || '무기한'}</div>
          </div>
          <a href="/admin/notices/${activePopup.id}" class="btn btn-o btn-sm">편집</a>
          <a href="/" target="_blank" class="btn btn-g btn-sm"><i class="fas fa-eye"></i> 확인</a>
        </div>
      </div>`
    : `<div class="card" style="border:1px dashed var(--line)">
        <div style="display:flex;align-items:center;gap:12px;color:var(--ink-soft)">
          <span style="font-size:1.4rem">⚪</span>
          <div style="flex:1">현재 홈 화면에 노출 중인 팝업이 없습니다.</div>
          <a href="/admin/notices/new" class="btn btn-o btn-sm"><i class="fas fa-plus"></i> 팝업 공지 만들기</a>
        </div>
      </div>`;

  const resRows = ((recentRes as any).results as any[] || []).map(r => `
    <tr><td><strong>${esc(r.name)}</strong></td><td>${esc(r.phone)}</td><td>${esc(r.treatment || '-')}</td>
    <td style="font-size:.8rem;color:var(--ink-soft)">${(r.created_at || '').slice(0, 16).replace('T', ' ')}</td></tr>`).join('');

  return c.html(adminShell('대시보드', 'dash', `
  <h1>대시보드</h1><p class="sub">사이트 현황을 한눈에 확인하세요.</p>
  <div class="stat-grid">
    <div class="stat"><div class="n">${members?.n ?? 0}</div><div class="l">회원 수</div></div>
    <div class="stat"><div class="n">${cases?.n ?? 0}</div><div class="l">비포&애프터 (조회 ${cases?.v ?? 0})</div></div>
    <div class="stat"><div class="n">${posts?.n ?? 0}</div><div class="l">블로그 글 (조회 ${posts?.v ?? 0})</div></div>
    <div class="stat"><div class="n">${notices?.n ?? 0}</div><div class="l">공지사항 (조회 ${notices?.v ?? 0})</div></div>
    <div class="stat"><div class="n">${reservations?.n ?? 0}</div><div class="l">예약 문의</div></div>
  </div>
  ${popupCard}
  <div class="card">
    <h3 style="margin-bottom:12px">빠른 작업</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/admin/cases/new" class="btn btn-g"><i class="fas fa-plus"></i> 비포&애프터 등록</a>
      <a href="/admin/posts/new" class="btn btn-g"><i class="fas fa-pen"></i> 블로그 작성</a>
      <a href="/admin/notices/new" class="btn btn-g"><i class="fas fa-bullhorn"></i> 공지 작성</a>
      <a href="/" class="btn btn-o" target="_blank"><i class="fas fa-external-link-alt"></i> 사이트 보기</a>
    </div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="margin:0">최근 예약 문의</h3>
      <a href="/admin/reservations" style="font-size:.84rem;font-weight:700;color:var(--gold)">전체 보기 →</a>
    </div>
    <div style="overflow-x:auto">
      <table><thead><tr><th>성함</th><th>연락처</th><th>희망진료</th><th>접수일</th></tr></thead>
      <tbody>${resRows || '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);padding:24px">아직 접수된 문의가 없습니다.</td></tr>'}</tbody></table>
    </div>
  </div>`));
});

admin.post('/api/login', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ ok: false, error: 'DB 미연결' }, 500);
  const { password } = await c.req.json();
  if (password !== adminPassword(c.env)) return c.json({ ok: false, error: '비밀번호가 올바르지 않습니다.' }, 401);
  const token = await createSession(db, null, true);
  setSessionCookie(c, token);
  return c.json({ ok: true });
});

// ---------- 회원 목록 ----------
admin.get('/members', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const { results } = await db.prepare('SELECT id, email, phone, name, agree_marketing, created_at, last_login_at FROM members ORDER BY id DESC LIMIT 500').all();
  const rows = (results as any[]).map(m => `
    <tr>
      <td>${m.id}</td><td><strong>${esc(m.name)}</strong></td><td>${esc(m.email)}</td><td>${esc(m.phone)}</td>
      <td><span class="badge ${m.agree_marketing ? 'on' : 'off'}">${m.agree_marketing ? '동의' : '미동의'}</span></td>
      <td style="font-size:.8rem;color:var(--ink-soft)">${(m.created_at || '').slice(0, 10)}</td>
      <td style="font-size:.8rem;color:var(--ink-soft)">${(m.last_login_at || '-').slice(0, 10)}</td>
      <td><button class="btn btn-d btn-sm" onclick="delMember(${m.id},'${esc(m.name)}')">삭제</button></td>
    </tr>`).join('');
  return c.html(adminShell('회원 관리', 'members', `
  <h1>회원 관리</h1><p class="sub">가입 회원 목록입니다. (최근 500명)</p>
  <div class="card" style="overflow-x:auto">
    <table><thead><tr><th>ID</th><th>성함</th><th>이메일</th><th>전화</th><th>마케팅수신</th><th>가입일</th><th>최근로그인</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:var(--ink-soft);padding:30px">아직 가입한 회원이 없습니다.</td></tr>'}</tbody></table>
  </div>
  <script>
  async function delMember(id,name){
    if(!confirm(name+' 회원을 삭제할까요? 되돌릴 수 없습니다.'))return;
    await fetch('/admin/api/members/'+id,{method:'DELETE'});location.reload();
  }
  </script>`));
});

admin.delete('/api/members/:id', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const db = c.env.DB!;
  const id = c.req.param('id');
  await db.prepare('DELETE FROM sessions WHERE member_id = ?').bind(id).run();
  await db.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
  return c.json({ ok: true });
});

// ---------- 예약 문의 목록 ----------
admin.get('/reservations', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB!;
  const { results } = await db.prepare('SELECT * FROM reservations ORDER BY id DESC LIMIT 300').all();
  const rows = (results as any[]).map(r => `
    <tr><td>${r.id}</td><td><strong>${esc(r.name)}</strong></td><td>${esc(r.phone)}</td>
    <td>${esc(r.treatment || '-')}</td><td>${esc(r.datetime || '-')}</td>
    <td style="max-width:240px;font-size:.82rem">${esc(r.message || '-')}</td>
    <td style="font-size:.8rem;color:var(--ink-soft)">${(r.created_at || '').slice(0, 16).replace('T', ' ')}</td></tr>`).join('');
  return c.html(adminShell('예약 문의', 'res', `
  <h1>예약 문의</h1><p class="sub">온라인 예약 문의 접수 내역입니다.</p>
  <div class="card" style="overflow-x:auto">
    <table><thead><tr><th>ID</th><th>성함</th><th>연락처</th><th>희망진료</th><th>희망일시</th><th>내용</th><th>접수일</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:var(--ink-soft);padding:30px">접수된 문의가 없습니다.</td></tr>'}</tbody></table>
  </div>`));
});

function esc(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export { adminShell, requireAdmin, esc, ADMIN_CSS };
