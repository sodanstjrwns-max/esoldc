import { html, raw } from 'hono/html';
import { CLINIC, DOCTORS, NEARBY_AREAS, getTreatment } from '../data/clinic';
import { MASEOK_LOCAL, MASEOK_LOCAL_UPDATED, type MaseokLocal } from '../data/maseok-local';

// ============================================================================
// "마석 {진료}" 하위 페이지 6종 + 사진 카드 그리드 (홈·마석 허브·하위 페이지 하단 공용)
// ============================================================================
const esc = (s: any): string => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CARD_CSS = `
.mk-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.mk-card{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);overflow:hidden;color:inherit;text-decoration:none;transition:transform .3s var(--ease),box-shadow .3s var(--ease),border-color .3s}
.mk-card:hover{transform:translateY(-4px);box-shadow:var(--shadow);border-color:var(--gold-soft)}
.mk-card:focus-visible{outline:3px solid var(--gold);outline-offset:3px}
.mk-card img{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;background:var(--bg-soft)}
.mk-card .mk-t{padding:16px 18px 18px;display:flex;flex-direction:column;gap:4px}
.mk-card .mk-t strong{font-family:var(--serif);font-size:1.12rem;color:var(--navy);letter-spacing:-.02em;line-height:1.35}
.mk-card .mk-t span{font-size:.88rem;color:var(--ink-soft);line-height:1.6}
.mk-grid.mk-sm{gap:14px}
.mk-grid.mk-sm .mk-t{padding:12px 14px 14px}
.mk-grid.mk-sm .mk-t strong{font-size:1rem}
@media(max-width:900px){.mk-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}
@media(max-width:420px){.mk-grid{gap:10px}.mk-card .mk-t{padding:11px 12px 13px}.mk-card .mk-t strong{font-size:.98rem}.mk-card .mk-t span{font-size:.8rem}}
`;

/** 6장 사진 카드 그리드 — 카드 전체가 링크, 접근 이름 = 텍스트 제목 */
export function maseokCardGrid(opts: { idPrefix: string; exclude?: string; small?: boolean; reveal?: boolean }): string {
  const items = MASEOK_LOCAL.filter(m => m.slug !== opts.exclude);
  return `<style>${CARD_CSS}</style>
<div class="mk-grid${opts.small ? ' mk-sm' : ''}">${items.map(m => {
    const id = `${opts.idPrefix}-${m.slug}`;
    return `<a class="mk-card" href="/area/maseok-${m.slug}" aria-labelledby="${id}"${opts.reveal ? ' data-reveal' : ''}>
  <img src="${m.photo.card}" alt="${esc(m.name)}" width="600" height="600" loading="lazy" decoding="async">
  <span class="mk-t"><strong id="${id}">${esc(m.name)}</strong><span>${esc(m.cardLine)}</span></span>
</a>`;
  }).join('')}</div>`;
}

