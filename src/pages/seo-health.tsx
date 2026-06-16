import { html, raw } from 'hono/html';
import { CLINIC } from '../data/clinic';
import { buildLinkCoverage, type LinkCoverageReport } from '../lib/linkgraph';

/**
 * SEO Health 대시보드 — 내부링크 커버리지 시각화.
 * 데이터에 정의된 실제 내부 링크만 집계해, 몇 개 페이지가
 * 링크 그물(link mesh)에 들어와 있는지 보여준다.
 */
export function SeoHealthPage() {
  const r: LinkCoverageReport = buildLinkCoverage();

  const groupColor = (g: string) =>
    ({
      '코어': '#A6772F',
      '진료 상세': '#C99A52',
      '의료진 상세': '#8A5F26',
      '지역 상세': '#B98A3E',
      '용어 상세': '#D9B675',
    } as Record<string, string>)[g] || '#A6772F';

  // 인바운드 상위 / 고립 페이지
  const topInbound = [...r.nodes].sort((a, b) => b.inbound - a.inbound).slice(0, 12);

  const css = `
  .sh-wrap{max-width:1080px;margin:0 auto;padding:48px 20px 96px}
  .sh-head{text-align:center;margin-bottom:8px}
  .sh-head h1{font-family:'Gowun Batang',serif;font-size:clamp(28px,5vw,42px);color:var(--ink);margin:0 0 10px}
  .sh-head p{color:var(--ink-soft);max-width:640px;margin:0 auto;line-height:1.7}
  .sh-stamp{font-size:13px;color:var(--ink-faint);margin-top:6px}
  .sh-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin:40px 0}
  .sh-kpi{background:var(--bg-card);border:1px solid var(--gold-soft);border-radius:18px;padding:24px 20px;text-align:center;box-shadow:0 6px 20px rgba(140,100,40,.06)}
  .sh-kpi .num{font-family:'Space Grotesk','Gowun Batang',serif;font-size:38px;font-weight:700;color:var(--gold-3);line-height:1}
  .sh-kpi .lbl{margin-top:8px;font-size:13px;color:var(--ink-soft)}
  .sh-kpi .sub{font-size:12px;color:var(--ink-faint);margin-top:2px}
  .sh-section{margin-top:48px}
  .sh-section h2{font-family:'Gowun Batang',serif;font-size:22px;color:var(--ink);margin:0 0 18px;display:flex;align-items:center;gap:10px}
  .sh-section h2 i{color:var(--gold)}
  .sh-bars{display:flex;flex-direction:column;gap:16px}
  .sh-bar-row{background:var(--bg-card);border:1px solid var(--gold-soft);border-radius:14px;padding:16px 18px}
  .sh-bar-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;flex-wrap:wrap;gap:4px}
  .sh-bar-name{font-weight:600;color:var(--ink)}
  .sh-bar-meta{font-size:13px;color:var(--ink-soft)}
  .sh-bar-meta b{color:var(--gold-3)}
  .sh-track{height:14px;background:var(--bg-deep);border-radius:9px;overflow:hidden}
  .sh-fill{height:100%;border-radius:9px;transition:width .8s cubic-bezier(.16,1,.3,1)}
  .sh-table{width:100%;border-collapse:collapse;background:var(--bg-card);border-radius:14px;overflow:hidden;border:1px solid var(--gold-soft)}
  .sh-table th,.sh-table td{padding:11px 14px;text-align:left;font-size:14px;border-bottom:1px solid var(--gold-soft)}
  .sh-table th{background:var(--bg-soft);color:var(--ink-soft);font-weight:600;font-size:13px}
  .sh-table tr:last-child td{border-bottom:none}
  .sh-table td a{color:var(--gold-3);text-decoration:none}
  .sh-table td a:hover{text-decoration:underline}
  .sh-pill{display:inline-block;padding:2px 9px;border-radius:20px;font-size:12px;font-weight:600;color:#fff}
  .sh-note{margin-top:40px;padding:18px 20px;background:var(--bg-soft);border-radius:14px;border-left:4px solid var(--gold);font-size:13px;color:var(--ink-soft);line-height:1.7}
  .sh-ok{color:#3a7d44;font-weight:700}
  `;

  const overallColor = r.coveragePct >= 99 ? '#3a7d44' : r.coveragePct >= 90 ? '#A6772F' : '#b9533e';

  return html`
  <style>${raw(css)}</style>
  <main class="sh-wrap">
    <header class="sh-head">
      <h1><i class="fa-solid fa-diagram-project" style="color:var(--gold);margin-right:10px"></i>SEO Health · 내부링크 커버리지</h1>
      <p class="aeo-summary">사이트의 모든 페이지가 내부 링크 그물(link mesh)에 얼마나 촘촘히 연결되어 있는지를 데이터 기반으로 분석한 결과입니다. 들어오는 링크(inbound)가 1개 이상이면 검색엔진이 발견·크롤링할 수 있는 "커버된" 페이지로 봅니다.</p>
      <p class="sh-stamp">분석일 ${r.generatedAt} · ${CLINIC.name} · 실제 코드/데이터에 정의된 링크만 집계</p>
    </header>

    <section class="sh-kpis">
      <div class="sh-kpi">
        <div class="num" style="color:${overallColor}">${r.coveragePct}%</div>
        <div class="lbl">전체 링크 커버리지</div>
        <div class="sub">${r.coveredPages} / ${r.totalPages} 페이지</div>
      </div>
      <div class="sh-kpi">
        <div class="num">${r.totalPages}</div>
        <div class="lbl">분석 대상 페이지</div>
        <div class="sub">코어·진료·의료진·지역·용어</div>
      </div>
      <div class="sh-kpi">
        <div class="num">${r.totalEdges.toLocaleString()}</div>
        <div class="lbl">내부 링크 엣지</div>
        <div class="sub">페이지 간 연결 총합</div>
      </div>
      <div class="sh-kpi">
        <div class="num">${r.avgInbound}</div>
        <div class="lbl">평균 인바운드</div>
        <div class="sub">페이지당 받는 링크 수</div>
      </div>
      <div class="sh-kpi">
        <div class="num" style="color:${r.orphanPages.length === 0 ? '#3a7d44' : '#b9533e'}">${r.orphanPages.length}</div>
        <div class="lbl">고립 페이지</div>
        <div class="sub">${r.orphanPages.length === 0 ? '링크 그물 밖 0개 ✓' : '인바운드 0인 페이지'}</div>
      </div>
    </section>

    <section class="sh-section">
      <h2><i class="fa-solid fa-layer-group"></i>그룹별 커버리지</h2>
      <div class="sh-bars">
        ${raw(r.groups.map(g => `
          <div class="sh-bar-row">
            <div class="sh-bar-top">
              <span class="sh-bar-name">${g.group}</span>
              <span class="sh-bar-meta"><b>${g.coverage}%</b> · ${g.covered}/${g.total} 페이지 연결됨</span>
            </div>
            <div class="sh-track">
              <div class="sh-fill" style="width:${g.coverage}%;background:${groupColor(g.group)}"></div>
            </div>
          </div>`).join(''))}
      </div>
    </section>

    <section class="sh-section">
      <h2><i class="fa-solid fa-trophy"></i>인바운드 링크 TOP 12 <span style="font-size:13px;font-weight:400;color:var(--ink-faint)">(가장 많이 연결된 페이지)</span></h2>
      <table class="sh-table">
        <thead><tr><th>페이지</th><th>그룹</th><th>인바운드</th><th>아웃바운드</th></tr></thead>
        <tbody>
          ${raw(topInbound.map(n => `
            <tr>
              <td><a href="${n.id}">${n.label}</a></td>
              <td><span class="sh-pill" style="background:${groupColor(n.group)}">${n.group}</span></td>
              <td><b style="color:var(--gold-3)">${n.inbound}</b></td>
              <td>${n.outbound}</td>
            </tr>`).join(''))}
        </tbody>
      </table>
    </section>

    ${raw(r.orphanPages.length > 0 ? `
    <section class="sh-section">
      <h2><i class="fa-solid fa-triangle-exclamation" style="color:#b9533e"></i>고립 페이지 (개선 필요)</h2>
      <table class="sh-table">
        <thead><tr><th>페이지</th><th>그룹</th></tr></thead>
        <tbody>
          ${r.orphanPages.map(n => `<tr><td><a href="${n.id}">${n.label}</a></td><td><span class="sh-pill" style="background:${groupColor(n.group)}">${n.group}</span></td></tr>`).join('')}
        </tbody>
      </table>
    </section>` : `
    <section class="sh-section">
      <h2><i class="fa-solid fa-circle-check" style="color:#3a7d44"></i>고립 페이지 점검</h2>
      <p style="color:var(--ink-soft);line-height:1.7"><span class="sh-ok">전 페이지가 내부 링크 그물에 연결되어 있습니다.</span> 검색엔진 크롤러가 한 페이지에서 출발해 사이트 전체를 따라갈 수 있는 구조입니다.</p>
    </section>`)}

    <div class="sh-note">
      <i class="fa-solid fa-circle-info" style="color:var(--gold);margin-right:6px"></i>
      이 대시보드는 <b>실제 코드와 데이터(clinic.ts / glossary.ts)에 정의된 내부 링크</b>만을 집계합니다.
      진료↔의료진↔용어↔지역 페이지가 서로를 인용하는 양방향 링크 구조를 기반으로 하며,
      추정치나 가공된 수치는 포함하지 않습니다. 외부 백링크·실제 크롤링 결과는 Google Search Console에서 별도로 확인하세요.
    </div>
  </main>`;
}
