// ============================================================
// 치과 백과사전 페이지 — 목록(초성/카테고리/검색) + 상세
// ============================================================
import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS } from '../data/clinic';
import { GLOSSARY_SORTED, GLOSSARY_CATS, chosung, type GTerm } from '../data/glossary';

const PAGE_HERO = (crumb: string, title: string, sub: string) => `
<section style="background:var(--navy);color:var(--inv);padding:104px 0 80px;position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(700px 460px at 82% 24%,rgba(185,138,78,.16),transparent 60%)"></div>
  <div class="wrap" style="position:relative;z-index:2">
    <div style="font-size:.78rem;letter-spacing:.12em;color:rgba(250,248,244,.45);margin-bottom:22px"><a href="/" style="color:rgba(250,248,244,.45)">홈</a> / ${crumb}</div>
    <h1 style="font-size:clamp(2.3rem,5.4vw,3.8rem);line-height:1.25;color:var(--inv)">${title}</h1>
    <p style="color:rgba(250,248,244,.72);font-size:1.12rem;max-width:660px;margin-top:16px">${sub}</p>
  </div>
</section>`;

function esc(s: any): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const tName = (slug: string) => TREATMENTS.find(t => t.slug === slug)?.name || slug;

const GLOSSARY_CSS = `
  .gl-toolbar{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-bottom:28px}
  .gl-search{position:relative;flex:1;min-width:240px}
  .gl-search input{width:100%;padding:14px 18px 14px 46px;border:1px solid var(--line);border-radius:12px;font-size:1rem;font-family:inherit;background:#fff}
  .gl-search input:focus{outline:none;border-color:var(--gold)}
  .gl-search i{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:var(--gold)}
  .gl-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
  .gl-cat{padding:8px 16px;border-radius:99px;border:1px solid var(--line);background:#fff;font-size:.85rem;cursor:pointer;transition:.25s;font-family:inherit}
  .gl-cat.on,.gl-cat:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
  .gl-cho{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:30px}
  .gl-cho button{width:38px;height:38px;border-radius:10px;border:1px solid var(--line);background:#fff;font-weight:700;cursor:pointer;transition:.2s;font-family:inherit}
  .gl-cho button.on,.gl-cho button:hover{background:var(--gold);color:#fff;border-color:var(--gold)}
  .gl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
  .gl-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:22px 24px;display:block;transition:transform .3s var(--ease),box-shadow .3s var(--ease)}
  .gl-card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
  .gl-card h4{font-size:1.05rem;margin-bottom:8px;display:flex;align-items:center;gap:8px}
  .gl-card h4 i{color:var(--gold);font-size:.8em}
  .gl-group{margin-bottom:44px}
  .gl-group-h{font-size:1.35rem;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--line);display:flex;align-items:baseline;gap:10px}
  .gl-group-h small{font-size:.8rem;font-weight:400;color:var(--ink-soft)}
  .gl-card p{font-size:.86rem;color:var(--ink-soft);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .gl-card .gl-tag{display:inline-block;font-size:.7rem;color:var(--gold);background:var(--gold-soft);border-radius:99px;padding:3px 10px;margin-top:12px;margin-right:6px}
  .gl-count{font-size:.85rem;color:var(--ink-soft);margin-bottom:18px}
  .gl-empty{text-align:center;padding:80px 0;color:var(--ink-soft)}
`;

// 목록 그룹 키: 한글 초성(쌍자음은 기본 자음으로), 영문·숫자는 'A-Z'
const GROUP_ORDER = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', 'A-Z'];
function groupKey(term: string): string {
  const ch = chosung(term);
  return GROUP_ORDER.includes(ch) ? ch : 'A-Z';
}

