'use client';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api';
import { Sidebar } from '@/components/layout/layout/Sidebar';
import { Star, File, Folder, Loader2 } from 'lucide-react';

interface StarItem {
  id: string;
  name: string;
  created_at: string;
  type: 'file' | 'folder';
}

export default function StarredPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stars'],
    queryFn: () => searchApi.getStars().then((r) => r.data.starred),
  });

  const allItems: StarItem[] = [
    ...(data?.folders ?? []).map((f: Omit<StarItem, 'type'>) => ({ ...f, type: 'folder' as const })),
    ...(data?.files ?? []).map((f: Omit<StarItem, 'type'>) => ({ ...f, type: 'file' as const })),
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-60 flex-1 px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-slate-800">Starred</h1>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Star className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-slate-600 font-semibold">No starred items</h3>
            <p className="text-slate-400 text-sm mt-1">Star files to find them quickly</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {allItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50"
              >
                {item.type === 'folder'
                  ? <Folder className="w-5 h-5 text-yellow-500" />
                  : <File className="w-5 h-5 text-blue-500" />}
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                  {item.name}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}