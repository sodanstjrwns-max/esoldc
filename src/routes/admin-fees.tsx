// ============================================================
// 관리자 — 비급여 수가(진료비) 편집  /admin/fees
// 항목명·금액 수정, 항목/분류 추가·삭제, 항목별 공개/비공개 토글.
// 저장 시 전체를 D1 price_items 테이블로 재기록(순서 보존).
// ============================================================
import { Hono } from 'hono';
import { adminShell, requireAdmin, esc } from './admin';
import { loadAdminPricing, ensurePricingSeed, type AdminPriceGroup } from '../lib/fees';

type Bindings = { DB?: D1Database; ADMIN_PASSWORD?: string };

export const adminFees = new Hono<{ Bindings: Bindings }>();

function itemRow(it: { name: string; price: number; is_published: number }): string {
  const on = it.is_published ? 'checked' : '';
  return `
  <div class="fee-item" draggable="false">
    <label class="switch sm" title="공개/비공개">
      <input type="checkbox" class="fi-pub" ${on}>
      <span class="slider"></span>
    </label>
    <input type="text" class="fi-name" value="${esc(it.name)}" placeholder="항목명">
    <div class="fi-price-wrap">
      <input type="number" class="fi-price" value="${Number(it.price) || 0}" min="0" step="1000" placeholder="0">
      <span class="fi-won">원</span>
    </div>
    <button type="button" class="btn btn-d btn-sm fi-del" title="항목 삭제"><i class="fas fa-trash"></i></button>
  </div>`;
}

function groupCard(g: AdminPriceGroup): string {
  return `
  <div class="card fee-group">
    <div class="fee-ghead">
      <span class="fee-gicon"><i class="fas ${esc(g.icon || 'fa-tooth')}"></i></span>
      <input type="text" class="fg-cat" value="${esc(g.cat)}" placeholder="분류명 (예: 임플란트)">
      <input type="text" class="fg-icon" value="${esc(g.icon || 'fa-tooth')}" placeholder="아이콘 (fa-...)">
      <label class="fee-tax"><input type="checkbox" class="fg-tax" ${g.taxable ? 'checked' : ''}> 부가세 별도</label>
      <button type="button" class="btn btn-d btn-sm fg-del" title="분류 삭제"><i class="fas fa-trash"></i> 분류</button>
    </div>
    <input type="text" class="fg-note" value="${esc(g.note || '')}" placeholder="분류 안내문 (선택) — 예: 미용 진료는 부가세 10% 별도">
    <div class="fee-items">
      ${g.items.map(itemRow).join('')}
    </div>
    <button type="button" class="btn btn-o btn-sm fi-add"><i class="fas fa-plus"></i> 항목 추가</button>
  </div>`;
}

const FEES_CSS = `
.fee-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;position:sticky;top:64px;z-index:20;background:var(--bg);padding:10px 0}
.fee-group{position:relative}
.fee-ghead{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.fee-gicon{width:38px;height:38px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--gold-soft);color:var(--gold);border-radius:10px;font-size:1rem}
.fg-cat{flex:1;min-width:160px;font-weight:800}
.fg-icon{width:150px;flex:none;font-size:.82rem}
.fee-tax{display:flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;white-space:nowrap}
.fee-tax input{width:auto}
.fg-note{margin-bottom:12px;font-size:.86rem}
.fee-items{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.fee-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:#fff}
.fee-item .fi-name{flex:1;min-width:120px}
.fi-price-wrap{display:flex;align-items:center;gap:5px;flex:none}
.fi-price{width:130px;text-align:right;font-weight:700}
.fi-won{font-size:.82rem;color:var(--ink-soft)}
.fee-item.off{opacity:.55;background:var(--bg-soft)}
.fee-item.off .fi-name{text-decoration:line-through}
.fee-hint{font-size:.82rem;color:var(--ink-soft);line-height:1.6;margin-top:6px}
@media(max-width:760px){.fg-icon{width:110px}.fi-price{width:100px}.fee-toolbar{position:static}}
`;

