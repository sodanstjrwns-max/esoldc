import { html, raw } from 'hono/html';
import { CLINIC, TREATMENTS, CORE_TREATMENTS, DOCTORS, NEARBY_AREAS, getTreatment, type Treatment, type NearbyArea } from '../data/clinic';

const PAGE_HERO = (crumb: string, title: string, sub: string) => `
<section style="background:var(--navy);color:var(--inv);padding:104px 0 80px;position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(700px 460px at 82% 24%,rgba(185,138,78,.16),transparent 60%)"></div>
  <div class="wrap" style="position:relative;z-index:2">
    <div style="font-size:.78rem;letter-spacing:.12em;color:rgba(250,248,244,.45);margin-bottom:22px"><a href="/" style="color:rgba(250,248,244,.45)">홈</a> / ${crumb}</div>
    <h1 style="font-size:clamp(2.3rem,5.4vw,3.8rem);line-height:1.25;color:var(--inv)">${title}</h1>
    <p style="color:rgba(250,248,244,.72);font-size:1.12rem;max-width:660px;margin-top:16px">${sub}</p>
  </div>
</section>`;

// ============ 병원소개 / 미션 ============
export function MissionPage() {
  return html`
  <style>
    .m-hero{min-height:90vh;display:flex;align-items:center;background:linear-gradient(135deg,var(--navy),var(--navy-2));color:#fff;position:relative;overflow:hidden}
    .m-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 75% 35%,rgba(185,138,78,.18),transparent 55%)}
    .m-hero .wrap{position:relative;z-index:2}
    .m-hero .eyebrow{color:var(--gold)}
    .m-hero h1{font-size:clamp(2.4rem,6vw,4.4rem);line-height:1.15;margin:18px 0}
    .m-hero p{font-size:1.25rem;color:rgba(255,255,255,.85);max-width:640px}
    .m-story{max-width:760px;margin:0 auto}
    .m-story p{font-size:1.15rem;line-height:2;color:var(--ink-soft);margin-bottom:24px}
    .m-story .big{font-size:1.6rem;font-weight:800;color:var(--navy);line-height:1.5;margin:40px 0}
    .m-values{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .m-val{padding:36px;background:#fff;border-radius:var(--radius-lg);border:1px solid var(--line);text-align:center;transition:all .4s var(--ease)}
    .m-val:hover{transform:translateY(-8px);box-shadow:var(--shadow)}
    .m-val .vi{width:70px;height:70px;border-radius:50%;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:1.8rem;margin:0 auto 20px}
    .m-val h3{font-size:1.3rem;margin-bottom:10px}.m-val p{color:var(--ink-soft);font-size:.95rem}
    @media(max-width:860px){.m-values{grid-template-columns:1fr}}
  </style>
  <section class="m-hero">
    <div class="wrap">
      <span class="eyebrow">Our Mission</span>
      <h1 class="reveal in">기분 좋게<br>진료를 마칠 때까지</h1>
      <p class="reveal in reveal-d1">남양주 마석에서 10년째 한자리. 소아부터 조부모님까지 3대가 함께 다니는, 가장 편하게 떠올릴 수 있는 우리 가족 치과 주치의입니다.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap m-story">
      <div class="section-head reveal" style="text-align:left;margin:0 0 36px;max-width:none">
        <span class="eyebrow">Our Story</span>
        <h2 style="font-size:2rem;margin-top:14px">우리가 치과를 시작한 이유</h2>
      </div>
      <p class="reveal">치과는 누구에게나 조금은 긴장되는 공간입니다. 그 긴장을 덜어드리고, 진료가 끝났을 때 "오길 잘했다"는 마음으로 돌아가시는 것 — 그것이 이솔치과가 처음부터 바라온 모습입니다.</p>
      <p class="reveal">2017년 개원 이래 10년째, 우리는 한자리를 지켰습니다. 할머니의 틀니 치료로 시작된 인연이 아버지의 임플란트로, 다시 아이의 충치 치료와 정기검진으로 이어져 — 한 가족이 3대에 걸쳐 함께 다니게 되는 시간 속에서, 동네 치과의 의미를 다시 새기게 됩니다.</p>
      <p class="big reveal">"지역 안에서 자리 잘 잡은 치과,<br>가장 편하게 떠올릴 수 있는 치과가 되는 것."</p>
      <p class="reveal">그래서 우리는 쫓기듯 진료하지 않고, 하지 않아도 되는 치료를 먼저 권하지 않습니다. 비용이 걱정이신 분께는 비용에 맞는 계획을, 통증이 두려우신 분께는 통증을 줄이는 방향을 함께 찾습니다. 각 분야 전문의가 상주하기에(임플란트 제외) 가능한 일입니다.</p>
      <p class="reveal">그리고 우리가 바라는 마지막 장면은 하나입니다. 병원에 들어오시는 순간부터 치료를 마치고 집으로 돌아가시는 순간까지, “편안하고 세심하게 배려받았다”는 기분으로 문을 나서시는 것. 그 한 가지를 위해 오늘도 작은 부분까지 살핍니다.</p>
    </div>
  </section>

  <section class="section" style="background:var(--bg-soft)">
    <div class="wrap">
      <div class="section-head reveal">
        <span class="eyebrow" style="justify-content:center">Core Values</span>
        <h2>이솔치과의 약속</h2>
      </div>
      <div class="m-values">
        <div class="m-val reveal"><div class="vi"><i class="fas fa-hand-holding-heart"></i></div><h3>따뜻한 진료</h3><p>친절을 진료의 기본으로 여깁니다. 환자분이 편안한 마음으로 진료받을 수 있도록 노력합니다.</p></div>
        <div class="m-val reveal reveal-d1"><div class="vi"><i class="fas fa-microscope"></i></div><h3>정밀한 진단</h3><p>전문의 의료진의 정밀 진단을 진료의 출발점으로 삼습니다.</p></div>
        <div class="m-val reveal reveal-d2"><div class="vi"><i class="fas fa-handshake"></i></div><h3>오래가는 신뢰</h3><p>10년째 한자리를 지키며 쌓아온 지역 신뢰를 가장 소중히 여깁니다.</p></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap" style="text-align:center">
      <div class="reveal" style="background:linear-gradient(135deg,var(--gold),var(--gold));color:#fff;border-radius:var(--radius-lg);padding:64px 32px">
        <h2 style="font-size:2.2rem;margin-bottom:14px">이솔치과의 의료진을 만나보세요</h2>
        <p style="color:rgba(255,255,255,.85);margin-bottom:28px">각 분야 전문의가 환자분을 기다리고 있습니다.</p>
        <a href="/doctors" class="btn btn-gold">의료진 소개 보기</a>
      </div>
    </div>
  </section>
  `;
}

