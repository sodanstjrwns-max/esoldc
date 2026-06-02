import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS } from '../data/clinic';
import { SITE_URL, type SeoMeta } from './seo';

// ============================================================================
// 디자인 토큰 (§C-3) — 이솔치과 전용 팔레트
// 무드: 따뜻하고 친근 + 전문/신뢰 → 딥 틸-그린 + 웜 샌드 베이지
// ============================================================================
const DESIGN_TOKENS = `
:root{
  --brand:#1f5e57;            /* 딥 틸-그린: 신뢰·전문 */
  --brand-dark:#143e39;
  --brand-light:#2f8077;
  --brand-soft:#e8f0ee;
  --accent:#c9a86a;           /* 웜 샌드 골드: 따뜻함·프리미엄 */
  --accent-soft:#f3ead8;
  --ink:#1a201f;              /* 본문 텍스트 */
  --ink-soft:#5a635f;
  --line:#e4e8e6;
  --bg:#ffffff;
  --bg-soft:#f7f9f8;
  --bg-cream:#faf7f0;
  --ink-inv:#f4f1e9;          /* 다크 섹션 텍스트 */
  --bg-ink:#0c1413;           /* 시네마틱 잉크 블랙(틸 기운) */
  --bg-ink-2:#0f1c1a;
  --radius:18px;
  --radius-lg:28px;
  --shadow-sm:0 2px 12px rgba(20,62,57,.06);
  --shadow:0 12px 40px rgba(20,62,57,.10);
  --shadow-lg:0 30px 80px rgba(20,62,57,.16);
  --ease:cubic-bezier(.16,1,.3,1);
  --ease-kinetic:cubic-bezier(.22,1,.36,1);
  --max:1240px;
  --serif:'Playfair Display',ui-serif,Georgia,serif;  /* 에디토리얼 대비 폰트 */
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:var(--ink);background:var(--bg);line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}
h1,h2,h3,h4{font-family:'Pretendard',sans-serif;line-height:1.18;letter-spacing:-.02em;margin:0;font-weight:800}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
.eyebrow{font-size:.8rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--brand-light)}
.btn{display:inline-flex;align-items:center;gap:.5em;padding:14px 28px;border-radius:999px;font-weight:700;font-size:.95rem;transition:all .4s var(--ease);cursor:pointer;border:none}
.btn-primary{background:var(--brand);color:#fff;box-shadow:var(--shadow-sm)}
.btn-primary:hover{background:var(--brand-dark);transform:translateY(-3px);box-shadow:var(--shadow)}
.btn-ghost{background:transparent;color:var(--brand);border:1.5px solid var(--brand)}
.btn-ghost:hover{background:var(--brand);color:#fff;transform:translateY(-3px)}
.btn-gold{background:var(--accent);color:#2a2310}
.btn-gold:hover{background:#b8975a;transform:translateY(-3px);box-shadow:var(--shadow)}

/* reveal 애니메이션 (Intersection Observer) */
.reveal{opacity:0;transform:translateY(38px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.reveal.in{opacity:1;transform:none}
.reveal-d1{transition-delay:.08s}.reveal-d2{transition-delay:.16s}.reveal-d3{transition-delay:.24s}.reveal-d4{transition-delay:.32s}

/* ===== 2026 KINETIC SYSTEM ===== */
/* 글자 단위 reveal (마스크 슬라이드 업) */
.kinetic{display:inline-block}
.kinetic .ln{display:block;overflow:hidden;padding-bottom:.06em}
.kinetic .ln>span{display:inline-block;transform:translateY(110%) rotate(2deg);transition:transform 1s var(--ease-kinetic)}
.kinetic.in .ln>span{transform:none}
.kinetic .ln:nth-child(2)>span{transition-delay:.09s}
.kinetic .ln:nth-child(3)>span{transition-delay:.18s}
.kinetic .ln:nth-child(4)>span{transition-delay:.27s}
/* 단어 단위 stagger */
.words .w{display:inline-block;opacity:0;transform:translateY(40%);transition:opacity .7s var(--ease-kinetic),transform .7s var(--ease-kinetic)}
.words.in .w{opacity:1;transform:none}
/* 스크롤로 채워지는 텍스트 */
.fill-text{background:linear-gradient(90deg,currentColor 0 var(--fill,0%),color-mix(in srgb,currentColor 22%,transparent) var(--fill,0%) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;transition:none}
/* 커스텀 커서 */
.cursor-dot,.cursor-ring{position:fixed;top:0;left:0;border-radius:50%;pointer-events:none;z-index:9999;mix-blend-mode:difference}
.cursor-dot{width:7px;height:7px;background:#fff;transform:translate(-50%,-50%)}
.cursor-ring{width:40px;height:40px;border:1.5px solid rgba(255,255,255,.6);transform:translate(-50%,-50%);transition:width .3s var(--ease),height .3s var(--ease),background .3s,border-color .3s}
.cursor-ring.hover{width:64px;height:64px;background:rgba(255,255,255,.12);border-color:transparent}
body.has-cursor,body.has-cursor *{cursor:none!important}
/* 마그네틱 */
.magnetic{transition:transform .35s var(--ease-kinetic)}
/* 에디토리얼 인덱스 번호 */
.idx-num{font-family:var(--serif);font-style:italic;font-weight:500;line-height:.8;color:var(--accent)}
.grain{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.04;mix-blend-mode:overlay}
@media(prefers-reduced-motion:reduce){.reveal,.kinetic .ln>span,.words .w{opacity:1!important;transform:none!important;transition:none!important}html{scroll-behavior:auto}.cursor-dot,.cursor-ring,.grain{display:none}body.has-cursor,body.has-cursor *{cursor:auto!important}}
@media(hover:none){.cursor-dot,.cursor-ring{display:none}body.has-cursor,body.has-cursor *{cursor:auto!important}}

/* 헤더 */
.site-header{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all .4s var(--ease);padding:18px 0}
.site-header.scrolled{background:rgba(255,255,255,.92);backdrop-filter:blur(16px);box-shadow:0 1px 0 var(--line);padding:12px 0}
.nav{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:12px;font-weight:800;font-size:1.3rem;color:var(--brand)}
.brand .logo-mark{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--brand),var(--brand-light));display:grid;place-items:center;color:#fff;font-size:1rem}
.site-header:not(.scrolled) .brand,.site-header:not(.scrolled) .nav-links>li>a{color:#fff}
.site-header:not(.scrolled) .brand .logo-mark{background:rgba(255,255,255,.18);backdrop-filter:blur(6px)}
.nav-links{display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0}
.nav-links>li{position:relative}
.nav-links>li>a{display:block;padding:10px 16px;font-weight:600;font-size:.96rem;border-radius:10px;transition:all .3s var(--ease)}
.nav-links>li>a:hover{color:var(--brand-light)}
.site-header:not(.scrolled) .nav-links>li>a:hover{color:var(--accent)}
.mega{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(10px);background:#fff;border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:22px;min-width:520px;opacity:0;visibility:hidden;transition:all .35s var(--ease);display:grid;grid-template-columns:1fr 1fr;gap:6px}
.nav-links>li:hover .mega{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
.mega a{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:12px;color:var(--ink);transition:all .25s var(--ease)}
.mega a:hover{background:var(--brand-soft)}
.mega a .mi{width:38px;height:38px;border-radius:10px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;flex:none}
.mega a strong{display:block;font-size:.95rem}.mega a span{font-size:.78rem;color:var(--ink-soft)}
.nav-cta{display:flex;align-items:center;gap:10px}
.nav-tel{font-weight:800;color:var(--accent);font-size:1.05rem}
.site-header.scrolled .nav-tel{color:var(--brand)}
.burger{display:none;background:none;border:none;font-size:1.5rem;color:inherit;cursor:pointer}

/* 모바일 메뉴 */
.mobile-menu{position:fixed;inset:0;background:var(--brand-dark);z-index:1100;transform:translateX(100%);transition:transform .5s var(--ease);padding:80px 28px;overflow-y:auto}
.mobile-menu.open{transform:none}
.mobile-menu a{display:block;color:#fff;font-size:1.3rem;font-weight:700;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.1)}
.mobile-menu .close{position:absolute;top:24px;right:24px;background:none;border:none;color:#fff;font-size:1.8rem;cursor:pointer}

/* 푸터 */
.site-footer{background:var(--brand-dark);color:#cdd9d6;padding:72px 0 32px}
.site-footer h4{color:#fff;font-size:1rem;margin-bottom:18px}
.footer-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1.2fr;gap:40px}
.footer-grid a{color:#cdd9d6;font-size:.9rem;display:block;padding:5px 0;transition:color .2s}
.footer-grid a:hover{color:var(--accent)}
.footer-brand{font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:14px}
.footer-biz{font-size:.82rem;color:#8fa39e;line-height:1.9;margin-top:20px}
.footer-bottom{border-top:1px solid rgba(255,255,255,.1);margin-top:48px;padding-top:24px;font-size:.8rem;color:#8fa39e;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
.compliance{background:rgba(0,0,0,.2);border-radius:12px;padding:16px 20px;font-size:.78rem;color:#9db0ac;margin-top:24px;line-height:1.7}

/* 플로팅 CTA */
.float-cta{position:fixed;bottom:24px;right:24px;z-index:900;display:flex;flex-direction:column;gap:10px}
.float-cta a{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:1.4rem;box-shadow:var(--shadow);transition:all .3s var(--ease)}
.float-cta a:hover{transform:scale(1.1)}
.float-cta .fc-tel{background:var(--brand)}.float-cta .fc-map{background:var(--accent);color:#2a2310}.float-cta .fc-book{background:var(--brand-dark)}

/* 공통 섹션 */
.section{padding:110px 0}
.section-head{text-align:center;max-width:680px;margin:0 auto 60px}
.section-head h2{font-size:clamp(1.9rem,4vw,2.8rem);margin:14px 0}
.section-head p{color:var(--ink-soft);font-size:1.05rem}
.kicker-line{width:46px;height:3px;background:var(--accent);margin:0 auto 18px;border-radius:2px}

@media(max-width:1024px){
  .nav-links,.nav-tel{display:none}.burger{display:block}
  .nav-cta .btn{display:none}
  .footer-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:640px){
  .wrap{padding:0 18px}.section{padding:72px 0}
  .footer-grid{grid-template-columns:1fr}
}
`;

