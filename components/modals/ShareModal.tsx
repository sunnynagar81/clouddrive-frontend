'use client';
import { useState } from 'react';
import { sharesApi } from '@/lib/api';
import { X, Link, Copy, Check, Loader2 } from 'lucide-react';

interface ShareModalProps {
  resource: { id: string; name: string };
  resourceType: 'file' | 'folder';
  onClose: () => void;
}

export function ShareModal({ resource, resourceType, onClose }: ShareModalProps) {
  const [linkLoading, setLinkLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateLink = async () => {
    setLinkLoading(true);
    try {
      const res = await sharesApi.createLink({
        resourceType,
        resourceId: resource.id,
      });
      setShareLink(
        `${window.location.origin}/share/${res.data.link.token}`
      );
    } catch {
      setError('Failed to generate link');
    } finally {
      setLinkLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Share &quot;{resource.name}&quot;
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Link className="w-4 h-4" /> Shareable link
          </label>
          {shareLink ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold flex items-center gap-1.5"
              >
                {copied
                  ? <Check className="w-4 h-4 text-green-600" />
                  : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <button
              onClick={generateLink}
              disabled={linkLoading}
              className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              {linkLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Link className="w-4 h-4" />}
              Generate public link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}