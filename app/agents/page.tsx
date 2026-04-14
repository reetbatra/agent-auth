'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type AgentType = 'reader' | 'writer';
type ActionType = 'read' | 'write';

interface AgentState {
  token: string | null;
  loading: boolean;
  result: { allowed: boolean; reason: string } | null;
  actionLoading: boolean;
  showRawToken: boolean;
}

function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const AGENTS: { type: AgentType; name: string; scopes: string[]; description: string }[] = [
  { type: 'reader', name: 'Agent Reader', scopes: ['data:read'], description: 'Read-only. Write access is blocked.' },
  { type: 'writer', name: 'Agent Writer', scopes: ['data:read', 'data:write'], description: 'Full read and write access.' },
];

export default function AgentsPage() {
  const [states, setStates] = useState<Record<AgentType, AgentState>>({
    reader: { token: null, loading: false, result: null, actionLoading: false, showRawToken: false },
    writer: { token: null, loading: false, result: null, actionLoading: false, showRawToken: false },
  });

  const update = (agent: AgentType, patch: Partial<AgentState>) =>
    setStates((s) => ({ ...s, [agent]: { ...s[agent], ...patch } }));

  const fetchToken = async (agent: AgentType) => {
    update(agent, { loading: true, result: null, token: null });
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
      body: JSON.stringify({ token, action, agentName: agent === 'reader' ? 'Agent Reader' : 'Agent Writer' }),
    });
    const data = await res.json();
    update(agent, { actionLoading: false, result: data });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h2 className="text-sm font-semibold text-gray-900">AI Agent Panel</h2>
          <p className="text-xs text-gray-400 mt-0.5">Machine identities authenticated via Auth0 client credentials grant</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
          Each agent is a machine identity in Auth0. Authenticate it to get an access token, then try an action. The token&apos;s scopes determine what&apos;s allowed — scope checks happen server-side and are logged to the audit trail.
        </div>

        {AGENTS.map((agent) => {
          const state = states[agent.type];
          const payload = state.token ? parseJwt(state.token) : null;
          const scopes: string[] = payload?.scope?.split(' ') ?? [];
          const expiresIn = payload ? payload.exp - Math.floor(Date.now() / 1000) : null;

          return (
            <Card key={agent.type} className="shadow-none border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{agent.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {agent.scopes.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs font-mono">{s}</Badge>
                  ))}
                </div>
              </div>

              <CardContent className="p-5 space-y-5">
                {/* Step 1 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold shrink-0">1</span>
                      <span className="text-sm font-medium text-gray-700">Authenticate with Auth0</span>
                    </div>
                    <Button size="sm" className="text-xs cursor-pointer" onClick={() => fetchToken(agent.type)} disabled={state.loading}>
                      {state.loading ? 'Fetching…' : state.token ? 'Re-authenticate' : 'Authenticate'}
                    </Button>
                  </div>

                  {state.token && payload ? (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-xs font-medium text-green-700">Token Active</span>
                        </div>
                        {expiresIn !== null && (
                          <span className="text-xs text-green-600">Expires in {expiresIn}s</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {scopes.map((s) => (
                          <span key={s} className="bg-white border border-green-200 text-green-700 text-[10px] font-mono px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                      <button onClick={() => update(agent.type, { showRawToken: !state.showRawToken })} className="text-[10px] text-green-600 underline cursor-pointer">
                        {state.showRawToken ? 'Hide raw JWT' : 'Show raw JWT'}
                      </button>
                      {state.showRawToken && (
                        <pre className="bg-white border border-green-100 rounded p-2 text-[10px] text-gray-500 overflow-auto whitespace-pre-wrap break-all font-mono max-h-20">
                          {state.token}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3 text-xs text-gray-400 text-center">
                      No token yet — click Authenticate
                    </div>
                  )}
                </div>

                {/* Step 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center font-bold shrink-0">2</span>
                    <span className="text-sm font-medium text-gray-700">Try an action</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['read', 'write'] as ActionType[]).map((action) => (
                      <button
                        key={action}
                        onClick={() => runAction(agent.type, action)}
                        disabled={!state.token || state.actionLoading}
                        className="border border-gray-200 rounded-lg p-3 text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <p className="text-xs font-medium text-gray-700 capitalize">{action} Resource</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Requires <span className="font-mono">data:{action}</span></p>
                      </button>
                    ))}
                  </div>

                  {state.result && (
                    <div className={`rounded-lg p-3 flex items-start gap-3 ${state.result.allowed ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                      <span className={`text-base leading-none ${state.result.allowed ? 'text-green-500' : 'text-red-500'}`}>
                        {state.result.allowed ? '✓' : '✗'}
                      </span>
                      <div>
                        <p className={`text-xs font-semibold ${state.result.allowed ? 'text-green-700' : 'text-red-700'}`}>
                          {state.result.allowed ? 'Access granted' : 'Access denied'}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${state.result.allowed ? 'text-green-600' : 'text-red-600'}`}>
                          {state.result.reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
