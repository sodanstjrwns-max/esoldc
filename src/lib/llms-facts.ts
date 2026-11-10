// ============================================================
// llms.txt · llms-full.txt 맨 위 '병원 정보' 표준 블록 (2026-11-10)
// - AI 검색이 인용하는 사실(이름·주소·전화·진료시간·의료진·예약·주요 URL)을 한곳에 같은 순서로.
// - 값은 전부 src/data/clinic.ts 상수에서 가져온다. 없는 항목은 줄을 뺀다(추측 금지).
// - 비급여 진료비는 /pricing 화면에 지금 공개된 항목만(관리자가 숨긴 값·정적 기준표 폴백 제외).
// ============================================================
import { CLINIC, DOCTORS, TREATMENTS, NEARBY_AREAS, type PriceGroup } from '../data/clinic';
import { SITE_URL, CLINIC_FACTS_CHECKED } from './seo';

const won = (n: number) => Number(n).toLocaleString('ko-KR');

export function llmsFactsBlock(publicPricing: PriceGroup[] = []): string {
  const station = NEARBY_AREAS.find(a => a.slug === 'maseok')?.transit;
  const booking = (CLINIC.sns as any).naverBookingUrl as string | undefined;
  const lines: string[] = [
    `- 이름: ${CLINIC.name} (${CLINIC.nameEn})`,
    `- 진료 분야: ${TREATMENTS.map(t => t.name).join(', ')}`,
    `- 주소: ${CLINIC.address}${station ? ` / 가까운 역·출구: ${station}` : ''}`,
    `- 전화: ${CLINIC.tel}`,
    `- 진료 시간: ${CLINIC.hours.map(h => `${h.day} ${h.time}`).join(' / ')}`,
    `- 의료진: ${DOCTORS.map(d => `${d.name} ${d.role} — ${d.specialty}`).join('; ')}`,
    `- 예약: ${SITE_URL}/reservation${booking ? ` (네이버 예약 ${booking})` : ''} · 전화 ${CLINIC.tel}`,
    `- 진료 안내: ${SITE_URL}/treatments / 비용 안내: ${SITE_URL}/pricing / 의료진: ${SITE_URL}/doctors / 지역 안내(허브): ${SITE_URL}/area (마석 치과 ${SITE_URL}/area/maseok) / 자주 묻는 질문: ${SITE_URL}/faq`,
  ];
  // 주요 비급여 진료비 — 공개 분류 앞에서부터 최대 6줄, 분류마다 앞 3개 항목 (화면 표와 같은 순서·같은 값)
  const groups = publicPricing.filter(g => g.items.length).slice(0, 6);
  if (groups.length >= 3) {
    lines.push(`- 주요 비급여 진료비 (게시 기준. 실제 비용은 구강 상태·진료 범위·사용 재료에 따라 달라지며 내원 상담 시 확정):`);
    for (const g of groups) {
      lines.push(`  - ${g.cat}: ${g.items.slice(0, 3).map(it => `${it.name} ${won(it.price)}원`).join(' · ')}${g.taxable ? ' (부가세 별도)' : ''}`);
    }
  }
  lines.push(`- 최종 확인일: ${CLINIC_FACTS_CHECKED} (진료 시간 확인 기준)`);
  return `## 병원 정보\n${lines.join('\n')}`;
}
