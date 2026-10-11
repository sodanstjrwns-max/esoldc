// ============================================================
// 홈 히어로 팝업 — 관리자가 공지에서 "홈 팝업 띄우기" 켠 경우 렌더링
// 활성 조건: published=1, is_popup=1, popup_start<=오늘(KST)<=popup_end
// 여러 개면 고정 공지 우선 → 최신순으로 최대 POPUP_MAX(10)개 동시 노출.
//  - PC(≥768px): 한 장의 어두운 배경 위에 카드 뭉치(계단식 겹쳐 쌓기).
//      맨 앞 = 고정·최신 카드(오른쪽 아래), 뒤 카드는 왼쪽 위로 제목 띠만 살짝 보임.
//      뒤 카드(띠·가장자리) 클릭 → 맨 앞으로. 개수가 많으면 간격 자동 축소(한 화면 안).
//      팝업이 1개면 겹침 없이 단독 카드.
//  - 모바일(≤767px): 우상단 작은 "병원 소식 N" 칩 → 탭하면 한 장씩 넘겨보기
//      (맨 앞 카드 + 오른쪽 가장자리에 뒤 카드 겹침 표시, 스와이프·화살표·점)
// 공통: 카드별 ×/닫기/"오늘 하루 보지 않기", 상단 "모두 닫기", Esc = 맨 앞 카드 닫기,
//      Tab 포커스는 팝업 안에서만 순환(맨 앞 카드 → 뒤 카드 띠 순서).
// "오늘 하루 보지 않기" → 카드별 localStorage(isol-popup-hide-{id}=YYYY-MM-DD, KST)
// ============================================================

export const POPUP_MAX = 10;

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

