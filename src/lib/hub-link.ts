// =====================================================================
// "마석 치과" 대표 키워드 허브(/area/maseok)로 모으는 내부 링크 (2026-10-08)
// - 앵커 문구는 항상 정확히 "마석 치과", nofollow 없음
// - 한 페이지에 허브 링크 최대 2개(푸터 1 + 본문 1). 허브 자신에는 넣지 않는다.
// - 블로그 상세 끝 안내 문장은 4가지 문형 중 slug 해시로 고정 선택(글마다 같은 문장 반복 방지)
// - 사실 정보는 레포 값만: 마석로 25·경춘선 마석역 인근(clinic.ts), 화·목 저녁 8시 야간진료·당일 진료 3시간 무료주차(마석 허브 FAQ)
// =====================================================================

export const HUB_PATH = '/area/maseok';
export const HUB_ANCHOR = '마석 치과';

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** 블로그 상세 본문 끝(작성자 박스 위) 지역 안내 한 문장(HTML 문자열). seed = 글 slug */
export function blogHubNote(seed: string, topic?: string): string {
  const a = `<a href="${HUB_PATH}" style="color:var(--gold-3);font-weight:700;text-decoration:underline;text-underline-offset:3px">${HUB_ANCHOR}</a>`;
  const what = topic ? `${topic} 상담` : '진료 상담';
  const forms = [
    `이솔치과의원은 ${a}를 찾는 화도읍 주민분들께 ${what}부터 진료 일정까지 차근차근 안내합니다.`,
    `${a}를 알아보고 계신다면 경춘선 마석역 인근 마석로 25에 있는 이솔치과의원의 위치와 주차 안내를 먼저 확인해 보세요.`,
    `퇴근 뒤에 ${a}를 찾는 분들을 위해 이솔치과의원은 화·목요일 저녁 8시까지 야간진료를 합니다.`,
    `창현·묵현·가곡리 등 화도읍 곳곳에서 ${a}를 찾는 분들께 이솔치과의원의 의료진과 찾아오는 길을 한곳에 정리해 두었습니다.`,
  ];
  return `<p class="post-hub-note reveal" style="margin-top:36px;background:var(--gold-soft);border-left:4px solid var(--gold);border-radius:0 12px 12px 0;padding:16px 22px;font-size:.95rem;line-height:1.8;color:var(--ink)">${forms[hashSeed(seed) % forms.length]}</p>`;
}
