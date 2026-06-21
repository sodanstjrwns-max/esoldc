// ============================================================================
// IndexNow — 콘텐츠 발행 시 검색엔진에 즉시 색인 요청 (Bing/Yandex 공식, 구글도 신호 수신)
// ----------------------------------------------------------------------------
// 동작:
//  1) /{KEY}.txt 경로에 키 파일을 공개해 도메인 소유 증명 (index.tsx 라우트에서 처리)
//  2) 글/케이스 발행·수정 시 submitUrls()로 변경된 URL을 api.indexnow.org에 통보
//  3) Bing/Yandex가 즉시 수집 → 구글에도 신호 전달
//
// ⚠️ 정직성: 색인 "요청"일 뿐, 노출/순위를 보장하지 않음. 실패해도 본 작업(발행)은 정상 진행.
// ============================================================================
import { SITE_URL } from './seo';

// IndexNow 인증 키 (공개되어도 안전 — 도메인 소유 증명용. 변경 시 키 파일도 함께 갱신)
export const INDEXNOW_KEY = '0dd7bc7dec894ec7b54791d9e99d7ba50c93d1932f6d4afe95f11d107171d69e';

const HOST = new URL(SITE_URL).host; // isoldc.kr
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// IndexNow 엔드포인트 (하나만 보내도 참여 검색엔진끼리 공유됨)
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * 변경된 URL 목록을 IndexNow에 제출.
 * @param paths  사이트 내 경로 배열 (예: ['/blog/my-post', '/sitemap.xml'])
 * @param waitUntil  Cloudflare ctx.waitUntil — 응답을 막지 않고 백그라운드 전송
 */
export async function submitUrls(
  paths: string[],
  waitUntil?: (p: Promise<any>) => void,
): Promise<void> {
  const urlList = [...new Set(paths)]
    .filter(Boolean)
    .map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`));
  if (urlList.length === 0) return;

  const body = JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList });

  const task = fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  })
    .then(async (r) => {
      // 200/202 = 접수. 실패해도 발행 자체는 영향 없음 (조용히 무시)
      if (!r.ok && r.status !== 202) {
        console.warn(`[IndexNow] ${r.status} ${await r.text().catch(() => '')}`);
      }
    })
    .catch((e) => console.warn('[IndexNow] error', e));

  // 백그라운드 전송 (응답 지연 방지). waitUntil 없으면 그냥 await
  if (waitUntil) waitUntil(task);
  else await task;
}

/** 글/케이스 발행 시 상세 URL + 관련 목록·사이트맵을 함께 통보 */
export function pingContent(
  kind: 'blog' | 'cases',
  identifier: string | number,
  waitUntil?: (p: Promise<any>) => void,
): Promise<void> {
  const detail = `/${kind}/${identifier}`;
  const listPath = `/${kind}`;
  const sitemap = '/sitemap-content.xml';
  return submitUrls([detail, listPath, sitemap], waitUntil);
}
