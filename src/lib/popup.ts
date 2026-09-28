// ============================================================
// 홈 히어로 팝업 — 관리자가 공지에서 "홈 팝업 띄우기" 켠 경우 렌더링
// 활성 조건: published=1, is_popup=1, popup_start<=오늘(KST)<=popup_end
// 여러 개면 고정 공지 우선 → 최신순으로 최대 POPUP_MAX(5)개 동시 노출.
//  - PC(≥768px): 한 장의 어두운 배경 위에 카드들을 좌→우로 나란히(줄바꿈 허용)
//  - 모바일(≤767px): 우상단 작은 "병원 소식 N" 칩 → 탭하면 한 장씩 넘겨보기
// "오늘 하루 보지 않기" → 카드별 localStorage(isol-popup-hide-{id}=YYYY-MM-DD, KST)
// ============================================================

export const POPUP_MAX = 5;

type PopupRow = {
  id: number;
  title: string;
  content_html: string;
  image: string | null;
  link_url: string | null;
  popup_size: string | null;
};

function esc(s: any): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 한국 시간 기준 오늘 (YYYY-MM-DD) — 클라이언트 스크립트와 동일 계산
export function kstToday(): string {
  return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
}

// 활성 팝업 최대 5건 조회 (DB 없거나 오류면 빈 배열)
export async function fetchActivePopups(db: D1Database | undefined): Promise<PopupRow[]> {
  if (!db) return [];
  try {
    const today = kstToday();
    const { results } = await db.prepare(
      `SELECT id, title, content_html, image, link_url, popup_size
       FROM notices
       WHERE published = 1 AND is_popup = 1
         AND (popup_start IS NULL OR popup_start <= ?)
         AND (popup_end   IS NULL OR popup_end   >= ?)
       ORDER BY is_pinned DESC, id DESC LIMIT ${POPUP_MAX}`
    ).bind(today, today).all<PopupRow>();
    return (results || []) as PopupRow[];
  } catch {
    return []; // 컬럼 없거나 DB 오류 시 조용히 미노출
  }
}

