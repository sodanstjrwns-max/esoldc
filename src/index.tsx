import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { CLINIC, TREATMENTS, DOCTORS, NEARBY_AREAS, CORE_TREATMENTS, getTreatment, getDoctor } from './data/clinic';
import { Layout } from './lib/layout';
import {
  SITE_URL, personSchema, medicalProcedureSchema, medicalWebPageSchema,
  faqSchema, breadcrumbSchema, areaServiceSchema, areaWebPageSchema,
  itemListSchema, definedTermSetSchema, howToSchema, localBusinessSchema,
  articleSchema,
} from './lib/seo';
import { HomePage } from './pages/home';
import { fetchActivePopup, renderPopup } from './lib/popup';
import { TreatmentsListPage, TreatmentDetailPage } from './pages/treatments';
import { DoctorsListPage, DoctorDetailPage } from './pages/doctors';
import {
  MissionPage, DirectionsPage, FaqPage, PricingPage,
  ReservationPage, AreaPage, AreaHubPage, areaFaqs, NotFoundPage,
} from './pages/misc';
import { SignupPage, LoginPage } from './pages/auth';
import {
  CasesListPage, CaseDetailPage, BlogListPage, BlogDetailPage,
  NoticesListPage, NoticeDetailPage,
} from './pages/content';
import { GlossaryListPage, GlossaryDetailPage } from './pages/glossary';
import { SeoHealthPage } from './pages/seo-health';
import { GLOSSARY, GLOSSARY_SORTED } from './data/glossary';
import { authApi } from './routes/auth';
import { admin } from './routes/admin';
import { adminContent } from './routes/admin-content';
import { INDEXNOW_KEY } from './lib/indexnow';
import { SERVICE_WORKER_JS } from './lib/sw';
import { getSession } from './lib/auth';
import { searchRegions } from './data/regions';
import { setGaId } from './lib/analytics';

type Bindings = {
  R2?: R2Bucket;
  DB?: D1Database;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  GA_MEASUREMENT_ID?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 전역 보안 헤더 (동적 SSR 페이지 포함 모든 응답에 적용)
app.use('*', secureHeaders({
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'SAMEORIGIN',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: { geolocation: [], microphone: [], camera: [] },
  // CDN(jsdelivr/fonts) 및 인라인 스크립트/스타일 사용 → CSP는 과도한 차단 방지 위해 비활성
  contentSecurityPolicy: undefined,
  crossOriginEmbedderPolicy: false,
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
}));

app.use('/api/*', cors());

// 요청마다 GA 측정 ID 주입 (환경변수 GA_MEASUREMENT_ID, 없으면 GA 비활성)
app.use('*', async (c, next) => {
  setGaId(c.env.GA_MEASUREMENT_ID);
  await next();
});

// 서브 라우터 마운트
app.route('/api/auth', authApi);
app.route('/admin', admin);
app.route('/admin', adminContent);

// ============================================================================
// 메인
// ============================================================================
app.get('/', async (c) => {
  const popup = renderPopup(await fetchActivePopup(c.env.DB));
  return c.html(Layout({
    title: `${CLINIC.name} | 남양주 마석 임플란트·교정·소아치과`,
    description: `남양주 마석 ${CLINIC.name}. 각 분야 전문의 상주(임플란트 제외), 소아부터 노인까지 3대가 함께하는 가족 치과. 임플란트·치아교정·소아치과 전 연령 통합 진료. 기분 좋게 진료를 마칠 때까지.`,
    path: '/',
    jsonLd: [
      // 홈 WebPage(speakable) — 메인 엔티티를 병원으로 연결, AEO 인용 타깃
      {
        '@context': 'https://schema.org',
        '@type': ['WebPage', 'MedicalWebPage'],
        '@id': `${SITE_URL}/#webpage`,
        name: `${CLINIC.name} | 남양주 마석 임플란트·교정·소아치과`,
        url: SITE_URL,
        description: `남양주 마석 ${CLINIC.name}. 각 분야 전문의 상주(임플란트 제외), 소아부터 노인까지 3대가 함께하는 가족 치과.`,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#clinic` },
        primaryImageOfPage: { '@id': `${SITE_URL}/#logo` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.aeo-summary'] },
      },
      itemListSchema({ name: `${CLINIC.name} 핵심 진료`, items: CORE_TREATMENTS.map(t => ({ name: t.name, path: `/treatments/${t.slug}` })) }),
    ],
    extraBody: popup,
  }, HomePage()));
});

// ============================================================================
// 병원소개 / 미션
// ============================================================================
app.get('/mission', (c) => {
  return c.html(Layout({
    title: `병원소개 | ${CLINIC.name} - 남양주 마석 치과`,
    description: `${CLINIC.name}의 이야기. 남양주 마석에서 10년째 한자리, "기분 좋게 진료를 마칠 때까지"라는 철학으로 지역 주민과 함께해 온 동네 치과입니다.`,
    path: '/mission',
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '병원소개', path: '/mission' }])],
  }, MissionPage()));
});

// ============================================================================
// 의료진
// ============================================================================
app.get('/doctors', (c) => {
  return c.html(Layout({
    title: `의료진 소개 | ${CLINIC.name} - 각 분야 전문의 상주`,
    description: `${CLINIC.name} 의료진. 임플란트·교정·소아치과 등 각 분야 전문의가 상주하여 전 연령의 다양한 진료를 책임집니다.`,
    path: '/doctors',
    jsonLd: [
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '의료진', path: '/doctors' }]),
      itemListSchema({ name: `${CLINIC.name} 의료진`, items: DOCTORS.map(d => ({ name: `${d.name} ${d.role}`, path: `/doctors/${d.slug}` })) }),
      ...DOCTORS.map(personSchema),
    ],
  }, DoctorsListPage()));
});

app.get('/doctors/:slug', (c) => {
  const d = getDoctor(c.req.param('slug'));
  if (!d) return c.notFound();
  return c.html(Layout({
    title: `${d.name} ${d.role} | ${d.specialty} - ${CLINIC.name}`,
    description: `${CLINIC.name} ${d.role} ${d.name}. ${d.specialty} 진료. ${d.bio.slice(0, 90)}`,
    path: `/doctors/${d.slug}`,
    type: 'profile',
    jsonLd: [
      personSchema(d),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '의료진', path: '/doctors' }, { name: d.name, path: `/doctors/${d.slug}` }]),
    ],
  }, DoctorDetailPage(d)));
});

