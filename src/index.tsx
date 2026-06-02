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
  ReservationPage, CasesPage, AreaPage, NotFoundPage,
} from './pages/misc';

type Bindings = {
  R2?: R2Bucket;
  DB?: D1Database;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('/api/*', cors());

// ============================================================================
// 메인
// ============================================================================
app.get('/', (c) => {
  return c.html(Layout({
    title: `${CLINIC.name} | 남양주 마석 임플란트·교정·소아치과`,
    description: `남양주 마석 ${CLINIC.name}. 개원 15년차, 각 분야 전문의 상주. 임플란트·치아교정·소아치과를 중심으로 전 연령 통합 진료. 기분 좋게 진료를 마칠 때까지.`,
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
    description: `${CLINIC.name}의 이야기. 남양주 마석에서 15년, "기분 좋게 진료를 마칠 때까지"라는 철학으로 지역 주민과 함께해 온 동네 치과입니다.`,
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

app.get('/cases', (c) => {
  return c.html(Layout({
    title: `비포 & 애프터 | ${CLINIC.name}`,
    description: `${CLINIC.name} 진료 사례 안내. 진료 사례는 의료법에 따라 내원 상담 시 직접 안내해 드립니다.`,
    path: '/cases',
    jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비포&애프터', path: '/cases' }])],
  }, CasesPage()));
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
    description: `${area.full} ${t.name} 치과를 찾으신다면 ${CLINIC.name}. ${CLINIC.addressShort}, 개원 15년차, 전문의 상주. ${t.name} 진료 안내.`,
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
app.get('/sitemap.xml', (c) => {
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
    { loc: '/cases', pri: '0.6' },
    ...TREATMENTS.map(t => ({ loc: `/treatments/${t.slug}`, pri: t.isCore ? '0.9' : '0.7' })),
    ...DOCTORS.map(d => ({ loc: `/doctors/${d.slug}`, pri: '0.7' })),
  ];
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

> 남양주 마석에 위치한 개원 15년차 치과의원. 각 분야 전문의가 상주하며, "기분 좋게 진료를 마칠 때까지"를 진료 철학으로 합니다.

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
