-- 예약 문의 상태 관리 컬럼 추가 (운영 효율)
-- status: new(신규) | contacted(연락완료) | confirmed(예약확정) | hold(보류) | done(완료)
ALTER TABLE reservations ADD COLUMN status TEXT NOT NULL DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at);