export function MaseokLocalPage(m: MaseokLocal) {
  const t = getTreatment(m.slug)!;
  const area = NEARBY_AREAS.find(a => a.slug === 'maseok')!;
  const docs = t.doctors.map(s => DOCTORS.find(d => d.slug === s)).filter(Boolean) as typeof DOCTORS;
  const sns = CLINIC.sns as any;
  const naverMap = `https://map.naver.com/v5/search/${encodeURIComponent(CLINIC.address)}`;
  const kakaoMap = `https://map.kakao.com/?q=${encodeURIComponent(CLINIC.address)}`;
  const otherAreas = NEARBY_AREAS.filter(a => a.slug !== 'maseok' && t.isCore).slice(0, 7);

  return html`
  <section style="background:var(--navy);color:var(--inv);padding:104px 0 72px;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background:radial-gradient(700px 460px at 82% 24%,rgba(185,138,78,.16),transparent 60%)"></div>
    <div class="wrap" style="position:relative;z-index:2">
      <div style="font-size:.78rem;letter-spacing:.12em;color:rgba(250,248,244,.45);margin-bottom:22px"><a href="/" style="color:rgba(250,248,244,.45)">홈</a> / <a href="/area" style="color:rgba(250,248,244,.45)">지역 안내</a> / <a href="/area/maseok" style="color:rgba(250,248,244,.45)">마석 치과</a> / ${m.name}</div>
      <h1 style="font-size:clamp(2.3rem,5.4vw,3.8rem);line-height:1.25;color:var(--inv)">${m.name}</h1>
      <p style="color:rgba(250,248,244,.72);font-size:1.12rem;max-width:660px;margin-top:16px">${m.heroSub}</p>
    </div>
  </section>
  <style>
    .ml{max-width:860px;margin:0 auto}
    .ml-fig{margin:0 0 30px}
    .ml-fig img{display:block;width:100%;height:auto;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);background:var(--bg-soft)}
    .ml-fig figcaption{font-size:.85rem;color:var(--ink-soft);margin-top:10px;line-height:1.6}
    .ml h2{font-size:1.5rem;color:var(--navy);margin:46px 0 16px;padding-left:16px;position:relative;font-family:var(--serif)}
    .ml h2::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:5px;background:var(--gold);border-radius:3px}
    .ml p{color:var(--ink-soft);line-height:1.9;font-size:1.05rem}
    .ml-aeo{background:#fff;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:var(--radius-lg);padding:26px 30px;box-shadow:var(--shadow-sm)}
    .ml-aeo .ah{font-family:var(--serif);font-weight:700;font-size:1.08rem;color:var(--navy);margin-bottom:14px}
    .ml-aeo dl{display:grid;grid-template-columns:5.5em 1fr;gap:10px 16px;margin:0}
    .ml-aeo dt{font-weight:700;color:var(--navy)}
    .ml-aeo dd{margin:0;color:var(--ink-soft);line-height:1.7}
    .ml-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
    .ml-links a{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:var(--radius);border:1px solid var(--line);background:#fff;color:var(--navy);font-weight:700;font-size:.92rem;transition:.25s}
    .ml-links a:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
    .ml-info{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}
    .ml-info .ai{background:var(--bg-soft);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px}
    .ml-info .ai b{display:block;font-size:.82rem;color:var(--gold-3);margin-bottom:6px}
    .ml-info .ai span{font-size:.96rem;color:var(--ink);line-height:1.65}
    .ml-docs{display:flex;gap:14px;flex-wrap:wrap;margin-top:16px}
    .ml-docs a{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--line);padding:12px 18px 12px 12px;border-radius:var(--radius);transition:.25s}
    .ml-docs a:hover{border-color:var(--gold);box-shadow:var(--shadow-sm)}
    .ml-docs img{width:54px;height:54px;border-radius:10px;object-fit:cover}
    .ml-faq details{border:1px solid var(--line);border-radius:var(--radius);margin-bottom:10px;background:#fff;overflow:hidden}
    .ml-faq summary{padding:18px 22px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px;color:var(--navy)}
    .ml-faq summary::-webkit-details-marker{display:none}
    .ml-faq summary i{color:var(--gold);transition:transform .3s}
    .ml-faq details[open] summary i{transform:rotate(45deg)}
    .ml-faq .afb{padding:0 22px 20px;color:var(--ink-soft);line-height:1.85}
    .ml-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .ml-chips a{font-size:.86rem;padding:8px 14px;border-radius:99px;background:#fff;border:1px solid var(--line);color:var(--navy);transition:.25s}
    .ml-chips a:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
    @media(max-width:680px){.ml-info{grid-template-columns:1fr}.ml-aeo{padding:22px 20px}.ml-aeo dl{grid-template-columns:1fr;gap:2px}.ml-aeo dd{margin-bottom:8px}}
  </style>
  <section class="section">
    <div class="wrap ml">
      <figure class="ml-fig">
        <img src="${m.photo.body}" alt="${m.photo.alt}" width="${m.photo.w}" height="${m.photo.h}" fetchpriority="high" decoding="async">
        <figcaption>${m.photo.cap}</figcaption>
      </figure>

      <div class="ml-aeo aeo-summary">
        <div class="ah">${m.name} 핵심 안내</div>
        <dl>
          <dt>위치</dt><dd>${CLINIC.address} · 경춘선 마석역 인근</dd>
          ${raw(m.summary.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join(''))}
          <dt>진료시간</dt><dd>월·수·금 09:00~18:00 · 화·목 09:00~20:00 · 토 09:00~14:00 (일·공휴일 휴진)</dd>
        </dl>
      </div>
      <div class="ml-links">
        <a href="/treatments/${t.slug}"><i class="fas fa-tooth"></i> ${t.name} 진료 자세히</a>
        <a href="/area/maseok"><i class="fas fa-location-dot"></i> 마석 치과 종합 안내</a>
        <a href="/pricing"><i class="fas fa-receipt"></i> 비급여 안내</a>
      </div>

      ${raw(m.sections.map(s => `<h2>${esc(s.h2)}</h2><p>${esc(s.body)}</p>`).join(''))}

      <h2>마석역·마석우시장에서 오시는 길</h2>
      <p>${area.intro} ${area.access}</p>
      <div class="ml-info">
        <div class="ai"><b>대중교통</b><span>${area.transit}</span></div>
        <div class="ai"><b>주차</b><span>당일 진료 시 3시간 무료 (제휴 야외 주차장·건물 내 주차장)</span></div>
      </div>
      <div class="ml-links">
        <a href="${naverMap}" target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> 네이버지도 길찾기</a>
        <a href="${kakaoMap}" target="_blank" rel="noopener"><i class="fas fa-map-pin"></i> 카카오맵 길찾기</a>
        <a href="/directions"><i class="fas fa-diamond-turn-right"></i> 오시는 길 자세히</a>
      </div>

      ${docs.length ? html`
      <h2>${m.label} 담당 의료진</h2>
      <div class="ml-docs">
        ${raw(docs.map(d => `<a href="/doctors/${d.slug}"><img src="${d.photo}" alt="${esc(d.name)} ${esc(d.role)}" loading="lazy" decoding="async" width="54" height="54"><div><div style="font-weight:800;color:var(--navy)">${esc(d.name)} ${esc(d.role)}</div><div style="font-size:.85rem;color:var(--ink-soft)">${esc(d.specialty)}</div></div></a>`).join(''))}
      </div>` : ''}

      <h2>${m.name} 자주 묻는 질문</h2>
      <div class="ml-faq">
        ${raw(m.faqs.map(f => `<details><summary>${esc(f.q)}<i class="fas fa-plus" aria-hidden="true"></i></summary><div class="afb">${esc(f.a)}</div></details>`).join(''))}
      </div>

      <h2>마석 치과 다른 진료 안내</h2>
      ${raw(maseokCardGrid({ idPrefix: 'sib', exclude: m.slug, small: true }))}
      ${otherAreas.length ? raw(`<div class="ml-chips" style="margin-top:22px">${otherAreas.map(a => `<a href="/area/${a.slug}-${t.slug}">${esc(a.name)} ${esc(t.name)}</a>`).join('')}</div>`) : ''}

      <div style="text-align:center;margin-top:52px;background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:44px 24px">
        <h3 style="font-size:1.45rem;margin-bottom:10px;color:#fff;font-family:var(--serif)">${m.name} 상담이 필요하시다면</h3>
        <p style="color:rgba(255,255,255,.82);margin-bottom:24px">불편한 곳을 편하게 말씀해 주세요. 검사 결과를 함께 보며 필요한 진료부터 설명해 드립니다.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="tel:${CLINIC.tel}" class="btn btn-gold"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          ${sns.naverBookingUrl ? raw(`<a href="${sns.naverBookingUrl}" target="_blank" rel="noopener" class="btn" style="background:#03C75A;color:#fff">네이버 예약</a>`) : ''}
          <a href="/reservation" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.6)"><i class="fas fa-calendar-check"></i> 예약 문의</a>
        </div>
      </div>

      <p style="margin-top:28px;font-size:.78rem;color:var(--ink-soft);line-height:1.7">※ 진료 방법과 결과는 개인의 구강 상태에 따라 다를 수 있으며, 정확한 진단은 내원 상담을 통해 받아보시기 바랍니다. · 최종 수정 <time datetime="${MASEOK_LOCAL_UPDATED}">${MASEOK_LOCAL_UPDATED}</time></p>
    </div>
  </section>
  `;
}
