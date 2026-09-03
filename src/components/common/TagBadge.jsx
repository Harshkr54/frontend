import { Tag as TagIcon } from 'lucide-react';

export function TagBadge({ tag, onRemove }) {
  if (!tag) return null;
  const color = tag.colorHex || '#3B82F6';

  return (
    <span
      style={{
        backgroundColor: `${color}18`,
        color: color,
        borderColor: `${color}40`,
      }}
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-tight backdrop-blur-xs transition"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="truncate max-w-[80px]">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-0.5 hover:opacity-75 cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
}

export default TagBadge;
