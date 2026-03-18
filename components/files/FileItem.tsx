'use client';
import { useState } from 'react';
import {
  File, FileImage, FileText, FileVideo, Folder,
  MoreVertical, Download, Pencil, Trash2, Star, Share2,
} from 'lucide-react';

function getFileIcon(mimeType?: string) {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.includes('text')) return FileText;
  return File;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileItemProps {
  item: Record<string, unknown>;
  type: 'file' | 'folder';
  viewMode: 'grid' | 'list';
  onOpen?: (item: Record<string, unknown>) => void;
  onRename?: (item: Record<string, unknown>) => void;
  onDelete?: (item: Record<string, unknown>) => void;
  onShare?: (item: Record<string, unknown>) => void;
  onDownload?: (item: Record<string, unknown>) => void;
  onStar?: (item: Record<string, unknown>) => void;
}

export function FileItem({
  item, type, viewMode,
  onOpen, onRename, onDelete, onShare, onDownload, onStar,
}: FileItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = type === 'folder' ? Folder : getFileIcon(item.mime_type as string);
  const iconColor = type === 'folder' ? 'text-yellow-500' : 'text-blue-500';

  const menu = menuOpen && (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
        {onStar && (
          <button onClick={() => { setMenuOpen(false); onStar(item); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Star className="w-4 h-4" /> Star
          </button>
        )}
        {onShare && (
          <button onClick={() => { setMenuOpen(false); onShare(item); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Share2 className="w-4 h-4" /> Share
          </button>
        )}
        {onDownload && (
          <button onClick={() => { setMenuOpen(false); onDownload(item); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Download
          </button>
        )}
        {onRename && (
          <button onClick={() => { setMenuOpen(false); onRename(item); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Pencil className="w-4 h-4" /> Rename
          </button>
        )}
        <div className="border-t border-slate-100 my-1" />
        {onDelete && (
          <button onClick={() => { setMenuOpen(false); onDelete(item); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        )}
      </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer group relative"
        onDoubleClick={() => onOpen?.(item)}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        <span className="flex-1 text-sm text-slate-800 truncate font-medium">
          {item.name as string}
        </span>
        {type === 'file' && (
          <span className="text-xs text-slate-400 w-20 text-right">
            {formatBytes(item.size_bytes as number)}
          </span>
        )}
        <span className="text-xs text-slate-400 w-28 text-right">
          {new Date(item.created_at as string).toLocaleDateString()}
        </span>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-lg"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
          {menu}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-2 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer group relative border border-transparent hover:border-slate-200 transition-all"
      onDoubleClick={() => onOpen?.(item)}
    >
      <div className="relative">
        <Icon className={`w-12 h-12 ${iconColor}`} />
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-white shadow-md p-1 rounded-lg"
        >
          <MoreVertical className="w-3 h-3 text-slate-500" />
        </button>
      </div>
      <span className="text-xs text-slate-700 font-medium text-center max-w-[100px] truncate">
        {item.name as string}
      </span>
      {type === 'file' && (
        <span className="text-xs text-slate-400">
          {formatBytes(item.size_bytes as number)}
        </span>
      )}
      {menu}
    </div>
  );
}