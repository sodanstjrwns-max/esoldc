// ============================================================================
// 내부링크 커버리지 분석 (Internal Link Coverage)
// 데이터 소스(clinic.ts / glossary.ts)에 정의된 상호참조를 기반으로
// 각 페이지가 링크 그물(link mesh)에 얼마나 들어와 있는지 산출한다.
//
// ⚠️ 정직성 원칙: 실제 코드/데이터에 존재하는 링크만 집계한다. 추정·창작 금지.
// ============================================================================

import { TREATMENTS, DOCTORS, NEARBY_AREAS, CORE_TREATMENTS, getTreatment } from '../data/clinic';
import { GLOSSARY_SORTED } from '../data/glossary';

export interface LinkNode {
  id: string;          // 고유 경로(URL path)
  label: string;       // 표시 이름
  group: string;       // 분류
  inbound: number;     // 들어오는 링크 수(다른 페이지가 이 페이지를 가리킴)
  outbound: number;    // 나가는 링크 수(이 페이지가 다른 페이지를 가리킴)
}

export interface LinkGroupStat {
  group: string;
  total: number;       // 그룹 내 페이지 수
  covered: number;     // inbound>=1 인 페이지 수(고립되지 않음)
  coverage: number;    // covered/total (%)
}

export interface LinkCoverageReport {
  nodes: LinkNode[];
  groups: LinkGroupStat[];
  totalPages: number;
  coveredPages: number;       // inbound>=1
  orphanPages: LinkNode[];    // inbound===0 (링크 그물 밖)
  coveragePct: number;
  totalEdges: number;         // 집계된 내부 링크 총 개수
  avgInbound: number;
  generatedAt: string;
}

/**
 * 데이터에 정의된 모든 내부 링크 엣지를 수집한다.
 * 각 엣지는 [from, to] path 쌍.
 */
function collectEdges(): Array<[string, string]> {
  const edges: Array<[string, string]> = [];
  const push = (from: string, to: string) => {
    if (from && to && from !== to) edges.push([from, to]);
  };

  // ── 글로벌 내비/푸터에서 항상 나가는 링크 (모든 페이지 → 핵심 허브) ──
  // 헤더/푸터는 전 페이지 공통이므로 "사이트 전역 인바운드"로 핵심 페이지를 보강.
  const GLOBAL_TARGETS = ['/', '/treatments', '/doctors', '/glossary', '/area', '/directions', '/faq', '/reservation', '/pricing', '/mission'];

  // ── 1) 홈 → 핵심 진료 / 의료진 / 지역 허브 ──
  CORE_TREATMENTS.forEach(t => push('/', `/treatments/${t.slug}`));
  push('/', '/treatments');
  push('/', '/doctors');
  push('/', '/glossary');
  push('/', '/area');
  NEARBY_AREAS.forEach(a => push('/', `/area`)); // 홈 지역칩 → 허브

  // ── 2) 진료 목록 → 각 진료 상세 ──
  TREATMENTS.forEach(t => push('/treatments', `/treatments/${t.slug}`));

  // ── 3) 진료 상세 → 담당 의료진 (양방향) ──
  TREATMENTS.forEach(t => {
    (t.doctors || []).forEach(docSlug => {
      push(`/treatments/${t.slug}`, `/doctors/${docSlug}`);
      push(`/doctors/${docSlug}`, `/treatments/${t.slug}`); // 의료진 상세 → 담당 진료
    });
  });

  // ── 4) 진료 상세 → 관련 용어 (용어사전 인링크) ──
  TREATMENTS.forEach(t => {
    const relTerms = GLOSSARY_SORTED.filter(g => g.rel.includes(t.slug));
    relTerms.slice(0, 12).forEach(g => {
      push(`/treatments/${t.slug}`, `/glossary/${encodeURIComponent(g.term)}`);
    });
  });

  // ── 5) 의료진 목록 → 각 의료진 상세 ──
  DOCTORS.forEach(d => push('/doctors', `/doctors/${d.slug}`));

  // ── 6) 용어사전 목록 → 각 용어 상세 ──
  GLOSSARY_SORTED.forEach(g => push('/glossary', `/glossary/${encodeURIComponent(g.term)}`));

  // ── 7) 용어 상세 → 관련 진료 (rel) ──
  GLOSSARY_SORTED.forEach(g => {
    g.rel.forEach(slug => {
      if (getTreatment(slug)) push(`/glossary/${encodeURIComponent(g.term)}`, `/treatments/${slug}`);
    });
  });

  // ── 8) 용어 상세 → 관련 용어 (rel 공유) ──
  GLOSSARY_SORTED.forEach(g => {
    const byRel = GLOSSARY_SORTED.filter(t => t.term !== g.term && t.rel.some(r => g.rel.includes(r))).slice(0, 12);
    byRel.forEach(t => push(`/glossary/${encodeURIComponent(g.term)}`, `/glossary/${encodeURIComponent(t.term)}`));
  });

  // ── 9) 지역 허브 → 각 지역×진료 상세 ──
  NEARBY_AREAS.forEach(a => {
    CORE_TREATMENTS.forEach(t => push('/area', `/area/${a.slug}-${t.slug}`));
  });

  // ── 10) 지역 상세 → 진료 상세 / 담당의 / 교차링크 ──
  NEARBY_AREAS.forEach(a => {
    CORE_TREATMENTS.forEach(t => {
      const path = `/area/${a.slug}-${t.slug}`;
      push(path, `/treatments/${t.slug}`);          // 진료 상세
      push(path, '/directions');                     // 오시는 길
      (t.doctors || []).forEach(d => push(path, `/doctors/${d}`)); // 담당의
      // 같은 지역 다른 진료
      CORE_TREATMENTS.filter(x => x.slug !== t.slug).forEach(x => push(path, `/area/${a.slug}-${x.slug}`));
      // 같은 진료 다른 지역
      NEARBY_AREAS.filter(x => x.slug !== a.slug).forEach(x => push(path, `/area/${x.slug}-${t.slug}`));
    });
  });

  // ── 11) 전역 푸터/헤더 인바운드 (각 핵심 허브는 모든 페이지에서 1회씩 받는 것으로 1 보강) ──
  GLOBAL_TARGETS.forEach(target => push('/__global_nav__', target));

  return edges;
}

