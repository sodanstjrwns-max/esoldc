-- ============================================================
-- 이솔치과의원 초기 스키마
-- ============================================================

-- 회원 (이메일+전화 필수, 동의 2종)
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  agree_privacy INTEGER NOT NULL DEFAULT 0,      -- 개인정보활용동의 (필수)
  agree_marketing INTEGER NOT NULL DEFAULT 0,    -- 마케팅정보수신동의 (선택)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- 세션 (회원/관리자 공용)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  member_id INTEGER,                 -- NULL이면 관리자 세션
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 비포애프터 케이스
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  age_group TEXT NOT NULL DEFAULT '',     -- 10대/20대/30대...
  gender TEXT NOT NULL DEFAULT '',        -- 남성/여성
  category TEXT NOT NULL DEFAULT '',      -- 진료 카테고리 slug
  region TEXT NOT NULL DEFAULT '',        -- 지역 (자동완성 입력값)
  doctor_slug TEXT NOT NULL DEFAULT '',   -- 담당 원장
  duration TEXT NOT NULL DEFAULT '',      -- 치료 기간
  img_pano_before TEXT,                   -- R2 key (4장, 없으면 NULL)
  img_pano_after TEXT,
  img_oral_before TEXT,
  img_oral_after TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_doctor ON cases(doctor_slug);

-- 블로그
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',  -- 에디터 HTML (h태그 포함)
  excerpt TEXT NOT NULL DEFAULT '',
  thumbnail TEXT,                          -- R2 key
  author_slug TEXT NOT NULL DEFAULT '',    -- 작성자(원장 slug)
  views INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- 공지사항
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  image TEXT,                              -- R2 key
  is_pinned INTEGER NOT NULL DEFAULT 0,    -- 대장 공지
  views INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 예약 문의 (기존 R2 → D1 이중화)
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  treatment TEXT,
  datetime TEXT,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
