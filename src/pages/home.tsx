import { html, raw } from 'hono/html';
import { CLINIC, CORE_TREATMENTS, TREATMENTS, DOCTORS, NEARBY_AREAS } from '../data/clinic';

export function HomePage() {
  return html`
  <style>
    /* ============ HERO : 인터랙티브 캔버스 + 키네틱 타이포 ============ */
    .hero{position:relative;min-height:100svh;background:var(--bg-ink);color:var(--ink-inv);overflow:hidden;display:flex;flex-direction:column;justify-content:center}
    #heroCanvas{position:absolute;inset:0;width:100%;height:100%;z-index:1}
    .hero::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(circle at 50% 60%,transparent 40%,rgba(12,20,19,.7) 100%)}
    .hero-inner{position:relative;z-index:3;width:100%;pointer-events:none}
    .hero-meta{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;margin-bottom:42px;font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(244,241,233,.5)}
    .hero-meta .r{text-align:right}
    .hero h1{font-size:clamp(3rem,11vw,10rem);line-height:.92;font-weight:800;letter-spacing:-.045em;margin:0}
    .hero h1 .it{font-family:var(--serif);font-style:italic;font-weight:500;color:var(--accent);letter-spacing:-.01em}
    .hero-sub{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:24px;margin-top:48px;pointer-events:auto}
    .hero-sub p{max-width:440px;color:rgba(244,241,233,.7);font-size:1.05rem;line-height:1.7}
    .hero-actions{display:flex;gap:14px;flex-wrap:wrap}
    .btn-line{display:inline-flex;align-items:center;gap:10px;color:var(--ink-inv);font-weight:700;padding:16px 30px;border-radius:999px;border:1px solid rgba(244,241,233,.25);transition:all .4s var(--ease);font-size:.95rem}
    .btn-line:hover{background:var(--ink-inv);color:var(--bg-ink);border-color:var(--ink-inv)}
    .btn-line.fill{background:var(--accent);color:#1a1407;border-color:var(--accent)}
    .btn-line.fill:hover{background:#e0bd7d}
    .scroll-ind{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:3;color:rgba(244,241,233,.4);font-size:.7rem;letter-spacing:.3em;display:flex;flex-direction:column;align-items:center;gap:10px}
    .scroll-ind::after{content:'';width:1px;height:48px;background:linear-gradient(rgba(244,241,233,.5),transparent);animation:scline 2s var(--ease) infinite}
    @keyframes scline{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.1%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

    /* ============ 마퀴 (running ticker) ============ */
    .marquee{background:var(--accent);color:#1a1407;padding:18px 0;overflow:hidden;white-space:nowrap;border-top:1px solid rgba(0,0,0,.1)}
    .marquee-track{display:inline-flex;gap:54px;animation:marq 28s linear infinite;font-family:var(--serif);font-style:italic;font-size:1.5rem;font-weight:500}
    .marquee-track span{display:inline-flex;align-items:center;gap:54px}
    .marquee-track span::after{content:'✺';font-style:normal;opacity:.6}
    @keyframes marq{to{transform:translateX(-50%)}}
    @media(prefers-reduced-motion:reduce){.marquee-track{animation:none}}

    /* ============ MANIFESTO (fill-text) ============ */
    .manifesto{background:var(--bg);padding:160px 0}
    .manifesto .big{font-size:clamp(1.8rem,5vw,4rem);font-weight:800;line-height:1.25;letter-spacing:-.03em;color:var(--ink);max-width:1000px}
    .manifesto .big em{font-family:var(--serif);font-style:italic;font-weight:500;color:var(--brand)}

    /* ============ 에디토리얼 인덱스 — 핵심진료 ============ */
    .index{background:var(--bg-ink);color:var(--ink-inv);padding:140px 0}
    .index-head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid rgba(244,241,233,.15);padding-bottom:28px;margin-bottom:10px}
    .index-head .lbl{font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:rgba(244,241,233,.5)}
    .index-head h2{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800}
    .idx-row{display:grid;grid-template-columns:120px 1fr auto;gap:30px;align-items:center;padding:42px 0;border-bottom:1px solid rgba(244,241,233,.12);position:relative;transition:all .5s var(--ease);overflow:hidden}
    .idx-row .idx-num{font-size:4.5rem}
    .idx-row .idx-mid h3{font-size:clamp(1.8rem,4vw,3.2rem);font-weight:800;letter-spacing:-.02em;transition:transform .5s var(--ease-kinetic),color .4s}
    .idx-row .idx-mid p{color:rgba(244,241,233,.55);margin-top:6px;font-size:1rem;transition:opacity .4s}
    .idx-row .idx-go{width:56px;height:56px;border-radius:50%;border:1px solid rgba(244,241,233,.3);display:grid;place-items:center;font-size:1.1rem;transition:all .5s var(--ease);flex:none}
    .idx-row::before{content:'';position:absolute;left:0;bottom:0;width:0;height:100%;background:var(--accent);z-index:-1;transition:width .55s var(--ease-kinetic)}
    .idx-row:hover::before{width:100%}
    .idx-row:hover .idx-num{color:#1a1407}
    .idx-row:hover .idx-mid h3{color:#1a1407;transform:translateX(14px)}
    .idx-row:hover .idx-mid p{color:rgba(26,20,7,.7)}
    .idx-row:hover .idx-go{background:#1a1407;color:var(--accent);border-color:#1a1407;transform:rotate(-45deg)}
    @media(max-width:760px){.idx-row{grid-template-columns:64px 1fr;gap:18px}.idx-row .idx-num{font-size:2.4rem}.idx-row .idx-go{display:none}}

    /* ============ STICKY 철학 ============ */
    .philo2{background:var(--bg-cream);position:relative}
    .philo-sticky{position:sticky;top:0;height:100svh;display:flex;align-items:center;overflow:hidden}
    .philo-q{font-size:clamp(1.6rem,4.5vw,3.6rem);font-weight:800;line-height:1.3;letter-spacing:-.02em;max-width:1100px}
    .philo-q .seq{opacity:.18;transition:opacity .5s var(--ease)}
    .philo-q .accent{color:var(--brand)}
    .philo-q .it{font-family:var(--serif);font-style:italic;font-weight:500;color:var(--accent)}
    .philo-spacer{height:120vh}

    /* ============ 매거진 그리드 — 강점 ============ */
    .why2{background:var(--bg);padding:140px 0}
    .why-mag{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-auto-rows:minmax(220px,auto);gap:18px}
    .why-tile{border-radius:var(--radius-lg);padding:40px;display:flex;flex-direction:column;justify-content:space-between;transition:all .5s var(--ease);position:relative;overflow:hidden}
    .why-tile .wt-no{font-family:var(--serif);font-style:italic;font-size:1.4rem;opacity:.5}
    .why-tile h3{font-size:1.6rem;margin:0 0 8px}
    .why-tile p{font-size:.96rem;line-height:1.7}
    .why-tile:hover{transform:translateY(-6px)}
    .wt-dark{background:var(--bg-ink);color:var(--ink-inv);grid-row:span 2}
    .wt-dark h3{font-size:2.2rem}.wt-dark p{color:rgba(244,241,233,.65)}
    .wt-green{background:var(--brand);color:#fff}.wt-green p{color:rgba(255,255,255,.8)}
    .wt-gold{background:var(--accent);color:#1a1407}.wt-gold p{color:rgba(26,20,7,.72)}
    .wt-cream{background:var(--bg-cream);color:var(--ink);grid-column:span 2}.wt-cream p{color:var(--ink-soft)}
    @media(max-width:860px){.why-mag{grid-template-columns:1fr}.wt-dark,.wt-cream{grid-row:auto;grid-column:auto}}

    /* ============ 전체진료 — 호버 리스트 ============ */
    .all-treat{background:var(--bg-ink);color:var(--ink-inv);padding:120px 0}
    .at-list a{display:flex;align-items:center;justify-content:space-between;padding:26px 0;border-bottom:1px solid rgba(244,241,233,.12);transition:all .4s var(--ease)}
    .at-list a .atn{font-size:clamp(1.3rem,3vw,2rem);font-weight:700;transition:transform .4s var(--ease-kinetic)}
    .at-list a .ats{color:rgba(244,241,233,.45);font-size:.9rem}
    .at-list a:hover{padding-left:20px}
    .at-list a:hover .atn{color:var(--accent);transform:translateX(6px)}

    /* ============ 의료진 — 가로 스크롤 카드 ============ */
    .docs2{background:var(--bg);padding:140px 0 120px}
    .doc-scroll{display:flex;gap:24px;overflow-x:auto;padding:10px 24px 30px;scroll-snap-type:x mandatory;-ms-overflow-style:none;scrollbar-width:none}
    .doc-scroll::-webkit-scrollbar{display:none}
    .doc-card2{flex:0 0 320px;scroll-snap-align:center}
    .doc-card2 .ph{position:relative;border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:3/4;background:var(--brand-soft)}
    .doc-card2 .ph img{width:100%;height:100%;object-fit:cover;transition:transform .8s var(--ease)}
    .doc-card2:hover .ph img{transform:scale(1.06)}
    .doc-card2 .ph .num{position:absolute;top:16px;left:18px;font-family:var(--serif);font-style:italic;color:#fff;font-size:1.4rem;text-shadow:0 2px 12px rgba(0,0,0,.4)}
    .doc-card2 .meta{padding:18px 4px}
    .doc-card2 .meta .dn{font-size:1.4rem;font-weight:800}
    .doc-card2 .meta .ds{color:var(--ink-soft);font-size:.92rem}

    /* ============ 지역 ============ */
    .geo2{background:var(--bg-cream);padding:120px 0}
    .geo-marq{font-family:var(--serif);font-style:italic;font-size:clamp(2rem,6vw,5rem);color:var(--brand);white-space:nowrap;overflow:hidden}
    .geo-track{display:inline-flex;gap:40px;animation:marq 30s linear infinite}
    .geo-track span::after{content:'·';margin-left:40px;color:var(--accent)}
    .geo-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:40px}
    .geo-chips a{padding:11px 20px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:600;font-size:.9rem;transition:all .35s var(--ease)}
    .geo-chips a:hover{background:var(--brand);color:#fff;border-color:var(--brand);transform:translateY(-3px)}

    /* ============ FINAL ============ */
    .final2{background:var(--bg-ink);color:var(--ink-inv);padding:150px 0;text-align:center;position:relative;overflow:hidden}
    .final2 .glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,106,.25),transparent 65%);top:50%;left:50%;transform:translate(-50%,-50%)}
    .final2 h2{font-size:clamp(2.4rem,7vw,6rem);font-weight:800;line-height:1;letter-spacing:-.03em;position:relative}
    .final2 h2 .it{font-family:var(--serif);font-style:italic;font-weight:500;color:var(--accent)}
    .final2 p{color:rgba(244,241,233,.6);margin:24px 0 40px;position:relative}
    .final2 .tel{font-size:clamp(1.6rem,4vw,2.6rem);font-weight:800;letter-spacing:-.01em;position:relative;display:inline-flex;gap:14px;align-items:center}
  </style>

  <!-- ================= HERO ================= -->
  <section class="hero">
    <canvas id="heroCanvas"></canvas>
    <div class="wrap hero-inner">
      <div class="hero-meta">
        <div>EST. 2011 — 남양주 마석<br>각 분야 전문의 상주</div>
        <div class="r">N 37.64 / E 127.31<br>ISOL DENTAL CLINIC</div>
      </div>
      <h1 data-kinetic>기분 좋게<br><span class="it">진료를 마칠</span> 때까지</h1>
      <div class="hero-sub">
        <p data-words>화려한 수식어 대신, 15년 동안 한자리에서. 임플란트·교정·소아치과, 각 분야 전문의가 충분히 상담하고 정밀하게 진료합니다.</p>
        <div class="hero-actions">
          <a href="/reservation" class="btn-line fill magnetic"><i class="fas fa-calendar-check"></i> 진료 예약</a>
          <a href="/treatments" class="btn-line magnetic">진료 둘러보기 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
    <div class="scroll-ind">SCROLL</div>
  </section>

  <!-- ================= MARQUEE ================= -->
  <div class="marquee" aria-hidden="true">
    <div class="marquee-track">
      <span>임플란트 ${'&nbsp;'} 치아교정 ${'&nbsp;'} 소아치과 ${'&nbsp;'} 심미보철 ${'&nbsp;'} 잇몸치료 ${'&nbsp;'} 개원 15년차 ${'&nbsp;'} 전문의 상주 </span>
      <span>임플란트 ${'&nbsp;'} 치아교정 ${'&nbsp;'} 소아치과 ${'&nbsp;'} 심미보철 ${'&nbsp;'} 잇몸치료 ${'&nbsp;'} 개원 15년차 ${'&nbsp;'} 전문의 상주 </span>
    </div>
  </div>

  <!-- ================= MANIFESTO ================= -->
  <section class="manifesto">
    <div class="wrap">
      <p class="eyebrow reveal" style="margin-bottom:30px">— Manifesto</p>
      <h2 class="big"><span class="fill-text">치과는 누구에게나 조금은 긴장되는 공간입니다. 우리가 바라는 건, 진료가 끝났을 때 <em>"오길 잘했다"</em>는 마음으로 돌아가시는 것. 그뿐입니다.</span></h2>
    </div>
  </section>

  <!-- ================= INDEX : 핵심진료 ================= -->
  <section class="index">
    <div class="wrap">
      <div class="index-head reveal">
        <div><div class="lbl">Index — Core Specialty</div><h2>우리가 집중하는 진료</h2></div>
        <div class="lbl" style="text-align:right">전문의가<br>책임지는 3가지</div>
      </div>
      ${raw(CORE_TREATMENTS.map((t, i) => `
        <a href="/treatments/${t.slug}" class="idx-row reveal" data-cursor>
          <span class="idx-num">0${i + 1}</span>
          <span class="idx-mid"><h3>${t.name}</h3><p>${t.short}</p></span>
          <span class="idx-go"><i class="fas fa-arrow-right"></i></span>
        </a>`).join(''))}
    </div>
  </section>

  <!-- ================= STICKY 철학 ================= -->
  <section class="philo2" id="philo">
    <div class="philo-sticky">
      <div class="wrap">
        <p class="philo-q" id="philoText">
          <span class="seq">남양주 마석에서 15년.</span>
          <span class="seq">처음 오셨던 아이가 학부모가 되어</span>
          <span class="seq">다시 찾아오는 시간 속에서,</span>
          <span class="seq accent">우리는</span>
          <span class="seq it">'동네 치과'</span>
          <span class="seq accent">의 의미를 새깁니다.</span>
        </p>
      </div>
    </div>
    <div class="philo-spacer"></div>
  </section>

  <!-- ================= 매거진 그리드 — 강점 ================= -->
  <section class="why2">
    <div class="wrap">
      <div class="section-head reveal" style="text-align:left;margin-bottom:48px">
        <span class="eyebrow">Why ISOL</span>
        <h2 style="font-size:clamp(1.8rem,4vw,2.8rem);margin-top:12px">왜 이솔치과일까요</h2>
      </div>
      <div class="why-mag">
        <div class="why-tile wt-dark reveal"><div class="wt-no">01</div><div><h3>각 분야<br>전문의 상주</h3><p>임플란트·교정·소아치과 등 분야별 전문 의료진이 함께합니다. 한 곳에서 전 연령, 다양한 진료가 가능합니다.</p></div></div>
        <div class="why-tile wt-gold reveal reveal-d1"><div class="wt-no">02</div><div><h3>여유로운<br>체어타임</h3><p>쫓기듯 진행하지 않습니다. 충분한 상담과 설명을 약속합니다.</p></div></div>
        <div class="why-tile wt-green reveal reveal-d2"><div class="wt-no">03</div><div><h3>친절을<br>기본으로</h3><p>숙련된 의료진과 스태프가 따뜻한 분위기에서 진료합니다.</p></div></div>
        <div class="why-tile wt-cream reveal reveal-d1"><div class="wt-no">04</div><div><h3>15년의 신뢰, 그리고 숙련도</h3><p>한자리를 지키며 쌓아온 시간과 직원 숙련도가 이솔치과의 가장 큰 자산입니다. 지역 안에서 가장 편하게 떠올릴 수 있는 치과가 되는 것이 목표입니다.</p></div></div>
      </div>
    </div>
  </section>

  <!-- ================= 전체진료 호버 리스트 ================= -->
  <section class="all-treat">
    <div class="wrap">
      <div class="index-head reveal"><div><div class="lbl" style="color:rgba(244,241,233,.5)">All Treatments</div><h2>전체 진료과목</h2></div></div>
      <div class="at-list" style="margin-top:10px">
        ${raw(TREATMENTS.map((t, i) => `
          <a href="/treatments/${t.slug}" class="reveal" data-cursor>
            <span class="atn">${String(i + 1).padStart(2, '0')} ${t.name}</span>
            <span class="ats">${t.short} <i class="fas fa-arrow-up-right" style="margin-left:10px"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ================= 의료진 가로 스크롤 ================= -->
  <section class="docs2">
    <div class="wrap" style="margin-bottom:10px">
      <div class="section-head reveal" style="text-align:left">
        <span class="eyebrow">Medical Team</span>
        <h2 style="font-size:clamp(1.8rem,4vw,2.8rem);margin-top:12px">전문의 의료진</h2>
      </div>
    </div>
    <div class="doc-scroll">
      ${raw(DOCTORS.map((d, i) => `
        <a href="/doctors/${d.slug}" class="doc-card2" data-cursor>
          <div class="ph"><span class="num">0${i + 1}</span><img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.specialty}" loading="lazy"></div>
          <div class="meta"><div class="dn">${d.name}</div><div class="ds">${d.role} · ${d.specialty}</div></div>
        </a>`).join(''))}
    </div>
    <div class="wrap" style="text-align:center;margin-top:30px"><a href="/doctors" class="btn btn-primary magnetic">의료진 전체 보기</a></div>
  </section>

  <!-- ================= 지역 ================= -->
  <section class="geo2">
    <div class="geo-marq" aria-hidden="true"><div class="geo-track"><span>남양주</span><span>마석</span><span>화도</span><span>와부</span><span>진건</span><span>오남</span><span>수동</span><span>가평</span><span>남양주</span><span>마석</span><span>화도</span><span>와부</span></div></div>
    <div class="wrap" style="text-align:center;margin-top:36px">
      <p class="reveal" style="color:var(--ink-soft)">${CLINIC.address}</p>
      <div class="geo-chips reveal" style="justify-content:center">
        ${raw(NEARBY_AREAS.slice(0, 6).map(a => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a>`).join(''))}
        ${raw(NEARBY_AREAS.slice(0, 4).map(a => `<a href="/area/${a.slug}-orthodontics">${a.name} 교정</a>`).join(''))}
      </div>
    </div>
  </section>

  <!-- ================= FINAL ================= -->
  <section class="final2">
    <div class="glow"></div>
    <div class="wrap">
      <h2 data-kinetic>지금,<br><span class="it">편하게</span> 문의하세요</h2>
      <p class="reveal reveal-d1">친절하게 안내해 드리겠습니다.</p>
      <a href="tel:${CLINIC.tel}" class="tel magnetic" data-cursor><i class="fas fa-phone" style="color:var(--accent)"></i> ${CLINIC.tel}</a>
      <div style="margin-top:36px"><a href="/reservation" class="btn-line magnetic">온라인 예약 문의 <i class="fas fa-arrow-right"></i></a></div>
    </div>
  </section>

  <!-- ================= HERO CANVAS + STICKY 철학 스크립트 ================= -->
  <script>
  (function(){
    var reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    // ---- HERO 파티클 캔버스 (마우스 반응 + 연결선) ----
    var cv=document.getElementById('heroCanvas');
    if(cv && !reduced){
      var ctx=cv.getContext('2d'),W,H,pts=[],mouse={x:-999,y:-999},DPR=Math.min(devicePixelRatio||1,2);
      function resize(){W=cv.width=innerWidth*DPR;H=cv.height=cv.offsetHeight*DPR;cv.style.width=innerWidth+'px';
        var n=Math.min(70,Math.floor(innerWidth/22));pts=[];
        for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3*DPR,vy:(Math.random()-.5)*.3*DPR});}
      resize();window.addEventListener('resize',resize);
      cv.parentElement.addEventListener('mousemove',function(e){mouse.x=e.clientX*DPR;mouse.y=e.clientY*DPR;});
      cv.parentElement.addEventListener('mouseleave',function(){mouse.x=-999;mouse.y=-999;});
      function draw(){
        ctx.clearRect(0,0,W,H);
        for(var i=0;i<pts.length;i++){var p=pts[i];
          p.x+=p.vx;p.y+=p.vy;
          if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
          var dxm=mouse.x-p.x,dym=mouse.y-p.y,dm=Math.hypot(dxm,dym);
          if(dm<140*DPR){p.x-=dxm/dm*1.2;p.y-=dym/dm*1.2;}
          ctx.beginPath();ctx.arc(p.x,p.y,1.4*DPR,0,6.28);ctx.fillStyle='rgba(201,168,106,.85)';ctx.fill();
        }
        for(var i=0;i<pts.length;i++)for(var j=i+1;j<pts.length;j++){
          var a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<120*DPR){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
            ctx.strokeStyle='rgba(120,170,160,'+(.16*(1-d/(120*DPR)))+')';ctx.lineWidth=DPR*.6;ctx.stroke();}
        }
        requestAnimationFrame(draw);
      }
      draw();
    } else if(cv){ cv.style.background='radial-gradient(circle at 50% 50%,#143e39,#0c1413)'; }

    // ---- STICKY 철학: 스크롤 진행에 따라 단어 순차 점등 ----
    var philo=document.getElementById('philo'),seqs=document.querySelectorAll('#philoText .seq');
    if(philo&&seqs.length&&!reduced){
      window.addEventListener('scroll',function(){
        var r=philo.getBoundingClientRect(),total=philo.offsetHeight-innerHeight;
        var p=Math.max(0,Math.min(1,(-r.top)/total));
        var active=Math.floor(p*seqs.length*1.2);
        seqs.forEach(function(s,i){s.style.opacity=i<=active?'1':'.18';});
      },{passive:true});
    } else { seqs.forEach(function(s){s.style.opacity='1';}); }
  })();
  </script>
  `;
}
