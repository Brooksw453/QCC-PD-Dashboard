-- QCC PD Dashboard: Auto-issue badges on pathway completion
-- Run this in the Supabase SQL editor AFTER 001 and 002

CREATE OR REPLACE FUNCTION check_and_issue_badge()
RETURNS TRIGGER AS $$
DECLARE
  pathway RECORD;
  total_courses INTEGER;
  completed_courses INTEGER;
BEGIN
  -- For each pathway that contains the newly completed course
  FOR pathway IN
    SELECT pc.pathway_id
    FROM pathway_courses pc
    WHERE pc.course_id = NEW.course_id
  LOOP
    -- Count total courses in this pathway
    SELECT COUNT(*) INTO total_courses
    FROM pathway_courses
    WHERE pathway_id = pathway.pathway_id;

    -- Count how many the user has completed
    SELECT COUNT(*) INTO completed_courses
    FROM pathway_courses pc
    INNER JOIN completions c ON c.course_id = pc.course_id AND c.user_id = NEW.user_id
    WHERE pc.pathway_id = pathway.pathway_id;

    -- If all courses completed, issue the badge
    IF completed_courses >= total_courses THEN
      INSERT INTO badges_earned (user_id, pathway_id)
      VALUES (NEW.user_id, pathway.pathway_id)
      ON CONFLICT (user_id, pathway_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_completion_check_badges
  AFTER INSERT ON completions
  FOR EACH ROW EXECUTE FUNCTION check_and_issue_badge();
