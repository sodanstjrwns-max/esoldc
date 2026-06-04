import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS } from '../data/clinic';
import { SITE_URL, type SeoMeta } from './seo';

// ============================================================================
// 디자인 토큰 — "Soft Organic" (2026 웜 내추럴)
// 방향: 카페 같은 편안함. 따뜻한 크림/베이지 베이스 + 차분한 세이지 그린 +
//       살구빛 포인트. 유기적 곡선·넉넉한 여백·큰 본문(중장년 가독성).
// 토큰 이름은 유지(전 페이지 호환), 값만 새 팔레트로 매핑:
//   --navy* = 딥 세이지 그린(메인)  --gold* = 살구/클레이(포인트)
// ============================================================================
const DESIGN_TOKENS = `
:root{
  /* ── 메인: 딥 세이지 그린 (자연·청결·신뢰) ── */
  --navy:#3B6B5A;
  --navy-2:#2E5648;
  --navy-3:#4E8470;
  /* ── 포인트: 따뜻한 클레이/살구 ── */
  --gold:#C8775A;
  --gold-2:#E0A07F;
  --gold-soft:#F6E4D7;
  /* ── 잉크(텍스트) — 웜 브라운-그레이 ── */
  --ink:#33302B;
  --ink-soft:#6B6359;
  --ink-faint:#9A9183;
  --line:#E8E0D2;
  /* ── 배경 — 따뜻한 크림/베이지 ── */
  --bg:#FAF5EC;
  --bg-soft:#F2EADB;
  --bg-deep:#ECE2CF;
  --bg-card:#FFFDF8;
  /* ── 그린 위 텍스트 ── */
  --inv:#FAF5EC;
  --inv-soft:rgba(250,245,236,.80);
  --inv-faint:rgba(250,245,236,.52);
  /* ── 라운드 (2026: 크고 부드럽게) ── */
  --radius:18px;
  --radius-lg:32px;
  --radius-xl:48px;
  --radius-pill:999px;
  /* ── 그림자 (부드럽고 따뜻하게) ── */
  --shadow-sm:0 4px 20px rgba(59,107,90,.07);
  --shadow:0 16px 44px rgba(59,107,90,.11);
  --shadow-lg:0 34px 80px rgba(59,107,90,.16);
  --shadow-warm:0 22px 56px rgba(200,119,90,.20);
  --glass:rgba(250,245,236,.78);
  --ease:cubic-bezier(.22,.61,.36,1);
  --ease-soft:cubic-bezier(.4,0,.2,1);
  --max:1200px;
  --display:'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif;
  --serif:'Pretendard',sans-serif;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{
  margin:0;font-family:var(--display);color:var(--ink);background:var(--bg);
  line-height:1.78;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  overflow-x:hidden;font-size:17px;letter-spacing:-.01em;
}
/* 미세 그레인 텍스처 (종이 같은 따뜻함, 2026) */
body::before{
  content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
h1,h2,h3,h4{font-family:var(--display);line-height:1.24;letter-spacing:-.035em;margin:0;font-weight:800;color:var(--navy);word-break:keep-all}
h1{font-weight:850}
h2{font-weight:800}
h3,h4{font-weight:700}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
section{position:relative}

/* ── eyebrow (작은 라벨) ── */
.eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);background:var(--gold-soft);padding:8px 18px;border-radius:var(--radius-pill)}
.eyebrow::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--gold)}

/* ── 버튼 ── */
.btn{display:inline-flex;align-items:center;gap:.55em;padding:16px 34px;border-radius:var(--radius-pill);font-weight:700;font-size:1.04rem;transition:transform .35s var(--ease),box-shadow .35s var(--ease),background .35s var(--ease);cursor:pointer;border:2px solid transparent;letter-spacing:-.01em;font-family:var(--display)}
.btn-primary{background:var(--navy);color:var(--inv);box-shadow:var(--shadow-sm)}
.btn-primary:hover{background:var(--navy-2);transform:translateY(-3px);box-shadow:var(--shadow)}
.btn-accent{background:var(--gold);color:#fff;box-shadow:var(--shadow-sm)}
.btn-accent:hover{background:var(--gold);filter:brightness(.95);transform:translateY(-3px);box-shadow:var(--shadow-warm)}
.btn-ghost{background:var(--bg-card);color:var(--navy);border-color:var(--line)}
.btn-ghost:hover{border-color:var(--navy);transform:translateY(-3px);box-shadow:var(--shadow-sm)}
.btn-line{display:inline-flex;align-items:center;gap:.55em;color:var(--inv);font-weight:700;padding:16px 34px;border-radius:var(--radius-pill);border:2px solid var(--inv-faint);transition:all .35s var(--ease);font-size:1.04rem}
.btn-line:hover{border-color:var(--inv);background:rgba(250,245,236,.1);transform:translateY(-3px)}

/* ── 헤더 ── */
.site-header{position:sticky;top:0;z-index:800;background:var(--glass);backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);border-bottom:1px solid rgba(232,224,210,.7);transition:box-shadow .3s}
.site-header.scrolled{box-shadow:var(--shadow-sm)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px}
.brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:1.3rem;color:var(--navy);letter-spacing:-.03em}
.brand .logo-mark{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--navy),var(--navy-3));display:grid;place-items:center;color:var(--bg);font-size:1.15rem;box-shadow:var(--shadow-sm)}
.nav-links{display:flex;align-items:center;gap:2px;list-style:none;margin:0;padding:0}
.nav-links>li{position:relative}
.nav-links>li>a{display:block;padding:11px 17px;font-weight:600;font-size:1rem;border-radius:var(--radius-pill);transition:all .25s;color:var(--ink)}
.nav-links>li>a:hover{background:var(--bg-soft);color:var(--navy)}
.mega{position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%) translateY(10px);background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);padding:16px;min-width:560px;opacity:0;visibility:hidden;transition:all .32s var(--ease);display:grid;grid-template-columns:1fr 1fr;gap:4px}
.nav-links>li:hover .mega{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
.mega a{display:flex;gap:14px;align-items:center;padding:13px 15px;border-radius:var(--radius);color:var(--ink);transition:background .2s}
.mega a:hover{background:var(--bg-soft)}
.mega a .mi{width:46px;height:46px;border-radius:14px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;flex:none;font-size:1.15rem}
.mega a strong{display:block;font-size:1rem;font-weight:700;color:var(--navy)}.mega a span{font-size:.82rem;color:var(--ink-soft);line-height:1.4}
.nav-cta{display:flex;align-items:center;gap:14px}
.nav-tel{font-weight:700;color:var(--navy);font-size:1rem;white-space:nowrap}
.nav-tel i{color:var(--gold)}
.burger{display:none;background:none;border:none;font-size:1.5rem;color:var(--navy);cursor:pointer;padding:6px}

/* ── 모바일 메뉴 ── */
.mobile-menu{position:fixed;inset:0;z-index:1000;background:linear-gradient(160deg,var(--navy),var(--navy-2));padding:90px 32px 40px;display:flex;flex-direction:column;gap:2px;transform:translateX(100%);transition:transform .4s var(--ease);overflow-y:auto}
.mobile-menu.open{transform:translateX(0)}
.mobile-menu a{display:block;color:var(--inv);font-size:1.3rem;font-weight:700;padding:15px 0;border-bottom:1px solid rgba(250,245,236,.14)}
.mobile-menu .close{position:absolute;top:26px;right:28px;background:none;border:none;color:var(--inv);font-size:1.7rem;cursor:pointer}

/* ── 푸터 ── */
.site-footer{background:linear-gradient(165deg,var(--navy),var(--navy-2));color:var(--inv);padding:80px 0 36px;margin-top:60px;position:relative;overflow:hidden}
.site-footer::before{content:'';position:absolute;top:-120px;right:-80px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(200,119,90,.22),transparent 70%)}
.footer-grid{display:grid;grid-template-columns:1.7fr 1fr 1fr 1.2fr;gap:44px;position:relative}
.footer-brand{font-size:1.4rem;font-weight:800;margin-bottom:14px;color:var(--inv)}
.footer-grid h4{color:var(--inv);font-size:1rem;margin-bottom:14px}
.footer-grid a{color:var(--inv-soft);font-size:.95rem;display:block;padding:6px 0;transition:color .2s}
.footer-grid a:hover{color:var(--gold-2)}
.footer-biz{font-size:.85rem;color:var(--inv-faint);line-height:1.9;margin-top:16px}
.compliance{margin-top:48px;padding:24px 26px;background:rgba(250,245,236,.06);border-radius:var(--radius);font-size:.82rem;color:var(--inv-soft);line-height:1.8;position:relative}
.footer-bottom{border-top:1px solid rgba(250,245,236,.14);margin-top:40px;padding-top:24px;font-size:.83rem;color:var(--inv-faint);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative}

/* ── 플로팅 CTA ── */
.float-cta{position:fixed;bottom:24px;right:24px;z-index:700;display:flex;flex-direction:column;gap:12px}
.float-cta a{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:1.3rem;box-shadow:var(--shadow);transition:transform .3s var(--ease)}
.float-cta a:hover{transform:scale(1.1)}
.fc-tel{background:var(--navy)}.fc-map{background:var(--navy-3)}.fc-book{background:var(--gold)}

/* ── 유기적 곡선 구분선(블롭/웨이브) ── */
.blob{position:absolute;border-radius:46% 54% 58% 42%/52% 44% 56% 48%;filter:blur(8px);opacity:.5;pointer-events:none;z-index:0}

/* ── 스크롤 리빌 (data-reveal = home / .reveal = 기타 페이지 호환) ── */
[data-reveal],.reveal{opacity:0;transform:translateY(36px);transition:opacity .9s var(--ease-soft),transform .9s var(--ease-soft)}
[data-reveal].in,.reveal.in{opacity:1;transform:none}
[data-reveal-d="1"],.reveal-d1{transition-delay:.08s}
[data-reveal-d="2"],.reveal-d2{transition-delay:.16s}
[data-reveal-d="3"],.reveal-d3{transition-delay:.24s}
[data-reveal-d="4"],.reveal-d4{transition-delay:.32s}
[data-reveal-d="5"],.reveal-d5{transition-delay:.4s}

/* ── 스크롤 진행바 ── */
.scroll-prog{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-2));z-index:900;transition:width .1s linear}

/* ── 반응형 ── */
@media(max-width:980px){
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .mega{min-width:auto}
}
@media(max-width:760px){
  body{font-size:16px}
  .nav-links,.nav-tel{display:none}.burger{display:block}
  .nav-cta .btn{display:none}
  .nav{height:66px}
  .footer-grid{grid-template-columns:1fr;gap:28px}
  .float-cta a{width:52px;height:52px;font-size:1.15rem}
}
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
  [data-reveal]{opacity:1!important;transform:none!important}
}
`;

