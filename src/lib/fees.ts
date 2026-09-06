// ============================================================
// 비급여 수가(진료비) 데이터 액세스 — D1 기반, 원장 편집 가능
// - 항목별 공개/비공개(is_published) 토글 지원
// - 테이블이 비어 있으면 정적 PRICING 기준표로 자동 시드
// - DB 미연결/오류 시 정적 PRICING으로 폴백 → 절대 빈 화면이 되지 않음
// ============================================================
import { PRICING, type PriceGroup } from '../data/clinic';

export type AdminPriceItem = {
  id: number;
  name: string;
  price: number;
  is_published: number;
  sort_order: number;
};
export type AdminPriceGroup = {
  cat: string;
  icon: string;
  taxable: boolean;
  note: string;
  cat_order: number;
  items: AdminPriceItem[];
};

// 테이블 존재 + 비어있으면 정적 PRICING으로 시드 (멱등)
export async function ensurePricingSeed(db: D1Database): Promise<void> {
  const cnt = await db.prepare('SELECT COUNT(*) n FROM price_items').first<any>().catch(() => null);
  if (!cnt) return;            // 테이블 없음 → 마이그레이션 미적용, 폴백에 맡김
  if ((cnt.n as number) > 0) return;

  const stmts: D1PreparedStatement[] = [];
  const ins = db.prepare(
    `INSERT INTO price_items (cat, cat_icon, taxable, cat_note, cat_order, name, price, is_published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
  );
  PRICING.forEach((g, gi) => {
    g.items.forEach((it, ii) => {
      stmts.push(ins.bind(
        g.cat, g.icon, g.taxable ? 1 : 0, g.note ?? null, gi, it.name, it.price, ii
      ));
    });
  });
  if (stmts.length) await db.batch(stmts);
}

// 행 배열 → 분류별 그룹 재구성 (순서 보존)
function rowsToGroups(rows: any[]): AdminPriceGroup[] {
  const map = new Map<string, AdminPriceGroup>();
  for (const r of rows) {
    let g = map.get(r.cat);
    if (!g) {
      g = { cat: r.cat, icon: r.cat_icon || 'fa-tooth', taxable: !!r.taxable, note: r.cat_note || '', cat_order: r.cat_order ?? 0, items: [] };
      map.set(r.cat, g);
    }
    g.items.push({ id: r.id, name: r.name, price: r.price, is_published: r.is_published, sort_order: r.sort_order ?? 0 });
  }
  return Array.from(map.values());
}

// 공개 페이지용: 공개 항목만, 빈 분류는 숨김. 실패 시 정적 PRICING 폴백.
export async function loadPublicPricing(db?: D1Database): Promise<PriceGroup[]> {
  if (!db) return PRICING;
  try {
    await ensurePricingSeed(db);
    const { results } = await db.prepare(
      `SELECT * FROM price_items WHERE is_published = 1 ORDER BY cat_order, sort_order, id`
    ).all();
    const rows = (results as any[]) || [];
    if (!rows.length) return PRICING;   // 전부 비공개거나 비어있으면 폴백(빈 화면 방지)
    return rowsToGroups(rows).map(g => ({
      cat: g.cat, icon: g.icon, taxable: g.taxable, note: g.note || undefined,
      items: g.items.map(it => ({ name: it.name, price: it.price })),
    }));
  } catch {
    return PRICING;
  }
}

// 관리자 편집용: 전체(비공개 포함) + 항목 id 포함
export async function loadAdminPricing(db: D1Database): Promise<AdminPriceGroup[]> {
  await ensurePricingSeed(db);
  const { results } = await db.prepare(
    `SELECT * FROM price_items ORDER BY cat_order, sort_order, id`
  ).all();
  const rows = (results as any[]) || [];
  if (!rows.length) {
    // 폴백: 정적 기준표를 편집 화면에 그대로 노출 (아직 미시드 상태)
    return PRICING.map((g, gi) => ({
      cat: g.cat, icon: g.icon, taxable: !!g.taxable, note: g.note || '', cat_order: gi,
      items: g.items.map((it, ii) => ({ id: 0, name: it.name, price: it.price, is_published: 1, sort_order: ii })),
    }));
  }
  return rowsToGroups(rows);
}
