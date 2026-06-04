import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ====================== HERO ====================== */
    .hero{position:relative;overflow:hidden;padding:120px 0 110px;background:
      radial-gradient(70% 90% at 85% 8%,var(--bg-soft),transparent 60%),
      radial-gradient(60% 80% at 8% 95%,var(--bg-deep),transparent 65%),var(--bg)}
    .hero .blob-1{top:-80px;right:-60px;width:440px;height:440px;background:var(--gold-soft)}
    .hero .blob-2{bottom:-120px;left:-100px;width:520px;height:520px;background:#DCEBE2}
    .hero-inner{position:relative;z-index:2;display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center}
    .hero-eyebrow{margin-bottom:26px}
    .hero h1{font-size:clamp(2.7rem,6vw,4.7rem);line-height:1.14;font-weight:850;letter-spacing:-.04em;color:var(--navy);margin-bottom:26px}
    .hero h1 .accent{color:var(--gold);position:relative;white-space:nowrap}
    .hero h1 .accent svg{position:absolute;left:0;bottom:-.12em;width:100%;height:.32em;z-index:-1}
    .hero-sub{font-size:1.18rem;color:var(--ink-soft);line-height:1.85;max-width:520px;margin-bottom:38px}
    .hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:36px}
    .hero-hours{display:inline-flex;align-items:center;gap:12px;padding:12px 20px;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-pill);font-size:.95rem;color:var(--ink-soft);box-shadow:var(--shadow-sm)}
    .hero-hours b{color:var(--navy)}
    .hero-hours .dot{width:9px;height:9px;border-radius:50%;background:#4CAF7D;box-shadow:0 0 0 4px rgba(76,175,125,.18)}
    /* 히어로 비주얼 카드 */
    .hero-visual{position:relative}
    .hv-card{background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-xl);padding:38px 34px;box-shadow:var(--shadow-lg);position:relative;overflow:hidden}
    .hv-card::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:var(--gold-soft);opacity:.6}
    .hv-tooth{width:84px;height:84px;border-radius:24px;background:linear-gradient(135deg,var(--navy),var(--navy-3));display:grid;place-items:center;color:var(--bg);font-size:2.2rem;margin-bottom:22px;position:relative;box-shadow:var(--shadow)}
    .hv-card h3{font-size:1.45rem;margin-bottom:10px;position:relative}
    .hv-card p{color:var(--ink-soft);font-size:1rem;line-height:1.7;position:relative;margin:0 0 22px}
    .hv-list{list-style:none;padding:0;margin:0;position:relative;display:flex;flex-direction:column;gap:12px}
    .hv-list li{display:flex;align-items:center;gap:12px;font-size:1rem;font-weight:600;color:var(--ink)}
    .hv-list i{width:30px;height:30px;border-radius:10px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:.85rem;flex:none}

    /* ====================== 신뢰 지표 ====================== */
    .trust{background:var(--navy);color:var(--inv);padding:54px 0;position:relative;overflow:hidden}
    .trust::before{content:'';position:absolute;bottom:-100px;left:50%;transform:translateX(-50%);width:600px;height:200px;background:radial-gradient(circle,rgba(200,119,90,.2),transparent 70%)}
    .trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:26px;text-align:center;position:relative}
    .trust-num{font-size:clamp(2.4rem,4.5vw,3.4rem);font-weight:850;color:var(--gold-2);letter-spacing:-.04em;line-height:1}
    .trust-label{margin-top:10px;font-size:.98rem;color:var(--inv-soft)}

    /* ====================== 섹션 공통 ====================== */
    .sec{padding:96px 0}
    .sec-head{max-width:680px;margin-bottom:52px}
    .sec-head.center{margin-left:auto;margin-right:auto;text-align:center}
    .sec-head h2{font-size:clamp(2rem,4vw,3rem);margin:18px 0 16px;letter-spacing:-.04em}
    .sec-head p{font-size:1.12rem;color:var(--ink-soft);line-height:1.8}

    /* ====================== 소개 (스토리) ====================== */
    .intro{background:var(--bg-soft);overflow:hidden}
    .intro-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
    .intro-quote{font-size:clamp(1.6rem,3vw,2.3rem);font-weight:800;color:var(--navy);line-height:1.45;letter-spacing:-.035em;margin-bottom:24px}
    .intro-quote em{font-style:normal;color:var(--gold)}
    .intro p{font-size:1.1rem;color:var(--ink-soft);line-height:1.95;margin:0 0 18px}
    .intro-sign{margin-top:26px;font-weight:700;color:var(--navy)}
    .intro-sign span{display:block;font-size:.92rem;color:var(--ink-faint);font-weight:500;margin-top:2px}
    .intro-img{background:linear-gradient(150deg,var(--navy),var(--navy-3));border-radius:var(--radius-xl);min-height:420px;position:relative;overflow:hidden;box-shadow:var(--shadow-lg)}
    .intro-img .ii-icon{position:absolute;inset:0;display:grid;place-items:center;color:rgba(250,245,236,.16);font-size:11rem}
    .intro-img .ii-badge{position:absolute;bottom:28px;left:28px;right:28px;background:rgba(250,245,236,.96);border-radius:var(--radius);padding:22px 24px;box-shadow:var(--shadow)}
    .intro-img .ii-badge b{display:block;color:var(--navy);font-size:1.1rem;margin-bottom:4px}
    .intro-img .ii-badge span{color:var(--ink-soft);font-size:.94rem}

    /* ====================== 핵심 진료 ====================== */
    .core-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
    .core-card{background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-lg);padding:38px 32px;transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s;position:relative;overflow:hidden;display:flex;flex-direction:column}
    .core-card:hover{transform:translateY(-8px);box-shadow:var(--shadow-lg);border-color:transparent}
    .core-card .cc-icon{width:64px;height:64px;border-radius:20px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:1.6rem;margin-bottom:22px;transition:all .4s var(--ease)}
    .core-card:hover .cc-icon{background:var(--navy);color:var(--bg);transform:rotate(-6deg) scale(1.05)}
    .core-card h3{font-size:1.5rem;margin-bottom:10px}
    .core-card p{color:var(--ink-soft);font-size:1.02rem;line-height:1.7;flex:1;margin:0 0 20px}
    .core-card .cc-link{font-weight:700;color:var(--navy);display:inline-flex;align-items:center;gap:8px;transition:gap .3s}
    .core-card:hover .cc-link{gap:14px;color:var(--gold)}

    /* ====================== 강점 (왜 이솔) ====================== */
    .why{background:var(--bg-soft)}
    .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .why-card{background:var(--bg-card);border-radius:var(--radius-lg);padding:36px 30px;border:1px solid var(--line);transition:transform .35s var(--ease)}
    .why-card:hover{transform:translateY(-6px)}
    .why-card .wi{width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,var(--navy),var(--navy-3));color:var(--bg);display:grid;place-items:center;font-size:1.4rem;margin-bottom:20px}
    .why-card h3{font-size:1.3rem;margin-bottom:10px}
    .why-card p{color:var(--ink-soft);font-size:1rem;line-height:1.75;margin:0}

    /* ====================== 전체 진료 ====================== */
    .all-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
    .all-card{display:flex;gap:18px;align-items:flex-start;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius);padding:24px 26px;transition:all .3s var(--ease)}
    .all-card:hover{border-color:var(--navy);box-shadow:var(--shadow-sm);transform:translateY(-3px)}
    .all-card .ai{width:48px;height:48px;border-radius:14px;background:var(--bg-soft);color:var(--navy);display:grid;place-items:center;font-size:1.2rem;flex:none}
    .all-card strong{display:block;font-size:1.12rem;color:var(--navy);margin-bottom:3px}
    .all-card span{font-size:.92rem;color:var(--ink-soft)}

    /* ====================== 의료진 ====================== */
    .team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:18px}
    .team-card{text-align:center;transition:transform .35s var(--ease)}
    .team-card:hover{transform:translateY(-6px)}
    .team-photo{aspect-ratio:1;border-radius:var(--radius-lg);background:linear-gradient(150deg,var(--bg-deep),var(--bg-soft));display:grid;place-items:center;color:var(--navy);font-size:3rem;margin-bottom:16px;border:1px solid var(--line);overflow:hidden}
    .team-card h4{font-size:1.12rem;margin-bottom:3px}
    .team-card .role{font-size:.88rem;color:var(--gold);font-weight:700;margin-bottom:4px}
    .team-card .spec{font-size:.86rem;color:var(--ink-soft)}

    /* ====================== 지역 ====================== */
    .geo{background:var(--bg-soft);text-align:center}
    .geo-chips{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:34px}
    .geo-chips a{padding:13px 26px;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-pill);font-weight:600;color:var(--ink);transition:all .3s var(--ease)}
    .geo-chips a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy);transform:translateY(-3px)}

    /* ====================== CTA ====================== */
    .cta{padding:0 0 96px}
    .cta-box{background:linear-gradient(150deg,var(--navy),var(--navy-2));border-radius:var(--radius-xl);padding:72px 48px;text-align:center;color:var(--inv);position:relative;overflow:hidden}
    .cta-box::before{content:'';position:absolute;top:-90px;right:-60px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(200,119,90,.28),transparent 70%)}
    .cta-box::after{content:'';position:absolute;bottom:-120px;left:-80px;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(78,132,112,.4),transparent 70%)}
    .cta-box h2{color:var(--inv);font-size:clamp(2rem,4vw,3rem);margin-bottom:16px;position:relative}
    .cta-box p{color:var(--inv-soft);font-size:1.15rem;margin-bottom:34px;position:relative;max-width:560px;margin-left:auto;margin-right:auto}
    .cta-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative}

    @media(max-width:880px){
      .hero-inner,.intro-grid{grid-template-columns:1fr;gap:40px}
      .hero-visual{order:-1}
      .core-grid,.why-grid,.all-grid{grid-template-columns:1fr 1fr}
      .trust-grid{grid-template-columns:1fr 1fr;gap:36px 20px}
      .team-grid{grid-template-columns:repeat(2,1fr)}
    }
    @media(max-width:560px){
      .core-grid,.why-grid,.all-grid,.team-grid{grid-template-columns:1fr}
      .sec{padding:68px 0}
      .cta-box{padding:52px 28px}
    }
  </style>

  <!-- ============ HERO ============ -->
  <section class="hero">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="wrap hero-inner">
      <div class="hero-text">
        <div class="hero-eyebrow" data-reveal><span class="eyebrow">남양주 마석 · ${CLINIC.establishedLabel}</span></div>
        <h1 data-reveal data-reveal-d="1">
          기분 좋게<br>
          <span class="accent">진료를 마칠 때까지<svg viewBox="0 0 300 12" preserveAspectRatio="none"><path d="M2 8 Q150 0 298 7" stroke="var(--gold-2)" stroke-width="6" fill="none" stroke-linecap="round"/></svg></span>
        </h1>
        <p class="hero-sub" data-reveal data-reveal-d="2">
          치과는 누구에게나 조금 긴장되는 곳이지요. 그 마음까지 편안하게 살피며,
          충분한 상담과 정밀한 진단으로 함께해 온 우리 동네 치과입니다.
        </p>
        <div class="hero-cta" data-reveal data-reveal-d="3">
          <a href="/reservation" class="btn btn-accent"><i class="fas fa-calendar-check"></i> 예약 문의하기</a>
          <a href="/treatments" class="btn btn-ghost">진료 안내 보기</a>
        </div>
        <div data-reveal data-reveal-d="4">
          <span class="hero-hours"><span class="dot"></span> 평일 <b>09:30 – 18:30</b> · 토요일 진료</span>
        </div>
      </div>
      <div class="hero-visual" data-reveal data-reveal-d="2">
        <div class="hv-card">
          <div class="hv-tooth"><i class="fas fa-tooth"></i></div>
          <h3>믿고 찾는 동네 치과</h3>
          <p>각 분야 전문의가 상주하여, 한곳에서 온 가족의 진료를 편안하게 받으실 수 있습니다.</p>
          <ul class="hv-list">
            <li><i class="fas fa-check"></i> 여유로운 체어타임</li>
            <li><i class="fas fa-check"></i> 친절하고 숙련된 의료진</li>
            <li><i class="fas fa-check"></i> 전 연령 통합 진료</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 신뢰 지표 ============ -->
  <section class="trust">
    <div class="wrap">
      <div class="trust-grid">
        <div data-reveal><div class="trust-num"><span data-count="15" data-suffix="년+">0</span></div><div class="trust-label">한자리에서 함께한 시간</div></div>
        <div data-reveal data-reveal-d="1"><div class="trust-num"><span data-count="5" data-suffix="개">0</span></div><div class="trust-label">전문 진료 분야</div></div>
        <div data-reveal data-reveal-d="2"><div class="trust-num"><span data-count="5" data-suffix="인">0</span></div><div class="trust-label">상주 의료진</div></div>
        <div data-reveal data-reveal-d="3"><div class="trust-num">전 연령</div><div class="trust-label">아이부터 어르신까지</div></div>
      </div>
    </div>
  </section>

  <!-- ============ 소개 (스토리) ============ -->
  <section class="sec intro">
    <div class="wrap intro-grid">
      <div data-reveal>
        <span class="eyebrow">우리 이야기</span>
        <p class="intro-quote" style="margin-top:18px">치과를 떠올릴 때<br><em>가장 먼저 생각나는</em> 곳이고 싶습니다.</p>
        <p>이솔치과의원은 남양주 마석에서 한자리를 지키며, 지역 주민과 따뜻하게 함께해 온 동네 치과입니다. 화려한 것보다 정직한 진료, 빠른 것보다 충분히 설명드리는 진료를 더 중요하게 생각합니다.</p>
        <p>아이의 첫 치과부터 어르신의 임플란트까지, 온 가족이 마음 편히 찾을 수 있는 곳. 진료가 끝나는 순간 “오길 잘했다”는 기분이 드시도록, 작은 부분까지 살피겠습니다.</p>
        <div class="intro-sign">
          이솔치과의원 대표원장 ${CLINIC.business.owner}
          <span>“${CLINIC.slogan}”</span>
        </div>
      </div>
      <div class="intro-img" data-reveal data-reveal-d="2">
        <div class="ii-icon"><i class="fas fa-heart"></i></div>
        <div class="ii-badge">
          <b>${CLINIC.addressShort}</b>
          <span>경춘선 마석역 인근 · ${CLINIC.tel}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 핵심 진료 ============ -->
  <section class="sec">
    <div class="wrap">
      <div class="sec-head center" data-reveal>
        <span class="eyebrow">핵심 진료</span>
        <h2>우리가 가장 집중하는 진료</h2>
        <p>임플란트·치아교정·소아치과를 중심으로, 각 분야 전문의가 책임지고 진료합니다.</p>
      </div>
      <div class="core-grid">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card" data-reveal data-reveal-d="${i + 1}">
            <div class="cc-icon"><i class="fas ${t.icon}"></i></div>
            <h3>${t.name}</h3>
            <p>${t.short}. ${t.intro.split('.')[1] ? t.intro.split('.').slice(1, 2).join('.').trim() + '.' : ''}</p>
            <span class="cc-link">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 강점 ============ -->
  <section class="sec why">
    <div class="wrap">
      <div class="sec-head center" data-reveal>
        <span class="eyebrow">왜 이솔치과일까요</span>
        <h2>오래 다녀도 편안한 이유</h2>
      </div>
      <div class="why-grid">
        <div class="why-card" data-reveal data-reveal-d="1">
          <div class="wi"><i class="fas fa-clock"></i></div>
          <h3>여유로운 체어타임</h3>
          <p>쫓기듯 진료하지 않습니다. 충분히 듣고, 충분히 설명드린 뒤 진료를 시작합니다.</p>
        </div>
        <div class="why-card" data-reveal data-reveal-d="2">
          <div class="wi"><i class="fas fa-hand-holding-heart"></i></div>
          <h3>친절이 기본인 곳</h3>
          <p>처음 오신 분도, 오래 다니신 분도 편안하게. 작은 질문도 언제든 환영합니다.</p>
        </div>
        <div class="why-card" data-reveal data-reveal-d="3">
          <div class="wi"><i class="fas fa-user-md"></i></div>
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
        <span class="eyebrow">전체 진료 안내</span>
        <h2>한곳에서 받는 온 가족 진료</h2>
        <p>핵심 진료 외에도 일상적인 구강 건강 관리를 폭넓게 돌봅니다.</p>
      </div>
      <div class="all-grid">
        ${raw(TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="all-card" data-reveal data-reveal-d="${(i % 3) + 1}">
            <span class="ai"><i class="fas ${t.icon}"></i></span>
            <span><strong>${t.name}</strong><span>${t.short}</span></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 의료진 ============ -->
  <section class="sec why">
    <div class="wrap">
      <div class="sec-head center" data-reveal>
        <span class="eyebrow">의료진 소개</span>
        <h2>각 분야 전문의가 상주합니다</h2>
        <p>분야별 전문의가 함께하여, 한곳에서 전 연령의 진료를 책임집니다.</p>
      </div>
      <div class="team-grid">
        ${raw(DOCTORS.map((d, i) => `
          <a href="/doctors/${d.slug}" class="team-card" data-reveal data-reveal-d="${(i % 5) + 1}">
            <div class="team-photo"><i class="fas fa-user-md"></i></div>
            <h4>${d.name}</h4>
            <div class="role">${d.role}</div>
            <div class="spec">${d.specialty}</div>
          </a>`).join(''))}
      </div>
      <div style="text-align:center;margin-top:40px" data-reveal>
        <a href="/doctors" class="btn btn-ghost">의료진 전체 보기 <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </section>

  <!-- ============ 지역 ============ -->
  <section class="sec geo">
    <div class="wrap">
      <div class="sec-head center" data-reveal>
        <span class="eyebrow">진료 가능 지역</span>
        <h2>마석 인근에서 편하게 오세요</h2>
        <p>마석을 중심으로 화도·남양주·가평 등 인근 지역에서 찾아주십니다.</p>
      </div>
      <div class="geo-chips" data-reveal>
        ${raw(NEARBY_AREAS.map(a => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ CTA ============ -->
  <section class="cta">
    <div class="wrap">
      <div class="cta-box" data-reveal>
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
