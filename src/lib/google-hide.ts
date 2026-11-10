/**
 * 구글 전용 검색 제외 (2026-11-10)
 *
 * 배경: 구글이 사이트 단위 판정으로 홈 한 장만 색인하고 있다(백과·지역 조합을 대량 공개한 뒤 전체 탈락).
 *       방문의 대부분은 네이버에서 오고, 그 대부분이 백과 페이지로 들어온다.
 * 조치: 대량 생성 구역(백과 전체·지역×진료 조합)의 200 HTML 응답에, 요청이 구글 크롤러일 때만
 *       `X-Robots-Tag: googlebot: noindex` 헤더를 붙인다. 구글이 보는 사이트를 핵심 페이지로 줄여 재평가를 받기 위함.
 * 불변: 네이버(Yeti)·Bing·일반 브라우저·AI 봇 응답은 헤더·본문이 한 글자도 달라지지 않는다.
 *       HTML 메타 태그·robots.txt·사이트맵·canonical·본문·스키마는 건드리지 않는다.
 *
 * 되돌리는 방법: isGoogleHiddenPath() 가 항상 false 를 돌려주게 하면 끝(미들웨어는 src/index.tsx 맨 위).
 */

export const GOOGLE_HIDE_HEADER = 'googlebot: noindex';

/** 구글 검색 크롤러 판정 — Googlebot(스마트폰·데스크톱·Image 등)과 URL 검사 도구.
 *  Google-Extended·GoogleOther·AdsBot·Mediapartners 는 UA 에 이 두 낱말이 없어 대상이 아니다. */
export function isGoogleCrawler(ua: string | null | undefined): boolean {
  return /googlebot|google-inspectiontool/i.test(ua || '');
}

/** 남기는 지역 페이지: 지역 목록, 주 지역 허브(마석 치과), 마석 × 6진료(페이지 고유 본문·사진) */
const AREA_KEEP = new Set([
  '/area',
  '/area/maseok',
  '/area/maseok-implant',
  '/area/maseok-orthodontics',
  '/area/maseok-pediatric',
  '/area/maseok-periodontics',
  '/area/maseok-prosthetics',
  '/area/maseok-general',
]);

/**
 * 구글에만 가릴 경로인가 — 디코딩된 경로 기준(한글 주소 포함).
 *  가린다: /glossary 와 /glossary/* (백과 목록·용어 전부), /area/<지역>-<진료> 조합(마석 제외)
 *  남긴다: 그 밖의 전부(홈·진료·의료진·비용·소개·오시는 길·예약·FAQ·치료 사례·원장 칼럼·공지·/area·/area/maseok*)
 */
export function isGoogleHiddenPath(pathname: string): boolean {
  let p = pathname || '/';
  try { p = decodeURIComponent(p); } catch {}
  p = p.replace(/\/+$/, '') || '/';
  if (p === '/glossary' || p.startsWith('/glossary/')) return true;
  if (p.startsWith('/area/')) return !AREA_KEEP.has(p);
  return false;
}