// ============================================================================
// 인터랙션 JS — 가볍고 안정적인 것만: 스크롤 리빌, 진행바, 헤더 그림자,
// 모바일 메뉴, 카운트업. (외부 라이브러리 의존 제거 — 깨질 일 없음)
// ============================================================================
const INTERACTION_JS = `
(function(){
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 스크롤 진행바
  var prog = document.querySelector('.scroll-prog');
  function onScroll(){
    if(prog){
      var h = document.documentElement;
      var sc = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      prog.style.width = (sc*100) + '%';
    }
    var hdr = document.querySelector('.site-header');
    if(hdr){ hdr.classList.toggle('scrolled', window.scrollY > 8); }
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // 스크롤 리빌 (data-reveal + 기타 페이지의 .reveal 모두 지원)
  var reveals = document.querySelectorAll('[data-reveal], .reveal');
  if(RM){ reveals.forEach(function(el){ el.classList.add('in'); }); }
  else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else { reveals.forEach(function(el){ el.classList.add('in'); }); }

  // 카운트업
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(target*eased) + suffix;
      if(p<1) requestAnimationFrame(step);
    }
    if(RM){ el.textContent = target + suffix; } else { requestAnimationFrame(step); }
  }
  var counts = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    var io2 = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); io2.unobserve(e.target); } });
    }, {threshold:.5});
    counts.forEach(function(el){ io2.observe(el); });
  } else { counts.forEach(animateCount); }

  // 모바일 메뉴
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.mobile-menu');
  var closeBtn = menu && menu.querySelector('.close');
  function closeMenu(){ if(menu){ menu.classList.remove('open'); document.body.style.overflow=''; } }
  if(burger&&menu){ burger.addEventListener('click', function(){ menu.classList.add('open'); document.body.style.overflow='hidden'; }); }
  if(closeBtn){ closeBtn.addEventListener('click', closeMenu); }
  if(menu){ menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); }); }
})();
`;