const POPUP_CSS = `
.hp-overlay{position:fixed;inset:0;z-index:9000;background:rgba(35,25,16,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;padding:20px;overflow-y:auto;overscroll-behavior:contain;opacity:0;transition:opacity .35s ease;font-family:var(--display,'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif)}
.hp-overlay[hidden]{display:none!important}
.hp-overlay:not(.show){pointer-events:none}
.hp-overlay.show{pointer-events:auto}
.hp-overlay button,.hp-overlay input{font-family:inherit}
.hp-overlay.show{opacity:1}
.hp-stack{margin:auto;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-start;max-width:100%}
.hp-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(40,25,12,.4);width:340px;max-width:100%;max-height:88vh;display:flex;flex-direction:column;position:relative;transform:translateY(24px) scale(.97);transition:transform .4s cubic-bezier(.2,.8,.2,1),opacity .25s ease}
.hp-card.sm{width:300px}.hp-card.lg{width:420px}
.hp-overlay.show .hp-card{transform:translateY(0) scale(1)}
.hp-overlay.show .hp-card.hp-out{opacity:0;transform:translateY(12px) scale(.94)}
.hp-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border:none;border-radius:50%;background:rgba(255,255,255,.9);color:var(--navy,#3E2C1F);font-size:1.4rem;line-height:1;cursor:pointer;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.15);transition:.2s}
.hp-x:hover{background:#fff;transform:rotate(90deg)}
.hp-link{color:inherit;text-decoration:none;display:block;overflow-y:auto;flex:1 1 auto;min-height:0}
.hp-img{display:block}.hp-img img{width:100%;display:block;max-height:46vh;object-fit:cover}
.hp-body{padding:26px 26px 22px}
.hp-tag{display:inline-block;font-family:var(--grotesk,sans-serif);font-size:.66rem;font-weight:800;letter-spacing:.16em;color:var(--gold,#A6772F);background:var(--gold-soft,#EFE2C9);padding:5px 12px;border-radius:99px;margin-bottom:12px}
.hp-title{font-family:var(--display,sans-serif);font-size:1.35rem;font-weight:800;color:var(--navy,#3E2C1F);line-height:1.32;letter-spacing:-.02em;margin:0 0 10px;word-break:keep-all}
.hp-content{font-size:.92rem;color:#6a5a48;line-height:1.7;word-break:keep-all}
.hp-content h3{font-size:1.02rem;color:var(--navy,#3E2C1F);margin:.6em 0 .3em}
.hp-content p{margin:.4em 0}.hp-content ul{margin:.4em 0;padding-left:1.2em}.hp-content img{max-width:100%;border-radius:10px;margin:8px 0}
.hp-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 20px;border-top:1px solid #efe6d4;background:#faf6ee;flex:none}
.hp-hide{font-size:.82rem;color:#8a7a66;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:6px 4px}
.hp-hide:hover{color:var(--navy,#3E2C1F)}
.hp-hide input{accent-color:var(--gold,#A6772F);width:15px;height:15px}
.hp-close-btn{font-size:.84rem;font-weight:700;color:var(--navy,#3E2C1F);background:none;border:1px solid #e0d4bf;border-radius:10px;padding:9px 16px;cursor:pointer;transition:.2s}
.hp-close-btn:hover{background:#fff;border-color:var(--gold,#A6772F)}
@media(max-width:480px){.hp-card,.hp-card.sm,.hp-card.lg{width:100%}.hp-body{padding:22px 20px 18px}.hp-title{font-size:1.2rem}}
.hp-expand{display:none}
.hp-overlay.hp-compact{inset:100px 16px auto auto;padding:0;background:none;backdrop-filter:none;-webkit-backdrop-filter:none;overflow:visible}
.hp-compact .hp-stack,.hp-compact .hp-nav{display:none}
.hp-compact .hp-expand{display:block;min-height:44px;padding:10px 17px;background:#faf6ee;color:var(--navy,#3E2C1F);border:1px solid #e0d4bf;border-radius:16px;font-size:14px;font-weight:600;box-shadow:0 5px 18px #3e2c1f22;cursor:pointer}
.hp-count{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;margin-left:6px;padding:0 6px;border-radius:99px;background:var(--gold,#A6772F);color:#fff;font-size:12px;font-weight:800;vertical-align:1px}
.hp-x{width:44px;height:44px}.hp-close-btn,.hp-hide{min-height:44px}
.hp-nav{display:none}
.hp-single{flex-direction:column;align-items:center}
.hp-single .hp-stack{margin:auto auto 0;width:100%;max-width:420px;flex-wrap:nowrap}
.hp-single .hp-card{display:none}
.hp-single .hp-card.hp-active{display:flex;animation:hpIn .25s ease}
.hp-single .hp-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin:12px auto auto}
.hp-single .hp-nav[hidden]{display:none}
.hp-nav button{width:44px;height:44px;border-radius:50%;border:1px solid #e0d4bf;background:#faf6ee;color:var(--navy,#3E2C1F);font-size:1.4rem;line-height:1;cursor:pointer;box-shadow:0 4px 14px #3e2c1f33}
.hp-ind{min-width:64px;text-align:center;font-size:14px;font-weight:700;color:#fff;letter-spacing:.04em;text-shadow:0 1px 4px #0006}
@keyframes hpIn{from{opacity:0;transform:translateX(var(--hp-dx,0))}to{opacity:1;transform:none}}
@media(max-width:480px){.hp-card{max-height:78svh}.hp-img img{max-height:38svh;object-fit:contain}.hp-single .hp-card{max-height:calc(100svh - 110px)}}
@media(prefers-reduced-motion:reduce){.hp-overlay,.hp-card{transition:none}.hp-single .hp-card.hp-active{animation:none}}
`;

