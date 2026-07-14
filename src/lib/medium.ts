// ============================================================================
// Medium 영문 칼럼 RSS 연동 — https://medium.com/feed/@isoldent1
// /blog 페이지에 최신 영문 글 목록 자동 노출.
// - Cloudflare 엣지 캐시 1시간 (cf.cacheTtl) → Medium 요청 최소화
// - 실패/타임아웃 시 빈 배열 반환 → 블로그 페이지는 절대 깨지지 않음
// ============================================================================

export type MediumPost = {
  title: string;
  link: string;       // 트래킹 파라미터 제거된 URL
  pubDate: string;    // YYYY-MM-DD
};

const MEDIUM_FEED = 'https://medium.com/feed/@isoldent1';
const FETCH_TIMEOUT_MS = 4000;

// XML CDATA/엔티티 → 텍스트
function xmlText(s: string): string {
  return s
    .replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
}

export async function fetchMediumPosts(limit = 6): Promise<MediumPost[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(MEDIUM_FEED, {
      headers: { 'User-Agent': 'isoldc.kr RSS reader (+https://isoldc.kr)' },
      signal: ctrl.signal,
      // Cloudflare 엣지 캐시: 1시간 동안 Medium 재요청 없음
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);
    clearTimeout(timer);
    if (!res.ok) return [];
    const xml = await res.text();

    const posts: MediumPost[] = [];
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    for (const it of items.slice(0, limit)) {
      const t = it.match(/<title>([\s\S]*?)<\/title>/);
      const l = it.match(/<link>([\s\S]*?)<\/link>/);
      const d = it.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      if (!t || !l) continue;
      const link = xmlText(l[1]).split('?')[0]; // ?source=rss... 트래킹 제거
      let pubDate = '';
      if (d) {
        const dt = new Date(xmlText(d[1]));
        if (!isNaN(dt.getTime())) pubDate = dt.toISOString().slice(0, 10);
      }
      posts.push({ title: xmlText(t[1]), link, pubDate });
    }
    return posts;
  } catch {
    return []; // 네트워크 실패·타임아웃 → 조용히 생략
  }
}