// ---------- 편집 화면 ----------
adminFees.get('/fees', async (c) => {
  if (!(await requireAdmin(c))) return c.redirect('/admin');
  const db = c.env.DB;
  if (!db) return c.html(adminShell('비급여 수가', 'fees', `<h1>비급여 수가</h1><p class="sub">데이터베이스가 연결되지 않았습니다.</p>`));

  const groups = await loadAdminPricing(db);
  const cards = groups.map(groupCard).join('');

  return c.html(adminShell('비급여 수가', 'fees', `
  <style>${FEES_CSS}</style>
  <div class="fee-toolbar">
    <div>
      <h1 style="margin:0">비급여 수가 관리</h1>
      <p class="sub" style="margin:2px 0 0">항목명·금액을 수정하고, 각 항목의 <b>공개/비공개</b>를 토글하세요. 비공개 항목은 홈페이지 비용안내에서 숨겨집니다.</p>
    </div>
    <div style="display:flex;gap:8px">
      <a href="/pricing" target="_blank" rel="noopener" class="btn btn-o btn-sm"><i class="fas fa-external-link-alt"></i> 페이지 보기</a>
      <button type="button" id="feeSave" class="btn btn-p"><i class="fas fa-floppy-disk"></i> 저장</button>
    </div>
  </div>

  <div id="feeGroups">${cards}</div>

  <div style="margin:6px 0 40px">
    <button type="button" id="feeAddGroup" class="btn btn-g"><i class="fas fa-folder-plus"></i> 분류 추가</button>
    <p class="fee-hint"><i class="fas fa-circle-info"></i> 저장 시 화면의 전체 내용이 반영됩니다. 잘못 지운 항목은 저장 전이라면 새로고침으로 되돌릴 수 있습니다.</p>
  </div>
  <div class="msg" id="feeMsg"></div>

  <script>
  (function(){
    var groups = document.getElementById('feeGroups');

    function newItem(){
      var d=document.createElement('div');
      d.className='fee-item';
      d.innerHTML='<label class="switch sm" title="공개/비공개"><input type="checkbox" class="fi-pub" checked><span class="slider"></span></label>'
        +'<input type="text" class="fi-name" placeholder="항목명">'
        +'<div class="fi-price-wrap"><input type="number" class="fi-price" value="0" min="0" step="1000" placeholder="0"><span class="fi-won">원</span></div>'
        +'<button type="button" class="btn btn-d btn-sm fi-del" title="항목 삭제"><i class="fas fa-trash"></i></button>';
      return d;
    }
    function newGroup(){
      var d=document.createElement('div');
      d.className='card fee-group';
      d.innerHTML='<div class="fee-ghead">'
        +'<span class="fee-gicon"><i class="fas fa-tooth"></i></span>'
        +'<input type="text" class="fg-cat" placeholder="분류명 (예: 임플란트)">'
        +'<input type="text" class="fg-icon" value="fa-tooth" placeholder="아이콘 (fa-...)">'
        +'<label class="fee-tax"><input type="checkbox" class="fg-tax"> 부가세 별도</label>'
        +'<button type="button" class="btn btn-d btn-sm fg-del" title="분류 삭제"><i class="fas fa-trash"></i> 분류</button>'
        +'</div>'
        +'<input type="text" class="fg-note" placeholder="분류 안내문 (선택)">'
        +'<div class="fee-items"></div>'
        +'<button type="button" class="btn btn-o btn-sm fi-add"><i class="fas fa-plus"></i> 항목 추가</button>';
      return d;
    }

    function syncOff(item){
      var on=item.querySelector('.fi-pub').checked;
      item.classList.toggle('off', !on);
    }

    // 이벤트 위임
    document.addEventListener('click', function(e){
      var t=e.target.closest('.fi-del, .fg-del, .fi-add');
      if(!t) return;
      if(t.classList.contains('fi-del')){ t.closest('.fee-item').remove(); }
      else if(t.classList.contains('fg-del')){ if(confirm('이 분류와 하위 항목을 모두 삭제할까요?')) t.closest('.fee-group').remove(); }
      else if(t.classList.contains('fi-add')){ t.closest('.fee-group').querySelector('.fee-items').appendChild(newItem()); }
    });
    document.addEventListener('change', function(e){
      if(e.target.classList.contains('fi-pub')) syncOff(e.target.closest('.fee-item'));
      if(e.target.classList.contains('fg-icon')){
        var g=e.target.closest('.fee-group'); var ic=g.querySelector('.fee-gicon i');
        if(ic) ic.className='fas '+(e.target.value.trim()||'fa-tooth');
      }
    });
    document.getElementById('feeAddGroup').addEventListener('click', function(){
      groups.appendChild(newGroup());
    });
    // 초기 off 표시
    document.querySelectorAll('.fee-item').forEach(syncOff);

    document.getElementById('feeSave').addEventListener('click', async function(){
      var btn=this, msg=document.getElementById('feeMsg'); msg.className='msg';
      var payload=[];
      var ok=true;
      groups.querySelectorAll('.fee-group').forEach(function(g){
        var cat=(g.querySelector('.fg-cat').value||'').trim();
        if(!cat) return; // 빈 분류명은 건너뜀
        var grp={cat:cat, icon:(g.querySelector('.fg-icon').value||'fa-tooth').trim()||'fa-tooth',
          taxable:g.querySelector('.fg-tax').checked, note:(g.querySelector('.fg-note').value||'').trim(), items:[]};
        g.querySelectorAll('.fee-item').forEach(function(it){
          var name=(it.querySelector('.fi-name').value||'').trim();
          if(!name) return;
          grp.items.push({name:name, price:parseInt(it.querySelector('.fi-price').value,10)||0,
            is_published: it.querySelector('.fi-pub').checked ? 1 : 0});
        });
        if(grp.items.length) payload.push(grp);
      });
      if(!payload.length){ msg.className='msg err'; msg.textContent='저장할 항목이 없습니다.'; return; }
      btn.disabled=true; var orig=btn.innerHTML; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 저장 중...';
      try{
        var r=await fetch('/admin/fees/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({groups:payload})});
        var j=await r.json();
        if(j.ok){ msg.className='msg ok'; msg.textContent='저장되었습니다. ('+j.count+'개 항목)'; setTimeout(function(){location.reload();},700); }
        else { msg.className='msg err'; msg.textContent=j.error||'저장에 실패했습니다.'; btn.disabled=false; btn.innerHTML=orig; }
      }catch(err){ msg.className='msg err'; msg.textContent='네트워크 오류가 발생했습니다.'; btn.disabled=false; btn.innerHTML=orig; }
    });
  })();
  </script>`));
});