// ============ 오시는 길 ============
export function DirectionsPage() {
  return html`
  ${raw(PAGE_HERO('오시는길', '오시는 길', '남양주 마석, 편하게 찾아오실 수 있습니다.'))}
  <style>
    .dir-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
    .dir-info .row{display:flex;gap:16px;padding:22px 0;border-bottom:1px solid var(--line)}
    .dir-info .ri{width:48px;height:48px;border-radius:12px;background:var(--gold-soft);color:var(--gold);display:grid;place-items:center;font-size:1.2rem;flex:none}
    .dir-info .rt{font-weight:800;margin-bottom:4px}.dir-info .rd{color:var(--ink-soft)}
    .map-box{border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow);background:var(--bg-soft);min-height:420px;display:grid;place-items:center;text-align:center;padding:40px}
    .hours-table{width:100%;border-collapse:collapse;margin-top:8px}
    .hours-table td{padding:14px 0;border-bottom:1px solid var(--line)}
    .hours-table td:first-child{font-weight:700;color:var(--navy)}
    .hours-table td:last-child{text-align:right;color:var(--ink-soft)}
    @media(max-width:860px){.dir-grid{grid-template-columns:1fr}}
  </style>
  <section class="section">
    <div class="wrap">
      <div class="dir-grid">
        <div class="dir-info reveal">
          <h2 style="font-size:1.8rem;margin-bottom:10px">${CLINIC.name}</h2>
          <div class="row"><div class="ri"><i class="fas fa-map-marker-alt"></i></div><div><div class="rt">주소</div><div class="rd">${CLINIC.address}</div></div></div>
          <div class="row"><div class="ri"><i class="fas fa-phone"></i></div><div><div class="rt">대표전화</div><div class="rd"><a href="tel:${CLINIC.tel}" style="color:var(--gold);font-weight:700">${CLINIC.tel}</a></div></div></div>
          <div class="row"><div class="ri"><i class="fas fa-subway"></i></div><div><div class="rt">대중교통</div><div class="rd">경춘선 마석역 인근 · 마석로 25, 4층</div></div></div>
          <div class="row"><div class="ri"><i class="fas fa-car"></i></div><div><div class="rt">주차</div><div class="rd">자세한 주차 안내는 전화로 문의해 주세요.</div></div></div>
          <a href="https://map.naver.com/v5/search/${encodeURIComponent(CLINIC.address)}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:24px"><i class="fas fa-map"></i> 네이버 지도로 보기</a>
        </div>
        <div class="reveal reveal-d1">
          <div class="map-box">
            <div>
              <i class="fas fa-map-marked-alt" style="font-size:3rem;color:var(--gold);margin-bottom:16px"></i>
              <p style="font-weight:700;font-size:1.1rem">${CLINIC.address}</p>
              <p style="color:var(--ink-soft);margin-top:8px">지도 앱에서 '${CLINIC.name}'을 검색하시면<br>편하게 길찾기가 가능합니다.</p>
            </div>
          </div>
          <h3 style="font-size:1.3rem;margin:32px 0 4px"><i class="fas fa-clock" style="color:var(--gold);margin-right:8px"></i>진료시간</h3>
          <table class="hours-table">
            ${raw(CLINIC.hours.map(h => `<tr><td>${h.day}</td><td>${h.time}</td></tr>`).join(''))}
          </table>
          <p style="font-size:.85rem;color:var(--ink-soft);margin-top:14px">※ ${CLINIC.hoursNote}</p>
        </div>
      </div>
    </div>
  </section>
  `;
}

