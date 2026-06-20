import { CLINIC, DOCTORS, TREATMENTS, CORE_TREATMENTS, NEARBY_AREAS, type Treatment, type NearbyArea } from '../data/clinic';

export const SITE_URL = 'https://isoldc.kr'; // 실 도메인 (가비아 구매, Cloudflare 연결)

export interface SeoMeta {
  title: string;
  description: string;
  path: string;          // canonical path, e.g. '/treatments/implant'
  ogImage?: string;
  type?: string;
  jsonLd?: object[];     // 추가 구조화 데이터
  noindex?: boolean;
  extraBody?: any;       // body 끝에 삽입할 추가 마크업 (예: 홈 히어로 팝업)
}

// ============================================================================
// 🔱 SCHEMA GRAPH — 전 페이지 공통 @graph (Organization·WebSite·Dentist를
//    @id로 상호 연결해 구글이 단일 지식 그래프로 인식하게 한다).
//    AEO 핵심: AI/검색엔진이 "이 병원 = 이 사이트 = 이 진료/의사"를 묶어 이해.
// ============================================================================
const ORG_ID = `${SITE_URL}/#organization`;
const CLINIC_ID = `${SITE_URL}/#clinic`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// 병원 SNS/채널 → sameAs (지식 패널 연결)
function clinicSameAs(): string[] {
  const s = CLINIC.sns;
  return [s.homepage, s.instagram, s.blog, s.youtube].filter(Boolean) as string[];
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: CLINIC.addressShort,
    addressLocality: '남양주시',
    addressRegion: '경기도',
    postalCode: '12173',
    addressCountry: 'KR',
  };
}

/**
 * 전 페이지 head에 1회만 주입하는 글로벌 지식 그래프.
 * 페이지별 추가 스키마(Treatment/Doctor/FAQ 등)는 별도 jsonLd로 덧붙인다.
 */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1) Organization (브랜드 루트)
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: CLINIC.name,
        alternateName: CLINIC.nameEn,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#logo`,
          url: `${SITE_URL}/static/img/apple-touch-icon.png`,
          contentUrl: `${SITE_URL}/static/img/apple-touch-icon.png`,
          width: 180,
          height: 180,
          caption: CLINIC.name,
        },
        image: { '@id': `${SITE_URL}/#logo` },
        telephone: CLINIC.tel,
        email: CLINIC.email,
        sameAs: clinicSameAs(),
      },
      // 2) WebSite (+ sitelinks searchbox 잠재력)
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: CLINIC.name,
        inLanguage: 'ko-KR',
        publisher: { '@id': ORG_ID },
      },
      // 3) Dentist / MedicalBusiness (실제 진료기관 엔티티)
      {
        '@type': ['Dentist', 'MedicalBusiness', 'LocalBusiness'],
        '@id': CLINIC_ID,
        name: CLINIC.name,
        alternateName: CLINIC.nameEn,
        url: SITE_URL,
        telephone: CLINIC.tel,
        email: CLINIC.email,
        slogan: CLINIC.slogan,
        description: `${CLINIC.subSlogan}. ${CLINIC.specialistNote}`,
        image: { '@id': `${SITE_URL}/#logo` },
        logo: { '@id': `${SITE_URL}/#logo` },
        parentOrganization: { '@id': ORG_ID },
        address: postalAddress(),
        geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
        hasMap: [
          `https://map.naver.com/v5/search/${encodeURIComponent(CLINIC.address)}`,
          `https://map.kakao.com/?q=${encodeURIComponent(CLINIC.address)}`,
        ],
        // 정직한 오픈예정 표시: 진료시간 미확정 → openingHours 대신 새 공간 오픈일만 명시
        specialOpeningHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          validFrom: CLINIC.reopenDate,
          description: CLINIC.hoursNote,
        },
        medicalSpecialty: 'Dentistry',
        knowsLanguage: 'ko-KR',
        priceRange: '₩₩',
        currenciesAccepted: 'KRW',
        paymentAccepted: '현금, 카드',
        areaServed: NEARBY_AREAS.map(a => ({ '@type': 'City', name: a.full })),
        availableService: CORE_TREATMENTS.map(t => ({
          '@type': 'MedicalProcedure',
          name: t.name,
          url: `${SITE_URL}/treatments/${t.slug}`,
        })),
        sameAs: clinicSameAs(),
        foundingDate: String(CLINIC.established),
      },
    ],
  };
}

