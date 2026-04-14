'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AgentType = 'reader' | 'writer';
type ActionType = 'read' | 'write';

interface AgentState {
  token: string | null;
  loading: boolean;
  result: { allowed: boolean; reason: string; scopes: string[] } | null;
  actionLoading: boolean;
}

const AGENTS: { type: AgentType; name: string; icon: string; scopes: string[]; description: string }[] = [
  {
    type: 'reader',
    name: 'Agent Reader',
    icon: '📖',
    scopes: ['data:read'],
    description: 'Read-only agent. Can fetch data but cannot modify anything.',
  },
  {
    type: 'writer',
    name: 'Agent Writer',
    icon: '✍️',
    scopes: ['data:read', 'data:write'],
    description: 'Read + write agent. Full access to data operations.',
  },
];

export default function AgentsPage() {
  const [states, setStates] = useState<Record<AgentType, AgentState>>({
    reader: { token: null, loading: false, result: null, actionLoading: false },
    writer: { token: null, loading: false, result: null, actionLoading: false },
  });

  const update = (agent: AgentType, patch: Partial<AgentState>) =>
    setStates((s) => ({ ...s, [agent]: { ...s[agent], ...patch } }));

  const fetchToken = async (agent: AgentType) => {
    update(agent, { loading: true, result: null });
    const res = await fetch('/api/agent/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent }),
    });
    const data = await res.json();
    update(agent, { loading: false, token: data.access_token ?? null });
  };

  const runAction = async (agent: AgentType, action: ActionType) => {
    const token = states[agent].token;
    if (!token) return;
    update(agent, { actionLoading: true, result: null });
    const res = await fetch('/api/agent/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    });
    const data = await res.json();
    update(agent, { actionLoading: false, result: data });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Nav */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Agent<span className="text-blue-600">Auth</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">AI Agent Panel — Screen 2 of 3</p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">Profile</Button>
            </Link>
            <Link href="/audit">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">Audit Log</Button>
            </Link>
          </div>
        </div>

        {/* Agent Cards */}
        {AGENTS.map((agent) => {
          const state = states[agent.type];
          return (
            <Card key={agent.type} className="shadow-none border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{agent.icon}</span>
                    {agent.name}
                  </span>
                  <div className="flex gap-1">
                    {agent.scopes.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs font-mono">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardTitle>
                <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Token section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Access Token</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 cursor-pointer"
                      onClick={() => fetchToken(agent.type)}
                      disabled={state.loading}
                    >
                      {state.loading ? 'Fetching…' : 'Fetch Token'}
                    </Button>
                  </div>

                  {state.token && (
                    <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-[10px] leading-relaxed text-gray-600 overflow-auto whitespace-pre-wrap break-all font-mono max-h-24">
                      {state.token}
                    </pre>
                  )}

                  {!state.token && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-400 text-center">
                      No token yet — click Fetch Token
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-500">Try an action</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-xs cursor-pointer"
                      onClick={() => runAction(agent.type, 'read')}
                      disabled={!state.token || state.actionLoading}
                    >
                      Read Resource
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => runAction(agent.type, 'write')}
                      disabled={!state.token || state.actionLoading}
                    >
                      Write Resource
                    </Button>
                  </div>

                  {state.result && (
                    <div className={`rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${
                      state.result.allowed
                        ? 'bg-green-50 border border-green-100 text-green-700'
                        : 'bg-red-50 border border-red-100 text-red-700'
                    }`}>
                      <span>{state.result.allowed ? '✓' : '✗'}</span>
                      <div>
                        <p className="font-medium">{state.result.allowed ? 'Allowed' : 'Denied'}</p>
                        <p className="text-xs opacity-75">{state.result.reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

      </div>
    </main>
  );
}
