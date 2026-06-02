import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ===== HERO ===== */
    .hero{position:relative;min-height:92vh;display:flex;align-items:center;background:var(--navy);color:var(--inv);overflow:hidden;padding:140px 0 90px}
    .hero::before{content:'';position:absolute;inset:0;background:
      radial-gradient(900px 600px at 78% 18%,rgba(176,141,79,.16),transparent 60%),
      radial-gradient(700px 500px at 10% 90%,rgba(30,69,107,.5),transparent 60%)}
    .hero .wrap{position:relative;z-index:2}
    .hero-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px;margin-bottom:40px;font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:var(--inv-faint)}
    .hero-meta .r{text-align:right}
    .hero h1{font-size:clamp(2.6rem,6.4vw,5rem);line-height:1.22;font-weight:700;letter-spacing:-.01em;color:var(--inv)}
    .hero h1 .gd{color:var(--gold-2)}
    .hero-sub{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:30px;margin-top:42px}
    .hero-sub p{max-width:540px;color:var(--inv-soft);font-size:1.08rem;line-height:1.85}
    .hero-actions{display:flex;gap:12px;flex-wrap:wrap}

    /* ===== 신뢰 지표 바 ===== */
    .trust{background:var(--bg-soft);border-bottom:1px solid var(--line)}
    .trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
    .trust-item{padding:42px 24px;text-align:center;border-right:1px solid var(--line)}
    .trust-item:last-child{border-right:none}
    .trust-item .n{font-family:var(--serif);font-size:2.4rem;font-weight:700;color:var(--navy)}
    .trust-item .n .u{font-size:1.1rem;color:var(--gold);margin-left:3px}
    .trust-item .l{font-size:.9rem;color:var(--ink-soft);margin-top:6px}

    /* ===== 소개 인트로 ===== */
    .intro{padding:120px 0}
    .intro-grid{display:grid;grid-template-columns:1fr 1.1fr;gap:72px;align-items:center}
    .intro-quote{font-family:var(--serif);font-size:clamp(1.7rem,3.2vw,2.6rem);line-height:1.55;color:var(--navy);font-weight:500}
    .intro-quote em{font-style:normal;color:var(--gold);border-bottom:2px solid var(--gold-soft)}
    .intro p{color:var(--ink-soft);font-size:1.05rem;margin:0 0 18px}
    .intro .sign{margin-top:28px;font-family:var(--serif);color:var(--navy);font-weight:600}

    /* ===== 핵심진료 ===== */
    .core{padding:120px 0;background:var(--bg-soft)}
    .core-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
    .core-card{background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-lg);padding:42px 36px;transition:all .4s var(--ease);position:relative;overflow:hidden}
    .core-card::after{content:'';position:absolute;left:0;top:0;width:100%;height:3px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
    .core-card:hover{box-shadow:var(--shadow);transform:translateY(-5px)}
    .core-card:hover::after{transform:scaleX(1)}
    .core-card .ci{width:62px;height:62px;border-radius:12px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:1.6rem;margin-bottom:24px}
    .core-card .no{position:absolute;top:30px;right:34px;font-family:var(--serif);font-size:1.1rem;color:var(--ink-faint)}
    .core-card h3{font-size:1.5rem;margin-bottom:10px}
    .core-card p{color:var(--ink-soft);font-size:.97rem;margin-bottom:22px}
    .core-card .go{font-weight:600;color:var(--navy);font-size:.92rem;display:inline-flex;align-items:center;gap:8px;transition:gap .3s}
    .core-card:hover .go{gap:14px;color:var(--gold)}

    /* ===== Why ===== */
    .why{padding:120px 0}
    .why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
    .why-item{padding:8px 0}
    .why-item .wn{font-family:var(--serif);font-size:1rem;color:var(--gold);font-weight:600;letter-spacing:.05em}
    .why-item h3{font-size:1.22rem;margin:14px 0 10px;line-height:1.4}
    .why-item p{color:var(--ink-soft);font-size:.95rem}
    .why-item{border-top:2px solid var(--navy);padding-top:24px}

    /* ===== 전체진료 ===== */
    .all{padding:120px 0;background:var(--navy);color:var(--inv)}
    .all .section-head h2{color:var(--inv)}
    .all .section-head p{color:var(--inv-soft)}
    .all-list{max-width:880px;margin:0 auto}
    .all-row{display:flex;align-items:center;justify-content:space-between;padding:26px 4px;border-bottom:1px solid rgba(250,248,244,.14);transition:all .35s var(--ease)}
    .all-row .an{font-family:var(--serif);font-size:clamp(1.2rem,2.6vw,1.7rem);font-weight:600;color:var(--inv);display:flex;gap:18px;align-items:baseline}
    .all-row .an .ai{font-size:.85rem;color:var(--gold-2)}
    .all-row .as{color:var(--inv-faint);font-size:.92rem}
    .all-row:hover{padding-left:18px;border-color:var(--gold)}
    .all-row:hover .an{color:var(--gold-2)}

    /* ===== 의료진 ===== */
    .team{padding:120px 0}
    .team-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
    .team-card{transition:transform .4s var(--ease)}
    .team-card .ph{border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:3/4;background:var(--bg-soft);border:1px solid var(--line)}
    .team-card .ph img{width:100%;height:100%;object-fit:cover;transition:transform .7s var(--ease)}
    .team-card:hover .ph img{transform:scale(1.05)}
    .team-card .nm{font-family:var(--serif);font-size:1.15rem;font-weight:700;color:var(--navy);margin-top:16px}
    .team-card .rl{color:var(--ink-soft);font-size:.86rem;margin-top:3px}
    @media(max-width:900px){.team-grid{grid-template-columns:repeat(2,1fr)}}

    /* ===== 지역 ===== */
    .geo{padding:110px 0;background:var(--bg-soft);text-align:center}
    .geo .addr{font-family:var(--serif);font-size:1.15rem;color:var(--navy);margin:18px 0 28px}
    .geo-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:760px;margin:0 auto}
    .geo-chips a{padding:11px 22px;border-radius:var(--radius);background:#fff;border:1px solid var(--line);font-weight:600;font-size:.9rem;color:var(--navy);transition:all .3s var(--ease)}
    .geo-chips a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy)}

    /* ===== FINAL CTA ===== */
    .cta{padding:130px 0;background:var(--navy);color:var(--inv);text-align:center;position:relative;overflow:hidden}
    .cta::before{content:'';position:absolute;inset:0;background:radial-gradient(700px 500px at 50% 0%,rgba(176,141,79,.2),transparent 60%)}
    .cta .wrap{position:relative;z-index:2}
    .cta h2{font-size:clamp(2rem,5vw,3.4rem);color:var(--inv);line-height:1.35}
    .cta h2 .gd{color:var(--gold-2)}
    .cta p{color:var(--inv-soft);margin:22px 0 38px;font-size:1.05rem}
    .cta .tel{font-family:var(--serif);font-size:clamp(1.6rem,4vw,2.6rem);font-weight:700;color:var(--inv);display:inline-flex;gap:14px;align-items:center}
    .cta .tel i{color:var(--gold-2)}

    @media(max-width:980px){
      .trust-grid{grid-template-columns:repeat(2,1fr)}
      .trust-item:nth-child(2){border-right:none}
      .trust-item{border-bottom:1px solid var(--line)}
      .core-grid{grid-template-columns:1fr}
      .why-grid{grid-template-columns:1fr 1fr}
      .intro-grid{grid-template-columns:1fr;gap:40px}
    }
    @media(max-width:560px){.why-grid{grid-template-columns:1fr}}
  </style>

  <!-- ============ HERO ============ -->
  <section class="hero">
    <div class="wrap">
      <div class="hero-meta reveal">
        <div>EST. 2011 · 남양주 마석<br>각 분야 전문의 상주</div>
        <div class="r">ISOL DENTAL CLINIC<br>${CLINIC.addressShort}</div>
      </div>
      <h1 class="reveal reveal-d1">기분 좋게<br><span class="gd">진료를 마칠</span> 때까지</h1>
      <div class="hero-sub reveal reveal-d2">
        <p>화려한 수식어 대신, 한자리에서 쌓아온 시간으로. 임플란트·치아교정·소아치과, 각 분야 전문의가 충분히 상담하고 정밀하게 진료합니다.</p>
        <div class="hero-actions">
          <a href="/reservation" class="btn-line fill"><i class="fas fa-calendar-check"></i> 진료 예약 문의</a>
          <a href="/treatments" class="btn-line">진료 둘러보기 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 신뢰 지표 ============ -->
  <section class="trust">
    <div class="wrap">
      <div class="trust-grid">
        <div class="trust-item"><div class="n"><span data-count="15">0</span><span class="u">년+</span></div><div class="l">한자리에서 지켜온 시간</div></div>
        <div class="trust-item"><div class="n"><span data-count="5">0</span><span class="u">개</span></div><div class="l">분야별 전문 진료과목</div></div>
        <div class="trust-item"><div class="n"><span data-count="6">0</span><span class="u">개</span></div><div class="l">전체 진료 서비스</div></div>
        <div class="trust-item"><div class="n">전문의<span class="u">상주</span></div><div class="l">임플란트·교정·소아 등</div></div>
      </div>
    </div>
  </section>

  <!-- ============ 소개 인트로 ============ -->
  <section class="intro">
    <div class="wrap">
      <div class="intro-grid">
        <div class="reveal">
          <span class="eyebrow">About ${CLINIC.nameEn}</span>
          <p class="intro-quote" style="margin-top:24px">치과는 누구에게나<br>조금은 긴장되는 공간입니다.<br>그 마음을 <em>편안하게</em> 바꾸는 것,<br>그것이 우리의 일입니다.</p>
        </div>
        <div class="reveal reveal-d1">
          <p>남양주 마석에서 한자리를 지키며, 처음 오셨던 아이가 학부모가 되어 다시 찾아오는 시간을 함께해 왔습니다.</p>
          <p>임플란트, 치아교정, 소아치과를 비롯해 각 분야 전문 의료진이 함께합니다. 쫓기듯 진행하지 않고, 충분한 상담과 설명을 약속드립니다.</p>
          <p>가장 편하게 떠올릴 수 있는 우리 동네 치과 — 이솔치과의원이 바라는 모습입니다.</p>
          <div class="sign">— 대표원장 ${CLINIC.business.owner}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ 핵심진료 ============ -->
  <section class="core">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center">Core Specialty</span>
        <h2>우리가 집중하는 진료</h2>
        <p>각 분야 전문의가 책임지는 핵심 진료를 안내합니다.</p>
      </div>
      <div class="core-grid">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card reveal reveal-d${i + 1}">
            <span class="no">0${i + 1}</span>
            <span class="ci"><i class="fas ${t.icon}"></i></span>
            <h3>${t.name}</h3>
            <p>${t.short}</p>
            <span class="go">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ Why ============ -->
  <section class="why">
    <div class="wrap">
      <div class="section-head reveal" style="text-align:left;margin:0 0 56px;max-width:none">
        <span class="eyebrow">Why ISOL</span>
        <h2 style="font-size:clamp(1.8rem,4vw,2.7rem);margin-top:14px">왜 이솔치과일까요</h2>
      </div>
      <div class="why-grid">
        <div class="why-item reveal"><div class="wn">01</div><h3>각 분야 전문의 상주</h3><p>임플란트·교정·소아치과 등 분야별 전문 의료진이 함께합니다. 한 곳에서 전 연령 진료가 가능합니다.</p></div>
        <div class="why-item reveal reveal-d1"><div class="wn">02</div><h3>여유로운 체어타임</h3><p>쫓기듯 진행하지 않습니다. 충분한 상담과 설명을 약속드립니다.</p></div>
        <div class="why-item reveal reveal-d2"><div class="wn">03</div><h3>친절을 기본으로</h3><p>숙련된 의료진과 스태프가 편안한 분위기에서 진료합니다.</p></div>
        <div class="why-item reveal reveal-d3"><div class="wn">04</div><h3>한자리에서 쌓은 신뢰</h3><p>오랜 시간 지켜온 자리와 직원 숙련도가 이솔치과의 가장 큰 자산입니다.</p></div>
      </div>
    </div>
  </section>

  <!-- ============ 전체진료 ============ -->
  <section class="all">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center;color:var(--gold-2)">All Treatments</span>
        <h2>전체 진료과목</h2>
      </div>
      <div class="all-list">
        ${raw(TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="all-row reveal">
            <span class="an"><span class="ai">${String(i + 1).padStart(2, '0')}</span> ${t.name}</span>
            <span class="as">${t.short} <i class="fas fa-arrow-right" style="margin-left:10px"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 의료진 ============ -->
  <section class="team">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center">Medical Team</span>
        <h2>전문의 의료진</h2>
      </div>
      <div class="team-grid">
        ${raw(DOCTORS.map((d, i) => `
          <a href="/doctors/${d.slug}" class="team-card reveal reveal-d${(i % 4) + 1}">
            <div class="ph"><img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.specialty}" loading="lazy"></div>
            <div class="nm">${d.name}</div>
            <div class="rl">${d.role} · ${d.specialty}</div>
          </a>`).join(''))}
      </div>
      <div style="text-align:center;margin-top:48px" class="reveal"><a href="/doctors" class="btn btn-ghost">의료진 전체 보기 <i class="fas fa-arrow-right"></i></a></div>
    </div>
  </section>

  <!-- ============ 지역 ============ -->
  <section class="geo">
    <div class="wrap">
      <span class="eyebrow" style="justify-content:center">Location</span>
      <div class="addr">${CLINIC.address}</div>
      <div class="geo-chips reveal">
        ${raw(NEARBY_AREAS.slice(0, 6).map(a => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a>`).join(''))}
        ${raw(NEARBY_AREAS.slice(0, 4).map(a => `<a href="/area/${a.slug}-orthodontics">${a.name} 교정</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ FINAL CTA ============ -->
  <section class="cta">
    <div class="wrap">
      <h2 class="reveal">편하게 <span class="gd">문의</span>하세요</h2>
      <p class="reveal reveal-d1">진료 예약과 상담, 친절하게 안내해 드리겠습니다.</p>
      <a href="tel:${CLINIC.tel}" class="tel reveal reveal-d2"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
      <div style="margin-top:36px" class="reveal reveal-d3"><a href="/reservation" class="btn-line fill">온라인 예약 문의 <i class="fas fa-arrow-right"></i></a></div>
    </div>
  </section>
  `;
}