// ============ 통합 FAQ ============
export function FaqPage() {
  return html`
  ${raw(PAGE_HERO('자주묻는질문', '자주 묻는 질문', '진료별로 환자분들이 자주 궁금해하시는 내용을 모았습니다.'))}
  <style>
    .faq-cat{margin-bottom:48px}
    .faq-cat h2{font-size:1.5rem;color:var(--navy);margin-bottom:20px;display:flex;align-items:center;gap:12px}
    .faq-cat h2 i{color:var(--gold)}
    .faq-item{border:1px solid var(--line);border-radius:var(--radius);margin-bottom:12px;overflow:hidden;transition:all .3s var(--ease)}
    .faq-item[open]{border-color:var(--gold);box-shadow:var(--shadow-sm)}
    .faq-item summary{padding:20px 24px;font-weight:700;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:14px;align-items:center}
    .faq-item summary::-webkit-details-marker{display:none}
    .faq-item summary i{color:var(--gold);transition:transform .3s}
    .faq-item[open] summary i{transform:rotate(45deg)}
    .faq-item .fb{padding:0 24px 22px;color:var(--ink-soft);line-height:1.8}
  </style>
  <section class="section">
    <div class="wrap" style="max-width:880px">
      ${raw((() => { let gi = 0; return TREATMENTS.map(t => `
        <div class="faq-cat reveal">
          <h2><i class="fas ${t.icon}"></i>${t.name}</h2>
          ${t.faqs.map(f => { gi += 1; return `
            <details class="faq-item" id="q-${gi}">
              <summary>${f.q}<i class="fas fa-plus"></i></summary>
              <div class="fb">${f.a}</div>
            </details>`; }).join('')}
          <a href="/treatments/${t.slug}" style="display:inline-block;margin-top:8px;color:var(--gold);font-weight:700;font-size:.9rem">${t.name} 자세히 보기 <i class="fas fa-arrow-right"></i></a>
        </div>`).join(''); })())}
    </div>
  </section>
  `;
}

// ============ 비용 안내 ============
export function PricingPage() {
  return html`
  ${raw(PAGE_HERO('비용안내', '비용 안내', '정확한 비급여 진료비는 내원 상담 시 안내해 드립니다.'))}
  <section class="section">
    <div class="wrap" style="max-width:780px">
      <div class="reveal" style="background:var(--gold-soft);border-left:4px solid var(--gold);padding:28px 32px;border-radius:0 var(--radius) var(--radius) 0;margin-bottom:36px">
        <p style="font-size:1.1rem;line-height:1.8;color:var(--ink)">진료 비용은 환자분의 구강 상태, 진료 범위, 사용되는 재료 등에 따라 달라집니다. 의료법에 따라 비급여 진료비는 병원에 게시된 기준을 따르며, <strong>정확한 비용은 정밀 진단 후 충분한 상담을 통해 안내</strong>해 드립니다.</p>
      </div>
      <div class="reveal reveal-d1" style="text-align:center;padding:48px;background:var(--bg-soft);border-radius:var(--radius-lg)">
        <i class="fas fa-comments" style="font-size:2.5rem;color:var(--gold);margin-bottom:16px"></i>
        <h3 style="font-size:1.4rem;margin-bottom:10px">비용이 궁금하신가요?</h3>
        <p style="color:var(--ink-soft);margin-bottom:24px">부담 없이 전화로 문의해 주세요. 친절하게 안내해 드리겠습니다.</p>
        <a href="tel:${CLINIC.tel}" class="btn btn-primary"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
      </div>
    </div>
  </section>
  `;
}