// ============================================================================
// 진료
// ============================================================================
app.get('/treatments', (c) => {
  return c.html(Layout({
    title: `진료안내 | ${CLINIC.name} - 남양주 마석 치과`,
    description: `${CLINIC.name}의 진료안내. 임플란트·치아교정·소아치과를 중심으로 보철·잇몸치료·일반진료까지 전 연령 통합 진료를 제공합니다.`,
    path: '/treatments',
    jsonLd: [
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }]),
      itemListSchema({ name: `${CLINIC.name} 진료안내`, items: TREATMENTS.map(t => ({ name: t.name, path: `/treatments/${t.slug}` })) }),
    ],
  }, TreatmentsListPage()));
});

app.get('/treatments/:slug', (c) => {
  const t = getTreatment(c.req.param('slug'));
  if (!t) return c.notFound();
  // 양방향 인링크: 이 진료(slug)를 rel에 포함하는 용어 → 심층(longDef) 우선, 최대 12개
  const relTerms = GLOSSARY_SORTED
    .filter(g => g.rel.includes(t.slug))
    .sort((a, b) => (b.longDef ? 1 : 0) - (a.longDef ? 1 : 0))
    .slice(0, 12)
    .map(g => ({ term: g.term }));
  return c.html(Layout({
    title: t.metaTitle,
    description: t.metaDesc,
    path: `/treatments/${t.slug}`,
    type: 'article',
    jsonLd: [
      medicalProcedureSchema(t),
      howToSchema(t),
      medicalWebPageSchema({ name: t.metaTitle, description: t.metaDesc, path: `/treatments/${t.slug}`, about: t.name }),
      faqSchema(t.faqs, `/treatments/${t.slug}`),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }, { name: t.name, path: `/treatments/${t.slug}` }]),
    ],
  }, TreatmentDetailPage(t, relTerms)));
});

// ============================================================================
// 안내 페이지들
// ============================================================================
app.get('/directions', (c) => {
  return c.html(Layout({
    title: `오시는 길 | ${CLINIC.name} - ${CLINIC.addressShort}`,
    description: `${CLINIC.name} 오시는 길. ${CLINIC.address}. 대표전화 ${CLINIC.tel}. 경춘선 마석역 인근. 주차 및 대중교통 안내.`,
    path: '/directions',
    jsonLd: [
      localBusinessSchema(),
      medicalWebPageSchema({
        name: `${CLINIC.name} 오시는 길`,
        description: `${CLINIC.name}은 ${CLINIC.address}에 위치합니다. 경춘선 마석역 인근으로, 대중교통과 자가용 모두 방문하실 수 있습니다. 대표전화 ${CLINIC.tel}.`,
        path: '/directions',
        about: `${CLINIC.name} 위치·교통`,
      }),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '오시는길', path: '/directions' }]),
    ],
  }, DirectionsPage()));
});

app.get('/faq', (c) => {
  const allFaqs = TREATMENTS.flatMap(t => t.faqs);
  return c.html(Layout({
    title: `자주 묻는 질문 ${allFaqs.length}선 | ${CLINIC.name}`,
    description: `${CLINIC.name} 자주 묻는 질문 ${allFaqs.length}개. 임플란트·교정·소아치과·보철·잇몸치료 등 진료별로 환자분들이 자주 궁금해하시는 내용을 모았습니다.`,
    path: '/faq',
    jsonLd: [
      faqSchema(allFaqs, '/faq'),
      medicalWebPageSchema({
        name: `${CLINIC.name} 자주 묻는 질문`,
        description: `진료별 자주 묻는 질문 ${allFaqs.length}개 모음. 정확한 내용은 상담을 통해 안내해 드립니다.`,
        path: '/faq',
        about: '치과 진료 자주 묻는 질문',
      }),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '자주묻는질문', path: '/faq' }]),
    ],
  }, FaqPage()));
});

app.get('/pricing', (c) => {
  return c.html(Layout({
    title: `비용 안내 | ${CLINIC.name}`,
    description: `${CLINIC.name} 진료 비용 안내. 비급여 진료비는 병원 게시 기준에 따르며, 정확한 비용은 내원 상담 시 안내해 드립니다.`,
    path: '/pricing',
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비용안내', path: '/pricing' }])],
  }, PricingPage()));
});

app.get('/reservation', (c) => {
  return c.html(Layout({
    title: `예약 문의 | ${CLINIC.name}`,
    description: `${CLINIC.name} 진료 예약 문의. 전화 ${CLINIC.tel} 또는 온라인으로 편하게 예약 상담을 신청하세요.`,
    path: '/reservation',
    jsonLd: [
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '예약문의', path: '/reservation' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `${CLINIC.name} 예약 문의 진행 절차`,
        description: '온라인 또는 전화로 예약 문의 후 진행되는 과정 안내',
        step: [
          { '@type': 'HowToStep', position: 1, name: '문의 남기기', text: '온라인 폼에 성함·연락처와 궁금한 점을 남기거나 전화로 문의합니다.' },
          { '@type': 'HowToStep', position: 2, name: '확인 연락', text: '접수 내용을 확인한 뒤 진료시간 내에 직접 연락드려 일정을 조율합니다.' },
          { '@type': 'HowToStep', position: 3, name: '방문 상담', text: '예약된 시간에 내원하시면 구강 상태를 살펴보고 충분히 설명드립니다.' },
        ],
      },
    ],
  }, ReservationPage()));
});

app.get('/cases', async (c) => {
  const s = await getSession(c);
  let cases: any[] = [];
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT id, title, age_group, gender, category, region, doctor_slug, duration, img_pano_before, img_oral_before, views FROM cases WHERE published = 1 ORDER BY id DESC LIMIT 200').all();
      cases = results as any[];
    } catch {}
  }
  return c.html(Layout({
    title: `비포 & 애프터 치료사례 | ${CLINIC.name}`,
    description: `${CLINIC.name} 실제 치료 사례 모음. 파노라마·구내포토 전후 비교. 치료 후 사진은 회원 로그인 시 열람 가능합니다.`,
    path: '/cases',
    noindex: cases.length === 0,
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비포&애프터', path: '/cases' }])],
  }, CasesListPage(cases, !!s)));
});

