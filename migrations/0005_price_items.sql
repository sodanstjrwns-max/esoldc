-- ============================================================
-- 0005: 비급여 수가(진료비) — 원장 편집용 D1 테이블
-- 항목별 공개/비공개(is_published) 토글 포함. 기본값은 공개(1).
-- 데이터는 앱 최초 접근 시 정적 PRICING 기준표로 자동 시드(비어 있을 때만).
-- ============================================================
CREATE TABLE IF NOT EXISTS price_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  cat           TEXT    NOT NULL,                 -- 분류명 (예: 임플란트)
  cat_icon      TEXT    NOT NULL DEFAULT 'fa-tooth',
  taxable       INTEGER NOT NULL DEFAULT 0,       -- 부가세 과세 분류(미용 등)
  cat_note      TEXT,                             -- 분류 안내문 (선택)
  cat_order     INTEGER NOT NULL DEFAULT 0,       -- 분류 표시 순서
  name          TEXT    NOT NULL,                 -- 항목명
  price         INTEGER NOT NULL DEFAULT 0,       -- 금액(원)
  is_published  INTEGER NOT NULL DEFAULT 1,       -- 1=공개, 0=비공개
  sort_order    INTEGER NOT NULL DEFAULT 0,       -- 분류 내 항목 순서
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_price_items_cat ON price_items(cat_order, sort_order);
CREATE INDEX IF NOT EXISTS idx_price_items_pub ON price_items(is_published);
