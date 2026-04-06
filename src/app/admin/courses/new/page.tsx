import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-qcc-dark mb-6">Create New Learning Item</h2>
      <CourseForm />
    </div>
  );
}
