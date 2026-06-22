// ============================================================
// 공개 콘텐츠 페이지 — 비포&애프터 / 블로그 / 공지사항
// ============================================================
import { html, raw } from 'hono/html';
import { CLINIC, DOCTORS, TREATMENTS } from '../data/clinic';

const PAGE_HERO = (crumb: string, title: string, sub: string) => `
<section style="background:var(--navy);color:var(--inv);padding:104px 0 80px;position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(700px 460px at 82% 24%,rgba(185,138,78,.16),transparent 60%)"></div>
  <div class="wrap" style="position:relative;z-index:2">
    <div style="font-size:.78rem;letter-spacing:.12em;color:rgba(250,248,244,.45);margin-bottom:22px"><a href="/" style="color:rgba(250,248,244,.45)">홈</a> / ${crumb}</div>
    <h1 style="font-size:clamp(2.3rem,5.4vw,3.8rem);line-height:1.25;color:var(--inv)">${title}</h1>
    <p style="color:rgba(250,248,244,.72);font-size:1.12rem;max-width:660px;margin-top:16px">${sub}</p>
  </div>
</section>`;

const docName = (slug: string) => DOCTORS.find(d => d.slug === slug)?.name || '';
const catName = (slug: string) => TREATMENTS.find(t => t.slug === slug)?.name || slug;

// ============================================================
// 비포&애프터 목록
// ============================================================
export function CasesListPage(cases: any[], loggedIn: boolean) {
  const cards = cases.map(x => {
    const thumb = x.img_oral_before || x.img_pano_before;
    return `
    <a href="/cases/${x.id}" class="case-card reveal">
      <div class="cc-img">
        ${thumb ? `<img src="/api/img/${thumb}" alt="${esc(x.title)} 치료 전" loading="lazy" decoding="async">` : `<div class="cc-noimg"><i class="fas fa-tooth"></i></div>`}
        <span class="cc-cat">${esc(catName(x.category))}</span>
      </div>
      <div class="cc-body">
        <h3>${esc(x.title)}</h3>
        <div class="cc-meta">
          ${x.age_group ? `<span>${esc(x.age_group)} ${esc(x.gender)}</span>` : ''}
          ${x.region ? `<span><i class="fas fa-map-marker-alt"></i> ${esc(x.region)}</span>` : ''}
          ${x.duration ? `<span><i class="fas fa-clock"></i> ${esc(x.duration)}</span>` : ''}
        </div>
        <div class="cc-doc">담당 · ${esc(docName(x.doctor_slug))} 원장 <span class="cc-views"><i class="fas fa-eye"></i> ${x.views}</span></div>
      </div>
    </a>`;
  }).join('');

  return html`
  ${raw(PAGE_HERO('비포&애프터', '치료 사례 — 비포 & 애프터', '이솔치과에서 진행한 실제 치료 사례입니다. 치료 후 사진은 회원 로그인 시 열람하실 수 있습니다.'))}
  <style>
    .case-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:26px}
    .case-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;transition:transform .35s var(--ease),box-shadow .35s var(--ease);display:block}
    .case-card:hover{transform:translateY(-6px);box-shadow:var(--shadow)}
    .cc-img{position:relative;aspect-ratio:4/3;background:var(--gold-soft);overflow:hidden}
    .cc-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease)}
    .case-card:hover .cc-img img{transform:scale(1.05)}
    .cc-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.4rem;color:var(--gold)}
    .cc-cat{position:absolute;top:12px;left:12px;background:var(--navy);color:#fff;font-size:.72rem;font-weight:700;padding:5px 12px;border-radius:99px}
    .cc-body{padding:20px 22px 22px}
    .cc-body h3{font-size:1.08rem;line-height:1.4;margin-bottom:10px}
    .cc-meta{display:flex;gap:12px;flex-wrap:wrap;font-size:.8rem;color:var(--ink-soft);margin-bottom:12px}
    .cc-meta i{color:var(--gold);font-size:.75em;margin-right:3px}
    .cc-doc{font-size:.82rem;color:var(--ink-soft);border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:space-between}
    .cc-views{opacity:.7}
    .case-lock-note{background:var(--gold-soft);border:1px solid var(--line);border-radius:14px;padding:16px 22px;margin-bottom:34px;display:flex;gap:12px;align-items:center;font-size:.92rem}
    .case-lock-note i{color:var(--gold-3);font-size:1.2rem}
  </style>
  <section class="section">
    <div class="wrap">
      <h2 class="section-list-title">치료 사례 목록</h2>
      ${loggedIn ? '' : raw(`<div class="case-lock-note reveal"><i class="fas fa-lock"></i><div>치료 <strong>후(애프터)</strong> 사진은 의료법 준수를 위해 <a href="/login" style="color:var(--gold-3);font-weight:700;text-decoration:underline">로그인</a> 후 열람하실 수 있습니다. 아직 회원이 아니시라면 <a href="/signup" style="color:var(--gold-3);font-weight:700;text-decoration:underline">회원가입</a> 해주세요.</div></div>`)}
      ${cases.length
        ? raw(`<div class="case-grid">${cards}</div>`)
        : raw(`<div style="text-align:center;padding:70px 20px;color:var(--ink-soft)"><i class="fas fa-folder-open" style="font-size:2.4rem;color:var(--gold);margin-bottom:18px;display:block"></i>치료 사례를 준비 중입니다. 자세한 사례는 내원 상담 시 직접 안내해 드립니다.</div>`)}
      <p style="margin-top:40px;font-size:.8rem;color:var(--ink-soft);text-align:center">※ 치료 결과는 개인의 구강 상태에 따라 차이가 있을 수 있으며, 모든 의료 행위에는 부작용이 발생할 수 있습니다.</p>
    </div>
  </section>`;
}

