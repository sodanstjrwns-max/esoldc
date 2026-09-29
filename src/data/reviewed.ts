// ============================================================
// 최종 검토일 (MedicalWebPage.lastReviewed + 화면 감수 줄)
// 값 = 해당 콘텐츠를 실제로 마지막으로 수정한 커밋 날짜 (git blame 기준, 2026-09-29 산출).
// ※ new Date() 로 오늘 날짜를 채우지 않는다. 본문을 고치면 이 값도 같이 갱신할 것.
// ============================================================

// 진료 페이지: src/data/clinic.ts TREATMENTS 항목 + src/data/faqs-extra.ts 해당 과목
export const TREATMENT_REVIEWED: Record<string, string> = {
  implant: '2026-08-18',
  orthodontics: '2026-08-18',
  pediatric: '2026-08-18',
  prosthetics: '2026-08-18',
  periodontics: '2026-08-18',
  general: '2026-08-18',
};

// /faq: 진료별 FAQ 문항(clinic.ts faqs + faqs-extra.ts) 중 가장 최근 수정
export const FAQ_REVIEWED = '2026-06-16';

// 백과사전: 정의(glossary.ts) 2026-06-13, 심층 설명(glossary-long.ts) 추가 2026-06-14
export const GLOSSARY_DEF_REVIEWED = '2026-06-13';
export const GLOSSARY_LONG_REVIEWED = '2026-06-14';