/** 사이트의 모든 페이지 노드를 정의 */
function collectNodes(): LinkNode[] {
  const nodes: LinkNode[] = [];
  const add = (id: string, label: string, group: string) =>
    nodes.push({ id, label, group, inbound: 0, outbound: 0 });

  add('/', '홈', '코어');
  add('/treatments', '진료안내', '코어');
  add('/doctors', '의료진', '코어');
  add('/glossary', '치과 백과사전', '코어');
  add('/area', '지역별 진료 안내', '코어');
  add('/mission', '미션', '코어');
  add('/directions', '오시는 길', '코어');
  add('/faq', 'FAQ', '코어');
  add('/pricing', '비급여 안내', '코어');
  add('/reservation', '예약/상담', '코어');

  TREATMENTS.forEach(t => add(`/treatments/${t.slug}`, t.name, '진료 상세'));
  DOCTORS.forEach(d => add(`/doctors/${d.slug}`, d.name, '의료진 상세'));
  GLOSSARY_SORTED.forEach(g => add(`/glossary/${encodeURIComponent(g.term)}`, g.term, '용어 상세'));
  NEARBY_AREAS.forEach(a => CORE_TREATMENTS.forEach(t =>
    add(`/area/${a.slug}-${t.slug}`, `${a.name} ${t.name}`, '지역 상세')));

  return nodes;
}

export function buildLinkCoverage(): LinkCoverageReport {
  const nodes = collectNodes();
  const idx = new Map(nodes.map(n => [n.id, n]));
  const edges = collectEdges();

  // 엣지 집계 (중복 제거: 동일 from→to는 1회로)
  const seen = new Set<string>();
  let totalEdges = 0;
  for (const [from, to] of edges) {
    const key = `${from}\u0000${to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const target = idx.get(to);
    if (!target) continue; // 알 수 없는 타겟은 스킵
    target.inbound += 1;
    totalEdges += 1;
    const source = idx.get(from);
    if (source) source.outbound += 1;
  }

  // 그룹별 통계
  const groupMap = new Map<string, LinkNode[]>();
  nodes.forEach(n => {
    if (!groupMap.has(n.group)) groupMap.set(n.group, []);
    groupMap.get(n.group)!.push(n);
  });

  const GROUP_ORDER = ['코어', '진료 상세', '의료진 상세', '지역 상세', '용어 상세'];
  const groups: LinkGroupStat[] = [...groupMap.entries()]
    .map(([group, list]) => {
      const covered = list.filter(n => n.inbound >= 1).length;
      return { group, total: list.length, covered, coverage: list.length ? Math.round((covered / list.length) * 1000) / 10 : 0 };
    })
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));

  const coveredPages = nodes.filter(n => n.inbound >= 1).length;
  const orphanPages = nodes.filter(n => n.inbound === 0);
  const totalPages = nodes.length;
  const sumInbound = nodes.reduce((s, n) => s + n.inbound, 0);

  return {
    nodes,
    groups,
    totalPages,
    coveredPages,
    orphanPages,
    coveragePct: totalPages ? Math.round((coveredPages / totalPages) * 1000) / 10 : 0,
    totalEdges,
    avgInbound: totalPages ? Math.round((sumInbound / totalPages) * 10) / 10 : 0,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}