// ============================================================================
// 인터랙션 스크립트 (스크롤 reveal / 헤더 / 카운트업 / 모바일 메뉴)
// ============================================================================
const INTERACTION_JS = `
(function(){
  // 헤더 스크롤
  var header=document.querySelector('.site-header');
  function onScroll(){ if(window.scrollY>40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // reveal
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  // 카운트업
  var co=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return; var el=e.target; co.unobserve(el);
      var target=parseFloat(el.dataset.count), suffix=el.dataset.suffix||'', dur=1600, t0=null;
      function step(t){ if(!t0)t0=t; var p=Math.min((t-t0)/dur,1); var ev=1-Math.pow(1-p,3);
        var val=target*ev; el.textContent=(target%1===0?Math.floor(val):val.toFixed(1))+suffix;
        if(p<1)requestAnimationFrame(step);}
      requestAnimationFrame(step);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){co.observe(el)});

  // 모바일 메뉴
  var burger=document.querySelector('.burger'), mm=document.querySelector('.mobile-menu');
  if(burger&&mm){
    burger.addEventListener('click',function(){mm.classList.add('open');document.body.style.overflow='hidden';});
    mm.querySelector('.close').addEventListener('click',function(){mm.classList.remove('open');document.body.style.overflow='';});
    mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mm.classList.remove('open');document.body.style.overflow='';});});
  }

  // 패럴랙스 (data-parallax)
  var px=document.querySelectorAll('[data-parallax]');
  if(px.length){ window.addEventListener('scroll',function(){var y=window.scrollY;
    px.forEach(function(el){var s=parseFloat(el.dataset.parallax)||.2; el.style.transform='translate3d(0,'+(y*s)+'px,0)';});
  },{passive:true});}

  var reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // ===== 커스텀 커서 + 마그네틱 =====
  if(fine && !reduced){
    var dot=document.createElement('div'); dot.className='cursor-dot';
    var ring=document.createElement('div'); ring.className='cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.body.classList.add('has-cursor');
    var mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
    window.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px';},{passive:true});
    (function loop(){rx+=(mx-rx)*.18;ry+=(my-ry)*.18;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
    document.querySelectorAll('a,button,[data-cursor]').forEach(function(el){
      el.addEventListener('mouseenter',function(){ring.classList.add('hover');});
      el.addEventListener('mouseleave',function(){ring.classList.remove('hover');});
    });
    // 마그네틱 버튼
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();
        var dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
        el.style.transform='translate('+dx*.3+'px,'+dy*.4+'px)';});
      el.addEventListener('mouseleave',function(){el.style.transform='';});
    });
  }

  // ===== 키네틱 텍스트 자동 분할 (data-kinetic: 줄 / data-words: 단어) =====
  document.querySelectorAll('[data-kinetic]').forEach(function(el){
    var lines=el.innerHTML.split(/<br\\s*\\/?>(?![^<]*>)/i);
    el.classList.add('kinetic');
    el.innerHTML=lines.map(function(l){return '<span class="ln"><span>'+l+'</span></span>';}).join('');
  });
  document.querySelectorAll('[data-words]').forEach(function(el){
    el.classList.add('words');
    el.innerHTML=el.textContent.split(' ').map(function(w,i){
      return '<span class="w" style="transition-delay:'+(i*.04)+'s">'+w+'</span>';
    }).join(' ');
  });
  var ko=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ko.unobserve(e.target);}});},{threshold:.3});
  document.querySelectorAll('.kinetic,.words').forEach(function(el){ko.observe(el);});

  // ===== 스크롤로 채워지는 fill-text =====
  var ft=document.querySelectorAll('.fill-text');
  if(ft.length && !reduced){
    function onFill(){ft.forEach(function(el){var r=el.getBoundingClientRect();
      var p=1-(r.top-innerHeight*.2)/(innerHeight*.55);p=Math.max(0,Math.min(1,p));
      el.style.setProperty('--fill',(p*100).toFixed(1)+'%');});}
    window.addEventListener('scroll',onFill,{passive:true});onFill();
  } else { ft.forEach(function(el){el.style.setProperty('--fill','100%');}); }
})();
`;

