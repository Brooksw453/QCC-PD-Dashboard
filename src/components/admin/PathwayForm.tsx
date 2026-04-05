'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Pathway, Course } from '@/lib/types';

interface PathwayFormProps {
  pathway?: Pathway;
  assignedCourseIds?: string[];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PathwayForm({ pathway, assignedCourseIds = [] }: PathwayFormProps) {
  const isEditing = !!pathway;
  const [form, setForm] = useState({
    title: pathway?.title || '',
    slug: pathway?.slug || '',
    description: pathway?.description || '',
    badge_name: pathway?.badge_name || '',
    badge_color: pathway?.badge_color || '#1F5A96',
    badge_image_url: pathway?.badge_image_url || '',
    is_published: pathway?.is_published || false,
    sort_order: pathway?.sort_order?.toString() || '0',
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(assignedCourseIds);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.from('courses').select('*').order('sort_order').then(({ data }) => {
      if (data) setAllCourses(data);
    });
  }, []);

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      ...(!isEditing ? { slug: slugify(title) } : {}),
    }));
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      badge_name: form.badge_name,
      badge_color: form.badge_color,
      badge_image_url: form.badge_image_url || null,
      is_published: form.is_published,
      sort_order: parseInt(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    let pathwayId = pathway?.id;

    if (isEditing) {
      const { error } = await supabase.from('pathways').update(data).eq('id', pathway.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { data: newPathway, error } = await supabase.from('pathways').insert(data).select().single();
      if (error) { setError(error.message); setLoading(false); return; }
      pathwayId = newPathway.id;
    }

    // Update pathway_courses
    if (pathwayId) {
      await supabase.from('pathway_courses').delete().eq('pathway_id', pathwayId);
      if (selectedCourseIds.length > 0) {
        const inserts = selectedCourseIds.map((courseId, index) => ({
          pathway_id: pathwayId,
          course_id: courseId,
          sort_order: index,
        }));
        const { error } = await supabase.from('pathway_courses').insert(inserts);
        if (error) { setError(error.message); setLoading(false); return; }
      }
    }

    router.push('/admin/pathways');
    router.refresh();
  };

  const handleDelete = async () => {
    if (!isEditing || !confirm('Are you sure you want to delete this pathway?')) return;
    setLoading(true);
    const { error } = await supabase.from('pathways').delete().eq('id', pathway.id);
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/admin/pathways');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-qcc-dark mb-1">Badge Name</label>
          <input
            type="text"
            value={form.badge_name}
            onChange={(e) => setForm(prev => ({ ...prev, badge_name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="e.g. Accessibility Champion"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-qcc-dark mb-1">Badge Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.badge_color}
              onChange={(e) => setForm(prev => ({ ...prev, badge_color: e.target.value }))}
              className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={form.badge_color}
              onChange={(e) => setForm(prev => ({ ...prev, badge_color: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-qcc-dark mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm(prev => ({ ...prev, sort_order: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-qcc-blue focus:ring-qcc-sky"
            />
            <span className="text-sm font-medium text-qcc-dark">Published</span>
          </label>
        </div>
      </div>

      {/* Course Assignment */}
      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-2">
          Courses in Pathway <span className="text-qcc-gray font-normal">({selectedCourseIds.length} selected)</span>
        </label>
        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
          {allCourses.map((course) => (
            <label
              key={course.id}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCourseIds.includes(course.id)}
                onChange={() => toggleCourse(course.id)}
                className="w-4 h-4 rounded border-gray-300 text-qcc-blue focus:ring-qcc-sky"
              />
              <span className="text-sm text-qcc-dark">{course.title}</span>
              {!course.is_published && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Draft</span>
              )}
            </label>
          ))}
          {allCourses.length === 0 && (
            <p className="text-sm text-qcc-gray px-3 py-4 text-center">No courses available. Create courses first.</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-qcc-blue text-white rounded-lg font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Pathway' : 'Create Pathway'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