// ============ 예약 문의 ============
export function ReservationPage() {
  return html`
  ${raw(PAGE_HERO('예약문의', '진료 예약 문의', '편하신 방법으로 문의해 주시면 친절하게 안내해 드리겠습니다.'))}
  <style>
    .res-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
    .res-form{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:36px}
    .res-form label{display:block;font-weight:700;margin:18px 0 8px;font-size:.92rem}
    .res-form input,.res-form select,.res-form textarea{width:100%;padding:13px 16px;border:1px solid var(--line);border-radius:12px;font-size:1rem;font-family:inherit;transition:border .3s}
    .res-form input:focus,.res-form select:focus,.res-form textarea:focus{outline:none;border-color:var(--gold)}
    .res-form .agree{display:flex;gap:10px;align-items:flex-start;margin-top:20px;font-size:.85rem;color:var(--ink-soft)}
    .res-form .agree input{width:auto;margin-top:3px}
    .res-side{background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:40px}
    .res-side h3{color:#fff;font-size:1.4rem;margin-bottom:20px}
    .res-side .si{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.12)}
    .res-side .si i{color:var(--gold);font-size:1.2rem;width:24px}
    .res-msg{padding:14px 18px;border-radius:12px;margin-top:16px;display:none;font-weight:600}
    .res-msg.ok{display:block;background:var(--gold-soft);color:var(--navy)}
    .res-msg.err{display:block;background:#fde8e8;color:#a33}
    @media(max-width:860px){.res-grid{grid-template-columns:1fr}}
  </style>
  <section class="section">
    <div class="wrap">
      <div class="res-grid">
        <div class="res-form reveal">
          <h3 style="font-size:1.4rem;margin-bottom:6px">온라인 예약 문의</h3>
          <p style="color:var(--ink-soft);font-size:.9rem">남겨주시면 확인 후 연락드립니다. (실제 예약 확정은 전화 안내로 진행됩니다.)</p>
          <form id="resForm">
            <label>성함 *</label><input name="name" required placeholder="홍길동">
            <label>연락처 *</label><input name="phone" required placeholder="010-0000-0000">
            <label>희망 진료</label>
            <select name="treatment">
              <option value="">선택 안 함</option>
              ${raw(TREATMENTS.map(t => `<option value="${t.name}">${t.name}</option>`).join(''))}
            </select>
            <label>희망 날짜/시간</label><input name="datetime" placeholder="예: 0월 0일 오후">
            <label>문의 내용</label><textarea name="message" rows="4" placeholder="궁금하신 점을 적어주세요."></textarea>
            <div class="agree"><input type="checkbox" id="agree" required><label for="agree" style="margin:0;font-weight:400">개인정보 수집·이용(예약 상담 목적)에 동의합니다. *</label></div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:20px;justify-content:center"><i class="fas fa-paper-plane"></i> 예약 문의 보내기</button>
            <div class="res-msg" id="resMsg"></div>
          </form>
        </div>
        <div class="res-side reveal reveal-d1">
          <h3>전화 예약이 가장 빠릅니다</h3>
          <div class="si"><i class="fas fa-phone"></i><div><div style="font-weight:800;font-size:1.2rem">${CLINIC.tel}</div><div style="color:rgba(255,255,255,.7);font-size:.85rem">진료시간 내 전화 문의</div></div></div>
          <div class="si"><i class="fas fa-map-marker-alt"></i><div>${CLINIC.address}</div></div>
          <div class="si" style="border:none"><i class="fas fa-clock"></i><div>${raw(CLINIC.hours.map(h=>`${h.day} ${h.time}`).join('<br>'))}</div></div>
          <a href="tel:${CLINIC.tel}" class="btn btn-gold" style="width:100%;justify-content:center;margin-top:24px"><i class="fas fa-phone"></i> 지금 전화하기</a>
        </div>
      </div>
    </div>
  </section>
  <script>
    document.getElementById('resForm').addEventListener('submit',async function(e){
      e.preventDefault();var f=e.target,msg=document.getElementById('resMsg');
      var data=Object.fromEntries(new FormData(f).entries());
      try{
        var r=await fetch('/api/reservation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        if(r.ok){msg.className='res-msg ok';msg.textContent='문의가 정상 접수되었습니다. 확인 후 연락드리겠습니다. 감사합니다!';f.reset();}
        else{throw new Error();}
      }catch(_){msg.className='res-msg err';msg.textContent='접수 중 오류가 발생했습니다. 전화로 문의해 주세요.';}
    });
  </script>
  `;
}

