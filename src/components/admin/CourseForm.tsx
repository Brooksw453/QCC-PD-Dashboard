'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Course } from '@/lib/types';

interface CourseFormProps {
  course?: Course;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CourseForm({ course }: CourseFormProps) {
  const isEditing = !!course;
  const [form, setForm] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    description: course?.description || '',
    short_description: course?.short_description || '',
    external_url: course?.external_url || '',
    image_url: course?.image_url || '',
    estimated_minutes: course?.estimated_minutes?.toString() || '',
    tags: course?.tags?.join(', ') || '',
    is_published: course?.is_published || false,
    sort_order: course?.sort_order?.toString() || '0',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      ...(!isEditing ? { slug: slugify(title) } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      short_description: form.short_description,
      external_url: form.external_url,
      image_url: form.image_url || null,
      estimated_minutes: form.estimated_minutes ? parseInt(form.estimated_minutes) : null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_published: form.is_published,
      sort_order: parseInt(form.sort_order) || 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEditing) {
      result = await supabase.from('courses').update(data).eq('id', course.id);
    } else {
      result = await supabase.from('courses').insert(data);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      router.push('/admin/courses');
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !confirm('Are you sure you want to delete this course?')) return;
    setLoading(true);
    const { error } = await supabase.from('courses').delete().eq('id', course.id);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin/courses');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          placeholder="Course title"
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
          placeholder="course-slug"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">Short Description</label>
        <input
          type="text"
          value={form.short_description}
          onChange={(e) => setForm(prev => ({ ...prev, short_description: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          placeholder="One-line description for cards"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">Full Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          placeholder="Detailed description shown on the course page"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">
          External URL <span className="text-qcc-gray font-normal">(Articulate Rise link)</span>
        </label>
        <input
          type="url"
          value={form.external_url}
          onChange={(e) => setForm(prev => ({ ...prev, external_url: e.target.value }))}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          placeholder="https://rise.articulate.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">
          Image URL <span className="text-qcc-gray font-normal">(optional)</span>
        </label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-qcc-dark mb-1">Estimated Minutes</label>
          <input
            type="number"
            value={form.estimated_minutes}
            onChange={(e) => setForm(prev => ({ ...prev, estimated_minutes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-qcc-dark mb-1">Sort Order</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm(prev => ({ ...prev, sort_order: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-qcc-dark mb-1">
          Tags <span className="text-qcc-gray font-normal">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-qcc-sky focus:border-transparent"
          placeholder="accessibility, teaching, technology"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_published"
          checked={form.is_published}
          onChange={(e) => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300 text-qcc-blue focus:ring-qcc-sky"
        />
        <label htmlFor="is_published" className="text-sm font-medium text-qcc-dark">Published</label>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-qcc-blue text-white rounded-lg font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
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