app.get('/cases/:id', async (c) => {
  const db = c.env.DB;
  if (!db) return c.notFound();
  const id = c.req.param('id');
  if (!/^\d+$/.test(id)) return c.notFound();
  const x = await db.prepare('SELECT * FROM cases WHERE id = ? AND published = 1').bind(id).first<any>();
  if (!x) return c.notFound();
  await db.prepare('UPDATE cases SET views = views + 1 WHERE id = ?').bind(id).run();
  const s = await getSession(c);
  const { results: related } = await db.prepare(
    'SELECT id, title, category, img_pano_before, img_oral_before FROM cases WHERE published = 1 AND id != ? AND (category = ? OR doctor_slug = ?) ORDER BY id DESC LIMIT 4')
    .bind(id, x.category, x.doctor_slug).all();
  return c.html(Layout({
    title: `${x.title} | 치료사례 - ${CLINIC.name}`,
    description: `${x.age_group} ${x.gender} 환자 ${x.title}. ${(x.description || '').slice(0, 100)}`,
    path: `/cases/${id}`,
    type: 'article',
    ogImage: x.img_pano_before ? `${SITE_URL}/api/img/${x.img_pano_before}` : (x.img_oral_before ? `${SITE_URL}/api/img/${x.img_oral_before}` : undefined),
    jsonLd: [
      articleSchema({
        type: 'MedicalWebPage',
        title: x.title,
        desc: `${x.age_group} ${x.gender} 환자 ${x.title}. ${(x.description || '').slice(0, 120)}`.trim(),
        path: `/cases/${id}`,
        author: DOCTORS.find(d => d.slug === x.doctor_slug)?.name || CLINIC.name,
        published: x.created_at,
        modified: x.updated_at || x.created_at,
        image: x.img_pano_before ? `${SITE_URL}/api/img/${x.img_pano_before}` : (x.img_oral_before ? `${SITE_URL}/api/img/${x.img_oral_before}` : undefined),
      }),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비포&애프터', path: '/cases' }, { name: x.title, path: `/cases/${id}` }]),
    ],
  }, CaseDetailPage(x, !!s, related as any[])));
});

// ============================================================================
// 블로그
// ============================================================================
app.get('/blog', async (c) => {
  let posts: any[] = [];
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT slug, title, excerpt, thumbnail, author_slug, views, created_at FROM posts WHERE published = 1 ORDER BY id DESC LIMIT 200').all();
      posts = results as any[];
    } catch {}
  }
  return c.html(Layout({
    title: `치과 건강 블로그 | ${CLINIC.name}`,
    description: `${CLINIC.name} 원장들이 직접 쓰는 구강 건강 정보와 병원 이야기. 임플란트·교정·소아치과 상식.`,
    path: '/blog',
    // 글이 0개면 색인 제외 (준비 중 빈 페이지가 thin-content로 평가받지 않도록)
    noindex: posts.length === 0,
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '블로그', path: '/blog' }])],
  }, BlogListPage(posts)));
});

app.get('/blog/:slug', async (c) => {
  const db = c.env.DB;
  if (!db) return c.notFound();
  const slug = c.req.param('slug');
  const p = await db.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').bind(slug).first<any>();
  if (!p) return c.notFound();
  await db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').bind(p.id).run();
  const { results: related } = await db.prepare(
    'SELECT slug, title FROM posts WHERE published = 1 AND id != ? ORDER BY id DESC LIMIT 5').bind(p.id).all();
  return c.html(Layout({
    title: `${p.title} | ${CLINIC.name} 블로그`,
    description: p.excerpt || `${CLINIC.name} 블로그 - ${p.title}`,
    path: `/blog/${slug}`,
    type: 'article',
    ogImage: p.thumbnail ? `${SITE_URL}/api/img/${p.thumbnail}` : undefined,
    jsonLd: [
      articleSchema({
        type: 'BlogPosting',
        title: p.title,
        desc: p.excerpt || `${CLINIC.name} 블로그 - ${p.title}`,
        path: `/blog/${slug}`,
        author: DOCTORS.find(d => d.slug === p.author_slug)?.name || CLINIC.name,
        published: p.created_at,
        modified: p.updated_at || p.created_at,
        image: p.thumbnail ? `${SITE_URL}/api/img/${p.thumbnail}` : undefined,
      }),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '블로그', path: '/blog' }, { name: p.title, path: `/blog/${slug}` }]),
    ],
  }, BlogDetailPage(p, related as any[])));
});

// ============================================================================
// 공지사항
// ============================================================================
app.get('/notices', async (c) => {
  let notices: any[] = [];
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT id, title, image, is_pinned, views, created_at FROM notices WHERE published = 1 ORDER BY is_pinned DESC, id DESC LIMIT 200').all();
      notices = results as any[];
    } catch {}
  }
  return c.html(Layout({
    title: `공지사항 | ${CLINIC.name}`,
    description: `${CLINIC.name} 공지사항. 진료 일정 변경, 병원 소식을 안내해 드립니다.`,
    path: '/notices',
    noindex: notices.length === 0,
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notices' }])],
  }, NoticesListPage(notices)));
});

app.get('/notices/:id', async (c) => {
  const db = c.env.DB;
  if (!db) return c.notFound();
  const id = c.req.param('id');
  if (!/^\d+$/.test(id)) return c.notFound();
  const n = await db.prepare('SELECT * FROM notices WHERE id = ? AND published = 1').bind(id).first<any>();
  if (!n) return c.notFound();
  await db.prepare('UPDATE notices SET views = views + 1 WHERE id = ?').bind(id).run();
  return c.html(Layout({
    title: `${n.title} | 공지사항 - ${CLINIC.name}`,
    description: `${CLINIC.name} 공지 - ${n.title}`,
    path: `/notices/${id}`,
    ogImage: n.image ? `${SITE_URL}/api/img/${n.image}` : undefined,
    jsonLd: [
      articleSchema({
        type: 'Article',
        title: n.title,
        desc: `${CLINIC.name} 공지 - ${n.title}`,
        path: `/notices/${id}`,
        author: CLINIC.name,
        published: n.created_at,
        modified: n.updated_at || n.created_at,
        image: n.image ? `${SITE_URL}/api/img/${n.image}` : undefined,
      }),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notices' }, { name: n.title, path: `/notices/${id}` }]),
    ],
  }, NoticeDetailPage(n)));
});

