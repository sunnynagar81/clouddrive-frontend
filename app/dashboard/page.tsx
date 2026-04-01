/* eslint-disable */
'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { foldersApi, filesApi, searchApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useUpload } from '@/hooks/useUpload';
import { Sidebar } from '@/components/layout/layout/Sidebar';
import { FileItem } from '@/components/files/FileItem';
import { DropzoneWrapper } from '@/components/files/DropzoneWrapper';
import { ShareModal } from '@/components/modals/ShareModal';
import {
  Upload, Grid3X3, List, Search,
  FolderPlus, Loader2, ChevronRight, Home,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [folderId, setFolderId] = useState('root');
  const [path, setPath] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQ, setSearchQ] = useState('');
  const [shareTarget, setShareTarget] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  const { uploads, uploadFiles, clearDone } = useUpload(
    folderId === 'root' ? null : folderId
  );

  useEffect(() => {
  if (!authLoading && !user) router.push('/login');
}, [authLoading, user, router]);

  const { data: folderData, isLoading, refetch } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: () => foldersApi.get(folderId).then((r) => r.data),
    enabled: !!user,
  });

  const { data: searchData } = useQuery({
    queryKey: ['search', searchQ],
    queryFn: () => searchApi.search(searchQ).then((r) => r.data.results),
    enabled: searchQ.length > 1,
  });

  const handleOpenFolder = (folder: any) => {
    setFolderId(folder.id);
    setPath((prev) => [...prev, folder]);
  };

  const handleBreadcrumb = (index: number) => {
    if (index === -1) {
      setFolderId('root');
      setPath([]);
    } else {
      setFolderId(path[index].id);
      setPath(path.slice(0, index + 1));
    }
  };

  const handleDownload = async (file: any) => {
    const res = await filesApi.get(file.id);
    window.open(res.data.signedUrl, '_blank');
  };

  const handleDelete = async (item: any, type: string) => {
    if (!confirm(`Move "${item.name}" to trash?`)) return;
    if (type === 'file') await filesApi.delete(item.id);
    else await foldersApi.delete(item.id);
    refetch();
  };

  const handleRename = async (item: any, type: string) => {
    const newName = prompt('New name:', item.name);
    if (!newName || newName === item.name) return;
    if (type === 'file') await filesApi.update(item.id, { name: newName });
    else await foldersApi.update(item.id, { name: newName });
    refetch();
  };

  const handleNewFolder = async () => {
    if (!newFolderName.trim()) return;
    await foldersApi.create({
      name: newFolderName.trim(),
      parentId: folderId === 'root' ? null : folderId,
    });
    setNewFolderName('');
    setShowNewFolder(false);
    refetch();
  };

  const displayFolders = searchQ.length > 1
    ? (searchData as any)?.folders ?? []
    : (folderData as any)?.children?.folders ?? [];

  const displayFiles = searchQ.length > 1
    ? (searchData as any)?.files ?? []
    : (folderData as any)?.children?.files ?? [];

  const isEmpty = displayFolders.length === 0 && displayFiles.length === 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <DropzoneWrapper
        onDrop={(files: File[]) => {
          uploadFiles(files);
          setTimeout(refetch, 2000);
        }}
        uploads={uploads}
        onClearDone={clearDone}
      >
        <main className="ml-60 flex-1 flex flex-col h-screen overflow-hidden">

          {/* Topbar */}
          <div className="flex items-center gap-4 px-8 py-4 bg-white border-b border-slate-100">
            <div className="flex-1 max-w-lg relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewMode((v) => v === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                {viewMode === 'grid'
                  ? <List className="w-4 h-4 text-slate-600" />
                  : <Grid3X3 className="w-4 h-4 text-slate-600" />}
              </button>
              <button
                onClick={() => setShowNewFolder(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FolderPlus className="w-4 h-4" /> New folder
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white cursor-pointer">
                <Upload className="w-4 h-4" /> Upload
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    uploadFiles(files);
                    setTimeout(refetch, 2000);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>

          {/* New Folder Input */}
          {showNewFolder && (
            <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewFolder();
                  if (e.key === 'Escape') setShowNewFolder(false);
                }}
                placeholder="Folder name"
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNewFolder}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewFolder(false)}
                className="px-3 py-1.5 text-slate-600 text-sm hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Breadcrumb */}
          {!searchQ && (
            <div className="flex items-center gap-1.5 px-8 py-3 text-sm">
              <button
                onClick={() => handleBreadcrumb(-1)}
                className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
              >
                <Home className="w-3.5 h-3.5" /> My Drive
              </button>
              {path.map((folder, i) => (
                <span key={folder.id} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => handleBreadcrumb(i)}
                    className={
                      i === path.length - 1
                        ? 'text-slate-800 font-semibold'
                        : 'text-blue-600 hover:underline'
                    }
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderPlus className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-700 font-semibold mb-1">
                  {searchQ ? 'No results found' : 'This folder is empty'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {searchQ ? 'Try a different term' : 'Drop files here or click Upload'}
                </p>
              </div>
            ) : (
              <>
                {displayFolders.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Folders
                    </h2>
                    <div className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2'
                        : 'space-y-0.5'
                    }>
                      {displayFolders.map((folder: any) => (
                        <FileItem
                          key={folder.id}
                          item={folder}
                          type="folder"
                          viewMode={viewMode}
                          onOpen={handleOpenFolder}
                          onRename={(item) => handleRename(item, 'folder')}
                          onDelete={(item) => handleDelete(item, 'folder')}
                          onShare={(item) => setShareTarget({ item, type: 'folder' })}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {displayFiles.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Files
                    </h2>
                    <div className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2'
                        : 'space-y-0.5'
                    }>
                      {displayFiles.map((file: any) => (
                        <FileItem
                          key={file.id}
                          item={file}
                          type="file"
                          viewMode={viewMode}
                          onDownload={handleDownload}
                          onRename={(item) => handleRename(item, 'file')}
                          onDelete={(item) => handleDelete(item, 'file')}
                          onShare={(item) => setShareTarget({ item, type: 'file' })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </DropzoneWrapper>

      {shareTarget && (
        <ShareModal
          resource={shareTarget.item}
          resourceType={shareTarget.type}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}