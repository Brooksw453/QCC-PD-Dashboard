-- Add format column to courses table
ALTER TABLE courses ADD COLUMN format TEXT DEFAULT 'webpage';

-- Update existing courses to have a default format
UPDATE courses SET format = 'webpage' WHERE format IS NULL;
