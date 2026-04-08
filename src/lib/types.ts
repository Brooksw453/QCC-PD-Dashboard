export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'faculty' | 'admin';
  department: string | null;
  has_seen_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  image_url: string | null;
  external_url: string;
  estimated_minutes: number | null;
  is_published: boolean;
  sort_order: number;
  tags: string[];
  format: 'document' | 'video' | 'articulate' | 'webpage' | 'presentation' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Pathway {
  id: string;
  title: string;
  slug: string;
  description: string;
  badge_name: string;
  badge_image_url: string | null;
  badge_color: string;
  is_published: boolean;
  sort_order: number;
  deadline: string | null;
  prerequisite_pathway_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PathwayCourse {
  id: string;
  pathway_id: string;
  course_id: string;
  sort_order: number;
  course?: Course;
}

export interface Completion {
  id: string;
  user_id: string;
  course_id: string;
  completed_at: string;
  verified_by: string | null;
  verified_at: string | null;
  profile?: Profile;
  course?: Course;
}

export interface BadgeEarned {
  id: string;
  user_id: string;
  pathway_id: string;
  earned_at: string;
  pathway?: Pathway;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

export interface Note {
  id: string;
  user_id: string;
  course_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  course?: Course;
}

export interface Rating {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}
