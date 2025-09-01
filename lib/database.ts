// Persistencia con Prisma (PostgreSQL) – reemplaza el contenido de lib/database.ts por este
// Asegúrate de tener DATABASE_URL en .env y migraciones aplicadas con Prisma.

import { prisma } from './prisma';

/* ---------------------- Normalización y utilidades ---------------------- */

function normPhrase(s: string) {
  return String(s || '').trim().toLowerCase();
}

function isValidSeverity(n: unknown): n is number {
  return typeof n === 'number' && [1, 2, 3].includes(n);
}

/* ---------------------- BLACKLIST ---------------------- */

export async function getBlacklist() {
  return prisma.blacklistWord.findMany({ orderBy: { id: 'asc' } });
}

export async function addBlacklistWord(phrase: string, severity: number) {
  const p = normPhrase(phrase);
  if (!p) throw new Error('Phrase required');
  if (!isValidSeverity(severity)) severity = 2;

  try {
    return await prisma.blacklistWord.create({
      data: { phrase: p, severity },
    });
  } catch (err: any) {
    // Código de error de Prisma para violación de unique constraint
    if (err?.code === 'P2002') {
      throw new Error('Already exists in blacklist');
    }
    throw err;
  }
}

export async function updateBlacklistWord(
  id: number,
  updates: { phrase?: string; severity?: number }
) {
  const data: Record<string, any> = {};

  if (typeof updates.phrase === 'string') {
    const p = normPhrase(updates.phrase);
    if (p) data.phrase = p;
  }
  if (isValidSeverity(updates.severity)) {
    data.severity = updates.severity;
  }

  if (Object.keys(data).length === 0) {
    // No hay cambios; devuelve el registro actual
    return prisma.blacklistWord.findUnique({ where: { id } });
  }

  try {
    return await prisma.blacklistWord.update({
      where: { id },
      data,
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      throw new Error('Already exists in blacklist');
    }
    throw err;
  }
}

export async function deleteBlacklistWord(id: number) {
  await prisma.blacklistWord.delete({ where: { id } });
}

/* ---------------------- WHITELIST ---------------------- */

export async function getWhitelist() {
  return prisma.whitelistWord.findMany({ orderBy: { id: 'asc' } });
}

export async function addWhitelistWord(phrase: string) {
  const p = normPhrase(phrase);
  if (!p) throw new Error('Phrase required');

  try {
    return await prisma.whitelistWord.create({
      data: { phrase: p },
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      throw new Error('Already exists in whitelist');
    }
    throw err;
  }
}

export async function updateWhitelistWord(
  id: number,
  updates: { phrase?: string }
) {
  const data: Record<string, any> = {};

  if (typeof updates.phrase === 'string') {
    const p = normPhrase(updates.phrase);
    if (p) data.phrase = p;
  }

  if (Object.keys(data).length === 0) {
    return prisma.whitelistWord.findUnique({ where: { id } });
  }

  try {
    return await prisma.whitelistWord.update({
      where: { id },
      data,
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      throw new Error('Already exists in whitelist');
    }
    throw err;
  }
}

export async function deleteWhitelistWord(id: number) {
  await prisma.whitelistWord.delete({ where: { id } });
}

/* ---------------------- LOGS (persistentes en Postgres) ---------------------- */

export async function logEvaluation(log: {
  input_text: string;
  masked_text: string;
  severity: number;
  contains_profanity: boolean;
}) {
  return prisma.evaluationLog.create({
    data: {
      input_text: log.input_text,
      masked_text: log.masked_text,
      severity: log.severity,
      contains_profanity: log.contains_profanity,
      // timestamp se autogenera con default(now()) en el schema
    },
  });
}

export async function getEvaluationLogs() {
  return prisma.evaluationLog.findMany({
    orderBy: { timestamp: 'desc' },
  });
}