// ============ 비포&애프터 (로그인 게이팅 안내) ============
export function CasesPage() {
  return html`
  ${raw(PAGE_HERO('비포&애프터', '비포 & 애프터', '진료 사례는 의료법에 따라 보호되어 제공됩니다.'))}
  <section class="section">
    <div class="wrap" style="max-width:720px;text-align:center">
      <div class="reveal" style="padding:56px 40px;background:var(--bg-soft);border-radius:var(--radius-lg)">
        <i class="fas fa-lock" style="font-size:2.6rem;color:var(--gold);margin-bottom:20px"></i>
        <h2 style="font-size:1.8rem;margin-bottom:14px">진료 사례 안내</h2>
        <p style="color:var(--ink-soft);font-size:1.05rem;line-height:1.8;margin-bottom:28px">
          의료법상 치료 전후 사진 등 진료 사례는 일반에 무분별하게 노출할 수 없습니다.<br>
          이솔치과의 진료 사례는 내원 상담 시 직접 보여드리며, 충분한 설명과 함께 안내해 드립니다.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="/reservation" class="btn btn-primary"><i class="fas fa-calendar-check"></i> 상담 예약하기</a>
          <a href="tel:${CLINIC.tel}" class="btn btn-ghost"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
        </div>
      </div>
      <p style="font-size:.82rem;color:var(--ink-soft);margin-top:24px">※ 모든 진료 결과는 개인의 구강 상태에 따라 차이가 있을 수 있습니다.</p>
    </div>
  </section>
  `;
}

// ============ 지역 SEO 페이지 ============
// 지역 페이지용 FAQ 자동 생성 (의료광고법 준수 — 단정/보장 배제)
export function areaFaqs(area: NearbyArea, t: Treatment) {
  return [
    {
      q: `${area.name}에서 이솔치과의원까지 어떻게 가나요?`,
      a: `${area.access} 자세한 길 안내는 오시는 길 페이지를 참고하시거나 ${CLINIC.tel}로 문의해 주세요.`,
    },
    {
      q: `${area.name} 주민도 ${t.name} 진료가 가능한가요?`,
      a: `네, 이솔치과의원은 ${CLINIC.address}에 위치하여 ${area.full}을(를) 포함한 인근 지역 주민분들이 방문하실 수 있습니다. ${t.name} 진료 방법과 비용은 개인 상태에 따라 차이가 있으며, 내원 상담을 통해 결정됩니다.`,
    },
    {
      q: `${area.name} 근처에 주차가 가능한 치과인가요?`,
      a: `주차 및 진료 시간 등 방문 관련 안내는 ${CLINIC.tel}로 전화 주시면 친절히 안내해 드립니다.`,
    },
  ];
}

