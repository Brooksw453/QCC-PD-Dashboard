-- ============================================
-- Migration 006: Platform Enhancements
-- Adds: announcements, notes, favorites, ratings,
--        app_settings, pathway deadlines/prerequisites,
--        onboarding flag, public stats function
-- ============================================

-- 1. Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_announcements_active ON announcements (is_active, expires_at);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active announcements"
  ON announcements FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Admins can read all announcements"
  ON announcements FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert announcements"
  ON announcements FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE USING (is_admin());

-- 2. Notes (learner notes on courses)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX idx_notes_user_course ON notes (user_id, course_id);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notes"
  ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE USING (auth.uid() = user_id);

-- 3. Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX idx_favorites_user ON favorites (user_id);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 4. Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
CREATE INDEX idx_ratings_course ON ratings (course_id);
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ratings"
  ON ratings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can read all ratings"
  ON ratings FOR SELECT USING (is_admin());
CREATE POLICY "Users can insert own ratings"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. App Settings (for webhook URL, etc.)
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES profiles
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings"
  ON app_settings FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert settings"
  ON app_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update settings"
  ON app_settings FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete settings"
  ON app_settings FOR DELETE USING (is_admin());

-- 6. Pathway enhancements
ALTER TABLE pathways ADD COLUMN deadline TIMESTAMPTZ;
ALTER TABLE pathways ADD COLUMN prerequisite_pathway_id UUID REFERENCES pathways ON DELETE SET NULL;

-- 7. Onboarding flag
ALTER TABLE profiles ADD COLUMN has_seen_onboarding BOOLEAN NOT NULL DEFAULT false;

-- 8. Public stats function (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'facultyTrained', (SELECT COUNT(*) FROM profiles),
    'totalCompletions', (SELECT COUNT(*) FROM completions),
    'badgesEarned', (SELECT COUNT(*) FROM badges_earned),
    'pathwaysAvailable', (SELECT COUNT(*) FROM pathways WHERE is_published = true)
  );
$$ LANGUAGE sql SECURITY DEFINER;
