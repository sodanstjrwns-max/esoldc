import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS } from '../data/clinic';
import { SITE_URL, type SeoMeta } from './seo';

// ============================================================================
// 디자인 토큰 — v5 "Warm Futurism" (따뜻한 미래감)
// 신청서 무드(따뜻·친근·전문·신뢰 / 중장년·전세대) × 2026 트렌드(세이지·어스톤·
// 소프트 글래스모피즘·라운드·넉넉한 여백). 중장년 가독성 최우선(큰 본문/버튼).
// 토큰 이름은 유지(전 페이지 호환), 값만 재매핑:
//   --navy* = 딥 세이지/에버그린(메인)  --gold* = 웜 테라코타(포인트)
// ============================================================================
const DESIGN_TOKENS = `
:root{
  --navy:#2F6B5E;          /* 메인: 딥 세이지/에버그린 (자연·청결·신뢰) */
  --navy-2:#27574C;
  --navy-3:#3C7E70;
  --gold:#D98E63;          /* 포인트: 웜 테라코타 (따뜻·친근) */
  --gold-2:#E8A87C;
  --gold-soft:#F7E7DB;
  --ink:#2A332F;           /* 본문 (웜 그린-그레이) */
  --ink-soft:#5E6862;
  --ink-faint:#909A93;
  --line:#E7E1D6;
  --bg:#FBF8F3;            /* 웜 아이보리 */
  --bg-soft:#F3EFE7;
  --bg-card:#FFFFFF;
  --inv:#FBF8F3;           /* 그린 위 텍스트 */
  --inv-soft:rgba(251,248,243,.78);
  --inv-faint:rgba(251,248,243,.50);
  --radius:14px;           /* 2026: 큼직한 라운드 */
  --radius-lg:24px;
  --radius-pill:999px;
  --shadow-sm:0 4px 18px rgba(47,107,94,.07);
  --shadow:0 18px 44px rgba(47,107,94,.12);
  --shadow-lg:0 34px 80px rgba(47,107,94,.18);
  --shadow-warm:0 20px 50px rgba(217,142,99,.18);
  --glass:rgba(251,248,243,.72);
  --ease:cubic-bezier(.22,.61,.36,1);
  --max:1220px;
  --serif:'Pretendard',sans-serif;  /* 명조 폐기 — 가독성 우선 산세리프 */
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.8;-webkit-font-smoothing:antialiased;overflow-x:hidden;font-size:17px}
h1,h2,h3,h4{font-family:'Pretendard',sans-serif;line-height:1.3;letter-spacing:-.02em;margin:0;font-weight:800;color:var(--navy)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.wrap{max-width:var(--max);margin:0 auto;padding:0 28px}
.eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:.82rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);background:var(--gold-soft);padding:7px 16px;border-radius:var(--radius-pill)}
.eyebrow::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--gold)}

/* 버튼 — 2026: 큼직한 알약형, 큰 글씨(중장년 가독성) */
.btn{display:inline-flex;align-items:center;gap:.6em;padding:17px 38px;border-radius:var(--radius-pill);font-weight:700;font-size:1.05rem;transition:all .35s var(--ease);cursor:pointer;border:2px solid transparent;letter-spacing:-.01em}
.btn-primary{background:var(--navy);color:var(--inv);box-shadow:var(--shadow-sm)}
.btn-primary:hover{background:var(--navy-2);transform:translateY(-2px);box-shadow:var(--shadow)}
.btn-ghost{background:#fff;color:var(--navy);border-color:var(--line)}
.btn-ghost:hover{border-color:var(--navy);transform:translateY(-2px);box-shadow:var(--shadow-sm)}
.btn-gold{background:var(--gold);color:#fff;box-shadow:var(--shadow-warm)}
.btn-gold:hover{background:var(--gold-2);transform:translateY(-2px)}
.btn-line{display:inline-flex;align-items:center;gap:.6em;color:var(--inv);font-weight:700;padding:17px 38px;border-radius:var(--radius-pill);border:2px solid var(--inv-faint);transition:all .35s var(--ease);font-size:1.05rem}
.btn-line:hover{background:var(--inv);color:var(--navy);border-color:var(--inv);transform:translateY(-2px)}
.btn-line.fill{background:var(--gold);border-color:var(--gold);color:#fff}
.btn-line.fill:hover{background:var(--gold-2);border-color:var(--gold-2)}

/* reveal — 절제된 페이드 업 */
.reveal{opacity:0;transform:translateY(26px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.reveal.in{opacity:1;transform:none}
.reveal-d1{transition-delay:.1s}.reveal-d2{transition-delay:.2s}.reveal-d3{transition-delay:.3s}.reveal-d4{transition-delay:.4s}

/* 공통 섹션 */
.section{padding:120px 0}
.section-head{max-width:740px;margin:0 auto 64px;text-align:center}
.section-head h2{font-size:clamp(2.1rem,4.4vw,3.1rem);margin:18px 0 0;line-height:1.25}
.section-head p{color:var(--ink-soft);font-size:1.12rem;margin-top:18px}
.rule{width:46px;height:3px;border-radius:3px;background:var(--gold);margin:0 auto}

/* 헤더 — 소프트 글래스 */
.site-header{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all .4s var(--ease);padding:22px 0}
.site-header.scrolled{background:var(--glass);backdrop-filter:blur(16px) saturate(1.4);box-shadow:0 1px 0 var(--line),var(--shadow-sm);padding:13px 0}
.nav{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:13px;font-weight:800;font-size:1.34rem;color:var(--navy)}
.brand .logo-mark{width:42px;height:42px;border-radius:13px;background:var(--navy);display:grid;place-items:center;color:#fff;font-size:1.1rem;box-shadow:var(--shadow-sm)}
.site-header:not(.scrolled) .brand,.site-header:not(.scrolled) .nav-links>li>a{color:var(--inv)}
.site-header:not(.scrolled) .brand .logo-mark{background:rgba(251,248,243,.16);color:#fff}
.nav-links{display:flex;align-items:center;gap:4px;list-style:none;margin:0;padding:0}
.nav-links>li{position:relative}
.nav-links>li>a{display:block;padding:11px 18px;font-weight:700;font-size:1rem;border-radius:var(--radius-pill);transition:all .25s}
.nav-links>li>a:hover{color:var(--gold)}
.site-header:not(.scrolled) .nav-links>li>a:hover{color:var(--gold-2)}
.mega{position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%) translateY(8px);background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);padding:18px;min-width:540px;opacity:0;visibility:hidden;transition:all .3s var(--ease);display:grid;grid-template-columns:1fr 1fr;gap:6px}
.nav-links>li:hover .mega{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
.mega a{display:flex;gap:14px;align-items:center;padding:14px 16px;border-radius:var(--radius);color:var(--ink);transition:background .2s}
.mega a:hover{background:var(--bg-soft)}
.mega a .mi{width:44px;height:44px;border-radius:13px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;flex:none;font-size:1.1rem}
.mega a strong{display:block;font-size:1rem;font-weight:800;color:var(--navy)}.mega a span{font-size:.82rem;color:var(--ink-soft)}
.nav-cta{display:flex;align-items:center;gap:16px}
.nav-tel{font-weight:800;color:var(--gold);font-size:1.1rem}
.site-header:not(.scrolled) .nav-tel{color:var(--inv)}
.burger{display:none;background:none;border:none;font-size:1.55rem;color:inherit;cursor:pointer}

/* 모바일 메뉴 */
.mobile-menu{position:fixed;inset:0;background:var(--navy);z-index:1100;transform:translateX(100%);transition:transform .5s var(--ease);padding:84px 30px;overflow-y:auto}
.mobile-menu.open{transform:none}
.mobile-menu a{display:block;color:var(--inv);font-size:1.3rem;font-weight:700;padding:16px 0;border-bottom:1px solid rgba(251,248,243,.14)}
.mobile-menu .close{position:absolute;top:26px;right:26px;background:none;border:none;color:var(--inv);font-size:1.8rem;cursor:pointer}

/* 푸터 */
.site-footer{background:var(--navy);color:var(--inv-soft);padding:84px 0 36px}
.site-footer h4{color:var(--inv);font-size:.95rem;letter-spacing:.02em;margin-bottom:20px;font-weight:800}
.footer-grid{display:grid;grid-template-columns:1.7fr 1fr 1fr 1.2fr;gap:48px}
.footer-grid a{color:var(--inv-soft);font-size:.95rem;display:block;padding:6px 0;transition:color .2s}
.footer-grid a:hover{color:var(--gold-2)}
.footer-brand{font-size:1.6rem;font-weight:800;color:var(--inv);margin-bottom:16px}
.footer-biz{font-size:.85rem;color:var(--inv-faint);line-height:2;margin-top:22px}
.footer-bottom{border-top:1px solid rgba(251,248,243,.14);margin-top:52px;padding-top:26px;font-size:.83rem;color:var(--inv-faint);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.compliance{background:rgba(0,0,0,.14);border-radius:var(--radius);padding:18px 22px;font-size:.82rem;color:var(--inv-faint);margin-top:26px;line-height:1.8}

/* 플로팅 CTA — 큼직 */
.float-cta{position:fixed;bottom:26px;right:26px;z-index:900;display:flex;flex-direction:column;gap:12px}
.float-cta a{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:1.4rem;box-shadow:var(--shadow);transition:transform .3s var(--ease)}
.float-cta a:hover{transform:translateY(-3px) scale(1.04)}
.float-cta .fc-tel{background:var(--navy)}.float-cta .fc-map{background:var(--gold)}.float-cta .fc-book{background:var(--navy-3)}

@media(max-width:1024px){
  .nav-links,.nav-tel{display:none}.burger{display:block}
  .nav-cta .btn{display:none}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
}
@media(max-width:640px){
  .wrap{padding:0 20px}.section{padding:76px 0}
  .footer-grid{grid-template-columns:1fr}
  body{font-size:16px}
}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1!important;transform:none!important;transition:none!important}
  html{scroll-behavior:auto}
}
`;

