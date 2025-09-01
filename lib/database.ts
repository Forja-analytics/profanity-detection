// In-memory database for demo purposes
// In production, this would connect to Supabase or PostgreSQL

interface BlacklistWord {
  id: number;
  phrase: string;
  severity: number;
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

// In-memory storage (replace with actual database in production)
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
  { id: 16, phrase: 'viva Petro', severity: 3 },
  { id: 17, phrase: 'café con azucar', severity: 3 },
];

let whitelistData: WhitelistWord[] = [
  { id: 1, phrase: 'dickinson' },
  { id: 2, phrase: 'putah creek' },
  { id: 3, phrase: 'cockburn' },
  { id: 4, phrase: 'class assignment' },
  { id: 5, phrase: 'massachusetts' },
];

let logsData: EvaluationLog[] = [];
let nextId = Math.max(...blacklistData.map(w => w.id), ...whitelistData.map(w => w.id)) + 1;
let nextLogId = 1;

export async function getBlacklist(): Promise<BlacklistWord[]> {
  return [...blacklistData];
}

export async function getWhitelist(): Promise<WhitelistWord[]> {
  return [...whitelistData];
}

export async function addBlacklistWord(phrase: string, severity: number): Promise<BlacklistWord> {
  const newWord = {
    id: nextId++,
    phrase: phrase.toLowerCase(),
    severity
  };
  blacklistData.push(newWord);
  return newWord;
}

export async function addWhitelistWord(phrase: string): Promise<WhitelistWord> {
  const newWord = {
    id: nextId++,
    phrase: phrase.toLowerCase()
  };
  whitelistData.push(newWord);
  return newWord;
}

export async function updateBlacklistWord(
  id: number,
  updates: { phrase?: string; severity?: number }
): Promise<BlacklistWord | null> {
  const index = blacklistData.findIndex(w => w.id === id);
  if (index === -1) return null;

  if (updates.phrase) {
    blacklistData[index].phrase = updates.phrase.trim().toLowerCase();
  }
  if (updates.severity && [1, 2, 3].includes(updates.severity)) {
    blacklistData[index].severity = updates.severity;
  }

  return blacklistData[index];
}

export async function updateWhitelistWord(
  id: number,
  updates: { phrase?: string }
): Promise<WhitelistWord | null> {
  const index = whitelistData.findIndex(w => w.id === id);
  if (index === -1) return null;

  if (typeof updates.phrase === "string") {
    const p = updates.phrase.trim().toLowerCase();
    if (!p) return whitelistData[index]; // no vaciar
    // opcional: evitar duplicados
    const exists = whitelistData.some(
      w => w.id !== id && w.phrase === p
    );
    if (exists) throw new Error("Already exists in whitelist");
    whitelistData[index].phrase = p;
  }

  return whitelistData[index];
}

export async function deleteBlacklistWord(id: number): Promise<void> {
  blacklistData = blacklistData.filter(word => word.id !== id);
}

export async function deleteWhitelistWord(id: number): Promise<void> {
  whitelistData = whitelistData.filter(word => word.id !== id);
}

export async function logEvaluation(log: Omit<EvaluationLog, 'id' | 'timestamp'>): Promise<EvaluationLog> {
  const newLog = {
    id: nextLogId++,
    ...log,
    timestamp: new Date().toISOString()
  };
  logsData.unshift(newLog); // Add to beginning for chronological order
  return newLog;
}

export async function getEvaluationLogs(): Promise<EvaluationLog[]> {
  return [...logsData];
}