import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS, getDoctorsForTreatment, NEARBY_AREAS, type Treatment } from '../data/clinic';

// 공통 스타일
const TREAT_CSS = `
.t-hero{background:var(--navy);color:var(--inv);padding:104px 0 80px;position:relative;overflow:hidden}
.t-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(700px 460px at 82% 20%,rgba(185,138,78,.16),transparent 60%)}
.t-hero .wrap{position:relative;z-index:2}
.t-hero .eyebrow{color:var(--gold-2)}
.breadcrumb{font-size:.78rem;letter-spacing:.12em;color:var(--inv-faint);margin-bottom:22px}
.breadcrumb a{color:var(--inv-faint)}.breadcrumb a:hover{color:var(--gold-2)}
.t-hero h1{font-size:clamp(2.3rem,5.4vw,3.8rem);margin:14px 0 16px;line-height:1.25;color:var(--inv)}
.t-hero .sub{color:var(--inv-soft);font-size:1.12rem;max-width:660px}
.t-body{max-width:820px;margin:0 auto}
.t-intro{font-size:1.16rem;line-height:1.85;color:var(--ink);background:var(--bg-soft);border-left:3px solid var(--gold);padding:26px 30px;border-radius:0 var(--radius) var(--radius) 0;margin-bottom:32px}
.t-intro strong{color:var(--navy)}
/* ── AEO 핵심 요약 (AI 답변 인용 타깃) ── */
.aeo-summary{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:28px 30px;margin-bottom:48px;box-shadow:var(--shadow-sm)}
.aeo-summary .aeo-h{display:flex;align-items:center;gap:10px;font-family:var(--serif);font-weight:700;font-size:1.08rem;color:var(--navy);margin-bottom:16px}
.aeo-summary .aeo-h i{color:var(--gold)}
.aeo-summary ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.aeo-summary li{display:flex;gap:12px;align-items:flex-start;font-size:1.02rem;line-height:1.7;color:var(--ink-soft)}
.aeo-summary li::before{content:'';flex:none;width:8px;height:8px;margin-top:9px;border-radius:50%;background:var(--gold-grad)}
.aeo-summary li strong{color:var(--navy);font-weight:700}
.t-section{margin-bottom:46px;scroll-margin-top:90px}
.t-section h2{font-size:1.5rem;color:var(--navy);margin-bottom:16px;position:relative;padding-left:18px;font-family:var(--serif)}
.t-section h2::before{content:'';position:absolute;left:0;top:5px;bottom:5px;width:3px;background:var(--gold);border-radius:2px}
.t-section p{color:var(--ink-soft);font-size:1.05rem;line-height:1.9}
/* ── 진료 과정 한눈에 보기 (HowTo 타임라인 네비) ── */
.t-toc{background:linear-gradient(180deg,#fff,var(--bg-soft));border:1px solid var(--line);border-radius:var(--radius-lg);padding:28px 30px;margin-bottom:48px;box-shadow:var(--shadow-sm)}
.t-toc .toc-h{display:flex;align-items:center;gap:10px;font-family:var(--serif);font-weight:700;font-size:1.08rem;color:var(--navy);margin-bottom:18px}
.t-toc .toc-h i{color:var(--gold)}
.t-toc ol{list-style:none;margin:0;padding:0;counter-reset:step;display:grid;gap:2px}
.t-toc li{counter-increment:step;position:relative;padding:10px 10px 10px 46px;border-radius:var(--radius);transition:background .25s}
.t-toc li::before{content:counter(step);position:absolute;left:8px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:var(--gold-grad);color:#fff;font-size:.82rem;font-weight:700;display:grid;place-items:center}
.t-toc li:not(:last-child)::after{content:'';position:absolute;left:21px;top:calc(50% + 17px);width:2px;height:calc(100% - 14px);background:var(--gold-soft)}
.t-toc a{color:var(--ink);font-weight:600;font-size:.98rem;display:block}
.t-toc li:hover{background:var(--bg-soft)}.t-toc li:hover a{color:var(--gold-3)}
/* 섹션 번호 배지 */
.t-section .sec-num{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--gold-soft);color:var(--gold-3);font-size:.85rem;font-weight:700;margin-right:12px;vertical-align:2px;font-family:var(--serif)}
.t-section h2.numbered{padding-left:0}
.t-section h2.numbered::before{display:none}
.faq-list{margin-top:24px}
.faq-item{border:1px solid var(--line);border-radius:var(--radius);margin-bottom:12px;overflow:hidden;transition:all .3s var(--ease);background:#fff}
.faq-item[open]{border-color:var(--gold);box-shadow:var(--shadow-sm)}
.faq-item summary{padding:22px 26px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:1.04rem;color:var(--navy)}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary i{color:var(--gold);transition:transform .3s var(--ease)}
.faq-item[open] summary i{transform:rotate(45deg)}
.faq-item .fa-body{padding:0 26px 24px;color:var(--ink-soft);line-height:1.85}
.t-doctors{background:var(--bg-soft);border:1px solid var(--line);border-radius:var(--radius-lg);padding:40px;margin:48px 0}
.t-doctors h3{font-size:1.25rem;margin-bottom:24px;font-family:var(--serif);color:var(--navy)}
.t-doc-row{display:flex;gap:18px;flex-wrap:wrap}
.t-doc{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--line);padding:14px 22px 14px 14px;border-radius:var(--radius);transition:all .3s var(--ease);min-width:240px}
.t-doc:hover{box-shadow:var(--shadow);border-color:var(--gold)}
.t-doc img{width:62px;height:62px;border-radius:8px;object-fit:cover}
.t-doc .tn{font-weight:700;color:var(--navy);font-family:var(--serif)}.t-doc .tr{font-size:.84rem;color:var(--ink-soft)}
.t-related{margin:48px 0}
.t-related h3{font-size:1.18rem;margin-bottom:18px;font-family:var(--serif);color:var(--navy)}
.t-rel-chips{display:flex;flex-wrap:wrap;gap:10px}
.t-rel-chips a{padding:11px 20px;border-radius:var(--radius);background:var(--bg-soft);border:1px solid var(--line);color:var(--navy);font-weight:600;font-size:.9rem;transition:all .3s}
.t-rel-chips a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy)}
.t-cta{background:var(--navy);color:var(--inv);border-radius:var(--radius-lg);padding:52px;text-align:center;margin-top:52px;position:relative;overflow:hidden}
.t-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(500px 320px at 50% 0%,rgba(185,138,78,.2),transparent 60%)}
.t-cta>*{position:relative;z-index:2}
.t-cta h3{font-size:1.55rem;margin-bottom:12px;color:var(--inv);font-family:var(--serif)}
.t-cta p{color:var(--inv-soft);margin-bottom:26px}
/* 진료 목록 */
.tl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}
.tl-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:36px;transition:all .4s var(--ease);position:relative;overflow:hidden}
.tl-card::after{content:'';position:absolute;left:0;top:0;width:100%;height:3px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.tl-card:hover{transform:translateY(-6px);box-shadow:var(--shadow)}
.tl-card:hover::after{transform:scaleX(1)}
.tl-card .badge{position:absolute;top:22px;right:24px;background:var(--gold-soft);color:var(--gold);font-size:.7rem;font-weight:700;letter-spacing:.08em;padding:5px 12px;border-radius:var(--radius)}
.tl-card .ti{width:60px;height:60px;border-radius:12px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:1.5rem;margin-bottom:22px}
.tl-card h3{font-size:1.4rem;margin-bottom:8px}
.tl-card p{color:var(--ink-soft);font-size:.95rem;margin-bottom:18px}
.tl-card .go{color:var(--navy);font-weight:600;font-size:.9rem;display:inline-flex;gap:8px;align-items:center;transition:gap .3s}
.tl-card:hover .go{gap:13px;color:var(--gold)}
`;

