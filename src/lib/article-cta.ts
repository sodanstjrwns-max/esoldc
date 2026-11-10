// =====================================================================
// 글 끝 상담 블록 (2026-11-10) — 치과 백과사전 용어·원장 칼럼 상세의 본문 끝(관련 목록 위)
// - 정보 글에서 예약·문의로 가는 길. 버튼은 clinic.ts 에 값이 있는 채널만(네이버 예약·전화·카카오톡).
//   예약 문의(/reservation)는 각 글 맨 아래 기존 버튼이 맡는다(중복 방지) — 그 버튼에도 data-cta="article-end".
// - 강조색은 네이버 예약 한 가지, 나머지는 테두리형(.btn-ghost). 색·모서리는 사이트 토큰만 사용.
// - 제목은 heading 이 아닌 strong — 글의 제목 구조(h1~h3)·목차·구조화 데이터에 영향 없음.
// - 문구는 안내만: 효과·결과 약속, 재촉 표현 금지(의료광고법).
// =====================================================================
import { CLINIC } from '../data/clinic';

export const ARTICLE_CTA_CSS = `
.art-cta{margin-top:36px;background:#fff;border:1px solid var(--line);border-radius:var(--radius-lg);padding:26px 28px}
.art-cta-h{display:block;font-family:var(--display);font-size:1.12rem;font-weight:800;color:var(--navy);letter-spacing:-.01em;margin-bottom:6px}
.art-cta p{font-size:.95rem;line-height:1.8;color:var(--ink-soft);margin:0 0 18px;word-break:keep-all}
.art-cta-btns{display:flex;gap:10px;flex-wrap:wrap}
.art-cta-btns .btn{padding:13px 22px;font-size:.96rem;justify-content:center;white-space:nowrap}
@media(max-width:560px){.art-cta{padding:22px 20px}.art-cta-btns .btn{flex:1 1 calc(50% - 5px);padding:13px 10px}.art-cta-btns .ac-naver{flex-basis:100%}}
`;

/** intro=false 면 첫 문장("이 글은 일반 정보입니다.")을 생략 — 바로 위에 같은 뜻의 고지문이 있는 글(칼럼)용 */
export function articleEndCta(opts: { intro?: boolean } = {}): string {
  const nvb = String((CLINIC.sns as any).naverBookingUrl || '').trim();
  const kko = String(CLINIC.sns.kakaoChannelUrl || '').trim();
  const lead = opts.intro === false ? '' : '이 글은 일반 정보입니다. ';
  return `
    <aside class="art-cta" aria-label="진료 문의">
      <strong class="art-cta-h">직접 확인이 필요하다면</strong>
      <p>${lead}내 상태는 진료실에서 확인해야 정확합니다. 진료 시간 안에 ${CLINIC.name}으로 문의해 주세요.</p>
      <div class="art-cta-btns">
        ${nvb ? `<a href="${nvb}" target="_blank" rel="noopener" class="btn ac-naver" data-cta="article-end" style="background:#03C75A;color:#fff;gap:7px"><span class="nv-mark">N</span> 네이버 예약</a>` : ''}
        <a href="tel:${CLINIC.tel}" class="btn btn-ghost" data-cta="article-end"><i class="fas fa-phone" style="font-size:.9em"></i> ${CLINIC.tel}</a>
        ${kko ? `<a href="${kko}" target="_blank" rel="noopener" class="btn btn-ghost" data-cta="article-end"><i class="fas fa-comment"></i> 카카오톡 문의</a>` : ''}
      </div>
    </aside>`;
}
