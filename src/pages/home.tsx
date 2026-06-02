import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ===== HERO ===== */
    .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:linear-gradient(135deg,#143e39 0%,#1f5e57 55%,#2f8077 100%)}
    .hero::before{content:'';position:absolute;inset:0;background:
      radial-gradient(circle at 78% 30%,rgba(201,168,106,.28),transparent 42%),
      radial-gradient(circle at 12% 80%,rgba(47,128,119,.5),transparent 50%)}
    .hero-blob{position:absolute;border-radius:50%;filter:blur(2px);opacity:.5}
    .hero-blob.b1{width:420px;height:420px;background:radial-gradient(circle,rgba(201,168,106,.4),transparent 70%);top:-80px;right:-60px}
    .hero-blob.b2{width:520px;height:520px;background:radial-gradient(circle,rgba(255,255,255,.08),transparent 70%);bottom:-160px;left:-120px}
    .hero-inner{position:relative;z-index:2;width:100%}
    .hero h1{color:#fff;font-size:clamp(2.6rem,6.5vw,5.2rem);line-height:1.05;font-weight:800;letter-spacing:-.03em}
    .hero .lead{color:rgba(255,255,255,.86);font-size:clamp(1.05rem,2vw,1.35rem);max-width:560px;margin:26px 0 38px;line-height:1.7}
    .hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);color:#fff;padding:9px 18px;border-radius:999px;font-size:.88rem;font-weight:600;margin-bottom:26px}
    .hero-tag .dot{width:8px;height:8px;border-radius:50%;background:#c9a86a;animation:pulse 2s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .hero-cta{display:flex;gap:14px;flex-wrap:wrap}
    .hero-reveal{opacity:0;transform:translateY(30px);animation:heroIn 1s var(--ease) forwards}
    .hr1{animation-delay:.1s}.hr2{animation-delay:.3s}.hr3{animation-delay:.5s}.hr4{animation-delay:.7s}
    @keyframes heroIn{to{opacity:1;transform:none}}
    .scroll-ind{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);z-index:3;color:rgba(255,255,255,.6);text-align:center;font-size:.75rem;letter-spacing:.2em}
    .scroll-ind .mouse{width:26px;height:42px;border:2px solid rgba(255,255,255,.5);border-radius:14px;margin:0 auto 8px;position:relative}
    .scroll-ind .mouse::after{content:'';position:absolute;top:8px;left:50%;transform:translateX(-50%);width:4px;height:8px;background:#fff;border-radius:2px;animation:wheel 1.6s infinite}
    @keyframes wheel{0%{opacity:1;top:8px}100%{opacity:0;top:20px}}
    .hero-float-card{position:absolute;right:6%;bottom:14%;z-index:2;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-radius:20px;padding:22px 26px;box-shadow:var(--shadow-lg);max-width:260px;animation:heroIn 1s var(--ease) .9s both}
    .hero-float-card .label{font-size:.78rem;color:var(--ink-soft);font-weight:600}
    .hero-float-card .big{font-size:2.2rem;font-weight:800;color:var(--brand);line-height:1.1;margin:4px 0}
    @media(max-width:880px){.hero-float-card{display:none}}

    /* ===== 퍼널 STATS ===== */
    .stats{background:var(--bg-cream)}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
    .stat-card{text-align:center;padding:36px 20px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow-sm);transition:all .4s var(--ease)}
    .stat-card:hover{transform:translateY(-8px);box-shadow:var(--shadow)}
    .stat-card .num{font-size:3rem;font-weight:800;color:var(--brand);line-height:1}
    .stat-card .num .u{font-size:1.4rem;color:var(--accent)}
    .stat-card .cap{margin-top:10px;color:var(--ink-soft);font-weight:600;font-size:.95rem}
    @media(max-width:760px){.stats-grid{grid-template-columns:1fr 1fr}}

    /* ===== 핵심진료 ===== */
    .core-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
    .core-card{position:relative;border-radius:var(--radius-lg);overflow:hidden;min-height:420px;display:flex;flex-direction:column;justify-content:flex-end;padding:36px;color:#fff;transition:all .5s var(--ease);background-size:cover}
    .core-card::before{content:'';position:absolute;inset:0;transition:all .5s var(--ease)}
    .core-card.c0::before{background:linear-gradient(160deg,rgba(31,94,87,.4),rgba(20,62,57,.95))}
    .core-card.c1::before{background:linear-gradient(160deg,rgba(47,128,119,.4),rgba(20,62,57,.95))}
    .core-card.c2::before{background:linear-gradient(160deg,rgba(201,168,106,.5),rgba(20,62,57,.95))}
    .core-card:hover{transform:translateY(-10px);box-shadow:var(--shadow-lg)}
    .core-card:hover::before{opacity:.92}
    .core-card>*{position:relative;z-index:2}
    .core-card .ci{width:62px;height:62px;border-radius:16px;background:rgba(255,255,255,.16);backdrop-filter:blur(8px);display:grid;place-items:center;font-size:1.6rem;margin-bottom:auto}
    .core-card h3{font-size:1.7rem;margin:24px 0 10px}
    .core-card p{color:rgba(255,255,255,.82);font-size:.96rem;margin-bottom:18px}
    .core-card .more{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:#fff;font-size:.92rem}
    .core-card .more i{transition:transform .3s var(--ease)}
    .core-card:hover .more i{transform:translateX(6px)}
    @media(max-width:880px){.core-grid{grid-template-columns:1fr}}

    /* ===== 철학 split ===== */
    .philo{background:var(--brand-dark);color:#fff;position:relative;overflow:hidden}
    .philo .quote{font-size:clamp(1.8rem,3.6vw,3rem);font-weight:800;line-height:1.4;max-width:900px;margin:0 auto;text-align:center;letter-spacing:-.02em}
    .philo .quote .hl{color:var(--accent)}
    .philo .sig{text-align:center;margin-top:36px;color:rgba(255,255,255,.7)}

    /* ===== why 카드 ===== */
    .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .why-card{padding:34px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);transition:all .4s var(--ease)}
    .why-card:hover{border-color:var(--brand-light);transform:translateY(-6px);box-shadow:var(--shadow)}
    .why-card .wi{width:56px;height:56px;border-radius:14px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;font-size:1.4rem;margin-bottom:20px}
    .why-card h3{font-size:1.25rem;margin-bottom:10px}
    .why-card p{color:var(--ink-soft);font-size:.95rem}
    @media(max-width:880px){.why-grid{grid-template-columns:1fr}}

    /* ===== 진료 전체 chips ===== */
    .treat-chips{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
    .treat-chips a{padding:12px 22px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:600;color:var(--ink);transition:all .3s var(--ease)}
    .treat-chips a:hover{background:var(--brand);color:#fff;border-color:var(--brand);transform:translateY(-3px)}

    /* ===== 의료진 prev ===== */
    .doc-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:18px}
    .doc-mini{text-align:center;transition:all .4s var(--ease)}
    .doc-mini img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius);margin-bottom:14px;transition:all .4s var(--ease)}
    .doc-mini:hover img{transform:translateY(-6px);box-shadow:var(--shadow)}
    .doc-mini .dn{font-weight:800;font-size:1.05rem}
    .doc-mini .ds{color:var(--ink-soft);font-size:.85rem}
    @media(max-width:880px){.doc-strip{grid-template-columns:repeat(2,1fr)}}

    /* ===== 지역 SEO ===== */
    .area-band{background:var(--brand-soft)}
    .area-links{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:24px}
    .area-links a{font-size:.88rem;color:var(--brand-dark);background:#fff;padding:9px 16px;border-radius:10px;font-weight:600;transition:all .3s}
    .area-links a:hover{background:var(--brand);color:#fff}

    /* ===== final CTA ===== */
    .final-cta{background:linear-gradient(135deg,var(--brand),var(--brand-light));color:#fff;text-align:center;border-radius:var(--radius-lg);padding:72px 32px;margin:0 auto;max-width:var(--max)}
    .final-cta h2{font-size:clamp(1.9rem,4vw,2.8rem);margin-bottom:16px}
    .final-cta p{color:rgba(255,255,255,.85);font-size:1.1rem;margin-bottom:32px}
  </style>

  <!-- ============ HERO ============ -->
  <section class="hero">
    <div class="hero-blob b1" data-parallax="0.15"></div>
    <div class="hero-blob b2" data-parallax="-0.1"></div>
    <div class="wrap hero-inner">
      <span class="hero-tag hero-reveal hr1"><span class="dot"></span> 남양주 마석 · 개원 15년차 · 각 분야 전문의 상주</span>
      <h1 class="hero-reveal hr2">기분 좋게<br>진료를 마칠 때까지</h1>
      <p class="lead hero-reveal hr3">화려한 수식어 대신, 15년 동안 한자리에서 지역 주민과 함께해 왔습니다.<br>임플란트·교정·소아치과, 각 분야 전문의가 충분히 상담하고 정밀하게 진료합니다.</p>
      <div class="hero-cta hero-reveal hr4">
        <a href="/reservation" class="btn btn-gold"><i class="fas fa-calendar-check"></i> 진료 예약 문의</a>
        <a href="/treatments" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.5)">진료 안내 보기</a>
      </div>
    </div>
    <div class="hero-float-card">
      <div class="label">개원 이래</div>
      <div class="big">15<span style="font-size:1.2rem">년차</span></div>
      <div class="label">남양주 마석에서 한결같이</div>
    </div>
    <div class="scroll-ind"><div class="mouse"></div>SCROLL</div>
  </section>

  <!-- ============ STATS (퍼널: 신뢰) ============ -->
  <section class="section stats">
    <div class="wrap">
      <div class="stats-grid">
        <div class="stat-card reveal"><div class="num"><span data-count="15">0</span><span class="u">년+</span></div><div class="cap">한자리에서 쌓은 신뢰</div></div>
        <div class="stat-card reveal reveal-d1"><div class="num"><span data-count="5">0</span><span class="u">인</span></div><div class="cap">전문의 의료진 상주</div></div>
        <div class="stat-card reveal reveal-d2"><div class="num"><span data-count="3">0</span><span class="u">개</span></div><div class="cap">핵심 전문 진료 분야</div></div>
        <div class="stat-card reveal reveal-d3"><div class="num">全</div><div class="cap">전 연령 통합 진료</div></div>
      </div>
    </div>
  </section>

  <!-- ============ 핵심진료 TOP3 ============ -->
  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="kicker-line"></div>
        <span class="eyebrow">Our Specialty</span>
        <h2>이솔치과가 집중하는 진료</h2>
        <p>각 분야 전문의가 책임지는 세 가지 핵심 진료입니다.</p>
      </div>
      <div class="core-grid">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card c${i} reveal reveal-d${i+1}">
            <span class="ci"><i class="fas ${t.icon}"></i></span>
            <h3>${t.name}</h3>
            <p>${t.short}</p>
            <span class="more">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 철학 ============ -->
  <section class="section philo">
    <div class="wrap reveal">
      <p class="quote">우리가 바라는 건 거창하지 않습니다.<br>환자분이 <span class="hl">기분 좋게 진료를 마치고</span><br>이 동네에서 가장 편한 치과로 <span class="hl">오래 기억되는 것.</span></p>
      <div class="sig">— 이솔치과의원 대표원장 고경우</div>
      <div style="text-align:center;margin-top:32px"><a href="/mission" class="btn btn-gold">병원 이야기 더 보기</a></div>
    </div>
  </section>

  <!-- ============ WHY (강점 Q28/32) ============ -->
  <section class="section" style="background:var(--bg-soft)">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="kicker-line"></div>
        <span class="eyebrow">Why ISOL</span>
        <h2>이솔치과를 선택하는 이유</h2>
      </div>
      <div class="why-grid">
        <div class="why-card reveal"><div class="wi"><i class="fas fa-user-md"></i></div><h3>각 분야 전문의 상주</h3><p>임플란트·교정·소아치과 등 분야별 전문 의료진이 함께합니다. 한 곳에서 전 연령, 다양한 진료가 가능합니다.</p></div>
        <div class="why-card reveal reveal-d1"><div class="wi"><i class="fas fa-clock"></i></div><h3>여유로운 체어타임</h3><p>쫓기듯 진행하지 않습니다. 충분한 상담과 설명으로 환자분이 이해하고 안심할 수 있는 진료를 추구합니다.</p></div>
        <div class="why-card reveal reveal-d2"><div class="wi"><i class="fas fa-heart"></i></div><h3>친절한 진료 환경</h3><p>숙련된 의료진과 스태프가 따뜻하고 친근한 분위기에서 진료합니다. 치과가 편안한 공간이 되도록 노력합니다.</p></div>
      </div>
    </div>
  </section>

  <!-- ============ 전체진료 ============ -->
  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="kicker-line"></div>
        <span class="eyebrow">All Treatments</span>
        <h2>이솔치과의 전체 진료과목</h2>
        <p>모든 진료를 한 곳에서. 필요한 진료를 편하게 받으실 수 있습니다.</p>
      </div>
      <div class="treat-chips reveal">
        ${raw(TREATMENTS.map(t => `<a href="/treatments/${t.slug}"><i class="fas ${t.icon}" style="margin-right:6px;color:var(--brand-light)"></i>${t.name}</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 의료진 ============ -->
  <section class="section" style="background:var(--bg-cream)">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="kicker-line"></div>
        <span class="eyebrow">Medical Team</span>
        <h2>전문의 의료진을 소개합니다</h2>
      </div>
      <div class="doc-strip">
        ${raw(DOCTORS.map((d, i) => `
          <a href="/doctors/${d.slug}" class="doc-mini reveal reveal-d${(i%4)+1}">
            <img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.specialty}" loading="lazy">
            <div class="dn">${d.name}</div>
            <div class="ds">${d.role} · ${d.specialty}</div>
          </a>`).join(''))}
      </div>
      <div style="text-align:center;margin-top:40px"><a href="/doctors" class="btn btn-primary">의료진 전체 보기</a></div>
    </div>
  </section>

  <!-- ============ 지역 SEO ============ -->
  <section class="section area-band">
    <div class="wrap reveal" style="text-align:center">
      <span class="eyebrow">Location</span>
      <h2 style="font-size:clamp(1.6rem,3vw,2.2rem);margin:12px 0">남양주 마석, 가까운 우리 동네 치과</h2>
      <p style="color:var(--ink-soft)">${CLINIC.address}</p>
      <div class="area-links">
        ${raw(NEARBY_AREAS.slice(0,6).map(a => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a>`).join(''))}
        ${raw(NEARBY_AREAS.slice(0,4).map(a => `<a href="/area/${a.slug}-orthodontics">${a.name} 치아교정</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ FINAL CTA ============ -->
  <section class="section">
    <div class="wrap">
      <div class="final-cta reveal">
        <h2>진료가 필요하신가요?</h2>
        <p>전화 또는 온라인으로 편하게 문의해 주세요. 친절하게 안내해 드리겠습니다.</p>
        <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
          <a href="tel:${CLINIC.tel}" class="btn btn-gold"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/reservation" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.6)">온라인 예약 문의</a>
        </div>
      </div>
    </div>
  </section>
  `;
}
