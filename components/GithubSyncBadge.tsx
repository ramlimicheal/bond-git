import React, { useEffect, useState } from 'react';
import { Icons } from './Icon';

const REPO = 'ramlimicheal/bond-git';
const API = `https://api.github.com/repos/${REPO}/commits?per_page=1`;

type Commit = { sha: string; message: string; date: string };
type Status = 'loading' | 'ok' | 'error';

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const GithubSyncBadge: React.FC = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [commit, setCommit] = useState<Commit | null>(null);

  const load = async () => {
    setStatus('loading');
    try {
      const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(String(res.status));
      const rows = await res.json();
      const c = rows[0];
      setCommit({
        sha: c.sha.slice(0, 7),
        message: (c.commit.message || '').split('\n')[0].slice(0, 60),
        date: c.commit.author?.date ?? c.commit.committer?.date,
      });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const dot =
    status === 'ok' ? 'bg-emerald-500' : status === 'loading' ? 'bg-amber-500 animate-pulse' : 'bg-red-500';
  const label =
    status === 'ok' ? 'Synced' : status === 'loading' ? 'Checking…' : 'Sync error';

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-2 flex items-center gap-2 px-2 py-2 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      title={commit ? `${commit.sha} · ${commit.message}` : 'GitHub sync status'}
    >
      <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">GitHub · {label}</span>
          <button
            onClick={(e) => { e.preventDefault(); load(); }}
            className="text-[10px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            title="Refresh"
          >
            <Icons.RefreshCw size={11} />
          </button>
        </div>
        {commit ? (
          <div className="text-[10px] text-gray-500 dark:text-gray-500 truncate">
            {commit.sha} · {timeAgo(commit.date)}
          </div>
        ) : (
          <div className="text-[10px] text-gray-500 dark:text-gray-500 truncate">
            {status === 'error' ? 'Could not reach GitHub' : 'Loading latest commit…'}
          </div>
        )}
      </div>
    </a>
  );
};

export default GithubSyncBadge;