// ============ 지역 허브 페이지 (/area) ============
export function AreaHubPage() {
  return html`
  ${raw(PAGE_HERO('지역 안내', '지역별 진료 안내', `${CLINIC.region} ${CLINIC.district} 마석에서, 인근 지역 주민분들을 위한 진료를 안내합니다.`))}
  <style>
    .hub-body{max-width:1080px;margin:0 auto}
    .hub-intro{background:var(--gold-soft);border-radius:var(--radius-lg);padding:28px 32px;margin-bottom:40px;font-size:1.08rem;color:var(--ink);line-height:1.8}
    .hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:22px}
    .hub-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:28px;transition:transform .3s var(--ease),box-shadow .3s var(--ease)}
    .hub-card:hover{transform:translateY(-4px);box-shadow:var(--shadow)}
    .hub-card h2{font-size:1.3rem;color:var(--navy);margin-bottom:6px;font-family:var(--serif);display:flex;align-items:center;gap:8px}
    .hub-card h2 i{color:var(--gold);font-size:.85em}
    .hub-card .hc-full{font-size:.82rem;color:var(--ink-faint);margin-bottom:10px}
    .hub-card .hc-intro{font-size:.92rem;color:var(--ink-soft);line-height:1.7;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .hub-card .hc-links{display:flex;flex-wrap:wrap;gap:8px}
    .hub-card .hc-links a{font-size:.85rem;padding:8px 14px;border-radius:99px;background:var(--bg-soft);border:1px solid var(--line);color:var(--navy);font-weight:600;transition:.25s}
    .hub-card .hc-links a:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
  </style>
  <section class="section">
    <div class="wrap hub-body">
      <div class="hub-intro reveal">
        <strong>${CLINIC.name}</strong>은(는) ${CLINIC.address}에 위치하여, 마석을 중심으로 화도읍과 남양주시 인근 지역 주민분들이 방문하실 수 있는 동네 치과입니다. 임플란트를 제외한 각 분야 전문의가 상주하며, 지역별 진료 안내를 아래에서 확인하실 수 있습니다.
      </div>
      <div class="hub-grid">
        ${raw(NEARBY_AREAS.map(a => `
          <article class="hub-card reveal">
            <h2><i class="fas fa-location-dot"></i>${a.name}</h2>
            <div class="hc-full">${a.full}</div>
            <p class="hc-intro">${a.intro}</p>
            <div class="hc-links">
              ${CORE_TREATMENTS.map(t => `<a href="/area/${a.slug}-${t.slug}">${a.name} ${t.name}</a>`).join('')}
            </div>
          </article>`).join(''))}
      </div>

      <div style="text-align:center;margin-top:52px;background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:48px">
        <h3 style="font-size:1.5rem;margin-bottom:10px;color:#fff;font-family:var(--serif)">어느 지역에서 오시든 편하게 문의해 주세요</h3>
        <p style="color:rgba(255,255,255,.82);margin-bottom:24px">진료 방법과 비용은 개인 상태에 따라 차이가 있으며, 내원 상담을 통해 안내해 드립니다.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="tel:${CLINIC.tel}" class="btn btn-gold"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/directions" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.6)"><i class="fas fa-diamond-turn-right"></i> 오시는 길</a>
        </div>
      </div>
    </div>
  </section>
  `;
}