// ---------- 저장 API (전체 재기록) ----------
adminFees.post('/fees/save', async (c) => {
  if (!(await requireAdmin(c))) return c.json({ ok: false }, 403);
  const db = c.env.DB;
  if (!db) return c.json({ ok: false, error: 'DB 미연결' }, 500);

  let body: any;
  try { body = await c.req.json(); } catch { return c.json({ ok: false, error: '잘못된 요청' }, 400); }
  const groups = Array.isArray(body?.groups) ? body.groups : [];
  if (!groups.length) return c.json({ ok: false, error: '저장할 항목이 없습니다.' }, 400);

  // 테이블 보장(없으면 실패). 시드는 여기서 강제하지 않음(사용자 입력으로 대체).
  await ensurePricingSeed(db).catch(() => {});

  const stmts: D1PreparedStatement[] = [];
  stmts.push(db.prepare('DELETE FROM price_items'));
  const ins = db.prepare(
    `INSERT INTO price_items (cat, cat_icon, taxable, cat_note, cat_order, name, price, is_published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  let count = 0;
  groups.forEach((g: any, gi: number) => {
    const cat = String(g.cat || '').trim();
    if (!cat) return;
    const icon = String(g.icon || 'fa-tooth').trim() || 'fa-tooth';
    const taxable = g.taxable ? 1 : 0;
    const note = g.note ? String(g.note).trim() : null;
    const items = Array.isArray(g.items) ? g.items : [];
    items.forEach((it: any, ii: number) => {
      const name = String(it.name || '').trim();
      if (!name) return;
      const price = Math.max(0, parseInt(it.price, 10) || 0);
      const pub = it.is_published ? 1 : 0;
      stmts.push(ins.bind(cat, icon, taxable, note, gi, name, price, pub, ii));
      count++;
    });
  });
  if (count === 0) return c.json({ ok: false, error: '유효한 항목이 없습니다.' }, 400);

  try {
    await db.batch(stmts);   // DELETE + 전체 INSERT 원자적 처리
    return c.json({ ok: true, count });
  } catch (e) {
    return c.json({ ok: false, error: '저장 중 오류가 발생했습니다.' }, 500);
  }
});
