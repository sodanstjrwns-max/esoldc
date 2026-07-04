-- 칼럼(블로그) SEO/AEO 강화: 카테고리·핵심요약·FAQ·태그
ALTER TABLE posts ADD COLUMN category TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN summary TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN faq_json TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN tags TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_slug);