// --- JSON-LD 빌더들 (개별) ---
export function dentistSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': CLINIC_ID,
    name: CLINIC.name,
    alternateName: CLINIC.nameEn,
    url: SITE_URL,
    telephone: CLINIC.tel,
    email: CLINIC.email,
    slogan: CLINIC.slogan,
    image: `${SITE_URL}/static/img/og.png`,
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    medicalSpecialty: 'Dentistry',
    priceRange: '₩₩',
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'MedicalBusiness', 'LocalBusiness'],
    '@id': CLINIC_ID,
    name: CLINIC.name,
    alternateName: CLINIC.nameEn,
    image: `${SITE_URL}/static/img/og.png`,
    logo: { '@id': `${SITE_URL}/#logo` },
    telephone: CLINIC.tel,
    email: CLINIC.email,
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    hasMap: [
      `https://map.naver.com/v5/search/${encodeURIComponent(CLINIC.address)}`,
      `https://map.kakao.com/?q=${encodeURIComponent(CLINIC.address)}`,
    ],
    specialOpeningHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      validFrom: CLINIC.reopenDate,
      description: CLINIC.hoursNote,
    },
    medicalSpecialty: 'Dentistry',
    knowsLanguage: 'ko-KR',
    priceRange: '₩₩',
    currenciesAccepted: 'KRW',
    paymentAccepted: '현금, 카드',
    areaServed: NEARBY_AREAS.map(a => ({ '@type': 'City', name: a.full })),
    sameAs: clinicSameAs(),
    foundingDate: String(CLINIC.established),
    url: SITE_URL,
  };
}

/**
 * 🗺️ 지역 페이지 전용 강력 스키마.
 * Dentist(@id 글로벌 연결) + 해당 지역 areaServed + 제공 서비스(Service) +
 * speakable 영역으로, "OO지역 + 진료" 로컬 검색에 강하게 대응.
 */
export function areaServiceSchema(area: NearbyArea, t: Treatment) {
  const path = `/area/${area.slug}-${t.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${path}#service`,
    name: `${area.name} ${t.name}`,
    serviceType: t.name,
    url: `${SITE_URL}${path}`,
    description: `${area.full} 인근에서 이용하실 수 있는 ${t.name} 진료 안내`,
    provider: { '@id': CLINIC_ID },
    areaServed: { '@type': 'City', name: area.full, address: { '@type': 'PostalAddress', addressLocality: area.full, addressRegion: '경기도', addressCountry: 'KR' } },
    availableChannel: {
      '@type': 'ServiceChannel',
      servicePhone: { '@type': 'ContactPoint', telephone: CLINIC.tel, contactType: '진료 예약/문의', areaServed: 'KR', availableLanguage: 'Korean' },
      serviceUrl: `${SITE_URL}${path}`,
    },
  };
}

/**
 * 지역 페이지용 MedicalWebPage(speakable) — 위치/접근 핵심을 음성·답변 인용 타깃으로.
 */
export function areaWebPageSchema(area: NearbyArea, t: Treatment) {
  const path = `/area/${area.slug}-${t.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${area.name} ${t.name} | ${CLINIC.name}`,
    description: `${area.full} ${t.name} 치과 안내. ${area.access}`,
    url: `${SITE_URL}${path}`,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': CLINIC_ID },
    publisher: { '@id': ORG_ID },
    lastReviewed: new Date().toISOString().split('T')[0],
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.aeo-summary'] },
  };
}

export function personSchema(d: typeof DOCTORS[number]) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Person', 'Physician'],
    '@id': `${SITE_URL}/doctors/${d.slug}#person`,
    name: d.name,
    jobTitle: d.role,
    url: `${SITE_URL}/doctors/${d.slug}`,
    image: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/doctors/${d.slug}#photo`,
      url: `${SITE_URL}${d.photo}`,
      contentUrl: `${SITE_URL}${d.photo}`,
      caption: `${d.name} ${d.role}`,
      representativeOfPage: true,
    },
    worksFor: { '@id': CLINIC_ID },
    affiliation: { '@id': CLINIC_ID },
    knowsAbout: d.specialty,
    description: d.bio,
    // 자격·경력 (사실관계만, 신청서 원문)
    hasCredential: d.credentials.map(c => ({
      '@type': 'EducationalOccupationalCredential',
      name: c,
    })),
    medicalSpecialty: 'Dentistry',
  };
}

export function medicalProcedureSchema(t: Treatment) {
  // intro에서 질문부 제거한 핵심 설명 추출
  const qIdx = t.intro.indexOf('?');
  const performed = qIdx > -1 ? t.intro.slice(qIdx + 1).trim() : t.intro;
  // 본문 섹션들을 진료 단계 신호로 활용 (howPerformed 보강)
  const stepSummary = t.sections.map(s => s.h2.replace(/[?]/g, '')).join(' · ');
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${SITE_URL}/treatments/${t.slug}#procedure`,
    name: t.name,
    description: t.metaDesc,
    url: `${SITE_URL}/treatments/${t.slug}`,
    image: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/treatments/${t.slug}#image`,
      url: `${SITE_URL}/static/img/og.png`,
      contentUrl: `${SITE_URL}/static/img/og.png`,
      caption: `${CLINIC.name} ${t.name} 진료 안내`,
    },
    procedureType: 'https://schema.org/TherapeuticProcedure',
    relevantSpecialty: { '@type': 'MedicalSpecialty', name: 'Dentistry' },
    bodyLocation: '구강',
    howPerformed: `${performed} 주요 과정: ${stepSummary}.`,
    preparation: '정밀 진단(파노라마·CT·구강스캐너 등)과 상담을 통해 환자분의 구강 상태를 확인한 뒤 진료 계획을 수립합니다.',
    followup: '진료 이후 정기적인 점검과 관리를 통해 경과를 확인하며, 개인의 구강 상태에 따라 결과에는 차이가 있을 수 있습니다.',
    status: 'https://schema.org/ActiveActionStatus',
    provider: { '@id': CLINIC_ID },
  };
}