// ============================================================================
// 치과 백과사전
// ============================================================================
app.get('/glossary', (c) => {
  return c.html(Layout({
    title: `치과 백과사전 — 치과 용어 ${GLOSSARY.length}선 정리 | ${CLINIC.name}`,
    description: `임플란트·교정·소아치과 등 치과 용어 ${GLOSSARY.length}개를 알기 쉽게 정리한 ${CLINIC.name} 치과 백과사전. 검색·카테고리·초성으로 찾아보세요.`,
    path: '/glossary',
    jsonLd: [
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '치과 백과사전', path: '/glossary' }]),
      definedTermSetSchema({ count: GLOSSARY.length, longCount: GLOSSARY_SORTED.filter(t => t.longDef).length }),
    ],
  }, GlossaryListPage()));
});

// SEO Health 대시보드 — 내부링크 커버리지 시각화
app.get('/seo-health', (c) => {
  return c.html(Layout({
    title: `SEO Health · 내부링크 커버리지 | ${CLINIC.name}`,
    description: `${CLINIC.name} 사이트의 내부 링크 그물(link mesh) 분석 대시보드. 페이지별 인바운드/아웃바운드 링크와 커버리지를 데이터 기반으로 시각화합니다.`,
    path: '/seo-health',
    noindex: true,
    jsonLd: [
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: 'SEO Health', path: '/seo-health' }]),
    ],
  }, SeoHealthPage()));
});

app.get('/glossary/:term', (c) => {
  let raw = c.req.param('term');
  try { raw = decodeURIComponent(raw); } catch {}
  const term = GLOSSARY.find(t => t.term === raw);
  if (!term) return c.notFound();
  // 관련 용어: 공유 rel 우선 → 같은 카테고리 보충, 최대 12개
  const byRel = GLOSSARY_SORTED.filter(t => t.term !== term.term && t.rel.some(r => term.rel.includes(r)));
  const byCat = GLOSSARY_SORTED.filter(t => t.term !== term.term && t.cat === term.cat && !byRel.includes(t));
  const related = [...byRel, ...byCat].slice(0, 12);
  // 관련 진료 인링크
  const relTreatments = term.rel
    .map(slug => TREATMENTS.find(t => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => !!t)
    .map(t => ({ slug: t.slug, name: t.name, short: t.short }));
  const fullDesc = term.longDef || term.def;
  return c.html(Layout({
    title: `${term.term} 뜻·설명 | 치과 백과사전 - ${CLINIC.name}`,
    description: `${term.term}이란? ${term.def.slice(0, 110)}`,
    path: `/glossary/${encodeURIComponent(term.term)}`,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'DefinedTerm',
        '@id': `${SITE_URL}/glossary/${encodeURIComponent(term.term)}#term`,
        name: term.term, description: fullDesc,
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: `${CLINIC.name} 치과 백과사전`, url: `${SITE_URL}/glossary` },
      },
      medicalWebPageSchema({ name: `${term.term} 뜻·설명`, description: term.def, path: `/glossary/${encodeURIComponent(term.term)}`, about: term.term }),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '치과 백과사전', path: '/glossary' }, { name: term.term, path: `/glossary/${encodeURIComponent(term.term)}` }]),
    ],
  }, GlossaryDetailPage(term, related, relTreatments)));
});

// ============================================================================
// 회원가입 / 로그인
// ============================================================================
app.get('/signup', async (c) => {
  const s = await getSession(c);
  if (s) return c.redirect('/');
  return c.html(Layout({
    title: `회원가입 | ${CLINIC.name}`,
    description: `${CLINIC.name} 회원가입. 가입 시 치료 사례(비포&애프터)를 모두 열람하실 수 있습니다.`,
    path: '/signup',
    noindex: true,
  }, SignupPage()));
});

app.get('/login', async (c) => {
  const s = await getSession(c);
  if (s) return c.redirect('/');
  const next = c.req.query('next') || '';
  const safeNext = /^\/[a-zA-Z0-9\/_-]*$/.test(next) ? next : '';
  return c.html(Layout({
    title: `로그인 | ${CLINIC.name}`,
    description: `${CLINIC.name} 회원 로그인`,
    path: '/login',
    noindex: true,
  }, LoginPage(safeNext)));
});

app.get('/logout', async (c) => {
  const { destroySession } = await import('./lib/auth');
  await destroySession(c);
  return c.redirect('/');
});

