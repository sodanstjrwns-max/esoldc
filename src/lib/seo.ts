import { CLINIC, DOCTORS, TREATMENTS, type Treatment } from '../data/clinic';

export const SITE_URL = 'https://isoldent.com'; // 실 도메인 (6/3 시트)

export interface SeoMeta {
  title: string;
  description: string;
  path: string;          // canonical path, e.g. '/treatments/implant'
  ogImage?: string;
  type?: string;
  jsonLd?: object[];     // 추가 구조화 데이터
  noindex?: boolean;
}

// --- JSON-LD 빌더들 ---
export function dentistSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${SITE_URL}/#clinic`,
    name: CLINIC.name,
    alternateName: CLINIC.nameEn,
    url: SITE_URL,
    telephone: CLINIC.tel,
    email: CLINIC.email,
    slogan: CLINIC.slogan,
    image: `${SITE_URL}/static/img/og.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.addressShort,
      addressLocality: '남양주시',
      addressRegion: '경기도',
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    medicalSpecialty: 'Dentistry',
    priceRange: '₩₩',
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '09:30', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '09:30', closes: '13:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '13:30' },
    ],
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name: CLINIC.name,
    image: `${SITE_URL}/static/img/og.png`,
    telephone: CLINIC.tel,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.addressShort,
      addressLocality: '남양주시',
      addressRegion: '경기도',
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    url: SITE_URL,
  };
}

export function personSchema(d: typeof DOCTORS[number]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/doctors/${d.slug}#person`,
    name: d.name,
    jobTitle: d.role,
    worksFor: { '@type': 'Dentist', name: CLINIC.name, '@id': `${SITE_URL}/#clinic` },
    knowsAbout: d.specialty,
    description: d.bio,
  };
}

export function medicalProcedureSchema(t: Treatment) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: t.name,
    description: t.metaDesc,
    url: `${SITE_URL}/treatments/${t.slug}`,
    procedureType: 'https://schema.org/SurgicalProcedure',
    relevantSpecialty: 'Dentistry',
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
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

export function articleSchema(opts: { title: string; desc: string; path: string; author: string; published: string; modified: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: opts.title,
    description: opts.desc,
    url: `${SITE_URL}${opts.path}`,
    datePublished: opts.published,
    dateModified: opts.modified,
    author: { '@type': 'Person', name: opts.author },
    publisher: { '@type': 'Dentist', name: CLINIC.name },
  };
}