// --- GNB 메가메뉴 데이터 ---
function megaMenu() {
  return html`
    <div class="mega">
      ${raw(TREATMENTS.map(t => `
        <a href="/treatments/${t.slug}">
          <span class="mi"><i class="fas ${t.icon}"></i></span>
          <span><strong>${t.name}${t.isCore ? ' ⭐' : ''}</strong><span>${t.short}</span></span>
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
        <a href="tel:${CLINIC.tel}" class="nav-tel"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
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
    ${raw(CORE_TREATMENTS.map(t => `<a href="/treatments/${t.slug}" style="font-size:1rem;padding-left:16px;color:#a8c4bf">· ${t.name}</a>`).join(''))}
    <a href="/cases">비포&애프터</a>
    <a href="/faq">자주묻는질문</a>
    <a href="/directions">오시는길</a>
    <a href="/reservation">예약 문의</a>
    <a href="tel:${CLINIC.tel}" style="color:var(--accent)"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
  </div>`;
}

function footer() {
  return html`
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">${CLINIC.name}</div>
          <p style="font-size:.9rem;color:#a8c4bf;max-width:300px">${CLINIC.slogan}<br>남양주 마석, 15년을 함께한 우리 동네 치과입니다.</p>
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
        <strong style="color:#b8cbc7">의료광고 준수사항 안내</strong><br>
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
  <meta name="theme-color" content="#1f5e57">
  <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
  <link rel="apple-touch-icon" href="/static/img/favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <style>${raw(DESIGN_TOKENS)}</style>
  ${raw(jsonLdBlocks)}
</head>
<body>
  <svg class="grain"><filter id="gn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/></filter><rect width="100%" height="100%" filter="url(#gn)"/></svg>
  ${header()}
  <main>${body}</main>
  ${footer()}
  <script>${raw(INTERACTION_JS)}</script>
</body>
</html>`;
}

export { DESIGN_TOKENS };
