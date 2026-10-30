/* 이솔치과 메인 스크롤 몰입 연출 (GSAP ScrollTrigger + Lenis) — Soft Organic(크림·우드·아치) 결
   - 글자는 모두 HTML 에 그대로 두고 움직임만 더한다(크롤러·AEO 영향 없음, JS 꺼져도 전부 보임)
   - 동작 줄이기 사용자는 아무것도 하지 않는다
   - 기존 연출(히어로 아치·data-line 제목 마스크·data-words·data-scrub 문단·VMG 선 그리기·마퀴·스토리 레일·커서)은 그대로 두고,
     카드·사진·띠처럼 단순 data-reveal 페이드만 쓰던 블록을 넘겨받아 '아치가 열리고, 살포시 내려앉는' 장면으로 바꾼다
   - 리듬: 숨 쉬듯 부드럽게(power2/sine, 1.2~1.5초), 살짝 기울어진 채 내려앉음 */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  function start() {
  var root = document.documentElement;
  root.classList.add('mx');
  var mobile = matchMedia('(max-width: 767px)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var SOFT = 'power2.out', BREATH = 'sine.inOut';
  var ARCH0 = 'inset(100% 0% 0% 0% round 320px 320px 22px 22px)', ARCH1 = 'inset(0% 0% 0% 0% round 320px 320px 22px 22px)';

  // 1) 부드러운 관성 스크롤 — 마우스·트랙패드만 (터치는 기본 스크롤)
  if (fine && window.Lenis) {
    var lenis = new Lenis({ duration: 1.25, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  // 화면에 들어오면 한 번 재생 — 빠르게 지나쳐도 onEnter 가 불려 끝까지 재생, 탭이 숨어도 타임아웃으로 끝 상태 보장
  var TIMING = ['duration', 'ease', 'stagger', 'delay'];
  var claimed = [];
  function claim(list) { gsap.utils.toArray(list).forEach(function (el) { claimed.push(el); }); }
  // 기존 data-reveal 을 넘겨받는다 (속성을 떼면 기존 CSS·IO 와 겹치지 않음)
  function takeover(el) { if (el) { el.removeAttribute('data-reveal'); el.removeAttribute('data-reveal-d'); } return el; }
  function enter(targets, vars, trigger, start) {
    targets = gsap.utils.toArray(targets);
    if (!targets.length) return null;
    claim(targets);
    var from = {}, to = { opacity: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, rotate: 0, scale: 1, letterSpacing: vars.letterSpacingEnd, paused: true,
      onComplete: function () { gsap.set(targets, { clearProps: 'opacity,transform,transition,clipPath,filter,letterSpacing' }); } };
    if (!vars.letterSpacingEnd) delete to.letterSpacing;
    if ('clipPath' in vars) to.clipPath = vars.clipEnd || 'inset(0% 0% 0% 0%)';
    if ('filter' in vars) to.filter = 'blur(0px)';
    Object.keys(vars).forEach(function (k) { if (k !== 'clipEnd' && k !== 'letterSpacingEnd') (TIMING.indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    gsap.set(targets, { transition: 'none' });
    var tw = gsap.fromTo(targets, from, to);
    ScrollTrigger.create({ trigger: trigger || targets[0], start: start || 'top 86%', once: true, onEnter: function () {
      tw.play();
      setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
    } });
    return tw;
  }
  function scrub(target, from, to, st) {
    claim(target);
    return gsap.fromTo(target, from, Object.assign({ ease: 'none', scrollTrigger: Object.assign({ scrub: true }, st) }, to));
  }
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return gsap.utils.toArray((ctx || document).querySelectorAll(sel)); };
  var tilt = function (i) { return (i % 2 ? 1 : -1) * (mobile ? 1.2 : 2.4); };

  // ── 챕터 사이 다리 문장: 숨을 들이쉬듯 살짝 커지며 나타나고, 챕터 표시는 자간이 모여듦
  $$('main .bridge').forEach(function (b) {
    takeover(b);
    b.classList.add('in');
    var p = $('p', b), pg = $('.bridge-pg', b);
    if (p) enter(p, { opacity: 0, scale: 0.94, y: 18, duration: 1.4, ease: BREATH }, b, 'top 84%');
    if (pg) enter(pg, { opacity: 0, letterSpacing: '.6em', letterSpacingEnd: '.22em', duration: 1.6, ease: SOFT, delay: 0.3 }, b, 'top 84%');
  });

  // ── 큰 챕터 번호·세로 라벨: 스크롤보다 느리게 흘러 깊이감
  $$('main .folio-num').forEach(function (n) {
    scrub(n, { yPercent: 35 }, { yPercent: -35 }, { trigger: n.parentElement, start: 'top bottom', end: 'bottom top' });
  });
  if (!mobile) $$('main .kicker-v').forEach(function (k) {
    scrub(k, { y: 60 }, { y: -60 }, { trigger: k.parentElement, start: 'top bottom', end: 'bottom top' });
  });

  // ── 1장 우리 이야기: 아치 창이 아래에서 위로 열리고 사진은 천천히 제자리로
  var introImg = $('#ch-story .intro-img');
  if (introImg) {
    takeover(introImg);
    enter(introImg, { clipPath: 'inset(100% 0% 0% 0% round 300px 300px 22px 22px)', clipEnd: 'inset(0% 0% 0% 0% round 300px 300px 22px 22px)', duration: 1.6, ease: 'power3.inOut' }, introImg, 'top 82%');
    var iimg = $('img', introImg);
    if (iimg) enter(iimg, { scale: 1.22, duration: 2.2, ease: SOFT }, introImg, 'top 82%');
  }

  // ── 인터뷰 영상: 멀리 놓인 액자가 다가오며 커짐(스크롤 따라), 자막 줄은 뒤따라
  var itv = $('#ch-interview .itv-frame');
  if (itv) {
    takeover(itv);
    scrub(itv, { scale: mobile ? 0.92 : 0.8, y: 40, borderRadius: mobile ? '40px' : '80px' }, { scale: 1, y: 0, borderRadius: getComputedStyle(itv).borderRadius }, { trigger: itv, start: 'top bottom', end: 'center 55%' });
    var cap = $('#ch-interview .itv-cap');
    if (cap) { takeover(cap); enter(cap.children, { y: 20, opacity: 0, duration: 1.1, ease: SOFT, stagger: 0.12 }, cap, 'top 92%'); }
  }

  // ── 2장 핵심 진료: 줄마다 오른쪽에서 미끄러져 와 자리를 잡고, 큰 번호는 아래에서 떠오름
  var rows = $$('#ch-core .core-row');
  if (rows.length) {
    rows.forEach(takeover);
    enter(rows, { x: mobile ? 0 : 70, y: mobile ? 30 : 0, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: 0.16 }, rows[0], 'top 86%');
    enter($$('#ch-core .cr-num'), { yPercent: 80, opacity: 0, duration: 1.4, ease: SOFT, stagger: 0.16, delay: 0.15 }, rows[0], 'top 86%');
  }

  // ── 마석 진료별 안내 카드: 살짝 기울어진 채 내려와 반듯하게 놓임
  var mk = $$('#ch-local .mk-card');
  if (mk.length) {
    mk.forEach(takeover);
    enter(mk, { y: mobile ? 36 : 64, rotate: tilt, opacity: 0, transformOrigin: '50% 100%', duration: 1.3, ease: SOFT, stagger: { each: 0.08, grid: 'auto', from: 'start' } }, mk[0], 'top 88%');
  }

  // ── 3장 편안한 이유(어두운 장): 카드가 한 장씩 떠올라 자리 잡고, 번호는 부드럽게 커짐
  var why = $$('#ch-why .why-card');
  if (why.length) {
    why.forEach(takeover);
    enter(why, { y: 60, opacity: 0, duration: 1.4, ease: SOFT, stagger: 0.18 }, why[0], 'top 86%');
    enter($$('#ch-why .wn'), { scale: 0.4, opacity: 0, transformOrigin: '0% 100%', duration: 1.2, ease: 'back.out(1.6)', stagger: 0.18, delay: 0.25 }, why[0], 'top 86%');
  }

  // ── 4장 온 가족 진료: 타일이 대각선 물결처럼 차례로
  var all = $$('#ch-all .all-card');
  if (all.length) {
    all.forEach(takeover);
    enter(all, { y: 30, scale: 0.95, opacity: 0, duration: 1.1, ease: SOFT, stagger: { each: 0.07, grid: 'auto', from: 'start', axis: null } }, all[0], 'top 88%');
    enter($$('#ch-all .all-card .ai'), { rotate: -30, scale: 0.5, opacity: 0, duration: 1, ease: 'back.out(1.8)', stagger: { each: 0.07, grid: 'auto', from: 'start' }, delay: 0.2 }, all[0], 'top 88%');
  }

  // ── 5장 장비: 칸마다 올라오고 둥근 아이콘이 톡 놓임
  var eq = $$('#ch-equip .equip-card');
  if (eq.length) {
    eq.forEach(takeover);
    enter(eq, { y: 40, opacity: 0, duration: 1.2, ease: SOFT, stagger: 0.1 }, eq[0], 'top 88%');
    enter($$('#ch-equip .eq-ic'), { scale: 0, opacity: 0, duration: 0.9, ease: 'back.out(2)', stagger: 0.1, delay: 0.3 }, eq[0], 'top 88%');
  }

  // ── 공간: 모자이크 사진이 제각각 순서로 내려앉고, 사진은 칸 안에서 시차
  var spaceGrid = $('#ch-space .space-grid');
  if (spaceGrid) {
    takeover(spaceGrid);
    var items = $$('.space-item', spaceGrid);
    enter(items, { y: 40, scale: 0.96, opacity: 0, duration: 1.2, ease: SOFT, stagger: { each: 0.07, from: 'random' } }, spaceGrid, 'top 85%');
    items.forEach(function (it) {
      var img = $('img', it); if (!img) return;
      gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // ── 6장 의료진: 아치 사진틀이 아래에서 차례로 열리고, 이름은 뒤따라
  var team = $$('#ch-team .team-card');
  if (team.length) {
    team.forEach(takeover);
    var tg = $('#ch-team .team-grid');
    team.forEach(function (c, i) {
      var ph = $('.team-photo', c);
      var d = (mobile ? i % 2 : i) * 0.12;
      if (ph) enter(ph, { clipPath: 'inset(100% 0% 0% 0% round 160px 160px 16px 16px)', clipEnd: 'inset(0% 0% 0% 0% round 160px 160px 16px 16px)', duration: 1.4, ease: 'power3.inOut', delay: d }, tg, 'top 85%');
      enter(Array.prototype.filter.call(c.children, function (x) { return x !== ph; }), { y: 16, opacity: 0, duration: 1, ease: SOFT, stagger: 0.06, delay: d + 0.5 }, tg, 'top 85%');
    });
  }

  // ── 7장 여정: 가운데서 양쪽으로 길이 이어지고, 다섯 걸음이 징검다리처럼 차례로
  var jy = $('.journey .jy-track');
  if (jy) {
    takeover(jy);
    var line = $('.jy-line', jy);
    if (line && !mobile) { gsap.set(line, { transformOrigin: '50% 50%' }); scrub(line, { scaleX: 0 }, { scaleX: 1 }, { trigger: jy, start: 'top 80%', end: 'top 35%' }); }
    var steps = $$('.jy-step', jy);
    enter(steps, { y: 46, rotate: tilt, opacity: 0, duration: 1.2, ease: 'back.out(1.3)', stagger: 0.14 }, jy, 'top 82%');
    var jf = $('.journey .jy-foot');
    if (jf) { takeover(jf); enter(jf.children, { y: 20, opacity: 0, duration: 1.1, ease: SOFT, stagger: 0.12 }, jf, 'top 90%'); }
  }

  // ── 지역 칩: 비눗방울처럼 가운데부터 몽글몽글
  var chips = $('.geo .geo-chips');
  if (chips) {
    takeover(chips);
    enter($$('a', chips), { scale: 0.6, y: 14, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.65)', stagger: { each: 0.035, from: 'center' } }, chips, 'top 90%');
  }

  // ── 신뢰 숫자·리뷰 안내: 숫자 칸이 떠오르고, 안내 띠는 양쪽에서 와서 놓임
  var ts = $('.trust-stats');
  if (ts) { takeover(ts); enter($$('.ts', ts), { y: 40, opacity: 0, duration: 1.2, ease: SOFT, stagger: 0.14 }, ts, 'top 88%'); }
  $$('main .review-cta').forEach(function (rc, i) {
    takeover(rc);
    enter(rc, { x: mobile ? 0 : (i % 2 ? 60 : -60), y: mobile ? 24 : 0, opacity: 0, duration: 1.3, ease: SOFT }, rc, 'top 90%');
  });

  // ── 원장 칼럼: 세 장이 살짝 기울어 내려앉음
  var col = $('#ch-column .wrap > div[data-reveal]:nth-of-type(2)');
  if (col && col.querySelector('a[href^="/blog/"]')) {
    takeover(col);
    enter(col.children, { y: 50, rotate: tilt, opacity: 0, transformOrigin: '50% 100%', duration: 1.3, ease: SOFT, stagger: 0.12 }, col, 'top 88%');
  }

  // ── 에필로그: 상자가 아치 모양에서 다가오며 펼쳐짐(스크롤 따라)
  var epi = $('#ch-end .epi');
  if (epi) {
    takeover(epi);
    epi.classList.add('in');
    var r0 = getComputedStyle(epi).borderRadius;
    scrub(epi, { scale: mobile ? 0.95 : 0.88, borderRadius: mobile ? '160px 160px 28px 28px' : '360px 360px 32px 32px' }, { scale: 1, borderRadius: r0 }, { trigger: epi, start: 'top bottom', end: 'top 30%' });
  }

  // ── 나머지 기존 등장 신호는 모양 그대로 두고 신호만 넘겨받는다:
  //    IO 는 빠르게 건너뛴 구간을 놓치지만 ScrollTrigger 는 지나친 구간에도 onEnter 를 불러 반드시 끝 상태가 된다
  [['[data-reveal]', 'in', 'top 92%'], ['[data-line]', 'line-in', 'top 90%'], ['[data-words]', 'words-in', 'top 90%'], ['.vmg', 'drawn', 'top 88%']].forEach(function (r) {
    $$('main ' + r[0]).forEach(function (el) {
      if (el.classList.contains(r[1])) return;
      ScrollTrigger.create({ trigger: el, start: r[2], once: true, onEnter: function () { el.classList.add(r[1]); } });
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
