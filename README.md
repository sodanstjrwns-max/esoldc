# 이솔치과의원 (ISOL Dental Clinic) 공식 홈페이지

> 남양주 마석, "기분 좋게 진료를 마칠 때까지" — 환자 퍼널 전환에 최적화된 하이엔드 스토리텔링 치과 홈페이지

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **병원명** | 이솔치과의원 (대표원장 고경우) |
| **개원** | 2017년 (새 공간 2026.06.22 진료 시작) |
| **주소** | 경기 남양주시 화도읍 마석로 25, 4층 |
| **대표전화** | 031-592-7258 |
| **이메일** | isoldent1@gmail.com |
| **목표** | 검색→방문→예약→소개 환자 퍼널 전환율을 높이는 SEO·AEO·지역SEO 최적화 사이트 |
| **기술스택** | Hono v4 (TypeScript SSR) + Vite 6 + Cloudflare Pages/Workers + D1 + R2 |

---

## 2. 공개 URL

- **프로덕션**: https://isoldent.pages.dev (Cloudflare Pages)
- **커스텀 도메인(설정 시)**: https://isoldc.kr
- **GitHub**: https://github.com/sodanstjrwns-max/esoldc
- **로컬 개발**: http://localhost:3000 (PM2 + wrangler pages dev)

---

## 3. 완료된 기능 (Currently Completed Features)

### 공개 페이지
| 경로 | 설명 |
|------|------|
| `/` | 홈 — 스토리텔링 히어로, 핵심진료, 병원 강점, 의료진, CTA, 공지 팝업 |
| `/mission` | 병원 소개 (미션/비전/장비/강점) |
| `/treatments` | 진료안내 허브 (핵심진료 + 전체진료 목록) |
| `/treatments/:slug` | 진료 상세 (MedicalProcedure/HowTo 구조화데이터) |
| `/doctors` | 의료진 목록 (전문의 5인) |
| `/doctors/:slug` | 의료진 상세 (Physician 구조화데이터) |
| `/directions` | 오시는 길 (지도/대중교통/주차) |
| `/reservation` | 온라인 예약 문의 (접근성 폼) |
| `/faq` | 자주 묻는 질문 (FAQPage 구조화데이터) |
| `/glossary` | 치과 용어사전 (검색 기능, DefinedTermSet) |
| `/area` | 지역별 진료 안내 허브 (CollectionPage + FAQ) |
| `/area/:area-:treatment` | 지역×진료 매트릭스 (12지역 × 3핵심진료 = 36개 조합, 예: `/area/dasan-implant`) |

### 콘텐츠/관리
- 관리자 로그인/콘텐츠 관리 (`/admin`) — 공지 팝업, 콘텐츠 편집
- 회원 로그인/회원가입

### SEO / AEO (AI 검색 최적화)
- **전역 구조화데이터** `@graph`: Organization / WebSite / Dentist (@id 연결)
- **페이지별 JSON-LD**: MedicalWebPage / MedicalProcedure / HowTo / FAQPage / Service / BreadcrumbList / ItemList / DefinedTermSet / CollectionPage / Physician
- **Speakable** 스펙 (음성 검색 대응)
- **사이트맵 인덱스**: 6개 서브 사이트맵 (`/sitemap.xml`)
- **robots.txt**: 24개 AI 크롤러 허용 (GPTBot, ClaudeBot, PerplexityBot, Google-Extended 등)
- **llms.txt / llms-full.txt**: LLM용 사이트 요약 (병원정보/진료/의료진/지역)
- **지역SEO**: 12개 인근지역 × 3개 핵심진료 = 37개 지역 랜딩 URL

### 성능 / 접근성 / 보안
- **CLS 방지**: 모든 이미지 `width`/`height` 명시 + 컨테이너 `aspect-ratio`
- **LCP 최적화**: 히어로 `fetchpriority=high` + `loading=eager`, `decoding=async`
- **정적자산 캐시**: `_headers` — `/static/*` 1년 불변 캐시 (immutable)
- **보안 헤더**: X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy
- **접근성(WCAG AA)**: 색 대비 0건 실패, 폼 label `for/id` 연결, aria-label, 시맨틱 HTML, 스킵링크

---

## 4. 데이터 아키텍처

| 데이터 | 저장 위치 |
|--------|-----------|
| 병원정보/진료/의료진/지역 | `src/data/clinic.ts` (정적, 신청서 원문 기반) |
| 지역 자동완성 | `src/data/regions.ts` |
| 공지 팝업 / 콘텐츠 / 회원 / 예약문의 | Cloudflare **D1** (`isoldent-production`) |
| 이미지 등 바이너리 | Cloudflare **R2** (`isoldent-bucket`) |

**핵심 데이터 모델**
- `CLINIC`: 병원 기본정보 (name/tel/email/address/geo/hours/equipment/points/mission/vision)
- `DOCTORS[5]`: 의료진 (전문의 자격 포함)
- `TREATMENTS` / `CORE_TREATMENTS`: 진료 항목
- `NEARBY_AREAS[12]`: 인근 지역 (slug/name/intro/access/landmarks/transit)

---

## 5. 운영 가이드 (병원 담당자용)

### 공지 팝업 변경
1. `/admin` 로그인 → 콘텐츠 관리
2. 공지 제목/내용 수정 → 저장 (즉시 반영)

### 진료시간/병원정보 변경
- 정적 데이터(`src/data/clinic.ts`) 수정 후 재배포 필요 → 개발 담당자 요청

### 의료진/진료항목 추가
- `src/data/clinic.ts`의 `DOCTORS` / `TREATMENTS` 배열 수정 후 재배포

### ⚠️ 의료광고법 준수 (필수)
- 최상급 표현 금지 (최고/유일/1위 등)
- 효과 보장/단정 표현 금지
- 사실에 근거하지 않은 내용 금지

---

## 6. 개발/배포 명령어

```bash
# 로컬 개발 (PM2)
npm run build
pm2 start ecosystem.config.cjs   # http://localhost:3000

# 프로덕션 배포 (Cloudflare Pages, BYOK)
npm run build
npx wrangler pages deploy dist --project-name isoldent

# D1 마이그레이션
npm run db:migrate:prod          # 프로덕션 DB 적용
npm run db:migrate:local         # 로컬 SQLite 적용
```

---

## 7. 향후 권장 개발 (Recommended Next Steps)

1. **페이지별 OG 이미지**: 현재 전 페이지 공통 `og.png` → 진료/지역별 맞춤 OG 이미지 제작 시 SNS 공유 클릭률 향상
2. **예약 알림 자동화**: 예약문의 접수 시 카카오 알림톡/이메일 자동 발송 연동
3. **리뷰/후기 수집**: (의료광고법 검토 후) 환자 후기 섹션
4. **Google Search Console / GA4 연동**: 검색 유입·전환 데이터 측정
5. **블로그/콘텐츠 정기 발행**: 진료 관련 칼럼으로 검색 노출 면적 확대

---

## 8. 배포 상태

- **플랫폼**: Cloudflare Pages
- **상태**: ✅ Active
- **기술스택**: Hono + TypeScript + Cloudflare D1/R2 + Vite
- **최종 업데이트**: 2026-06-21 (납품 버전 — SEO/AEO/지역SEO/성능/접근성 슈퍼 업그레이드)
