'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api';
import { Sidebar } from '@/components/layout/layout/Sidebar';
import { Trash2, RotateCcw, File, Folder, Loader2 } from 'lucide-react';

interface TrashItem {
  id: string;
  name: string;
  updated_at: string;
  type: 'file' | 'folder';
}

export default function TrashPage() {
  const [restoring, setRestoring] = useState<string | null>(null);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trash'],
    queryFn: () => searchApi.getTrash().then((r) => r.data.trash),
  });

  const handleRestore = async (type: string, id: string) => {
    setRestoring(id);
    await searchApi.restore(type, id);
    setRestoring(null);
    refetch();
  };

  const allItems: TrashItem[] = [
    ...(data?.folders ?? []).map((f: Omit<TrashItem, 'type'>) => ({ ...f, type: 'folder' as const })),
    ...(data?.files ?? []).map((f: Omit<TrashItem, 'type'>) => ({ ...f, type: 'file' as const })),
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-60 flex-1 px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Trash2 className="w-6 h-6 text-slate-500" />
          <h1 className="text-2xl font-bold text-slate-800">Trash</h1>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Trash2 className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-slate-600 font-semibold">Trash is empty</h3>
            <p className="text-slate-400 text-sm mt-1">
              Deleted files appear here for 30 days
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {allItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50"
              >
                {item.type === 'folder'
                  ? <Folder className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  : <File className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.updated_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRestore(item.type, item.id)}
                  disabled={restoring === item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  {restoring === item.id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <RotateCcw className="w-3 h-3" />}
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}