function megaMenu() {
  return html`
    <div class="mega">
      ${raw(TREATMENTS.map(t => `
        <a href="/treatments/${t.slug}">
          <span class="mi"><i class="fas ${t.icon}"></i></span>
          <span><strong>${t.name}</strong><span>${t.short}</span></span>
        </a>`).join(''))}
    </div>`;
}

function header() {
  return html`
  <header class="site-header">
    <div class="wrap nav">
      <a href="/" class="brand"><span class="logo-mark"><i class="fas fa-tooth"></i></span>${CLINIC.name}</a>
      <ul class="nav-links">
        <li><a href="/mission">병원소개</a></li>
        <li><a href="/doctors">의료진</a></li>
        <li><a href="/treatments">진료안내</a>${megaMenu()}</li>
        <li><a href="/cases">비포&애프터</a></li>
        <li><a href="/faq">자주묻는질문</a></li>
        <li><a href="/directions">오시는길</a></li>
      </ul>
      <div class="nav-cta">
        <a href="tel:${CLINIC.tel}" class="nav-tel"><i class="fas fa-phone" style="font-size:.85em"></i> ${CLINIC.tel}</a>
        <a href="/reservation" class="btn btn-primary">예약 문의</a>
        <button class="burger" aria-label="메뉴 열기"><i class="fas fa-bars"></i></button>
      </div>
    </div>
  </header>
  <div class="mobile-menu">
    <button class="close" aria-label="메뉴 닫기"><i class="fas fa-times"></i></button>
    <a href="/mission">병원소개</a>
    <a href="/doctors">의료진</a>
    <a href="/treatments">진료안내</a>
    ${raw(CORE_TREATMENTS.map(t => `<a href="/treatments/${t.slug}" style="font-size:1.05rem;padding-left:16px;color:var(--inv-soft)">· ${t.name}</a>`).join(''))}
    <a href="/cases">비포&애프터</a>
    <a href="/faq">자주묻는질문</a>
    <a href="/directions">오시는길</a>
    <a href="/reservation">예약 문의</a>
    <a href="tel:${CLINIC.tel}" style="color:var(--gold-2)"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
  </div>`;
}

