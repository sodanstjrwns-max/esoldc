import { html, raw } from 'hono/html';
import { CLINIC, DOCTORS, getTreatmentsForDoctor, type Doctor } from '../data/clinic';

const DOC_CSS = `
.d-hero{background:var(--navy);color:var(--inv);padding:104px 0 80px;position:relative;overflow:hidden}
.d-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(700px 460px at 18% 30%,rgba(185,138,78,.16),transparent 60%)}
.d-hero .wrap{position:relative;z-index:2}
.d-hero .eyebrow{color:var(--gold-2)}
.d-hero h1{font-size:clamp(2.3rem,5.4vw,3.8rem);line-height:1.25;color:var(--inv);margin-top:14px}
.d-hero .sub{color:var(--inv-soft);font-size:1.12rem;max-width:620px;margin-top:16px}
.breadcrumb{font-size:.78rem;letter-spacing:.12em;color:var(--inv-faint);margin-bottom:22px}
.breadcrumb a{color:var(--inv-faint)}.breadcrumb a:hover{color:var(--gold-2)}
.doc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;justify-content:center}
@media(max-width:980px){.doc-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.doc-grid{grid-template-columns:1fr}}
.doc-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;transition:all .4s var(--ease)}
.doc-card:hover{transform:translateY(-6px);box-shadow:var(--shadow)}
.doc-card img{width:100%;aspect-ratio:4/5;object-fit:cover}
.doc-card .info{padding:24px}
.doc-card .role{color:var(--gold);font-weight:700;font-size:.8rem;letter-spacing:.06em}
.doc-card h3{font-size:1.35rem;margin:6px 0 4px;font-family:var(--serif)}
.doc-card .spec{color:var(--ink-soft);font-size:.9rem;margin-bottom:14px}
.doc-card .go{color:var(--navy);font-weight:600;font-size:.87rem;display:inline-flex;gap:7px;align-items:center;transition:gap .3s}
.doc-card:hover .go{gap:12px;color:var(--gold)}
/* 상세 */
.dd-wrap{display:grid;grid-template-columns:380px 1fr;gap:56px;align-items:start}
.dd-photo{position:sticky;top:100px}
.dd-photo img{width:100%;border-radius:var(--radius-lg);box-shadow:var(--shadow);border:1px solid var(--line)}
.dd-photo .pcta{margin-top:20px;display:flex;flex-direction:column;gap:10px}
.dd-role{color:var(--gold);font-weight:700;letter-spacing:.06em}
.dd-name{font-size:2.5rem;margin:8px 0;color:var(--navy)}
.dd-spec{font-size:1.18rem;color:var(--navy-3);font-weight:700;margin-bottom:28px;font-family:var(--serif)}
.dd-bio{font-size:1.08rem;line-height:1.95;color:var(--ink-soft);margin-bottom:38px}
.dd-block{margin-bottom:38px}
.dd-block h3{font-size:1.22rem;color:var(--navy);margin-bottom:16px;padding-left:16px;position:relative;font-family:var(--serif)}
.dd-block h3::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:3px;background:var(--gold);border-radius:2px}
.dd-cred{list-style:none;padding:0;margin:0}
.dd-cred li{padding:12px 0 12px 30px;position:relative;color:var(--ink-soft);border-bottom:1px solid var(--line)}
.dd-cred li::before{content:'\\f00c';font-family:'Font Awesome 6 Free';font-weight:900;position:absolute;left:0;color:var(--gold)}
.dd-treat{display:flex;flex-wrap:wrap;gap:10px}
.dd-treat a{padding:11px 20px;border-radius:var(--radius);background:var(--bg-soft);border:1px solid var(--line);color:var(--navy);font-weight:600;font-size:.9rem;transition:all .3s}
.dd-treat a:hover{background:var(--navy);color:var(--inv);border-color:var(--navy)}
@media(max-width:860px){.dd-wrap{grid-template-columns:1fr}.dd-photo{position:static}.dd-name{font-size:2rem}}
`;

export function DoctorsListPage() {
  return html`
  <style>${raw(DOC_CSS)}</style>
  <section class="d-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / 의료진</div>
      <span class="eyebrow">Medical Team</span>
      <h1>의료진 소개</h1>
      <p class="sub">각 분야의 전문 의료진이 상주하여, 전 연령의 다양한 진료를 책임합니다.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <h2 style="text-align:center;font-size:clamp(1.5rem,3vw,2rem);margin-bottom:8px">${CLINIC.region} 마석 이솔치과 의료진</h2>
      <p style="text-align:center;color:#7a6f60;margin-bottom:32px">임플란트·치아교정·소아치과 등 분야별 진료를 담당하는 의료진입니다.</p>
      <div class="doc-grid">
        ${raw(DOCTORS.map((d,i) => `
          <a href="/doctors/${d.slug}" class="doc-card reveal reveal-d${(i%4)+1}">
            <img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.name} - ${d.specialty}" loading="lazy" decoding="async" width="300" height="400">
            <div class="info">
              <div class="role">${d.role}</div>
              <h3>${d.name}</h3>
              <div class="spec">${d.specialty}</div>
              <span class="go">프로필 보기 <i class="fas fa-arrow-right"></i></span>
            </div>
          </a>`).join(''))}
      </div>
    </div>
  </section>
  `;
}

export function DoctorDetailPage(d: Doctor) {
  const treats = getTreatmentsForDoctor(d.slug);
  return html`
  <style>${raw(DOC_CSS)}</style>
  <section class="d-hero">
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / <a href="/doctors">의료진</a> / ${d.name}</div>
      <span class="eyebrow">${d.role}</span>
    </div>
  </section>
  <section class="section" style="padding-top:60px">
    <div class="wrap">
      <div class="dd-wrap">
        <div class="dd-photo reveal">
          <img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.name}" loading="lazy" decoding="async" width="400" height="500">
          <div class="pcta">
            <a href="/reservation" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 진료 예약 문의</a>
            <a href="tel:${CLINIC.tel}" class="btn btn-ghost"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          </div>
        </div>
        <div class="reveal reveal-d1">
          <div class="dd-role">${d.role}</div>
          <h1 class="dd-name">${d.name}</h1>
          <div class="dd-spec">${d.specialty}</div>
          <p class="dd-bio">${d.bio}</p>

          <div class="dd-block">
            <h3>약력 및 소속</h3>
            <ul class="dd-cred">
              ${raw(d.credentials.map(c => `<li>${c}</li>`).join(''))}
            </ul>
          </div>

          ${treats.length ? html`
          <div class="dd-block">
            <h3>${d.name} ${d.role} 담당 진료</h3>
            <div class="dd-treat">
              ${raw(treats.map(t => `<a href="/treatments/${t.slug}"><i class="fas ${t.icon}" style="margin-right:6px"></i>${t.name}</a>`).join(''))}
            </div>
          </div>` : ''}
        </div>
      </div>
    </div>
  </section>
  `;
}
