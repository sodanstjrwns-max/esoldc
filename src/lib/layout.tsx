import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS } from '../data/clinic';
import { SITE_URL, type SeoMeta } from './seo';

// ============================================================================
// 디자인 토큰 — "Soft Organic" (2026 웜 내추럴)
// 방향: 카페 같은 편안함. 따뜻한 크림/베이지 베이스 + 딥 우드 브라운 +
//       살구빛 포인트. 유기적 곡선·넉넉한 여백·큰 본문(중장년 가독성).
// 토큰 이름은 유지(전 페이지 호환), 값만 새 팔레트로 매핑:
//   --navy* = 딥 우드 브라운(메인)  --gold* = 카멜/골드(포인트)
// ============================================================================
const DESIGN_TOKENS = `
:root{
  /* ── 메인: 딥 우드/에스프레소 브라운 (전문·신뢰·고급) ── */
  --navy:#4A382D;
  --navy-2:#36271E;
  --navy-3:#6B5747;
  /* ── 포인트: 따뜻한 카멜/골드 (더 깊고 메탈릭) ── */
  --gold:#A6772F;
  --gold-2:#C99A52;
  --gold-3:#8A5F26;
  --gold-soft:#EFE2C9;
  /* 골드 메탈릭 그라데이션 (텍스트·테두리용) */
  --gold-grad:linear-gradient(135deg,#D9B675 0%,#A6772F 48%,#C99A52 100%);
  --gold-grad-deep:linear-gradient(135deg,#C99A52 0%,#8A5F26 100%);
  /* ── 잉크(텍스트) — 웜 브라운-그레이 (살짝 더 깊게) ── */
  --ink:#2C2620;
  --ink-soft:#615A50;
  --ink-faint:#94897A;
  --line:#E2D8C6;
  --line-soft:#EDE5D6;
  /* ── 배경 — 따뜻한 크림/베이지 (한 톤 가라앉혀 깊이감) ── */
  --bg:#F6EFE2;
  --bg-soft:#EFE6D5;
  --bg-deep:#E6DAC4;
  --bg-card:#FCF8F0;
  /* 미묘한 웜 그라데이션 배경 (플랫 탈피) */
  --bg-grad:radial-gradient(120% 90% at 80% -10%,#FBF6EC 0%,#F6EFE2 42%,#EFE7D6 100%);
  --bg-grad-soft:linear-gradient(180deg,#F1E8D8 0%,#EFE6D4 100%);
  /* ── 그린 위 텍스트 ── */
  --inv:#FAF5EC;
  --inv-soft:rgba(250,245,236,.80);
  --inv-faint:rgba(250,245,236,.52);
  /* ── 라운드 (2026: 크고 부드럽게) ── */
  --radius:12px;
  --radius-lg:18px;
  --radius-xl:24px;
  --radius-pill:999px;
  /* ── 그림자 (부드럽고 따뜻하게) ── */
  --shadow-sm:0 4px 20px rgba(90,70,58,.07);
  --shadow:0 16px 44px rgba(90,70,58,.12);
  --shadow-lg:0 34px 80px rgba(90,70,58,.17);
  --shadow-warm:0 22px 56px rgba(185,138,78,.22);
  --glass:rgba(250,245,236,.78);
  --ease:cubic-bezier(.22,.61,.36,1);
  --ease-soft:cubic-bezier(.4,0,.2,1);
  --max:1280px;
  --display:'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif;
  --serif:'Gowun Batang','Pretendard',serif;
  --grotesk:'Space Grotesk','Pretendard',sans-serif;
  --mono:'Space Grotesk','SF Mono','JetBrains Mono',ui-monospace,monospace;
}
/* ── 2026: 종이 그레인 텍스처 (디지털인데 따뜻한 무드) ── */
.grain{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:.05;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
/* ── 커스텀 커서 (데스크톱 전용) ── */
.cursor-dot{position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;background:var(--gold);z-index:10000;pointer-events:none;transform:translate(-50%,-50%);transition:width .25s var(--ease),height .25s var(--ease),background .25s;mix-blend-mode:normal;will-change:transform}
.cursor-ring{position:fixed;top:0;left:0;width:38px;height:38px;border-radius:50%;border:1.5px solid var(--gold);z-index:10000;pointer-events:none;transform:translate(-50%,-50%);transition:width .3s var(--ease),height .3s var(--ease),border-color .3s,opacity .3s;opacity:.6;will-change:transform}
.cursor-dot.hover{width:0;height:0}
.cursor-ring.hover{width:64px;height:64px;border-color:var(--navy);opacity:.9;background:rgba(185,138,78,.08)}
@media(hover:none),(max-width:900px){.cursor-dot,.cursor-ring{display:none!important}}
*{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{
  margin:0;font-family:var(--display);color:var(--ink);
  background:var(--bg);background-image:var(--bg-grad);background-attachment:fixed;
  line-height:1.78;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  overflow-x:hidden;font-size:17px;letter-spacing:-.01em;
}
h1,h2,h3,h4{font-family:var(--display);line-height:1.18;letter-spacing:-.045em;margin:0;font-weight:800;color:var(--navy);word-break:keep-all}
h1{font-weight:860;letter-spacing:-.05em}
h2{font-weight:820;letter-spacing:-.048em}
h3,h4{font-weight:700;letter-spacing:-.035em}
::selection{background:var(--navy);color:var(--bg)}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
section{position:relative}

/* ── eyebrow (미니멀 모노 라벨 — 2026 에디토리얼) ── */
.eyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.72rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);background:none;padding:0}
.eyebrow::before{content:'';width:24px;height:1.5px;border-radius:2px;background:var(--gold-grad);opacity:.95}
/* ── 섹션 모노 라벨 (번호 + 텍스트) ── */
.mono-lbl{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.mono-lbl .num{color:var(--ink-faint)}
.mono-lbl::before{content:'';width:24px;height:1.5px;background:var(--gold-grad);opacity:.95}

/* ── 버튼 (2026: 살짝 각진 라운드 + 정교한 호버) ── */
.btn{position:relative;display:inline-flex;align-items:center;gap:.6em;padding:15px 30px;border-radius:12px;font-weight:700;font-size:1.01rem;transition:transform .4s var(--ease),box-shadow .4s var(--ease),background .35s var(--ease),border-color .35s;cursor:pointer;border:1.5px solid transparent;letter-spacing:-.01em;font-family:var(--display);overflow:hidden}
.btn i{transition:transform .35s var(--ease)}
.btn:hover i.fa-arrow-right{transform:translateX(4px)}
.btn-primary{background:var(--navy);color:var(--inv);box-shadow:var(--shadow-sm)}
.btn-primary:hover{background:var(--navy-2);transform:translateY(-3px);box-shadow:var(--shadow)}
.btn-accent{background:var(--gold-grad);background-size:160% 160%;background-position:0% 50%;color:#fff;box-shadow:0 10px 28px rgba(138,95,38,.32);transition:transform .4s var(--ease),box-shadow .4s var(--ease),background-position .6s var(--ease)}
.btn-accent:hover{background-position:100% 50%;transform:translateY(-3px);box-shadow:0 16px 40px rgba(138,95,38,.42)}
/* ── 메탈릭 골드 그라데이션 텍스트 ── */
.gold-text{background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.btn-ghost{background:transparent;color:var(--navy);border-color:var(--line)}
.btn-ghost:hover{border-color:var(--navy);background:var(--bg-card);transform:translateY(-3px);box-shadow:var(--shadow-sm)}
.btn-line{display:inline-flex;align-items:center;gap:.6em;color:var(--inv);font-weight:700;padding:15px 30px;border-radius:12px;border:1.5px solid var(--inv-faint);transition:all .4s var(--ease);font-size:1.01rem}
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
.site-footer{background:linear-gradient(160deg,#52402F 0%,var(--navy) 38%,var(--navy-2) 100%);color:var(--inv);padding:80px 0 36px;margin-top:60px;position:relative;overflow:hidden}
.site-footer::before{content:'';position:absolute;top:-120px;right:-80px;width:440px;height:440px;border-radius:50%;background:radial-gradient(circle,rgba(201,154,82,.28),transparent 68%)}
.site-footer::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,154,82,.5),transparent)}
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

/* ── 스크롤 리빌 (data-reveal = home / .reveal = 기타 페이지 호환) ── */
[data-reveal],.reveal{opacity:0;transform:translateY(36px);transition:opacity .9s var(--ease-soft),transform .9s var(--ease-soft)}
[data-reveal].in,.reveal.in{opacity:1;transform:none}
[data-reveal-d="1"],.reveal-d1{transition-delay:.08s}
[data-reveal-d="2"],.reveal-d2{transition-delay:.16s}
[data-reveal-d="3"],.reveal-d3{transition-delay:.24s}
[data-reveal-d="4"],.reveal-d4{transition-delay:.32s}
[data-reveal-d="5"],.reveal-d5{transition-delay:.4s}

/* ── 라인 마스크 reveal (디스플레이 타이포 등장 — 2026) ── */
[data-line]{overflow:hidden;padding-bottom:.16em;padding-top:.04em}
[data-line] > *{display:block;transform:translateY(110%);transition:transform 1s var(--ease)}
[data-line].line-in > *{transform:translateY(0)}
/* reveal 종료 후 overflow 해제 → 세리프 받침·이탤릭 꼬리 잘림 방지 */
[data-line].line-in{overflow:visible;transition:overflow 0s linear .9s}
[data-line][data-line-d="1"] > *{transition-delay:.1s}
[data-line][data-line-d="2"] > *{transition-delay:.22s}

/* ── 스크롤 진행바 ── */
.scroll-prog{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-2));z-index:900;transition:width .1s linear}

/* ── 마퀴 (무한 흐르는 텍스트 띠 — 2026 에디토리얼 리듬) ── */
.marquee{overflow:hidden;white-space:nowrap;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--bg-grad-soft);padding:22px 0}
.marquee-track{display:inline-flex;align-items:center;gap:0;animation:marquee 38s linear infinite;will-change:transform}
.marquee:hover .marquee-track{animation-play-state:paused}
.marquee-item{font-family:var(--serif);font-size:clamp(1.5rem,3vw,2.4rem);font-weight:700;color:var(--navy);letter-spacing:-.02em;padding:0 26px;display:inline-flex;align-items:center;gap:26px}
.marquee-item::after{content:'';width:9px;height:9px;border-radius:50%;background:var(--gold);flex:none}
.marquee.invert{background:var(--navy);border-color:transparent}
.marquee.invert .marquee-item{color:var(--inv)}
.marquee.invert .marquee-item::after{background:var(--gold-2)}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.marquee.reverse .marquee-track{animation-direction:reverse}
@media(prefers-reduced-motion:reduce){.marquee-track{animation:none}}

/* ── 2026 강화: 거대 고스트 폴리오 넘버 (섹션 인덱스) ── */
.sec{overflow:hidden}
.folio{position:relative}
.folio-num{position:absolute;top:-.34em;right:-.02em;font-family:var(--grotesk);font-weight:700;font-size:clamp(9rem,24vw,22rem);line-height:.8;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1.4px var(--line);text-stroke:1.4px var(--line);pointer-events:none;z-index:0;user-select:none;opacity:.9}
.folio > *{position:relative;z-index:1}
.why .folio-num{-webkit-text-stroke-color:rgba(250,245,236,.16);text-stroke:1.4px rgba(250,245,236,.16)}
@media(max-width:760px){.folio-num{font-size:38vw;top:-.2em;right:-.04em;opacity:.7}}

/* ── 2026 강화: 아웃라인(스트로크) 디스플레이 텍스트 ── */
.t-stroke{color:transparent;-webkit-text-stroke:1.6px var(--navy);text-stroke:1.6px var(--navy)}
.why .t-stroke,.cta-box .t-stroke{-webkit-text-stroke-color:var(--inv);text-stroke:1.6px var(--inv)}

/* ── 2026 강화: 세로 키커 (러닝 사이드 라벨) ── */
.kicker-v{position:absolute;left:-2px;top:0;writing-mode:vertical-rl;font-family:var(--mono);font-size:.7rem;font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:var(--ink-faint);opacity:.7;pointer-events:none}
@media(max-width:980px){.kicker-v{display:none}}

/* ── 2026 강화: 단어 단위 캐스케이드 (히어로) ── */
[data-words]{overflow:hidden}
[data-words] .w{display:inline-block;overflow:hidden;vertical-align:top}
[data-words] .w > span{display:inline-block;transform:translateY(110%);transition:transform .95s var(--ease)}
[data-words].words-in .w > span{transform:translateY(0)}

/* ── FABLE: 스크럽 텍스트 (스크롤하면 문장이 '읽히듯' 차오름) ── */
[data-scrub] .sw{color:var(--ink-faint);transition:color .35s var(--ease-soft)}
[data-scrub] .sw.on{color:var(--ink)}
.why [data-scrub] .sw,.cta-box [data-scrub] .sw{color:var(--inv-faint)}
.why [data-scrub] .sw.on,.cta-box [data-scrub] .sw.on{color:var(--inv)}

/* ── FABLE: 챕터 라벨 (서사 구조) ── */
.chapter-lbl{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.chapter-lbl .ch-no{font-family:var(--serif);font-weight:700;font-size:1.05rem;color:var(--gold);letter-spacing:.02em;white-space:nowrap}
.chapter-lbl .ch-line{flex:none;width:42px;height:1.5px;background:var(--gold-grad)}
.chapter-lbl .ch-name{font-family:var(--mono);font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint)}
.why .chapter-lbl .ch-name{color:var(--inv-faint)}

/* ── FABLE: 브릿지 (챕터 사이 서사 연결 문장) ── */
.bridge{text-align:center;padding:84px 24px 10px;position:relative}
.bridge::before{content:'';display:block;width:1.5px;height:56px;margin:0 auto 30px;background:linear-gradient(to bottom,transparent,var(--gold));transform:scaleY(0);transform-origin:top;transition:transform 1.1s var(--ease) .1s}
.bridge.in::before{transform:scaleY(1)}
.bridge p{font-family:var(--serif);font-weight:700;font-size:clamp(1.25rem,2.6vw,1.8rem);color:var(--navy);letter-spacing:-.03em;line-height:1.5;margin:0;word-break:keep-all}
.bridge p em{font-style:normal;background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.bridge .bridge-pg{display:block;margin-top:14px;font-family:var(--mono);font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint)}

/* ── FABLE: 스토리 레일 (좌측 고정 챕터 내비) ── */
.story-rail{position:fixed;left:26px;top:50%;transform:translateY(-50%);z-index:600;display:flex;flex-direction:column;gap:4px}
.story-rail a{display:flex;align-items:center;gap:10px;padding:5px 0;color:var(--ink-faint);transition:color .3s}
.story-rail .sr-dot{width:7px;height:7px;border-radius:50%;background:var(--line);border:1.5px solid transparent;transition:all .35s var(--ease);flex:none}
.story-rail .sr-lbl{font-family:var(--mono);font-size:.62rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;opacity:0;transform:translateX(-6px);transition:all .35s var(--ease);white-space:nowrap;background:var(--glass);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:3px 9px;border-radius:6px;border:1px solid var(--line-soft)}
.story-rail a:hover .sr-lbl{opacity:1;transform:translateX(0)}
.story-rail a.active{color:var(--gold)}
.story-rail a.active .sr-dot{background:var(--gold);box-shadow:0 0 0 4px rgba(166,119,47,.16);transform:scale(1.25)}
@media(max-width:1180px){.story-rail{display:none}}

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
  [data-words] .w > span{transform:none!important}
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

  // 커스텀 커서 (데스크톱·포인터 정밀 기기 전용, reduced-motion 제외)
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine && !RM){
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if(dot && ring){
      var mx=window.innerWidth/2, my=window.innerHeight/2, rx=mx, ry=my;
      window.addEventListener('mousemove', function(e){
        mx=e.clientX; my=e.clientY;
        dot.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
      }, {passive:true});
      (function loop(){
        rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
        ring.style.transform='translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      // 호버 가능한 요소 위에서 커서 확대
      document.querySelectorAll('a,button,.core-card,.equip-card,.geo-chips a,[data-cursor]').forEach(function(el){
        el.addEventListener('mouseenter', function(){ dot.classList.add('hover'); ring.classList.add('hover'); });
        el.addEventListener('mouseleave', function(){ dot.classList.remove('hover'); ring.classList.remove('hover'); });
      });
    }
  }

  // 마우스 패럴랙스 (data-parallax 요소를 마우스 방향으로 미세 이동)
  if(fine && !RM){
    var pxEls = document.querySelectorAll('[data-parallax]');
    if(pxEls.length){
      window.addEventListener('mousemove', function(e){
        var nx = (e.clientX/window.innerWidth - .5);
        var ny = (e.clientY/window.innerHeight - .5);
        pxEls.forEach(function(el){
          var s = parseFloat(el.getAttribute('data-parallax')) || 14;
          el.style.transform = 'translate('+(nx*s)+'px,'+(ny*s)+'px)';
        });
      }, {passive:true});
    }
  }

  // 스크롤 기반 텍스트 마스크 reveal (data-line: 단어 단위 슬라이드업)
  if(!RM && 'IntersectionObserver' in window){
    var lineEls = document.querySelectorAll('[data-line]');
    var io3 = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('line-in'); io3.unobserve(e.target); } });
    }, {threshold:.3});
    lineEls.forEach(function(el){ io3.observe(el); });
  } else {
    document.querySelectorAll('[data-line]').forEach(function(el){ el.classList.add('line-in'); });
  }

  // 단어 단위 캐스케이드 (data-words: 공백 기준 분할 후 순차 슬라이드업)
  var wordEls = document.querySelectorAll('[data-words]');
  wordEls.forEach(function(el){
    if(el.getAttribute('data-split') === '1') return;
    el.setAttribute('data-split','1');
    var parts = el.textContent.split(/(\\s+)/);
    el.textContent = '';
    var i = 0;
    parts.forEach(function(p){
      if(/^\\s+$/.test(p)){ el.appendChild(document.createTextNode(' ')); return; }
      if(!p) return;
      var w = document.createElement('span'); w.className='w';
      var inner = document.createElement('span');
      inner.textContent = p;
      inner.style.transitionDelay = (0.06 + i*0.07) + 's';
      w.appendChild(inner); el.appendChild(w); i++;
    });
  });
  if(RM){ wordEls.forEach(function(el){ el.classList.add('words-in'); }); }
  else if('IntersectionObserver' in window){
    var io4 = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('words-in'); io4.unobserve(e.target); } });
    }, {threshold:.4});
    wordEls.forEach(function(el){ io4.observe(el); });
  } else { wordEls.forEach(function(el){ el.classList.add('words-in'); }); }

  // FABLE: 스크럽 텍스트 (스크롤 진행도에 따라 단어가 '읽히듯' 차오름)
  var scrubEls = document.querySelectorAll('[data-scrub]');
  scrubEls.forEach(function(el){
    if(el.getAttribute('data-scrub-split') === '1') return;
    el.setAttribute('data-scrub-split','1');
    var parts = el.textContent.split(/(\\s+)/);
    el.textContent = '';
    parts.forEach(function(p){
      if(/^\\s+$/.test(p)){ el.appendChild(document.createTextNode(' ')); return; }
      if(!p) return;
      var s = document.createElement('span'); s.className='sw'; s.textContent = p;
      el.appendChild(s);
    });
  });
  if(RM){
    scrubEls.forEach(function(el){ el.querySelectorAll('.sw').forEach(function(s){ s.classList.add('on'); }); });
  } else if(scrubEls.length){
    var scrubTick = false;
    function scrubUpdate(){
      scrubTick = false;
      var vh = window.innerHeight;
      scrubEls.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top > vh || r.bottom < 0) return;
        var p = (vh*0.82 - r.top) / (vh*0.52);
        p = Math.max(0, Math.min(1, p));
        var ws = el.querySelectorAll('.sw');
        var n = Math.round(ws.length * p);
        ws.forEach(function(s,i){ s.classList.toggle('on', i < n); });
      });
    }
    window.addEventListener('scroll', function(){
      if(!scrubTick){ scrubTick = true; requestAnimationFrame(scrubUpdate); }
    }, {passive:true});
    scrubUpdate();
  }

  // FABLE: 스토리 레일 (현재 읽고 있는 챕터 표시)
  var rail = document.querySelector('.story-rail');
  if(rail && 'IntersectionObserver' in window){
    var links = rail.querySelectorAll('a');
    var map = {};
    links.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
    var ioR = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(a){ a.classList.remove('active'); });
          var a = map[e.target.id]; if(a) a.classList.add('active');
        }
      });
    }, {rootMargin:'-38% 0px -54% 0px'});
    Object.keys(map).forEach(function(id){
      var sec = document.getElementById(id); if(sec) ioR.observe(sec);
    });
  }

  // 스크롤 속도 반응형 마퀴 (스크롤 시 잠깐 가속 — 에디토리얼 리듬)
  if(!RM){
    var tracks = document.querySelectorAll('.marquee-track');
    if(tracks.length){
      var lastY = window.scrollY, boost = 0, ticking = false;
      function applyBoost(){
        var dur = Math.max(8, 38 - boost*30);
        tracks.forEach(function(t){ t.style.animationDuration = dur + 's'; });
        boost *= 0.9;
        if(boost > 0.01){ requestAnimationFrame(applyBoost); }
        else { tracks.forEach(function(t){ t.style.animationDuration = '38s'; }); ticking = false; }
      }
      window.addEventListener('scroll', function(){
        var dy = Math.abs(window.scrollY - lastY); lastY = window.scrollY;
        boost = Math.min(1, boost + dy/900);
        if(!ticking){ ticking = true; requestAnimationFrame(applyBoost); }
      }, {passive:true});
    }
  }
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
  <meta name="theme-color" content="#5A463A">
  <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg">
  <link rel="apple-touch-icon" href="/static/img/favicon.svg">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css">
  <style>${raw(DESIGN_TOKENS)}</style>
  ${raw(jsonLdBlocks)}
</head>
<body>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor-ring" aria-hidden="true"></div>
  <div class="cursor-dot" aria-hidden="true"></div>
  <div class="scroll-prog" aria-hidden="true"></div>
  ${meta.path === '/' ? raw(`
  <nav class="story-rail" aria-label="페이지 챕터">
    <a href="#ch-hero" class="active"><span class="sr-dot"></span><span class="sr-lbl">Prologue</span></a>
    <a href="#ch-story"><span class="sr-dot"></span><span class="sr-lbl">Ch.1 우리 이야기</span></a>
    <a href="#ch-core"><span class="sr-dot"></span><span class="sr-lbl">Ch.2 세 가지</span></a>
    <a href="#ch-why"><span class="sr-dot"></span><span class="sr-lbl">Ch.3 이유</span></a>
    <a href="#ch-all"><span class="sr-dot"></span><span class="sr-lbl">Ch.4 온 가족</span></a>
    <a href="#ch-equip"><span class="sr-dot"></span><span class="sr-lbl">Ch.5 장비</span></a>
    <a href="#ch-team"><span class="sr-dot"></span><span class="sr-lbl">Ch.6 의료진</span></a>
    <a href="#ch-end"><span class="sr-dot"></span><span class="sr-lbl">Epilogue</span></a>
  </nav>`) : ''}
  ${header()}
  <main>${body}</main>
  ${footer()}
  <script>${raw(INTERACTION_JS)}</script>
</body>
</html>`;
}