// ============================================================================
// 인터랙션 스크립트 — 절제 (스크롤 reveal / 헤더 / 카운트업 / 모바일 메뉴)
// ============================================================================
const INTERACTION_JS = `
(function(){
  var header=document.querySelector('.site-header');
  function onScroll(){ if(window.scrollY>40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  var co=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; var el=e.target; co.unobserve(el);
      var target=parseFloat(el.dataset.count), suffix=el.dataset.suffix||'', dur=1500, t0=null;
      function step(t){ if(!t0)t0=t; var p=Math.min((t-t0)/dur,1); var ev=1-Math.pow(1-p,3);
        var val=target*ev; el.textContent=(target%1===0?Math.floor(val):val.toFixed(1))+suffix;
        if(p<1)requestAnimationFrame(step);}
      requestAnimationFrame(step);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){co.observe(el)});

  var burger=document.querySelector('.burger'), mm=document.querySelector('.mobile-menu');
  if(burger&&mm){
    burger.addEventListener('click',function(){mm.classList.add('open');document.body.style.overflow='hidden';});
    mm.querySelector('.close').addEventListener('click',function(){mm.classList.remove('open');document.body.style.overflow='';});
    mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mm.classList.remove('open');document.body.style.overflow='';});});
  }
})();
`;

// --- GNB 메가메뉴 ---
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
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="${CLINIC.name}">
  <meta property="og:locale" content="ko_KR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="theme-color" content="#2F6B5E">
  <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
  <link rel="apple-touch-icon" href="/static/img/favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <style>${raw(DESIGN_TOKENS)}</style>
  ${raw(jsonLdBlocks)}
</head>
<body>
  ${header()}
  <main>${body}</main>
  ${footer()}
  <script>${raw(INTERACTION_JS)}</script>
</body>
</html>`;
}

export { DESIGN_TOKENS };
