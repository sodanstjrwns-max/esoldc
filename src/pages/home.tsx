import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ===== HERO (Canvas 유체 그라데이션 + 키네틱) ===== */
    .hero{position:relative;min-height:100vh;display:flex;align-items:center;background:var(--navy);color:var(--inv);overflow:hidden;padding:150px 0 100px}
    #fluid{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block}
    .hero::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;
      background:radial-gradient(120% 90% at 50% 0%,transparent 40%,rgba(39,87,76,.55) 100%);
      mix-blend-mode:multiply}
    .hero .wrap{position:relative;z-index:2}
    .hero-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px;margin-bottom:44px;font-size:.82rem;letter-spacing:.04em;color:var(--inv-soft)}
    .hero-meta .r{text-align:right}
    .hero h1{font-size:clamp(3rem,7.6vw,6.4rem);line-height:1.16;font-weight:900;letter-spacing:-.03em;color:var(--inv);word-break:keep-all}
    .hero h1 .gd{color:var(--gold-2);font-weight:900}
    .hero-sub{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:30px;margin-top:46px}
    .hero-sub p{max-width:560px;color:var(--inv-soft);font-size:1.12rem;line-height:1.85}
    .hero-actions{display:flex;gap:14px;flex-wrap:wrap}
    .scroll-hint{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);z-index:2;color:var(--inv-soft);font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:10px}
    .scroll-hint .ln{width:1px;height:42px;background:linear-gradient(var(--gold-2),transparent);animation:scrollLn 2s var(--ease) infinite}
    @keyframes scrollLn{0%{transform:scaleY(0);transform-origin:top}40%{transform:scaleY(1);transform-origin:top}60%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

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
    .intro-quote{font-family:var(--display);font-size:clamp(1.9rem,3.6vw,2.9rem);line-height:1.55;color:var(--navy);font-weight:700;letter-spacing:-.02em;word-break:keep-all}
    .intro-quote em{font-style:normal;color:var(--gold);border-bottom:2px solid var(--gold-soft)}
    .intro p{color:var(--ink-soft);font-size:1.05rem;margin:0 0 18px}
    .intro .sign{margin-top:28px;font-family:var(--serif);color:var(--navy);font-weight:600}

    /* ===== 핵심진료 ===== */
    .core{padding:120px 0;background:var(--bg-soft)}
    .core-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
    .core-card{background:var(--bg-card);border:1px solid var(--line);border-radius:var(--radius-lg);padding:42px 36px;transition:box-shadow .4s var(--ease);position:relative;overflow:hidden;display:block}
    .core-card::after{content:'';position:absolute;left:0;top:0;width:100%;height:3px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
    .core-card:hover{box-shadow:var(--shadow-lg)}
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

    /* ===== 전체진료 (밝은 카드형 — 어르신 가독성) ===== */
    .all{padding:120px 0;background:var(--bg)}
    .all-list{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:980px;margin:0 auto}
    .all-row{display:flex;align-items:center;gap:18px;padding:24px 26px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);transition:all .35s var(--ease)}
    .all-row .ar-ic{width:50px;height:50px;border-radius:13px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:1.25rem;flex:none}
    .all-row .an{font-size:1.18rem;font-weight:800;color:var(--navy)}
    .all-row .as{color:var(--ink-soft);font-size:.9rem;margin-top:2px}
    .all-row .ar-go{margin-left:auto;color:var(--ink-faint);transition:all .3s}
    .all-row:hover{border-color:var(--navy);box-shadow:var(--shadow-sm);transform:translateY(-3px)}
    .all-row:hover .ar-go{color:var(--gold);transform:translateX(4px)}
    @media(max-width:880px){.all-list{grid-template-columns:1fr 1fr}}
    @media(max-width:560px){.all-list{grid-template-columns:1fr}}

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
    .geo .addr{font-size:1.2rem;font-weight:700;color:var(--navy);margin:18px 0 28px;display:inline-flex;align-items:center;gap:10px}
    .geo .addr i{color:var(--gold)}
    .geo-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:760px;margin:0 auto}
    .geo-chips a{padding:12px 24px;border-radius:var(--radius-pill);background:#fff;border:1px solid var(--line);font-weight:700;font-size:.95rem;color:var(--navy);transition:all .3s var(--ease)}
    .geo-chips a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy);transform:translateY(-2px)}

    /* ===== FINAL CTA ===== */
    .cta{padding:130px 0;background:var(--navy);color:var(--inv);text-align:center;position:relative;overflow:hidden}
    .cta::before{content:'';position:absolute;inset:0;background:radial-gradient(700px 500px at 50% 0%,rgba(217,142,99,.24),transparent 60%)}
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
    <canvas id="fluid"></canvas>
    <div class="wrap">
      <div class="hero-meta reveal">
        <div><i class="fas fa-location-dot" style="color:var(--gold-2)"></i> 남양주 마석 · 개원 15년차<br>각 분야 전문의 상주</div>
        <div class="r">전 연령 통합 진료<br>${CLINIC.addressShort}</div>
      </div>
      <h1>
        <span class="kin-line" data-kinetic="char">기분 좋게</span>
        <span class="kin-line"><span class="gd" data-kinetic="char">진료를 마칠</span> <span data-kinetic="char">때까지</span></span>
      </h1>
      <div class="hero-sub reveal reveal-d2">
        <p>우리 동네에서 오래 함께한 치과입니다. 임플란트·치아교정·소아치과, 각 분야 전문의가 서두르지 않고 충분히 상담하며 따뜻하게 진료해 드립니다.</p>
        <div class="hero-actions">
          <span class="magnetic"><a href="/reservation" class="btn-line fill"><i class="fas fa-calendar-check"></i> 진료 예약 문의</a></span>
          <span class="magnetic"><a href="/treatments" class="btn-line">진료 둘러보기 <i class="fas fa-arrow-right"></i></a></span>
        </div>
      </div>
    </div>
    <div class="scroll-hint reveal reveal-d3"><span>SCROLL</span><span class="ln"></span></div>
  </section>

  <script>
  (function(){
    var c=document.getElementById('fluid'); if(!c) return;
    var RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var ctx=c.getContext('2d'); var W,H,DPR=Math.min(window.devicePixelRatio||1,2);
    function resize(){ W=c.clientWidth;H=c.clientHeight;c.width=W*DPR;c.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,1,1);}
    resize(); window.addEventListener('resize',resize);
    // 유체 블롭 — 세이지/테라코타 글로우가 떠다니며 마우스에 반응
    var pal=[[60,126,112],[47,107,94],[217,142,99],[232,168,124],[39,87,76]];
    var N=5, blobs=[];
    for(var i=0;i<N;i++){ blobs.push({
      x:Math.random(),y:Math.random(),
      vx:(Math.random()-.5)*0.0006,vy:(Math.random()-.5)*0.0006,
      r:0.34+Math.random()*0.22, col:pal[i%pal.length], ph:Math.random()*6.28 }); }
    var mx=0.5,my=0.4,tmx=0.5,tmy=0.4;
    c.parentElement.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();tmx=(e.clientX-r.left)/r.width;tmy=(e.clientY-r.top)/r.height;},{passive:true});
    var t=0;
    function draw(){
      t+=0.005; mx+=(tmx-mx)*0.04; my+=(tmy-my)*0.04;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#27574C'; ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation='lighter';
      for(var i=0;i<N;i++){var b=blobs[i];
        b.x+=b.vx; b.y+=b.vy;
        if(b.x<-.2||b.x>1.2)b.vx*=-1; if(b.y<-.2||b.y>1.2)b.vy*=-1;
        var ox=Math.sin(t+b.ph)*0.05, oy=Math.cos(t*0.8+b.ph)*0.05;
        var infl=(i===2||i===3)?0.14:0.06; // 테라코타가 마우스에 더 반응
        var px=(b.x+ox+(mx-0.5)*infl)*W, py=(b.y+oy+(my-0.5)*infl)*H;
        var rad=b.r*Math.min(W,H)*(1+Math.sin(t*1.2+b.ph)*0.08);
        var g=ctx.createRadialGradient(px,py,0,px,py,rad);
        var col=b.col;
        g.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+',0.55)');
        g.addColorStop(1,'rgba('+col[0]+','+col[1]+','+col[2]+',0)');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px,py,rad,0,6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation='source-over';
      if(!RM) requestAnimationFrame(draw);
    }
    if(RM){ ctx.fillStyle='#27574C'; ctx.fillRect(0,0,W,H);
      // 정적 폴백 글로우
      var g=ctx.createRadialGradient(W*0.75,H*0.3,0,W*0.75,H*0.3,Math.min(W,H)*0.6);
      g.addColorStop(0,'rgba(217,142,99,0.4)');g.addColorStop(1,'rgba(217,142,99,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    } else { requestAnimationFrame(draw); }
  })();
  </script>

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
        <div data-par="0.12">
          <span class="eyebrow reveal">About ${CLINIC.nameEn}</span>
          <p class="intro-quote" style="margin-top:24px" data-kinetic="word">치과는 누구에게나 조금은 긴장되는 공간입니다. 그 마음을 편안하게 바꾸는 것, 그것이 우리의 일입니다.</p>
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
        <h2 data-kinetic="word">우리가 집중하는 진료</h2>
        <p>각 분야 전문의가 책임지는 핵심 진료를 안내합니다.</p>
      </div>
      <div class="core-grid">
        ${raw(CORE_TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="core-card tilt reveal reveal-d${i + 1}">
            <span class="tilt-inner">
              <span class="no">0${i + 1}</span>
              <span class="ci"><i class="fas ${t.icon}"></i></span>
              <h3>${t.name}</h3>
              <p>${t.short}</p>
              <span class="go">자세히 보기 <i class="fas fa-arrow-right"></i></span>
            </span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ Why ============ -->
  <section class="why">
    <div class="wrap">
      <div class="section-head reveal" style="text-align:left;margin:0 0 56px;max-width:none">
        <span class="eyebrow">Why ISOL</span>
        <h2 style="font-size:clamp(1.8rem,4vw,2.7rem);margin-top:14px" data-kinetic="word">왜 이솔치과일까요</h2>
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
        <span class="eyebrow" style="justify-content:center">All Treatments</span>
        <h2 data-kinetic="word">전체 진료과목</h2>
        <p>충치 치료부터 임플란트까지, 온 가족 진료를 한 곳에서.</p>
      </div>
      <div class="all-list">
        ${raw(TREATMENTS.map((t) => `
          <a href="/treatments/${t.slug}" class="all-row reveal">
            <span class="ar-ic"><i class="fas ${t.icon}"></i></span>
            <span><span class="an">${t.name}</span><span class="as">${t.short}</span></span>
            <i class="fas fa-arrow-right ar-go"></i>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ============ 의료진 ============ -->
  <section class="team">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center">Medical Team</span>
        <h2 data-kinetic="word">전문의 의료진</h2>
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
      <div class="addr"><i class="fas fa-location-dot"></i> ${CLINIC.address}</div>
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
