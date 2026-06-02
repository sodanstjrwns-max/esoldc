import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS, getDoctorsForTreatment, NEARBY_AREAS, type Treatment } from '../data/clinic';

// 공통 스타일
const TREAT_CSS = `
.t-hero{background:var(--bg-ink);color:var(--ink-inv);padding:200px 0 90px;position:relative;overflow:hidden}
.t-hero::after{content:'';position:absolute;right:-120px;top:-80px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,106,.22),transparent 68%)}
.t-hero .eyebrow{color:var(--accent)}
.breadcrumb{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,241,233,.5);margin-bottom:26px}
.breadcrumb a{color:rgba(244,241,233,.5)}.breadcrumb a:hover{color:#fff}
.t-hero h1{font-size:clamp(2.6rem,7vw,5.4rem);margin-bottom:18px;letter-spacing:-.03em;line-height:.98}
.t-hero h1 .it{font-family:var(--serif);font-style:italic;font-weight:500;color:var(--accent)}
.t-hero .sub{color:rgba(244,241,233,.7);font-size:1.2rem;max-width:640px}
.t-body{max-width:820px;margin:0 auto}
.t-intro{font-size:1.2rem;line-height:1.8;color:var(--ink);background:var(--brand-soft);border-left:4px solid var(--brand);padding:24px 28px;border-radius:0 var(--radius) var(--radius) 0;margin-bottom:48px}
.t-intro strong{color:var(--brand-dark)}
.t-section{margin-bottom:44px}
.t-section h2{font-size:1.6rem;color:var(--brand-dark);margin-bottom:16px;position:relative;padding-left:18px}
.t-section h2::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:5px;background:var(--accent);border-radius:3px}
.t-section p{color:var(--ink-soft);font-size:1.05rem;line-height:1.85}
.faq-list{margin-top:24px}
.faq-item{border:1px solid var(--line);border-radius:var(--radius);margin-bottom:14px;overflow:hidden;transition:all .3s var(--ease)}
.faq-item[open]{border-color:var(--brand-light);box-shadow:var(--shadow-sm)}
.faq-item summary{padding:22px 26px;font-weight:700;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:1.05rem;color:var(--ink)}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary i{color:var(--brand);transition:transform .3s var(--ease)}
.faq-item[open] summary i{transform:rotate(45deg)}
.faq-item .fa-body{padding:0 26px 24px;color:var(--ink-soft);line-height:1.8}
.t-doctors{background:var(--bg-cream);border-radius:var(--radius-lg);padding:40px;margin:48px 0}
.t-doctors h3{font-size:1.3rem;margin-bottom:24px}
.t-doc-row{display:flex;gap:20px;flex-wrap:wrap}
.t-doc{display:flex;gap:14px;align-items:center;background:#fff;padding:14px 20px 14px 14px;border-radius:var(--radius);transition:all .3s var(--ease);min-width:240px}
.t-doc:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
.t-doc img{width:64px;height:64px;border-radius:12px;object-fit:cover}
.t-doc .tn{font-weight:800}.t-doc .tr{font-size:.85rem;color:var(--ink-soft)}
.t-related{margin:48px 0}
.t-related h3{font-size:1.2rem;margin-bottom:18px}
.t-rel-chips{display:flex;flex-wrap:wrap;gap:10px}
.t-rel-chips a{padding:10px 18px;border-radius:999px;background:var(--brand-soft);color:var(--brand-dark);font-weight:600;font-size:.9rem;transition:all .3s}
.t-rel-chips a:hover{background:var(--brand);color:#fff}
.t-cta{background:var(--brand);color:#fff;border-radius:var(--radius-lg);padding:48px;text-align:center;margin-top:48px}
.t-cta h3{font-size:1.6rem;margin-bottom:12px}
.t-cta p{color:rgba(255,255,255,.85);margin-bottom:24px}
/* 진료 목록 */
.tl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}
.tl-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:34px;transition:all .4s var(--ease);position:relative;overflow:hidden}
.tl-card:hover{transform:translateY(-8px);box-shadow:var(--shadow);border-color:var(--brand-light)}
.tl-card.core{background:linear-gradient(160deg,#fff,var(--brand-soft))}
.tl-card .badge{position:absolute;top:20px;right:20px;background:var(--accent);color:#2a2310;font-size:.72rem;font-weight:700;padding:4px 12px;border-radius:999px}
.tl-card .ti{width:60px;height:60px;border-radius:15px;background:var(--brand-soft);color:var(--brand);display:grid;place-items:center;font-size:1.5rem;margin-bottom:20px}
.tl-card h3{font-size:1.4rem;margin-bottom:8px}
.tl-card p{color:var(--ink-soft);font-size:.95rem;margin-bottom:18px}
.tl-card .go{color:var(--brand);font-weight:700;font-size:.9rem}
`;