// ============================================================
// 비포&애프터 상세 — 전후 비교 슬라이더 + 애프터 로그인 잠금
// ============================================================
export function CaseDetailPage(x: any, loggedIn: boolean, related: any[]) {
  const doctor = DOCTORS.find(d => d.slug === x.doctor_slug);
  const treatment = TREATMENTS.find(t => t.slug === x.category);

  const pair = (label: string, before: string | null, after: string | null, id: string) => {
    if (!before && !after) return '';
    // 둘 다 있고 로그인 → 비교 슬라이더
    if (before && after && loggedIn) {
      return `
      <div class="ba-block reveal">
        <h3 class="ba-title">${label}</h3>
        <div class="ba-slider" id="${id}">
          <img src="/api/img/${after}" alt="${label} 치료 후" class="ba-after" draggable="false" loading="lazy" decoding="async">
          <div class="ba-before-wrap"><img src="/api/img/${before}" alt="${label} 치료 전" draggable="false" loading="lazy" decoding="async"></div>
          <div class="ba-handle"><span><i class="fas fa-arrows-alt-h"></i></span></div>
          <span class="ba-lbl ba-lbl-b">BEFORE</span><span class="ba-lbl ba-lbl-a">AFTER</span>
        </div>
        <p class="ba-hint"><i class="fas fa-hand-pointer"></i> 가운데 손잡이를 좌우로 움직여 전후를 비교해 보세요.</p>
      </div>`;
    }
    // 비포만 또는 애프터 잠금
    return `
    <div class="ba-block reveal">
      <h3 class="ba-title">${label}</h3>
      <div class="ba-pair">
        ${before ? `<figure><img src="/api/img/${before}" alt="${label} 치료 전" loading="lazy" decoding="async"><figcaption>BEFORE</figcaption></figure>` : ''}
        ${after ? (loggedIn
          ? `<figure><img src="/api/img/${after}" alt="${label} 치료 후" loading="lazy" decoding="async"><figcaption>AFTER</figcaption></figure>`
          : `<figure class="ba-locked"><div class="ba-lock-box"><i class="fas fa-lock"></i><strong>치료 후 사진</strong><p>회원 로그인 시 열람 가능합니다</p><a href="/login?next=/cases/${x.id}" class="btn btn-accent" style="padding:10px 22px;font-size:.9rem">로그인하고 보기</a></div><figcaption>AFTER 🔒</figcaption></figure>`) : ''}
      </div>
    </div>`;
  };

  const relCards = related.map(r => {
    const thumb = r.img_oral_before || r.img_pano_before;
    return `<a href="/cases/${r.id}" class="rel-case">
      ${thumb ? `<img src="/api/img/${thumb}" alt="${esc(r.title)}" loading="lazy" decoding="async">` : '<div class="rel-noimg"><i class="fas fa-tooth"></i></div>'}
      <div><strong>${esc(r.title)}</strong><span>${esc(catName(r.category))}</span></div></a>`;
  }).join('');

  return html`
  ${raw(PAGE_HERO(`<a href="/cases" style="color:rgba(250,248,244,.45)">비포&애프터</a> / 사례`, esc(x.title), `${esc(x.age_group)} ${esc(x.gender)} 환자분의 ${esc(catName(x.category))} 치료 사례입니다.`))}
  <style>
    .ba-detail{max-width:880px;margin:0 auto}
    .ba-meta-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:34px}
    .ba-meta-bar span{background:#fff;border:1px solid var(--line);border-radius:99px;padding:8px 18px;font-size:.85rem;font-weight:600}
    .ba-meta-bar i{color:var(--gold);margin-right:6px}
    .ba-desc{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:28px 32px;margin-bottom:36px;line-height:1.85;white-space:pre-wrap}
    .ba-block{margin-bottom:44px}
    .ba-title{font-size:1.2rem;margin-bottom:16px;display:flex;align-items:center;gap:10px}
    .ba-title::before{content:'';width:26px;height:2px;background:var(--gold-grad)}
    .ba-pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .ba-pair figure{margin:0;position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#fff}
    .ba-pair img{width:100%;display:block}
    .ba-pair figcaption{position:absolute;top:10px;left:10px;background:rgba(41,28,18,.85);color:#fff;font-size:.7rem;font-weight:800;letter-spacing:.1em;padding:5px 12px;border-radius:99px;font-family:var(--mono)}
    .ba-locked{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--gold-soft),#fff)}
    .ba-lock-box{text-align:center;padding:20px}
    .ba-lock-box i{font-size:1.8rem;color:var(--gold);margin-bottom:10px;display:block}
    .ba-lock-box strong{display:block;margin-bottom:4px}
    .ba-lock-box p{font-size:.82rem;color:var(--ink-soft);margin-bottom:14px}
    .ba-slider{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line);user-select:none;touch-action:none;cursor:ew-resize}
    .ba-slider img{width:100%;display:block;pointer-events:none}
    .ba-before-wrap{position:absolute;inset:0;width:50%;overflow:hidden}
    .ba-before-wrap img{width:auto;height:100%;max-width:none}
    .ba-handle{position:absolute;top:0;bottom:0;left:50%;width:3px;background:#fff;transform:translateX(-50%);box-shadow:0 0 12px rgba(0,0,0,.4)}
    .ba-handle span{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:42px;height:42px;border-radius:50%;background:var(--gold-grad);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3)}
    .ba-lbl{position:absolute;top:12px;background:rgba(41,28,18,.85);color:#fff;font-size:.7rem;font-weight:800;letter-spacing:.1em;padding:5px 12px;border-radius:99px;font-family:var(--mono);pointer-events:none}
    .ba-lbl-b{left:12px}.ba-lbl-a{right:12px}
    .ba-hint{font-size:.8rem;color:var(--ink-soft);margin-top:10px;text-align:center}
    .ba-doc-card{display:flex;gap:18px;align-items:center;background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:26px 30px;margin:44px 0}
    .ba-doc-card .av{width:62px;height:62px;border-radius:50%;background:var(--gold-grad);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
    .ba-doc-card a{color:var(--gold-2);font-weight:700;text-decoration:underline;text-underline-offset:3px}
    .rel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin-top:20px}
    .rel-case{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px;transition:.25s}
    .rel-case:hover{border-color:var(--gold);transform:translateY(-2px)}
    .rel-case img,.rel-noimg{width:64px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0}
    .rel-noimg{background:var(--gold-soft);display:flex;align-items:center;justify-content:center;color:var(--gold)}
    .rel-case strong{display:block;font-size:.86rem;line-height:1.35}
    .rel-case span{font-size:.74rem;color:var(--ink-soft)}
    @media(max-width:680px){.ba-pair{grid-template-columns:1fr}}
  </style>
  <section class="section">
    <div class="wrap ba-detail">
      <div class="ba-meta-bar reveal">
        ${x.age_group ? raw(`<span><i class="fas fa-user"></i>${esc(x.age_group)} ${esc(x.gender)}</span>`) : ''}
        ${x.region ? raw(`<span><i class="fas fa-map-marker-alt"></i>${esc(x.region)}</span>`) : ''}
        ${x.duration ? raw(`<span><i class="fas fa-clock"></i>치료기간 ${esc(x.duration)}</span>`) : ''}
        <span><i class="fas fa-stethoscope"></i>${esc(catName(x.category))}</span>
        <span><i class="fas fa-eye"></i>조회 ${x.views}</span>
      </div>
      ${x.description ? raw(`<div class="ba-desc reveal">${esc(x.description)}</div>`) : ''}
      ${raw(pair('파노라마 (방사선) 전후', x.img_pano_before, x.img_pano_after, 'slider-pano'))}
      ${raw(pair('구내 포토 전후', x.img_oral_before, x.img_oral_after, 'slider-oral'))}
      ${doctor ? raw(`
      <div class="ba-doc-card reveal">
        <div class="av"><i class="fas fa-user-md"></i></div>
        <div>
          <div style="font-weight:800;font-size:1.1rem">${doctor.name} ${doctor.role} <span style="font-weight:400;font-size:.85rem;color:rgba(255,255,255,.65)">· ${doctor.specialty}</span></div>
          <div style="font-size:.88rem;color:rgba(255,255,255,.75);margin-top:6px">이 사례를 담당한 의료진입니다. <a href="/doctors/${doctor.slug}">원장 소개 보기</a>${treatment ? ` · <a href="/treatments/${treatment.slug}">${treatment.name} 진료 안내</a>` : ''}</div>
        </div>
      </div>`) : ''}
      ${related.length ? raw(`<h3 style="font-size:1.2rem;margin-top:10px">비슷한 치료 사례</h3><div class="rel-grid">${relCards}</div>`) : ''}
      <p style="margin-top:40px;font-size:.8rem;color:var(--ink-soft)">※ 본 사례는 해당 환자의 치료 결과이며, 개인의 구강 상태에 따라 치료 방법과 결과는 차이가 있을 수 있습니다. 모든 의료 행위에는 부작용이 발생할 수 있으므로 정확한 진단은 내원 상담을 통해 받으시기 바랍니다.</p>
      <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/cases" class="btn btn-ghost"><i class="fas fa-list"></i> 목록으로</a>
        <a href="/reservation" class="btn btn-accent"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
      </div>
    </div>
  </section>
  <!-- 비교 슬라이더 구동은 전역 INTERACTION_JS(.ba-slider 공통 핸들러)로 처리 — 키보드 접근성 포함 -->
  `;
}

