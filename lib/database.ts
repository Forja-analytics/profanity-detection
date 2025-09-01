// In-memory database for demo purposes
// In production, this would connect to Supabase or PostgreSQL

import { getStore } from '@netlify/blobs';

/* ---------------------- Types ---------------------- */

interface BlacklistWord {
  id: number;
  phrase: string;
  severity: number; // 1-3
}

interface WhitelistWord {
  id: number;
  phrase: string;
}

interface EvaluationLog {
  id: number;
  input_text: string;
  masked_text: string;
  timestamp: string;
  severity: number;
  contains_profanity: boolean;
}

/* ---------------------- Seeds (memory) ---------------------- */

let blacklistData: BlacklistWord[] = [
  { id: 1, phrase: 'damn', severity: 1 },
  { id: 2, phrase: 'hell', severity: 1 },
  { id: 3, phrase: 'crap', severity: 1 },
  { id: 4, phrase: 'bastard', severity: 2 },
  { id: 5, phrase: 'bitch', severity: 2 },
  { id: 6, phrase: 'asshole', severity: 2 },
  { id: 7, phrase: 'fuck', severity: 3 },
  { id: 8, phrase: 'shit', severity: 3 },
  { id: 9, phrase: 'motherfucker', severity: 3 },
  { id: 10, phrase: 'ben dover', severity: 2 },
  { id: 11, phrase: 'mike hunt', severity: 2 },
  { id: 12, phrase: 'tomas turbado', severity: 2 },
  { id: 13, phrase: 'hp', severity: 2 },
  { id: 14, phrase: 'hijueputa', severity: 3 },
  { id: 15, phrase: 'mamar gallo', severity: 2 },
  { id: 16, phrase: 'viva petro', severity: 3 },        // normalizado a minúsculas
  { id: 17, phrase: 'café con azucar', severity: 3 },   // se normaliza al detectar
];

let whitelistData: WhitelistWord[] = [
  { id: 1, phrase: 'dickinson' },
  { id: 2, phrase: 'putah creek' },
  { id: 3, phrase: 'cockburn' },
  { id: 4, phrase: 'class assignment' },
  { id: 5, phrase: 'massachusetts' },
];

/* ---------------------- Helpers comunes ---------------------- */

function computeNextId(): number {
  const ids = [...blacklistData.map(w => w.id), ...whitelistData.map(w => w.id)];
  const max = ids.length ? Math.max(...ids) : 0;
  return max + 1;
}
let nextId = computeNextId();

// Fallback local para logs (en desarrollo)
let logsData: EvaluationLog[] = [];
let nextLogId = 1;

function normPhrase(s: string) {
  return String(s || '').trim().toLowerCase();
}

function isNetlifyRuntime() {
  // Netlify Functions setea NETLIFY=true
  return !!process.env.NETLIFY;
}

function existsInBlacklist(p: string) {
  const v = normPhrase(p);
  return blacklistData.some(w => w.phrase === v);
}
function existsInWhitelist(p: string) {
  const v = normPhrase(p);
  return whitelistData.some(w => w.phrase === v);
}

/* ---------------------- Blacklist / Whitelist (memoria) ---------------------- */

export async function getBlacklist(): Promise<BlacklistWord[]> {
  return [...blacklistData];
}

export async function getWhitelist(): Promise<WhitelistWord[]> {
  return [...whitelistData];
}

export async function addBlacklistWord(phrase: string, severity: number): Promise<BlacklistWord> {
  const p = normPhrase(phrase);
  if (!p) throw new Error('Phrase required');
  if (!Number.isFinite(severity) || severity < 1 || severity > 3) severity = 2;
  if (existsInBlacklist(p)) throw new Error('Already exists in blacklist');

  const newWord: BlacklistWord = { id: nextId++, phrase: p, severity };
  blacklistData.push(newWord);
  return newWord;
}

export async function addWhitelistWord(phrase: string): Promise<WhitelistWord> {
  const p = normPhrase(phrase);
  if (!p) throw new Error('Phrase required');
  if (existsInWhitelist(p)) throw new Error('Already exists in whitelist');

  const newWord: WhitelistWord = { id: nextId++, phrase: p };
  whitelistData.push(newWord);
  return newWord;
}

export async function updateBlacklistWord(
  id: number,
  updates: { phrase?: string; severity?: number }
): Promise<BlacklistWord | null> {
  const idx = blacklistData.findIndex(w => w.id === id);
  if (idx === -1) return null;

  if (typeof updates.phrase === 'string') {
    const p = normPhrase(updates.phrase);
    if (p) {
      // opcional: evitar duplicados
      const dup = blacklistData.some(w => w.id !== id && w.phrase === p);
      if (dup) throw new Error('Already exists in blacklist');
      blacklistData[idx].phrase = p;
    }
  }
  if (typeof updates.severity === 'number' && [1, 2, 3].includes(updates.severity)) {
    blacklistData[idx].severity = updates.severity;
  }

  return blacklistData[idx];
}

export async function updateWhitelistWord(
  id: number,
  updates: { phrase?: string }
): Promise<WhitelistWord | null> {
  const idx = whitelistData.findIndex(w => w.id === id);
  if (idx === -1) return null;

  if (typeof updates.phrase === 'string') {
    const p = normPhrase(updates.phrase);
    if (!p) return whitelistData[idx]; // no vaciar
    const dup = whitelistData.some(w => w.id !== id && w.phrase === p);
    if (dup) throw new Error('Already exists in whitelist');
    whitelistData[idx].phrase = p;
  }

  return whitelistData[idx];
}

export async function deleteBlacklistWord(id: number): Promise<void> {
  blacklistData = blacklistData.filter(word => word.id !== id);
}

export async function deleteWhitelistWord(id: number): Promise<void> {
  whitelistData = whitelistData.filter(word => word.id !== id);
}

/* ---------------------- Logs (persistentes con Netlify Blobs) ---------------------- */

export async function logEvaluation(
  log: Omit<EvaluationLog, 'id' | 'timestamp'>
): Promise<EvaluationLog> {
  const entry: EvaluationLog = {
    id: nextLogId++, // en Netlify Blobs no se usa estrictamente, pero se mantiene por compat
    ...log,
    timestamp: new Date().toISOString(),
  };

  if (isNetlifyRuntime()) {
    const store = getStore('eval-logs'); // nombre del store
    const key = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, entry);
    return entry;
  } else {
    // Local (dev): memoria
    logsData.unshift(entry);
    return entry;
  }
}

export async function getEvaluationLogs(): Promise<EvaluationLog[]> {
  if (isNetlifyRuntime()) {
    const store = getStore('eval-logs');
    const list = await store.list({ prefix: 'log-' });

    const keys = (list.blobs ?? [])
      .map(b => b.key)
      // Orden aproximado por nombre (log-<timestamp>-<rand>)
      .sort()
      .reverse()
      .slice(0, 200);

    const out: EvaluationLog[] = [];
    for (const k of keys) {
      const item = await store.get(k, { type: 'json' });
      if (item) out.push(item as EvaluationLog);
    }

    // Orden definitivo por timestamp desc
    out.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return out;
  } else {
    // Local (dev)
    return [...logsData];
  }
}
