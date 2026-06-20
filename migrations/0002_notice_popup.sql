-- ============================================================
-- 공지사항 → 히어로 팝업 기능 확장
-- ============================================================
-- is_popup    : 홈 화면 팝업으로 띄울지 여부 (0/1)
-- popup_start : 팝업 노출 시작일 (YYYY-MM-DD, NULL이면 즉시)
-- popup_end   : 팝업 노출 종료일 (YYYY-MM-DD, NULL이면 무기한)
-- link_url    : 팝업 클릭 시 이동할 링크 (NULL이면 공지 상세로 이동)
-- popup_size  : 팝업 크기 (sm/md/lg, 기본 md)

ALTER TABLE notices ADD COLUMN is_popup INTEGER NOT NULL DEFAULT 0;
ALTER TABLE notices ADD COLUMN popup_start TEXT;
ALTER TABLE notices ADD COLUMN popup_end TEXT;
ALTER TABLE notices ADD COLUMN link_url TEXT;
ALTER TABLE notices ADD COLUMN popup_size TEXT NOT NULL DEFAULT 'md';

CREATE INDEX IF NOT EXISTS idx_notices_popup ON notices(is_popup, published);