function footer() {
  return html`
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">${CLINIC.name}</div>
          <p style="font-size:.96rem;color:var(--inv-soft);max-width:320px;line-height:1.8">${CLINIC.slogan}<br>남양주 마석, 한자리에서 지켜온 우리 동네 치과입니다.</p>
          <div class="footer-biz">
            상호 : ${CLINIC.business.company} &nbsp;|&nbsp; 대표자 : ${CLINIC.business.owner}<br>
            주소 : ${CLINIC.address}<br>
            대표전화 : ${CLINIC.tel}<br>
            사업자등록번호 : ${CLINIC.business.bizNo}
          </div>
        </div>
        <div>
          <h4>진료안내</h4>
          ${raw(CORE_TREATMENTS.map(t => `<a href="/treatments/${t.slug}">${t.name}</a>`).join(''))}
          <a href="/treatments">전체 진료 보기</a>
        </div>
        <div>
          <h4>병원안내</h4>
          <a href="/mission">병원소개</a>
          <a href="/doctors">의료진</a>
          <a href="/cases">비포&애프터</a>
          <a href="/faq">자주묻는질문</a>
          <a href="/pricing">비용안내</a>
        </div>
        <div>
          <h4>찾아오시는 길</h4>
          <a href="/directions">${CLINIC.addressShort}</a>
          <a href="tel:${CLINIC.tel}">${CLINIC.tel}</a>
          <a href="/directions">진료시간 안내</a>
          <a href="/reservation">예약 문의</a>
          <a href="/sitemap.xml">사이트맵</a>
        </div>
      </div>
      <div class="compliance">
        <strong style="color:var(--gold-2)">의료광고 준수사항 안내</strong><br>
        본 사이트의 의료 정보는 일반적인 정보 제공을 목적으로 하며, 개인의 상태에 따라 진료 방법과 결과는 차이가 있을 수 있습니다. 모든 의료 행위에는 부작용 및 위험이 따를 수 있으므로, 정확한 진단과 상담은 반드시 내원하여 의료진과 상의하시기 바랍니다. 비급여 진료비용은 병원에 게시된 기준에 따릅니다.
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${CLINIC.name}. All rights reserved.</span>
        <span>개인정보처리방침 · 이용약관</span>
      </div>
    </div>
  </footer>
  <div class="float-cta">
    <a href="tel:${CLINIC.tel}" class="fc-tel" aria-label="전화"><i class="fas fa-phone"></i></a>
    <a href="/directions" class="fc-map" aria-label="오시는길"><i class="fas fa-map-marker-alt"></i></a>
    <a href="/reservation" class="fc-book" aria-label="예약"><i class="fas fa-calendar-check"></i></a>
  </div>`;
}

// ============================================================================
// 메인 레이아웃 래퍼
// ============================================================================
export function Layout(meta: SeoMeta, body: any) {
  const canonical = `${SITE_URL}${meta.path}`;
  const ogImage = meta.ogImage || `${SITE_URL}/static/img/og.png`;
  const jsonLdBlocks = (meta.jsonLd || []).map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('');

  return html`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <link rel="canonical" href="${canonical}">
  ${meta.noindex ? raw('<meta name="robots" content="noindex,nofollow">') : raw('<meta name="robots" content="index,follow,max-image-preview:large">')}
  <meta property="og:type" content="${meta.type || 'website'}">
  <meta property="og:site_name" content="${CLINIC.name}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#3B6B5A">
  <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
  <link rel="apple-touch-icon" href="/static/img/favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <style>${raw(DESIGN_TOKENS)}</style>
  ${raw(jsonLdBlocks)}
</head>
<body>
  <div class="scroll-prog" aria-hidden="true"></div>
  ${header()}
  <main>${body}</main>
  ${footer()}
  <script>${raw(INTERACTION_JS)}</script>
</body>
</html>`;
}
