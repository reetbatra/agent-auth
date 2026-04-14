'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/lib/utils';

type Filter = 'all' | 'human' | 'agent' | 'denied';

interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  code: string;
  actor: string;
  actorType: 'human' | 'agent';
  success: boolean;
  ip: string | null;
  clientName: string | null;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'human', label: 'Human' },
  { key: 'agent', label: 'Agent' },
  { key: 'denied', label: 'Denied' },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to fetch logs');
        return;
      }
      const data = await res.json();
      setLogs(data);
      setLastRefresh(new Date());
      setError(null);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 15000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  const filtered = logs.filter((log) => {
    if (filter === 'human') return log.actorType === 'human';
    if (filter === 'agent') return log.actorType === 'agent';
    if (filter === 'denied') return !log.success;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Identity Audit Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lastRefresh
                ? `Updated ${timeAgo(lastRefresh.toISOString())} · auto-refreshes every 15s`
                : 'Loading…'}
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {logs.filter((l) =>
                    f.key === 'human' ? l.actorType === 'human'
                    : f.key === 'agent' ? l.actorType === 'agent'
                    : !l.success
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-600">{error}</div>
        )}

        {/* Denied hint */}
        {filter === 'denied' && !loading && filtered.length === 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 leading-relaxed">
            No denied events yet. Go to <strong>AI Agents</strong>, authenticate Agent Reader, then click <strong>Write Resource</strong> — that will generate a denied event here.
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div key={log.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-base mt-0.5 shrink-0">{log.actorType === 'human' ? '👤' : '🤖'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">{log.event}</span>
                    <Badge variant={log.success ? 'secondary' : 'destructive'} className="text-[10px]">
                      {log.success ? 'success' : 'denied'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {log.clientName && log.clientName !== log.actor
                      ? `${log.actor} via ${log.clientName}`
                      : log.actor}
                    {log.ip ? ` · ${log.ip}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-gray-300 shrink-0 mt-1 tabular-nums">{timeAgo(log.timestamp)}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && filter !== 'denied' && (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">No events found</p>
          </div>
        )}

      </main>
    </div>
  );
}
