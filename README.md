# 이솔치과의원 (ISOL Dental Clinic) 홈페이지

## 프로젝트 개요
- **병원명**: 이솔치과의원 (대표원장 고경우)
- **목표**: 비디치과(bdbddc.com)급 하이엔드 인터랙티브 풀스택 치과 홈페이지. 환자 퍼널(검색→방문→예약→소개) 전환율을 높이는 SEO·AEO 최적화 사이트.
- **위치**: 경기도 남양주시 화도읍 마석중앙로 51 / ☎ 031-582-7528
- **컨셉**: 개원 15년차, 각 분야 전문의 상주 / "기분 좋게 진료를 마칠 때까지"

## 디자인 방향 (v4 딥 네이비 · 프리미엄 리뉴얼)
- **무드**: 동네 대표 치과의 무게감 — 절제된 프리미엄/신뢰 (파스텔/젤리 전면 폐기). bdbddc.com의 딥하고 정제된 톤 벤치마킹
- **컬러**: 딥 네이비 `#0E2A47`(베이스/다크 섹션) · 웜 아이보리 `#FAF8F4`(배경) · 절제된 골드 `#B08D4F`(포인트). 잉크 `#1C2530`, 라인 `#E7E2D8`
- **폰트**: 헤드라인 Noto Serif KR(명조) · 본문 Pretendard
- **인터랙션(최소화)**: 스크롤 페이드 리빌(IntersectionObserver), 헤더 스크롤 상태, 카운트업, 모바일 메뉴. ❌ 캔버스 파티클·커스텀 커서·마그네틱·키네틱 타이포·필텍스트·마퀴·그레인 전면 제거
- **성능/접근성**: GPU 가속(transform/opacity), `prefers-reduced-motion` 가드, 폰트 preconnect/`font-display:swap`

## 완료된 기능 (Currently Completed)
- ✅ 메인 페이지 — 히어로 + 퍼널 전구간(신뢰 스탯 / 핵심진료 / 철학 / 강점 / 전체진료 / 의료진 / 지역SEO / CTA)
- ✅ 진료 페이지 — 핵심 TOP3(임플란트·교정·소아치과) 상세(1,500자+ AEO 구성) + 그 외 진료 4종 + 진료별 FAQ
- ✅ 의료진 — 목록 + 개별 SSR 프로필 (진료↔의료진 양방향 인링크)
- ✅ 병원소개/미션, 오시는길(진료시간), 비용안내, 통합 FAQ, 예약 문의, 비포&애프터(의료법 게이팅 안내)
- ✅ 지역 SEO — 인근 8개 지역 × 핵심 3진료 조합 페이지 (`/area/[지역]-[진료]`)
- ✅ 예약 API (R2 저장 + Resend 이메일 알림, 바인딩 시 동작)
- ✅ SEO/AEO — Dentist/LocalBusiness/Person/MedicalProcedure/FAQPage/BreadcrumbList/City 스키마, sitemap.xml, robots.txt(AI 봇 허용), llms.txt
- ✅ 의료광고법 컴플라이언스 — 수치·최상급·효과단정 표현 배제, 푸터 고지문, 사실관계(전문의 상주) 보존

## 기능 진입 URI 요약
| 경로 | 설명 |
|------|------|
| `/` | 메인 |
| `/mission` | 병원소개·미션 |
| `/doctors` , `/doctors/:slug` | 의료진 목록 / 개별 프로필 |
| `/treatments` , `/treatments/:slug` | 진료 목록 / 상세 (implant·orthodontics·pediatric·prosthetics·periodontics·general) |
| `/directions` | 오시는길·진료시간 |
| `/faq` | 통합 FAQ |
| `/pricing` | 비용 안내 |
| `/reservation` | 예약 문의 (폼) |
| `/cases` | 비포&애프터 (의료법 안내) |
| `/area/:area-:treatment` | 지역SEO (예: `/area/maseok-implant`) |
| `POST /api/reservation` | 예약 접수 API (name, phone 필수) |
| `/sitemap.xml` `/robots.txt` `/llms.txt` | SEO 기술 파일 |

## 데이터 아키텍처
- **단일 소스**: `src/data/clinic.ts` (병원정보·의료진·진료·지역) — 모든 페이지/스키마/푸터가 참조
- **저장소(배포 시)**: Cloudflare R2 (예약 JSON), D1 (조회수 — 향후)
- **데이터 흐름**: 신청서 → §B 의료광고법 필터 → clinic.ts → SSR 렌더 → 정적 HTML

## 아직 구현되지 않은 기능 (확장 예정)
- 회원가입/Google OAuth + 마이페이지 (퍼널 만족·소개 단계)
- 비포&애프터 실제 업로드/슬라이더/로그인 게이팅 (현재는 의료법 안내 페이지)
- 원장 칼럼 SEO 에디터 + 백과사전 500+ 용어 + 공지사항
- 관리자 패널 (회원·예약·게시물·조회수)
- D1 마이그레이션 + R2/KV 바인딩 실연결

## 권장 다음 단계
1. Cloudflare Pages 배포 + R2/D1 생성 + 시크릿(RESEND_API_KEY 등) 설정
2. 실제 병원/의료진 사진·로고 교체 (현재 SVG 플레이스홀더)
3. 의료진 개별 이름·약력 확정(사실관계 — 신청서 추가 수집 후 반영)
4. 회원/관리자/칼럼/백과사전 단계적 추가

## 사용 가이드
- 방문자는 상단 GNB(병원소개·의료진·진료안내·비포애프터·FAQ·오시는길)와 우하단 플로팅 CTA(전화/지도/예약)로 이동
- 예약은 `/reservation` 폼 또는 전화로 진행

## 기술 스택 / 배포
- **프레임워크**: Hono v4 (TypeScript) + SSR
- **빌드**: Vite + @hono/vite-build (Cloudflare Pages)
- **프론트**: Vanilla JS + Pretendard + Noto Serif KR (CDN) + Font Awesome
- **플랫폼**: Cloudflare Pages/Workers
- **상태**: ✅ 로컬 동작 확인 (전 라우트 200 / 404 / 예약 API / 콘솔 에러 0) / ⏳ 프로덕션 미배포
- **Last Updated**: 2026-06-02 (v4 딥 네이비 프리미엄 리뉴얼 — 비주얼 레이어 전면 교체, 콘텐츠·데이터·SEO 보존)