// ============================================================================
// 공개 API — 이미지 서빙(R2) / 지역 자동완성
// ============================================================================
app.get('/api/img/*', async (c) => {
  const r2 = c.env.R2;
  if (!r2) return c.notFound();
  const key = c.req.path.replace(/^\/api\/img\//, '');
  if (!key.startsWith('uploads/')) return c.notFound();
  const obj = await r2.get(key);
  if (!obj) return c.notFound();
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
});

app.get('/api/regions', (c) => {
  const q = c.req.query('q') || '';
  return c.json({ results: searchRegions(q, 8) });
});

// ============================================================================
// 지역 SEO: /area (허브) + /area/[지역]-[진료] (상세)
// ============================================================================
// 지역 허브 — 인근 지역 × 핵심진료 매트릭스 (내부링크 집약)
app.get('/area', (c) => {
  const areaNames = NEARBY_AREAS.map(a => a.name).join('·');
  // 허브 공통 FAQ (AEO — 지역 전반 질문에 답변형 콘텐츠)
  const hubFaqs = [
    {
      q: `${CLINIC.name}은 어느 지역에서 다니기 좋나요?`,
      a: `${CLINIC.name}은 ${CLINIC.address}에 위치하여 ${areaNames} 등 남양주 화도읍 주변 지역에서 방문하시기 좋습니다. 지역별 자세한 오시는 길과 진료 안내는 각 지역 페이지에서 확인하실 수 있습니다.`,
    },
    {
      q: `다른 시·군에서도 진료를 받을 수 있나요?`,
      a: `네, ${CLINIC.name}은 ${CLINIC.region} ${CLINIC.district}를 중심으로 인근 시·군 주민분들도 방문하실 수 있습니다. 방문 전 ${CLINIC.tel}로 문의해 주시면 오시는 길과 진료 안내를 도와드립니다.`,
    },
    {
      q: `지역별로 받을 수 있는 진료가 다른가요?`,
      a: `진료 내용은 지역과 관계없이 동일합니다. ${CLINIC.name}은 임플란트를 제외한 각 분야 전문의가 상주하여, 어느 지역에서 오시든 임플란트·치아교정·소아치과 등 다양한 진료를 안내해 드립니다. 진료 방법과 비용은 개인 상태에 따라 차이가 있으며 내원 상담을 통해 결정됩니다.`,
    },
  ];
  return c.html(Layout({
    title: `지역별 진료 안내 | ${CLINIC.name} - 남양주 화도·마석 치과`,
    description: `${CLINIC.region} ${CLINIC.district} 마석에 위치한 ${CLINIC.name}. ${areaNames} 인근에서 임플란트·치아교정·소아치과 등 진료를 안내합니다.`,
    path: '/area',
    jsonLd: [
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '지역 안내', path: '/area' }]),
      {
        '@context': 'https://schema.org',
        '@type': ['CollectionPage', 'MedicalWebPage'],
        '@id': `${SITE_URL}/area#webpage`,
        name: `${CLINIC.name} 지역별 진료 안내`,
        description: `${areaNames} 인근에서 이용하실 수 있는 ${CLINIC.name} 지역별 진료 안내 모음입니다.`,
        url: `${SITE_URL}/area`,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#clinic` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hub-intro'] },
      },
      itemListSchema({
        name: `${CLINIC.name} 지역별 진료 안내`,
        items: NEARBY_AREAS.flatMap(a =>
          CORE_TREATMENTS.map(t => ({ name: `${a.name} ${t.name}`, path: `/area/${a.slug}-${t.slug}` }))
        ),
      }),
      faqSchema(hubFaqs, '/area'),
    ],
  }, AreaHubPage(hubFaqs)));
});

app.get('/area/:combo', (c) => {
  const combo = c.req.param('combo'); // e.g. "maseok-implant"
  const lastDash = combo.lastIndexOf('-');
  if (lastDash < 0) return c.notFound();
  const areaSlug = combo.slice(0, lastDash);
  const treatSlug = combo.slice(lastDash + 1);
  const area = NEARBY_AREAS.find(a => a.slug === areaSlug);
  const t = getTreatment(treatSlug);
  if (!area || !t) return c.notFound();
  return c.html(Layout({
    title: `${area.name} ${t.name} | ${CLINIC.name} (${area.full})`,
    description: `${area.full}에서 ${t.name} 치과를 찾으신다면 ${CLINIC.name}. ${CLINIC.addressShort}, 각 분야 전문의 상주(임플란트 제외). ${area.access} ${t.name} 진료 방법·비용은 내원 상담을 통해 안내됩니다.`,
    path: `/area/${combo}`,
    jsonLd: [
      areaServiceSchema(area, t),
      areaWebPageSchema(area, t),
      medicalProcedureSchema(t),
      faqSchema(areaFaqs(area, t), `/area/${combo}`),
      breadcrumbSchema([
        { name: '홈', path: '/' },
        { name: '지역 안내', path: '/area' },
        { name: `${area.name} ${t.name}`, path: `/area/${combo}` },
      ]),
    ],
  }, AreaPage(area, t)));
});

// ============================================================================
// 예약 API
// ============================================================================
app.post('/api/reservation', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.name || !body.phone) {
      return c.json({ ok: false, error: '필수 항목 누락' }, 400);
    }
    const record = { ...body, createdAt: new Date().toISOString(), id: crypto.randomUUID() };

    // D1 저장 (바인딩 있을 때만)
    if (c.env.DB) {
      try {
        await c.env.DB.prepare('INSERT INTO reservations (name, phone, treatment, datetime, message) VALUES (?,?,?,?,?)')
          .bind(record.name, record.phone, record.treatment || null, record.datetime || null, record.message || null).run();
      } catch {}
    }

    // R2 저장 (바인딩 있을 때만)
    if (c.env.R2) {
      await c.env.R2.put(`reservations/${record.id}.json`, JSON.stringify(record), {
        httpMetadata: { contentType: 'application/json' },
      });
    }

    // Resend 이메일 알림 (키 있을 때만)
    if (c.env.RESEND_API_KEY && c.env.NOTIFICATION_EMAIL) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'noreply@isoldc.kr',
          to: c.env.NOTIFICATION_EMAIL,
          subject: `[이솔치과] 새 예약 문의 - ${record.name}`,
          html: `<h3>새 예약 문의</h3><ul>
            <li>성함: ${record.name}</li><li>연락처: ${record.phone}</li>
            <li>희망진료: ${record.treatment || '-'}</li><li>희망일시: ${record.datetime || '-'}</li>
            <li>내용: ${record.message || '-'}</li></ul>`,
        }),
      });
    }
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ ok: false, error: 'server error' }, 500);
  }
});

