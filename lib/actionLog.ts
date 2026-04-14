import fs from 'fs';
import path from 'path';

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

const FILE = path.join(process.cwd(), '.action-log.json');

function readFile(): ActionLogEntry[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeFile(entries: ActionLogEntry[]) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(entries, null, 2));
  } catch {
    // silently fail if can't write
  }
}

export function appendActionLog(entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) {
  const entries = readFile();
  entries.unshift({
    ...entry,
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
  });
  writeFile(entries.slice(0, 200));
}

export function getActionLog(): ActionLogEntry[] {
  return readFile();
}
