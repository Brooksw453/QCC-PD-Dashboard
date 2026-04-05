-- QCC PD Dashboard: Sample seed data
-- Run this AFTER all other migrations to populate test data

-- Sample courses (replace external_url with actual Articulate Rise links)
INSERT INTO courses (title, slug, description, short_description, external_url, estimated_minutes, is_published, sort_order, tags) VALUES
(
  'Introduction to Universal Design for Learning',
  'intro-udl',
  'Learn the fundamentals of Universal Design for Learning (UDL) and how to apply its principles to create inclusive course materials that benefit all students.',
  'Learn UDL fundamentals and create inclusive course materials.',
  'https://example.com/udl-course',
  45,
  true,
  1,
  ARRAY['accessibility', 'teaching']
),
(
  'Creating Accessible Documents',
  'accessible-documents',
  'Master the techniques for creating accessible Word documents, PDFs, and presentations that meet WCAG guidelines and support assistive technologies.',
  'Create accessible Word docs, PDFs, and presentations.',
  'https://example.com/accessible-docs',
  30,
  true,
  2,
  ARRAY['accessibility', 'documents']
),
(
  'Effective Online Discussion Facilitation',
  'online-discussions',
  'Develop strategies for facilitating engaging and productive online discussions that promote critical thinking and student interaction.',
  'Facilitate engaging online discussions that promote learning.',
  'https://example.com/discussions-course',
  25,
  true,
  3,
  ARRAY['teaching', 'online']
),
(
  'Assessment Strategies for Online Learning',
  'online-assessment',
  'Explore various assessment methods and tools for evaluating student learning in online and hybrid course environments.',
  'Explore assessment methods for online and hybrid courses.',
  'https://example.com/assessment-course',
  35,
  true,
  4,
  ARRAY['assessment', 'online']
),
(
  'Using AI Tools in Education',
  'ai-in-education',
  'Discover how to effectively and ethically integrate AI tools into your teaching practice, from course design to student support.',
  'Integrate AI tools ethically into your teaching practice.',
  'https://example.com/ai-education',
  40,
  true,
  5,
  ARRAY['technology', 'AI']
);

-- Sample pathway
INSERT INTO pathways (title, slug, description, badge_name, badge_color, is_published, sort_order) VALUES
(
  'Digital Accessibility Champion',
  'accessibility-champion',
  'Complete this pathway to demonstrate your commitment to creating accessible and inclusive learning experiences for all students.',
  'Accessibility Champion',
  '#1F5A96',
  true,
  1
);

-- Link courses to the pathway
INSERT INTO pathway_courses (pathway_id, course_id, sort_order)
SELECT
  p.id,
  c.id,
  c.sort_order
FROM pathways p, courses c
WHERE p.slug = 'accessibility-champion'
  AND c.slug IN ('intro-udl', 'accessible-documents');
