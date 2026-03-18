'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface DropzoneWrapperProps {
  onDrop: (files: File[]) => void;
  uploads: UploadItem[];
  onClearDone: () => void;
  children: React.ReactNode;
}

export function DropzoneWrapper({
  onDrop, uploads, onClearDone, children,
}: DropzoneWrapperProps) {
  const handleDrop = useCallback(
    (files: File[]) => { onDrop(files); },
    [onDrop]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    noClick: true,
  });

  return (
    <div {...getRootProps()} className="relative flex-1">
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="absolute inset-0 bg-blue-50 border-2 border-dashed border-blue-400 rounded-2xl z-30 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-blue-700">
              Drop files here to upload
            </p>
          </div>
        </div>
      )}
      {children}
      {uploads.length > 0 && (
        <div className="fixed bottom-6 right-6 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Uploads</span>
            <button
              onClick={onClearDone}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Clear done
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0"
              >
                <div className="flex-shrink-0">
                  {upload.status === 'done' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {upload.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {upload.name}
                  </p>
                  {upload.status === 'uploading' && (
                    <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-red-500 mt-0.5">{upload.error}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {upload.status === 'uploading'
                    ? `${upload.progress}%`
                    : upload.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}