function renderCard(p: PopupRow): string {
  const id = Number(p.id);
  const size = ['sm', 'md', 'lg'].includes(p.popup_size || '') ? (p.popup_size || 'md') : 'md';
  const sizeClass = size === 'md' ? '' : ` ${size}`;
  const href = p.link_url && p.link_url.trim() ? p.link_url.trim() : `/notices/${id}`;
  const isExternal = /^https?:\/\//i.test(href);
  const imgHtml = p.image
    ? `<span class="hp-img"><img src="/api/img/${esc(p.image)}" alt="${esc(p.title)}" loading="eager"></span>`
    : '';
  const target = isExternal ? ' target="_blank" rel="noopener"' : '';
  return `
    <div class="hp-card${sizeClass}" id="hp-card-${id}" data-id="${id}" role="group" aria-labelledby="hp-title-${id}">
      <button type="button" class="hp-x" data-act="close" aria-label="${esc(p.title)} 팝업 닫기">&times;</button>
      <a class="hp-link" href="${esc(href)}"${target}>
        ${imgHtml}
        <span class="hp-body" style="display:block">
          <span class="hp-tag">NOTICE</span>
          <h2 class="hp-title" id="hp-title-${id}">${esc(p.title)}</h2>
          <div class="hp-content">${p.content_html || ''}</div>
        </span>
      </a>
      <div class="hp-foot">
        <button class="hp-hide" type="button" data-act="hide"><input type="checkbox" tabindex="-1" aria-hidden="true"><span>오늘 하루 보지 않기</span></button>
        <button class="hp-close-btn" type="button" data-act="close">닫기</button>
      </div>
    </div>`;
}

