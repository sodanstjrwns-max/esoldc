// ============================================================
// 칼럼·치료사례 SEO/AEO 헬퍼 (PFWE-COLUMN-CASE-SEO.md, 2026-10-03)
// - 핵심 답변: 원장이 쓴 핵심 요약(summary) → 요약 소개(excerpt) → 본문 첫 답변 문단. 새로 쓰지 않는다.
// - 질문형 H2/H3 → FAQ (답변 = 그 제목 아래 본문). 원장이 입력한 FAQ(faq_json)와 중복 제거 후 합친다.
// - 본문 이미지 alt·lazy 보정
// - 치료사례 공개 요약: DB 구조 필드(진료명·담당 원장·기간)만으로 조립
// ============================================================

const decode = (s: string) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export function flatText(h: any): string {
  return decode(String(h || '').replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/[​\r]/g, '').replace(/\s+/g, ' ').trim();
}

export function clipSentences(s: string, max: number, min = 40): string {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  let end = -1;
  const re = /(다\.|요\.|[?!。])(\s|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cut))) end = m.index + m[1].length;
  if (end >= min) return cut.slice(0, end);
  return cut.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

/** 본문 첫 H2 아래 첫 문단(40자 이상) → 없으면 첫 문단 */
function bodyAnswer(html: string): string {
  const src = String(html || '');
  const paras = (h: string) => [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => flatText(m[1])).filter((p) => p.length >= 40 && !/^안녕하세요/.test(p));
  const m = src.match(/<h2[^>]*>[\s\S]*?<\/h2>([\s\S]*?)(?=<h2|$)/i);
  return (m && paras(m[1])[0]) || paras(src)[0] || '';
}

/** 핵심 답변 2~3문장 */
export function answerSummary(p: { summary?: string | null; excerpt?: string | null; content_html?: string | null }): string {
  const cand = [p.summary, p.excerpt].map((x) => flatText(x)).find((x) => x.length >= 40 && /(다\.|요\.|[.?!])/.test(x)) || bodyAnswer(p.content_html || '');
  return clipSentences(cand, 260, 60);
}

const CONNECTOR_Q = /^(그럼|그런데|그래서|그렇다면|그래도|그러면|하지만)[\s,]/;

/** 질문형 H2/H3 → FAQ (접속어로 시작해 단독으로 안 읽히는 질문 제외) */
export function faqsFromArticleHtml(html: string): { q: string; a: string }[] {
  const src = String(html || '');
  const heads = [...src.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const out: { q: string; a: string }[] = [];
  heads.forEach((m, i) => {
    const q = flatText(m[2]).replace(/^(Q\d*[.:)]\s*|\d+[.)]\s*)/i, '');
    if (!/[?？]$/.test(q) || CONNECTOR_Q.test(q)) return;
    const start = (m.index || 0) + m[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index || src.length : src.length;
    const a = clipSentences(flatText(src.slice(start, end)), 600, 60);
    if (a.length >= 30 && !out.some((f) => f.q === q)) out.push({ q, a });
  });
  return out;
}

/** 원장 FAQ + 본문 질문형 제목 FAQ 합치기 (질문 문자열 정규화로 중복 제거) */
export function mergeFaqs(a: { q: string; a: string }[], b: { q: string; a: string }[]) {
  const norm = (q: string) => q.replace(/[\s?？.!,]/g, '');
  const out = [...a];
  for (const f of b) if (!out.some((x) => norm(x.q) === norm(f.q))) out.push(f);
  return out;
}

/** 본문 이미지: alt 없음/의미 없음 → 제목 기반, 첫 이미지 외 lazy, decoding=async */
export function enhanceArticleImages(html: string, title: string): string {
  let n = 0;
  const safeTitle = String(title).replace(/"/g, '&quot;');
  return String(html || '').replace(/<img\b([^>]*)>/gi, (_m, attrs: string) => {
    n++;
    let a = attrs.replace(/\s*contenteditable=("[^"]*"|'[^']*')/gi, '').replace(/\s*\/\s*$/, '');
    const altM = a.match(/\salt=("([^"]*)"|'([^']*)')/i);
    const alt = altM ? (altM[2] ?? altM[3] ?? '').trim() : '';
    if (!alt || /^(이미지|image|img|사진|photo)$/i.test(alt)) {
      const nAlt = `${safeTitle} — 본문 이미지 ${n}`;
      a = altM ? a.replace(altM[0], ` alt="${nAlt}"`) : `${a} alt="${nAlt}"`;
    }
    if (!/\sloading=/i.test(a) && n > 1) a += ' loading="lazy"';
    if (!/\sdecoding=/i.test(a)) a += ' decoding="async"';
    return `<img${a}>`;
  });
}

/** 사례 공개 요약 — 구조 필드만 (나이·성별·동네 등 환자 정보 제외) */
export function caseAutoSummary(x: { duration?: string | null }, txName: string, doctorLabel: string, clinicName: string): string {
  const parts = [`${clinicName} ${txName} 치료 사례입니다.`];
  if (x.duration) parts.push(`치료 기간은 ${x.duration}입니다.`);
  if (doctorLabel) parts.push(`담당 의료진은 ${doctorLabel}입니다.`);
  parts.push('전후 사진은 같은 촬영 조건에서 기록했으며, 치료 결과는 개인에 따라 다를 수 있습니다.');
  return parts.join(' ');
}
