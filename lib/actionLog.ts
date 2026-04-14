import fs from 'fs';
import path from 'path';

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  actorType: 'human' | 'agent';
  success: boolean;
  ip: string | null;
  clientName: string | null;
  code: string;
}

const FILE = path.join(process.cwd(), '.action-log.json');

function readFile(): ActionLogEntry[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeFile(entries: ActionLogEntry[]) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error('[actionLog] write failed:', err);
  }
}

export function appendActionLog(entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) {
  const entries = readFile();
  entries.unshift({
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
  });
  writeFile(entries.slice(0, 200));
}

export function getActionLog(): ActionLogEntry[] {
  return readFile();
}