// 동작 스크립트 (서버 값 삽입 없음 — 카드의 data-id만 사용)
const POPUP_JS = `
(function(){
  var ov=document.getElementById('hp-overlay');
  if(!ov) return;
  var stack=ov.querySelector('.hp-stack'),nav=ov.querySelector('.hp-nav'),ind=ov.querySelector('.hp-ind'),chip=ov.querySelector('.hp-expand');
  var today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  function key(id){return 'isol-popup-hide-'+id;}
  function cards(){return Array.prototype.slice.call(stack.querySelectorAll('.hp-card:not(.hp-out)'));}
  // 오늘 숨긴 카드는 먼저 제거
  Array.prototype.slice.call(stack.querySelectorAll('.hp-card')).forEach(function(c){
    try{ if(localStorage.getItem(key(c.getAttribute('data-id')))===today) c.parentNode.removeChild(c); }catch(e){}
  });
  if(!cards().length){ ov.parentNode.removeChild(ov); return; }
  var mq=matchMedia('(max-width:767px)');
  var compact=mq.matches, idx=0, prevOverflow='', locked=false;
  function lock(){ if(!locked){ prevOverflow=document.body.style.overflow; document.body.style.overflow='hidden'; locked=true; } }
  function unlock(){ if(locked){ document.body.style.overflow=prevOverflow; locked=false; } }
  function setDialog(on){
    if(on){ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');}
    else{ov.setAttribute('role','region');ov.removeAttribute('aria-modal');}
  }
  function updateChip(){
    var n=cards().length;
    chip.innerHTML=n>1?'병원 소식<span class="hp-count">'+n+'</span>':'병원 소식 보기';
    chip.setAttribute('aria-label','병원 소식 '+n+'건 보기');
  }
  function show(i,dir){
    var cs=cards(); if(!cs.length) return;
    idx=(i+cs.length)%cs.length;
    cs.forEach(function(c,k){ c.classList.toggle('hp-active',k===idx); c.style.setProperty('--hp-dx',dir?(dir*40)+'px':'0'); });
    ind.textContent=(idx+1)+' / '+cs.length;
    nav.hidden=cs.length<2;
  }
  function focusFirst(){
    var c=ov.classList.contains('hp-single')?stack.querySelector('.hp-card.hp-active'):cards()[0];
    var b=c&&c.querySelector('.hp-x'); if(b){ try{b.focus({preventScroll:true});}catch(e){b.focus();} }
  }
  function applyMode(){
    if(compact){ ov.classList.add('hp-compact'); setDialog(false); updateChip(); return; }
    ov.classList.remove('hp-compact'); setDialog(true);
    ov.classList.toggle('hp-single',mq.matches);
    if(mq.matches) show(idx,0);
  }
  function open(){
    applyMode();
    ov.hidden=false;
    requestAnimationFrame(function(){ ov.classList.add('show'); });
    if(!compact){ lock(); setTimeout(focusFirst,60); }
  }
  function closeAll(){
    ov.classList.remove('show'); unlock();
    setTimeout(function(){ ov.hidden=true; },350);
  }
  function removeCard(c){
    c.classList.add('hp-out');
    var single=ov.classList.contains('hp-single');
    var left=cards().length;
    if(!left){ closeAll(); return; }
    if(single){ c.parentNode.removeChild(c); show(Math.min(idx,left-1),0); }
    else setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); },260);
    updateChip();
    setTimeout(focusFirst,single?0:270);
  }
  stack.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-act]');
    if(!b){ if(e.target===stack && !ov.classList.contains('hp-single')) closeAll(); return; }
    e.preventDefault();
    var c=b.closest('.hp-card');
    if(b.getAttribute('data-act')==='hide'){
      var cb=b.querySelector('input'); if(cb) cb.checked=true;
      try{ localStorage.setItem(key(c.getAttribute('data-id')),today); }catch(err){}
    }
    removeCard(c);
  });
  chip.addEventListener('click',function(){
    compact=false; chip.setAttribute('aria-expanded','true');
    applyMode(); lock(); focusFirst();
  });
  ov.querySelector('.hp-prev').addEventListener('click',function(){ show(idx-1,-1); focusFirst(); });
  ov.querySelector('.hp-next').addEventListener('click',function(){ show(idx+1,1); focusFirst(); });
  // 모바일 스와이프
  var sx=0,sy=0,tracking=false;
  stack.addEventListener('touchstart',function(e){ if(!ov.classList.contains('hp-single')||e.touches.length!==1) return; tracking=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  stack.addEventListener('touchend',function(e){
    if(!tracking) return; tracking=false;
    var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3){ if(dx<0) show(idx+1,1); else show(idx-1,-1); }
  },{passive:true});
  ov.addEventListener('click',function(e){ if(e.target===ov && !compact) closeAll(); });
  document.addEventListener('keydown',function(e){
    if(ov.hidden) return;
    if(e.key==='Escape') closeAll();
    else if(ov.classList.contains('hp-single')&&!compact){ if(e.key==='ArrowRight') show(idx+1,1); else if(e.key==='ArrowLeft') show(idx-1,-1); }
  });
  var onMq=function(){ if(!compact && !ov.hidden) applyMode(); };
  if(mq.addEventListener) mq.addEventListener('change',onMq); else if(mq.addListener) mq.addListener(onMq);
  setTimeout(open, 900);
})();
`;

// 팝업 마크업+동작 생성. 활성 팝업이 없으면 빈 문자열.
export function renderPopups(rows: PopupRow[]): string {
  const list = (rows || []).slice(0, POPUP_MAX);
  if (!list.length) return '';
  return `
<div class="hp-overlay" id="hp-overlay" role="dialog" aria-modal="true" aria-label="병원 소식" hidden>
  <style>${POPUP_CSS}</style>
  <button type="button" class="hp-expand" aria-expanded="false" aria-controls="hp-stack">병원 소식 보기</button>
  <div class="hp-stack" id="hp-stack">${list.map(renderCard).join('')}
  </div>
  <div class="hp-nav" hidden>
    <button type="button" class="hp-prev" aria-label="이전 소식">&lsaquo;</button>
    <span class="hp-ind" aria-live="polite">1 / ${list.length}</span>
    <button type="button" class="hp-next" aria-label="다음 소식">&rsaquo;</button>
  </div>
</div>
<script>${POPUP_JS}</script>`;
}
