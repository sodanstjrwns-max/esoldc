import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CLINIC, TREATMENTS, DOCTORS, NEARBY_AREAS, CORE_TREATMENTS, getTreatment, getDoctor } from './data/clinic';
import { Layout } from './lib/layout';
import {
  SITE_URL, dentistSchema, localBusinessSchema, personSchema,
  medicalProcedureSchema, faqSchema, breadcrumbSchema,
} from './lib/seo';
import { HomePage } from './pages/home';
import { TreatmentsListPage, TreatmentDetailPage } from './pages/treatments';
import { DoctorsListPage, DoctorDetailPage } from './pages/doctors';
import {
  MissionPage, DirectionsPage, FaqPage, PricingPage,
  ReservationPage, AreaPage, NotFoundPage,
} from './pages/misc';
import { SignupPage, LoginPage } from './pages/auth';
import {
  CasesListPage, CaseDetailPage, BlogListPage, BlogDetailPage,
  NoticesListPage, NoticeDetailPage,
} from './pages/content';
import { authApi } from './routes/auth';
import { admin } from './routes/admin';
import { adminContent } from './routes/admin-content';
import { getSession } from './lib/auth';
import { searchRegions } from './data/regions';

type Bindings = {
  R2?: R2Bucket;
  DB?: D1Database;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
  ADMIN_PASSWORD?: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('/api/*', cors());

// 서브 라우터 마운트
app.route('/api/auth', authApi);
app.route('/admin', admin);
app.route('/admin', adminContent);

// ============================================================================
// 메인
// ============================================================================
app.get('/', (c) => {
  return c.html(Layout({
    title: `${CLINIC.name} | 남양주 마석 임플란트·교정·소아치과`,
    description: `남양주 마석 ${CLINIC.name}. 각 분야 전문의 상주(임플란트 제외), 소아부터 노인까지 3대가 함께하는 가족 치과. 임플란트·치아교정·소아치과 전 연령 통합 진료. 기분 좋게 진료를 마칠 때까지.`,
    path: '/',
    jsonLd: [dentistSchema(), localBusinessSchema()],
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
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }])],
  }, TreatmentsListPage()));
});

app.get('/treatments/:slug', (c) => {
  const t = getTreatment(c.req.param('slug'));
  if (!t) return c.notFound();
  return c.html(Layout({
    title: t.metaTitle,
    description: t.metaDesc,
    path: `/treatments/${t.slug}`,
    type: 'article',
    jsonLd: [
      medicalProcedureSchema(t),
      faqSchema(t.faqs),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }, { name: t.name, path: `/treatments/${t.slug}` }]),
    ],
  }, TreatmentDetailPage(t)));
});

// ============================================================================
// 안내 페이지들
// ============================================================================
app.get('/directions', (c) => {
  return c.html(Layout({
    title: `오시는 길 | ${CLINIC.name} - ${CLINIC.addressShort}`,
    description: `${CLINIC.name} 오시는 길. ${CLINIC.address}. 대표전화 ${CLINIC.tel}. 경춘선 마석역 인근. 진료시간 안내.`,
    path: '/directions',
    jsonLd: [localBusinessSchema(), breadcrumbSchema([{ name: '홈', path: '/' }, { name: '오시는길', path: '/directions' }])],
  }, DirectionsPage()));
});

