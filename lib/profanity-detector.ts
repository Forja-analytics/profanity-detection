import { getBlacklist, getWhitelist } from './database';

export interface ProfanityMatch {
  word: string;
  severity: number;
  start: number;
  end: number;
}

export interface DetectionResult {
  matches: ProfanityMatch[];
}

// Leetspeak and character substitutions
const LEETSPEAK_MAP: Record<string, string> = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't'
};

// Common character substitutions to bypass filters
const SUBSTITUTION_MAP: Record<string, string> = {
  'ph': 'f', 'ck': 'k', 'x': 'ks', 'z': 's'
};

export function normalizeProfanityText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Remove accents and diacritics
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Replace leetspeak
  for (const [leet, char] of Object.entries(LEETSPEAK_MAP)) {
    const escapedLeet = leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(new RegExp(escapedLeet, 'g'), char);
  }
  
  // Remove special characters but keep spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');
  
  // Handle common substitutions
  for (const [sub, replacement] of Object.entries(SUBSTITUTION_MAP)) {
    const escapedSub = sub.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(new RegExp(escapedSub, 'g'), replacement);
  }
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

export async function detectProfanity(text: string, useLLM = false): Promise<DetectionResult> {
  const matches: ProfanityMatch[] = [];
  
  try {
    // Get current blacklist and whitelist
    const [blacklist, whitelist] = await Promise.all([
      getBlacklist(),
      getWhitelist()
    ]);

    // Create sets for faster lookup
    const whitelistSet = new Set(whitelist.map(w => w.phrase.toLowerCase()));
    
    // Normalize the input text for detection
    const normalizedText = normalizeProfanityText(text);
    const originalLower = text.toLowerCase();
    
    // Check each word against blacklist
    for (const blacklistItem of blacklist) {
      const phrase = blacklistItem.phrase.toLowerCase();
      
      // Skip if whitelisted
      if (whitelistSet.has(phrase)) {
        continue;
      }
      
      // Create regex for word boundary matching
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      const containsRegex = new RegExp(escapedPhrase, 'gi');
      
      // Check original text with word boundaries
      let match;
      while ((match = wordBoundaryRegex.exec(originalLower)) !== null) {
        matches.push({
          word: text.substring(match.index, match.index + match[0].length),
          severity: blacklistItem.severity,
          start: match.index,
          end: match.index + match[0].length
        });
      }
      
      // Reset regex and check for partial matches in normalized text
      wordBoundaryRegex.lastIndex = 0;
      while ((match = containsRegex.exec(normalizedText)) !== null) {
        const isDuplicate = matches.some(m => 
          Math.abs(m.start - match.index) < 3 && m.word.toLowerCase().includes(phrase)
        );
        
        if (!isDuplicate) {
          // Find the corresponding text in the original
          const originalMatch = text.substring(match.index, match.index + match[0].length);
          matches.push({
            word: originalMatch,
            severity: blacklistItem.severity,
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
      
      // Reset for next iteration
      containsRegex.lastIndex = 0;
    }

    // If LLM is enabled and no matches found, you could add LLM logic here
    // For now, we'll just use the rule-based detection
    if (useLLM && matches.length === 0) {
      // This is where you'd integrate with OpenAI or another LLM
      // For the demo, we'll skip this implementation
    }

    return { matches };
  } catch (error) {
    console.error('Error in profanity detection:', error);
    return { matches: [] };
  }
}

export function maskText(originalText: string, matches: ProfanityMatch[]): string {
  if (matches.length === 0) {
    return originalText;
  }

  let maskedText = originalText;
  
  // Sort matches by start position (descending) to avoid index shifting
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);
  
  for (const match of sortedMatches) {
    const word = originalText.substring(match.start, match.end);
    let masked = word;
    
    if (word.length > 2) {
      // Keep first 2 characters and mask the rest
      const keepChars = Math.min(2, Math.floor(word.length / 3));
      masked = word.substring(0, keepChars) + '*'.repeat(word.length - keepChars);
    } else if (word.length > 1) {
      // Keep first character
      masked = word[0] + '*'.repeat(word.length - 1);
    } else {
      // Single character - mask completely
      masked = '*';
    }
    
    maskedText = maskedText.substring(0, match.start) + masked + maskedText.substring(match.end);
  }
  
  return maskedText;
}