export function GlossaryListPage() {
  // 2026-09-29: 전체 용어를 서버에서 <a href> 카드로 렌더(초성별 그룹) — 검색엔진이 510개 용어 페이지를 모두 발견하도록.
  //  (이전엔 JSON → 클라이언트 렌더라 서버 HTML에 용어 링크가 거의 없었음) 검색·카테고리·초성 필터는 DOM 표시/숨김으로 유지.
  const groups = GROUP_ORDER
    .map(key => ({ key, terms: GLOSSARY_SORTED.filter(t => groupKey(t.term) === key) }))
    .filter(g => g.terms.length);
  const card = (t: GTerm) => {
    const tags = t.rel.slice(0, 2).map(s => `<span class="gl-tag">${esc(tName(s))}</span>`).join('');
    return `<a class="gl-card" href="/glossary/${encodeURIComponent(t.term)}" data-c="${esc(t.cat)}"><h4><i class="fas fa-book-open"></i>${esc(t.term)}</h4><p>${esc(t.def)}</p>${tags}</a>`;
  };
  const chos = ['전체', ...GROUP_ORDER];

  return html`
  ${raw(PAGE_HERO('치과 백과사전', '치과 백과사전', `${GLOSSARY_SORTED.length}개의 치과 용어를 쉬운 말로 풀어드립니다. 진료실에서 들었던 낯선 단어, 여기서 찾아보세요.`))}
  <style>${raw(GLOSSARY_CSS)}</style>
  <section class="section">
    <div class="wrap">
      <h2 class="section-list-title">용어 목록</h2>
      <div class="gl-toolbar">
        <div class="gl-search">
          <i class="fas fa-search"></i>
          <input type="search" id="glSearch" placeholder="용어 또는 설명으로 검색 (예: 임플란트, 시린이)" autocomplete="off" aria-label="치과 용어 검색">
        </div>
      </div>
      <div class="gl-cats" id="glCats">
        <button class="gl-cat on" data-cat="">전체</button>
        ${raw(GLOSSARY_CATS.map(c => `<button class="gl-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join(''))}
      </div>
      <div class="gl-cho" id="glCho">
        ${raw(chos.map((c, i) => `<button data-cho="${c === '전체' ? '' : c}" class="${i === 0 ? 'on' : ''}" style="${c === '전체' || c === 'A-Z' ? 'width:auto;padding:0 14px' : ''}">${c}</button>`).join(''))}
      </div>
      <div class="gl-count" id="glCount">총 ${GLOSSARY_SORTED.length}개 용어</div>
      <div id="glGroups">
        ${raw(groups.map(g => `
        <section class="gl-group" data-cho="${g.key}" aria-labelledby="gl-g-${g.key === 'A-Z' ? 'az' : g.key}">
          <h3 class="gl-group-h" id="gl-g-${g.key === 'A-Z' ? 'az' : g.key}">${g.key}<small>${g.terms.length}개</small></h3>
          <div class="gl-grid">${g.terms.map(card).join('')}</div>
        </section>`).join(''))}
      </div>
      <div class="gl-empty" id="glEmpty" style="display:none"><i class="fas fa-search" style="font-size:2rem;color:var(--gold);margin-bottom:14px;display:block"></i>검색 결과가 없습니다.</div>
    </div>
  </section>
  <script>
  (function(){
    var groups = Array.prototype.slice.call(document.querySelectorAll('#glGroups .gl-group'));
    var count = document.getElementById('glCount'), empty = document.getElementById('glEmpty');
    var q = '', cat = '', cho = '';
    // 카드별 검색 텍스트 캐시
    groups.forEach(function(g){
      g.querySelectorAll('.gl-card').forEach(function(a){
        a._s = (a.querySelector('h4').textContent + ' ' + a.querySelector('p').textContent).toLowerCase();
      });
    });
    function render(){
      var ql = q.trim().toLowerCase(), total = 0;
      groups.forEach(function(g){
        var n = 0, groupOk = !cho || g.dataset.cho === cho;
        g.querySelectorAll('.gl-card').forEach(function(a){
          var ok = groupOk && (!cat || a.dataset.c === cat) && (!ql || a._s.indexOf(ql) >= 0);
          a.style.display = ok ? '' : 'none';
          if (ok) n++;
        });
        g.style.display = n ? '' : 'none';
        total += n;
      });
      count.textContent = '총 ' + total + '개 용어';
      empty.style.display = total ? 'none' : 'block';
    }
    document.getElementById('glSearch').addEventListener('input', function(e){ q = e.target.value; render(); });
    document.getElementById('glCats').addEventListener('click', function(e){
      var b = e.target.closest('.gl-cat'); if(!b) return;
      cat = b.dataset.cat;
      this.querySelectorAll('.gl-cat').forEach(function(x){ x.classList.toggle('on', x === b); });
      render();
    });
    document.getElementById('glCho').addEventListener('click', function(e){
      var b = e.target.closest('button'); if(!b) return;
      cho = b.dataset.cho;
      this.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x === b); });
      render();
    });
  })();
  </script>`;
}

export function GlossaryDetailPage(term: GTerm, related: GTerm[], relTreatments: { slug: string; name: string; short: string }[]) {
  return html`
  ${raw(PAGE_HERO(`<a href="/glossary" style="color:rgba(250,248,244,.45)">치과 백과사전</a> / 용어`, esc(term.term), esc(term.cat)))}
  <style>${raw(GLOSSARY_CSS)}
    .gd-def{background:#fff;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:var(--radius-lg);padding:34px 38px;font-size:1.12rem;line-height:1.9;margin-bottom:40px}
    .gd-long{font-size:1.04rem;line-height:2;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:30px 34px;letter-spacing:-.01em}
    .gd-sub{font-size:1.25rem;margin:40px 0 18px;display:flex;align-items:center;gap:10px}
    .gd-sub i{color:var(--gold);font-size:.85em}
    .gd-treat{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
    .gd-treat a{background:var(--gold-soft);border:1px solid var(--line);border-radius:var(--radius-lg);padding:20px 24px;display:block;transition:.3s}
    .gd-treat a:hover{transform:translateY(-3px);box-shadow:var(--shadow)}
    .gd-treat .gd-treat-name{display:block;font-size:1rem;font-weight:700;margin-bottom:4px;color:var(--ink)}
    .gd-treat p{font-size:.82rem;color:var(--ink-soft)}
    .gd-rel{display:flex;gap:10px;flex-wrap:wrap}
    .gd-rel a{padding:9px 18px;border-radius:99px;border:1px solid var(--line);background:#fff;font-size:.88rem;transition:.25s}
    .gd-rel a:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
  </style>
  <section class="section">
    <div class="wrap" style="max-width:880px">
      <div class="gd-def aeo-summary"><strong>${esc(term.term)}</strong>(이)란? ${esc(term.def)}</div>

      ${term.longDef ? raw(`
      <h2 class="gd-sub"><i class="fas fa-circle-info"></i>자세히 알아보기</h2>
      <div class="gd-long">${esc(term.longDef)}</div>`) : ''}

      ${relTreatments.length ? raw(`
      <h2 class="gd-sub"><i class="fas fa-stethoscope"></i>관련 진료 보기</h2>
      <div class="gd-treat">
        ${relTreatments.map(t => `<a href="/treatments/${t.slug}"><strong class="gd-treat-name">${esc(t.name)}</strong><p>${esc(t.short)}</p></a>`).join('')}
      </div>`) : ''}

      ${related.length ? raw(`
      <h2 class="gd-sub"><i class="fas fa-link"></i>함께 보면 좋은 용어</h2>
      <div class="gd-rel">
        ${related.map(t => `<a href="/glossary/${encodeURIComponent(t.term)}">${esc(t.term)}</a>`).join('')}
      </div>`) : ''}

      <div style="margin-top:48px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/glossary" class="btn-ghost" style="display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border:1px solid var(--line);border-radius:99px;font-size:.9rem"><i class="fas fa-arrow-left"></i> 백과사전 전체 보기</a>
        <a href="/reservation" class="btn-gold" style="display:inline-flex;align-items:center;gap:8px;padding:13px 26px;border-radius:99px;font-size:.9rem;background:linear-gradient(110deg,var(--gold),#C99A50);color:#fff"><i class="fas fa-calendar-check"></i> 진료 예약 문의</a>
      </div>

      <p style="margin-top:36px;font-size:.78rem;color:var(--ink-soft);line-height:1.7">※ 본 설명은 일반적인 치과 의학 정보이며, 개인의 구강 상태에 따라 진단과 치료 방법은 달라질 수 있습니다. 정확한 진단은 ${esc(CLINIC.name)} 내원 상담을 통해 받아보시기 바랍니다.</p>
    </div>
  </section>`;
}