app.get('/faq', (c) => {
  const allFaqs = TREATMENTS.flatMap(t => t.faqs);
  return c.html(Layout({
    title: `자주 묻는 질문 | ${CLINIC.name}`,
    description: `${CLINIC.name} 자주 묻는 질문. 임플란트·교정·소아치과 등 진료별로 환자분들이 자주 궁금해하시는 내용을 모았습니다.`,
    path: '/faq',
    jsonLd: [faqSchema(allFaqs), breadcrumbSchema([{ name: '홈', path: '/' }, { name: '자주묻는질문', path: '/faq' }])],
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
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '예약문의', path: '/reservation' }])],
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
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비포&애프터', path: '/cases' }, { name: x.title, path: `/cases/${id}` }])],
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
      {
        '@context': 'https://schema.org', '@type': 'BlogPosting',
        headline: p.title, description: p.excerpt || '',
        datePublished: p.created_at, dateModified: p.updated_at,
        author: { '@type': 'Person', name: (DOCTORS.find(d => d.slug === p.author_slug)?.name || CLINIC.name) },
        publisher: { '@type': 'Organization', name: CLINIC.name },
        mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
      },
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
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notices' }, { name: n.title, path: `/notices/${id}` }])],
  }, NoticeDetailPage(n)));
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
// 지역 SEO: /area/[지역]-[진료]
// ============================================================================
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
    title: `${area.name} ${t.name} | ${CLINIC.name} - ${area.full}`,
    description: `${area.full} ${t.name} 치과를 찾으신다면 ${CLINIC.name}. ${CLINIC.addressShort}, 각 분야 전문의 상주(임플란트 제외). ${t.name} 진료 안내.`,
    path: `/area/${combo}`,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'City', name: area.full },
      medicalProcedureSchema(t),
      breadcrumbSchema([{ name: '홈', path: '/' }, { name: `${area.name} ${t.name}`, path: `/area/${combo}` }]),
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
          from: 'noreply@isoldent.com',
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
app.get('/sitemap.xml', async (c) => {
  const now = new Date().toISOString().split('T')[0];
  const urls: { loc: string; pri: string }[] = [
    { loc: '/', pri: '1.0' },
    { loc: '/mission', pri: '0.8' },
    { loc: '/doctors', pri: '0.8' },
    { loc: '/treatments', pri: '0.9' },
    { loc: '/directions', pri: '0.7' },
    { loc: '/faq', pri: '0.7' },
    { loc: '/pricing', pri: '0.6' },
    { loc: '/reservation', pri: '0.7' },
    { loc: '/cases', pri: '0.7' },
    { loc: '/blog', pri: '0.8' },
    { loc: '/notices', pri: '0.6' },
    ...TREATMENTS.map(t => ({ loc: `/treatments/${t.slug}`, pri: t.isCore ? '0.9' : '0.7' })),
    ...DOCTORS.map(d => ({ loc: `/doctors/${d.slug}`, pri: '0.7' })),
  ];
  // 동적 콘텐츠 (DB 있을 때)
  if (c.env.DB) {
    try {
      const [posts, cases] = await Promise.all([
        c.env.DB.prepare('SELECT slug FROM posts WHERE published = 1 ORDER BY id DESC LIMIT 500').all(),
        c.env.DB.prepare('SELECT id FROM cases WHERE published = 1 ORDER BY id DESC LIMIT 500').all(),
      ]);
      for (const p of posts.results as any[]) urls.push({ loc: `/blog/${p.slug}`, pri: '0.7' });
      for (const x of cases.results as any[]) urls.push({ loc: `/cases/${x.id}`, pri: '0.6' });
    } catch {}
  }
  // 지역 SEO: 인근지역 × 핵심진료
  for (const a of NEARBY_AREAS) {
    for (const t of CORE_TREATMENTS) {
      urls.push({ loc: `/area/${a.slug}-${t.slug}`, pri: '0.6' });
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${now}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>`;
  return c.text(xml, 200, { 'Content-Type': 'application/xml' });
});

app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`, 200, { 'Content-Type': 'text/plain' });
});

app.get('/llms.txt', (c) => {
  return c.text(`# ${CLINIC.name} (${CLINIC.nameEn})

> 남양주 마석에 위치한 동네 치과의원(2017년 개원, 10년째 한자리). 임플란트를 제외한 각 분야 전문의가 상주하며, 소아부터 노인까지 3대가 함께 다니는 가족 치과를 지향합니다. "기분 좋게 진료를 마칠 때까지"를 진료 철학으로 합니다.

## 기본 정보
- 병원명: ${CLINIC.name}
- 주소: ${CLINIC.address}
- 대표전화: ${CLINIC.tel}
- 대표원장: ${CLINIC.business.owner}
- 개원: ${CLINIC.establishedLabel}
- 진료 철학: ${CLINIC.slogan}

## 핵심 진료
${CORE_TREATMENTS.map(t => `- [${t.name}](${SITE_URL}/treatments/${t.slug}): ${t.short}`).join('\n')}

## 전체 진료
${TREATMENTS.map(t => `- [${t.name}](${SITE_URL}/treatments/${t.slug})`).join('\n')}

## 의료진
${DOCTORS.map(d => `- [${d.name} ${d.role}](${SITE_URL}/doctors/${d.slug}): ${d.specialty}`).join('\n')}

## 주요 페이지
- 병원소개: ${SITE_URL}/mission
- 의료진: ${SITE_URL}/doctors
- 진료안내: ${SITE_URL}/treatments
- 자주묻는질문: ${SITE_URL}/faq
- 오시는길: ${SITE_URL}/directions
- 예약문의: ${SITE_URL}/reservation

## 안내
정확한 진단과 비용은 내원 상담을 통해 안내됩니다. 모든 진료 결과는 개인 상태에 따라 차이가 있을 수 있습니다.`, 200, { 'Content-Type': 'text/plain' });
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
