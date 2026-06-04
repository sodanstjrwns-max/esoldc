import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ====================== HERO ====================== */
    .hero{background:var(--bg);padding:72px 0 88px}
    .hero-inner{display:grid;grid-template-columns:1.05fr 1fr;gap:64px;align-items:center}
    .hero h1{font-size:clamp(2.6rem,5.4vw,4.3rem);line-height:1.16;font-weight:850;letter-spacing:-.04em;color:var(--navy);margin:24px 0 24px}
    .hero h1 .accent{color:var(--gold)}
    .hero-sub{font-size:1.16rem;color:var(--ink-soft);line-height:1.85;max-width:500px;margin-bottom:36px}
    .hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px}
    .hero-meta{display:flex;gap:28px;flex-wrap:wrap;padding-top:28px;border-top:1px solid var(--line)}
    .hero-meta .hm{display:flex;flex-direction:column;gap:2px}
    .hero-meta .hm b{font-size:1.5rem;font-weight:800;color:var(--navy);letter-spacing:-.03em}
    .hero-meta .hm span{font-size:.88rem;color:var(--ink-soft)}
    .hero-img{position:relative;border-radius:var(--radius-xl);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow-lg)}
    .hero-img img{width:100%;height:100%;object-fit:cover}
    .hero-img .tag{position:absolute;left:20px;bottom:20px;background:var(--bg-card);padding:14px 20px;border-radius:var(--radius);box-shadow:var(--shadow);display:flex;align-items:center;gap:12px}
    .hero-img .tag .dot{width:9px;height:9px;border-radius:50%;background:#4CAF7D;box-shadow:0 0 0 4px rgba(76,175,125,.18);flex:none}
    .hero-img .tag b{color:var(--navy);font-weight:700;font-size:.96rem}
    .hero-img .tag span{color:var(--ink-soft);font-size:.85rem}

    /* ====================== 섹션 공통 ====================== */
    .sec{padding:92px 0}
    .sec-head{max-width:640px;margin-bottom:48px}
    .sec-head.center{margin-left:auto;margin-right:auto;text-align:center}
    .sec-head .lbl{font-size:.82rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;display:block}
    .sec-head h2{font-size:clamp(1.9rem,3.6vw,2.7rem);margin-bottom:14px;letter-spacing:-.04em}
    .sec-head p{font-size:1.1rem;color:var(--ink-soft);line-height:1.8}

    /* ====================== 소개 (스토리 + 실사) ====================== */
    .intro{background:var(--bg-soft)}
    .intro-grid{display:grid;grid-template-columns:1fr 1.05fr;gap:64px;align-items:center}
    .intro-img{border-radius:var(--radius-xl);overflow:hidden;aspect-ratio:3/4;box-shadow:var(--shadow-lg)}
    .intro-img img{width:100%;height:100%;object-fit:cover}
    .intro .lbl{font-size:.82rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:16px;display:block}
    .intro-quote{font-size:clamp(1.7rem,3vw,2.3rem);font-weight:800;color:var(--navy);line-height:1.4;letter-spacing:-.04em;margin-bottom:24px}
    .intro p{font-size:1.08rem;color:var(--ink-soft);line-height:1.9;margin:0 0 18px}
    .intro-sign{margin-top:28px;padding-top:24px;border-top:1px solid var(--line);font-weight:700;color:var(--navy);font-size:1.05rem}
    .intro-sign span{display:block;font-size:.94rem;color:var(--ink-faint);font-weight:500;margin-top:4px}

    /* ====================== 핵심 진료 ====================== */
    .core-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .core-card{background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-lg);padding:36px 30px;transition:transform .35s var(--ease),box-shadow .35s var(--ease);display:flex;flex-direction:column}
    .core-card:hover{transform:translateY(-6px);box-shadow:var(--shadow)}
    .core-card .cc-icon{width:56px;height:56px;border-radius:var(--radius);background:var(--navy);color:var(--bg);display:grid;place-items:center;font-size:1.4rem;margin-bottom:22px}
    .core-card h3{font-size:1.45rem;margin-bottom:10px}
    .core-card p{color:var(--ink-soft);font-size:1.01rem;line-height:1.7;flex:1;margin:0 0 20px}
    .core-card .cc-link{font-weight:700;color:var(--navy);display:inline-flex;align-items:center;gap:8px;transition:gap .3s}
    .core-card:hover .cc-link{gap:13px}

    /* ====================== 강점 ====================== */
    .why{background:var(--navy);color:var(--inv)}
    .why .sec-head h2{color:var(--inv)}
    .why .sec-head .lbl{color:var(--gold-2)}
    .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid rgba(250,245,236,.16);border-radius:var(--radius-lg);overflow:hidden}
    .why-card{padding:40px 34px;border-right:1px solid rgba(250,245,236,.16)}
    .why-card:last-child{border-right:none}
    .why-card .wn{font-size:.85rem;font-weight:700;color:var(--gold-2);letter-spacing:.1em;margin-bottom:18px}
    .why-card h3{font-size:1.3rem;margin-bottom:12px;color:var(--inv)}
    .why-card p{color:var(--inv-soft);font-size:1rem;line-height:1.78;margin:0}

    /* ====================== 전체 진료 ====================== */
    .all-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .all-card{display:flex;gap:16px;align-items:center;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 24px;transition:all .28s var(--ease)}
    .all-card:hover{border-color:var(--navy);transform:translateX(4px)}
    .all-card .ai{width:46px;height:46px;border-radius:var(--radius);background:var(--bg-soft);color:var(--navy);display:grid;place-items:center;font-size:1.15rem;flex:none}
    .all-card strong{display:block;font-size:1.1rem;color:var(--navy);margin-bottom:2px}
    .all-card span{font-size:.9rem;color:var(--ink-soft)}

    /* ====================== 의료진 ====================== */
    .team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
    .team-card{transition:transform .3s var(--ease)}
    .team-card:hover{transform:translateY(-5px)}
    .team-photo{aspect-ratio:3/4;border-radius:var(--radius-lg);background:var(--bg-soft);overflow:hidden;margin-bottom:16px;border:1px solid var(--line)}
    .team-photo img{width:100%;height:100%;object-fit:cover}
    .team-card h4{font-size:1.1rem;margin-bottom:2px}
    .team-card .role{font-size:.86rem;color:var(--gold);font-weight:700;margin-bottom:4px}
    .team-card .spec{font-size:.85rem;color:var(--ink-soft)}

    /* ====================== 지역 ====================== */
    .geo{background:var(--bg-soft);text-align:center}
    .geo-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:32px}
    .geo-chips a{padding:12px 24px;background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-pill);font-weight:600;color:var(--ink);transition:all .28s var(--ease)}
    .geo-chips a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy)}

    /* ====================== CTA ====================== */
    .cta-box{background:var(--navy);border-radius:var(--radius-xl);padding:68px 48px;text-align:center;color:var(--inv)}
    .cta-box h2{color:var(--inv);font-size:clamp(1.9rem,3.6vw,2.7rem);margin-bottom:14px}
    .cta-box p{color:var(--inv-soft);font-size:1.12rem;margin-bottom:32px;max-width:540px;margin-left:auto;margin-right:auto}
    .cta-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

    @media(max-width:880px){
      .hero-inner,.intro-grid{grid-template-columns:1fr;gap:40px}
      .hero-img{order:-1;aspect-ratio:16/10}
      .intro-img{aspect-ratio:4/3;max-height:420px}
      .core-grid,.all-grid{grid-template-columns:1fr 1fr}
      .why-grid{grid-template-columns:1fr}
      .why-card{border-right:none;border-bottom:1px solid rgba(250,245,236,.16)}
      .why-card:last-child{border-bottom:none}
      .team-grid{grid-template-columns:repeat(3,1fr)}
    }
    @media(max-width:560px){
      .core-grid,.all-grid,.team-grid{grid-template-columns:1fr}
      .sec{padding:64px 0}
      .cta-box{padding:48px 26px}
      .team-grid{grid-template-columns:repeat(2,1fr)}
    }
  </style>

  <!-- ============ HERO ============ -->
  <section class="hero">
    <div class="wrap hero-inner">
      <div class="hero-text">
        <span class="eyebrow" data-reveal>남양주 마석 · ${CLINIC.establishedLabel}</span>
        <h1 data-reveal data-reveal-d="1">기분 좋게<br><span class="accent">진료를 마칠 때까지</span></h1>
        <p class="hero-sub" data-reveal data-reveal-d="2">
          치과는 누구에게나 조금 긴장되는 곳이지요. 그 마음까지 편안하게 살피며,
          충분한 상담과 정밀한 진단으로 함께해 온 우리 동네 치과입니다.
        </p>
        <div class="hero-cta" data-reveal data-reveal-d="3">
          <a href="/reservation" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 예약 문의하기</a>
          <a href="/treatments" class="btn btn-ghost">진료 안내 보기</a>
        </div>
        <div class="hero-meta" data-reveal data-reveal-d="4">
          <div class="hm"><b><span data-count="15" data-suffix="년+">0</span></b><span>한자리에서 함께</span></div>
          <div class="hm"><b><span data-count="5" data-suffix="인">0</span></b><span>상주 의료진</span></div>
          <div class="hm"><b>전 연령</b><span>아이부터 어르신까지</span></div>
        </div>
      </div>
      <div class="hero-img" data-reveal data-reveal-d="2">
        <img src="/static/img/clinic-reception.webp" alt="이솔치과의원 내부 전경" loading="eager">
        <div class="tag"><span class="dot"></span><span><b>진료 중</b><br><span>평일 09:30 – 18:30 · 토요일 진료</span></span></div>
      </div>
    </div>
  </section>

  <!-- ============ 소개 ============ -->
  <section class="sec intro">
    <div class="wrap intro-grid">
      <div data-reveal>
        <span class="lbl">우리 이야기</span>
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
        <span class="lbl">핵심 진료</span>
        <h2>우리가 가장 집중하는 진료</h2>
        <p>임플란트·치아교정·소아치과를 중심으로, 각 분야 전문의가 책임지고 진료합니다.</p>
      </div>
      <div class="core-grid">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card" data-reveal data-reveal-d="${i + 1}">
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
        <span class="lbl">왜 이솔치과일까요</span>
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
        <span class="lbl">전체 진료 안내</span>
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
  <section class="sec intro">
    <div class="wrap">
      <div class="sec-head" data-reveal>
        <span class="lbl">의료진 소개</span>
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
        <span class="lbl">진료 가능 지역</span>
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