// --- 진료 목록 페이지 ---
export function TreatmentsListPage() {
  return html`
  <style>${raw(TREAT_CSS)}</style>
  <section class="t-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / 진료안내</div>
      <span class="eyebrow">Treatments</span>
      <h1>진료안내</h1>
      <p class="sub">임플란트·치아교정·소아치과를 중심으로, 전 연령의 다양한 진료를 한 곳에서 제공합니다.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center">Core Specialty</span>
        <h2>핵심 진료</h2><p>각 분야 전문의가 책임지는 세 가지 진료입니다.</p>
      </div>
      <div class="tl-grid">
        ${raw(CORE_TREATMENTS.map((t,i) => `
          <a href="/treatments/${t.slug}" class="tl-card core reveal reveal-d${i+1}">
            <span class="badge">핵심진료</span>
            <div class="ti"><i class="fas ${t.icon}"></i></div>
            <h3>${t.name}</h3><p>${t.short}</p>
            <span class="go">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--bg-soft)">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center">All Treatments</span>
        <h2>그 외 진료</h2><p>일상적인 구강 건강 관리부터 심미 치료까지 두루 진료합니다.</p>
      </div>
      <div class="tl-grid">
        ${raw(TREATMENTS.filter(t=>!t.isCore).map((t,i) => `
          <a href="/treatments/${t.slug}" class="tl-card reveal reveal-d${(i%3)+1}">
            <div class="ti"><i class="fas ${t.icon}"></i></div>
            <h3>${t.name}</h3><p>${t.short}</p>
            <span class="go">자세히 보기 <i class="fas fa-arrow-right"></i></span>
          </a>`).join(''))}
      </div>
    </div>
  </section>
  `;
}

// --- 진료 상세 페이지 ---
// relTerms: 이 진료와 연결된 용어사전 용어(양방향 인링크). index.tsx에서 주입.
export function TreatmentDetailPage(t: Treatment, relTerms: { term: string }[] = []) {
  const docs = getDoctorsForTreatment(t.slug);
  const related = TREATMENTS.filter(x => x.slug !== t.slug).slice(0, 5);
  const areaLinks = t.isCore ? NEARBY_AREAS.slice(0, 5) : [];

  return html`
  <style>${raw(TREAT_CSS)}</style>
  <section class="t-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / <a href="/treatments">진료안내</a> / ${t.name}</div>
      <span class="eyebrow">${t.name}</span>
      <h1>${t.hero}</h1>
      <p class="sub">${t.short}</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap t-body">
      <div class="t-intro reveal aeo-summary-lead">${raw(formatIntro(t.intro))}</div>

      <!-- AEO 핵심 요약 (AI 답변 인용 타깃 · speakable) -->
      <div class="aeo-summary reveal">
        <div class="aeo-h"><i class="fas fa-circle-check"></i>한눈에 보는 ${t.name} 핵심 요약</div>
        <ul>
          ${raw(aeoTakeaways(t, docs).map(p => `<li>${p}</li>`).join(''))}
        </ul>
      </div>

      <!-- 진료 과정 한눈에 보기 (HowTo 타임라인 네비 · 본문 단계 앵커) -->
      <nav class="t-toc reveal" aria-label="${t.name} 진료 과정 목차">
        <div class="toc-h"><i class="fas fa-list-check"></i>${t.name} — 한눈에 보는 진료 안내</div>
        <ol>
          ${raw(t.sections.map((s, i) => `<li><a href="#step-${i + 1}">${s.h2.replace(/[?]/g, '')}</a></li>`).join(''))}
        </ol>
      </nav>

      ${raw(t.sections.map((s, i) => `
        <div class="t-section reveal" id="step-${i + 1}">
          <h2 class="numbered"><span class="sec-num">${i + 1}</span>${s.h2}</h2>
          <p>${s.body}</p>
        </div>`).join(''))}

      <!-- 담당 의료진 (인링크) -->
      ${docs.length ? html`
      <div class="t-doctors reveal">
        <h3><i class="fas fa-user-md" style="color:var(--gold);margin-right:8px"></i>${t.name} 담당 의료진</h3>
        <div class="t-doc-row">
          ${raw(docs.map(d => `
            <a href="/doctors/${d.slug}" class="t-doc">
              <img src="${d.photo}" alt="${d.name} ${d.role}" loading="lazy" decoding="async">
              <div><div class="tn">${d.name}</div><div class="tr">${d.role} · ${d.specialty}</div></div>
            </a>`).join(''))}
        </div>
      </div>` : ''}

      <!-- FAQ -->
      <div class="t-section reveal">
        <h2>자주 묻는 질문</h2>
        <div class="faq-list">
          ${raw(t.faqs.map(f => `
            <details class="faq-item">
              <summary>${f.q}<i class="fas fa-plus"></i></summary>
              <div class="fa-body">${f.a}</div>
            </details>`).join(''))}
        </div>
      </div>

      <!-- 지역 SEO 인링크 (핵심 진료만) -->
      ${areaLinks.length ? html`
      <div class="t-related reveal">
        <h3>지역별 ${t.name} 안내</h3>
        <div class="t-rel-chips">
          ${raw(areaLinks.map(a => `<a href="/area/${a.slug}-${t.slug}">${a.name} ${t.name}</a>`).join(''))}
        </div>
      </div>` : ''}

      <!-- 관련 진료 (인링크) -->
      <div class="t-related reveal">
        <h3>다른 진료도 살펴보세요</h3>
        <div class="t-rel-chips">
          ${raw(related.map(r => `<a href="/treatments/${r.slug}"><i class="fas ${r.icon}" style="margin-right:6px"></i>${r.name}</a>`).join(''))}
        </div>
      </div>

      <!-- 관련 용어 (용어사전 ↔ 진료 양방향 인링크) -->
      ${relTerms.length ? html`
      <div class="t-related reveal">
        <h3>${t.name} 관련 용어 알아보기</h3>
        <div class="t-rel-chips">
          ${raw(relTerms.map(g => `<a href="/glossary/${encodeURIComponent(g.term)}"><i class="fas fa-book-open" style="margin-right:6px;color:var(--gold)"></i>${g.term}</a>`).join(''))}
        </div>
        <p style="margin-top:14px;font-size:.85rem;color:var(--ink-soft)"><a href="/glossary" style="color:var(--gold);font-weight:600">치과 백과사전 전체 보기 <i class="fas fa-arrow-right" style="font-size:.8em"></i></a></p>
      </div>` : ''}

      <div class="t-cta reveal">
        <h3>${t.name} 상담을 원하시나요?</h3>
        <p>정확한 진단과 상담은 내원하여 의료진과 상의하시기 바랍니다.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="tel:${CLINIC.tel}" class="btn btn-gold"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/reservation" class="btn-line">예약 문의하기 <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  </section>
  `;
}

// AEO 핵심 요약 자동 생성 — 진료 데이터에서 추출 (의료광고법 준수: 단정/보장 표현 배제)
function aeoTakeaways(t: Treatment, docs: ReturnType<typeof getDoctorsForTreatment>): string[] {
  const out: string[] = [];
  // 1) 정의 (intro에서 핵심 답변부)
  const qIdx = t.intro.indexOf('?');
  const answer = qIdx > -1 ? t.intro.slice(qIdx + 1).trim() : t.intro;
  out.push(`<strong>${t.name}란?</strong> ${answer.split('.')[0]}.`);
  // 2) 담당 의료진 (전문의 여부 명시 — 법적 정확)
  if (docs.length) {
    const names = docs.map(d => `${d.name} ${d.role}`).join(', ');
    out.push(`<strong>담당 의료진</strong> ${names}이(가) ${t.name} 진료를 담당합니다.`);
  }
  // 3) 주요 진료 항목 (섹션 H2 앞 3개)
  const topics = t.sections.slice(0, 3).map(s => s.h2.replace(/[?]/g, '')).join(' · ');
  if (topics) out.push(`<strong>주요 내용</strong> ${topics}`);
  // 4) 위치/접근성
  out.push(`<strong>진료 위치</strong> ${CLINIC.addressShort} (${CLINIC.region} ${CLINIC.district} 마석역 인근)`);
  // 5) 안내 (필수 컴플라이언스)
  out.push(`<strong>안내</strong> 정확한 진단과 비용, 치료 방법은 개인 상태에 따라 차이가 있으며 내원 상담을 통해 결정됩니다.`);
  return out;
}

// intro 첫 문장(질문)을 bold 처리 (AEO)
function formatIntro(intro: string): string {
  const idx = intro.indexOf('?');
  if (idx > -1) {
    return `<strong>${intro.slice(0, idx + 1)}</strong>${intro.slice(idx + 1)}`;
  }
  return intro;
}
