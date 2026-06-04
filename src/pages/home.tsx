import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ====================== HERO (2026: 에디토리얼 매거진 · 거대 타이포) ====================== */
    .hero{background:var(--bg);padding:60px 0 64px;position:relative;overflow:hidden}
    .hero-top{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:38px}
    .hero-top .eyebrow{font-size:.76rem}
    .hero-coords{font-family:var(--mono);font-size:.74rem;letter-spacing:.08em;color:var(--ink-faint);text-align:right;line-height:1.7}
    /* 거대 디스플레이 헤드라인 */
    .hero-display{font-family:var(--serif);font-weight:700;line-height:.92;letter-spacing:-.03em;color:var(--navy);font-size:clamp(3rem,8.5vw,7.6rem);margin:0}
    .hero-display .l2{padding-left:.14em}
    .hero-display .accent{color:var(--gold);font-style:italic}
    /* 히어로 본문 + 이미지가 겹치는 비대칭 영역 */
    .hero-body{position:relative}
    .hero-stage{display:grid;grid-template-columns:1.1fr .9fr;gap:54px;align-items:end;margin-top:40px}
    .hero-lead{padding-bottom:14px}
    .hero-sub{font-size:1.2rem;color:var(--ink-soft);line-height:1.85;max-width:460px;margin:0 0 34px;word-break:keep-all}
    .hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:38px}
    .hero-meta{display:flex;gap:0;flex-wrap:wrap;padding-top:28px;border-top:1px solid var(--line)}
    .hero-meta .hm{display:flex;flex-direction:column;gap:3px;padding-right:30px;margin-right:30px;border-right:1px solid var(--line)}
    .hero-meta .hm:last-child{border-right:none;padding-right:0;margin-right:0}
    .hero-meta .hm b{font-family:var(--grotesk);font-size:1.85rem;font-weight:600;color:var(--navy);letter-spacing:-.03em;line-height:1}
    .hero-meta .hm span{font-size:.82rem;color:var(--ink-soft);letter-spacing:-.01em}
    .hero-figure{position:relative}
    .hero-img{position:relative;border-radius:var(--radius-xl);overflow:hidden;aspect-ratio:1/1.12;box-shadow:var(--shadow-lg);will-change:transform}
    .hero-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--ease);transform:scale(1.06)}
    .hero-img:hover img{transform:scale(1.12)}
    .hero-img .tag{position:absolute;left:16px;bottom:16px;background:var(--glass);backdrop-filter:blur(14px) saturate(150%);-webkit-backdrop-filter:blur(14px) saturate(150%);padding:13px 18px;border-radius:14px;box-shadow:var(--shadow);display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.42)}
    .hero-img .tag .dot{width:9px;height:9px;border-radius:50%;background:#4CAF7D;box-shadow:0 0 0 4px rgba(76,175,125,.18);flex:none;animation:pulse 2.4s var(--ease) infinite}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(76,175,125,.18)}50%{box-shadow:0 0 0 7px rgba(76,175,125,.06)}}
    .hero-img .tag b{color:var(--navy);font-weight:700;font-size:.92rem}
    .hero-img .tag span{color:var(--ink-soft);font-size:.81rem}
    /* 이미지 위 떠있는 라운드 배지 */
    .hero-badge{position:absolute;top:-26px;right:-12px;width:108px;height:108px;border-radius:50%;background:var(--gold);color:#fff;display:grid;place-items:center;text-align:center;font-family:var(--mono);font-size:.7rem;font-weight:600;letter-spacing:.04em;line-height:1.5;box-shadow:var(--shadow-warm);animation:spin-badge 18s linear infinite}
    .hero-badge b{display:block;font-family:var(--grotesk);font-size:1.5rem;font-weight:700;letter-spacing:-.02em}
    @keyframes spin-badge{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){.hero-badge{animation:none}}

    /* ====================== 섹션 공통 ====================== */
    .sec{padding:104px 0}
    .sec-head{max-width:660px;margin-bottom:54px}
    .sec-head.center{margin-left:auto;margin-right:auto;text-align:center}
    .sec-head .mono-lbl{margin-bottom:20px}
    .sec-head.center .mono-lbl{justify-content:center}
    .sec-head h2{font-size:clamp(2rem,4vw,3rem);margin-bottom:16px;letter-spacing:-.05em;line-height:1.1}
    .sec-head p{font-size:1.12rem;color:var(--ink-soft);line-height:1.78}

    /* ====================== 소개 (스토리 + 실사) ====================== */
    .intro{background:var(--bg-soft)}
    .intro-grid{display:grid;grid-template-columns:1fr 1.05fr;gap:72px;align-items:center}
    .intro-img{position:relative;border-radius:var(--radius-xl);overflow:hidden;aspect-ratio:3/4;box-shadow:var(--shadow-lg)}
    .intro-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--ease)}
    .intro-img:hover img{transform:scale(1.04)}
    .intro .mono-lbl{margin-bottom:24px}
    .intro-quote{font-size:clamp(1.8rem,3.2vw,2.5rem);font-weight:840;color:var(--navy);line-height:1.32;letter-spacing:-.05em;margin-bottom:28px}
    .intro p{font-size:1.08rem;color:var(--ink-soft);line-height:1.9;margin:0 0 18px}
    .intro-sign{margin-top:32px;padding-top:26px;border-top:1px solid var(--line);font-weight:700;color:var(--navy);font-size:1.05rem}
    .intro-sign span{display:block;font-size:.94rem;color:var(--ink-faint);font-weight:500;margin-top:5px;font-style:italic}

    /* ====================== 핵심 진료 (2026: 큰 인덱스 + 정교 호버) ====================== */
    .core-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
    .core-card{position:relative;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-lg);padding:38px 32px;transition:transform .45s var(--ease),box-shadow .45s var(--ease),border-color .35s;display:flex;flex-direction:column;overflow:hidden}
    .core-card::after{content:'';position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .45s var(--ease)}
    .core-card:hover{transform:translateY(-8px);box-shadow:var(--shadow-lg);border-color:transparent}
    .core-card:hover::after{transform:scaleX(1)}
    .core-card .cc-idx{position:absolute;top:24px;right:28px;font-family:var(--mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.06em}
    .core-card .cc-icon{width:58px;height:58px;border-radius:16px;background:var(--navy);color:var(--bg);display:grid;place-items:center;font-size:1.45rem;margin-bottom:26px;transition:transform .45s var(--ease)}
    .core-card:hover .cc-icon{transform:scale(1.08) rotate(-4deg)}
    .core-card h3{font-size:1.5rem;margin-bottom:11px}
    .core-card p{color:var(--ink-soft);font-size:1.01rem;line-height:1.7;flex:1;margin:0 0 24px}
    .core-card .cc-link{font-weight:700;color:var(--navy);display:inline-flex;align-items:center;gap:9px;font-size:.98rem}
    .core-card .cc-link i{transition:transform .35s var(--ease)}
    .core-card:hover .cc-link i{transform:translateX(5px)}

    /* ====================== 강점 (2026: 거대 숫자 + 그리드) ====================== */
    .why{background:var(--navy);color:var(--inv)}
    .why .sec-head h2{color:var(--inv)}
    .why .sec-head .mono-lbl{color:var(--gold-2)}
    .why .sec-head .mono-lbl::before{background:var(--gold-2)}
    .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid rgba(250,245,236,.18)}
    .why-card{padding:44px 36px 44px 0;border-right:1px solid rgba(250,245,236,.14);margin-right:36px;transition:padding-left .4s var(--ease)}
    .why-card:last-child{border-right:none;margin-right:0}
    .why-card:hover{padding-left:8px}
    .why-card .wn{font-family:var(--mono);font-size:3.4rem;font-weight:300;color:var(--gold-2);letter-spacing:-.04em;margin-bottom:22px;line-height:1;opacity:.85}
    .why-card h3{font-size:1.4rem;margin-bottom:13px;color:var(--inv)}
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
    .relocate{background:var(--navy);color:var(--inv)}
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
    .equip-card .eq-ic{width:50px;height:50px;border-radius:14px;background:var(--bg-card);border:1px solid var(--line);color:var(--navy);display:grid;place-items:center;font-size:1.25rem;margin-bottom:20px;transition:all .4s var(--ease)}
    .equip-card:hover .eq-ic{background:var(--navy);color:var(--gold-2);border-color:var(--navy)}
    .equip-card h4{font-size:1.08rem;margin-bottom:9px;line-height:1.3}
    .equip-card p{font-size:.9rem;color:var(--ink-soft);line-height:1.62;margin:0;word-break:keep-all}
    .equip-note{margin-top:38px;font-size:.92rem;color:var(--ink-faint);display:flex;align-items:center;gap:9px}
    .equip-note i{color:var(--gold)}

    /* ====================== 의료진 ====================== */
    .team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px}
    .team-card{transition:transform .4s var(--ease)}
    .team-card:hover{transform:translateY(-6px)}
    .team-photo{position:relative;aspect-ratio:3/4;border-radius:var(--radius-lg);background:var(--bg-soft);overflow:hidden;margin-bottom:16px;border:1px solid var(--line)}
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

    /* ====================== CTA (2026: 비대칭 + 큰 카피) ====================== */
    .cta-box{position:relative;background:var(--navy);border-radius:var(--radius-xl);padding:80px 56px;text-align:center;color:var(--inv);overflow:hidden}
    .cta-box::before{content:'';position:absolute;top:-140px;right:-100px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(185,138,78,.22),transparent 70%);pointer-events:none}
    .cta-box .mono-lbl{color:var(--gold-2);justify-content:center;margin-bottom:20px}
    .cta-box .mono-lbl::before{background:var(--gold-2)}
    .cta-box h2{color:var(--inv);font-size:clamp(2.1rem,4vw,3rem);margin-bottom:16px;position:relative}
    .cta-box p{color:var(--inv-soft);font-size:1.14rem;margin-bottom:36px;max-width:520px;margin-left:auto;margin-right:auto;position:relative}
    .cta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative}

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
      .core-grid,.all-grid{grid-template-columns:1fr 1fr}
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
      .core-grid,.all-grid{grid-template-columns:1fr}
      .sec{padding:68px 0}
      .hero-meta .hm{padding-right:22px;margin-right:22px}
      .cta-box{padding:54px 26px}
      .team-grid{grid-template-columns:repeat(2,1fr)}
      .equip-grid{grid-template-columns:1fr}
      .equip-card,.equip-card:nth-child(odd){border-right:none;padding-right:0;margin-right:0;padding:24px 0}
    }
  </style>

  <!-- ============ 이전 안내 ============ -->
  <section class="relocate">
    <div class="wrap relocate-inner">
      <span class="rl-tag">NEW</span>
      <p>이솔치과의원이 <b>${CLINIC.addressShort}</b>로 새롭게 자리를 옮겼습니다. 더 넓고 쾌적한 공간에서 맞이하겠습니다.</p>
      <a href="/directions">오시는 길 <i class="fas fa-arrow-right"></i></a>
    </div>
  </section>

  <!-- ============ HERO (에디토리얼 매거진) ============ -->
  <section class="hero">
    <div class="wrap">
      <div class="hero-top" data-reveal>
        <span class="eyebrow">남양주 마석 · ${CLINIC.establishedLabel}</span>
        <div class="hero-coords">37.6478°N 127.3105°E<br>ISOL DENTAL CLINIC · EST. ${CLINIC.established}</div>
      </div>
      <h1 class="hero-display">
        <span data-line data-line-d="1"><span>기분 좋게</span></span>
        <span class="l2" data-line data-line-d="2"><span><span class="accent">진료를 마칠</span> 때까지</span></span>
      </h1>
      <div class="hero-body">
        <div class="hero-stage">
          <div class="hero-lead">
            <p class="hero-sub" data-reveal data-reveal-d="2">
              치과는 누구에게나 조금 긴장되는 곳이지요. 그 마음까지 편안하게 살피며,
              충분한 상담과 정밀한 진단으로 함께해 온 우리 동네 치과입니다.
            </p>
            <div class="hero-cta" data-reveal data-reveal-d="3">
              <a href="/reservation" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 예약 문의하기</a>
              <a href="/treatments" class="btn btn-ghost">진료 안내 보기 <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="hero-meta" data-reveal data-reveal-d="4">
              <div class="hm"><b><span data-count="10" data-suffix="년째">0</span></b><span>한자리에서 함께</span></div>
              <div class="hm"><b><span data-count="5" data-suffix="인">0</span></b><span>상주 의료진</span></div>
              <div class="hm"><b>전 연령</b><span>아이부터 어르신까지</span></div>
            </div>
          </div>
          <div class="hero-figure" data-reveal data-reveal-d="2">
            <div class="hero-img" data-parallax="16">
              <img src="/static/img/clinic-reception.webp" alt="이솔치과의원 내부 전경" loading="eager">
              <div class="tag"><span class="dot"></span><span><b>진료 중</b><br><span>평일 09:30 – 18:30 · 토요일 진료</span></span></div>
            </div>
            <div class="hero-badge" aria-hidden="true"><span><b>3대</b>FAMILY<br>CARE</span></div>
          </div>
        </div>
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

  <!-- ============ 소개 ============ -->
  <section class="sec intro">
    <div class="wrap intro-grid">
      <div data-reveal>
        <span class="mono-lbl"><span class="num">/01</span> 우리 이야기</span>
        <p class="intro-quote">치과를 떠올릴 때<br>가장 먼저 생각나는 곳이고 싶습니다.</p>
        <p>이솔치과의원은 남양주 마석에서 한자리를 지키며, 지역 주민과 따뜻하게 함께해 온 동네 치과입니다. 화려한 것보다 정직한 진료, 빠른 것보다 충분히 설명드리는 진료를 더 중요하게 생각합니다.</p>
        <p>아이의 첫 치과부터 어르신의 임플란트까지, 온 가족이 마음 편히 찾을 수 있는 곳. 진료가 끝나는 순간 “오길 잘했다”는 기분이 드시도록, 작은 부분까지 살피겠습니다.</p>
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

  <!-- ============ 핵심 진료 ============ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <span class="mono-lbl"><span class="num">/02</span> 핵심 진료</span>
        <h2>우리가 가장 집중하는 진료</h2>
        <p>임플란트·치아교정·소아치과를 중심으로, 각 분야 전문의가 책임지고 진료합니다.</p>
      </div>
      <div class="core-grid">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card" data-reveal data-reveal-d="${i + 1}">
            <span class="cc-idx">/0${i + 1}</span>
            <div class="cc-icon"><i class="fas ${t.icon}"></i></div>
            <h3>${t.name}</h3>
            <p>${t.short}.</p>
            <span class="cc-link">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 강점 ============ -->
  <section class="sec why">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <span class="mono-lbl"><span class="num">/03</span> 왜 이솔치과일까요</span>
        <h2>오래 다녀도 편안한 이유</h2>
      </div>
      <div class="why-grid">
        <div class="why-card" data-reveal data-reveal-d="1">
          <div class="wn">01</div>
          <h3>여유로운 체어타임</h3>
          <p>쫓기듯 진료하지 않습니다. 충분히 듣고, 충분히 설명드린 뒤 진료를 시작합니다.</p>
        </div>
        <div class="why-card" data-reveal data-reveal-d="2">
          <div class="wn">02</div>
          <h3>친절이 기본인 곳</h3>
          <p>처음 오신 분도, 오래 다니신 분도 편안하게. 작은 질문도 언제든 환영합니다.</p>
        </div>
        <div class="why-card" data-reveal data-reveal-d="3">
          <div class="wn">03</div>
          <h3>숙련된 의료진</h3>
          <p>각 분야 전문의와 숙련된 스태프가 한 팀으로, 안정적인 진료를 이어갑니다.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 전체 진료 ============ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <span class="mono-lbl"><span class="num">/04</span> 전체 진료 안내</span>
        <h2>한곳에서 받는 온 가족 진료</h2>
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

  <!-- ============ 보유 장비 ============ -->
  <section class="sec equip">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <span class="mono-lbl"><span class="num">/05</span> 진단 · 장비</span>
        <h2>3대가 함께 믿고 맡기는 이유</h2>
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

  <!-- ============ 의료진 ============ -->
  <section class="sec intro">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <span class="mono-lbl"><span class="num">/06</span> 의료진 소개</span>
        <h2>각 분야 전문의가 상주합니다</h2>
        <p>분야별 전문의가 함께하여, 한곳에서 전 연령의 진료를 책임집니다.</p>
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
        <h2>마석 인근에서 편하게 오세요</h2>
        <p>마석을 중심으로 화도·남양주·가평 등 인근 지역에서 찾아주십니다.</p>
      </div>
      <div class="geo-chips" data-reveal>
        ${raw(NEARBY_AREAS.map(a => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ CTA ============ -->
  <section class="sec" style="padding-top:0">
    <div class="wrap">
      <div class="cta-box" data-reveal>
        <span class="mono-lbl">예약 문의</span>
        <h2>편안한 진료, 지금 시작하세요</h2>
        <p>궁금한 점은 전화로 편하게 물어보세요. 온라인 예약 문의도 가능합니다.</p>
        <div class="cta-actions">
          <a href="tel:${CLINIC.tel}" class="btn btn-accent"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/reservation" class="btn btn-line">온라인 예약 문의</a>
        </div>
      </div>
    </div>
  </section>
  `;
}