// --- 진료 목록 페이지 ---
export function TreatmentsListPage() {
  return html`
  <style>${raw(TREAT_CSS)}</style>
  <section class="t-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / 진료안내</div>
      <h1 data-kinetic>진료안내</h1>
      <p class="sub" data-words>임플란트·교정·소아치과를 중심으로, 전 연령의 다양한 진료를 한 곳에서 제공합니다.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="kicker-line"></div><span class="eyebrow">Core Specialty</span>
        <h2>핵심 진료</h2><p>각 분야 전문의가 책임지는 세 가지 진료입니다.</p>
      </div>
      <div class="tl-grid">
        ${raw(CORE_TREATMENTS.map((t,i) => `
          <a href="/treatments/${t.slug}" class="tl-card core reveal reveal-d${i+1}">
            <span class="badge">CORE</span>
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
        <div class="kicker-line"></div><span class="eyebrow">All Treatments</span>
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
export function TreatmentDetailPage(t: Treatment) {
  const docs = getDoctorsForTreatment(t.slug);
  const related = TREATMENTS.filter(x => x.slug !== t.slug).slice(0, 5);
  const areaLinks = t.isCore ? NEARBY_AREAS.slice(0, 5) : [];

  return html`
  <style>${raw(TREAT_CSS)}</style>
  <section class="t-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / <a href="/treatments">진료안내</a> / ${t.name}</div>
      <h1 data-kinetic>${t.hero}</h1>
      <p class="sub" data-words>${t.short}</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap t-body">
      <div class="t-intro reveal">${raw(formatIntro(t.intro))}</div>

      ${raw(t.sections.map(s => `
        <div class="t-section reveal">
          <h2>${s.h2}</h2>
          <p>${s.body}</p>
        </div>`).join(''))}

      <!-- 담당 의료진 (인링크) -->
      ${docs.length ? html`
      <div class="t-doctors reveal">
        <h3><i class="fas fa-user-md" style="color:var(--brand);margin-right:8px"></i>${t.name} 담당 의료진</h3>
        <div class="t-doc-row">
          ${raw(docs.map(d => `
            <a href="/doctors/${d.slug}" class="t-doc">
              <img src="${d.photo}" alt="${d.name} ${d.role}">
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

      <div class="t-cta reveal">
        <h3>${t.name} 상담을 원하시나요?</h3>
        <p>정확한 진단과 상담은 내원하여 의료진과 상의하시기 바랍니다.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="tel:${CLINIC.tel}" class="btn btn-gold"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/reservation" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.6)">예약 문의하기</a>
        </div>
      </div>
    </div>
  </section>
  `;
}

// intro 첫 문장(질문)을 bold 처리 (AEO)
function formatIntro(intro: string): string {
  const idx = intro.indexOf('?');
  if (idx > -1) {
    return `<strong>${intro.slice(0, idx + 1)}</strong>${intro.slice(idx + 1)}`;
  }
  return intro;
}