// ============================================================================
// SEO: sitemap.xml / robots.txt / llms.txt
// ============================================================================
// XML 이스케이프 (loc/caption 안전)
const xmlEsc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const NOW = () => new Date().toISOString().split('T')[0];
type SUrl = { loc: string; pri: string; freq?: string; img?: { url: string; cap: string }[] };
function buildUrlset(urls: SUrl[], now: string): string {
  const hasImg = urls.some(u => u.img?.length);
  const ns = hasImg
    ? `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
    : `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;
  const body = urls.map(u => {
    const imgs = (u.img || []).map(im =>
      `\n    <image:image><image:loc>${xmlEsc(SITE_URL + im.url)}</image:loc><image:caption>${xmlEsc(im.cap)}</image:caption></image:image>`
    ).join('');
    return `  <url><loc>${xmlEsc(SITE_URL + u.loc)}</loc><lastmod>${now}</lastmod>${u.freq ? `<changefreq>${u.freq}</changefreq>` : ''}<priority>${u.pri}</priority>${imgs}</url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${ns}>\n${body}\n</urlset>`;
}
const xmlResp = (c: any, xml: string) => c.text(xml, 200, { 'Content-Type': 'application/xml; charset=UTF-8', 'Cache-Control': 'public, max-age=3600' });

// 📲 PWA Service Worker — 루트 scope('/') 확보 위해 Hono에서 직접 서빙
app.get('/sw.js', (c) =>
  c.text(SERVICE_WORKER_JS, 200, {
    'Content-Type': 'application/javascript; charset=UTF-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Service-Worker-Allowed': '/',
  }),
);

// 🔑 IndexNow 키 파일 — 도메인 소유 증명 (콘텐츠 발행 시 즉시 색인 요청에 사용)
app.get(`/${INDEXNOW_KEY}.txt`, (c) =>
  c.text(INDEXNOW_KEY, 200, { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'public, max-age=86400' }),
);

// 🗺️ Sitemap Index (사이트맵 색인)
app.get('/sitemap.xml', (c) => {
  const now = NOW();
  const maps = ['pages', 'treatments', 'doctors', 'glossary', 'areas', 'content'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${maps.map(m => `  <sitemap><loc>${SITE_URL}/sitemap-${m}.xml</loc><lastmod>${now}</lastmod></sitemap>`).join('\n')}
</sitemapindex>`;
  return xmlResp(c, xml);
});

// 메인/안내 페이지
app.get('/sitemap-pages.xml', (c) => {
  const urls: SUrl[] = [
    { loc: '/', pri: '1.0', freq: 'weekly', img: [{ url: '/static/img/og.png', cap: `${CLINIC.name} — ${CLINIC.slogan}` }] },
    { loc: '/mission', pri: '0.8', freq: 'monthly' },
    { loc: '/directions', pri: '0.7', freq: 'monthly' },
    { loc: '/faq', pri: '0.7', freq: 'monthly' },
    { loc: '/pricing', pri: '0.6', freq: 'monthly' },
    { loc: '/reservation', pri: '0.7', freq: 'monthly' },
    { loc: '/glossary', pri: '0.8', freq: 'weekly' },
  ];
  return xmlResp(c, buildUrlset(urls, NOW()));
});

// 진료
app.get('/sitemap-treatments.xml', (c) => {
  const urls: SUrl[] = [
    { loc: '/treatments', pri: '0.9', freq: 'monthly' },
    ...TREATMENTS.map(t => ({ loc: `/treatments/${t.slug}`, pri: t.isCore ? '0.9' : '0.7', freq: 'monthly' })),
  ];
  return xmlResp(c, buildUrlset(urls, NOW()));
});

// 의료진
app.get('/sitemap-doctors.xml', (c) => {
  const urls: SUrl[] = [
    { loc: '/doctors', pri: '0.8', freq: 'monthly' },
    ...DOCTORS.map(d => ({ loc: `/doctors/${d.slug}`, pri: '0.7', freq: 'monthly', img: [{ url: d.photo, cap: `${d.name} ${d.role}` }] })),
  ];
  return xmlResp(c, buildUrlset(urls, NOW()));
});

// 용어사전 (200개 longDef는 우선순위 ↑)
app.get('/sitemap-glossary.xml', (c) => {
  const urls: SUrl[] = GLOSSARY_SORTED.map(t => ({
    loc: `/glossary/${encodeURIComponent(t.term)}`,
    pri: t.longDef ? '0.6' : '0.4',
    freq: 'yearly',
  }));
  return xmlResp(c, buildUrlset(urls, NOW()));
});

// 지역 SEO
app.get('/sitemap-areas.xml', (c) => {
  const urls: SUrl[] = [
    { loc: '/area', pri: '0.8', freq: 'monthly' },
  ];
  for (const a of NEARBY_AREAS) for (const t of CORE_TREATMENTS) {
    urls.push({ loc: `/area/${a.slug}-${t.slug}`, pri: '0.7', freq: 'monthly' });
  }
  return xmlResp(c, buildUrlset(urls, NOW()));
});

// 동적 콘텐츠 (블로그/케이스/공지 — DB 있을 때)
// ⚠️ thin-content 방지: 콘텐츠가 0개인 리스트 페이지("준비 중")는 사이트맵에서 제외.
//    글이 등록되면 해당 리스트 + 상세가 자동으로 사이트맵에 다시 포함됨.
app.get('/sitemap-content.xml', async (c) => {
  const urls: SUrl[] = [];
  let blogN = 0, caseN = 0, noticeN = 0;
  if (c.env.DB) {
    try {
      const [posts, cases, notices] = await Promise.all([
        c.env.DB.prepare('SELECT slug FROM posts WHERE published = 1 ORDER BY id DESC LIMIT 1000').all(),
        c.env.DB.prepare('SELECT id FROM cases WHERE published = 1 ORDER BY id DESC LIMIT 1000').all(),
        c.env.DB.prepare('SELECT id FROM notices ORDER BY id DESC LIMIT 500').all().catch(() => ({ results: [] })),
      ]);
      blogN = (posts.results as any[]).length;
      caseN = (cases.results as any[]).length;
      noticeN = ((notices as any).results as any[]).length;
      for (const p of posts.results as any[]) urls.push({ loc: `/blog/${p.slug}`, pri: '0.7', freq: 'monthly' });
      for (const x of cases.results as any[]) urls.push({ loc: `/cases/${x.id}`, pri: '0.6', freq: 'monthly' });
      for (const n of (notices as any).results as any[]) urls.push({ loc: `/notices/${n.id}`, pri: '0.5', freq: 'monthly' });
    } catch {}
  }
  // 콘텐츠가 있는 섹션의 리스트 페이지만 등록 (빈 "준비 중" 페이지 색인 방지)
  if (blogN > 0) urls.unshift({ loc: '/blog', pri: '0.8', freq: 'weekly' });
  if (caseN > 0) urls.unshift({ loc: '/cases', pri: '0.7', freq: 'weekly' });
  if (noticeN > 0) urls.unshift({ loc: '/notices', pri: '0.6', freq: 'weekly' });
  return xmlResp(c, buildUrlset(urls, NOW()));
});

app.get('/robots.txt', (c) => {
  return c.text(`# ${CLINIC.name} — robots.txt
User-agent: *
Allow: /
Allow: /static/
Disallow: /admin
Disallow: /login
Disallow: /signup
Disallow: /mypage
Disallow: /api/
Disallow: /*?*sort=
Disallow: /*?*page=

# 주요 검색엔진 (전체 허용)
User-agent: Googlebot
Allow: /
User-agent: Googlebot-Image
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Yeti
Allow: /
User-agent: Daumoa
Allow: /

# AI 크롤러 명시 허용 (AEO — 생성형 검색/답변 인용 허용)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bytespider
Allow: /
User-agent: CCBot
Allow: /
User-agent: cohere-ai
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: YouBot
Allow: /
User-agent: Diffbot
Allow: /
User-agent: Timpibot
Allow: /

# 사이트맵 & AI 가이드 파일
Sitemap: ${SITE_URL}/sitemap.xml
# LLM 가이드: ${SITE_URL}/llms.txt , ${SITE_URL}/llms-full.txt`, 200, { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'public, max-age=3600' });
});

app.get('/llms.txt', (c) => {
  const longTerms = GLOSSARY_SORTED.filter(t => t.longDef);
  const specialists = DOCTORS.filter(d => d.isSpecialist);
  return c.text(`# ${CLINIC.name} (${CLINIC.nameEn})

> 경기 남양주시 화도읍 마석에 위치한 지역 치과의원(${CLINIC.establishedLabel}). 임플란트(대표원장 담당)를 제외한 교정·소아·보철·통합 각 분야 전문의가 상주하며, 소아부터 노년층까지 가족 단위로 다닐 수 있는 치과를 지향합니다. 진료 철학은 "${CLINIC.slogan}"입니다.

## 기본 정보
- 병원명: ${CLINIC.name} (${CLINIC.nameEn})
- 주소: ${CLINIC.address}
- 진료 지역: ${CLINIC.region} ${CLINIC.district} (인근 ${NEARBY_AREAS.length}개 생활권: ${NEARBY_AREAS.map(a => a.name).join(', ')})
- 대표전화: ${CLINIC.tel}
- 이메일: ${CLINIC.email}
- 대표원장: ${CLINIC.business.owner}
- 개원: ${CLINIC.established}년 (${CLINIC.establishedLabel})
- 진료시간: ${CLINIC.hoursNote}
- 좌표: 위도 ${CLINIC.geo.lat}, 경도 ${CLINIC.geo.lng}
- 홈페이지: ${SITE_URL}
- 전문의: 임플란트를 제외한 교정·소아·보철·통합 각 분야 전문의 상주 (전문의 ${specialists.length}인)

## 진료 철학 / 미션
- 슬로건: ${CLINIC.slogan}
- 미션: ${CLINIC.mission}
- 비전: ${CLINIC.vision}

## 핵심 진료 (Core Services)
${CORE_TREATMENTS.map(t => `- [${t.name}](${SITE_URL}/treatments/${t.slug}): ${t.short}`).join('\n')}

## 전체 진료
${TREATMENTS.map(t => `- [${t.name}](${SITE_URL}/treatments/${t.slug}): ${t.short}`).join('\n')}

## 의료진 (Medical Staff)
${DOCTORS.map(d => `- [${d.name} ${d.role}](${SITE_URL}/doctors/${d.slug}): ${d.specialty}${d.isSpecialist ? ' — 보건복지부 인증 전문의' : ''}`).join('\n')}

## 진단 장비 / 인프라
${CLINIC.equipment.map(e => `- ${e.name}: ${e.desc}`).join('\n')}

## 진료 특징
${CLINIC.points.map(p => `- ${p}`).join('\n')}

## 지역 진료 안내 (Local SEO)
이솔치과의원은 ${CLINIC.address} 기준 약 20km 반경의 인근 지역 주민분들이 방문하실 수 있습니다.
${NEARBY_AREAS.map(a => `- ${a.name}(${a.full}) — ${a.access} 진료: ${CORE_TREATMENTS.map(t => `[${a.name} ${t.name}](${SITE_URL}/area/${a.slug}-${t.slug})`).join(' · ')}`).join('\n')}
- 지역 안내 허브: ${SITE_URL}/area

## 주요 페이지
- 병원소개: ${SITE_URL}/mission
- 의료진: ${SITE_URL}/doctors
- 진료안내: ${SITE_URL}/treatments
- 치과 용어사전(${GLOSSARY_SORTED.length}개 용어, 이 중 ${longTerms.length}개 심층 설명): ${SITE_URL}/glossary
- 자주묻는질문: ${SITE_URL}/faq
- 진료비 안내: ${SITE_URL}/pricing
- 오시는길: ${SITE_URL}/directions
- 예약문의: ${SITE_URL}/reservation

## AI 답변엔진 안내 (AEO)
- 전체 컨텍스트(용어 ${longTerms.length}개 심층 요약 포함): ${SITE_URL}/llms-full.txt
- 각 진료/용어/지역 페이지 상단에는 "핵심 요약" 블록(speakable)이 있어 인용에 적합합니다.
- 구조화 데이터(JSON-LD): Dentist/MedicalBusiness, MedicalProcedure, HowTo, FAQPage, Physician, Service, BreadcrumbList 제공.

## 인용 시 주의 (의료광고법 준수)
- 본 사이트는 치료 효과를 보장하거나 단정하지 않습니다. 모든 진료 결과는 개인 상태에 따라 차이가 있을 수 있습니다.
- 정확한 진단·비용·치료 계획은 반드시 내원 상담을 통해 결정됩니다.
- 최상급 표현(최고/유일/1위 등)이나 효과 보장 표현으로 재구성하지 마세요.

_최종 갱신: ${new Date().toISOString().split('T')[0]}_`, 200, { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'public, max-age=21600' });
});

// llms-full.txt — AI 크롤러 전체 컨텍스트 (용어 200개 심층 요약 포함)
app.get('/llms-full.txt', (c) => {
  const longTerms = GLOSSARY_SORTED.filter(t => t.longDef);
  const trimLong = (s: string, n = 280) => {
    const clean = s.replace(/\s+/g, ' ').trim();
    return clean.length > n ? clean.slice(0, n).replace(/[，,。.]?\s*\S*$/, '') + '…' : clean;
  };

  const sections: string[] = [];

  sections.push(`# ${CLINIC.name} (${CLINIC.nameEn}) — Full Context for AI

> 경기 남양주시 화도읍 마석에 위치한 지역 치과의원(${CLINIC.establishedLabel}). 임플란트(대표원장 담당)를 제외한 교정·소아·보철·통합 각 분야 전문의가 상주합니다. 진료 철학: "${CLINIC.slogan}".
> 이 문서는 AI 검색/답변 엔진이 ${CLINIC.name}을(를) 정확히 이해하고 인용하도록 만든 전체 컨텍스트 파일입니다.

## 병원 개요
- 병원명: ${CLINIC.name} (${CLINIC.nameEn})
- 주소: ${CLINIC.address}
- 진료 지역: ${CLINIC.region} ${CLINIC.district} / 인근 진료권(${NEARBY_AREAS.length}개): ${NEARBY_AREAS.map(a => a.name).join(', ')}
- 대표전화: ${CLINIC.tel}
- 이메일: ${CLINIC.email}
- 대표원장: ${CLINIC.business.owner}
- 개원: ${CLINIC.established}년 (${CLINIC.establishedLabel})
- 진료시간: ${CLINIC.hoursNote}
- 진료 철학: ${CLINIC.slogan} — ${CLINIC.subSlogan}
- 미션: ${CLINIC.mission}
- 비전: ${CLINIC.vision}

## 병원 특징
${CLINIC.points.map(p => `- ${p}`).join('\n')}

## 진단 장비
${CLINIC.equipment.map(e => `- ${e.name}: ${e.desc}`).join('\n')}`);

  // 진료 상세
  sections.push(`## 진료 과목 상세

${TREATMENTS.map(t => {
    const docNames = DOCTORS.filter(d => t.doctors?.includes(d.slug)).map(d => `${d.name} ${d.role}`);
    return `### ${t.name}${t.isCore ? ' (핵심 진료)' : ''}
- URL: ${SITE_URL}/treatments/${t.slug}
- 요약: ${t.short}
- 담당: ${docNames.join(', ') || '상담 시 안내'}
- 키워드: ${(t.keywords || []).join(', ')}
- 소개: ${trimLong(t.intro, 320)}
${(t.sections || []).map(s => `  - ${s.h2}: ${trimLong(s.body, 200)}`).join('\n')}`;
  }).join('\n\n')}`);

  // 의료진 상세
  sections.push(`## 의료진 상세

${DOCTORS.map(d => `### ${d.name} ${d.role}
- URL: ${SITE_URL}/doctors/${d.slug}
- 전문분야: ${d.specialty}
- 약력: ${(d.credentials || []).join(' / ')}`).join('\n\n')}`);

  // 지역 진료 상세 (Local SEO)
  sections.push(`## 지역별 진료 안내 상세 (Local SEO)

이솔치과의원은 ${CLINIC.address} 기준 약 20km 반경의 인근 지역 주민분들이 방문하실 수 있습니다. 각 지역에서 받을 수 있는 진료 내용은 동일하며, 임플란트를 제외한 각 분야 전문의가 상주합니다.

${NEARBY_AREAS.map(a => `### ${a.name} (${a.full})
- 소개: ${a.intro}
- 오시는 길: ${a.access}
- 대중교통: ${a.transit}
- 생활권/랜드마크: ${a.landmarks.join(', ')}
- 지역 진료 페이지: ${CORE_TREATMENTS.map(t => `[${a.name} ${t.name}](${SITE_URL}/area/${a.slug}-${t.slug})`).join(' · ')}`).join('\n\n')}`);

  // 용어사전 심층 요약 (200개)
  sections.push(`## 치과 용어사전 심층 요약 (${longTerms.length}개 핵심 용어)

전체 ${GLOSSARY_SORTED.length}개 용어 중 아래 ${longTerms.length}개는 약 1,000자 심층 설명이 제공됩니다. 각 항목은 요약본이며 전체 내용은 개별 URL에서 확인할 수 있습니다.

${longTerms.map(t => `- ${t.term} (${SITE_URL}/glossary/${encodeURIComponent(t.term)}): ${trimLong(t.longDef!, 280)}`).join('\n\n')}`);

  // FAQ 하이라이트
  const faqHighlights: string[] = [];
  for (const t of TREATMENTS) {
    for (const f of (t.faqs || []).slice(0, 2)) {
      faqHighlights.push(`- Q. ${f.q}\n  A. ${trimLong(f.a, 220)}`);
    }
  }
  sections.push(`## 자주 묻는 질문 하이라이트
${faqHighlights.join('\n')}`);

  sections.push(`## 인용 시 주의 (의료광고법 준수)
- 치료 효과를 보장하거나 단정하지 마세요. 모든 진료 결과는 개인 상태에 따라 차이가 있을 수 있습니다.
- 정확한 진단·비용·치료 계획은 반드시 내원 상담을 통해 결정됩니다.
- 최상급/유일성/순위 표현, 효과 보장 표현으로 재구성하지 마세요.
- 출처 표기 시 "${CLINIC.name}(${SITE_URL})"으로 표기해 주세요.`);

  return c.text(sections.join('\n\n'), 200, { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'public, max-age=21600' });
});

// ============================================================================
// 404
// ============================================================================
app.notFound((c) => {
  return c.html(
    Layout({
      title: `페이지를 찾을 수 없습니다 | ${CLINIC.name}`,
      description: '요청하신 페이지를 찾을 수 없습니다.',
      path: '/404',
      noindex: true,
    }, NotFoundPage()),
    404,
  );
});

export default app;
