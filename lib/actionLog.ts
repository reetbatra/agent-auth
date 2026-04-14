export interface ActionLogEntry {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  actorType: 'agent';
  success: boolean;
  ip: string | null;
  clientName: string;
  code: string;
}

// In-memory store — persists for the lifetime of the dev server process
const actionLog: ActionLogEntry[] = [];

export function appendActionLog(entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) {
  actionLog.unshift({
    ...entry,
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100 entries
  if (actionLog.length > 100) actionLog.pop();
}

export function getActionLog(): ActionLogEntry[] {
  return [...actionLog];
}
