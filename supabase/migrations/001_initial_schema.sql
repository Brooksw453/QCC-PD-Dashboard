-- QCC PD Dashboard: Initial Schema
-- Run this in the Supabase SQL editor

-- ============================================================
-- 1. Profiles (extends Supabase Auth)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'faculty' CHECK (role IN ('faculty', 'admin')),
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, department)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'department'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. Courses
-- ============================================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  external_url TEXT NOT NULL,
  estimated_minutes INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_published ON courses (is_published, sort_order);
CREATE INDEX idx_courses_slug ON courses (slug);

-- ============================================================
-- 3. Pathways
-- ============================================================
CREATE TABLE pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  badge_name TEXT NOT NULL,
  badge_image_url TEXT,
  badge_color TEXT NOT NULL DEFAULT '#1F5A96',
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pathways_published ON pathways (is_published, sort_order);

-- ============================================================
-- 4. Pathway Courses (join table with ordering)
-- ============================================================
CREATE TABLE pathway_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID NOT NULL REFERENCES pathways ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (pathway_id, course_id)
);

CREATE INDEX idx_pathway_courses_pathway ON pathway_courses (pathway_id, sort_order);

-- ============================================================
-- 5. Completions
-- ============================================================
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES profiles,
  verified_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE INDEX idx_completions_user ON completions (user_id);
CREATE INDEX idx_completions_course ON completions (course_id);

-- ============================================================
-- 6. Badges Earned
-- ============================================================
CREATE TABLE badges_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  pathway_id UUID NOT NULL REFERENCES pathways ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pathway_id)
);

CREATE INDEX idx_badges_user ON badges_earned (user_id);
