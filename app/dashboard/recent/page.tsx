'use client';
import { useQuery } from '@tanstack/react-query';
import { searchApi, filesApi } from '@/lib/api';
import { Sidebar } from '@/components/layout/layout/Sidebar';
import { Clock, File, Download, Loader2 } from 'lucide-react';

interface RecentFile {
  id: string;
  name: string;
  size_bytes: number;
  created_at: string;
}

export default function RecentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent'],
    queryFn: () => searchApi.recent().then((r) => r.data.recent),
  });

  const handleDownload = async (file: RecentFile) => {
    const res = await filesApi.get(file.id);
    window.open(res.data.signedUrl, '_blank');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-60 flex-1 px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-slate-500" />
          <h1 className="text-2xl font-bold text-slate-800">Recent</h1>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <Clock className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-slate-600 font-semibold">No recent files</h3>
            <p className="text-slate-400 text-sm mt-1">
              Your recently uploaded files appear here
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {(data as RecentFile[]).map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 group"
              >
                <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDownload(file)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 rounded-lg"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}