// ============================================================
// 블로그 목록
// ============================================================
export function BlogListPage(posts: any[]) {
  const cards = posts.map(p => `
  <a href="/blog/${esc(p.slug)}" class="blog-card reveal">
    <div class="bc-img">${p.thumbnail ? `<img src="/api/img/${p.thumbnail}" alt="${esc(p.title)}" loading="lazy" decoding="async">` : '<div class="bc-noimg"><i class="fas fa-feather-alt"></i></div>'}</div>
    <div class="bc-body">
      <h3>${esc(p.title)}</h3>
      ${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ''}
      <div class="bc-meta"><span><i class="fas fa-user-md"></i> ${esc(docName(p.author_slug))} 원장</span><span>${(p.created_at || '').slice(0, 10)}</span><span><i class="fas fa-eye"></i> ${p.views}</span></div>
    </div>
  </a>`).join('');
  return html`
  ${raw(PAGE_HERO('블로그', '치과 건강 이야기', '이솔치과 원장들이 직접 쓰는 구강 건강 정보와 병원 이야기입니다.'))}
  <style>
    .blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:26px}
    .blog-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;transition:transform .35s var(--ease),box-shadow .35s var(--ease);display:block}
    .blog-card:hover{transform:translateY(-6px);box-shadow:var(--shadow)}
    .bc-img{aspect-ratio:16/9;background:var(--gold-soft);overflow:hidden}
    .bc-img img{width:100%;height:100%;object-fit:cover}
    .bc-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--gold)}
    .bc-body{padding:22px 24px}
    .bc-body h3{font-size:1.12rem;line-height:1.45;margin-bottom:8px}
    .bc-body p{font-size:.88rem;color:var(--ink-soft);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .bc-meta{display:flex;gap:14px;font-size:.78rem;color:var(--ink-soft);border-top:1px solid var(--line);padding-top:12px}
    .bc-meta i{color:var(--gold);margin-right:4px}
  </style>
  <section class="section"><div class="wrap">
    <h2 class="section-list-title">블로그 글 목록</h2>
    ${posts.length
      ? raw(`<div class="blog-grid">${cards}</div>`)
      : raw(`<div style="text-align:center;padding:70px 20px;color:var(--ink-soft)"><i class="fas fa-feather-alt" style="font-size:2.4rem;color:var(--gold);margin-bottom:18px;display:block"></i>첫 글을 준비 중입니다. 곧 유익한 구강 건강 정보로 찾아뵙겠습니다.</div>`)}
  </div></section>`;
}

