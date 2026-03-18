import { useState } from 'react';
import axios from 'axios';
import { filesApi } from '@/lib/api';

interface UploadFile {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export function useUpload(folderId?: string | null) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);

  const updateUpload = (id: string, patch: Partial<UploadFile>) =>
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );

  const uploadFile = async (file: File) => {
    const tempId = Math.random().toString(36).slice(2);
    setUploads((prev) => [
      ...prev,
      { id: tempId, name: file.name, progress: 0, status: 'uploading' },
    ]);
    try {
      const initRes = await filesApi.init({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        folderId: folderId || null,
      });
      const { fileId, uploadUrl } = initRes.data;
      updateUpload(tempId, { id: fileId });

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / (e.total || file.size));
          updateUpload(fileId, { progress: pct });
        },
      });

      await filesApi.complete(fileId);
      updateUpload(fileId, { status: 'done', progress: 100 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      updateUpload(tempId, { status: 'error', error: message });
    }
  };

  const uploadFiles = async (files: File[]) => {
    await Promise.all(files.map(uploadFile));
  };

  const clearDone = () =>
    setUploads((prev) => prev.filter((u) => u.status !== 'done'));

  return { uploads, uploadFiles, clearDone };
}