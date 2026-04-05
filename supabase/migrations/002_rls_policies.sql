-- QCC PD Dashboard: Row Level Security Policies
-- Run this in the Supabase SQL editor AFTER 001_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- Profiles policies
-- ============================================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================================
-- Courses policies
-- ============================================================
CREATE POLICY "Anyone can read published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can read all courses"
  ON courses FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (is_admin());

-- ============================================================
-- Pathways policies
-- ============================================================
CREATE POLICY "Anyone can read published pathways"
  ON pathways FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can read all pathways"
  ON pathways FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert pathways"
  ON pathways FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update pathways"
  ON pathways FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete pathways"
  ON pathways FOR DELETE
  USING (is_admin());

-- ============================================================
-- Pathway courses policies
-- ============================================================
CREATE POLICY "Anyone can read pathway courses"
  ON pathway_courses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pathway courses"
  ON pathway_courses FOR ALL
  USING (is_admin());

-- ============================================================
-- Completions policies
-- ============================================================
CREATE POLICY "Users can read own completions"
  ON completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all completions"
  ON completions FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can insert own completions"
  ON completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert completions"
  ON completions FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update completions"
  ON completions FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete completions"
  ON completions FOR DELETE
  USING (is_admin());

-- ============================================================
-- Badges earned policies
-- ============================================================
CREATE POLICY "Users can read own badges"
  ON badges_earned FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all badges"
  ON badges_earned FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can delete badges"
  ON badges_earned FOR DELETE
  USING (is_admin());