// ============================================================
// 블로그 상세
// ============================================================
// 본문 HTML에서 읽기시간·목차(TOC) 추출 + h2/h3에 id 부여
function analyzePost(htmlStr: string): { html: string; readMin: number; toc: { id: string; text: string; level: number }[] } {
  const raw = htmlStr || '';
  // 읽기시간: 태그 제거 후 공백 제외 글자수 / 분당 500자
  const plain = raw.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, '');
  const readMin = Math.max(1, Math.round(plain.length / 500));
  // 목차: h2/h3 추출하며 id 부여
  const toc: { id: string; text: string; level: number }[] = [];
  let idx = 0;
  const withIds = raw.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (m, tag, attrs, inner) => {
    idx++;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) return m;
    const id = 'sec-' + idx;
    toc.push({ id, text, level: tag.toLowerCase() === 'h2' ? 2 : 3 });
    // 기존 id가 있으면 유지, 없으면 추가
    if (/\sid=/.test(attrs)) return m;
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
  return { html: withIds, readMin, toc };
}

export function BlogDetailPage(p: any, related: any[]) {
  const doctor = DOCTORS.find(d => d.slug === p.author_slug);
  const relList = related.map(r => `<a href="/blog/${esc(r.slug)}"><i class="fas fa-angle-right"></i> ${esc(r.title)}</a>`).join('');
  const { html: bodyHtml, readMin, toc } = analyzePost(p.content_html || '');
  const tocHtml = toc.length >= 2
    ? `<nav class="post-toc reveal" aria-label="목차">
        <div class="toc-head"><i class="fas fa-list-ul"></i> 목차</div>
        <ol>${toc.map(t => `<li class="lv${t.level}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol>
       </nav>`
    : '';
  return html`
  ${raw(PAGE_HERO(`<a href="/blog" style="color:rgba(250,248,244,.45)">블로그</a> / 글`, esc(p.title), p.excerpt ? esc(p.excerpt) : ''))}
  <style>
    .post-wrap{max-width:780px;margin:0 auto}
    .post-meta{display:flex;gap:16px;align-items:center;padding-bottom:24px;border-bottom:1px solid var(--line);margin-bottom:34px;font-size:.88rem;color:var(--ink-soft)}
    .post-meta i{color:var(--gold);margin-right:5px}
    .post-body{line-height:1.9;font-size:1.04rem}
    .post-body h2{font-size:1.55rem;margin:1.6em 0 .6em;padding-bottom:.35em;border-bottom:2px solid var(--gold-soft);scroll-margin-top:90px}
    .post-body h3{font-size:1.22rem;margin:1.3em 0 .5em;scroll-margin-top:90px}
    .post-body h4{font-size:1.08rem;margin:1.1em 0 .4em;color:var(--gold-3)}
    .post-body p{margin:.7em 0}
    .post-body a{color:var(--gold-3);text-decoration:underline;text-underline-offset:3px}
    .post-body img{max-width:100%;border-radius:14px;border:1px solid var(--line)}
    .post-body figure{margin:1.6em 0;text-align:center}
    .post-body figure img{margin:0 auto;display:block;box-shadow:0 10px 30px rgba(62,44,31,.12)}
    .post-body figure figcaption{margin-top:10px;font-size:.88rem;color:var(--ink-soft);font-style:italic}
    .post-body ul,.post-body ol{padding-left:1.4em;margin:.7em 0}
    .post-body li{margin:.3em 0}
    .post-body hr{border:none;border-top:2px dashed var(--line);margin:2em 0}
    .post-body blockquote{border-left:3px solid var(--gold);background:var(--gold-soft);padding:14px 20px;border-radius:0 12px 12px 0;margin:1em 0;color:var(--navy);font-style:italic}
    .post-toc{background:#fff;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:12px;padding:18px 24px;margin-bottom:34px}
    .post-toc .toc-head{font-weight:800;color:var(--navy);margin-bottom:10px;font-size:.95rem}
    .post-toc .toc-head i{color:var(--gold);margin-right:7px}
    .post-toc ol{list-style:none;padding:0;margin:0;counter-reset:toc}
    .post-toc li{margin:5px 0}
    .post-toc li.lv3{padding-left:18px}
    .post-toc a{color:var(--ink-soft);font-size:.92rem;font-weight:600;transition:.15s}
    .post-toc a:hover{color:var(--gold-3)}
    .post-author{display:flex;gap:18px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:24px 28px;margin:44px 0 0}
    .post-author .av{width:58px;height:58px;border-radius:50%;background:var(--gold-grad);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#fff;flex-shrink:0}
    .rel-posts{margin-top:36px;background:var(--gold-soft);border-radius:var(--radius-lg);padding:24px 28px}
    .rel-posts a{display:block;padding:8px 0;font-weight:600;font-size:.92rem;color:var(--navy)}
    .rel-posts a:hover{color:var(--gold-3)}
    .rel-posts i{color:var(--gold);margin-right:6px}
  </style>
  <section class="section"><div class="wrap post-wrap">
    <div class="post-meta reveal">
      ${doctor ? raw(`<span><i class="fas fa-user-md"></i><a href="/doctors/${doctor.slug}" style="font-weight:700;color:var(--navy)">${doctor.name} ${doctor.role}</a></span>`) : ''}
      <span><i class="fas fa-calendar"></i>${(p.created_at || '').slice(0, 10)}</span>
      <span><i class="fas fa-eye"></i>조회 ${p.views}</span>
      <span><i class="fas fa-clock"></i>읽기 ${readMin}분</span>
    </div>
    ${tocHtml ? raw(tocHtml) : ''}
    <article class="post-body reveal">${raw(bodyHtml)}</article>
    ${doctor ? raw(`
    <div class="post-author reveal">
      <div class="av"><i class="fas fa-user-md"></i></div>
      <div>
        <div style="font-weight:800">${doctor.name} ${doctor.role}</div>
        <div style="font-size:.85rem;color:var(--ink-soft);margin-top:4px">${doctor.specialty} · <a href="/doctors/${doctor.slug}" style="color:var(--gold-3);font-weight:700;text-decoration:underline;text-underline-offset:3px">원장 소개 보기</a></div>
      </div>
    </div>`) : ''}
    ${related.length ? raw(`<div class="rel-posts reveal"><strong style="display:block;margin-bottom:10px">함께 읽으면 좋은 글</strong>${relList}</div>`) : ''}
    <div style="margin-top:34px;display:flex;gap:12px">
      <a href="/blog" class="btn btn-ghost"><i class="fas fa-list"></i> 목록으로</a>
      <a href="/reservation" class="btn btn-accent"><i class="fas fa-calendar-check"></i> 상담 예약</a>
    </div>
  </div></section>`;
}

// ============================================================
// 공지사항 목록
// ============================================================
export function NoticesListPage(notices: any[]) {
  const rows = notices.map(n => `
  <a href="/notices/${n.id}" class="notice-row reveal ${n.is_pinned ? 'pinned' : ''}">
    <div class="nr-badge">${n.is_pinned ? '<span class="pin-tag">📌 공지</span>' : `<span class="num-tag">#${n.id}</span>`}</div>
    <div class="nr-title">${esc(n.title)} ${n.image ? '<i class="fas fa-image" style="color:var(--gold);font-size:.8em"></i>' : ''}</div>
    <div class="nr-meta"><span>${(n.created_at || '').slice(0, 10)}</span><span><i class="fas fa-eye"></i> ${n.views}</span></div>
  </a>`).join('');
  return html`
  ${raw(PAGE_HERO('공지사항', '병원 소식 & 공지', '진료 일정 변경, 병원 소식을 안내해 드립니다.'))}
  <style>
    .notice-list{max-width:820px;margin:0 auto}
    .notice-row{display:flex;gap:18px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 24px;margin-bottom:12px;transition:.25s}
    .notice-row:hover{border-color:var(--gold);transform:translateX(4px)}
    .notice-row.pinned{background:var(--gold-soft);border-color:var(--gold-2)}
    .pin-tag{background:var(--navy);color:#fff;font-size:.72rem;font-weight:700;padding:4px 10px;border-radius:99px;white-space:nowrap}
    .num-tag{color:var(--ink-soft);font-size:.78rem;font-family:var(--mono)}
    .nr-title{flex:1;font-weight:700;font-size:.98rem}
    .nr-meta{display:flex;gap:14px;font-size:.78rem;color:var(--ink-soft);white-space:nowrap}
  </style>
  <section class="section"><div class="wrap notice-list">
    ${notices.length ? raw(rows) : raw(`<div style="text-align:center;padding:70px 20px;color:var(--ink-soft)"><i class="fas fa-bullhorn" style="font-size:2.4rem;color:var(--gold);margin-bottom:18px;display:block"></i>등록된 공지사항이 없습니다.</div>`)}
  </div></section>`;
}

// ============================================================
// 공지사항 상세
// ============================================================
export function NoticeDetailPage(n: any) {
  return html`
  ${raw(PAGE_HERO(`<a href="/notices" style="color:rgba(250,248,244,.45)">공지사항</a> / 상세`, esc(n.title), ''))}
  <style>
    .notice-detail{max-width:780px;margin:0 auto}
    .nd-meta{display:flex;gap:16px;font-size:.85rem;color:var(--ink-soft);padding-bottom:20px;border-bottom:1px solid var(--line);margin-bottom:30px}
    .nd-body{line-height:1.9;font-size:1.02rem}
    .nd-body img{max-width:100%;border-radius:14px;margin:14px 0}
    .nd-body h3{margin:1.2em 0 .5em}
    .nd-img{margin-bottom:28px}
    .nd-img img{width:100%;border-radius:var(--radius-lg);border:1px solid var(--line)}
  </style>
  <section class="section"><div class="wrap notice-detail">
    <div class="nd-meta reveal">
      ${n.is_pinned ? raw('<span style="color:var(--gold-3);font-weight:700">📌 고정 공지</span>') : ''}
      <span><i class="fas fa-calendar" style="color:var(--gold)"></i> ${(n.created_at || '').slice(0, 10)}</span>
      <span><i class="fas fa-eye" style="color:var(--gold)"></i> 조회 ${n.views}</span>
    </div>
    ${n.image ? raw(`<div class="nd-img reveal"><img src="/api/img/${n.image}" alt="${esc(n.title)}" loading="lazy" decoding="async"></div>`) : ''}
    <div class="nd-body reveal">${raw(n.content_html || '')}</div>
    <div style="margin-top:36px"><a href="/notices" class="btn btn-ghost"><i class="fas fa-list"></i> 목록으로</a></div>
  </div></section>`;
}

function esc(s: any): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
