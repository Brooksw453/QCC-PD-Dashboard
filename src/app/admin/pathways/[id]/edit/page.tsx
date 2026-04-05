import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PathwayForm from '@/components/admin/PathwayForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPathwayPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pathway } = await supabase
    .from('pathways')
    .select('*')
    .eq('id', id)
    .single();

  if (!pathway) notFound();

  const { data: pathwayCourses } = await supabase
    .from('pathway_courses')
    .select('course_id')
    .eq('pathway_id', id)
    .order('sort_order');

  const assignedCourseIds = pathwayCourses?.map(pc => pc.course_id) || [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark mb-6">Edit Pathway</h2>
      <PathwayForm pathway={pathway} assignedCourseIds={assignedCourseIds} />
    </div>
  );
}
