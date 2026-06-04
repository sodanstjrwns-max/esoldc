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
.t-intro{font-size:1.16rem;line-height:1.85;color:var(--ink);background:var(--bg-soft);border-left:3px solid var(--gold);padding:26px 30px;border-radius:0 var(--radius) var(--radius) 0;margin-bottom:48px}
.t-intro strong{color:var(--navy)}
.t-section{margin-bottom:46px}
.t-section h2{font-size:1.5rem;color:var(--navy);margin-bottom:16px;position:relative;padding-left:18px;font-family:var(--serif)}
.t-section h2::before{content:'';position:absolute;left:0;top:5px;bottom:5px;width:3px;background:var(--gold);border-radius:2px}
.t-section p{color:var(--ink-soft);font-size:1.05rem;line-height:1.9}
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
export function TreatmentDetailPage(t: Treatment) {
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
      <div class="t-intro reveal">${raw(formatIntro(t.intro))}</div>

      ${raw(t.sections.map(s => `
        <div class="t-section reveal">
          <h2>${s.h2}</h2>
          <p>${s.body}</p>
        </div>`).join(''))}

      <!-- 담당 의료진 (인링크) -->
      ${docs.length ? html`
      <div class="t-doctors reveal">
        <h3><i class="fas fa-user-md" style="color:var(--gold);margin-right:8px"></i>${t.name} 담당 의료진</h3>
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
          <a href="/reservation" class="btn-line">예약 문의하기 <i class="fas fa-arrow-right"></i></a>
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
