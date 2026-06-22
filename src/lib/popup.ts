// ============================================================
// 홈 히어로 팝업 — 관리자가 공지에서 "홈 팝업 띄우기" 켠 경우 렌더링
// 활성 조건: published=1, is_popup=1, popup_start<=today<=popup_end
// 여러 개면 가장 최근(id DESC) 1개만 노출.
// "오늘 하루 보지 않기" → localStorage(popup-hide-{id}=YYYY-MM-DD)
// ============================================================

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

// 활성 팝업 1건 조회 (DB 없거나 없으면 null)
export async function fetchActivePopup(db: D1Database | undefined): Promise<PopupRow | null> {
  if (!db) return null;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const row = await db.prepare(
      `SELECT id, title, content_html, image, link_url, popup_size
       FROM notices
       WHERE published = 1 AND is_popup = 1
         AND (popup_start IS NULL OR popup_start <= ?)
         AND (popup_end   IS NULL OR popup_end   >= ?)
       ORDER BY id DESC LIMIT 1`
    ).bind(today, today).first<PopupRow>();
    return row || null;
  } catch {
    return null; // 컬럼 없거나 DB 오류 시 조용히 미노출
  }
}

const POPUP_CSS = `
.hp-overlay{position:fixed;inset:0;z-index:9000;background:rgba(35,25,16,.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .35s ease;font-family:var(--display,'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif)}
.hp-overlay button,.hp-overlay input{font-family:inherit}
.hp-overlay.show{opacity:1}
.hp-card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(40,25,12,.4);width:340px;max-width:100%;max-height:88vh;display:flex;flex-direction:column;position:relative;transform:translateY(24px) scale(.97);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.hp-card.sm{width:300px}.hp-card.lg{width:420px}
.hp-overlay.show .hp-card{transform:translateY(0) scale(1)}
.hp-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border:none;border-radius:50%;background:rgba(255,255,255,.9);color:var(--navy,#3E2C1F);font-size:1.4rem;line-height:1;cursor:pointer;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.15);transition:.2s}
.hp-x:hover{background:#fff;transform:rotate(90deg)}
.hp-link{color:inherit;text-decoration:none;display:block;overflow-y:auto}
.hp-img{display:block}.hp-img img{width:100%;display:block;max-height:46vh;object-fit:cover}
.hp-body{padding:26px 26px 22px}
.hp-tag{display:inline-block;font-family:var(--grotesk,sans-serif);font-size:.66rem;font-weight:800;letter-spacing:.16em;color:var(--gold,#A6772F);background:var(--gold-soft,#EFE2C9);padding:5px 12px;border-radius:99px;margin-bottom:12px}
.hp-title{font-family:var(--display,sans-serif);font-size:1.35rem;font-weight:800;color:var(--navy,#3E2C1F);line-height:1.32;letter-spacing:-.02em;margin:0 0 10px;word-break:keep-all}
.hp-content{font-size:.92rem;color:#6a5a48;line-height:1.7;word-break:keep-all}
.hp-content h3{font-size:1.02rem;color:var(--navy,#3E2C1F);margin:.6em 0 .3em}
.hp-content p{margin:.4em 0}.hp-content ul{margin:.4em 0;padding-left:1.2em}.hp-content img{max-width:100%;border-radius:10px;margin:8px 0}
.hp-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 20px;border-top:1px solid #efe6d4;background:#faf6ee}
.hp-hide{font-size:.82rem;color:#8a7a66;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:6px 4px}
.hp-hide:hover{color:var(--navy,#3E2C1F)}
.hp-hide input{accent-color:var(--gold,#A6772F);width:15px;height:15px}
.hp-close-btn{font-size:.84rem;font-weight:700;color:var(--navy,#3E2C1F);background:none;border:1px solid #e0d4bf;border-radius:10px;padding:9px 16px;cursor:pointer;transition:.2s}
.hp-close-btn:hover{background:#fff;border-color:var(--gold,#A6772F)}
@media(max-width:480px){.hp-card,.hp-card.sm,.hp-card.lg{width:100%}.hp-body{padding:22px 20px 18px}.hp-title{font-size:1.2rem}}
@media(prefers-reduced-motion:reduce){.hp-overlay,.hp-card{transition:none}}
`;

// 팝업 마크업+동작 생성. 활성 팝업이 없으면 빈 문자열.
export function renderPopup(p: PopupRow | null): string {
  if (!p) return '';
  const size = ['sm', 'md', 'lg'].includes(p.popup_size || '') ? (p.popup_size || 'md') : 'md';
  const sizeClass = size === 'md' ? '' : ` ${size}`;
  const href = p.link_url && p.link_url.trim() ? p.link_url.trim() : `/notices/${p.id}`;
  const isExternal = /^https?:\/\//i.test(href);
  const imgHtml = p.image
    ? `<span class="hp-img"><img src="/api/img/${esc(p.image)}" alt="${esc(p.title)}" loading="eager"></span>`
    : '';
  const target = isExternal ? ' target="_blank" rel="noopener"' : '';

  return `
<div class="hp-overlay" id="hp-overlay" role="dialog" aria-modal="true" aria-labelledby="hp-title" hidden>
  <style>${POPUP_CSS}</style>
  <div class="hp-card${sizeClass}">
    <button class="hp-x" id="hp-x" aria-label="팝업 닫기">&times;</button>
    <a class="hp-link" href="${esc(href)}"${target}>
      ${imgHtml}
      <span class="hp-body" style="display:block">
        <span class="hp-tag">NOTICE</span>
        <h2 class="hp-title" id="hp-title">${esc(p.title)}</h2>
        <div class="hp-content">${p.content_html || ''}</div>
      </span>
    </a>
    <div class="hp-foot">
      <button class="hp-hide" id="hp-hide" type="button"><input type="checkbox" id="hp-hide-cb" tabindex="-1" aria-hidden="true"><span>오늘 하루 보지 않기</span></button>
      <button class="hp-close-btn" id="hp-close" type="button">닫기</button>
    </div>
  </div>
</div>
<script>
(function(){
  var ID='${p.id}';
  var KEY='isol-popup-hide-'+ID;
  var today=new Date().toISOString().slice(0,10);
  try{ if(localStorage.getItem(KEY)===today) return; }catch(e){}
  var ov=document.getElementById('hp-overlay');
  if(!ov) return;
  function open(){ ov.hidden=false; requestAnimationFrame(function(){ ov.classList.add('show'); }); document.body.style.overflow='hidden'; }
  function close(){ ov.classList.remove('show'); document.body.style.overflow=''; setTimeout(function(){ ov.hidden=true; },350); }
  function hideToday(){ try{ localStorage.setItem(KEY,today); }catch(e){} close(); }
  document.getElementById('hp-x').addEventListener('click',function(e){e.preventDefault();close();});
  document.getElementById('hp-close').addEventListener('click',function(e){e.preventDefault();close();});
  document.getElementById('hp-hide').addEventListener('click',function(e){e.preventDefault();document.getElementById('hp-hide-cb').checked=true;hideToday();});
  ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!ov.hidden) close(); });
  setTimeout(open, 900);
})();
</script>`;
}
