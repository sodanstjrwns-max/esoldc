import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

// ── VMG: 챕터 사이 오너먼트 (책의 장 구분 장식 — 양쪽 곡선이 펜으로 그려지고 중앙 다이아몬드가 피어남) ──
const BRIDGE_ORN = `
<svg class="vmg bridge-orn" viewBox="0 0 132 60" fill="none" aria-hidden="true">
  <path class="vp" pathLength="1" d="M4 40 C 30 40, 40 22, 60 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path class="vp vp2" pathLength="1" d="M72 22 C 92 22, 102 40, 128 40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path class="vfill" d="M66 12 L70.5 21 L66 30 L61.5 21 Z" fill="currentColor"/>
</svg>`;

// ── VMG: 4점 반짝이 스파크 ──
const SPARK = (cls: string) => `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0 L14.4 9.6 L24 12 L14.4 14.4 L12 24 L9.6 14.4 L0 12 L9.6 9.6 Z"/></svg>`;

export function HomePage() {
  return html`
  <style>
    /* ====================== HERO v7 "Book Cover" (페이블: 책의 표지) ====================== */
    .hero{min-height:94vh;display:flex;flex-direction:column;justify-content:flex-start;padding:64px 0 0;position:relative;overflow:hidden;text-align:center}
    .hero::before{content:'';position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:1100px;height:900px;background:radial-gradient(closest-side,rgba(201,154,82,.14),transparent 70%);pointer-events:none}
    .hero .wrap{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center}
    /* 표지 상단 — 책 인장 라인 */
    .hero-kicker{display:flex;align-items:center;gap:16px;font-family:var(--mono);font-size:.72rem;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:34px}
    .hero-kicker::before,.hero-kicker::after{content:'';width:44px;height:1px;background:linear-gradient(90deg,transparent,var(--gold));}
    .hero-kicker::after{background:linear-gradient(90deg,var(--gold),transparent)}
    .hero-kicker b{color:var(--gold);font-weight:600}
    /* 표지 제목 — 거대 세리프 센터 */
    .hero-display{font-family:var(--serif);font-weight:700;line-height:1.04;letter-spacing:-.052em;word-spacing:-.04em;color:var(--navy);font-size:clamp(3rem,8.6vw,7.8rem);margin:0}
    .hero-display .accent{font-style:normal;background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;padding-right:.06em}
    /* VMG: 악센트 아래 손글씨 스워시 (펜으로 귿uad7f 그은 밑줄) */
    .accent-wrap{position:relative;display:inline-block}
    .accent-swash{position:absolute;left:2%;bottom:-.14em;width:96%;height:.24em;color:var(--gold-2);overflow:visible;pointer-events:none}
    /* VMG: 히어로 반짝이 스파크 (떠다니는 금별) */
    .hero-spark{position:absolute;color:var(--gold-2);pointer-events:none;z-index:3;filter:drop-shadow(0 2px 8px rgba(201,154,82,.45));animation:sparkfloat 5.5s var(--ease-soft) infinite}
    .hero-spark.sp1{width:22px;top:-12px;left:9%;animation-delay:0s}
    .hero-spark.sp2{width:14px;top:36px;left:16%;animation-delay:1.6s;opacity:.8}
    .hero-spark.sp3{width:17px;top:-2px;right:18%;animation-delay:.9s;opacity:.9}
    @keyframes sparkfloat{0%,100%{transform:translateY(0) rotate(0) scale(1)}50%{transform:translateY(-12px) rotate(22deg) scale(1.14)}}
    @media(prefers-reduced-motion:reduce){.hero-spark{animation:none}}
    @media(max-width:880px){.hero-spark{display:none}}
    .hero-sub{font-size:1.16rem;color:var(--ink-soft);line-height:1.9;max-width:520px;margin:30px auto 34px;word-break:keep-all}
    .hero-cta{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:54px}
    /* 표지의 그림 — 아치(성당 창) 이미지 */
    .hero-arch{position:relative;width:min(900px,100%);margin:0 auto}
    .hero-arch .arch-frame{position:relative;border-radius:480px 480px 26px 26px;overflow:hidden;aspect-ratio:16/9.4;box-shadow:var(--shadow-lg);border:1px solid rgba(166,119,47,.18)}
    .hero-arch img{width:100%;height:100%;object-fit:cover;transform:scale(1.06);transition:transform 1.6s var(--ease)}
    .hero-arch:hover img{transform:scale(1.11)}
    .hero-arch .arch-frame::after{content:'';position:absolute;inset:10px;border-radius:470px 470px 18px 18px;border:1px solid rgba(250,245,236,.4);pointer-events:none}
    .hero-arch .tag{position:absolute;left:50%;transform:translateX(-50%);bottom:18px;background:var(--glass);backdrop-filter:blur(14px) saturate(150%);-webkit-backdrop-filter:blur(14px) saturate(150%);padding:12px 20px;border-radius:var(--radius-pill);box-shadow:var(--shadow);display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.46);white-space:nowrap}
    .hero-arch .tag .dot{width:9px;height:9px;border-radius:50%;background:#4CAF7D;box-shadow:0 0 0 4px rgba(76,175,125,.18);flex:none;animation:pulse 2.4s var(--ease) infinite}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(76,175,125,.18)}50%{box-shadow:0 0 0 7px rgba(76,175,125,.06)}}
    .hero-arch .tag b{color:var(--navy);font-weight:700;font-size:.9rem}
    .hero-arch .tag span{color:var(--ink-soft);font-size:.8rem}
    .hero-badge{position:absolute;top:-30px;right:4%;width:112px;height:112px;border-radius:50%;background:var(--navy);color:var(--gold-2);display:grid;place-items:center;text-align:center;font-family:var(--mono);font-size:.66rem;font-weight:600;letter-spacing:.06em;line-height:1.5;box-shadow:var(--shadow-lg);animation:spin-badge 20s linear infinite;border:1px solid rgba(201,154,82,.35);z-index:3}
    .hero-badge b{display:block;font-family:var(--serif);font-size:1.5rem;font-weight:700;letter-spacing:-.02em;color:var(--inv)}
    @keyframes spin-badge{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){.hero-badge{animation:none}}
    /* 아치 좌우 — 책장 같은 메타 칼럼 */
    .hero-flank{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:22px;text-align:left;width:172px}
    .hero-flank.fl-l{left:calc(50% - 450px - 206px)}
    .hero-flank.fl-r{right:calc(50% - 450px - 206px);text-align:right;align-items:flex-end}
    .hero-flank .fm b{display:block;font-family:var(--serif);font-size:2rem;font-weight:700;color:var(--navy);letter-spacing:-.03em;line-height:1.05}
    .hero-flank .fm span{font-size:.84rem;color:var(--ink-soft);display:block;margin-top:4px}
    .hero-flank .fm{position:relative;padding-top:14px}
    .hero-flank .fm::before{content:'';position:absolute;top:0;width:30px;height:1.5px;background:var(--gold-grad)}
    .hero-flank.fl-l .fm::before{left:0}
    .hero-flank.fl-r .fm::before{right:0}
    @media(max-width:1320px){.hero-flank{display:none}}
    /* 모바일 메타 (플랭크 대체) */
    .hero-meta-m{display:none}
    @media(max-width:1320px){
      .hero-meta-m{display:flex;justify-content:center;gap:0;flex-wrap:wrap;margin-top:36px;padding:0 8px}
      .hero-meta-m .hm{display:flex;flex-direction:column;gap:3px;padding:0 26px;border-right:1px solid var(--line);text-align:center}
      .hero-meta-m .hm:last-child{border-right:none}
      .hero-meta-m .hm b{font-family:var(--serif);font-size:1.6rem;font-weight:700;color:var(--navy);letter-spacing:-.03em;line-height:1.1}
      .hero-meta-m .hm span{font-size:.8rem;color:var(--ink-soft)}
    }
    /* 스크롤 큐 — "이야기를 시작하세요" */
    .hero-scroll{margin:46px auto 0;display:flex;flex-direction:column;align-items:center;gap:12px;padding-bottom:34px}
    .hero-scroll span{font-family:var(--mono);font-size:.66rem;letter-spacing:.3em;text-transform:uppercase;color:var(--ink-faint)}
    .hero-scroll .sline{width:1.5px;height:52px;background:var(--line);position:relative;overflow:hidden}
    .hero-scroll .sline::after{content:'';position:absolute;top:-50%;left:0;width:100%;height:50%;background:var(--gold);animation:scue 2.2s var(--ease-soft) infinite}
    @keyframes scue{0%{top:-50%}70%,100%{top:110%}}
    @media(prefers-reduced-motion:reduce){.hero-scroll .sline::after{animation:none}}
    @media(max-width:880px){
      .hero{min-height:auto;padding:46px 0 0}
      .hero-display{font-size:clamp(2.7rem,12.5vw,4.6rem)}
      .hero-kicker{letter-spacing:.18em;margin-bottom:26px}
      .hero-arch .arch-frame{border-radius:300px 300px 20px 20px;aspect-ratio:4/3.4}
      .hero-arch .arch-frame::after{border-radius:292px 292px 14px 14px}
      .hero-badge{width:88px;height:88px;top:-18px;right:2%}
      .hero-badge b{font-size:1.2rem}
      .hero-scroll{margin-top:34px}
    }

    /* ====================== 섹션 공통 (2026: 거대 세리프 헤드) ====================== */
    .sec{padding:116px 0}
    .sec-head{max-width:740px;margin-bottom:60px}
    .sec-head.center{margin-left:auto;margin-right:auto;text-align:center}
    .sec-head .mono-lbl{margin-bottom:22px}
    .sec-head.center .mono-lbl{justify-content:center}
    .sec-head h2{font-family:var(--serif);font-weight:700;font-size:clamp(2.3rem,5.2vw,4.4rem);margin-bottom:20px;letter-spacing:-.05em;line-height:1.02}
    .sec-head h2 em{font-style:normal;background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
    .sec-head.center h2[data-line] > span{display:inline-block}
    .sec-head p{font-size:1.14rem;color:var(--ink-soft);line-height:1.8;max-width:580px}
    .sec-head.center p{margin-left:auto;margin-right:auto}

    /* ====================== 소개 (스토리 + 실사) ====================== */
    .intro{background:var(--bg-soft)}
    .intro-grid{display:grid;grid-template-columns:1fr 1.05fr;gap:72px;align-items:center}
    .intro-img{position:relative;border-radius:300px 300px 22px 22px;overflow:hidden;aspect-ratio:3/4;box-shadow:var(--shadow-lg);border:1px solid rgba(166,119,47,.16)}
    .intro-img::after{content:'';position:absolute;inset:9px;border-radius:292px 292px 16px 16px;border:1px solid rgba(250,245,236,.45);pointer-events:none;z-index:2}
    .intro-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}
    .intro-img:hover img{transform:scale(1.04)}
    .intro .mono-lbl{margin-bottom:26px}
    .intro-quote{font-family:var(--serif);font-size:clamp(1.9rem,3.8vw,3.1rem);font-weight:700;color:var(--navy);line-height:1.24;letter-spacing:-.045em;margin-bottom:30px}
    .intro-quote em{font-style:normal;background:var(--gold-grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
    .intro p{font-size:1.08rem;color:var(--ink-soft);line-height:1.9;margin:0 0 18px}
    .intro-sign{margin-top:32px;padding-top:26px;border-top:1px solid var(--line);font-weight:700;color:var(--navy);font-size:1.05rem}
    .intro-sign span{display:block;font-size:.94rem;color:var(--ink-faint);font-weight:500;margin-top:5px;font-style:normal}

    /* ====================== 핵심 진료 (2026: 에디토리얼 넘버드 리스트) ====================== */
    .core-list{border-top:1px solid var(--ink);margin-top:8px}
    .core-row{position:relative;display:grid;grid-template-columns:auto 1fr auto;gap:40px;align-items:center;padding:40px 8px;border-bottom:1px solid var(--line);transition:padding .5s var(--ease),background .4s var(--ease)}
    .core-row::before{content:'';position:absolute;inset:0;background:var(--navy);transform:scaleY(0);transform-origin:bottom;transition:transform .5s var(--ease);z-index:0}
    .core-row > *{position:relative;z-index:1}
    .core-row:hover{padding-left:32px;padding-right:24px}
    .core-row:hover::before{transform:scaleY(1)}
    .core-row .cr-num{font-family:var(--grotesk);font-size:clamp(2.4rem,5vw,4.2rem);font-weight:500;color:var(--ink-faint);letter-spacing:-.04em;line-height:.9;transition:color .4s var(--ease);min-width:1.6em}
    .core-row:hover .cr-num{color:var(--gold-2)}
    .core-row .cr-mid h3{font-family:var(--serif);font-size:clamp(1.6rem,3vw,2.5rem);font-weight:700;letter-spacing:-.02em;margin-bottom:8px;transition:color .4s var(--ease);line-height:1.1}
    .core-row .cr-mid p{color:var(--ink-soft);font-size:1.04rem;line-height:1.6;margin:0;max-width:560px;transition:color .4s var(--ease)}
    .core-row:hover .cr-mid h3{color:var(--inv)}
    .core-row:hover .cr-mid p{color:var(--inv-soft)}
    .core-row .cr-go{width:56px;height:56px;border-radius:50%;border:1.5px solid var(--line);display:grid;place-items:center;color:var(--navy);font-size:1.1rem;flex:none;transition:all .5s var(--ease)}
    .core-row:hover .cr-go{border-color:var(--gold-2);background:var(--gold-2);color:var(--navy);transform:rotate(-45deg) scale(1.08)}
    .core-row .cr-ic{font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:6px;transition:color .4s var(--ease)}
    .core-row:hover .cr-ic{color:var(--gold-2)}

    /* ====================== 강점 (2026: 거대 숫자 + 그리드) ====================== */
    .why{background:linear-gradient(155deg,#52402F 0%,var(--navy) 40%,var(--navy-2) 100%);color:var(--inv);position:relative}
    .why::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,154,82,.45),transparent)}
    .why::after{content:'';position:absolute;top:-100px;left:-60px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(201,154,82,.16),transparent 70%);pointer-events:none}
    .why .sec-head h2{color:var(--inv)}
    .why .sec-head h2 em,.cta-box h2 em{background:linear-gradient(135deg,#E7C98C,#C99A52);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
    .why .sec-head .mono-lbl{color:var(--gold-2)}
    .why .sec-head .mono-lbl::before{background:var(--gold-2)}
    .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid rgba(250,245,236,.18)}
    .why-card{padding:44px 36px 44px 0;border-right:1px solid rgba(250,245,236,.14);margin-right:36px;transition:padding-left .4s var(--ease)}
    .why-card:last-child{border-right:none;margin-right:0}
    .why-card:hover{padding-left:8px}
    .why-card .wn{font-family:var(--grotesk);font-size:clamp(3.6rem,5vw,5.4rem);font-weight:600;color:transparent;-webkit-text-stroke:1.4px var(--gold-2);text-stroke:1.4px var(--gold-2);letter-spacing:-.05em;margin-bottom:22px;line-height:.85;display:block;transition:color .5s var(--ease)}
    .why-card:hover .wn{color:var(--gold-2)}
    .why-card h3{font-family:var(--serif);font-weight:700;font-size:1.55rem;margin-bottom:13px;color:var(--inv);letter-spacing:-.02em}
    .why-card p{color:var(--inv-soft);font-size:1.01rem;line-height:1.78;margin:0}

    /* ====================== 전체 진료 ====================== */
    .all-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .all-card{display:flex;gap:16px;align-items:center;background:var(--bg-card);border:1px solid var(--line);border-radius:14px;padding:22px 24px;transition:all .35s var(--ease)}
    .all-card:hover{border-color:var(--navy);transform:translateY(-3px);box-shadow:var(--shadow-sm)}
    .all-card .ai{width:48px;height:48px;border-radius:13px;background:var(--bg-soft);color:var(--navy);display:grid;place-items:center;font-size:1.15rem;flex:none;transition:all .35s var(--ease)}
    .all-card:hover .ai{background:var(--navy);color:var(--bg)}
    .all-card strong{display:block;font-size:1.1rem;color:var(--navy);margin-bottom:2px}
    .all-card .desc{font-size:.9rem;color:var(--ink-soft)}

    /* ====================== 이전 안내 바 ====================== */
    .relocate{background:linear-gradient(100deg,var(--navy-2),var(--navy));color:var(--inv);border-bottom:1px solid rgba(201,154,82,.22)}
    .relocate-inner{display:flex;align-items:center;gap:18px;padding:13px 0;flex-wrap:wrap}
    .relocate .rl-tag{font-family:var(--mono);font-size:.68rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--navy);background:var(--gold-2);padding:5px 11px;border-radius:7px;flex:none}
    .relocate p{margin:0;font-size:.95rem;color:var(--inv-soft);line-height:1.5}
    .relocate p b{color:var(--inv);font-weight:700}
    .relocate a{margin-left:auto;font-family:var(--mono);font-size:.78rem;letter-spacing:.05em;color:var(--gold-2);font-weight:600;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;transition:gap .3s var(--ease)}
    .relocate a:hover{gap:11px}

    /* ====================== 보유 장비 ====================== */
    .equip{background:var(--bg-soft)}
    .equip-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:0;border-top:1px solid var(--line)}
    .equip-card{padding:34px 26px 34px 0;border-right:1px solid var(--line);margin-right:26px;transition:transform .4s var(--ease)}
    .equip-card:last-child{border-right:none;margin-right:0}
    .equip-card:hover{transform:translateY(-6px)}
    .equip-card .eq-ic{width:54px;height:54px;border-radius:50%;background:var(--bg-card);border:1px solid var(--gold-soft);color:var(--gold-3);display:grid;place-items:center;font-size:1.2rem;margin-bottom:20px;transition:all .4s var(--ease);box-shadow:0 0 0 5px rgba(166,119,47,.05)}
    .equip-card:hover .eq-ic{background:var(--navy);color:var(--gold-2);border-color:var(--navy);box-shadow:0 0 0 7px rgba(62,44,31,.08);transform:rotate(-8deg)}
    .equip-card h4{font-size:1.08rem;margin-bottom:9px;line-height:1.3}
    .equip-card p{font-size:.9rem;color:var(--ink-soft);line-height:1.62;margin:0;word-break:keep-all}
    .equip-note{margin-top:38px;font-size:.92rem;color:var(--ink-faint);display:flex;align-items:center;gap:9px}
    .equip-note i{color:var(--gold)}
    /* VMG: 장비 섹션 치아 라인 드로잉 (배경 장식 — 스크롤 진입 시 펜으로 그려짐) */
    .equip-tooth{position:absolute;right:-30px;top:60px;width:min(320px,30vw);color:var(--gold);opacity:.34;pointer-events:none;z-index:0}
    @media(max-width:880px){.equip-tooth{display:none}}

    /* ====================== 의료진 ====================== */
    .team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px}
    .team-card{transition:transform .4s var(--ease)}
    .team-card:hover{transform:translateY(-6px)}
    .team-photo{position:relative;aspect-ratio:3/4;border-radius:160px 160px 16px 16px;background:var(--bg-soft);overflow:hidden;margin-bottom:16px;border:1px solid var(--line);transition:border-color .4s var(--ease)}
    .team-card:hover .team-photo{border-color:var(--gold)}
    .team-photo::after{content:'';position:absolute;inset:7px;border-radius:154px 154px 11px 11px;border:1px solid rgba(250,245,236,.5);pointer-events:none;z-index:2}
    .team-photo img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
    .team-card:hover .team-photo img{transform:scale(1.05)}
    .team-card h4{font-size:1.12rem;margin-bottom:3px}
    .team-card .role{font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:5px}
    .team-card .spec{font-size:.85rem;color:var(--ink-soft)}

    /* ====================== 지역 ====================== */
    .geo{background:var(--bg-soft);text-align:center}
    .geo-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:36px}
    .geo-chips a{padding:12px 24px;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-pill);font-weight:600;color:var(--ink);transition:all .35s var(--ease);font-size:.96rem}
    .geo-chips a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy);transform:translateY(-2px)}

    /* ====================== EPILOGUE v7 (책의 마지막 장) ====================== */
    .epi{position:relative;background:linear-gradient(165deg,#4A3624 0%,var(--navy) 42%,var(--navy-2) 100%);border-radius:var(--radius-xl);padding:96px 56px 84px;text-align:center;color:var(--inv);overflow:hidden;box-shadow:0 40px 90px rgba(41,28,18,.38);border:1px solid rgba(201,154,82,.18)}
    .epi::before{content:'';position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:680px;height:520px;background:radial-gradient(closest-side,rgba(201,154,82,.22),transparent 70%);pointer-events:none}
    .epi::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,154,82,.6),transparent)}
    .epi-fin{font-family:var(--mono);font-size:.68rem;letter-spacing:.32em;text-transform:uppercase;color:var(--gold-2);display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:30px;position:relative}
    .epi-fin::before,.epi-fin::after{content:'';width:40px;height:1px;background:linear-gradient(90deg,transparent,rgba(201,154,82,.6))}
    .epi-fin::after{background:linear-gradient(90deg,rgba(201,154,82,.6),transparent)}
    .epi h2{font-family:var(--serif);font-weight:700;color:var(--inv);font-size:clamp(2.3rem,5vw,4.2rem);margin-bottom:22px;position:relative;line-height:1.12;letter-spacing:-.045em}
    .epi h2 em{font-style:normal;background:linear-gradient(110deg,#EDD49B,#C99A52);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
    .epi .epi-copy{color:var(--inv-soft);font-size:1.14rem;margin:0 auto 40px;max-width:560px;position:relative;line-height:1.9;word-break:keep-all}
    .cta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative}
    .epi .epi-sign{margin-top:46px;padding-top:30px;border-top:1px solid rgba(250,245,236,.14);font-family:var(--serif);font-size:1rem;color:var(--inv-faint);position:relative}
    .epi .epi-sign b{color:var(--gold-2);font-weight:700}
    /* VMG: 에필로그 플러리시 (닫는 장식 — 펜 드로잉) */
    .epi-orn{display:block;width:150px;height:54px;margin:30px auto 0;color:var(--gold-2);position:relative;opacity:.95}

    @media(max-width:880px){
      .hero{padding:44px 0 0}
      .hero-stage{grid-template-columns:1fr;gap:36px;margin-top:26px}
      .hero-display{font-size:clamp(2.9rem,15vw,5.5rem)}
      .hero-body{margin-top:18px}
      .hero-figure{order:-1}
      .hero-img{aspect-ratio:4/3}
      .hero-badge{width:88px;height:88px;top:-18px;right:6px}
      .hero-coords{display:none}
      .intro-grid{grid-template-columns:1fr;gap:44px}
      .intro-img{aspect-ratio:4/3;max-height:420px}
      .all-grid{grid-template-columns:1fr 1fr}
      .core-row{gap:22px;padding:30px 4px}
      .core-row:hover{padding-left:18px;padding-right:14px}
      .core-row .cr-num{min-width:1.4em}
      .why-grid{grid-template-columns:1fr}
      .why-card{border-right:none;border-bottom:1px solid rgba(250,245,236,.14);margin-right:0;padding:32px 0}
      .why-card:last-child{border-bottom:none}
      .team-grid{grid-template-columns:repeat(3,1fr)}
      .equip-grid{grid-template-columns:1fr 1fr}
      .equip-card{border-right:none;border-bottom:1px solid var(--line);margin-right:0;padding:28px 0}
      .equip-card:nth-child(odd){border-right:1px solid var(--line);padding-right:26px;margin-right:26px}
      .equip-card:last-child{border-bottom:none}
      .relocate a{margin-left:0;width:100%}
    }
    @media(max-width:560px){
      .all-grid{grid-template-columns:1fr}
      .core-row{grid-template-columns:auto 1fr;gap:18px}
      .core-row .cr-go{display:none}
      .core-row .cr-mid h3{font-size:1.4rem}
      .sec{padding:72px 0}
      .hero-meta .hm{padding-right:22px;margin-right:22px}
      .epi{padding:64px 26px 56px}
      .team-grid{grid-template-columns:repeat(2,1fr)}
      .equip-grid{grid-template-columns:1fr}
      .equip-card,.equip-card:nth-child(odd){border-right:none;padding-right:0;margin-right:0;padding:24px 0}
    }
  </style>

  <!-- ============ 이전 안내 ============ -->
  <section class="relocate">
    <div class="wrap relocate-inner">
      <span class="rl-tag">NEW</span>
      <p>이솔치과의원이 <b>${CLINIC.addressShort}</b> 새 공간으로 이전, <b>6월 22일부터 진료를 시작합니다</b>. 더 넓고 쾌적한 공간에서 맞이하겠습니다.</p>
      <a href="/directions">오시는 길 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>

  <!-- ============ HERO = PROLOGUE (책의 표지) ============ -->
  <section class="hero" id="ch-hero">
    <div class="wrap">
      <div class="hero-kicker" data-reveal><span>남양주 마석 · <b>EST. ${CLINIC.established}</b> · 우리 가족 치과 주치의</span></div>
      <h1 class="hero-display">
        <span data-line data-line-d="1"><span>기분 좋게</span></span>
        <span data-line data-line-d="2"><span><span class="accent-wrap"><span class="accent">진료를 마칠</span>${raw(`
          <svg class="vmg accent-swash" viewBox="0 0 300 26" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <path class="vp vp2" pathLength="1" d="M6 16 C 70 24, 150 4, 230 12 C 258 15, 280 13, 294 10" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".85"/>
          </svg>`)}</span> 때까지</span></span>
      </h1>
      <p class="hero-sub" data-words>
        치과는 누구에게나 조금 긴장되는 곳이지요. 그 마음까지 편안하게 살피며, 충분한 상담과 정밀한 진단으로 함께해 온 우리 동네 치과입니다.
      </p>
      <div class="hero-cta" data-reveal data-reveal-d="3">
        <a href="/reservation" class="btn btn-accent"><i class="fas fa-calendar-check"></i> 예약 문의하기</a>
        <a href="/treatments" class="btn btn-ghost">진료 안내 보기 <i class="fas fa-arrow-right"></i></a>
      </div>
      <div class="hero-arch" data-reveal data-reveal-d="2">
        <div class="hero-flank fl-l">
          <div class="fm"><b><span data-count="10" data-suffix="년째">0</span></b><span>한자리에서 함께</span></div>
          <div class="fm"><b><span data-count="5" data-suffix="인">0</span></b><span>상주 의료진</span></div>
        </div>
        <div class="arch-frame" data-parallax="10">
          <img src="/static/img/clinic-reception.webp" alt="이솔치과의원 내부 전경" loading="eager">
          <div class="tag"><span class="dot"></span><span><b>진료 안내</b> <span>· 진료시간은 전화로 확인해 주세요</span></span></div>
        </div>
        <div class="hero-flank fl-r">
          <div class="fm"><b>3대</b><span>가족이 함께 다니는</span></div>
          <div class="fm"><b>전 연령</b><span>아이부터 어르신까지</span></div>
        </div>
        <div class="hero-badge" aria-hidden="true"><span><b>3대</b>FAMILY<br>CARE</span></div>
        ${raw(SPARK('hero-spark sp1'))}
        ${raw(SPARK('hero-spark sp2'))}
        ${raw(SPARK('hero-spark sp3'))}
      </div>
      <div class="hero-meta-m" data-reveal data-reveal-d="4">
        <div class="hm"><b>10년째</b><span>한자리에서</span></div>
        <div class="hm"><b>5인</b><span>상주 의료진</span></div>
        <div class="hm"><b>전 연령</b><span>온 가족 진료</span></div>
      </div>
      <div class="hero-scroll" aria-hidden="true" data-reveal data-reveal-d="5">
        <span>Prologue · Scroll</span>
        <div class="sline"></div>
      </div>
    </div>
  </section>

  <!-- ============ 마퀴 띠 ============ -->
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      ${raw(Array(2).fill(0).map(() => `
        <span class="marquee-item">임플란트</span>
        <span class="marquee-item">치아교정</span>
        <span class="marquee-item">소아치과</span>
        <span class="marquee-item">심미보철</span>
        <span class="marquee-item">잇몸치료</span>
        <span class="marquee-item">충치·신경치료</span>
      `).join(''))}
    </div>
  </div>

  <!-- ============ BRIDGE → Ch.1 ============ -->
  <div class="bridge" data-reveal>
    ${raw(BRIDGE_ORN)}
    <p>모든 이야기에는 시작이 있습니다.<br>우리의 이야기는 <em>마석의 한 자리</em>에서 시작됩니다.</p>
    <span class="bridge-pg">Chapter 1 — Our Story</span>
  </div>

  <!-- ============ 소개 = CHAPTER 1 ============ -->
  <section class="sec intro" id="ch-story">
    <div class="wrap intro-grid">
      <div data-reveal>
        <span class="chapter-lbl"><span class="ch-no">첫 번째 이야기</span><span class="ch-line"></span><span class="ch-name">Our Story</span></span>
        <p class="intro-quote" data-line><span>치과를 떠올릴 때 <em>가장 먼저</em><br>생각나는 곳이고 싶습니다.</span></p>
        <p data-scrub class="dropcap">이솔치과의원은 남양주 마석에서 한자리를 지키며, 지역 주민과 따뜻하게 함께해 온 동네 치과입니다. 화려한 것보다 정직한 진료, 빠른 것보다 충분히 설명드리는 진료를 더 중요하게 생각합니다.</p>
        <p data-scrub>실제로 이솔에는 할머니의 틀니와 잇몸 치료에서 시작해, 아버지의 임플란트, 아이의 충치 치료와 정기검진까지 — 한 가족이 3대에 걸쳐 함께 다니는 시간이 쌓여 있습니다. 가족마다 필요한 치료는 다르지만, 한곳에서 같은 기록과 같은 치료 방향 안에서 관리받을 수 있다는 것. 그것이 우리가 ‘가족 주치의’라는 말을 쓰는 이유입니다.</p>
        <div class="intro-sign">
          이솔치과의원 대표원장 ${CLINIC.business.owner}
          <span>“${CLINIC.slogan}”</span>
        </div>
      </div>
      <div class="intro-img" data-reveal data-reveal-d="2">
        <img src="/static/img/clinic-consult.webp" alt="이솔치과의원 진료 상담 공간" loading="lazy">
      </div>
    </div>
  </section>

  <!-- ============ BRIDGE → Ch.2 ============ -->
  <div class="bridge" data-reveal>
    ${raw(BRIDGE_ORN)}
    <p>그래서 우리는 욕심내지 않기로 했습니다.<br>잘하는 것에 <em>더 깊이</em> 집중하기로요.</p>
    <span class="bridge-pg">Chapter 2 — Core Treatments</span>
  </div>

  <!-- ============ 핵심 진료 = CHAPTER 2 ============ -->
  <section class="sec" id="ch-core">
    <span class="kicker-v">CORE TREATMENTS</span>
    <div class="wrap folio">
      <span class="folio-num" aria-hidden="true">02</span>
      <div class="sec-head" data-reveal>
        <span class="chapter-lbl"><span class="ch-no">두 번째 이야기</span><span class="ch-line"></span><span class="ch-name">Core Treatments</span></span>
        <h2 data-line><span>가장 <em>집중하는</em> 세 가지</span></h2>
        <p>임플란트·치아교정·소아치과를 중심으로, 각 분야 전문의가 책임지고 진료합니다.</p>
      </div>
      <div class="core-list">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-row" data-reveal data-reveal-d="${i + 1}">
            <span class="cr-num">0${i + 1}</span>
            <span class="cr-mid">
              <span class="cr-ic"><i class="fas ${t.icon}"></i> ${t.name}</span>
              <h3>${t.name}</h3>
              <p>${t.short}.</p>
            </span>
            <span class="cr-go"><i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ BRIDGE → Ch.3 ============ -->
  <div class="bridge" data-reveal>
    ${raw(BRIDGE_ORN)}
    <p>잘하는 것보다 더 중요한 게 있습니다.<br><em>왜 이곳이어야 하는지</em>에 대한 답입니다.</p>
    <span class="bridge-pg">Chapter 3 — Why ISOL</span>
  </div>

  <!-- ============ 강점 = CHAPTER 3 ============ -->
  <section class="sec why" id="ch-why">
    <span class="kicker-v">WHY ISOL</span>
    <div class="wrap folio">
      <span class="folio-num" aria-hidden="true">03</span>
      <div class="sec-head" data-reveal>
        <span class="chapter-lbl"><span class="ch-no">세 번째 이야기</span><span class="ch-line"></span><span class="ch-name">Why ISOL</span></span>
        <h2 data-line><span>오래 다녀도 <em>편안한</em> 이유</span></h2>
      </div>
      <div class="why-grid">
        <div class="why-card" data-reveal data-reveal-d="1">
          <div class="wn">01</div>
          <h3>짧고 편안한 체어타임</h3>
          <p>숙련된 진료로 체어에 앉아 있는 시간은 짧게, 환자분이 말씀하시는 포인트는 놓치지 않게 진료합니다.</p>
        </div>
        <div class="why-card" data-reveal data-reveal-d="2">
          <div class="wn">02</div>
          <h3>필요한 치료만, 정직하게</h3>
          <p>비용이 걱정이신 분께는 비용에 맞는 계획을, 통증이 두려우신 분께는 통증을 줄이는 방향으로. 하지 않아도 되는 치료를 먼저 권하지 않습니다.</p>
        </div>
        <div class="why-card" data-reveal data-reveal-d="3">
          <div class="wn">03</div>
          <h3>숙련된 의료진</h3>
          <p>각 분야 전문의와 숙련된 스태프가 한 팀으로, 안정적인 진료를 이어갑니다.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 인버트 마퀴 띠 ============ -->
  <div class="marquee invert reverse" aria-hidden="true">
    <div class="marquee-track">
      ${raw(Array(2).fill(0).map(() => `
        <span class="marquee-item">충분한 상담</span>
        <span class="marquee-item">정밀한 진단</span>
        <span class="marquee-item">3대가 함께</span>
        <span class="marquee-item">전 연령 진료</span>
        <span class="marquee-item">10년째 한자리</span>
      `).join(''))}
    </div>
  </div>

  <!-- ============ 전체 진료 = CHAPTER 4 ============ -->
  <section class="sec" id="ch-all">
    <span class="kicker-v">ALL CARE</span>
    <div class="wrap folio">
      <span class="folio-num" aria-hidden="true">04</span>
      <div class="sec-head" data-reveal>
        <span class="chapter-lbl"><span class="ch-no">네 번째 이야기</span><span class="ch-line"></span><span class="ch-name">All Care</span></span>
        <h2 data-line><span>한곳에서 받는 <em>온 가족</em> 진료</span></h2>
        <p>핵심 진료 외에도 일상적인 구강 건강 관리를 폭넓게 돌봅니다.</p>
      </div>
      <div class="all-grid">
        ${raw(TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="all-card" data-reveal data-reveal-d="${(i % 3) + 1}">
            <span class="ai"><i class="fas ${t.icon}"></i></span>
            <span><strong>${t.name}</strong><span class="desc">${t.short}</span></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 보유 장비 = CHAPTER 5 ============ -->
  <section class="sec equip" id="ch-equip">
    <span class="kicker-v">DIAGNOSIS</span>
    <div class="wrap folio">
      <span class="folio-num" aria-hidden="true">05</span>
      <svg class="vmg equip-tooth" viewBox="0 0 120 150" fill="none" aria-hidden="true">
        <path class="vp" pathLength="1" d="M60 14 C 36 14, 24 30, 26 52 C 28 74, 38 80, 40 114 C 41.5 134, 50 136, 53 116 C 55.5 100, 58 96, 60 96 C 62 96, 64.5 100, 67 116 C 70 136, 78.5 134, 80 114 C 82 80, 92 74, 94 52 C 96 30, 84 14, 60 14 Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path class="vp vp2" pathLength="1" d="M40 34 C 46 26, 56 24, 62 26" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/>
        <path class="vfill" d="M97 8 L99.6 16.4 L108 19 L99.6 21.6 L97 30 L94.4 21.6 L86 19 L94.4 16.4 Z" fill="currentColor"/>
      </svg>
      <div class="sec-head" data-reveal>
        <span class="chapter-lbl"><span class="ch-no">다섯 번째 이야기</span><span class="ch-line"></span><span class="ch-name">Diagnosis</span></span>
        <h2 data-line><span>3대가 함께 <em>믿고 맡기는</em> 이유</span></h2>
        <p>${CLINIC.subSlogan}. 정밀한 진단 장비로 보이지 않는 부분까지 꼼꼼히 살핍니다.</p>
      </div>
      <div class="equip-grid">
        ${raw(CLINIC.equipment.map((e, i) => `
          <div class="equip-card" data-reveal data-reveal-d="${(i % 5) + 1}">
            <div class="eq-ic"><i class="fas ${['fa-x-ray','fa-cube','fa-magnifying-glass','fa-face-smile','fa-child-reaching'][i] || 'fa-tooth'}"></i></div>
            <h4>${e.name}</h4>
            <p>${e.desc}</p>
          </div>`).join(''))}
      </div>
      <div class="equip-note" data-reveal>
        <i class="fas fa-circle-info"></i>
        <span>장비 보유 현황은 진료 환경 개선에 따라 달라질 수 있으며, 자세한 사항은 내원 시 안내드립니다.</span>
      </div>
    </div>
  </section>

  <!-- ============ BRIDGE → Ch.6 ============ -->
  <div class="bridge" data-reveal>
    ${raw(BRIDGE_ORN)}
    <p>결국 이 이야기를 이어가는 건<br>장비도, 공간도 아닌 <em>사람</em>입니다.</p>
    <span class="bridge-pg">Chapter 6 — Specialists</span>
  </div>

  <!-- ============ 의료진 = CHAPTER 6 ============ -->
  <section class="sec intro" id="ch-team">
    <span class="kicker-v">SPECIALISTS</span>
    <div class="wrap folio">
      <span class="folio-num" aria-hidden="true">06</span>
      <div class="sec-head" data-reveal>
        <span class="chapter-lbl"><span class="ch-no">여섯 번째 이야기</span><span class="ch-line"></span><span class="ch-name">Specialists</span></span>
        <h2 data-line><span>각 분야 <em>전문의</em>가 상주합니다</span></h2>
        <p>대표원장이 진단의 중심을 잡고, 케이스에 따라 교정·소아·보철·통합 각 분야 전문의가 이어받는 분과별 협진. 다섯 명의 원장이 한 명의 환자를 함께 봅니다.</p>
      </div>
      <div class="team-grid">
        ${raw(DOCTORS.map((d, i) => `
          <a href="/doctors/${d.slug}" class="team-card" data-reveal data-reveal-d="${(i % 5) + 1}">
            <div class="team-photo"><img src="${d.photo}" alt="${d.name} ${d.role}" loading="lazy"></div>
            <h4>${d.name}</h4>
            <div class="role">${d.role}</div>
            <div class="spec">${d.specialty}</div>
          </a>`).join(''))}
      </div>
      <div style="margin-top:40px" data-reveal>
        <a href="/doctors" class="btn btn-ghost">의료진 전체 보기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- ============ 지역 ============ -->
  <section class="sec geo">
    <div class="wrap">
      <div class="sec-head center" data-reveal>
        <span class="mono-lbl"><span class="num">/07</span> 진료 가능 지역</span>
        <h2 data-line><span>마석 인근에서 <em>편하게</em> 오세요</span></h2>
        <p>마석을 중심으로 화도·남양주·가평 등 인근 지역에서 찾아주십니다.</p>
      </div>
      <div class="geo-chips" data-reveal>
        ${raw(NEARBY_AREAS.map(a => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ BRIDGE → EPILOGUE ============ -->
  <div class="bridge" data-reveal>
    ${raw(BRIDGE_ORN)}
    <p>이제, 다음 이야기의 주인공은<br><em>당신</em>입니다.</p>
    <span class="bridge-pg">Epilogue — Your Turn</span>
  </div>

  <!-- ============ CTA = EPILOGUE ============ -->
  <section class="sec" id="ch-end" style="padding-top:54px">
    <div class="wrap">
      <div class="epi" data-reveal>
        <span class="epi-fin">Epilogue · 그리고, 당신의 이야기</span>
        <h2>이 이야기의 다음 장은<br><em>당신의 미소</em>입니다</h2>
        <p class="epi-copy">궁금한 점은 전화로 편하게 물어보세요. 온라인 예약 문의도 가능합니다. 기분 좋게 진료를 마치실 때까지, 처음부터 끝까지 함께하겠습니다.</p>
        <div class="cta-actions">
          <a href="tel:${CLINIC.tel}" class="btn btn-accent"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/reservation" class="btn btn-line">온라인 예약 문의</a>
        </div>
        <div class="epi-sign">이솔치과의원 — <b>"${CLINIC.slogan}"</b></div>
        <svg class="vmg epi-orn" viewBox="0 0 150 54" fill="none" aria-hidden="true">
          <path class="vp" pathLength="1" d="M8 30 C 36 30, 48 16, 68 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path class="vp vp2" pathLength="1" d="M82 16 C 102 16, 114 30, 142 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path class="vfill" d="M75 8 L78.5 16 L75 24 L71.5 16 Z" fill="currentColor"/>
          <circle class="vfill" cx="22" cy="42" r="1.6" fill="currentColor"/>
          <circle class="vfill" cx="128" cy="42" r="1.6" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </section>
  `;
}
