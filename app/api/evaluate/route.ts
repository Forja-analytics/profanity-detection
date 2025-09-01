import { NextRequest, NextResponse } from 'next/server';
import { detectProfanity, normalizeProfanityText, maskText } from '@/lib/profanity-detector';
import { logEvaluation } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { text, use_llm } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Detect profanity
    const detection = await detectProfanity(text, use_llm || false);

    // Create masked text
    const maskedText = maskText(text, detection.matches);

    // Determine overall severity
    const maxSeverity = detection.matches.length > 0 
      ? Math.max(...detection.matches.map(m => m.severity))
      : 0;

    const result = {
      contains_profanity: detection.matches.length > 0,
      severity: maxSeverity,
      masked_text: maskedText,
      matches: detection.matches
    };

    // Log the evaluation
    await logEvaluation({
      input_text: text,
      masked_text: maskedText,
      severity: maxSeverity,
      contains_profanity: result.contains_profanity
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error evaluating text:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';