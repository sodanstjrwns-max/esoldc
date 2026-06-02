import { html, raw } from 'hono/html';
import { CLINIC, DOCTORS, getTreatmentsForDoctor, type Doctor } from '../data/clinic';

const DOC_CSS = `
.d-hero{background:var(--bg-ink);color:var(--ink-inv);padding:200px 0 90px;position:relative;overflow:hidden}
.d-hero::after{content:'';position:absolute;left:-100px;bottom:-140px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(184,174,232,.24),transparent 68%)}
.d-hero::before{content:'';position:absolute;right:-120px;top:-90px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(255,158,128,.22),transparent 68%)}
.d-hero .wrap{position:relative;z-index:2}
.d-hero .eyebrow{color:var(--accent)}
.d-hero h1{font-size:clamp(2.6rem,7vw,5rem);letter-spacing:-.03em;line-height:.98}
.d-hero h1 .it{font-family:var(--serif);font-style:italic;font-weight:500;color:var(--accent)}
.d-hero .sub{color:rgba(255,253,251,.78);font-size:1.15rem;max-width:600px;margin-top:14px}
.breadcrumb{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,253,251,.55);margin-bottom:26px}
.breadcrumb a{color:rgba(255,253,251,.55)}.breadcrumb a:hover{color:#fff}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:28px}
.doc-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;transition:all .4s var(--ease)}
.doc-card:hover{transform:translateY(-8px);box-shadow:var(--shadow);border-color:var(--brand-light)}
.doc-card img{width:100%;aspect-ratio:4/5;object-fit:cover}
.doc-card .info{padding:24px}
.doc-card .role{color:var(--accent);font-weight:700;font-size:.82rem;letter-spacing:.05em}
.doc-card h3{font-size:1.4rem;margin:6px 0 4px}
.doc-card .spec{color:var(--ink-soft);font-size:.92rem;margin-bottom:14px}
.doc-card .go{color:var(--brand);font-weight:700;font-size:.88rem}
/* 상세 */
.dd-wrap{display:grid;grid-template-columns:380px 1fr;gap:56px;align-items:start}
.dd-photo{position:sticky;top:100px}
.dd-photo img{width:100%;border-radius:var(--radius-lg);box-shadow:var(--shadow)}
.dd-photo .pcta{margin-top:20px;display:flex;flex-direction:column;gap:10px}
.dd-role{color:var(--accent);font-weight:700;letter-spacing:.08em}
.dd-name{font-size:2.6rem;margin:8px 0}
.dd-spec{font-size:1.2rem;color:var(--brand);font-weight:700;margin-bottom:28px}
.dd-bio{font-size:1.1rem;line-height:1.9;color:var(--ink-soft);margin-bottom:36px}
.dd-block{margin-bottom:36px}
.dd-block h3{font-size:1.25rem;color:var(--brand-dark);margin-bottom:16px;padding-left:16px;position:relative}
.dd-block h3::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:5px;background:var(--accent);border-radius:3px}
.dd-cred{list-style:none;padding:0;margin:0}
.dd-cred li{padding:10px 0 10px 30px;position:relative;color:var(--ink-soft);border-bottom:1px dashed var(--line)}
.dd-cred li::before{content:'\\f00c';font-family:'Font Awesome 6 Free';font-weight:900;position:absolute;left:0;color:var(--brand-light)}
.dd-treat{display:flex;flex-wrap:wrap;gap:10px}
.dd-treat a{padding:10px 18px;border-radius:999px;background:var(--brand-soft);color:var(--brand-dark);font-weight:600;font-size:.92rem;transition:all .3s}
.dd-treat a:hover{background:var(--brand);color:#fff}
@media(max-width:860px){.dd-wrap{grid-template-columns:1fr}.dd-photo{position:static}.dd-name{font-size:2rem}}
`;

export function DoctorsListPage() {
  return html`
  <style>${raw(DOC_CSS)}</style>
  <section class="d-hero" data-dark>
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> / 의료진</div>
      <h1 data-kinetic>의료진 <span class="it">소개</span></h1>
      <p class="sub" data-words>각 분야의 전문 의료진이 상주하여, 전 연령의 다양한 진료를 책임집니다.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="doc-grid">
        ${raw(DOCTORS.map((d,i) => `
          <a href="/doctors/${d.slug}" class="doc-card reveal reveal-d${(i%4)+1}">
            <img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.name} - ${d.specialty}" loading="lazy">
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
  <section class="d-hero" data-dark>
    <div class="wrap">
      <div class="breadcrumb"><a href="/">홈</a> › <a href="/doctors">의료진</a> › ${d.name}</div>
    </div>
  </section>
  <section class="section" style="padding-top:60px">
    <div class="wrap">
      <div class="dd-wrap">
        <div class="dd-photo reveal">
          <img src="${d.photo}" alt="${CLINIC.name} ${d.role} ${d.name}">
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
            <h3>${d.name}이(가) 담당하는 진료</h3>
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
