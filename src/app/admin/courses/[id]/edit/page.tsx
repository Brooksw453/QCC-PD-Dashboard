import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CourseForm from '@/components/admin/CourseForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (!course) notFound();

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark mb-6">Edit Course</h2>
      <CourseForm course={course} />
    </div>
  );
}
