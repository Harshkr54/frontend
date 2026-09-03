import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch.js';
import { EmptyState, LoadingSpinner } from '../components/common/ui.jsx';
import { formatDate } from '../utils/formatDate.js';
import { getFileIcon } from '../utils/fileIcons.js';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState(params.get('type') || 'all');
  const q = params.get('q') || '';
  const navigate = useNavigate();

  const queryParams = useMemo(() => ({ q, type: type === 'all' ? undefined : type, page: 1, limit: 40 }), [q, type]);
  const { data, isLoading, isFetching } = useSearch(queryParams, Boolean(q));

  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.files)) return [...data.files, ...(data.folders || [])];
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-900 dark:text-slate-100">Search</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{q ? `Results for "${q}"` : 'Search files and folders...'}</p>
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            const next = new URLSearchParams(params);
            if (e.target.value === 'all') next.delete('type');
            else next.set('type', e.target.value);
            setParams(next);
          }}
          className="rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 cursor-pointer outline-none focus:border-blue-500"
        >
          <option value="all">All</option>
          <option value="file">Files</option>
          <option value="folder">Folders</option>
        </select>
      </div>

      {!q && <EmptyState title="Start searching" description="Use the top search bar to find files and folders." />}
      {q && (isLoading || isFetching) && <LoadingSpinner label="Searching..." />}
      {q && !isLoading && items.length === 0 && (
        <EmptyState title="No matches" description={`No files or folders matched "${q}".`} />
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isFolder = item.resourceType === 'folder';
          const Icon = getFileIcon(item.mimeType, isFolder);
          const itemId = item._id || item.id;
          return (
            <div
              key={`${item.resourceType}-${itemId}`}
              onClick={() => {
                if (isFolder) {
                  navigate(`/drive?folder=${itemId}`);
                } else {
                  navigate('/drive');
                }
              }}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/90 dark:hover:border-slate-700 cursor-pointer"
            >
              <Icon size={22} className={isFolder ? 'text-amber-500 shrink-0' : 'text-blue-600 shrink-0'} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isFolder ? 'Folder' : item.mimeType || 'File'} · {formatDate(item.updatedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