/**
 * HowTo 스키마 — 진료 과정을 단계별(HowToStep)로 구조화.
 * 본문 sections의 h2를 진료 단계로 활용해 검색엔진/AI에 "진료 흐름"을 명확히 전달.
 * ⚠️ 의료광고법: 효과 보장·최상급 없이 "과정 안내"로만 기술.
 */
export function howToSchema(t: Treatment) {
  const steps = t.sections.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.h2.replace(/[?]/g, ''),
    text: s.body.length > 320 ? s.body.slice(0, 317) + '…' : s.body,
    url: `${SITE_URL}/treatments/${t.slug}#step-${i + 1}`,
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}/treatments/${t.slug}#howto`,
    name: `${t.name} 진료는 어떻게 진행되나요?`,
    description: `${CLINIC.name}의 ${t.name} 진료 과정 안내. 진료 방법과 결과는 개인의 구강 상태에 따라 차이가 있을 수 있으며, 정확한 내용은 상담을 통해 안내해 드립니다.`,
    totalTime: 'P1D',
    step: steps,
    about: { '@id': `${SITE_URL}/treatments/${t.slug}#procedure` },
  };
}

export function faqSchema(faqs: { q: string; a: string }[], path?: string) {
  const base = path ? `${SITE_URL}${path}` : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(base ? { '@id': `${base}#faq`, url: base, inLanguage: 'ko-KR' } : {}),
    mainEntity: faqs.map((f, i) => ({
      '@type': 'Question',
      ...(base ? { '@id': `${base}#q-${i + 1}` } : {}),
      name: f.q,
      ...(base ? { url: `${base}#q-${i + 1}` } : {}),
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
        ...(base ? { url: `${base}#q-${i + 1}` } : {}),
      },
    })),
  };
}

/**
 * MedicalWebPage + speakable — 진료/용어 페이지를 AI 음성/답변에 인용되기 좋게.
 * speakable: 음성 비서가 읽어줄 핵심 요약 영역(.aeo-summary, h1) 지정.
 */
export function medicalWebPageSchema(opts: { name: string; description: string; path: string; about?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': WEBSITE_ID },
    about: opts.about ? { '@type': 'MedicalEntity', name: opts.about } : { '@id': CLINIC_ID },
    publisher: { '@id': ORG_ID },
    lastReviewed: new Date().toISOString().split('T')[0],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.aeo-summary'],
    },
  };
}

/**
 * ItemList — 목록 페이지(진료/의료진)에서 "이 페이지엔 N개 항목 목록이 있다"를 명시.
 * 구글 캐러셀·리치결과 후보.
 */
export function itemListSchema(opts: { name: string; items: { name: string; path: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: `${SITE_URL}${it.path}`,
    })),
  };
}

/**
 * DefinedTermSet — 용어사전 전체를 하나의 "용어집"으로 명시.
 * AEO: AI가 "이 사이트엔 N개 치과 용어 사전이 있다"를 이해.
 */
export function definedTermSetSchema(opts: { count: number; longCount: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/glossary#termset`,
    name: `${CLINIC.name} 치과 백과사전`,
    description: `치과 진료에서 자주 쓰이는 용어 ${opts.count}개를 쉬운 말로 풀어 설명하는 용어집입니다. 이 중 ${opts.longCount}개 핵심 용어는 심층 설명을 제공합니다.`,
    url: `${SITE_URL}/glossary`,
    inLanguage: 'ko-KR',
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function articleSchema(opts: {
  title: string; desc: string; path: string; author: string;
  published: string; modified?: string; image?: string;
  type?: 'BlogPosting' | 'MedicalWebPage' | 'Article';
}) {
  const url = `${SITE_URL}${opts.path}`;
  const imgUrl = opts.image || `${SITE_URL}/static/img/og.png`;
  return {
    '@context': 'https://schema.org',
    '@type': opts.type || 'BlogPosting',
    headline: opts.title.slice(0, 110),
    name: opts.title,
    description: opts.desc,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: {
      '@type': 'ImageObject',
      url: imgUrl,
      contentUrl: imgUrl,
    },
    inLanguage: 'ko-KR',
    isPartOf: { '@id': WEBSITE_ID },
    datePublished: opts.published,
    dateModified: opts.modified || opts.published,
    author: { '@type': 'Person', name: opts.author },
    publisher: { '@id': ORG_ID },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.aeo-summary'] },
  };
}