export function AreaPage(area: NearbyArea, t: Treatment) {
  const docs = t.doctors.map(s => DOCTORS.find(d => d.slug === s)).filter(Boolean) as typeof DOCTORS;
  const faqs = areaFaqs(area, t);
  // 같은 지역의 다른 핵심 진료 (교차 링크)
  const otherTreats = CORE_TREATMENTS.filter(x => x.slug !== t.slug);
  // 같은 진료의 다른 지역 (교차 링크)
  const otherAreas = NEARBY_AREAS.filter(a => a.slug !== area.slug);
  const naverMap = `https://map.naver.com/v5/search/${encodeURIComponent(CLINIC.address)}`;
  const kakaoMap = `https://map.kakao.com/?q=${encodeURIComponent(CLINIC.address)}`;
  const introAnswer = t.intro.replace(/^[^?]*\?/, '').trim();

  return html`
  ${raw(PAGE_HERO(`<a href="/area" style="color:rgba(250,248,244,.45)">지역 안내</a> / ${area.name} ${t.name}`, `${area.name} ${t.name}`, `${area.full} 인근에서 ${t.name} 치과를 찾으신다면, 이솔치과의원의 ${area.name} ${t.name} 안내를 확인해 보세요.`))}
  <style>
    .area-body{max-width:840px;margin:0 auto}
    .area-body h2{font-size:1.5rem;color:var(--navy);margin:44px 0 16px;padding-left:16px;position:relative;font-family:var(--serif)}
    .area-body h2::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:5px;background:var(--gold);border-radius:3px}
    .area-body p{color:var(--ink-soft);line-height:1.85;font-size:1.05rem}
    .area-aeo{background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:26px 30px;margin-bottom:34px;box-shadow:var(--shadow-sm)}
    .area-aeo .ah{display:flex;align-items:center;gap:10px;font-family:var(--serif);font-weight:700;font-size:1.06rem;color:var(--navy);margin-bottom:14px}
    .area-aeo .ah i{color:var(--gold)}
    .area-aeo ul{list-style:none;margin:0;padding:0;display:grid;gap:11px}
    .area-aeo li{display:flex;gap:11px;align-items:flex-start;font-size:1rem;line-height:1.7;color:var(--ink-soft)}
    .area-aeo li::before{content:'';flex:none;width:8px;height:8px;margin-top:8px;border-radius:50%;background:var(--gold-grad)}
    .area-aeo li strong{color:var(--navy)}
    .area-info{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}
    .area-info .ai-card{background:var(--bg-soft);border:1px solid var(--line);border-radius:var(--radius);padding:18px 20px}
    .area-info .ai-card .ai-t{font-size:.82rem;color:var(--gold);font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px}
    .area-info .ai-card .ai-d{font-size:.96rem;color:var(--ink);line-height:1.6}
    .area-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .area-chips span{font-size:.82rem;background:var(--gold-soft);color:var(--gold-3);border-radius:99px;padding:5px 13px}
    .area-map-btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
    .area-map-btns a{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:var(--radius);border:1px solid var(--line);background:#fff;color:var(--navy);font-weight:700;font-size:.95rem;transition:.25s}
    .area-map-btns a:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
    .area-faq details{border:1px solid var(--line);border-radius:var(--radius);margin-bottom:10px;background:#fff;overflow:hidden}
    .area-faq summary{padding:18px 22px;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px;color:var(--navy)}
    .area-faq summary::-webkit-details-marker{display:none}
    .area-faq summary i{color:var(--gold);transition:transform .3s}
    .area-faq details[open] summary i{transform:rotate(45deg)}
    .area-faq .afb{padding:0 22px 20px;color:var(--ink-soft);line-height:1.8}
    .area-cross{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:18px}
    .area-cross .acc{background:var(--bg-soft);border:1px solid var(--line);border-radius:var(--radius-lg);padding:24px}
    .area-cross h3{font-size:1.05rem;color:var(--navy);margin-bottom:14px;font-family:var(--serif)}
    .area-cross .acl{display:flex;flex-wrap:wrap;gap:8px}
    .area-cross .acl a{font-size:.88rem;padding:8px 15px;border-radius:99px;background:#fff;border:1px solid var(--line);color:var(--navy);transition:.25s}
    .area-cross .acl a:hover{background:var(--navy);color:#fff;border-color:var(--navy)}
    .area-docrow{display:flex;gap:16px;flex-wrap:wrap;margin-top:16px}
    .area-docrow a{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--line);padding:12px 18px 12px 12px;border-radius:var(--radius);transition:.25s}
    .area-docrow a:hover{border-color:var(--gold);box-shadow:var(--shadow-sm)}
    .area-docrow img{width:54px;height:54px;border-radius:10px;object-fit:cover}
    @media(max-width:680px){.area-info,.area-cross{grid-template-columns:1fr}}
  </style>
  <section class="section">
    <div class="wrap area-body">

      <!-- AEO 핵심 요약 (speakable) -->
      <div class="area-aeo aeo-summary reveal">
        <div class="ah"><i class="fas fa-location-dot"></i>${area.name} ${t.name} 핵심 안내</div>
        <ul>
          <li><strong>위치</strong> 이솔치과의원 · ${CLINIC.address} (${CLINIC.region} ${CLINIC.district})</li>
          <li><strong>${area.name} 접근</strong> ${area.access}</li>
          <li><strong>대중교통</strong> ${area.transit}</li>
          <li><strong>진료</strong> ${t.name}을(를) 포함한 다양한 진료 · 각 분야 전문의 상주(임플란트 제외)</li>
          <li><strong>문의</strong> ${CLINIC.tel} · 진료 방법과 비용은 개인 상태에 따라 차이가 있으며 내원 상담을 통해 결정됩니다.</li>
        </ul>
      </div>

      <h2>${area.full}에서 ${t.name} 치과를 찾으신다면</h2>
      <p>${area.intro} 이솔치과의원은 ${CLINIC.address}에 위치하여, ${area.name} 지역에서 가깝게 방문하실 수 있는 동네 치과입니다. 임플란트를 제외한 각 진료 분야의 전문의가 상주하며, 충분한 상담을 통해 환자분의 상태에 맞는 진료를 안내해 드립니다.</p>

      <div class="area-info">
        <div class="ai-card">
          <div class="ai-t"><i class="fas fa-route"></i> ${area.name}에서 오시는 길</div>
          <div class="ai-d">${area.access}</div>
        </div>
        <div class="ai-card">
          <div class="ai-t"><i class="fas fa-train-subway"></i> 대중교통</div>
          <div class="ai-d">${area.transit}</div>
        </div>
      </div>
      <div class="area-chips">
        ${raw(area.landmarks.map(l => `<span>${l}</span>`).join(''))}
      </div>
      <div class="area-map-btns">
        <a href="${naverMap}" target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> 네이버지도 길찾기</a>
        <a href="${kakaoMap}" target="_blank" rel="noopener"><i class="fas fa-map-pin"></i> 카카오맵 길찾기</a>
        <a href="/directions"><i class="fas fa-diamond-turn-right"></i> 오시는 길 자세히</a>
      </div>

      <h2>${area.name} 주민을 위한 ${t.name} 진료</h2>
      <p>${introAnswer}</p>
      <p>이솔치과의원은 ${area.full} 인근에서 ${t.name}을(를) 비롯한 다양한 진료를 제공합니다. 정밀 진단 장비를 바탕으로 환자분의 상태를 확인하고, 충분한 상담을 거쳐 진료 계획을 세웁니다. ${t.name}에 대한 자세한 내용은 <a href="/treatments/${t.slug}" style="color:var(--gold);font-weight:600">${t.name} 진료 안내</a>에서 확인하실 수 있습니다.</p>

      ${docs.length ? html`
      <h2>${t.name} 담당 의료진</h2>
      <div class="area-docrow">
        ${raw(docs.map(d => `<a href="/doctors/${d.slug}"><img src="${d.photo}" alt="${d.name} ${d.role}" loading="lazy" decoding="async"><div><div style="font-weight:800;color:var(--navy)">${d.name}</div><div style="font-size:.85rem;color:var(--ink-soft)">${d.role} · ${d.specialty}</div></div></a>`).join(''))}
      </div>` : ''}

      <h2>${area.name} ${t.name} 자주 묻는 질문</h2>
      <div class="area-faq">
        ${raw(faqs.map(f => `<details><summary>${f.q}<i class="fas fa-plus"></i></summary><div class="afb">${f.a}</div></details>`).join(''))}
      </div>

      <h2>다른 진료·지역도 살펴보세요</h2>
      <div class="area-cross">
        <div class="acc">
          <h3><i class="fas fa-tooth" style="color:var(--gold);margin-right:6px"></i>${area.name}의 다른 진료</h3>
          <div class="acl">
            ${raw(otherTreats.map(x => `<a href="/area/${area.slug}-${x.slug}">${area.name} ${x.name}</a>`).join(''))}
          </div>
        </div>
        <div class="acc">
          <h3><i class="fas fa-location-dot" style="color:var(--gold);margin-right:6px"></i>${t.name} 다른 지역</h3>
          <div class="acl">
            ${raw(otherAreas.slice(0, 7).map(a => `<a href="/area/${a.slug}-${t.slug}">${a.name} ${t.name}</a>`).join(''))}
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:48px;background:var(--gold);color:#fff;border-radius:var(--radius-lg);padding:48px">
        <h3 style="font-size:1.5rem;margin-bottom:10px;color:#fff">${area.name}에서 가까운 이솔치과의원</h3>
        <p style="color:rgba(255,255,255,.85);margin-bottom:24px">${t.name} 상담을 원하시면 편하게 문의해 주세요.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="tel:${CLINIC.tel}" class="btn btn-gold"><i class="fas fa-phone"></i> ${CLINIC.tel}</a>
          <a href="/treatments/${t.slug}" class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.6)">${t.name} 자세히 보기</a>
        </div>
      </div>

      <p style="margin-top:32px;font-size:.78rem;color:var(--ink-soft);line-height:1.7">※ 본 안내는 일반적인 정보 제공을 목적으로 하며, 진료 방법과 결과는 개인의 상태에 따라 차이가 있을 수 있습니다. 정확한 진단은 이솔치과의원 내원 상담을 통해 받아보시기 바랍니다.</p>
    </div>
  </section>
  `;
}

// ============ 404 ============
export function NotFoundPage() {
  return html`
  <section style="min-height:80vh;display:flex;align-items:center;justify-content:center;background:var(--bg-soft);text-align:center;padding:120px 20px 60px">
    <div>
      <div style="font-size:6rem;font-weight:800;color:var(--gold);line-height:1">404</div>
      <h1 style="font-size:1.8rem;margin:16px 0 10px">페이지를 찾을 수 없습니다</h1>
      <p style="color:var(--ink-soft);margin-bottom:28px">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <a href="/" class="btn btn-primary"><i class="fas fa-home"></i> 홈으로 돌아가기</a>
    </div>
  </section>
  `;
}
