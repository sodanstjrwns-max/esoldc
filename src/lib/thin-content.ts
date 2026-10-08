/**
 * 얇은(thin) 상세 페이지 판정 — GSC "크롤링됨-미색인" 정리용 (2026-09-29)
 *
 * 원칙 (PF Web Engine 공통, eumdc 79fab5b 동일):
 *  - 항목 고유 본문(태그 제거·공백 제외 글자 수)이 기준 미만이면
 *    <meta name="robots" content="noindex, follow"> + X-Robots-Tag noindex + 사이트맵 제외.
 *  - 페이지와 내부 링크는 그대로 유지 → 본문을 보강해 기준을 넘으면 자동으로 색인·사이트맵 복귀.
 *
 * 2026-09-29 실측:
 *  - 백과사전 510개: 짧은 정의만 있는 310개는 12~57자, 심층 설명(longDef) 200개는 451~593자
 *    → 300자 기준이 두 그룹 사이 빈 구간이라 명확히 갈림 (thin 310 / 색인 유지 200)
 *  - 공지 4건: 보이는 본문 59~150자 (주차·휴진·진료 안내) → 전부 thin
 */
import type { GTerm } from '../data/glossary';

export const THIN_GLOSSARY_MIN_CHARS = 300;
export const THIN_NOTICE_MIN_CHARS = 300;
export const NOINDEX_FOLLOW = 'noindex, follow';

/** HTML → 화면에 보이는 글자 수 (태그·엔티티·공백 제외) */
export function visibleTextLength(s?: string | null): number {
  if (!s) return 0;
  return String(s)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, '')
    .length;
}

/** 백과사전 용어 고유 본문 글자 수: 정의 + 심층 설명 + 보강 본문(도입·소제목·문단·FAQ) */
export function glossaryTextLength(t: Pick<GTerm, 'def' | 'longDef' | 'rich'>): number {
  const r = t.rich;
  const richText = r
    ? [r.lead, ...r.sections.flatMap(s => [s.h, s.p]), ...r.faqs.flatMap(f => [f.q, f.a])].join(' ')
    : '';
  return visibleTextLength(t.def) + visibleTextLength(t.longDef) + visibleTextLength(richText);
}

/** 백과사전 용어: 정의 + 심층 설명 + 보강 본문 (2026-10-08 보강으로 310개 전부 기준 통과 → 색인·사이트맵 자동 복귀) */
export function isThinGlossaryTerm(t: Pick<GTerm, 'def' | 'longDef' | 'rich'>): boolean {
  return glossaryTextLength(t) < THIN_GLOSSARY_MIN_CHARS;
}

/** 공지: 본문(content_html) */
export function isThinNotice(n: { content_html?: string | null }): boolean {
  return visibleTextLength(n.content_html) < THIN_NOTICE_MIN_CHARS;
}
