'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ParsedRow {
  title: string;
  short_description: string;
  description: string;
  external_url: string;
  estimated_minutes: string;
  tags: string;
  format: string;
  sort_order: string;
  errors: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const VALID_FORMATS = ['document', 'video', 'articulate', 'webpage', 'presentation', 'other'];

function validateRow(row: ParsedRow): string[] {
  const errors: string[] = [];
  if (!row.title) errors.push('Title is required');
  if (!row.external_url) errors.push('External URL is required');
  if (row.external_url && !row.external_url.startsWith('http')) errors.push('URL must start with http');
  if (row.format && !VALID_FORMATS.includes(row.format)) errors.push(`Invalid format: ${row.format}`);
  if (row.estimated_minutes && isNaN(parseInt(row.estimated_minutes))) errors.push('Minutes must be a number');
  return errors;
}

const TEMPLATE_CSV = `title,short_description,description,external_url,estimated_minutes,tags,format,sort_order
"Introduction to UDL","Learn Universal Design for Learning principles","Full description here","https://example.com/udl-course",45,"UDL;accessibility",articulate,1
"Creating Accessible PDFs","Making documents accessible","Full description here","https://example.com/accessible-pdfs",20,"accessibility;documents",document,2`;

export default function CsvImporter() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());

      if (lines.length < 2) {
        setError('CSV must have a header row and at least one data row.');
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      const parsed: ParsedRow[] = dataLines.map(line => {
        const cols = parseCsvLine(line);
        const row: ParsedRow = {
          title: cols[0] || '',
          short_description: cols[1] || '',
          description: cols[2] || '',
          external_url: cols[3] || '',
          estimated_minutes: cols[4] || '',
          tags: cols[5] || '',
          format: cols[6] || 'webpage',
          sort_order: cols[7] || '0',
          errors: [],
        };
        row.errors = validateRow(row);
        return row;
      });

      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.errors.length === 0);
    if (validRows.length === 0) {
      setError('No valid rows to import.');
      return;
    }

    setImporting(true);
    setError('');
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      const data = {
        title: row.title,
        slug: slugify(row.title),
        short_description: row.short_description,
        description: row.description,
        external_url: row.external_url,
        estimated_minutes: row.estimated_minutes ? parseInt(row.estimated_minutes) : null,
        tags: row.tags ? row.tags.split(';').map(t => t.trim()).filter(Boolean) : [],
        format: row.format || 'webpage',
        sort_order: parseInt(row.sort_order) || 0,
        is_published: false,
      };

      const { error } = await supabase.from('courses').insert(data);
      if (error) {
        failed++;
      } else {
        success++;
      }
    }

    setResult({ success, failed });
    setImporting(false);

    if (success > 0) {
      setTimeout(() => {
        router.push('/admin/courses');
        router.refresh();
      }, 2000);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning_items_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasErrors = rows.some(r => r.errors.length > 0);
  const validCount = rows.filter(r => r.errors.length === 0).length;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <h3 className="font-medium text-qcc-dark dark:text-white text-sm mb-2">CSV Format</h3>
        <p className="text-xs text-qcc-gray dark:text-gray-400 mb-3">
          Your CSV should have these columns: <strong>title, short_description, description, external_url, estimated_minutes, tags, format, sort_order</strong>.
          Tags should be separated with semicolons (;). Format options: document, video, articulate, webpage, presentation, other.
          All imported items will be set as drafts — publish them individually after review.
        </p>
        <button
          onClick={downloadTemplate}
          className="text-xs text-qcc-sky hover:text-qcc-sky-hover font-medium"
        >
          Download CSV template
        </button>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-qcc-dark dark:text-slate-100 mb-1">Upload CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full text-sm text-qcc-gray dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-qcc-blue file:text-white hover:file:bg-qcc-blue-hover file:cursor-pointer"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {result && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          result.failed > 0
            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        }`}>
          Imported {result.success} item{result.success !== 1 ? 's' : ''} successfully.
          {result.failed > 0 && ` ${result.failed} failed (likely duplicate slugs).`}
          {result.success > 0 && ' Redirecting to learning items...'}
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && !result && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-qcc-dark dark:text-white">
              <strong>{rows.length}</strong> rows found, <strong>{validCount}</strong> valid
            </p>
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="px-5 py-2 bg-qcc-blue text-white rounded-lg text-sm font-medium hover:bg-qcc-blue-hover transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${validCount} Item${validCount !== 1 ? 's' : ''}`}
            </button>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-3 py-2 font-medium text-qcc-gray dark:text-gray-400">Status</th>
                  <th className="text-left px-3 py-2 font-medium text-qcc-gray dark:text-gray-400">Title</th>
                  <th className="text-left px-3 py-2 font-medium text-qcc-gray dark:text-gray-400">Format</th>
                  <th className="text-left px-3 py-2 font-medium text-qcc-gray dark:text-gray-400">URL</th>
                  <th className="text-left px-3 py-2 font-medium text-qcc-gray dark:text-gray-400">Tags</th>
                  <th className="text-left px-3 py-2 font-medium text-qcc-gray dark:text-gray-400">Min</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row, i) => (
                  <tr key={i} className={row.errors.length > 0 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                    <td className="px-3 py-2">
                      {row.errors.length > 0 ? (
                        <span className="text-red-600 dark:text-red-400" title={row.errors.join(', ')}>
                          Error
                        </span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">OK</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-qcc-dark dark:text-white font-medium max-w-48 truncate">{row.title}</td>
                    <td className="px-3 py-2 text-qcc-gray dark:text-gray-400">{row.format || 'webpage'}</td>
                    <td className="px-3 py-2 text-qcc-gray dark:text-gray-400 max-w-32 truncate">{row.external_url}</td>
                    <td className="px-3 py-2 text-qcc-gray dark:text-gray-400">{row.tags}</td>
                    <td className="px-3 py-2 text-qcc-gray dark:text-gray-400">{row.estimated_minutes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