// 활성 팝업 최대 POPUP_MAX건 조회 (DB 없거나 오류면 빈 배열)
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
.hp-overlay{position:fixed;inset:0;z-index:9000;background:rgba(35,25,16,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;flex-direction:column;padding:20px;overflow-y:auto;overscroll-behavior:contain;opacity:0;transition:opacity .35s ease;font-family:var(--display,'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif)}
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
.hp-compact .hp-stack,.hp-compact .hp-nav,.hp-compact .hp-bar{display:none}
.hp-compact .hp-expand{display:block;min-height:44px;padding:10px 17px;background:#faf6ee;color:var(--navy,#3E2C1F);border:1px solid #e0d4bf;border-radius:16px;font-size:14px;font-weight:600;box-shadow:0 5px 18px #3e2c1f22;cursor:pointer}
.hp-count{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;margin-left:6px;padding:0 6px;border-radius:99px;background:var(--gold,#A6772F);color:#fff;font-size:12px;font-weight:800;vertical-align:1px}
.hp-x{width:44px;height:44px}.hp-close-btn,.hp-hide{min-height:44px}
/* 상단 바: 소식 개수 + 모두 닫기 */
.hp-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:auto auto 10px;width:var(--hp-w,100%);max-width:100%;flex:none}
.hp-bar[hidden]{display:none}
.hp-overlay .hp-bar:not([hidden])+.hp-stack{margin-top:0}
.hp-bar-t{font-size:14px;font-weight:700;color:#fff;letter-spacing:.02em;text-shadow:0 1px 4px #0006}
.hp-bar-t b{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;margin-left:6px;padding:0 6px;border-radius:99px;background:var(--gold,#A6772F);color:#fff;font-size:12px;font-weight:800;text-shadow:none;vertical-align:1px}
.hp-all{min-height:40px;padding:8px 14px;border-radius:99px;border:1px solid #e0d4bf;background:#faf6ee;color:var(--navy,#3E2C1F);font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px #3e2c1f33;transition:background .2s,border-color .2s}
.hp-all:hover{background:#fff;border-color:var(--gold,#A6772F)}
/* 뒤 카드 제목 띠 (PC 겹쳐 쌓기에서만 보임) */
.hp-peek{display:none}
/* ===== PC 겹쳐 쌓기(카드 뭉치) ===== */
.hp-overlay.hp-deck .hp-stack{display:block;position:relative;flex:none;margin:0 auto auto;max-width:none;gap:0}
.hp-overlay.hp-deck .hp-card{position:absolute;top:0;left:0;max-width:calc(100vw - 40px);max-height:var(--hp-maxh,88vh);transform:translate(var(--hp-x,0),calc(var(--hp-y,0px) + 24px)) scale(.97)}
.hp-overlay.hp-deck.show .hp-card{transform:translate(var(--hp-x,0),var(--hp-y,0))}
.hp-overlay.hp-deck.show .hp-card.hp-out{opacity:0;transform:translate(var(--hp-x,0),calc(var(--hp-y,0px) + 12px)) scale(.94);pointer-events:none}
.hp-deck .hp-card.hp-back{cursor:pointer;box-shadow:0 12px 34px rgba(40,25,12,.28)}
.hp-deck .hp-card.hp-back>:not(.hp-peek){pointer-events:none}
.hp-deck .hp-card.hp-back .hp-x{visibility:hidden}
.hp-deck .hp-peek{display:flex;align-items:center;position:absolute;top:0;left:0;right:0;height:var(--hp-dy,32px);z-index:4;margin:0;padding:0 16px;border:none;border-bottom:1px solid #efe6d4;background:#faf6ee;color:var(--navy,#3E2C1F);font-size:13px;font-weight:700;text-align:left;cursor:pointer;opacity:0;visibility:hidden;transition:opacity .25s ease}
.hp-deck .hp-back .hp-peek{opacity:1;visibility:visible}
.hp-peek-t{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0}
.hp-peek-n{flex:none;font-family:var(--grotesk,sans-serif);font-size:11px;font-weight:800;color:var(--gold,#A6772F);margin-right:8px;letter-spacing:.08em}
.hp-deck .hp-back:hover .hp-peek,.hp-deck .hp-peek:focus-visible{background:#fff;color:var(--gold,#A6772F)}
.hp-peek:focus-visible{outline:2px solid var(--gold,#A6772F);outline-offset:-2px}
/* ===== 모바일 한 장씩 넘기기 ===== */
.hp-nav{display:none}
.hp-single{align-items:center}
.hp-single .hp-stack{margin:auto auto 0;width:100%;max-width:420px;flex-wrap:nowrap;position:relative;isolation:isolate}
.hp-single .hp-bar{width:100%;max-width:420px}
.hp-single .hp-card{display:none;width:100%}
.hp-single .hp-card.hp-active{display:flex;animation:hpIn .25s ease}
.hp-single .hp-stack.hp-more::before,.hp-single .hp-stack.hp-more2::after{content:'';position:absolute;z-index:-1;border-radius:20px;background:#f3ebdd;box-shadow:0 10px 30px rgba(40,25,12,.3);pointer-events:none}
.hp-single .hp-stack.hp-more::before{top:14px;bottom:14px;right:-7px;left:30%}
.hp-single .hp-stack.hp-more2::after{top:28px;bottom:28px;right:-13px;left:45%;background:#e6dac4;z-index:-2}
.hp-single .hp-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin:12px auto auto}
.hp-single .hp-nav[hidden]{display:none}
.hp-nav button{width:44px;height:44px;border-radius:50%;border:1px solid #e0d4bf;background:#faf6ee;color:var(--navy,#3E2C1F);font-size:1.4rem;line-height:1;cursor:pointer;box-shadow:0 4px 14px #3e2c1f33}
.hp-dots{display:flex;align-items:center;gap:6px;min-width:64px;justify-content:center}
.hp-dots i{display:block;width:7px;height:7px;border-radius:99px;background:rgba(255,255,255,.55);transition:opacity .2s}
.hp-dots i.on{width:18px;background:#fff}
.hp-ind{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@keyframes hpIn{from{opacity:0;transform:translateX(var(--hp-dx,0))}to{opacity:1;transform:none}}
@media(max-width:480px){.hp-card{max-height:78svh}.hp-img img{max-height:38svh;object-fit:contain}.hp-single .hp-card{max-height:calc(100svh - 170px)}.hp-single .hp-stack{width:calc(100% - 12px);margin-left:0}}
@media(prefers-reduced-motion:reduce){.hp-overlay,.hp-card,.hp-peek{transition:none!important}.hp-single .hp-card.hp-active{animation:none}}
`;

function renderCard(p: PopupRow, i: number): string {
  const id = Number(p.id);
  const size = ['sm', 'md', 'lg'].includes(p.popup_size || '') ? (p.popup_size || 'md') : 'md';
  const sizeClass = size === 'md' ? '' : ` ${size}`;
  const href = p.link_url && p.link_url.trim() ? p.link_url.trim() : `/notices/${id}`;
  const isExternal = /^https?:\/\//i.test(href);
  const imgHtml = p.image
    ? `<span class="hp-img"><img src="/api/img/${esc(p.image)}" alt="${esc(p.title)}" loading="eager"></span>`
    : '';
  const target = isExternal ? ' target="_blank" rel="noopener"' : '';
  const no = String(i + 1).padStart(2, '0');
  return `
    <div class="hp-card${sizeClass}" id="hp-card-${id}" data-id="${id}" role="group" aria-labelledby="hp-title-${id}">
      <button type="button" class="hp-peek" data-act="front" tabindex="-1" aria-hidden="true" aria-label="${esc(p.title)} 앞으로 보기"><span class="hp-peek-n">${no}</span><span class="hp-peek-t">${esc(p.title)}</span></button>
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
  var stack=ov.querySelector('.hp-stack'),nav=ov.querySelector('.hp-nav'),ind=ov.querySelector('.hp-ind'),dots=ov.querySelector('.hp-dots'),chip=ov.querySelector('.hp-expand'),bar=ov.querySelector('.hp-bar'),barN=ov.querySelector('.hp-bar-n'),allBtn=ov.querySelector('.hp-all');
  var today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  function key(id){return 'isol-popup-hide-'+id;}
  // 오늘 숨긴 카드는 먼저 제거
  Array.prototype.slice.call(stack.querySelectorAll('.hp-card')).forEach(function(c){
    try{ if(localStorage.getItem(key(c.getAttribute('data-id')))===today) c.parentNode.removeChild(c); }catch(e){}
  });
  // order[0] = 맨 앞 카드 (서버 정렬: 고정 → 최신)
  var order=Array.prototype.slice.call(stack.querySelectorAll('.hp-card'));
  if(!order.length){ ov.parentNode.removeChild(ov); return; }
  var mq=matchMedia('(max-width:767px)');
  var compact=mq.matches, idx=0, prevOverflow='', locked=false, deckOn=false;
  function lock(){ if(!locked){ prevOverflow=document.body.style.overflow; document.body.style.overflow='hidden'; locked=true; } }
  function unlock(){ if(locked){ document.body.style.overflow=prevOverflow; locked=false; } }
  function single(){ return ov.classList.contains('hp-single'); }
  function setDialog(on){
    if(on){ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');}
    else{ov.setAttribute('role','region');ov.removeAttribute('aria-modal');}
  }
  function updateChip(){
    var n=order.length;
    chip.innerHTML=n>1?'병원 소식<span class="hp-count">'+n+'</span>':'병원 소식 보기';
    chip.setAttribute('aria-label','병원 소식 '+n+'건 보기');
  }
  function updateBar(){
    var n=order.length;
    bar.hidden=compact||!(deckOn||n>1);
    barN.textContent=n;
  }
  // 카드 안 조작 요소를 Tab 대상에서 넣고 빼기 (앞 카드만 조작 가능)
  function setInter(c,on){
    Array.prototype.forEach.call(c.querySelectorAll('a,button:not(.hp-peek)'),function(el){ if(on) el.removeAttribute('tabindex'); else el.setAttribute('tabindex','-1'); });
    var pk=c.querySelector('.hp-peek');
    if(pk){ var back=!on&&deckOn; pk.setAttribute('tabindex',back?'0':'-1'); pk.setAttribute('aria-hidden',back?'false':'true'); }
  }
  // PC 카드 뭉치 배치: 맨 앞 = 오른쪽 아래, 뒤로 갈수록 왼쪽 위. 화면 안에 들어오도록 간격 자동 축소
  function layout(){
    var n=order.length;
    deckOn=!compact&&!mq.matches&&n>0&&(n>1||deckOn);
    ov.classList.toggle('hp-deck',deckOn);
    if(!deckOn){
      order.forEach(function(c){ ['--hp-x','--hp-y'].forEach(function(p){c.style.removeProperty(p);}); c.style.zIndex=''; c.classList.remove('hp-back'); setInter(c,true); });
      stack.style.width=''; stack.style.height=''; stack.style.removeProperty('--hp-maxh'); stack.style.removeProperty('--hp-dy'); ov.style.removeProperty('--hp-w');
      updateBar(); return;
    }
    updateBar();
    var steps=Math.max(n-1,0);
    var vw=window.innerWidth-40, vh=window.innerHeight-40-(bar.hidden?0:bar.offsetHeight+10);
    var maxW=0; order.forEach(function(c){ maxW=Math.max(maxW,c.offsetWidth); });
    var dx=steps?Math.max(10,Math.min(30,(vw-maxW)/steps)):0;
    var dy=steps?Math.max(18,Math.min(40,vh*.34/steps)):0;
    stack.style.setProperty('--hp-dy',dy+'px');
    stack.style.setProperty('--hp-maxh',Math.max(260,vh-dy*steps)+'px');
    var w=0,h=0;
    order.forEach(function(c,k){
      var s=steps-k;
      c.style.setProperty('--hp-x',(s*dx)+'px'); c.style.setProperty('--hp-y',(s*dy)+'px');
      c.style.zIndex=String(n-k);
      c.classList.toggle('hp-back',k>0);
      setInter(c,k===0);
      w=Math.max(w,s*dx+c.offsetWidth); h=Math.max(h,s*dy+c.offsetHeight);
    });
    stack.style.width=w+'px'; stack.style.height=h+'px';
    ov.style.setProperty('--hp-w',w+'px');
  }
  function toFront(c){
    var k=order.indexOf(c); if(k<1) return;
    order.splice(k,1); order.unshift(c);
    layout(); focusFirst();
  }
  function show(i,dir){
    var n=order.length; if(!n) return;
    idx=(i+n)%n;
    order.forEach(function(c,k){ c.classList.toggle('hp-active',k===idx); c.style.setProperty('--hp-dx',dir?(dir*40)+'px':'0'); });
    ind.textContent=(idx+1)+' / '+n;
    var d=''; for(var k=0;k<n;k++) d+='<i'+(k===idx?' class="on"':'')+'></i>';
    dots.innerHTML=d;
    nav.hidden=n<2;
    stack.classList.toggle('hp-more',n>1); stack.classList.toggle('hp-more2',n>2);
  }
  function front(){ return single()?order[idx]:order[0]; }
  function focusFirst(){
    var c=front(); var b=c&&c.querySelector('.hp-x');
    if(b){ try{b.focus({preventScroll:true});}catch(e){b.focus();} }
  }
  // 포커스 순환 목록: 모두 닫기 → 맨 앞 카드 → (PC) 뒤 카드 띠 / (모바일) 이전·다음
  function focusables(){
    var list=[]; if(!bar.hidden) list.push(allBtn);
    var c=front();
    if(c) Array.prototype.forEach.call(c.querySelectorAll('.hp-x,.hp-link,.hp-hide,.hp-close-btn'),function(el){list.push(el);});
    if(deckOn) order.slice(1).forEach(function(b){ var pk=b.querySelector('.hp-peek'); if(pk) list.push(pk); });
    else if(single()&&!nav.hidden){ list.push(ov.querySelector('.hp-prev')); list.push(ov.querySelector('.hp-next')); }
    return list;
  }
  function applyMode(){
    if(compact){ ov.classList.add('hp-compact'); ov.classList.remove('hp-deck'); deckOn=false; setDialog(false); updateChip(); updateBar(); return; }
    ov.classList.remove('hp-compact'); setDialog(true);
    ov.classList.toggle('hp-single',mq.matches);
    if(mq.matches){ order.forEach(function(c){ c.classList.remove('hp-active'); }); }
    layout();
    if(mq.matches) show(idx,0);
  }
  function open(){
    ov.hidden=false;
    applyMode();
    requestAnimationFrame(function(){ ov.classList.add('show'); });
    if(!compact){ lock(); setTimeout(focusFirst,60); }
  }
  function closeAll(){
    ov.classList.remove('show'); unlock();
    setTimeout(function(){ ov.hidden=true; },350);
  }
  function removeCard(c){
    var k=order.indexOf(c); if(k<0) return;
    order.splice(k,1);
    c.classList.add('hp-out'); c.classList.remove('hp-back');
    updateChip();
    if(!order.length){ closeAll(); return; }
    if(single()){ c.parentNode.removeChild(c); show(Math.min(idx,order.length-1),0); updateBar(); setTimeout(focusFirst,0); return; }
    layout();
    setTimeout(function(){ if(c.parentNode) c.parentNode.removeChild(c); },260);
    setTimeout(focusFirst,deckOn?0:270);
  }
  stack.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-act]');
    var c=e.target.closest&&e.target.closest('.hp-card');
    if(!b){
      if(c&&deckOn&&c.classList.contains('hp-back')){ e.preventDefault(); toFront(c); return; }
      if(e.target===stack && !single()) closeAll();
      return;
    }
    e.preventDefault();
    var act=b.getAttribute('data-act');
    if(act==='front'){ toFront(c); return; }
    if(act==='hide'){
      var cb=b.querySelector('input'); if(cb) cb.checked=true;
      try{ localStorage.setItem(key(c.getAttribute('data-id')),today); }catch(err){}
    }
    removeCard(c);
  });
  allBtn.addEventListener('click',closeAll);
  chip.addEventListener('click',function(){
    compact=false; chip.setAttribute('aria-expanded','true');
    applyMode(); lock(); focusFirst();
  });
  ov.querySelector('.hp-prev').addEventListener('click',function(){ show(idx-1,-1); focusFirst(); });
  ov.querySelector('.hp-next').addEventListener('click',function(){ show(idx+1,1); focusFirst(); });
  // 모바일 스와이프
  var sx=0,sy=0,tracking=false;
  stack.addEventListener('touchstart',function(e){ if(!single()||e.touches.length!==1) return; tracking=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  stack.addEventListener('touchend',function(e){
    if(!tracking) return; tracking=false;
    var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3){ if(dx<0) show(idx+1,1); else show(idx-1,-1); }
  },{passive:true});
  ov.addEventListener('click',function(e){ if(e.target===ov && !compact) closeAll(); });
  document.addEventListener('keydown',function(e){
    if(ov.hidden||!ov.classList.contains('show')) return;
    if(e.key==='Escape'){
      if(compact) closeAll();
      else { var c=front(); if(c) removeCard(c); }
      return;
    }
    if(compact) return;
    if(e.key==='Tab'){
      var list=focusables(); if(!list.length) return;
      var i=list.indexOf(document.activeElement);
      e.preventDefault();
      var j=i<0?0:(i+(e.shiftKey?-1:1)+list.length)%list.length;
      try{list[j].focus({preventScroll:true});}catch(err){list[j].focus();}
      return;
    }
    if(single()){ if(e.key==='ArrowRight') show(idx+1,1); else if(e.key==='ArrowLeft') show(idx-1,-1); }
  });
  // 이미지 로딩·창 크기 변경 시 뭉치 재배치
  var raf=0;
  function relayout(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; if(deckOn&&!ov.hidden) layout(); }); }
  Array.prototype.forEach.call(stack.querySelectorAll('img'),function(im){ if(!im.complete) im.addEventListener('load',relayout); });
  window.addEventListener('resize',relayout);
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
  <div class="hp-bar" hidden>
    <span class="hp-bar-t">병원 소식<b class="hp-bar-n">${list.length}</b></span>
    <button type="button" class="hp-all">모두 닫기 &times;</button>
  </div>
  <div class="hp-stack" id="hp-stack">${list.map(renderCard).join('')}
  </div>
  <div class="hp-nav" hidden>
    <button type="button" class="hp-prev" aria-label="이전 소식">&lsaquo;</button>
    <span class="hp-dots" aria-hidden="true"></span>
    <span class="hp-ind" aria-live="polite">1 / ${list.length}</span>
    <button type="button" class="hp-next" aria-label="다음 소식">&rsaquo;</button>
  </div>
</div>
<script>${POPUP_JS}</script>`;
}
