'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

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

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'human', label: 'Human' },
    { key: 'agent', label: 'Agent' },
    { key: 'denied', label: 'Denied' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">
            Agent<span className="text-blue-600">Auth</span>
          </p>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">Profile</Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">AI Agents</Button>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Identity Audit Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lastRefresh ? `Last updated ${timeAgo(lastRefresh.toISOString())} · auto-refreshes every 15s` : 'Loading…'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs cursor-pointer"
            onClick={fetchLogs}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((f) => (
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
            </button>
          ))}
        </div>

        {/* Log timeline */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">No events found</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                {/* Actor icon */}
                <span className="text-lg mt-0.5 shrink-0">
                  {log.actorType === 'human' ? '👤' : '🤖'}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">{log.event}</span>
                    <Badge
                      variant={log.success ? 'secondary' : 'destructive'}
                      className="text-[10px]"
                    >
                      {log.success ? 'success' : 'failed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {log.clientName ? `${log.actor} via ${log.clientName}` : log.actor}
                    {log.ip ? ` · ${log.ip}` : ''}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-gray-300 shrink-0 mt-1">
                  {timeAgo(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
